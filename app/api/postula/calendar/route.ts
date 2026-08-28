import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const writableRoles=new Set(['owner','admin','recruiter','hiring_manager'])
const readableRoles=new Set([...writableRoles,'viewer'])

function client(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
function clean(v:unknown,max=500){return String(v??'').replace(/\s+/g,' ').trim().slice(0,max)}
function first<T>(v:T|T[]|null|undefined):T|null{return Array.isArray(v)?v[0]||null:v||null}
function iso(v:unknown){const d=new Date(String(v||''));return Number.isNaN(d.getTime())?null:d}
function addMinutes(v:string,minutes:number){return new Date(new Date(v).getTime()+minutes*60000).toISOString()}

async function membership(db:any,userId:string){
 const {data}=await db.from('pm_company_members').select('company_id,role,status,pm_companies(name)').eq('user_id',userId).eq('status','active').limit(20)
 return (data||[]).find((row:any)=>readableRoles.has(String(row.role||'')))||null
}

export async function GET(req:NextRequest){
 const db=client(req);const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const audience=req.nextUrl.searchParams.get('audience')==='employer'?'employer':'candidate'
 const now=Date.now(),from=iso(req.nextUrl.searchParams.get('from'))||new Date(now-30*86400000),to=iso(req.nextUrl.searchParams.get('to'))||new Date(now+180*86400000)
 if(to<=from||to.getTime()-from.getTime()>400*86400000)return NextResponse.json({ok:false,error:'Rango de calendario inválido.'},{status:400})
 const member=audience==='employer'?await membership(db,user.id):null
 if(audience==='employer'&&!member)return NextResponse.json({ok:false,error:'No encontramos una empresa activa para este calendario.'},{status:403})

 let itemQuery=db.from('pm_calendar_items').select('id,owner_user_id,company_id,title,starts_at,ends_at,location_text,notes,status,created_at,updated_at').gte('starts_at',from.toISOString()).lt('starts_at',to.toISOString()).order('starts_at',{ascending:true}).limit(400)
 itemQuery=audience==='employer'?itemQuery.eq('company_id',member.company_id):itemQuery.eq('owner_user_id',user.id).is('company_id',null)
 const [{data:items,error:itemErr},{data:interviews,error:interviewErr}]=await Promise.all([
  itemQuery,
  db.from('pm_interviews').select('id,conversation_id,scheduled_for,duration_minutes,mode,location_text,notes,status,created_at').gte('scheduled_for',from.toISOString()).lt('scheduled_for',to.toISOString()).order('scheduled_for',{ascending:true}).limit(400)
 ])
 if(itemErr||interviewErr)return NextResponse.json({ok:false,error:itemErr?.message||interviewErr?.message},{status:400})

 const conversationIds=(interviews||[]).map((x:any)=>x.conversation_id).filter(Boolean)
 let conversations:any[]=[]
 if(conversationIds.length){const {data}=await db.from('pm_conversations').select('id,application_id,company_id,candidate_user_id,conversation_kind').in('id',conversationIds);conversations=data||[]}
 const scopedConversations=conversations.filter((c:any)=>c.conversation_kind==='application'&&(audience==='candidate'?String(c.candidate_user_id)===user.id:String(c.company_id)===String(member.company_id)))
 const convMap=new Map(scopedConversations.map((c:any)=>[String(c.id),c])),applicationIds=scopedConversations.map((c:any)=>c.application_id).filter(Boolean)
 let applications:any[]=[]
 if(applicationIds.length){const {data}=await db.from('pm_applications').select('id,job_id,candidate_snapshot').in('id',applicationIds);applications=data||[]}
 const appMap=new Map(applications.map((a:any)=>[String(a.id),a])),jobIds=applications.map((a:any)=>a.job_id).filter(Boolean)
 let jobs:any[]=[]
 if(jobIds.length){const {data}=await db.from('pm_jobs').select('id,title,location_text,company_id').in('id',jobIds);jobs=data||[]}
 const jobMap=new Map(jobs.map((j:any)=>[String(j.id),j])),companyIds=[...new Set(jobs.map((j:any)=>String(j.company_id||'')).filter(Boolean))]
 let companies:any[]=[]
 if(companyIds.length){const {data}=await db.from('pm_companies').select('id,name').in('id',companyIds);companies=data||[]}
 const companyMap=new Map(companies.map((c:any)=>[String(c.id),c]))

 const interviewEvents=(interviews||[]).flatMap((iv:any)=>{
  const conv:any=convMap.get(String(iv.conversation_id));if(!conv)return[]
  const app:any=appMap.get(String(conv.application_id)),job:any=app?jobMap.get(String(app.job_id)):null,company:any=job?companyMap.get(String(job.company_id)):null
  const candidateName=clean(app?.candidate_snapshot?.display_name,100)||'Postulante'
  const roleTitle=clean(job?.title,160)||'Proceso de selección'
  const counterpart=audience==='employer'?candidateName:(clean(company?.name,120)||'Empresa')
  return [{id:`interview:${iv.id}`,source:'interview',interview_id:iv.id,conversation_id:iv.conversation_id,title:`Entrevista · ${roleTitle}`,counterpart,starts_at:iv.scheduled_for,ends_at:addMinutes(iv.scheduled_for,Number(iv.duration_minutes)||30),duration_minutes:Number(iv.duration_minutes)||30,mode:iv.mode,location_text:iv.location_text||job?.location_text||null,notes:iv.notes||null,status:iv.status,locked:true}]
 })
 const customEvents=(items||[]).map((item:any)=>({...item,id:`task:${item.id}`,task_id:item.id,source:'custom',locked:false}))
 const events=[...customEvents,...interviewEvents].sort((a:any,b:any)=>new Date(a.starts_at).getTime()-new Date(b.starts_at).getTime())
 const inactiveUpcoming=new Set(['cancelled','declined','completed'])
 const upcoming=events.filter((event:any)=>new Date(event.starts_at).getTime()>=Date.now()&&!inactiveUpcoming.has(String(event.status||''))).slice(0,8)
 return NextResponse.json({ok:true,audience,company:member?{id:member.company_id,name:first(member.pm_companies)?.name||member.pm_companies?.name||'Tu empresa',role:member.role}:null,events,upcoming})
}

export async function POST(req:NextRequest){
 const db=client(req);const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const body=await req.json().catch(()=>({})),audience=body?.audience==='employer'?'employer':'candidate',title=clean(body?.title,160),start=iso(body?.starts_at)
 if(!title||!start)return NextResponse.json({ok:false,error:'Completá título, fecha y hora.'},{status:400})
 const member=audience==='employer'?await membership(db,user.id):null
 if(audience==='employer'&&(!member||!writableRoles.has(String(member.role))))return NextResponse.json({ok:false,error:'Tu rol no permite agregar tareas al calendario de la empresa.'},{status:403})
 const duration=Math.max(15,Math.min(1440,Number(body?.duration_minutes)||60)),end=iso(body?.ends_at)||new Date(start.getTime()+duration*60000)
 const payload={owner_user_id:user.id,company_id:audience==='employer'?member.company_id:null,title,starts_at:start.toISOString(),ends_at:end.toISOString(),location_text:clean(body?.location_text,240)||null,notes:clean(body?.notes,1200)||null,status:'scheduled'}
 const {data,error}=await db.from('pm_calendar_items').insert(payload).select('*').single();if(error)return NextResponse.json({ok:false,error:error.message},{status:403})
 return NextResponse.json({ok:true,item:data})
}

export async function PATCH(req:NextRequest){
 const db=client(req);const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const body=await req.json().catch(()=>({})),id=clean(body?.id,80);if(!id)return NextResponse.json({ok:false,error:'Tarea inválida.'},{status:400})
 const patch:Record<string,unknown>={}
 if(body?.title!==undefined){const value=clean(body.title,160);if(!value)return NextResponse.json({ok:false,error:'El título no puede quedar vacío.'},{status:400});patch.title=value}
 if(body?.starts_at!==undefined){const value=iso(body.starts_at);if(!value)return NextResponse.json({ok:false,error:'Fecha inválida.'},{status:400});patch.starts_at=value.toISOString()}
 if(body?.ends_at!==undefined){const value=iso(body.ends_at);patch.ends_at=value?value.toISOString():null}
 if(body?.location_text!==undefined)patch.location_text=clean(body.location_text,240)||null
 if(body?.notes!==undefined)patch.notes=clean(body.notes,1200)||null
 if(body?.status!==undefined){const value=String(body.status);if(!['scheduled','completed','cancelled'].includes(value))return NextResponse.json({ok:false,error:'Estado inválido.'},{status:400});patch.status=value}
 const {data,error}=await db.from('pm_calendar_items').update(patch).eq('id',id).select('*').single();if(error)return NextResponse.json({ok:false,error:error.message},{status:403})
 return NextResponse.json({ok:true,item:data})
}

export async function DELETE(req:NextRequest){
 const db=client(req);const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const id=clean(req.nextUrl.searchParams.get('id'),80);if(!id)return NextResponse.json({ok:false,error:'Tarea inválida.'},{status:400})
 const {error}=await db.from('pm_calendar_items').delete().eq('id',id);if(error)return NextResponse.json({ok:false,error:error.message},{status:403})
 return NextResponse.json({ok:true})
}
