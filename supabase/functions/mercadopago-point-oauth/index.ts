import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL=Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CLIENT_ID=Deno.env.get('MERCADOPAGO_POINT_CLIENT_ID')||'';
const CLIENT_SECRET=Deno.env.get('MERCADOPAGO_POINT_CLIENT_SECRET')||'';
const CALLBACK_URL=`${SUPABASE_URL.replace(/\/$/,'')}/functions/v1/mercadopago-point-oauth`;
const MP_API='https://api.mercadopago.com';
function adminHeaders(extra:Record<string,string>={}){return{apikey:SERVICE_ROLE,Authorization:`Bearer ${SERVICE_ROLE}`,'Content-Type':'application/json',...extra}}
async function adminRest(path:string,init:RequestInit={}){return fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...init,headers:adminHeaders(init.headers as Record<string,string>||{}),cache:'no-store'})}
function b64url(bytes:Uint8Array){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
async function sha256(value:string){return new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))}
async function aesKey(){const seed=Deno.env.get('MERCADOPAGO_POINT_ENCRYPTION_KEY')||SERVICE_ROLE;return crypto.subtle.importKey('raw',await sha256(seed),{name:'AES-GCM'},false,['encrypt'])}
async function encryptText(value:string){if(!value)return'';const iv=new Uint8Array(12);crypto.getRandomValues(iv);const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await aesKey(),new TextEncoder().encode(value)));return `v1.${b64url(iv)}.${b64url(encrypted)}`}
function safeReturn(value:unknown){try{const url=new URL(String(value||'https://comerciolleno.com/redesign'));if(url.origin==='https://comerciolleno.com'||url.origin==='https://www.comerciolleno.com'||/^https:\/\/[-a-z0-9]+\.vercel\.app$/i.test(url.origin))return`${url.origin}${url.pathname}${url.search}`}catch{}return'https://comerciolleno.com/redesign'}
function redirect(base:string,status:'connected'|'error',message=''){const url=new URL(base);url.searchParams.set('mp',status);if(message)url.searchParams.set('mp_message',message.slice(0,180));return Response.redirect(url.toString(),302)}

Deno.serve(async(req:Request)=>{
  if(req.method!=='GET')return new Response('Método no permitido',{status:405});
  const url=new URL(req.url),state=String(url.searchParams.get('state')||''),code=String(url.searchParams.get('code')||''),providerError=String(url.searchParams.get('error')||'');
  if(!state)return redirect('https://comerciolleno.com/redesign','error','Mercado Pago no devolvió el estado de autorización.');
  const stateResponse=await adminRest(`mercadopago_point_oauth_states?state=eq.${encodeURIComponent(state)}&select=*&limit=1`),rows=await stateResponse.json().catch(()=>[]),row=Array.isArray(rows)?rows[0]:null,returnUrl=safeReturn(row?.return_url);
  if(!row)return redirect(returnUrl,'error','La vinculación venció o no es válida.');
  if(row.used_at||new Date(row.expires_at).getTime()<Date.now())return redirect(returnUrl,'error','La vinculación venció. Volvé a iniciarla desde Comercio Lleno.');
  if(providerError)return redirect(returnUrl,'error','Mercado Pago canceló o rechazó la autorización.');
  if(!code)return redirect(returnUrl,'error','Mercado Pago no devolvió el código de autorización.');
  if(!CLIENT_ID||!CLIENT_SECRET)return redirect(returnUrl,'error','La aplicación de Mercado Pago todavía no tiene sus credenciales configuradas.');
  try{
    const response=await fetch(`${MP_API}/oauth/token`,{method:'POST',headers:{accept:'application/json','content-type':'application/json'},body:JSON.stringify({client_id:CLIENT_ID,client_secret:CLIENT_SECRET,grant_type:'authorization_code',code,redirect_uri:CALLBACK_URL,code_verifier:String(row.code_verifier||'')}),cache:'no-store'}),data=await response.json().catch(()=>({}));
    if(!response.ok||!data?.access_token)throw new Error(data?.message||data?.error||'Mercado Pago no pudo completar la autorización.');
    const accessCipher=await encryptText(String(data.access_token)),refreshCipher=await encryptText(String(data.refresh_token||'')),expiresAt=new Date(Date.now()+Number(data.expires_in||15552000)*1000).toISOString(),now=new Date().toISOString();
    const upsert=await adminRest('mercadopago_point_connections?on_conflict=company_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({company_id:String(row.company_id),mp_user_id:String(data.user_id||''),access_token_cipher:accessCipher,refresh_token_cipher:refreshCipher||null,token_expires_at:expiresAt,status:'connected',connected_by:String(row.user_id),connected_at:now,last_error:null,updated_at:now})});
    if(!upsert.ok)throw new Error('No se pudo guardar la autorización de Mercado Pago.');
    await adminRest(`mercadopago_point_oauth_states?state=eq.${encodeURIComponent(state)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({used_at:now})});
    return redirect(returnUrl,'connected');
  }catch(error){
    console.error('[MP POINT OAUTH]',error instanceof Error?error.message:String(error));
    return redirect(returnUrl,'error',error instanceof Error?error.message:'No se pudo conectar Mercado Pago.');
  }
});
