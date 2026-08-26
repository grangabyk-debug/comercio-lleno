import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const BILLING_API='https://wtcntclzcubkbtcsqkzc.supabase.co/functions/v1/postula-company-purchase'
const PLAN={
 impulso:{label:'Impulso',amount:18900},
 seleccion:{label:'Selección IA',amount:34900},
 escala:{label:'Escala',amount:74900},
} as const

type PaidPlan=keyof typeof PLAN
function db(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
function adminDb(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;return key?createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}

export async function POST(req:NextRequest){
 const client=db(req)
 const {data:{user}}=await client.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Primero creá o iniciá sesión con tu cuenta de empresa.'},{status:401})
 const body=await req.json().catch(()=>({}))
 const plan=String(body?.plan||'') as PaidPlan
 if(!(plan in PLAN))return NextResponse.json({ok:false,error:'Plan inválido.'},{status:400})
 const {data:members,error}=await client.from('pm_company_members').select('company_id,status').eq('user_id',user.id).eq('status','active').limit(1)
 if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
 const companyId=members?.[0]?.company_id
 if(!companyId)return NextResponse.json({ok:false,code:'needs_company',error:'Primero completá la configuración de tu empresa.'},{status:409})
 const admin=adminDb()
 if(!admin)return NextResponse.json({ok:false,code:'billing_not_configured',error:'No pudimos preparar el cambio de plan ahora. Probá nuevamente en unos instantes.'},{status:503})

 const chosen=PLAN[plan]
 const response=await fetch(`${BILLING_API}?action=checkout`,{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({plan,email:user.email,user_id:user.id,company_id:companyId}),
  cache:'no-store',
 })
 const payload=await response.json().catch(()=>({}))
 if(!response.ok||!payload?.init_point||!payload?.preapproval_id)return NextResponse.json({ok:false,error:payload?.error||'No pudimos iniciar el pago del plan.'},{status:502})
 if(Number(payload?.price)!==chosen.amount)return NextResponse.json({ok:false,error:'No pudimos validar el importe del plan.'},{status:502})

 const {data:existing}=await admin.from('pm_company_subscriptions').select('plan,status,provider_subscription_id').eq('company_id',companyId).maybeSingle()
 const {error:saveError}=await admin.from('pm_company_subscriptions').upsert({
  company_id:companyId,
  plan:existing?.plan||'gratis',
  status:existing?.status||'inactive',
  provider:'mercadopago',
  provider_subscription_id:existing?.provider_subscription_id||null,
  pending_plan:plan,
  pending_provider_subscription_id:String(payload.preapproval_id),
  pending_started_at:new Date().toISOString(),
  updated_at:new Date().toISOString(),
 },{onConflict:'company_id'})
 if(saveError)return NextResponse.json({ok:false,error:'No pudimos guardar el cambio de plan. No se realizó ningún cargo desde Postulá Mejor.'},{status:500})
 return NextResponse.json({ok:true,plan,init_point:String(payload.init_point),preapproval_id:String(payload.preapproval_id)})
}
