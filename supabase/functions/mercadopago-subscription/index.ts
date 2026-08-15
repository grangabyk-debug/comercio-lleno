import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL=Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PUBLISHABLE_KEY=Deno.env.get('SUPABASE_ANON_KEY')||Deno.env.get('SUPABASE_PUBLISHABLE_KEY')||'';
const MP_ACCESS_TOKEN=Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')||'';
const MP_API='https://api.mercadopago.com';
const DEFAULT_PROMO_PRICE=14900;

function originAllowed(origin:string){return origin==='https://comerciolleno.com'||origin==='https://www.comerciolleno.com'||/^https:\/\/[-a-z0-9]+\.vercel\.app$/i.test(origin)}
function allowedOrigin(req:Request){const origin=req.headers.get('origin')||'';return originAllowed(origin)?origin:'https://www.comerciolleno.com'}
function cors(req:Request){return{'Access-Control-Allow-Origin':allowedOrigin(req),'Vary':'Origin','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'}}
function json(req:Request,body:unknown,status=200){return Response.json(body,{status,headers:cors(req)})}
function adminHeaders(extra:Record<string,string>={}){return{apikey:SERVICE_ROLE,Authorization:`Bearer ${SERVICE_ROLE}`,'Content-Type':'application/json',...extra}}
async function adminRest(path:string,init:RequestInit={}){return fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...init,headers:adminHeaders(init.headers as Record<string,string>||{})})}
async function mp(path:string,init:RequestInit={}){const response=await fetch(`${MP_API}${path}`,{...init,headers:{Authorization:`Bearer ${MP_ACCESS_TOKEN}`,'Content-Type':'application/json',...(init.headers||{})},cache:'no-store'});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.message||data?.error||`Mercado Pago respondió ${response.status}`);return data}
function trialActive(trialEndsAt:string|null|undefined){return Boolean(trialEndsAt&&new Date(trialEndsAt).getTime()>Date.now())}
function localStatus(providerStatus:string,currentStatus:string,trialEndsAt:string|null|undefined,lastPaymentAt:string|null|undefined){
  if(providerStatus==='cancelled'||providerStatus==='canceled')return'canceled';
  if(providerStatus==='paused')return'past_due';
  if(trialActive(trialEndsAt))return'trialing';
  if(currentStatus==='active'||lastPaymentAt)return'active';
  if(providerStatus==='authorized'||providerStatus==='pending')return'expired';
  return currentStatus||'expired';
}
async function saveRemoteState(companyId:string,subscription:any,existing:any){
  const providerStatus=String(existing?.status||'').toLowerCase(),authorized=providerStatus==='authorized';
  const status=localStatus(providerStatus,String(subscription.status||'trialing'),subscription.trial_ends_at,subscription.last_payment_at);
  const patch:Record<string,unknown>={billing_provider:'mercadopago',provider_status:providerStatus||null,provider_checkout_url:existing?.init_point||subscription.provider_checkout_url||null,provider_last_synced_at:new Date().toISOString(),status,updated_at:new Date().toISOString()};
  if(authorized&&!subscription.payment_method_added_at)patch.payment_method_added_at=new Date().toISOString();
  const update=await adminRest(`company_subscriptions?company_id=eq.${encodeURIComponent(companyId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(patch)});
  if(!update.ok)throw new Error('No se pudo actualizar la suscripción local.');
  return{providerStatus,authorized,status,patch};
}

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)});
  if(req.method!=='POST')return json(req,{ok:false,error:'Método no permitido'},405);
  const origin=req.headers.get('origin')||'';if(origin&&!originAllowed(origin))return json(req,{ok:false,error:'Origen no permitido'},403);
  if(!MP_ACCESS_TOKEN)return json(req,{ok:false,configured:false,error:'Mercado Pago todavía no está configurado en este entorno.'},503);
  const authHeader=req.headers.get('authorization')||'',token=authHeader.replace(/^Bearer\s+/i,'');if(!token)return json(req,{ok:false,error:'Sesión inválida.'},401);
  const userResponse=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{Authorization:`Bearer ${token}`,apikey:PUBLISHABLE_KEY||SERVICE_ROLE},cache:'no-store'}),user=await userResponse.json().catch(()=>({}));
  if(!userResponse.ok||!user?.id||!user?.email)return json(req,{ok:false,error:'No se pudo validar la sesión.'},401);
  const profileResponse=await adminRest(`profiles?id=eq.${encodeURIComponent(String(user.id))}&select=company_id,role,active&limit=1`),profiles=await profileResponse.json().catch(()=>[]),profile=Array.isArray(profiles)?profiles[0]:null;
  if(!profile?.company_id||profile.active===false)return json(req,{ok:false,error:'La cuenta no tiene un comercio activo asociado.'},403);
  if(profile.role!=='owner')return json(req,{ok:false,error:'Sólo el propietario puede administrar la suscripción.'},403);
  const companyId=String(profile.company_id),subResponse=await adminRest(`company_subscriptions?company_id=eq.${encodeURIComponent(companyId)}&select=*&limit=1`),subs=await subResponse.json().catch(()=>[]),subscription=Array.isArray(subs)?subs[0]:null;
  if(!subscription)return json(req,{ok:false,error:'No se encontró la suscripción del comercio.'},404);
  let body:any={};try{body=await req.json()}catch{}
  const action=String(body?.action||'checkout');

  try{
    if(subscription.provider_subscription_id){
      const existing=await mp(`/preapproval/${encodeURIComponent(subscription.provider_subscription_id)}`);
      const {providerStatus,authorized,status}=await saveRemoteState(companyId,subscription,existing);
      const paymentMethodAdded=authorized||Boolean(subscription.payment_method_added_at);
      if(action==='sync'||authorized)return json(req,{ok:true,status:providerStatus,active:status==='active',payment_method_added:paymentMethodAdded,local_status:status,init_point:existing?.init_point||subscription.provider_checkout_url||null});
      if(providerStatus==='pending'&&existing?.init_point)return json(req,{ok:true,status:providerStatus,active:false,payment_method_added:false,local_status:status,init_point:String(existing.init_point)});
      if(!['cancelled','canceled','paused'].includes(providerStatus))return json(req,{ok:true,status:providerStatus,active:status==='active',payment_method_added:paymentMethodAdded,local_status:status,init_point:existing?.init_point||null});
    }else if(action==='sync'){
      return json(req,{ok:true,status:subscription.provider_status||null,active:subscription.status==='active',payment_method_added:Boolean(subscription.payment_method_added_at),local_status:subscription.status,init_point:null});
    }

    const trialEnd=subscription.trial_ends_at?new Date(subscription.trial_ends_at):new Date(0),remainingMs=Math.max(0,trialEnd.getTime()-Date.now()),remainingDays=Math.max(0,Math.ceil(remainingMs/86_400_000)),originUrl=allowedOrigin(req);
    const promoPrice=Number(subscription.promo_price_amount||DEFAULT_PROMO_PRICE),currency=subscription.currency||'ARS';
    const autoRecurring:Record<string,unknown>={frequency:1,frequency_type:'months',transaction_amount:promoPrice,currency_id:currency};
    if(remainingDays>0)autoRecurring.free_trial={frequency:remainingDays,frequency_type:'days'};
    const created=await mp('/preapproval',{method:'POST',body:JSON.stringify({reason:'Comercio Lleno',external_reference:companyId,payer_email:String(user.email),auto_recurring:autoRecurring,back_url:`${originUrl}/redesign?billing=return`,status:'pending'})});
    if(!created?.id||!created?.init_point)throw new Error('Mercado Pago no devolvió un checkout válido.');
    const localStatus=remainingDays>0?'trialing':subscription.status==='active'?'active':'expired';
    const update=await adminRest(`company_subscriptions?company_id=eq.${encodeURIComponent(companyId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({billing_provider:'mercadopago',provider_subscription_id:String(created.id),provider_status:String(created.status||'pending'),provider_checkout_url:String(created.init_point),provider_last_synced_at:new Date().toISOString(),price_amount:promoPrice,status:localStatus,updated_at:new Date().toISOString()})});if(!update.ok)throw new Error('No se pudo guardar el checkout de Mercado Pago.');
    return json(req,{ok:true,status:String(created.status||'pending'),active:false,payment_method_added:false,local_status:localStatus,init_point:String(created.init_point),remaining_trial_days:remainingDays,promo_price:promoPrice,promo_cycles:Number(subscription.promo_cycles||3),regular_price:Number(subscription.regular_price_amount||29800)});
  }catch(error){return json(req,{ok:false,error:error instanceof Error?error.message:String(error)},502)}
});