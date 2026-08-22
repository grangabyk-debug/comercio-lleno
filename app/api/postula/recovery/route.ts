import {createHash} from 'crypto'
import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

export const runtime='nodejs'

const SUPABASE_URL='https://pejkycdttogpmmdntzuq.supabase.co'
const REDIRECT_TO='https://postulamejor.com/login?reset=1'
const GENERIC_MESSAGE='Si existe una cuenta con ese email, te enviamos un enlace para recuperar tu contraseña.'

function adminDb(){
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!key)return null
  return createClient(SUPABASE_URL,key,{auth:{persistSession:false,autoRefreshToken:false}})
}

function digest(value:string){
  const salt=process.env.SUPABASE_SERVICE_ROLE_KEY||'postula-mejor'
  return createHash('sha256').update(`${salt}:${value}`).digest('hex')
}

async function consumeLimit(db:ReturnType<typeof adminDb>,key:string,max:number){
  if(!db)return false
  const keyHash=digest(key)
  const now=new Date()
  const {data}=await db.from('pm_password_recovery_rate_limits').select('attempts,window_started_at').eq('key_hash',keyHash).maybeSingle()
  if(!data){
    const {error}=await db.from('pm_password_recovery_rate_limits').insert({key_hash:keyHash,attempts:1,window_started_at:now.toISOString(),updated_at:now.toISOString()})
    return !error
  }
  const started=new Date(String(data.window_started_at)).getTime()
  if(!Number.isFinite(started)||Date.now()-started>=60*60*1000){
    const {error}=await db.from('pm_password_recovery_rate_limits').update({attempts:1,window_started_at:now.toISOString(),updated_at:now.toISOString()}).eq('key_hash',keyHash)
    return !error
  }
  if(Number(data.attempts||0)>=max)return false
  const {error}=await db.from('pm_password_recovery_rate_limits').update({attempts:Number(data.attempts||0)+1,updated_at:now.toISOString()}).eq('key_hash',keyHash)
  return !error
}

function recoveryHtml(actionLink:string){
  return `<!doctype html><html><body style="margin:0;background:#f5f5f7;font-family:Arial,Helvetica,sans-serif;color:#17181d"><div style="padding:32px 16px"><div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e6e6eb;border-radius:22px;overflow:hidden"><div style="background:#11131a;padding:26px 30px"><div style="font-size:24px;font-weight:800;color:#fff">Postulá Mejor</div><div style="margin-top:6px;color:#c8cad2;font-size:13px">Seguridad de tu cuenta</div></div><div style="padding:34px 30px"><h1 style="margin:0 0 16px;font-size:27px;line-height:1.2;color:#17181d">Restablecé tu contraseña</h1><p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#555963">Recibimos una solicitud para cambiar la contraseña de tu cuenta de Postulá Mejor.</p><p style="margin:0 0 28px"><a href="${actionLink}" style="display:inline-block;background:#17181d;color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:15px 22px;border-radius:12px">Crear nueva contraseña</a></p><p style="margin:0;font-size:13px;line-height:1.65;color:#858995">Si vos no solicitaste este cambio, podés ignorar este correo. No compartas este enlace con nadie.</p><div style="margin-top:28px;padding-top:20px;border-top:1px solid #ececf0;font-size:12px;line-height:1.6;color:#989ba4">Este es un mensaje de seguridad de Postulá Mejor.<br>postulamejor.com</div></div></div></div></body></html>`
}

export async function POST(req:NextRequest){
  const db=adminDb()
  const resendKey=process.env.RESEND_API_KEY
  if(!db||!resendKey)return NextResponse.json({ok:false,error:'El servicio de recuperación no está disponible en este momento.'},{status:503})

  const body=await req.json().catch(()=>({}))
  const email=String(body?.email||'').trim().toLowerCase()
  if(!/^\S+@\S+\.\S+$/.test(email))return NextResponse.json({ok:false,error:'Ingresá un email válido.'},{status:400})

  const forwarded=req.headers.get('x-forwarded-for')||''
  const ip=forwarded.split(',')[0]?.trim()||req.headers.get('x-real-ip')||'unknown'
  const [ipAllowed,emailAllowed]=await Promise.all([
    consumeLimit(db,`ip:${ip}`,10),
    consumeLimit(db,`email:${email}`,5),
  ])
  if(!ipAllowed||!emailAllowed)return NextResponse.json({ok:false,error:'Ya pediste varios recuperos. Esperá un rato antes de volver a intentarlo.'},{status:429})

  try{
    const {data,error}=await db.auth.admin.generateLink({type:'recovery',email,options:{redirectTo:REDIRECT_TO}})
    const actionLink=data?.properties?.action_link
    if(!error&&actionLink){
      await fetch('https://api.resend.com/emails',{
        method:'POST',
        headers:{Authorization:`Bearer ${resendKey}`,'Content-Type':'application/json'},
        body:JSON.stringify({
          from:'Postulá Mejor <no-reply@postulamejor.com>',
          to:[email],
          subject:'Restablecé tu contraseña de Postulá Mejor',
          html:recoveryHtml(actionLink),
          text:`Postulá Mejor\n\nRecibimos una solicitud para cambiar la contraseña de tu cuenta.\n\nCreá una nueva contraseña desde este enlace:\n${actionLink}\n\nSi vos no solicitaste este cambio, podés ignorar este correo.`,
        }),
      })
    }
  }catch{}

  return NextResponse.json({ok:true,message:GENERIC_MESSAGE})
}
