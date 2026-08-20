import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'

function client(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
function cleanText(v:unknown,max=180){return String(v??'').trim().slice(0,max)}

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
 const body=await req.json().catch(()=>({}));const role=body?.role==='employer'?'employer':'candidate'
 const profile={user_id:user.id,primary_role:role,display_name:cleanText(body?.display_name,80)||null,avatar_url:cleanText(body?.avatar_url,500)||null,onboarding_completed:Boolean(body?.onboarding_completed),updated_at:new Date().toISOString()}
 const {error:pErr}=await db.from('pm_profiles').upsert(profile,{onConflict:'user_id'});if(pErr)return NextResponse.json({ok:false,error:pErr.message},{status:400})
 if(role==='candidate'){
  const skills=Array.isArray(body?.skills)?body.skills.map((x:unknown)=>cleanText(x,60)).filter(Boolean).slice(0,25):[]
  const areas=Array.isArray(body?.preferred_areas)?body.preferred_areas.map((x:unknown)=>cleanText(x,60)).filter(Boolean).slice(0,12):[]
  const modes=Array.isArray(body?.work_modes)?body.work_modes.map((x:unknown)=>cleanText(x,30)).filter(Boolean).slice(0,5):[]
  const completeness=[profile.display_name,body?.province,body?.city,body?.headline,skills.length,body?.availability,body?.resume_name].filter(Boolean).length
  const {error:cErr}=await db.from('pm_candidate_profiles').upsert({user_id:user.id,country:cleanText(body?.country,80)||'Argentina',province:cleanText(body?.province,100)||null,city:cleanText(body?.city,100)||null,neighborhood:cleanText(body?.neighborhood,100)||null,headline:cleanText(body?.headline,180)||null,phone:cleanText(body?.phone,60)||null,skills,preferred_areas:areas,availability:cleanText(body?.availability,180)||null,work_modes:modes,resume_path:cleanText(body?.resume_path,500)||null,resume_name:cleanText(body?.resume_name,180)||null,searchable:Boolean(body?.searchable),profile_completion:Math.min(100,10+completeness*12),updated_at:new Date().toISOString()},{onConflict:'user_id'});if(cErr)return NextResponse.json({ok:false,error:cErr.message},{status:400})
 }
 if(body?.accept_legal===true){const version='2026-08-19-v1';const rows=['terms','privacy'].map(consent_type=>({user_id:user.id,consent_type,version,accepted:true,source:cleanText(body?.source,80)||'account'}));const {error:cns}=await db.from('pm_consents').upsert(rows,{onConflict:'user_id,consent_type,version'});if(cns)return NextResponse.json({ok:false,error:cns.message},{status:400})}
 return NextResponse.json({ok:true})
}
