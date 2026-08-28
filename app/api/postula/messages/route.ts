import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL=(process.env.NEXT_PUBLIC_POSTULA_SUPABASE_URL||'https://postulamejor.supabase.co').replace(/\/+$/,'')
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
function client(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
const clean=(v:unknown,max=4000)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,max)
const conversationSelect='id,application_id,company_id,candidate_user_id,conversation_kind,flex_post_id,flex_response_id,publisher_user_id,last_message_at,pm_companies(name),pm_applications(status,pm_jobs(title,area,employer_visibility)),pm_flex_posts(title,location_text,compensation_text)'
const revealStatuses=new Set(['shortlist','interview','hired'])
function first(v:any){return Array.isArray(v)?v[0]||null:v||null}
function privacyMeta(conv:any){const app=first(conv?.pm_applications),job=first(app?.pm_jobs);return{app,job,confidential:job?.employer_visibility==='confidential',revealed:revealStatuses.has(String(app?.status||''))}}
function maskConversation(conv:any,userId:string){if(String(conv?.candidate_user_id)!==userId||conv?.conversation_kind!=='application')return conv;const meta=privacyMeta(conv);if(meta.confidential&&!meta.revealed)return{...conv,pm_companies:{name:`Empresa · ${meta.job?.area||'información reservada'}`},identity_revealed:false};return{...conv,identity_revealed:true}}
function otherUserId(conv:any,userId:string){const candidate=String(conv?.candidate_user_id||''),publisher=String(conv?.publisher_user_id||'');return candidate===userId?publisher:candidate}
async function addCounterpartProfiles(db:any,rows:any[],userId:string){
 const ids=Array.from(new Set(rows.map(row=>otherUserId(row,userId)).filter(Boolean))) as string[]
 if(!ids.length)return rows
 const [{data:profiles},{data:candidates}]=await Promise.all([
  db.from('pm_profiles').select('user_id,display_name').in('user_id',ids),
  db.from('pm_candidate_profiles').select('user_id,city,province,headline,profile_completion,public_location,public_headline').in('user_id',ids)
 ])
 const profileMap=new Map((profiles||[]).map((row:any)=>[String(row.user_id),row])),candidateMap=new Map((candidates||[]).map((row:any)=>[String(row.user_id),row]))
 return rows.map(row=>{const id=otherUserId(row,userId),profile:any=profileMap.get(id)||null,candidate:any=candidateMap.get(id)||null;return{...row,counterpart_profile:id?{user_id:id,display_name:clean(profile?.display_name,80)||null,headline:candidate?.public_headline===false?null:(clean(candidate?.headline,180)||null),location:candidate?.public_location===false?null:([clean(candidate?.city,100),clean(candidate?.province,100)].filter(Boolean).join(', ')||null),profile_completion:Number.isFinite(Number(candidate?.profile_completion))?Number(candidate.profile_completion):null}:null}})
}
async function employerCompanyIds(db:any,userId:string){const {data}=await db.from('pm_company_members').select('company_id').eq('user_id',userId).eq('status','active');return (data||[]).map((row:any)=>String(row.company_id||'')).filter(Boolean)}
function requestAudience(req:NextRequest){
 const explicit=clean(req.nextUrl.searchParams.get('audience'),20)
 if(explicit==='candidate'||explicit==='employer')return explicit
 try{const ref=req.headers.get('referer');if(ref&&new URL(ref).pathname.startsWith('/empresas'))return'employer'}catch{}
 return'candidate'
}
function candidateEmploymentAllowed(conv:any,userId:string){return conv?.conversation_kind!=='application'||String(conv?.candidate_user_id)===userId}
function safety(text:string){
 const hard=[/contraseñ[ao]/i,/c[oó]digo\s+(?:de\s+)?verificaci[oó]n/i,/\bcvv\b/i,/clave\s+(?:de\s+)?(?:home\s*banking|bancaria|token)/i,/token\s+bancari/i,/mandame\s+(?:foto\s+de\s+)?(?:tu\s+)?tarjeta/i,/pag[aá]\s+(?:primero|antes)\s+(?:para|y)/i,/transfer[ií]\s+.*(?:para\s+empezar|para\s+ingresar)/i]
 if(hard.some(r=>r.test(text)))return {blocked:true,flags:['sensitive_or_payment_request'],error:'Por seguridad, no envíes ni pidas contraseñas, códigos de verificación, datos de tarjeta ni pagos previos para continuar. Reformulá el mensaje y mantené esos datos fuera del chat.'}
 const flags:string[]=[]
 if(/\b(?:dni|cuil|cuit|cbu|cvu|alias bancario|tarjeta|home\s*banking)\b/i.test(text))flags.push('sensitive_data')
 if(/\b(?:whatsapp|telegram)\b/i.test(text))flags.push('off_platform_contact')
 if(/\b(?:dep[oó]sito previo|seña previa|cripto|usdt)\b/i.test(text))flags.push('payment_risk')
 return {blocked:false,flags}
}
async function ensureConversation(db:any,body:any){
 let conversation=clean(body?.conversation_id,80);if(conversation)return conversation
 const application=clean(body?.application_id,80),flexResponse=clean(body?.flex_response_id,80)
 if(application){const {data,error}=await db.rpc('pm_ensure_conversation',{p_application:application});if(error||!data){if(/employer must start/i.test(error?.message||''))throw new Error('La empresa tiene que iniciar el primer mensaje. Cuando te contacte, vas a poder responder desde acá.');throw new Error(error?.message||'No pudimos abrir el chat.')}return String(data)}
 if(flexResponse){const {data,error}=await db.rpc('pm_ensure_flex_conversation',{p_response:flexResponse});if(error||!data)throw new Error(error?.message||'No pudimos abrir el chat de Servicios Flex.');return String(data)}
 throw new Error('Falta la conversación.')
}

export async function GET(req:NextRequest){
 const db=client(req);const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const audience=requestAudience(req),id=req.nextUrl.searchParams.get('conversation')||''
 if(id){
  const {data:conversation,error:cErr}=await db.from('pm_conversations').select(conversationSelect).eq('id',id).maybeSingle();if(cErr||!conversation)return NextResponse.json({ok:false,error:'Conversación no disponible.'},{status:404})
  if(audience==='candidate'&&!candidateEmploymentAllowed(conversation,user.id))return NextResponse.json({ok:false,error:'Esta conversación pertenece a tu perfil de empresa y no está disponible en la bandeja del postulante.'},{status:404})
  if(audience==='employer'){const companies=await employerCompanyIds(db,user.id);if(!companies.includes(String(conversation.company_id||'')))return NextResponse.json({ok:false,error:'Esta conversación no pertenece a una empresa activa de tu cuenta.'},{status:404})}
  const [{data:messages,error:mErr},{data:interviews,error:iErr}]=await Promise.all([
   db.from('pm_messages').select('id,sender_user_id,body,message_type,metadata,read_at,created_at').eq('conversation_id',id).order('created_at',{ascending:true}).limit(300),
   db.from('pm_interviews').select('id,conversation_id,proposed_by,scheduled_for,duration_minutes,mode,location_text,notes,status,responded_by,responded_at,created_at').eq('conversation_id',id).order('created_at',{ascending:true}).limit(40)
  ])
  if(mErr||iErr)return NextResponse.json({ok:false,error:mErr?.message||iErr?.message},{status:400})
  await Promise.all([
   db.rpc('pm_mark_conversation_read',{p_conversation:id}),
   db.from('pm_notifications').update({read_at:new Date().toISOString()}).eq('user_id',user.id).eq('notification_type','message').contains('payload',{conversation_id:id}).is('read_at',null)
  ])
  const masked=maskConversation(conversation,user.id),[enriched]=await addCounterpartProfiles(db,[masked],user.id)
  return NextResponse.json({ok:true,conversation:enriched,messages:messages||[],interviews:interviews||[],me:user.id,audience:String(conversation.candidate_user_id)===user.id?'candidate':'employer'})
 }
 let query=db.from('pm_conversations').select(conversationSelect).order('last_message_at',{ascending:false}).limit(80)
 if(audience==='candidate')query=query.or(`conversation_kind.eq.flex,candidate_user_id.eq.${user.id}`)
 else{const companies=await employerCompanyIds(db,user.id);if(!companies.length)return NextResponse.json({ok:true,conversations:[],me:user.id,counts:{employment:0,flex:0}});query=query.in('company_id',companies)}
 const {data,error}=await query;if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
 const conversations=(data||[]).filter((x:any)=>audience!=='candidate'||candidateEmploymentAllowed(x,user.id)),ids=conversations.map((x:any)=>x.id)
 let unreadRows:any[]=[]
 if(ids.length){const {data:u}=await db.from('pm_messages').select('conversation_id,sender_user_id,read_at').in('conversation_id',ids).neq('sender_user_id',user.id).is('read_at',null);unreadRows=u||[]}
 const counts=new Map<string,number>();for(const row of unreadRows)counts.set(String(row.conversation_id),(counts.get(String(row.conversation_id))||0)+1)
 const masked=conversations.map((x:any)=>({...maskConversation(x,user.id),unread_count:counts.get(String(x.id))||0})),enriched=await addCounterpartProfiles(db,masked,user.id)
 return NextResponse.json({ok:true,conversations:enriched,me:user.id,counts:{employment:conversations.filter((x:any)=>x.conversation_kind!=='flex').reduce((n:number,x:any)=>n+(counts.get(String(x.id))||0),0),flex:conversations.filter((x:any)=>x.conversation_kind==='flex').reduce((n:number,x:any)=>n+(counts.get(String(x.id))||0),0)}})
}

export async function POST(req:NextRequest){
 const db=client(req);const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const body=await req.json().catch(()=>({}));const action=clean(body?.action,40)||'send',audience=clean(body?.audience,20)||requestAudience(req);let conversation=''
 try{conversation=await ensureConversation(db,body)}catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:'No pudimos abrir el chat.'},{status:403})}
 if(audience==='candidate'){
  const {data:scopeConv}=await db.from('pm_conversations').select('candidate_user_id,conversation_kind').eq('id',conversation).maybeSingle()
  if(!scopeConv||!candidateEmploymentAllowed(scopeConv,user.id))return NextResponse.json({ok:false,error:'Esta conversación pertenece a tu perfil de empresa y no se puede usar desde la bandeja del postulante.'},{status:403})
 }else if(audience==='employer'){
  const [{data:scopeConv},companies]=await Promise.all([db.from('pm_conversations').select('company_id').eq('id',conversation).maybeSingle(),employerCompanyIds(db,user.id)])
  if(!scopeConv||!companies.includes(String(scopeConv.company_id||'')))return NextResponse.json({ok:false,error:'Esta conversación no pertenece a una empresa activa de tu cuenta.'},{status:403})
 }
 if(action==='ensure')return NextResponse.json({ok:true,conversation_id:conversation})
 if(action==='schedule_interview'){
  const scheduled=new Date(String(body?.scheduled_for||''));if(Number.isNaN(scheduled.getTime())||scheduled.getTime()<Date.now()+5*60000)return NextResponse.json({ok:false,error:'Elegí una fecha y hora futura para la entrevista.'},{status:400})
  const mode=['presencial','virtual','telefonica','a_coordinar'].includes(String(body?.mode))?String(body.mode):'a_coordinar',duration=Math.max(10,Math.min(480,Number(body?.duration_minutes)||30)),location=clean(body?.location_text,240),notes=clean(body?.notes,1000)
  const {data:conv}=await db.from('pm_conversations').select('conversation_kind,application_id,candidate_user_id').eq('id',conversation).maybeSingle();if(!conv)return NextResponse.json({ok:false,error:'Conversación no disponible.'},{status:404});if(conv.conversation_kind!=='application')return NextResponse.json({ok:false,error:'La agenda de entrevistas está disponible para procesos de empleo. En Servicios Flex coordiná horario y encuentro por el chat.'},{status:400});if(String(conv.candidate_user_id)===user.id)return NextResponse.json({ok:false,error:'La propuesta de entrevista la inicia la empresa.'},{status:403})
  const {data:interview,error}=await db.from('pm_interviews').insert({conversation_id:conversation,proposed_by:user.id,scheduled_for:scheduled.toISOString(),duration_minutes:duration,mode,location_text:location||null,notes:notes||null}).select('*').single();if(error)return NextResponse.json({ok:false,error:error.message},{status:403})
  const when=scheduled.toLocaleString('es-AR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Argentina/Buenos_Aires'}),{data:message,error:mErr}=await db.from('pm_messages').insert({conversation_id:conversation,sender_user_id:user.id,body:`Entrevista propuesta para ${when}.`,message_type:'interview',metadata:{interview_id:interview.id,status:'proposed'}}).select('id,body,message_type,metadata,created_at,sender_user_id').single();if(mErr)return NextResponse.json({ok:false,error:mErr.message},{status:403})
  return NextResponse.json({ok:true,interview,message})
 }
 if(action==='respond_interview'){
  const id=clean(body?.interview_id,80),status=body?.status==='accepted'?'accepted':body?.status==='declined'?'declined':'';if(!id||!status)return NextResponse.json({ok:false,error:'Respuesta de entrevista inválida.'},{status:400})
  const {data:conv}=await db.from('pm_conversations').select('candidate_user_id').eq('id',conversation).maybeSingle();if(!conv||String(conv.candidate_user_id)!==user.id)return NextResponse.json({ok:false,error:'La respuesta a la entrevista corresponde al postulante.'},{status:403})
  const {data:rawInterview,error:iErr}=await db.rpc('pm_respond_interview',{p_interview:id,p_status:status}),interview=first(rawInterview);if(iErr||!interview||String(interview.conversation_id)!==conversation)return NextResponse.json({ok:false,error:iErr?.message||'La propuesta ya fue respondida o no está disponible.'},{status:/forbidden/i.test(iErr?.message||'')?403:400})
  const label=status==='accepted'?'Entrevista confirmada':'Entrevista rechazada',{data:message}=await db.from('pm_messages').insert({conversation_id:conversation,sender_user_id:user.id,body:label,message_type:'system',metadata:{interview_id:id,status}}).select('id,body,message_type,metadata,created_at,sender_user_id').single()
  return NextResponse.json({ok:true,interview,message})
 }
 if(action!=='send')return NextResponse.json({ok:false,error:'Acción inválida.'},{status:400})
 const text=clean(body?.text,4000);if(!text)return NextResponse.json({ok:false,error:'Escribí un mensaje.'},{status:400});const check=safety(text);if(check.blocked)return NextResponse.json({ok:false,error:check.error,safety:true},{status:422})
 const {data:convMeta}=await db.from('pm_conversations').select(conversationSelect).eq('id',conversation).maybeSingle();if(convMeta&&String(convMeta.candidate_user_id)!==user.id&&convMeta.conversation_kind==='application'){const meta=privacyMeta(convMeta);if(meta.confidential&&!meta.revealed){const companyName=String(first(convMeta.pm_companies)?.name||'').toLowerCase();const lower=text.toLowerCase();if((companyName&&companyName.length>3&&lower.includes(companyName))||/https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b(?:\+?54\s*)?(?:9\s*)?\d[\d\s-]{8,}\b/i.test(text))return NextResponse.json({ok:false,confidentiality:true,error:'Esta búsqueda está publicada con identidad reservada. Hasta pasar al candidato a shortlist o entrevista, no envíes el nombre de la empresa, enlaces, email, teléfono ni otros datos que permitan identificarla.'},{status:422})}}
 const type=body?.message_type==='voice_transcript'?'voice_transcript':'text',metadata:any={safety_flags:check.flags};if(type==='voice_transcript'){metadata.transcribed=true;metadata.source='employer_voice'}
 const {data,error}=await db.from('pm_messages').insert({conversation_id:conversation,sender_user_id:user.id,body:text,message_type:type,metadata}).select('id,body,message_type,metadata,created_at,sender_user_id').single();if(error)return NextResponse.json({ok:false,error:error.message},{status:403})
 return NextResponse.json({ok:true,message:data,safety_flags:check.flags})
}
