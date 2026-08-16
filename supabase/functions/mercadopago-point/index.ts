import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL=Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PUBLISHABLE_KEY=Deno.env.get('SUPABASE_ANON_KEY')||Deno.env.get('SUPABASE_PUBLISHABLE_KEY')||SERVICE_ROLE;
const CLIENT_ID=Deno.env.get('MERCADOPAGO_POINT_CLIENT_ID')||'';
const CLIENT_SECRET=Deno.env.get('MERCADOPAGO_POINT_CLIENT_SECRET')||'';
const MP_API='https://api.mercadopago.com';
const CALLBACK_URL=`${SUPABASE_URL.replace(/\/$/,'')}/functions/v1/mercadopago-point-oauth`;
const WEBHOOK_URL=`${SUPABASE_URL.replace(/\/$/,'')}/functions/v1/mercadopago-point-webhook`;
const TERMINAL_FINAL=new Set(['processed','failed','canceled','expired','refunded','action_required']);

function originAllowed(origin:string){return origin==='https://comerciolleno.com'||origin==='https://www.comerciolleno.com'||/^https:\/\/[-a-z0-9]+\.vercel\.app$/i.test(origin)}
function allowedOrigin(req:Request){const origin=req.headers.get('origin')||'';return originAllowed(origin)?origin:'https://comerciolleno.com'}
function cors(req:Request){return{'Access-Control-Allow-Origin':allowedOrigin(req),'Vary':'Origin','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'}}
function json(req:Request,body:unknown,status=200){return Response.json(body,{status,headers:cors(req)})}
function adminHeaders(extra:Record<string,string>={}){return{apikey:SERVICE_ROLE,Authorization:`Bearer ${SERVICE_ROLE}`,'Content-Type':'application/json',...extra}}
async function adminRest(path:string,init:RequestInit={}){return fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...init,headers:adminHeaders(init.headers as Record<string,string>||{}),cache:'no-store'})}
function appConfigured(){return Boolean(CLIENT_ID&&CLIENT_SECRET)}
function b64url(bytes:Uint8Array){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function randomUrlSafe(size=32){const bytes=new Uint8Array(size);crypto.getRandomValues(bytes);return b64url(bytes)}
async function sha256(value:string){return new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))}
async function aesKey(){const seed=Deno.env.get('MERCADOPAGO_POINT_ENCRYPTION_KEY')||SERVICE_ROLE;const raw=await sha256(seed);return crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt'])}
async function encryptText(value:string){if(!value)return'';const iv=new Uint8Array(12);crypto.getRandomValues(iv);const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await aesKey(),new TextEncoder().encode(value)));return `v1.${b64url(iv)}.${b64url(encrypted)}`}
function decodeB64url(value:string){const normalized=value.replace(/-/g,'+').replace(/_/g,'/');const padded=normalized+'='.repeat((4-normalized.length%4)%4);const raw=atob(padded);return Uint8Array.from(raw,c=>c.charCodeAt(0))}
async function decryptText(value:string){if(!value)return'';const [version,ivRaw,dataRaw]=value.split('.');if(version!=='v1'||!ivRaw||!dataRaw)throw new Error('TOKEN_CIPHER_INVALID');const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:decodeB64url(ivRaw)},await aesKey(),decodeB64url(dataRaw));return new TextDecoder().decode(plain)}
function safeReturnUrl(value:unknown,origin:string){try{const url=new URL(String(value||`${origin}/redesign`));if(!originAllowed(url.origin))return`${origin}/redesign`;return`${url.origin}${url.pathname}${url.search}`}catch{return`${origin}/redesign`}}

async function authContext(req:Request){
  const auth=req.headers.get('authorization')||'',token=auth.replace(/^Bearer\s+/i,'');
  if(!token)throw new Error('UNAUTHORIZED');
  const userResponse=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{Authorization:`Bearer ${token}`,apikey:PUBLISHABLE_KEY},cache:'no-store'}),user=await userResponse.json().catch(()=>({}));
  if(!userResponse.ok||!user?.id)throw new Error('UNAUTHORIZED');
  const profileResponse=await adminRest(`profiles?id=eq.${encodeURIComponent(String(user.id))}&select=company_id,role,active,permissions&limit=1`),profiles=await profileResponse.json().catch(()=>[]),profile=Array.isArray(profiles)?profiles[0]:null;
  if(!profile?.company_id||profile.active===false)throw new Error('UNAUTHORIZED');
  return{token,userId:String(user.id),companyId:String(profile.company_id),role:String(profile.role||''),permissions:profile.permissions||{}};
}
function canSell(auth:any){return auth.role==='owner'||['cashier','seller','manager','supervisor'].includes(auth.role)||auth.permissions?.can_sell===true}
function ownerOnly(auth:any){if(auth.role!=='owner')throw new Error('OWNER_ONLY')}
async function readConnection(companyId:string){const response=await adminRest(`mercadopago_point_connections?company_id=eq.${encodeURIComponent(companyId)}&select=*&limit=1`),rows=await response.json().catch(()=>[]);if(!response.ok)throw new Error('No se pudo leer la conexión de Mercado Pago.');return Array.isArray(rows)?rows[0]||null:null}
async function patchConnection(companyId:string,patch:Record<string,unknown>){const response=await adminRest(`mercadopago_point_connections?company_id=eq.${encodeURIComponent(companyId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({...patch,updated_at:new Date().toISOString()})});if(!response.ok)throw new Error('No se pudo actualizar la conexión de Mercado Pago.')}
async function upsertConnection(row:Record<string,unknown>){const response=await adminRest('mercadopago_point_connections?on_conflict=company_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(row)});if(!response.ok)throw new Error('No se pudo guardar la conexión de Mercado Pago.')}

async function mp(path:string,accessToken:string,init:RequestInit={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
    const response=await fetch(`${MP_API}${path}`,{...init,headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json',...(init.headers||{})},signal:controller.signal,cache:'no-store'});
    const text=await response.text();let data:any={};try{data=text?JSON.parse(text):{}}catch{data={message:text}}
    if(!response.ok){const message=data?.message||data?.error||data?.cause?.[0]?.description||`Mercado Pago respondió ${response.status}`;const error=new Error(String(message));(error as any).status=response.status;(error as any).data=data;throw error}
    return data;
  }finally{clearTimeout(timer)}
}
async function refreshTokenIfNeeded(connection:any){
  if(!connection?.access_token_cipher)throw new Error('Mercado Pago no está conectado.');
  const expiresAt=connection.token_expires_at?new Date(connection.token_expires_at).getTime():0;
  if(!expiresAt||expiresAt>Date.now()+5*60_000)return{connection,accessToken:await decryptText(String(connection.access_token_cipher))};
  if(!connection.refresh_token_cipher||!appConfigured())throw new Error('La autorización de Mercado Pago venció. Volvé a conectar la cuenta.');
  const refreshToken=await decryptText(String(connection.refresh_token_cipher));
  const response=await fetch(`${MP_API}/oauth/token`,{method:'POST',headers:{accept:'application/json','content-type':'application/json'},body:JSON.stringify({client_id:CLIENT_ID,client_secret:CLIENT_SECRET,grant_type:'refresh_token',refresh_token:refreshToken}),cache:'no-store'}),data=await response.json().catch(()=>({}));
  if(!response.ok||!data?.access_token){await patchConnection(String(connection.company_id),{status:'error',last_error:'No se pudo renovar la autorización OAuth.'});throw new Error(data?.message||'No se pudo renovar la autorización de Mercado Pago.')}
  const accessCipher=await encryptText(String(data.access_token)),refreshCipher=await encryptText(String(data.refresh_token||refreshToken)),tokenExpiresAt=new Date(Date.now()+Number(data.expires_in||15552000)*1000).toISOString();
  await patchConnection(String(connection.company_id),{access_token_cipher:accessCipher,refresh_token_cipher:refreshCipher,token_expires_at:tokenExpiresAt,mp_user_id:String(data.user_id||connection.mp_user_id||''),status:'connected',last_error:null});
  return{connection:{...connection,access_token_cipher:accessCipher,refresh_token_cipher:refreshCipher,token_expires_at:tokenExpiresAt,status:'connected'},accessToken:String(data.access_token)};
}
function normalizeOrder(order:any){const payment=Array.isArray(order?.transactions?.payments)?order.transactions.payments[0]||{}:{};return{id:String(order?.id||''),status:String(order?.status||'unknown'),status_detail:String(order?.status_detail||payment?.status_detail||''),external_reference:String(order?.external_reference||''),terminal_id:String(order?.config?.point?.terminal_id||''),payment_id:String(payment?.id||''),payment_status:String(payment?.status||''),amount:Number(payment?.paid_amount||payment?.amount||0),final:TERMINAL_FINAL.has(String(order?.status||'')),approved:String(order?.status||'')==='processed'}}
async function persistOrderState(companyId:string,order:any){const normalized=normalizeOrder(order),patch={status:normalized.status,status_detail:normalized.status_detail||null,payment_id:normalized.payment_id||null,payment_status:normalized.payment_status||null,processed_at:normalized.approved?new Date().toISOString():null,updated_at:new Date().toISOString(),raw_summary:{status:normalized.status,status_detail:normalized.status_detail,payment_id:normalized.payment_id,payment_status:normalized.payment_status,amount:normalized.amount}};const response=await adminRest(`mercadopago_point_orders?company_id=eq.${encodeURIComponent(companyId)}&mp_order_id=eq.${encodeURIComponent(normalized.id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(patch)});if(!response.ok)console.error('[MP POINT] no se pudo actualizar order',response.status);return normalized}
async function fetchOrderRow(companyId:string,saleId:string,orderId:string){const filter=orderId?`mp_order_id=eq.${encodeURIComponent(orderId)}`:`sale_id=eq.${encodeURIComponent(saleId)}`;const response=await adminRest(`mercadopago_point_orders?company_id=eq.${encodeURIComponent(companyId)}&${filter}&select=*&order=created_at.desc&limit=1`),rows=await response.json().catch(()=>[]);if(!response.ok)throw new Error('No se pudo leer el cobro Point.');return Array.isArray(rows)?rows[0]||null:null}

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)});
  if(req.method!=='POST')return json(req,{ok:false,error:'Método no permitido.'},405);
  let auth:any;try{auth=await authContext(req)}catch{return json(req,{ok:false,error:'Sesión no disponible.'},401)}
  let body:any={};try{body=await req.json()}catch{}
  const action=String(body?.action||'status');
  try{
    if(action==='status'){
      const connection=await readConnection(auth.companyId),connected=Boolean(connection?.status==='connected'&&connection?.access_token_cipher),terminalId=String(connection?.terminal_id||''),terminalMode=String(connection?.terminal_mode||'');
      return json(req,{ok:true,app_configured:appConfigured(),connected,ready:connected&&Boolean(terminalId)&&terminalMode==='PDV',terminal:{id:terminalId||null,operating_mode:terminalMode||null,store_id:connection?.terminal_store_id||null,pos_id:connection?.terminal_pos_id||null},redirect_uri:CALLBACK_URL,webhook_url:WEBHOOK_URL,last_error:connection?.last_error||null});
    }
    if(action==='start_oauth'){
      ownerOnly(auth);if(!appConfigured())return json(req,{ok:false,configured:false,error:'Falta configurar la aplicación de Mercado Pago para Point.',redirect_uri:CALLBACK_URL,webhook_url:WEBHOOK_URL},503);
      const state=randomUrlSafe(32),verifier=randomUrlSafe(64),challenge=b64url(await sha256(verifier)),returnUrl=safeReturnUrl(body?.return_url,allowedOrigin(req));
      await adminRest(`mercadopago_point_oauth_states?company_id=eq.${encodeURIComponent(auth.companyId)}&expires_at=lt.${encodeURIComponent(new Date().toISOString())}`,{method:'DELETE'}).catch(()=>{});
      const insert=await adminRest('mercadopago_point_oauth_states',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({state,company_id:auth.companyId,user_id:auth.userId,code_verifier:verifier,return_url:returnUrl,expires_at:new Date(Date.now()+10*60_000).toISOString()})});if(!insert.ok)throw new Error('No se pudo iniciar la vinculación con Mercado Pago.');
      const params=new URLSearchParams({response_type:'code',client_id:CLIENT_ID,redirect_uri:CALLBACK_URL,state,code_challenge:challenge,code_challenge_method:'S256'});
      return json(req,{ok:true,auth_url:`https://auth.mercadopago.com/authorization?${params.toString()}`,redirect_uri:CALLBACK_URL,webhook_url:WEBHOOK_URL});
    }
    if(action==='disconnect'){
      ownerOnly(auth);const response=await adminRest(`mercadopago_point_connections?company_id=eq.${encodeURIComponent(auth.companyId)}`,{method:'DELETE'});if(!response.ok)throw new Error('No se pudo desconectar Mercado Pago.');return json(req,{ok:true,connected:false,ready:false});
    }
    const connection=await readConnection(auth.companyId);if(!connection?.access_token_cipher)return json(req,{ok:false,error:'Conectá Mercado Pago antes de continuar.'},409);
    const {accessToken}=await refreshTokenIfNeeded(connection);
    if(action==='terminals'){
      ownerOnly(auth);const data=await mp('/terminals/v1/list?limit=50&offset=0',accessToken),terminals=Array.isArray(data?.data?.terminals)?data.data.terminals.map((terminal:any)=>({id:String(terminal.id||''),pos_id:terminal.pos_id==null?null:String(terminal.pos_id),store_id:terminal.store_id==null?null:String(terminal.store_id),external_pos_id:terminal.external_pos_id==null?null:String(terminal.external_pos_id),operating_mode:String(terminal.operating_mode||'UNDEFINED')})):[];return json(req,{ok:true,terminals});
    }
    if(action==='setup_terminal'){
      ownerOnly(auth);const terminalId=String(body?.terminal_id||'').trim();if(!terminalId)return json(req,{ok:false,error:'Elegí una terminal Point.'},400);
      const setup=await mp('/terminals/v1/setup',accessToken,{method:'PATCH',body:JSON.stringify({terminals:[{id:terminalId,operating_mode:'PDV'}]})});
      const list=await mp('/terminals/v1/list?limit=50&offset=0',accessToken),terminal=(Array.isArray(list?.data?.terminals)?list.data.terminals:[]).find((item:any)=>String(item.id)===terminalId)||setup?.terminals?.[0]||{};
      await patchConnection(auth.companyId,{terminal_id:terminalId,terminal_mode:'PDV',terminal_store_id:terminal.store_id==null?null:String(terminal.store_id),terminal_pos_id:terminal.pos_id==null?null:String(terminal.pos_id),status:'connected',last_error:null});
      return json(req,{ok:true,ready:true,needs_restart:true,terminal:{id:terminalId,operating_mode:'PDV',store_id:terminal.store_id??null,pos_id:terminal.pos_id??null}});
    }
    if(action==='create_order'){
      if(!canSell(auth))return json(req,{ok:false,error:'Tu usuario no tiene permiso para cobrar.'},403);
      const saleId=String(body?.sale_id||'').trim(),amount=Math.round(Number(body?.amount||0)*100)/100;if(!saleId||!Number.isFinite(amount)||amount<=0)return json(req,{ok:false,error:'Venta o importe inválido.'},400);
      if(!connection.terminal_id||connection.terminal_mode!=='PDV')return json(req,{ok:false,error:'Configurá una Point en modo PDV antes de cobrar.'},409);
      const existing=await fetchOrderRow(auth.companyId,saleId,'');if(existing?.mp_order_id){const remote=await mp(`/v1/orders/${encodeURIComponent(String(existing.mp_order_id))}`,accessToken),normalized=await persistOrderState(auth.companyId,remote);return json(req,{ok:true,reused:true,order:normalized})}
      const idempotencyKey=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(saleId)?saleId:crypto.randomUUID(),externalReference=`CL-${auth.companyId.slice(0,8)}-${saleId.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,40)}`.slice(0,64),ticketNumber=saleId.replace(/[^a-zA-Z0-9]/g,'').slice(0,20)||crypto.randomUUID().slice(0,8);
      const insert=await adminRest('mercadopago_point_orders',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({company_id:auth.companyId,sale_id:saleId,external_reference:externalReference,terminal_id:String(connection.terminal_id),amount,idempotency_key:idempotencyKey,status:'creating',created_by:auth.userId})});if(!insert.ok){const again=await fetchOrderRow(auth.companyId,saleId,'');if(again?.mp_order_id){const remote=await mp(`/v1/orders/${encodeURIComponent(String(again.mp_order_id))}`,accessToken),normalized=await persistOrderState(auth.companyId,remote);return json(req,{ok:true,reused:true,order:normalized})}throw new Error('No se pudo reservar el cobro Point.')}
      try{
        const order=await mp('/v1/orders',accessToken,{method:'POST',headers:{'X-Idempotency-Key':idempotencyKey},body:JSON.stringify({type:'point',external_reference:externalReference,expiration_time:'PT5M',transactions:{payments:[{amount:amount.toFixed(2)}]},config:{point:{terminal_id:String(connection.terminal_id),print_on_terminal:'no_ticket',ticket_number:ticketNumber}},description:'Venta Comercio Lleno'})}),normalized=normalizeOrder(order);
        const update=await adminRest(`mercadopago_point_orders?company_id=eq.${encodeURIComponent(auth.companyId)}&sale_id=eq.${encodeURIComponent(saleId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({mp_order_id:normalized.id,status:normalized.status,status_detail:normalized.status_detail||null,payment_id:normalized.payment_id||null,payment_status:normalized.payment_status||null,raw_summary:normalized,updated_at:new Date().toISOString()})});if(!update.ok)console.error('[MP POINT] order creada pero no persistida',normalized.id);
        return json(req,{ok:true,order:normalized});
      }catch(error){await adminRest(`mercadopago_point_orders?company_id=eq.${encodeURIComponent(auth.companyId)}&sale_id=eq.${encodeURIComponent(saleId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status:'create_failed',status_detail:error instanceof Error?error.message:String(error),updated_at:new Date().toISOString()})}).catch(()=>{});throw error}
    }
    if(action==='get_order'){
      if(!canSell(auth))return json(req,{ok:false,error:'Tu usuario no tiene permiso para cobrar.'},403);
      const row=await fetchOrderRow(auth.companyId,String(body?.sale_id||''),String(body?.order_id||''));if(!row?.mp_order_id)return json(req,{ok:false,error:'No encontramos ese cobro Point.'},404);const remote=await mp(`/v1/orders/${encodeURIComponent(String(row.mp_order_id))}`,accessToken),normalized=await persistOrderState(auth.companyId,remote);return json(req,{ok:true,order:normalized});
    }
    if(action==='cancel_order'){
      if(!canSell(auth))return json(req,{ok:false,error:'Tu usuario no tiene permiso para cobrar.'},403);
      const row=await fetchOrderRow(auth.companyId,String(body?.sale_id||''),String(body?.order_id||''));if(!row?.mp_order_id)return json(req,{ok:false,error:'No encontramos ese cobro Point.'},404);const current=await mp(`/v1/orders/${encodeURIComponent(String(row.mp_order_id))}`,accessToken),currentNormalized=await persistOrderState(auth.companyId,current);if(currentNormalized.status==='at_terminal')return json(req,{ok:false,order:currentNormalized,error:'La orden ya está en la Point. Cancelala desde la terminal.'},409);if(currentNormalized.final)return json(req,{ok:true,order:currentNormalized});const canceled=await mp(`/v1/orders/${encodeURIComponent(String(row.mp_order_id))}/cancel`,accessToken,{method:'POST',headers:{'X-Idempotency-Key':crypto.randomUUID()}}),normalized=await persistOrderState(auth.companyId,canceled);return json(req,{ok:true,order:normalized});
    }
    return json(req,{ok:false,error:'Acción no válida.'},400);
  }catch(error){
    const message=error instanceof DOMException&&error.name==='AbortError'?'Mercado Pago no respondió a tiempo.':error instanceof Error?error.message:String(error);const status=Number((error as any)?.status||0);if(status===401)await patchConnection(auth.companyId,{status:'error',last_error:'Mercado Pago rechazó la autorización. Volvé a conectar la cuenta.'}).catch(()=>{});return json(req,{ok:false,error:message,provider_status:status||null},status>=400&&status<500?status:502)
  }
});
