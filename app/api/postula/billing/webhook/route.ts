import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const BILLING_API='https://wtcntclzcubkbtcsqkzc.supabase.co/functions/v1/postula-company-purchase'
const VALID_PLANS=new Set(['impulso','seleccion','escala'])
function adminDb(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;return key?createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}

export async function POST(req:NextRequest){
 const admin=adminDb()
 if(!admin)return NextResponse.json({ok:false,error:'Billing no configurado.'},{status:503})
 const body=await req.json().catch(()=>({}))
 const id=String(req.nextUrl.searchParams.get('id')||body?.data?.id||body?.id||'').trim()
 if(!id)return NextResponse.json({ok:true,ignored:true})

 const verifyResponse=await fetch(`${BILLING_API}?action=verify`,{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({id}),
  cache:'no-store',
 })
 const payload=await verifyResponse.json().catch(()=>({}))
 if(!verifyResponse.ok)return NextResponse.json({ok:false,error:payload?.error||'No pudimos verificar la suscripción.'},{status:502})
 if(payload?.ignored)return NextResponse.json({ok:true,ignored:true})

 const companyId=String(payload?.company_id||'')
 const plan=String(payload?.plan||'')
 const mpStatus=String(payload?.status||'pending')
 if(!companyId||!VALID_PLANS.has(plan))return NextResponse.json({ok:true,ignored:true})

 const {data:existing}=await admin.from('pm_company_subscriptions').select('*').eq('company_id',companyId).maybeSingle()
 const now=new Date().toISOString()
 if(mpStatus==='authorized'){
  const {error}=await admin.from('pm_company_subscriptions').upsert({company_id:companyId,plan,status:'authorized',provider:'mercadopago',provider_subscription_id:id,pending_plan:null,pending_provider_subscription_id:null,pending_started_at:null,updated_at:now},{onConflict:'company_id'})
  if(error)return NextResponse.json({ok:false,error:error.message},{status:500})
 }else if(existing?.pending_provider_subscription_id===id&&mpStatus==='cancelled'){
  const {error}=await admin.from('pm_company_subscriptions').update({pending_plan:null,pending_provider_subscription_id:null,pending_started_at:null,updated_at:now}).eq('company_id',companyId)
  if(error)return NextResponse.json({ok:false,error:error.message},{status:500})
 }
 return NextResponse.json({ok:true,status:mpStatus})
}
