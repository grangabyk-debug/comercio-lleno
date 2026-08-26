import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
function db(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
const txt=(v:unknown,n=4000)=>String(v??'').trim().slice(0,n)
function first<T>(value:T|T[]|null|undefined){return Array.isArray(value)?value[0]??null:value??null}
const revealStatuses=new Set(['shortlist','interview','hired'])
function rep(row:any){return{count:Number(row?.review_count||0),average:row?.average_rating==null?null:Number(row.average_rating),indicator:String(row?.indicator||'forming')}}
async function companyReputation(c:ReturnType<typeof db>,id?:string){if(!id)return rep(null);const {data}=await c.rpc('pm_public_company_reputation',{p_company_id:id});return rep(first(data as any))}
async function candidateReputation(c:ReturnType<typeof db>,id?:string){if(!id)return rep(null);const {data}=await c.rpc('pm_public_candidate_reputation',{p_candidate_user_id:id});return rep(first(data as any))}

export async function GET(req:NextRequest){
 const c=db(req)
 const {data:{user}}=await c.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const company=req.nextUrl.searchParams.get('company')||''
 const mine=req.nextUrl.searchParams.get('mine')==='1'
 if(mine){
  const {data,error}=await c.from('pm_applications').select('id,job_id,status,hired_at,cover_letter,candidate_snapshot,submitted_at,created_at,updated_at,pm_jobs(title,area,location_text,work_mode,schedule,compensation_text,description,requirements,status,company_id,employer_visibility,pm_companies(name))').eq('candidate_user_id',user.id).order('created_at',{ascending:false})
  if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
  const cache=new Map<string,any>()
  const rows=await Promise.all((data||[]).map(async(row:any)=>{
   const job=first(row.pm_jobs) as any,companyRow=first(job?.pm_companies) as any
   if(job?.employer_visibility==='confidential'&&!revealStatuses.has(String(row.status||'')))return {...row,company_reputation:null,pm_jobs:{...job,pm_companies:{name:`Empresa · ${job?.area||'identidad reservada'}`},identity_revealed:false}}
   const companyId=String(job?.company_id||'')
   if(companyId&&!cache.has(companyId))cache.set(companyId,await companyReputation(c,companyId))
   return {...row,company_reputation:cache.get(companyId)||rep(null),pm_jobs:{...job,pm_companies:companyRow,identity_revealed:true}}
  }))
  return NextResponse.json({ok:true,applications:rows})
 }
 if(!company)return NextResponse.json({ok:false,error:'Empresa inválida.'},{status:400})
 const {data,error}=await c.from('pm_applications').select('id,job_id,candidate_user_id,resume_path,cover_letter,status,hired_at,candidate_snapshot,submitted_at,created_at,updated_at,pm_jobs!inner(id,title,company_id),pm_candidate_matches(score,reasons,missing_evidence,model_version)').eq('pm_jobs.company_id',company).order('created_at',{ascending:false}).limit(500)
 if(error)return NextResponse.json({ok:false,error:error.message},{status:403})
 const cache=new Map<string,any>()
 const rows=await Promise.all((data||[]).map(async(row:any)=>{const id=String(row.candidate_user_id||'');if(id&&!cache.has(id))cache.set(id,await candidateReputation(c,id));return{...row,candidate_reputation:cache.get(id)||rep(null)}}))
 return NextResponse.json({ok:true,applications:rows})
}

export async function POST(req:NextRequest){
 const c=db(req)
 const {data:{user}}=await c.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const b=await req.json().catch(()=>({}))
 const job=txt(b?.job_id,80),resume=txt(b?.resume_path,500),letter=txt(b?.cover_letter,5000)
 if(!job)return NextResponse.json({ok:false,error:'Oferta inválida.'},{status:400})
 if(resume&&!resume.startsWith(`${user.id}/`))return NextResponse.json({ok:false,error:'El CV no pertenece a esta cuenta.'},{status:403})
 const [{data:profile},{data:candidate}]=await Promise.all([
  c.from('pm_profiles').select('display_name,avatar_url').eq('user_id',user.id).maybeSingle(),
  c.from('pm_candidate_profiles').select('phone,city,province,headline,skills,availability,work_modes,resume_path,resume_name').eq('user_id',user.id).maybeSingle()
 ])
 const effectiveResume=resume||txt(candidate?.resume_path,500)
 const displayName=txt(profile?.display_name||b?.name,100),phone=txt(candidate?.phone||b?.phone,60),city=txt(candidate?.city||b?.city,120),availability=txt(candidate?.availability||b?.availability,180),experience=txt(b?.experience,180),expectedSalary=txt(b?.expected_salary,80)
 const required:[string,string,string][]=[['name',displayName,'Completá tu nombre y apellido.'],['phone',phone,'Completá tu teléfono.'],['city',city,'Completá tu ciudad o zona.'],['resume',effectiveResume,'Adjuntá un CV para esta postulación.'],['availability',availability,'Indicá tu disponibilidad.'],['experience',experience,'Indicá tu experiencia relacionada.']]
 const missing=required.find(([,value])=>!value)
 if(missing)return NextResponse.json({ok:false,code:'required_field',field:missing[0],error:missing[2]},{status:400})
 const snapshot={display_name:displayName,avatar_path:txt(profile?.avatar_url,500),phone,city,province:txt(candidate?.province,120),headline:txt(candidate?.headline,180),skills:Array.isArray(candidate?.skills)?candidate.skills.map((x:unknown)=>txt(x,80)).filter(Boolean).slice(0,25):[],availability,work_modes:Array.isArray(candidate?.work_modes)?candidate.work_modes.map((x:unknown)=>txt(x,40)).filter(Boolean).slice(0,5):[],experience,expected_salary:expectedSalary,resume_name:txt(candidate?.resume_name,180),shared_for_application:true}
 const {data,error}=await c.rpc('pm_submit_application',{p_job_id:job,p_resume_path:effectiveResume,p_cover_letter:letter,p_candidate_snapshot:snapshot})
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
