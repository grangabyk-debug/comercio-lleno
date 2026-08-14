import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || '';
const MP_WEBHOOK_SECRET = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET') || '';
const MP_API = 'https://api.mercadopago.com';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function adminHeaders(extra: Record<string,string> = {}) { return { apikey:SERVICE_ROLE, Authorization:`Bearer ${SERVICE_ROLE}`, 'Content-Type':'application/json', ...extra }; }
async function adminRest(path:string, init:RequestInit={}) { return fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers:adminHeaders(init.headers as Record<string,string> || {}) }); }
async function mp(path:string) {
  const response=await fetch(`${MP_API}${path}`,{headers:{Authorization:`Bearer ${MP_ACCESS_TOKEN}`},cache:'no-store'});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data?.message||data?.error||`Mercado Pago respondió ${response.status}`);
  return data;
}
function fromHex(value:string){if(!/^[0-9a-f]{64}$/i.test(value))return null;const out=new Uint8Array(value.length/2);for(let i=0;i<out.length;i++)out[i]=Number.parseInt(value.slice(i*2,i*2+2),16);return out}
async function validSignature(req:Request,dataId:string){
  if(!MP_WEBHOOK_SECRET)return false;
  const signature=req.headers.get('x-signature')||'',requestId=req.headers.get('x-request-id')||'';
  const parts=Object.fromEntries(signature.split(',').map(p=>p.trim().split('=').map(x=>x.trim())).filter(x=>x.length===2));
  const ts=String(parts.ts||''),v1=String(parts.v1||'').toLowerCase(),received=fromHex(v1);
  if(!ts||!received||!requestId||!dataId)return false;
  const manifest=`id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(MP_WEBHOOK_SECRET),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  return crypto.subtle.verify('HMAC',key,received,new TextEncoder().encode(manifest));
}
async function alreadyProcessed(requestId:string){if(!requestId)return false;const response=await adminRest(`mercadopago_webhook_events?request_id=eq.${encodeURIComponent(requestId)}&select=request_id&limit=1`);const rows=await response.json().catch(()=>[]);return response.ok&&Array.isArray(rows)&&rows.length>0}
async function markProcessed(requestId:string,dataId:string,eventType:string){
  if(!requestId)return;
  await adminRest('mercadopago_webhook_events?on_conflict=request_id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({request_id:requestId,data_id:dataId,event_type:eventType,processed_at:new Date().toISOString()})});
  const cutoff=new Date(Date.now()-180*86400000).toISOString();
  await adminRest(`mercadopago_webhook_events?processed_at=lt.${encodeURIComponent(cutoff)}`,{method:'DELETE'}).catch(()=>{});
}
function trialActive(trialEndsAt:string|null|undefined){return Boolean(trialEndsAt&&new Date(trialEndsAt).getTime()>Date.now())}
function localStatusFromRemote(providerStatus:string,currentStatus:string,trialEndsAt:string|null|undefined,lastPaymentAt:string|null|undefined,paymentStatus=''){
  if(providerStatus==='cancelled'||providerStatus==='canceled')return'canceled';
  if(providerStatus==='paused')return'past_due';
  if(trialActive(trialEndsAt))return'trialing';
  if(paymentStatus==='approved'||paymentStatus==='authorized')return'active';
  if(['rejected','cancelled','canceled','refunded'].includes(paymentStatus))return'past_due';
  if(currentStatus==='active'||lastPaymentAt)return'active';
  if(providerStatus==='authorized'||providerStatus==='pending')return'expired';
  return currentStatus||'expired';
}
async function currentSubscription(companyId:string){const response=await adminRest(`company_subscriptions?company_id=eq.${encodeURIComponent(companyId)}&select=status,trial_ends_at,payment_method_added_at,last_payment_at&limit=1`);const rows=await response.json().catch(()=>[]);return response.ok&&Array.isArray(rows)?rows[0]||null:null}
async function syncPreapproval(remote:any,dataId:string,paymentStatus=''){
  const companyId=String(remote?.external_reference||''),providerStatus=String(remote?.status||'').toLowerCase();
  if(!UUID_RE.test(companyId))return{ignored:true};
  const current=await currentSubscription(companyId);if(!current)return{ignored:true};
  const status=localStatusFromRemote(providerStatus,String(current.status||'trialing'),current.trial_ends_at,current.last_payment_at,paymentStatus);
  const patch:Record<string,unknown>={billing_provider:'mercadopago',provider_subscription_id:String(remote?.id||dataId),provider_status:providerStatus||null,provider_checkout_url:remote?.init_point||null,provider_last_synced_at:new Date().toISOString(),status,updated_at:new Date().toISOString()};
  if(providerStatus==='authorized'&&!current.payment_method_added_at)patch.payment_method_added_at=new Date().toISOString();
  if(paymentStatus==='approved'||paymentStatus==='authorized')patch.last_payment_at=new Date().toISOString();
  const response=await adminRest(`company_subscriptions?company_id=eq.${encodeURIComponent(companyId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(patch)});
  if(!response.ok)throw new Error('No se pudo actualizar la suscripción local');
  return{ignored:false,status};
}

Deno.serve(async(req:Request)=>{
  if(req.method!=='POST')return Response.json({ok:false,error:'Método no permitido'},{status:405,headers:{Allow:'POST'}});
  if(!MP_ACCESS_TOKEN||!MP_WEBHOOK_SECRET)return Response.json({ok:false,error:'Mercado Pago webhook no configurado'},{status:503});
  const url=new URL(req.url);let body:any={};try{body=await req.json()}catch{}
  const dataId=String(url.searchParams.get('data.id')||url.searchParams.get('data_id')||body?.data?.id||'');
  const type=String(body?.type||url.searchParams.get('type')||'');
  const requestId=req.headers.get('x-request-id')||'';
  if(!(await validSignature(req,dataId)))return Response.json({ok:false,error:'Firma inválida'},{status:401});
  if(await alreadyProcessed(requestId))return Response.json({ok:true,duplicate:true},{status:200});
  if(!dataId)return Response.json({ok:true,ignored:true},{status:200});
  try{
    if(type==='subscription_preapproval'||/preapproval/i.test(String(body?.action||''))){const remote=await mp(`/preapproval/${encodeURIComponent(dataId)}`);const result=await syncPreapproval(remote,dataId,'');await markProcessed(requestId,dataId,type);return Response.json({ok:true,...result},{status:200})}
    if(type==='subscription_authorized_payment'){
      const payment=await mp(`/authorized_payments/${encodeURIComponent(dataId)}`),subscriptionId=String(payment?.preapproval_id||payment?.subscription_id||'');
      if(!subscriptionId){await markProcessed(requestId,dataId,type);return Response.json({ok:true,ignored:true},{status:200})}
      const remote=await mp(`/preapproval/${encodeURIComponent(subscriptionId)}`),paymentStatus=String(payment?.status||'').toLowerCase();
      const result=await syncPreapproval(remote,subscriptionId,paymentStatus);await markProcessed(requestId,dataId,type);return Response.json({ok:true,...result},{status:200});
    }
    await markProcessed(requestId,dataId,type);return Response.json({ok:true,ignored:true},{status:200});
  }catch(error){console.error('mercadopago-webhook',error instanceof Error?error.message:String(error));return Response.json({ok:false,error:'No se pudo sincronizar la notificación'},{status:500})}
});