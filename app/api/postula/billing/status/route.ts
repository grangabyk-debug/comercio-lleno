import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const ELIGIBLE=new Set(['seleccion'])
function userDb(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
function adminDb(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;return key?createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}
function normalize(status:string){return ['authorized','pending','paused','cancelled'].includes(status)?status:'pending'}

async function normalizeTrial(row:any){
 if(!row||row.provider!=='trial'||row.status!=='authorized'||!row.current_period_end)return row
 if(new Date(row.current_period_end).getTime()>Date.now())return row
 const admin=adminDb();if(!admin)return {...row,plan:'gratis',status:'inactive'}
 const next={...row,plan:'gratis',status:'inactive',updated_at:new Date().toISOString()}
 await admin.from('pm_company_subscriptions').update({plan:'gratis',status:'inactive',updated_at:next.updated_at}).eq('company_id',row.company_id)
 return next
}

async function refreshPending(row:any){
 const token=process.env.POSTULA_MERCADOPAGO_ACCESS_TOKEN
 const admin=adminDb()
 if(!row?.pending_provider_subscription_id||!token||!admin)return row
 try{
  const response=await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(String(row.pending_provider_subscription_id))}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'})
  const payload=await response.json().catch(()=>({}))
  if(!response.ok)return row
  const mpStatus=normalize(String(payload?.status||'pending'))
  if(mpStatus==='authorized'&&row.pending_plan){
   const next={...row,plan:row.pending_plan,status:'authorized',provider:'mercadopago',provider_subscription_id:row.pending_provider_subscription_id,pending_plan:null,pending_provider_subscription_id:null,pending_started_at:null,updated_at:new Date().toISOString()}
   await admin.from('pm_company_subscriptions').upsert(next,{onConflict:'company_id'})
   return next
  }
  if(mpStatus==='cancelled'){
   const next={...row,pending_plan:null,pending_provider_subscription_id:null,pending_started_at:null,updated_at:new Date().toISOString()}
   await admin.from('pm_company_subscriptions').upsert(next,{onConflict:'company_id'})
   return next
  }
 }catch{}
 return row
}

export async function GET(req:NextRequest){
 const client=userDb(req)
 const {data:{user}}=await client.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const requested=req.nextUrl.searchParams.get('company')
 let membershipQuery=client.from('pm_company_members').select('company_id').eq('user_id',user.id).eq('status','active').limit(1)
 if(requested)membershipQuery=membershipQuery.eq('company_id',requested)
 const {data:members,error:memberError}=await membershipQuery
 if(memberError)return NextResponse.json({ok:false,error:memberError.message},{status:400})
 const companyId=members?.[0]?.company_id
 if(!companyId)return NextResponse.json({ok:false,code:'needs_company',error:'Configurá tu empresa para consultar el plan.'},{status:409})
 const {data:raw,error}=await client.from('pm_company_subscriptions').select('*').eq('company_id',companyId).maybeSingle()
 if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
 let row=await normalizeTrial(raw)
 row=await refreshPending(row)
 const activePlan=row?.status==='authorized'?String(row.plan||'gratis'):'gratis'
 const trialActive=Boolean(row?.provider==='trial'&&row?.status==='authorized'&&row?.current_period_end)
 const remaining=trialActive?Math.max(0,Math.ceil((new Date(row.current_period_end).getTime()-Date.now())/(24*60*60*1000))):0
 return NextResponse.json({ok:true,company_id:companyId,plan:activePlan,status:row?.status||'inactive',pending_plan:row?.pending_plan||null,pending_started_at:row?.pending_started_at||null,trial:trialActive?{active:true,ends_at:row.current_period_end,days_remaining:remaining}:null,nexo_enabled:row?.status==='authorized'&&ELIGIBLE.has(String(row.plan||''))})
}
