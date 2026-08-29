import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://postulamejor.supabase.co'
const DAY=24*60*60*1000

function adminDb(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;return key?createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}

async function sendReminderEmail(email:string,plan:string,days:number){
 const key=process.env.RESEND_API_KEY
 if(!key||!email)return
 const amount=plan==='seleccion'?'$34.900':'$18.900'
 const label=plan==='seleccion'?'Selección IA':'Impulso'
 const continueUrl=`https://postulamejor.com/empresas/continuar?plan=${encodeURIComponent(plan)}`
 await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from:'Postulá Mejor <no-reply@postulamejor.com>',to:[email],subject:`Tu prueba de ${label} vence en ${days} ${days===1?'día':'días'}`,html:`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111821"><h2>Tu período gratis está por terminar</h2><p>Te quedan <b>${days} ${days===1?'día':'días'}</b> de tu plan ${label}.</p><p>Después del período gratuito, el valor es <b>${amount} por mes</b>. Si querés mantenerlo, recién ahora podés continuar con el pago. Si no hacés nada, tu empresa vuelve automáticamente al plan Gratis y no se realiza ningún cobro.</p><p style="margin:26px 0"><a href="${continueUrl}" style="display:inline-block;padding:14px 20px;border-radius:12px;background:#d9ff59;color:#111821;text-decoration:none;font-weight:800">Continuar con ${label}</a></p><p style="font-size:12px;color:#68737c">El enlace te lleva a Postulá Mejor Empresas y, después de verificar tu sesión, te permite continuar con Mercado Pago.</p></div>`}),cache:'no-store'}).catch(()=>null)
}

export async function GET(){
 const admin=adminDb()
 if(!admin)return NextResponse.json({ok:false,error:'Service role no configurado.'},{status:503})
 const now=Date.now(),limit=new Date(now+3*DAY).toISOString()
 const {data:rows,error}=await admin.from('pm_company_subscriptions').select('company_id,plan,status,provider,current_period_end').eq('provider','trial').eq('status','authorized').lte('current_period_end',limit)
 if(error)return NextResponse.json({ok:false,error:error.message},{status:500})
 let expired=0,reminded=0
 for(const row of rows||[]){
  if(!row.current_period_end)continue
  const end=new Date(row.current_period_end).getTime()
  if(end<=now){
   await admin.from('pm_company_subscriptions').update({plan:'gratis',status:'inactive',updated_at:new Date().toISOString()}).eq('company_id',row.company_id)
   expired++
   continue
  }
  const days=Math.max(1,Math.ceil((end-now)/DAY))
  const plan=String(row.plan||'impulso')
  const continueUrl=`https://postulamejor.com/empresas/continuar?plan=${encodeURIComponent(plan)}`
  const {data:members}=await admin.from('pm_company_members').select('user_id').eq('company_id',row.company_id).eq('status','active').in('role',['owner','admin'])
  for(const member of members||[]){
   const payload={company_id:row.company_id,trial_end:row.current_period_end,plan,action_url:continueUrl}
   const {data:already}=await admin.from('pm_notifications').select('id').eq('user_id',member.user_id).eq('notification_type','trial_expiring').contains('payload',{company_id:row.company_id,trial_end:row.current_period_end,plan}).limit(1)
   if(already?.length)continue
   await admin.from('pm_notifications').insert({user_id:member.user_id,notification_type:'trial_expiring',title:'Tu prueba gratis está por terminar',body:`Quedan ${days} ${days===1?'día':'días'} de ${plan==='seleccion'?'Selección IA':'Impulso'}. Continuá desde el aviso si querés mantener el plan; si no, volvés automáticamente a Gratis.`,payload})
   const {data:userData}=await admin.auth.admin.getUserById(member.user_id)
   const email=userData?.user?.email||''
   if(email)await sendReminderEmail(email,plan,days)
   reminded++
  }
 }
 return NextResponse.json({ok:true,checked:(rows||[]).length,expired,reminded})
}
