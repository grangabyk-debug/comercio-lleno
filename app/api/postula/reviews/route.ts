import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
function db(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
function first<T>(value:T|T[]|null|undefined){return Array.isArray(value)?value[0]??null:value??null}
const txt=(v:unknown,n=1000)=>String(v??'').trim().slice(0,n)

async function context(req:NextRequest,applicationId:string){
 const c=db(req)
 const {data:{user}}=await c.auth.getUser()
 if(!user)return{error:NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})}
 const {data:application,error}=await c.from('pm_applications').select('id,job_id,candidate_user_id,status,hired_at,pm_jobs(id,title,company_id,pm_companies(name))').eq('id',applicationId).maybeSingle()
 if(error||!application)return{error:NextResponse.json({ok:false,error:'No encontramos esa contratación.'},{status:404})}
 const job=first((application as any).pm_jobs) as any
 const companyId=String(job?.company_id||'')
 let viewerRole:'candidate'|'employer'|null=(application as any).candidate_user_id===user.id?'candidate':null
 if(!viewerRole&&companyId){
  const {data:membership}=await c.from('pm_company_members').select('company_id').eq('company_id',companyId).eq('user_id',user.id).eq('status','active').maybeSingle()
  if(membership)viewerRole='employer'
 }
 if(!viewerRole)return{error:NextResponse.json({ok:false,error:'No tenés acceso a esta experiencia laboral.'},{status:403})}
 return{c,user,application:application as any,job,companyId,viewerRole}
}

async function payload(req:NextRequest,applicationId:string){
 const ctx=await context(req,applicationId)
 if('error' in ctx)return ctx.error
 const {c,application,job,viewerRole}=ctx
 const hiredAt=application.hired_at?new Date(application.hired_at):null
 const editableUntil=hiredAt?new Date(hiredAt.getTime()+10*24*60*60*1000):null
 const open=Boolean(application.status==='hired'&&editableUntil&&editableUntil.getTime()>Date.now())
 const {data:reviews}=await c.from('pm_employment_reviews').select('id,direction,rating,comment,reply_body,editable_until,created_at,updated_at').eq('application_id',applicationId)
 const mineDirection=viewerRole==='candidate'?'candidate_to_company':'employer_to_candidate'
 const mine=(reviews||[]).find((r:any)=>r.direction===mineDirection)||null
 const other=(reviews||[]).find((r:any)=>r.direction!==mineDirection)||null
 return NextResponse.json({ok:true,application_id:applicationId,status:application.status,hired_at:application.hired_at||null,editable_until:editableUntil?.toISOString()||null,can_review:open,viewer_role:viewerRole,job_title:job?.title||'Experiencia laboral',company_name:first(job?.pm_companies)?.name||'Empresa',mine,other})
}

export async function GET(req:NextRequest){
 const id=txt(req.nextUrl.searchParams.get('application_id'),80)
 if(!id)return NextResponse.json({ok:false,error:'Falta la contratación.'},{status:400})
 return payload(req,id)
}

export async function POST(req:NextRequest){
 const body=await req.json().catch(()=>({}))
 const applicationId=txt(body?.application_id,80)
 if(!applicationId)return NextResponse.json({ok:false,error:'Falta la contratación.'},{status:400})
 const ctx=await context(req,applicationId)
 if('error' in ctx)return ctx.error
 const {c}=ctx
 const action=txt(body?.action,20)
 if(action==='review'){
  const rating=Number(body?.rating)
  const comment=txt(body?.comment,1200)
  if(!Number.isInteger(rating)||rating<1||rating>5)return NextResponse.json({ok:false,error:'Elegí una calificación entre 1 y 5.'},{status:400})
  const {error}=await c.rpc('pm_submit_employment_review',{p_application_id:applicationId,p_rating:rating,p_comment:comment})
  if(error)return NextResponse.json({ok:false,error:/window closed/i.test(error.message)?'El plazo de 10 días ya terminó.':error.message},{status:400})
  return payload(req,applicationId)
 }
 if(action==='reply'){
  const reviewId=txt(body?.review_id,80),reply=txt(body?.reply,1200)
  if(!reviewId||!reply)return NextResponse.json({ok:false,error:'Escribí una observación antes de guardar.'},{status:400})
  const {error}=await c.rpc('pm_reply_employment_review',{p_review_id:reviewId,p_reply:reply})
  if(error)return NextResponse.json({ok:false,error:/window closed/i.test(error.message)?'El plazo de 10 días ya terminó.':error.message},{status:400})
  return payload(req,applicationId)
 }
 return NextResponse.json({ok:false,error:'Acción inválida.'},{status:400})
}
