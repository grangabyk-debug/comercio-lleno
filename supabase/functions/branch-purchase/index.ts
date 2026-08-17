import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL=Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PUBLISHABLE_KEY=Deno.env.get('SUPABASE_ANON_KEY')||Deno.env.get('SUPABASE_PUBLISHABLE_KEY')||'';
const MP_ACCESS_TOKEN=Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')||'';
const MP_API='https://api.mercadopago.com';
const PRICE=4900;
const MAX_BRANCHES=5;

function originAllowed(origin:string){return origin==='https://comerciolleno.com'||origin==='https://www.comerciolleno.com'||/^https:\/\/[-a-z0-9]+\.vercel\.app$/i.test(origin)}
function allowedOrigin(req:Request){const origin=req.headers.get('origin')||'';return originAllowed(origin)?origin:'https://www.comerciolleno.com'}
function cors(req:Request){return{'Access-Control-Allow-Origin':allowedOrigin(req),'Vary':'Origin','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'}}
function json(req:Request,body:unknown,status=200){return Response.json(body,{status,headers:cors(req)})}
function adminHeaders(extra:Record<string,string>={}){return{apikey:SERVICE_ROLE,Authorization:`Bearer ${SERVICE_ROLE}`,'Content-Type':'application/json',...extra}}
async function adminRest(path:string,init:RequestInit={}){return fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...init,headers:adminHeaders(init.headers as Record<string,string>||{})})}
async function mp(path:string,init:RequestInit={}){const response=await fetch(`${MP_API}${path}`,{...init,headers:{Authorization:`Bearer ${MP_ACCESS_TOKEN}`,'Content-Type':'application/json',...(init.headers||{})},cache:'no-store'});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.message||data?.error||`Mercado Pago respondió ${response.status}`);return data}
async function getPurchase(id:string){const r=await adminRest(`branch_purchases?id=eq.${encodeURIComponent(id)}&select=*&limit=1`),rows=await r.json().catch(()=>[]);return Array.isArray(rows)?rows[0]:null}
async function activeBranchCount(companyId:string){const r=await adminRest(`branches?company_id=eq.${encodeURIComponent(companyId)}&active=eq.true&select=id`),rows=await r.json().catch(()=>[]);return Array.isArray(rows)?rows.length:0}
async function finalizePurchase(purchase:any,paymentId:string){
  if(purchase.created_branch_id)return purchase.created_branch_id;
  const count=await activeBranchCount(String(purchase.company_id));
  if(count>=MAX_BRANCHES)throw new Error('El comercio ya alcanzó el máximo de sucursales.');
  const create=await adminRest('branches',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({company_id:purchase.company_id,name:purchase.branch_name,address:purchase.branch_address||null,is_primary:false,active:true})});
  const created=await create.json().catch(()=>[]);if(!create.ok||!Array.isArray(created)||!created[0]?.id)throw new Error('No se pudo crear la sucursal después del pago.');
  const branchId=String(created[0].id);
  await adminRest(`branch_purchases?id=eq.${encodeURIComponent(purchase.id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status:'approved',mp_payment_id:paymentId,created_branch_id:branchId,updated_at:new Date().toISOString()})});
  return branchId;
}
async function validateSession(req:Request){
  const authHeader=req.headers.get('authorization')||'',token=authHeader.replace(/^Bearer\s+/i,'');if(!token)return null;
  const userResponse=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{Authorization:`Bearer ${token}`,apikey:PUBLISHABLE_KEY||SERVICE_ROLE},cache:'no-store'}),user=await userResponse.json().catch(()=>({}));
  if(!userResponse.ok||!user?.id)return null;
  const p=await adminRest(`profiles?id=eq.${encodeURIComponent(String(user.id))}&select=company_id,role,active&limit=1`),rows=await p.json().catch(()=>[]),profile=Array.isArray(rows)?rows[0]:null;
  if(!profile?.company_id||profile.active===false||!['owner','supervisor'].includes(String(profile.role)))return null;
  return{user,profile};
}

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)});
  if(req.method!=='POST')return json(req,{ok:false,error:'Método no permitido'},405);
  if(!MP_ACCESS_TOKEN)return json(req,{ok:false,error:'Mercado Pago todavía no está configurado.'},503);
  const url=new URL(req.url),action=url.searchParams.get('action')||'';
  if(action==='webhook'){
    try{
      const body=await req.json().catch(()=>({}));
      const paymentId=String(body?.data?.id||url.searchParams.get('data.id')||url.searchParams.get('id')||'');
      if(!paymentId)return json(req,{ok:true});
      const payment=await mp(`/v1/payments/${encodeURIComponent(paymentId)}`);
      if(String(payment?.status)!=='approved')return json(req,{ok:true,status:String(payment?.status||'')});
      const purchaseId=String(payment?.external_reference||'');if(!purchaseId)return json(req,{ok:true});
      const purchase=await getPurchase(purchaseId);if(!purchase)return json(req,{ok:true});
      await finalizePurchase(purchase,paymentId);
      return json(req,{ok:true});
    }catch{return json(req,{ok:true});}
  }

  const session=await validateSession(req);if(!session)return json(req,{ok:false,error:'Sesión inválida o sin permisos.'},401);
  let body:any={};try{body=await req.json()}catch{}
  const companyId=String(session.profile.company_id);
  try{
    if(action==='status'){
      const purchase=await getPurchase(String(body?.purchase_id||''));
      if(!purchase||String(purchase.company_id)!==companyId)return json(req,{ok:false,error:'Compra no encontrada.'},404);
      if(purchase.created_branch_id)return json(req,{ok:true,status:'approved',branch_id:purchase.created_branch_id});
      if(purchase.mp_payment_id){
        const payment=await mp(`/v1/payments/${encodeURIComponent(String(purchase.mp_payment_id))}`);
        if(String(payment?.status)==='approved'){const branchId=await finalizePurchase(purchase,String(payment.id));return json(req,{ok:true,status:'approved',branch_id:branchId});}
      }
      const search=await mp(`/v1/payments/search?external_reference=${encodeURIComponent(String(purchase.id))}&sort=date_created&criteria=desc`);
      const approved=Array.isArray(search?.results)?search.results.find((x:any)=>String(x?.status)==='approved'):null;
      if(approved?.id){const branchId=await finalizePurchase(purchase,String(approved.id));return json(req,{ok:true,status:'approved',branch_id:branchId});}
      return json(req,{ok:true,status:String(purchase.status||'pending')});
    }

    if(action!=='checkout')return json(req,{ok:false,error:'Acción inválida.'},400);
    const branchName=String(body?.name||'').trim(),branchAddress=String(body?.address||'').trim();
    if(!branchName)return json(req,{ok:false,error:'Ingresá el nombre de la sucursal.'},400);
    const count=await activeBranchCount(companyId);if(count>=MAX_BRANCHES)return json(req,{ok:false,error:'Llegaste al máximo de 5 sucursales.'},409);
    if(count<1)return json(req,{ok:false,error:'Primero debe existir la sucursal principal incluida.'},409);
    const createPurchase=await adminRest('branch_purchases',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({company_id:companyId,user_id:session.user.id,branch_name:branchName,branch_address:branchAddress||null,amount:PRICE,currency:'ARS',status:'pending'})});
    const purchases=await createPurchase.json().catch(()=>[]);if(!createPurchase.ok||!Array.isArray(purchases)||!purchases[0]?.id)throw new Error('No se pudo iniciar la compra.');
    const purchase=purchases[0],origin=allowedOrigin(req);
    const preference=await mp('/checkout/preferences',{method:'POST',body:JSON.stringify({items:[{title:'Sucursal adicional · Comercio Lleno',quantity:1,currency_id:'ARS',unit_price:PRICE}],payer:{email:String(session.user.email||'')},external_reference:String(purchase.id),notification_url:`${SUPABASE_URL}/functions/v1/branch-purchase?action=webhook`,back_urls:{success:`${origin}/redesign?branch_purchase=success`,pending:`${origin}/redesign?branch_purchase=pending`,failure:`${origin}/redesign?branch_purchase=failure`},auto_return:'approved'})});
    if(!preference?.id||!preference?.init_point)throw new Error('Mercado Pago no devolvió un checkout válido.');
    await adminRest(`branch_purchases?id=eq.${encodeURIComponent(String(purchase.id))}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({mp_preference_id:String(preference.id),updated_at:new Date().toISOString()})});
    return json(req,{ok:true,purchase_id:String(purchase.id),init_point:String(preference.init_point),price:PRICE});
  }catch(error){return json(req,{ok:false,error:error instanceof Error?error.message:String(error)},502)}
});
