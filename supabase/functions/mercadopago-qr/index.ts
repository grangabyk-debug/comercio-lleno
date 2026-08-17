import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL=Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PUBLISHABLE_KEY=Deno.env.get('SUPABASE_ANON_KEY')||Deno.env.get('SUPABASE_PUBLISHABLE_KEY')||SERVICE_ROLE;
const CLIENT_ID=Deno.env.get('MERCADOPAGO_POINT_CLIENT_ID')||'';
const CLIENT_SECRET=Deno.env.get('MERCADOPAGO_POINT_CLIENT_SECRET')||'';
const OWN_ACCESS_TOKEN=Deno.env.get('MERCADOPAGO_POINT_ACCESS_TOKEN')||Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')||'';
const MP='https://api.mercadopago.com';
const FINAL=new Set(['processed','canceled','expired','refunded','failed','action_required']);

function cors(req:Request){const o=req.headers.get('origin')||'';const ok=o==='https://comerciolleno.com'||o==='https://www.comerciolleno.com'||/^https:\/\/[-a-z0-9]+\.vercel\.app$/i.test(o);return{'Access-Control-Allow-Origin':ok?o:'https://comerciolleno.com','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin'}}
function json(req:Request,v:unknown,s=200){return Response.json(v,{status:s,headers:cors(req)})}
function b64d(v:string){const n=v.replace(/-/g,'+').replace(/_/g,'/'),p=n+'='.repeat((4-n.length%4)%4),r=atob(p);return Uint8Array.from(r,c=>c.charCodeAt(0))}
async function sha(v:string){return new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))}
async function key(){return crypto.subtle.importKey('raw',await sha(Deno.env.get('MERCADOPAGO_POINT_ENCRYPTION_KEY')||SERVICE_ROLE),{name:'AES-GCM'},false,['decrypt'])}
async function decrypt(v:string){if(!v)return'';const[a,b,c]=v.split('.');if(a!=='v1'||!b||!c)throw new Error('TOKEN_CIPHER_INVALID');const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(b)},await key(),b64d(c));return new TextDecoder().decode(plain)}
async function admin(path:string,init:RequestInit={}){return fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...init,headers:{apikey:SERVICE_ROLE,Authorization:`Bearer ${SERVICE_ROLE}`,'Content-Type':'application/json',...(init.headers||{})},cache:'no-store'})}
async function auth(req:Request){const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');if(!token)throw new Error('UNAUTHORIZED');const ur=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{Authorization:`Bearer ${token}`,apikey:PUBLISHABLE_KEY}}),u=await ur.json().catch(()=>({}));if(!ur.ok||!u?.id)throw new Error('UNAUTHORIZED');const pr=await admin(`profiles?id=eq.${encodeURIComponent(u.id)}&select=company_id,role,active,permissions&limit=1`),rows=await pr.json().catch(()=>[]),p=rows?.[0];if(!p?.company_id||p.active===false)throw new Error('UNAUTHORIZED');return{companyId:String(p.company_id),role:String(p.role||''),permissions:p.permissions||{}}}
function canSell(a:any){return a.role==='owner'||['cashier','seller','manager','supervisor'].includes(a.role)||a.permissions?.can_sell===true}
async function connection(companyId:string){const r=await admin(`mercadopago_point_connections?company_id=eq.${encodeURIComponent(companyId)}&select=*&limit=1`),x=await r.json().catch(()=>[]);if(!r.ok)throw new Error('No se pudo leer Mercado Pago.');return x?.[0]||null}
async function token(c:any){if(String(c?.connection_mode||'oauth')==='own'){if(CLIENT_ID&&CLIENT_SECRET){const r=await fetch(`${MP}/oauth/token`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:CLIENT_ID,client_secret:CLIENT_SECRET,grant_type:'client_credentials'})}),d=await r.json().catch(()=>({}));if(r.ok&&d?.access_token)return String(d.access_token)}if(OWN_ACCESS_TOKEN)return OWN_ACCESS_TOKEN;if(c?.access_token_cipher)return decrypt(String(c.access_token_cipher));throw new Error('Falta el Access Token productivo de Mercado Pago.')}if(c?.access_token_cipher)return decrypt(String(c.access_token_cipher));throw new Error('La autorización OAuth de Mercado Pago no está disponible.')}
async function mp(path:string,t:string,init:RequestInit={}){const r=await fetch(`${MP}${path}`,{...init,headers:{Authorization:`Bearer ${t}`,'Content-Type':'application/json',...(init.headers||{})},cache:'no-store'}),text=await r.text();let d:any={};try{d=text?JSON.parse(text):{}}catch{d={message:text}}if(!r.ok){const e=new Error(String(d?.message||d?.error||d?.cause?.[0]?.description||`Mercado Pago respondió ${r.status}`)) as Error&{status?:number;data?:any};e.status=r.status;e.data=d;throw e}return d}
function normalize(o:any){const p=Array.isArray(o?.transactions?.payments)?o.transactions.payments[0]||{}:{},status=String(o?.status||'unknown'),detail=String(o?.status_detail||p?.status_detail||'');return{id:String(o?.id||''),status,status_detail:detail,amount:Number(o?.total_amount||p?.paid_amount||p?.amount||0),approved:status==='processed'||detail==='accredited'||String(p?.status||'')==='processed',final:FINAL.has(status),qr_data:String(o?.type_response?.qr_data||'')}}
function qrExternalId(companyId:string){return `CLQR${companyId.replace(/[^a-zA-Z0-9]/g,'').slice(0,32)}`.slice(0,40)}
function storeExternalId(companyId:string){return `CLSTORE${companyId.replace(/[^a-zA-Z0-9]/g,'').slice(0,28)}`.slice(0,40)}
async function findPosByExternal(t:string,externalId:string){const d=await mp(`/pos?external_id=${encodeURIComponent(externalId)}`,t);const rows=Array.isArray(d?.results)?d.results:Array.isArray(d)?d:[];return rows[0]||null}
async function ensureQrPos(c:any,t:string,companyId:string){
  const posId=String(c?.terminal_pos_id||'').trim();
  if(!posId)throw new Error('La caja vinculada al Point no está identificada. Volvé a seleccionar la terminal desde Configuración > Mercado Pago.');
  const pos=await mp(`/pos/${encodeURIComponent(posId)}`,t);
  let externalPos=String(pos?.external_id||'').trim();
  if(externalPos)return externalPos;
  const storeId=String(c?.terminal_store_id||pos?.store_id||'').trim();
  if(!storeId)throw new Error('La terminal no tiene una sucursal de Mercado Pago asociada.');
  const store=await mp(`/stores/${encodeURIComponent(storeId)}`,t);
  let externalStore=String(store?.external_id||'').trim();
  if(!externalStore){
    const mpUserId=String(c?.mp_user_id||pos?.user_id||'').trim();
    if(!mpUserId)throw new Error('Mercado Pago no informó el titular de la sucursal.');
    externalStore=storeExternalId(companyId);
    await mp(`/users/${encodeURIComponent(mpUserId)}/stores/${encodeURIComponent(storeId)}`,t,{method:'PUT',body:JSON.stringify({external_id:externalStore})});
  }
  externalPos=qrExternalId(companyId);
  try{
    await mp(`/pos/${encodeURIComponent(posId)}`,t,{method:'PUT',body:JSON.stringify({name:String(pos?.name||'Comercio Lleno').slice(0,45),fixed_amount:true,store_id:Number(storeId),external_store_id:externalStore,external_id:externalPos})});
  }catch(e){
    if(Number((e as any)?.status||0)!==409)throw e;
    const existing=await findPosByExternal(t,externalPos);
    if(!existing)throw e;
  }
  return externalPos;
}

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)});
  if(req.method!=='POST')return json(req,{ok:false,error:'Método no permitido.'},405);
  let a:any;try{a=await auth(req)}catch{return json(req,{ok:false,error:'Sesión no disponible.'},401)}
  if(!canSell(a))return json(req,{ok:false,error:'Tu usuario no tiene permiso para cobrar.'},403);
  let body:any={};try{body=await req.json()}catch{}
  try{
    const c=await connection(a.companyId);if(!c)return json(req,{ok:false,error:'Conectá Mercado Pago antes de cobrar con QR.'},409);
    const t=await token(c),action=String(body.action||'create_order');
    if(action==='get_order'){const id=String(body.order_id||'');if(!id)return json(req,{ok:false,error:'Falta la order.'},400);return json(req,{ok:true,order:normalize(await mp(`/v1/orders/${encodeURIComponent(id)}`,t))})}
    if(action==='cancel_order'){const id=String(body.order_id||'');if(!id)return json(req,{ok:false,error:'Falta la order.'},400);const current=normalize(await mp(`/v1/orders/${encodeURIComponent(id)}`,t));if(current.final)return json(req,{ok:true,order:current});const canceled=await mp(`/v1/orders/${encodeURIComponent(id)}/cancel`,t,{method:'POST',headers:{'X-Idempotency-Key':crypto.randomUUID()}});return json(req,{ok:true,order:normalize(canceled)})}
    const amount=Math.round(Number(body.amount||0)*100)/100;if(!(amount>0))return json(req,{ok:false,error:'Importe inválido.'},400);
    const externalPos=await ensureQrPos(c,t,a.companyId);
    const rawSaleId=String(body.sale_id||crypto.randomUUID()),cleanSaleId=rawSaleId.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,36)||crypto.randomUUID().replace(/-/g,''),ref=`CLQR-${a.companyId.slice(0,8)}-${cleanSaleId}`.slice(0,64),idempotency=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawSaleId)?rawSaleId:crypto.randomUUID(),formatted=amount.toFixed(2);
    const order=await mp('/v1/orders',t,{method:'POST',headers:{'X-Idempotency-Key':idempotency},body:JSON.stringify({type:'qr',total_amount:formatted,external_reference:ref,expiration_time:'PT5M',transactions:{payments:[{amount:formatted}]},config:{qr:{external_pos_id:externalPos,mode:'dynamic'}},description:'Venta Comercio Lleno - QR'})});
    const normalized=normalize(order);
    if(!normalized.qr_data)throw new Error('Mercado Pago creó la orden pero no devolvió el QR dinámico.');
    return json(req,{ok:true,external_pos_id:externalPos,order:normalized});
  }catch(e){const status=Number((e as any)?.status||0);console.error('[MP QR]',status,e instanceof Error?e.message:String(e));return json(req,{ok:false,error:e instanceof Error?e.message:String(e),provider_status:status||null},status>=400&&status<500?status:502)}
});
