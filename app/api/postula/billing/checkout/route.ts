import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://postulamejor.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const BILLING_API='https://wtcntclzcubkbtcsqkzc.supabase.co/functions/v1/postula-company-purchase'
const SYNC_API='https://postulamejor.supabase.co/functions/v1/postula-company-billing-sync'
const PLAN={impulso:{label:'Impulso',amount:18900},seleccion:{label:'Selección IA',amount:34900}} as const

type PlanId=keyof typeof PLAN
function userDb(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
function adminDb(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;return key?createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}

export async function POST(req:NextRequest){
 const auth=req.headers.get('authorization')||''
 const client=userDb(req)
 const {data:{user}}=await client.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Primero creá o iniciá sesión con tu cuenta de empresa.'},{status:401})
 const body=await req.json().catch(()=>({}))
 const plan=String(body?.plan||'') as PlanId
 const mode=String(body?.mode||'trial')
 if(!(plan in PLAN))return NextResponse.json({ok:false,error:'Ese plan no está disponible en este momento.'},{status:400})
 const {data:members,error}=await client.from('pm_company_members').select('company_id,role,status').eq('user_id',user.id).eq('status','active').in('role',['owner','admin']).limit(1)
 if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
 const companyId=members?.[0]?.company_id
 if(!companyId)return NextResponse.json({ok:false,code:'needs_company',error:'Primero terminá de configurar tu empresa.'},{status:409})

 if(mode==='payment'){
  const chosen=PLAN[plan]
  const response=await fetch(`${BILLING_API}?action=checkout`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:auth},body:JSON.stringify({plan,email:user.email,user_id:user.id,company_id:companyId}),cache:'no-store'})
  const payload=await response.json().catch(()=>({}))
  if(!response.ok||!payload?.init_point||!payload?.preapproval_id)return NextResponse.json({ok:false,error:payload?.error||'No pudimos iniciar el pago del plan.'},{status:502})
  if(Number(payload?.price)!==chosen.amount)return NextResponse.json({ok:false,error:'No pudimos validar el importe del plan.'},{status:502})
  const syncResponse=await fetch(SYNC_API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:auth},body:JSON.stringify({id:String(payload.preapproval_id)}),cache:'no-store'})
  const syncPayload=await syncResponse.json().catch(()=>({}))
  if(!syncResponse.ok||!syncPayload?.ok)return NextResponse.json({ok:false,error:syncPayload?.error||'No pudimos preparar el plan para el pago. No se realizó ningún cargo desde Postulá Mejor.'},{status:502})
  if(String(syncPayload.company_id||'')!==String(companyId)||String(syncPayload.plan||'')!==plan)return NextResponse.json({ok:false,error:'No pudimos validar la suscripción creada.'},{status:409})
  return NextResponse.json({ok:true,plan,init_point:String(payload.init_point),preapproval_id:String(payload.preapproval_id),payment:true})
 }

 const admin=adminDb()
 if(!admin)return NextResponse.json({ok:false,error:'No pudimos activar el período gratis ahora.'},{status:503})
 const {data:existing}=await admin.from('pm_company_subscriptions').select('*').eq('company_id',companyId).maybeSingle()
 if(existing?.provider==='trial'&&existing?.current_period_end){
  const end=new Date(existing.current_period_end).getTime()
  if(end>Date.now()&&existing.status==='authorized')return NextResponse.json({ok:true,plan:existing.plan,trial:true,current_period_end:existing.current_period_end,already_active:true})
  return NextResponse.json({ok:false,code:'trial_used',error:'El período gratuito de 30 días de esta empresa ya fue utilizado. La cuenta permanece en el plan Gratis hasta continuar con un plan pago.'},{status:409})
 }
 const now=new Date(),trialEnd=new Date(now.getTime()+30*24*60*60*1000)
 const row={company_id:companyId,plan,status:'authorized',provider:'trial',provider_subscription_id:null,current_period_end:trialEnd.toISOString(),pending_plan:null,pending_provider_subscription_id:null,pending_started_at:null,updated_at:now.toISOString()}
 const {error:saveError}=await admin.from('pm_company_subscriptions').upsert(row,{onConflict:'company_id'})
 if(saveError)return NextResponse.json({ok:false,error:saveError.message},{status:400})
 return NextResponse.json({ok:true,plan,trial:true,current_period_end:trialEnd.toISOString(),price_after_trial:PLAN[plan].amount})
}
