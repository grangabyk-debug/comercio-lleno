import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const VISIBILITY=['discoverable','applications_only','private'] as const

type Visibility=(typeof VISIBILITY)[number]

function client(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
function cleanText(v:unknown,max=180){return String(v??'').trim().slice(0,max)}
function has(body:any,key:string){return Object.prototype.hasOwnProperty.call(body,key)}
function textPatch(body:any,key:string,current:unknown,max=180){return has(body,key)?(cleanText(body?.[key],max)||null):(current??null)}
function arrayPatch(body:any,key:string,current:unknown,max=60,limit=25){if(!has(body,key))return Array.isArray(current)?current:[];return Array.isArray(body?.[key])?body[key].map((x:unknown)=>cleanText(x,max)).filter(Boolean).slice(0,limit):[]}
function visibilityPatch(body:any,current:unknown):Visibility{const incoming=cleanText(body?.profile_visibility,40) as Visibility;if(has(body,'profile_visibility')&&VISIBILITY.includes(incoming))return incoming;const saved=cleanText(current,40) as Visibility;return VISIBILITY.includes(saved)?saved:'applications_only'}

export async function GET(req:NextRequest){
 const db=client(req);const {data:{user},error}=await db.auth.getUser();if(error||!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const [{data:profile},{data:candidate},{data:memberships},{data:consents}]=await Promise.all([
  db.from('pm_profiles').select('*').eq('user_id',user.id).maybeSingle(),
  db.from('pm_candidate_profiles').select('*').eq('user_id',user.id).maybeSingle(),
  db.from('pm_company_members').select('company_id,role,status,pm_companies(id,name,verification_status,trust_score)').eq('user_id',user.id).eq('status','active'),
  db.from('pm_consents').select('consent_type,version,accepted,accepted_at').eq('user_id',user.id)
 ])
 return NextResponse.json({ok:true,user:{id:user.id,email:user.email},profile,candidate,memberships:memberships||[],consents:consents||[]})
}

export async function POST(req:NextRequest){
 const db=client(req);const {data:{user},error}=await db.auth.getUser();if(error||!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const body=await req.json().catch(()=>({}))
 const [{data:existingProfile},{data:existingCandidate}]=await Promise.all([
  db.from('pm_profiles').select('*').eq('user_id',user.id).maybeSingle(),
  db.from('pm_candidate_profiles').select('*').eq('user_id',user.id).maybeSingle()
 ])
 const role=body?.role==='employer'?'employer':body?.role==='candidate'?'candidate':existingProfile?.primary_role==='employer'?'employer':'candidate'
 const profile={
  user_id:user.id,
  primary_role:role,
  display_name:textPatch(body,'display_name',existingProfile?.display_name,80),
  avatar_url:textPatch(body,'avatar_url',existingProfile?.avatar_url,500),
  onboarding_completed:has(body,'onboarding_completed')?Boolean(body?.onboarding_completed):Boolean(existingProfile?.onboarding_completed),
  updated_at:new Date().toISOString()
 }
 const {error:pErr}=await db.from('pm_profiles').upsert(profile,{onConflict:'user_id'});if(pErr)return NextResponse.json({ok:false,error:pErr.message},{status:400})
 if(role==='candidate'){
  const skills=arrayPatch(body,'skills',existingCandidate?.skills,60,25)
  const areas=arrayPatch(body,'preferred_areas',existingCandidate?.preferred_areas,60,12)
  const modes=arrayPatch(body,'work_modes',existingCandidate?.work_modes,30,5)
  const profileVisibility=visibilityPatch(body,existingCandidate?.profile_visibility)
  const candidate={
   user_id:user.id,
   country:has(body,'country')?(cleanText(body?.country,80)||'Argentina'):(existingCandidate?.country||'Argentina'),
   province:textPatch(body,'province',existingCandidate?.province,100),
   city:textPatch(body,'city',existingCandidate?.city,100),
   neighborhood:textPatch(body,'neighborhood',existingCandidate?.neighborhood,100),
   headline:textPatch(body,'headline',existingCandidate?.headline,180),
   phone:textPatch(body,'phone',existingCandidate?.phone,60),
   skills,
   preferred_areas:areas,
   availability:textPatch(body,'availability',existingCandidate?.availability,180),
   work_modes:modes,
   resume_path:textPatch(body,'resume_path',existingCandidate?.resume_path,500),
   resume_name:textPatch(body,'resume_name',existingCandidate?.resume_name,180),
   profile_visibility:profileVisibility,
   public_photo:has(body,'public_photo')?Boolean(body?.public_photo):existingCandidate?.public_photo!==false,
   public_location:has(body,'public_location')?Boolean(body?.public_location):existingCandidate?.public_location!==false,
   public_headline:has(body,'public_headline')?Boolean(body?.public_headline):existingCandidate?.public_headline!==false,
   public_skills:has(body,'public_skills')?Boolean(body?.public_skills):existingCandidate?.public_skills!==false,
   searchable:profileVisibility==='discoverable',
   profile_completion:0,
   updated_at:new Date().toISOString()
  }
  const completeness=[profile.display_name,candidate.province,candidate.city,candidate.headline,skills.length,candidate.availability,candidate.resume_name].filter(Boolean).length
  candidate.profile_completion=Math.min(100,10+completeness*12)
  const {error:cErr}=await db.from('pm_candidate_profiles').upsert(candidate,{onConflict:'user_id'});if(cErr)return NextResponse.json({ok:false,error:cErr.message},{status:400})
 }
 if(body?.accept_legal===true||body?.activate_candidate===true){
  const version=cleanText(body?.terms_version,40)||'2026-08-21'
  const source=cleanText(body?.source,80)||'account'
  const consentTypes=[...(body?.accept_legal===true?['terms','privacy']:[]),...(body?.responsibility_ack===true?['publisher_responsibility']:[]),...(body?.activate_candidate===true?['candidate_profile_activation']:[])]
  const rows=Array.from(new Set(consentTypes)).map(consent_type=>({user_id:user.id,consent_type,version,accepted:true,source}))
  if(rows.length){const {error:cns}=await db.from('pm_consents').upsert(rows,{onConflict:'user_id,consent_type,version'});if(cns)return NextResponse.json({ok:false,error:cns.message},{status:400})}
 }
 return NextResponse.json({ok:true})
}
