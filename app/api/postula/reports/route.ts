import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const ADMIN_EMAIL='grangabyk@gmail.com'
const reasons=new Set(['scam','harassment','discrimination','sensitive_data','unsafe','spam','impersonation','other'])
const clean=(v:unknown,n=1200)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,n)
function db(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}

async function sendAlert(report:any,summary:string){
 const apiKey=process.env.RESEND_API_KEY;if(!apiKey)return false
 try{
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from:'Postulá Mejor <no-reply@postulamejor.com>',to:[ADMIN_EMAIL],subject:`[ALERTA MODERACIÓN] ${report.reason} · Postulá Mejor`,text:`Se recibió un nuevo reporte de seguridad en Postulá Mejor.\n\nID: ${report.id}\nMotivo: ${report.reason}\nSeveridad: ${report.severity}\nConversación: ${report.conversation_id||'-'}\nPublicación Flex: ${report.flex_post_id||'-'}\nPostulación: ${report.application_id||'-'}\nDetalle: ${summary||'Sin aclaración adicional'}\n\nRevisar el caso con prioridad y preservar el registro antes de aplicar una medida.`})})
  return r.ok
 }catch{return false}
}

export async function POST(req:NextRequest){
 const c=db(req);const {data:{user}}=await c.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión para reportar.'},{status:401})
 const b=await req.json().catch(()=>({}));const conversationId=clean(b?.conversation_id,80),messageId=clean(b?.message_id,80),reason=clean(b?.reason,40),details=clean(b?.details,1200)
 if(!conversationId||!reasons.has(reason))return NextResponse.json({ok:false,error:'Elegí un motivo válido para el reporte.'},{status:400})
 const {data:conv,error:cErr}=await c.from('pm_conversations').select('id,application_id,flex_post_id,candidate_user_id,publisher_user_id,company_id,conversation_kind').eq('id',conversationId).maybeSingle();if(cErr||!conv)return NextResponse.json({ok:false,error:'No pudimos verificar esta conversación.'},{status:403})
 let reportedUser:string|null=null
 if(messageId){const {data:m}=await c.from('pm_messages').select('sender_user_id').eq('id',messageId).eq('conversation_id',conversationId).maybeSingle();if(m&&String(m.sender_user_id)!==user.id)reportedUser=String(m.sender_user_id)}
 if(!reportedUser){if(String(conv.candidate_user_id)===user.id)reportedUser=conv.publisher_user_id?String(conv.publisher_user_id):null;else reportedUser=String(conv.candidate_user_id)}
 const severity=['scam','sensitive_data','unsafe','impersonation'].includes(reason)?'high':reason==='harassment'||reason==='discrimination'?'high':'normal'
 const row={reporter_user_id:user.id,conversation_id:conversationId,message_id:messageId||null,reported_user_id:reportedUser,flex_post_id:conv.flex_post_id||null,application_id:conv.application_id||null,reason,details:details||null,severity,status:'open',context:{kind:conv.conversation_kind,company_id:conv.company_id||null}}
 const {data:report,error}=await c.from('pm_moderation_reports').insert(row).select('*').single();if(error)return NextResponse.json({ok:false,error:'No pudimos registrar el reporte. Intentá nuevamente.'},{status:400})
 const alertSent=await sendAlert(report,details)
 return NextResponse.json({ok:true,report_id:report.id,alert_sent:alertSent,message:'Recibimos tu reporte. Lo vamos a revisar con prioridad y podemos limitar la cuenta o la publicación mientras investigamos si corresponde.'})
}
