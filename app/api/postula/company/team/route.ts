import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
function db(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
const txt=(v:unknown,n=180)=>String(v??'').trim().slice(0,n)
async function hash(v:string){const raw=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return Array.from(new Uint8Array(raw),x=>x.toString(16).padStart(2,'0')).join('')}
function token(){const a=new Uint8Array(24);crypto.getRandomValues(a);return Array.from(a,x=>x.toString(16).padStart(2,'0')).join('')}
function first<T>(value:T|T[]|null|undefined){return Array.isArray(value)?value[0]??null:value??null}
const roleLabel:Record<string,string>={admin:'Administrador',recruiter:'Recursos Humanos',hiring_manager:'Responsable que entrevista',viewer:'Sólo lectura'}
const esc=(v:string)=>v.replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'} as Record<string,string>)[c]||c)

export async function GET(req:NextRequest){
 const c=db(req)
 const {data:{user}}=await c.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const company=req.nextUrl.searchParams.get('company')||''
 const [{data:members,error:mErr},{data:invites,error:iErr}]=await Promise.all([
  c.from('pm_company_members').select('company_id,user_id,role,status,created_at').eq('company_id',company),
  c.from('pm_company_invites').select('id,email,role,status,expires_at,created_at').eq('company_id',company).order('created_at',{ascending:false})
 ])
 if(mErr||iErr)return NextResponse.json({ok:false,error:mErr?.message||iErr?.message},{status:403})
 return NextResponse.json({ok:true,members:members||[],invites:invites||[]})
}

export async function POST(req:NextRequest){
 const c=db(req)
 const {data:{user}}=await c.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const b=await req.json().catch(()=>({})),company=txt(b?.company_id,80),email=txt(b?.email,180).toLowerCase(),role=txt(b?.role,40)
 if(!company||!/^\S+@\S+\.\S+$/.test(email)||!['admin','recruiter','hiring_manager','viewer'].includes(role))return NextResponse.json({ok:false,error:'Email o rol inválido.'},{status:400})
 const raw=token(),tokenHash=await hash(raw)
 const {data,error}=await c.from('pm_company_invites').insert({company_id:company,email,role,token_hash:tokenHash,invited_by:user.id}).select('id,email,role,status,expires_at').single()
 if(error)return NextResponse.json({ok:false,error:error.message},{status:403})
 const invitePath=`/empresas/invitacion?token=${raw}`
 let emailSent=false
 const resend=process.env.RESEND_API_KEY
 if(resend){
  try{
   const {data:companyRow}=await c.from('pm_companies').select('name').eq('id',company).maybeSingle()
   const companyName=txt(companyRow?.name||'una empresa',120)
   const inviteUrl=`https://postulamejor.com${invitePath}`
   const html=`<!doctype html><html><body style="margin:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#101820"><div style="max-width:600px;margin:0 auto;padding:30px 16px"><div style="background:#081d2b;color:#fff;padding:28px;border-radius:22px 22px 0 0"><div style="font-size:22px;font-weight:800">Postulá Mejor</div><div style="margin-top:7px;color:#c5d0d6">Invitación a un equipo de selección</div></div><div style="background:#fff;padding:30px;border-radius:0 0 22px 22px"><h1 style="font-size:27px;margin:0 0 14px">Te invitaron a ${esc(companyName)}.</h1><p style="font-size:15px;line-height:1.6;color:#4d5c65">Vas a sumarte con el rol <b>${esc(roleLabel[role]||role)}</b>. Tu acceso es personal: no necesitás compartir contraseñas con nadie de la empresa.</p><p style="margin:26px 0"><a href="${inviteUrl}" style="display:inline-block;background:#d7ff43;color:#071827;text-decoration:none;padding:14px 19px;border-radius:13px;font-weight:800">Aceptar invitación</a></p><p style="font-size:12px;line-height:1.55;color:#7a8790">Si no esperabas esta invitación, podés ignorar este correo. El enlace vence automáticamente.</p></div></div></body></html>`
   const mail=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${resend}`,'Content-Type':'application/json'},body:JSON.stringify({from:'Postulá Mejor <no-reply@postulamejor.com>',to:[email],subject:`Invitación a ${companyName} en Postulá Mejor`,html})})
   emailSent=mail.ok
  }catch{}
 }
 return NextResponse.json({ok:true,invite:data,invite_url:invitePath,email_sent:emailSent})
}

export async function PATCH(req:NextRequest){
 const c=db(req)
 const {data:{user}}=await c.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const b=await req.json().catch(()=>({})),company=txt(b?.company_id,80),member=txt(b?.user_id,80),role=txt(b?.role,40),status=txt(b?.status,20)
 if(!company||!member||!['admin','recruiter','hiring_manager','viewer'].includes(role)||!['active','disabled'].includes(status))return NextResponse.json({ok:false,error:'Rol o estado inválido.'},{status:400})
 const {data,error}=await c.rpc('pm_update_company_member',{p_company_id:company,p_user_id:member,p_role:role,p_status:status})
 if(error)return NextResponse.json({ok:false,error:/owner role|forbidden/i.test(error.message)?'Ese cambio de permisos no está permitido.':error.message},{status:/owner role|forbidden/i.test(error.message)?403:400})
 return NextResponse.json({ok:true,member:first(data)})
}
