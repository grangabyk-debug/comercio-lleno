import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const VALID_PLANS=new Set(['impulso','seleccion','escala'])
function adminDb(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;return key?createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}
function normalize(status:string){return ['authorized','pending','paused','cancelled'].includes(status)?status:'pending'}

export async function POST(req:NextRequest){
 const token=process.env.POSTULA_MERCADOPAGO_ACCESS_TOKEN
 const admin=adminDb()
 if(!token||!admin)return NextResponse.json({ok:false,error:'Billing no configurado.'},{status:503})
 const body=await req.json().catch(()=>({}))
 const id=String(req.nextUrl.searchParams.get('id')||body?.data?.id||body?.id||'').trim()
 if(!id)return NextResponse.json({ok:true,ignored:true})
 const response=await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(id)}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'})
 const payload=await response.json().catch(()=>({}))
 if(!response.ok)return NextResponse.json({ok:false,error:'No pudimos verificar la suscripción.'},{status:502})
 const reference=String(payload?.external_reference||'')
 const parts=reference.split(':')
 if(parts.length!==4||parts[0]!=='postula'||!VALID_PLANS.has(parts[3]))return NextResponse.json({ok:true,ignored:true})
 const companyId=parts[2],plan=parts[3]
 const mpStatus=normalize(String(payload?.status||'pending'))
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
