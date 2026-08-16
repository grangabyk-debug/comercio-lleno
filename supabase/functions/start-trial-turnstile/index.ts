import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TURNSTILE_SECRET = Deno.env.get('TURNSTILE_SECRET') || '';
const TRIAL_DAYS = 14;
const MONTHLY_PRICE = 14900;
const HOURLY_LIMIT = 8;
const DAILY_LIMIT = 20;
const TERMS_VERSION = '2026-08-13';
const PRIVACY_VERSION = '2026-08-13';
const ALLOWED_TURNSTILE_HOSTS = new Set(['comerciolleno.com','www.comerciolleno.com']);

function originAllowed(origin:string){
  return origin === 'https://comerciolleno.com' || origin === 'https://www.comerciolleno.com' || /^https:\/\/[-a-z0-9]+\.vercel\.app$/i.test(origin);
}
function allowedOrigin(req:Request){const origin=req.headers.get('origin')||'';return originAllowed(origin)?origin:'https://www.comerciolleno.com'}
function cors(req:Request){return{'Access-Control-Allow-Origin':allowedOrigin(req),'Vary':'Origin','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'}}
function json(req:Request,body:unknown,status=200){return Response.json(body,{status,headers:cors(req)})}
function headers(extra:Record<string,string>={}){return{apikey:SERVICE_ROLE,Authorization:`Bearer ${SERVICE_ROLE}`,'Content-Type':'application/json',...extra}}
async function rest(path:string,init:RequestInit={}){return fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...init,headers:headers(init.headers as Record<string,string>||{})})}
function strong(value:string){return value.length>=8&&/[A-Z]/.test(value)&&/\d/.test(value)&&/[^A-Za-z0-9]/.test(value)}
function bytesHex(buf:ArrayBuffer){return [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function hmac(value:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(SERVICE_ROLE),{name:'HMAC',hash:'SHA-256'},false,['sign']);return bytesHex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)))}
function clientAddress(req:Request){const forwarded=(req.headers.get('x-forwarded-for')||'').split(',')[0].trim();return req.headers.get('cf-connecting-ip')||req.headers.get('x-real-ip')||forwarded||'unknown'}

async function verifyTurnstile(req:Request,token:string){
  if(!TURNSTILE_SECRET)throw Object.assign(new Error('La verificación de seguridad no está configurada.'),{status:503});
  if(!token)throw Object.assign(new Error('Completá la verificación de seguridad para continuar.'),{status:400});
  const form=new URLSearchParams({secret:TURNSTILE_SECRET,response:token});
  const remoteIp=clientAddress(req);if(remoteIp&&remoteIp!=='unknown')form.set('remoteip',remoteIp);
  const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:form.toString()});
  const result=await response.json().catch(()=>({success:false}));
  if(!response.ok||result?.success!==true)throw Object.assign(new Error('No pudimos validar la verificación de seguridad. Volvé a intentarlo.'),{status:400});
  const hostname=String(result?.hostname||'').toLowerCase();
  if(!ALLOWED_TURNSTILE_HOSTS.has(hostname))throw Object.assign(new Error('La verificación de seguridad no corresponde a este sitio.'),{status:400});
  return result;
}

async function consumeAttempt(req:Request,email:string,turnstileToken:string){
  const ipHash=await hmac(`ip:${clientAddress(req)}`);const emailHash=await hmac(`email:${email}`);const challengeHash=await hmac(`turnstile:${turnstileToken}`);
  const hour=new Date(Date.now()-60*60*1000).toISOString();const day=new Date(Date.now()-24*60*60*1000).toISOString();
  const [hourResp,dayResp]=await Promise.all([rest(`trial_signup_attempts?ip_hash=eq.${encodeURIComponent(ipHash)}&created_at=gte.${encodeURIComponent(hour)}&select=id&limit=${HOURLY_LIMIT}`),rest(`trial_signup_attempts?ip_hash=eq.${encodeURIComponent(ipHash)}&created_at=gte.${encodeURIComponent(day)}&select=id&limit=${DAILY_LIMIT}`)]);
  const hourRows=await hourResp.json().catch(()=>[]);const dayRows=await dayResp.json().catch(()=>[]);
  if(Array.isArray(hourRows)&&hourRows.length>=HOURLY_LIMIT)throw Object.assign(new Error('Demasiados intentos de alta desde esta conexión. Probá nuevamente más tarde.'),{status:429});
  if(Array.isArray(dayRows)&&dayRows.length>=DAILY_LIMIT)throw Object.assign(new Error('Se alcanzó el límite diario de altas desde esta conexión.'),{status:429});
  const insert=await rest('trial_signup_attempts',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({ip_hash:ipHash,email_hash:emailHash,challenge_hash:challengeHash,succeeded:false})});
  const rows=await insert.json().catch(()=>[]);
  if(insert.status===409)throw Object.assign(new Error('Esta verificación ya fue utilizada. Volvé a verificarte.'),{status:409});
  if(!insert.ok||!Array.isArray(rows)||!rows[0]?.id)throw new Error('No se pudo registrar el intento de alta.');
  return String(rows[0].id)
}
async function markSuccess(id:string){await rest(`trial_signup_attempts?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({succeeded:true})}).catch(()=>{})}

const OWNER_PERMISSIONS={can_sell:true,can_open_close_cash:true,can_view_reports:true,can_manage_stock:true,can_edit_products:true,can_import_export_products:true,can_manage_suppliers:true,can_manage_purchases:true,can_manage_customers:true,can_edit_customers:true,can_manage_promotions:true,can_manage_finances:true};

async function createTenant(userId:string,fullName:string,email:string,companyName:string){
  const acceptedAt=new Date().toISOString();
  const companyResponse=await rest('companies',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({name:companyName,legal_name:companyName,owner_phone:null,country:null,province:null,address:null,onboarding_complete:false,terms_accepted_at:acceptedAt,privacy_accepted_at:acceptedAt,terms_version:TERMS_VERSION,privacy_version:PRIVACY_VERSION})});
  const companies=await companyResponse.json().catch(()=>[]);if(!companyResponse.ok||!companies?.[0]?.id)throw new Error('No se pudo crear el comercio.');const companyId=String(companies[0].id);
  try{
    const profile=await rest('profiles?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:userId,company_id:companyId,role:'owner',full_name:fullName,username:email,permissions:OWNER_PERMISSIONS,active:true})});if(!profile.ok)throw new Error('No se pudo asociar el propietario al comercio.');
    const branch=await rest('branches',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({company_id:companyId,name:companyName,address:null,country:null,province:null,is_primary:true,active:true})});if(!branch.ok)throw new Error('No se pudo crear el local principal.');
    const start=new Date();const end=new Date(start.getTime()+TRIAL_DAYS*86400000);
    const subscription=await rest('company_subscriptions',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({company_id:companyId,plan:'comercio_lleno',status:'trialing',trial_started_at:start.toISOString(),trial_ends_at:end.toISOString(),price_amount:MONTHLY_PRICE,currency:'ARS'})});const subscriptions=await subscription.json().catch(()=>[]);if(!subscription.ok||!subscriptions?.[0])throw new Error('No se pudo activar la prueba gratuita.');
    return{companyId,subscription:subscriptions[0]};
  }catch(e){await rest(`companies?id=eq.${encodeURIComponent(companyId)}`,{method:'DELETE'}).catch(()=>{});throw e}
}

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)});
  if(req.method!=='POST')return json(req,{ok:false,error:'Método no permitido'},405);
  const origin=req.headers.get('origin')||'';if(origin&&!originAllowed(origin))return json(req,{ok:false,error:'Origen no permitido'},403);
  let body:any={};try{body=await req.json()}catch{return json(req,{ok:false,error:'Solicitud inválida'},400)}
  if(String(body.website||'').trim())return json(req,{ok:true},200);

  const companyName=String(body.company_name||'').trim();const acceptedTerms=body.accepted_terms===true;const acceptedPrivacy=body.accepted_privacy===true;
  const email=String(body.email||'').trim().toLowerCase();const password=String(body.password||'');const fullName=String(body.full_name||'').trim();const turnstileToken=String(body.turnstile_token||'').trim();
  if(!acceptedTerms||!acceptedPrivacy)return json(req,{ok:false,error:'Para registrarte tenés que aceptar los Términos y Condiciones y la Política de Privacidad.'},400);
  if(companyName.length<2||companyName.length>120)return json(req,{ok:false,error:'Ingresá el nombre de tu comercio.'},400);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>200)return json(req,{ok:false,error:'Ingresá un email válido.'},400);
  if(!strong(password)||password.length>128)return json(req,{ok:false,error:'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un signo especial.'},400);
  if(fullName.length<2||fullName.length>120)return json(req,{ok:false,error:'Ingresá tu nombre.'},400);

  try{await verifyTurnstile(req,turnstileToken)}catch(e){return json(req,{ok:false,error:e instanceof Error?e.message:String(e)},Number((e as any)?.status)||400)}
  let attemptId='';try{attemptId=await consumeAttempt(req,email,turnstileToken)}catch(e){return json(req,{ok:false,error:e instanceof Error?e.message:String(e)},Number((e as any)?.status)||500)}
  let userId='';
  try{
    const userResponse=await fetch(`${SUPABASE_URL}/auth/v1/admin/users`,{method:'POST',headers:headers(),body:JSON.stringify({email,password,email_confirm:true,user_metadata:{full_name:fullName,company_name:companyName,signup_source:'turnstile_14_day_trial'}})});const user=await userResponse.json().catch(()=>({}));
    if(!userResponse.ok||!user?.id){const msg=String(user?.msg||user?.message||user?.error||'No se pudo crear la cuenta.');if(/already|registered|exists/i.test(msg))return json(req,{ok:false,error:'Ya existe una cuenta con ese email.'},409);throw new Error(msg)}
    userId=String(user.id);const created=await createTenant(userId,fullName,email,companyName);await markSuccess(attemptId);return json(req,{ok:true,company_id:created.companyId,company_name:companyName,role:'owner',permissions:OWNER_PERMISSIONS,trial_started_at:created.subscription.trial_started_at,trial_ends_at:created.subscription.trial_ends_at});
  }catch(e){if(userId)await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`,{method:'DELETE',headers:headers()}).catch(()=>{});return json(req,{ok:false,error:e instanceof Error?e.message:String(e)},500)}
});
