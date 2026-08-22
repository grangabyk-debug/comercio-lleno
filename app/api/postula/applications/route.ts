import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
function db(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
const txt=(v:unknown,n=4000)=>String(v??'').trim().slice(0,n)
function first<T>(value:T|T[]|null|undefined){return Array.isArray(value)?value[0]??null:value??null}

export async function GET(req:NextRequest){
 const c=db(req)
 const {data:{user}}=await c.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const company=req.nextUrl.searchParams.get('company')||''
 const mine=req.nextUrl.searchParams.get('mine')==='1'
 if(mine){
  const {data,error}=await c.from('pm_applications').select('id,job_id,status,cover_letter,candidate_snapshot,submitted_at,created_at,updated_at,pm_jobs(title,company_id)').eq('candidate_user_id',user.id).order('created_at',{ascending:false})
  if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
  return NextResponse.json({ok:true,applications:data||[]})
 }
 if(!company)return NextResponse.json({ok:false,error:'Empresa inválida.'},{status:400})
 const {data,error}=await c.from('pm_applications').select('id,job_id,candidate_user_id,resume_path,cover_letter,status,candidate_snapshot,submitted_at,created_at,updated_at,pm_jobs!inner(id,title,company_id),pm_candidate_matches(score,reasons,missing_evidence,model_version)').eq('pm_jobs.company_id',company).order('created_at',{ascending:false}).limit(500)
 if(error)return NextResponse.json({ok:false,error:error.message},{status:403})
 return NextResponse.json({ok:true,applications:data||[]})
}

export async function POST(req:NextRequest){
 const c=db(req)
 const {data:{user}}=await c.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const b=await req.json().catch(()=>({}))
 const job=txt(b?.job_id,80),resume=txt(b?.resume_path,500),letter=txt(b?.cover_letter,5000)
 if(!job)return NextResponse.json({ok:false,error:'Oferta inválida.'},{status:400})
 if(resume&&!resume.startsWith(`${user.id}/`))return NextResponse.json({ok:false,error:'El CV no pertenece a esta cuenta.'},{status:403})
 const snapshot={display_name:txt(b?.name,100),phone:txt(b?.phone,60),city:txt(b?.city,120),availability:txt(b?.availability,120),experience:txt(b?.experience,180),expected_salary:txt(b?.expected_salary,80)}
 const {data,error}=await c.rpc('pm_submit_application',{p_job_id:job,p_resume_path:resume||null,p_cover_letter:letter||null,p_candidate_snapshot:snapshot})
 if(error){const message=/job unavailable/i.test(error.message)?'La oferta no está disponible.':error.message;return NextResponse.json({ok:false,error:message},{status:/job unavailable/i.test(error.message)?404:400})}
 return NextResponse.json({ok:true,application:first(data)})
}

export async function PATCH(req:NextRequest){
 const c=db(req)
 const {data:{user}}=await c.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const b=await req.json().catch(()=>({})),id=txt(b?.id,80),status=txt(b?.status,30)
 if(!id||!['viewed','shortlist','interview','rejected','hired','withdrawn'].includes(status))return NextResponse.json({ok:false,error:'Estado inválido.'},{status:400})
 const {data,error}=await c.rpc('pm_set_application_status',{p_application_id:id,p_status:status})
 if(error)return NextResponse.json({ok:false,error:/forbidden/i.test(error.message)?'No tenés permiso para cambiar esta etapa.':error.message},{status:/forbidden/i.test(error.message)?403:400})
 return NextResponse.json({ok:true,application:first(data)})
}
