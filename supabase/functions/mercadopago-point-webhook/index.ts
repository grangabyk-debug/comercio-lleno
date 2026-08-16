import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL=Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CLIENT_ID=Deno.env.get('MERCADOPAGO_POINT_CLIENT_ID')||'';
const CLIENT_SECRET=Deno.env.get('MERCADOPAGO_POINT_CLIENT_SECRET')||'';
const WEBHOOK_SECRET=Deno.env.get('MERCADOPAGO_POINT_WEBHOOK_SECRET')||'';
const MP_API='https://api.mercadopago.com';
function adminHeaders(extra:Record<string,string>={}){return{apikey:SERVICE_ROLE,Authorization:`Bearer ${SERVICE_ROLE}`,'Content-Type':'application/json',...extra}}
async function adminRest(path:string,init:RequestInit={}){return fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...init,headers:adminHeaders(init.headers as Record<string,string>||{}),cache:'no-store'})}
function decodeB64url(value:string){const normalized=value.replace(/-/g,'+').replace(/_/g,'/'),padded=normalized+'='.repeat((4-normalized.length%4)%4),raw=atob(padded);return Uint8Array.from(raw,c=>c.charCodeAt(0))}
async function sha256(value:string){return new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))}
async function aesKey(){const seed=Deno.env.get('MERCADOPAGO_POINT_ENCRYPTION_KEY')||SERVICE_ROLE;return crypto.subtle.importKey('raw',await sha256(seed),{name:'AES-GCM'},false,['decrypt','encrypt'])}
function b64url(bytes:Uint8Array){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
async function encryptText(value:string){if(!value)return'';const iv=new Uint8Array(12);crypto.getRandomValues(iv);const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await aesKey(),new TextEncoder().encode(value)));return`v1.${b64url(iv)}.${b64url(encrypted)}`}
async function decryptText(value:string){const [version,ivRaw,dataRaw]=String(value||'').split('.');if(version!=='v1'||!ivRaw||!dataRaw)throw new Error('TOKEN_CIPHER_INVALID');const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:decodeB64url(ivRaw)},await aesKey(),decodeB64url(dataRaw));return new TextDecoder().decode(plain)}
function hex(bytes:ArrayBuffer){return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('')}
function safeEqual(a:string,b:string){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
async function verifySignature(req:Request,dataId:string){
  if(!WEBHOOK_SECRET)return false;const signature=req.headers.get('x-signature')||'',requestId=req.headers.get('x-request-id')||'';let ts='',v1='';for(const part of signature.split(',')){const [key,...rest]=part.split('=');const value=rest.join('=').trim();if(key?.trim()==='ts')ts=value;if(key?.trim()==='v1')v1=value}if(!ts||!v1||!requestId||!dataId)return false;
  const normalized=/^[a-z0-9]+$/i.test(dataId)?dataId.toLowerCase():dataId,manifest=`id:${normalized};request-id:${requestId};ts:${ts};`,key=await crypto.subtle.importKey('raw',new TextEncoder().encode(WEBHOOK_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']),signed=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(manifest));return safeEqual(hex(signed),v1.toLowerCase())
}
async function readConnectionByUser(mpUserId:string){const response=await adminRest(`mercadopago_point_connections?mp_user_id=eq.${encodeURIComponent(mpUserId)}&select=*&limit=1`),rows=await response.json().catch(()=>[]);return Array.isArray(rows)?rows[0]||null:null}
async function readOrder(orderId:string){const response=await adminRest(`mercadopago_point_orders?mp_order_id=eq.${encodeURIComponent(orderId)}&select=company_id,mp_order_id&limit=1`),rows=await response.json().catch(()=>[]);return Array.isArray(rows)?rows[0]||null:null}
async function patchConnection(companyId:string,patch:Record<string,unknown>){await adminRest(`mercadopago_point_connections?company_id=eq.${encodeURIComponent(companyId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({...patch,updated_at:new Date().toISOString()})})}
async function tokenFor(connection:any){
  const expires=connection?.token_expires_at?new Date(connection.token_expires_at).getTime():0;if(!expires||expires>Date.now()+5*60_000)return decryptText(String(connection.access_token_cipher||''));
  if(!connection?.refresh_token_cipher||!CLIENT_ID||!CLIENT_SECRET)throw new Error('OAuth vencido');const refresh=await decryptText(String(connection.refresh_token_cipher)),response=await fetch(`${MP_API}/oauth/token`,{method:'POST',headers:{accept:'application/json','content-type':'application/json'},body:JSON.stringify({client_id:CLIENT_ID,client_secret:CLIENT_SECRET,grant_type:'refresh_token',refresh_token:refresh}),cache:'no-store'}),data=await response.json().catch(()=>({}));if(!response.ok||!data?.access_token)throw new Error('No se pudo renovar OAuth');const accessCipher=await encryptText(String(data.access_token)),refreshCipher=await encryptText(String(data.refresh_token||refresh)),expiresAt=new Date(Date.now()+Number(data.expires_in||15552000)*1000).toISOString();await patchConnection(String(connection.company_id),{access_token_cipher:accessCipher,refresh_token_cipher:refreshCipher,token_expires_at:expiresAt,status:'connected',last_error:null});return String(data.access_token)
}
async function fetchOrder(orderId:string,token:string){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);try{const response=await fetch(`${MP_API}/v1/orders/${encodeURIComponent(orderId)}`,{headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},signal:controller.signal,cache:'no-store'}),data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.message||`Mercado Pago respondió ${response.status}`);return data}finally{clearTimeout(timer)}}
function orderSummary(order:any){const payment=Array.isArray(order?.transactions?.payments)?order.transactions.payments[0]||{}:{};return{status:String(order?.status||'unknown'),status_detail:String(order?.status_detail||payment?.status_detail||''),payment_id:String(payment?.id||''),payment_status:String(payment?.status||''),amount:Number(payment?.paid_amount||payment?.amount||0),external_reference:String(order?.external_reference||'')}}

Deno.serve(async(req:Request)=>{
  if(req.method!=='POST')return new Response('OK',{status:200});
  if(!WEBHOOK_SECRET)return Response.json({ok:false,error:'Webhook secret no configurado'},{status:503});
  let body:any={};try{body=await req.json()}catch{}
  const url=new URL(req.url),dataId=String(url.searchParams.get('data.id')||url.searchParams.get('data_id')||body?.data?.id||'');
  if(!await verifySignature(req,dataId))return Response.json({ok:false,error:'Firma inválida'},{status:401});
  const requestId=req.headers.get('x-request-id')||'',ts=(req.headers.get('x-signature')||'').split(',').find(p=>p.trim().startsWith('ts='))?.split('=')[1]||'',eventKey=requestId||`${dataId}:${ts}`;
  const eventInsert=await adminRest('mercadopago_point_webhook_events',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({event_key:eventKey,event_type:String(body?.type||''),action:String(body?.action||''),mp_order_id:dataId||null,mp_user_id:body?.user_id==null?null:String(body.user_id),payload_summary:{status:body?.data?.status||null,status_detail:body?.data?.status_detail||null,external_reference:body?.data?.external_reference||null,live_mode:Boolean(body?.live_mode)}})});
  if(eventInsert.status===409)return Response.json({ok:true,duplicate:true});
  try{
    if(String(body?.type||'').toLowerCase()!=='order'||!dataId)return Response.json({ok:true,ignored:true});
    const localOrder=await readOrder(dataId),connection=body?.user_id?await readConnectionByUser(String(body.user_id)):localOrder?await (async()=>{const response=await adminRest(`mercadopago_point_connections?company_id=eq.${encodeURIComponent(String(localOrder.company_id))}&select=*&limit=1`),rows=await response.json().catch(()=>[]);return Array.isArray(rows)?rows[0]||null:null})():null;
    if(!connection?.access_token_cipher)return Response.json({ok:true,unmatched:true});
    const token=await tokenFor(connection),remote=await fetchOrder(dataId,token),summary=orderSummary(remote),processedAt=summary.status==='processed'?new Date().toISOString():null;
    await adminRest(`mercadopago_point_orders?company_id=eq.${encodeURIComponent(String(connection.company_id))}&mp_order_id=eq.${encodeURIComponent(dataId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status:summary.status,status_detail:summary.status_detail||null,payment_id:summary.payment_id||null,payment_status:summary.payment_status||null,processed_at:processedAt,updated_at:new Date().toISOString(),raw_summary:summary})});
    return Response.json({ok:true});
  }catch(error){console.error('[MP POINT WEBHOOK]',error instanceof Error?error.message:String(error));return Response.json({ok:true,received:true,processing_error:true})}
});
