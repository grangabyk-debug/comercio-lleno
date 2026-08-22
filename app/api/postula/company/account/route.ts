import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'

function userDb(req:NextRequest){
 const auth=req.headers.get('authorization')||''
 return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})
}
function adminDb(){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY
 return key?createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null
}
function totalCredits(w:any){
 return Number(w?.free_remaining||0)+Number(w?.bonus_remaining||0)+Math.max(0,Number(w?.period_allowance||0)-Number(w?.period_used||0))+Number(w?.purchased_remaining||0)
}
const planLabel:Record<string,string>={gratis:'Gratis',impulso:'Impulso',seleccion:'Selección IA',escala:'Escala',empresa:'Empresa'}

export async function GET(req:NextRequest){
 const db=userDb(req)
 const {data:{user}}=await db.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})

 const requested=req.nextUrl.searchParams.get('company')||''
 let membershipQuery=db.from('pm_company_members').select('company_id,role,status,pm_companies(*)').eq('user_id',user.id).eq('status','active').limit(1)
 if(requested)membershipQuery=membershipQuery.eq('company_id',requested)
 const {data:memberships,error:memberError}=await membershipQuery
 if(memberError)return NextResponse.json({ok:false,error:memberError.message},{status:400})
 const membership=memberships?.[0] as any
 if(!membership?.company_id||!membership?.pm_companies)return NextResponse.json({ok:false,error:'Configurá tu empresa primero.',code:'needs_company'},{status:409})

 const companyId=String(membership.company_id)
 const admin=adminDb()
 if(!admin)return NextResponse.json({ok:false,error:'La Cuenta empresa no está disponible temporalmente.'},{status:503})

 const [memberRes,inviteRes,subRes,checkRes,walletRes,purchaseRes,supportRes]=await Promise.all([
  admin.from('pm_company_members').select('company_id,user_id,role,status,created_at').eq('company_id',companyId).order('created_at',{ascending:true}),
  admin.from('pm_company_invites').select('id,email,role,status,expires_at,created_at').eq('company_id',companyId).order('created_at',{ascending:false}).limit(25),
  admin.from('pm_company_subscriptions').select('plan,status,provider,current_period_end,created_at,updated_at,pending_plan,pending_started_at').eq('company_id',companyId).maybeSingle(),
  admin.from('pm_company_verification_checks').select('id,kind,status,checked_at,created_at').eq('company_id',companyId).order('created_at',{ascending:false}).limit(20),
  admin.from('pm_flex_credit_wallets').select('scope_key,free_remaining,bonus_remaining,period_allowance,period_used,period_expires_at,purchased_remaining').eq('scope_key',`company:${companyId}`).maybeSingle(),
  admin.from('pm_flex_credit_purchases').select('id,pack_code,credits,amount_ars,status,provider,credited_at,created_at').eq('company_id',companyId).order('created_at',{ascending:false}).limit(20),
  admin.from('pm_support_tickets').select('id,status,priority,created_at,last_message_at').eq('company_id',companyId).order('last_message_at',{ascending:false}).limit(30),
 ])

 const rawMembers=memberRes.data||[]
 const members=[] as any[]
 for(const member of rawMembers){
  let email:string|null=null
  try{const {data}=await admin.auth.admin.getUserById(String(member.user_id));email=data.user?.email||null}catch{}
  members.push({...member,email})
 }

 const subscription=subRes.data as any
 const activePlan=subscription?.status==='authorized'?String(subscription.plan||'gratis'):'gratis'
 const wallet=walletRes.data as any
 const support=supportRes.data||[]
 const company:any=membership.pm_companies

 return NextResponse.json({
  ok:true,
  company:{
   id:companyId,name:company.name,legal_name:company.legal_name||null,industry:company.industry||null,city:company.city||null,province:company.province||null,website:company.website||null,phone:company.phone||null,tax_id:company.tax_id||null,verification_status:company.verification_status||'basic',trust_score:Number(company.trust_score||0),description:company.description||null,
  },
  my_role:membership.role,
  team:{members,invites:inviteRes.data||[]},
  plan:{
   code:activePlan,label:planLabel[activePlan]||activePlan,status:subscription?.status||'inactive',provider:subscription?.provider||null,current_period_end:subscription?.current_period_end||null,pending_plan:subscription?.pending_plan||null,pending_started_at:subscription?.pending_started_at||null,nexo_enabled:subscription?.status==='authorized'&&['seleccion','escala','empresa'].includes(activePlan),
  },
  flex:{
   total:totalCredits(wallet),free:Number(wallet?.free_remaining||0),bonus:Number(wallet?.bonus_remaining||0),period_remaining:Math.max(0,Number(wallet?.period_allowance||0)-Number(wallet?.period_used||0)),purchased:Number(wallet?.purchased_remaining||0),period_expires_at:wallet?.period_expires_at||null,purchases:purchaseRes.data||[],
  },
  verification:{checks:checkRes.data||[]},
  support:{open:support.filter((x:any)=>!['resolved','closed'].includes(String(x.status))).length,urgent:support.filter((x:any)=>Number(x.priority)===1&&!['resolved','closed'].includes(String(x.status))).length,recent:support.slice(0,5)},
  billing:{fiscal_invoices_available:false,note:'Los pagos confirmados se muestran como historial de compras. La emisión de factura fiscal se incorporará como módulo separado cuando esté configurada.'},
 })
}
