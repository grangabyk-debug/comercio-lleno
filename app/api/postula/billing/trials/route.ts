import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://postulamejor.supabase.co'
const DAY=24*60*60*1000

function adminDb(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;return key?createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}

async function sendReminderEmail(email:string,plan:string,days:number){
 const key=process.env.RESEND_API_KEY
 if(!key||!email)return
 const amount=plan==='seleccion'?'$34.900':'$18.900'
 await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from:'Postulá Mejor <no-reply@postulamejor.com>',to:[email],subject:`Tu prueba de ${plan==='seleccion'?'Selección IA':'Impulso'} vence en ${days} ${days===1?'día':'días'}`,html:`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>Tu período gratis está por terminar</h2><p>Te quedan <b>${days} ${days===1?'día':'días'}</b> de tu plan ${plan==='seleccion'?'Selección IA':'Impulso'}.</p><p>Después del período gratuito, el valor es <b>${amount} por mes</b>. Si no continuás, tu empresa vuelve automáticamente al plan Gratis y no se realiza ningún cobro automático.</p><p>Podés administrar el plan desde tu panel de Postulá Mejor Empresas.</p></div>`}),cache:'no-store'}).catch(()=>null)
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
  const {data:members}=await admin.from('pm_company_members').select('user_id').eq('company_id',row.company_id).eq('status','active').in('role',['owner','admin'])
  for(const member of members||[]){
   const payload={company_id:row.company_id,trial_end:row.current_period_end,plan:row.plan}
   const {data:already}=await admin.from('pm_notifications').select('id').eq('user_id',member.user_id).eq('notification_type','trial_expiring').contains('payload',payload).limit(1)
   if(already?.length)continue
   await admin.from('pm_notifications').insert({user_id:member.user_id,notification_type:'trial_expiring',title:'Tu prueba gratis está por terminar',body:`Quedan ${days} ${days===1?'día':'días'} de ${row.plan==='seleccion'?'Selección IA':'Impulso'}. Si no continuás, volvés automáticamente al plan Gratis.`,payload})
   const {data:userData}=await admin.auth.admin.getUserById(member.user_id)
   const email=userData?.user?.email||''
   if(email)await sendReminderEmail(email,String(row.plan||''),days)
   reminded++
  }
 }
 return NextResponse.json({ok:true,checked:(rows||[]).length,expired,reminded})
}
