import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
function db(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}

export async function POST(req:NextRequest){
 const c=db(req)
 const {data:{user}}=await c.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión nuevamente.'},{status:401})
 const body=await req.json().catch(()=>({})),action=String(body?.action||'')
 if(action==='clear_candidate_profile'){
  const [{data:profile},{data:candidate}]=await Promise.all([
   c.from('pm_profiles').select('avatar_url').eq('user_id',user.id).maybeSingle(),
   c.from('pm_candidate_profiles').select('resume_path').eq('user_id',user.id).maybeSingle(),
  ])
  const paths=[String(profile?.avatar_url||''),String(candidate?.resume_path||'')].filter(p=>p.startsWith(`${user.id}/`))
  if(paths.length){const {error}=await c.storage.from('postula-private').remove(paths);if(error)return NextResponse.json({ok:false,error:'No pudimos eliminar tus archivos privados.'},{status:400})}
  const {error:candidateError}=await c.from('pm_candidate_profiles').update({country:'Argentina',province:null,city:null,neighborhood:null,headline:null,phone:null,skills:[],preferred_areas:[],availability:null,work_modes:[],resume_path:null,resume_name:null,searchable:false,profile_completion:0,profile_visibility:'private',public_photo:false,public_location:false,public_headline:false,public_skills:false,linkedin_url:null,updated_at:new Date().toISOString()}).eq('user_id',user.id)
  if(candidateError)return NextResponse.json({ok:false,error:candidateError.message},{status:400})
  await c.from('pm_profiles').update({avatar_url:null,onboarding_completed:false,updated_at:new Date().toISOString()}).eq('user_id',user.id)
  return NextResponse.json({ok:true,cleared:true})
 }
 if(action==='request_account_deletion'){
  const scope=body?.scope==='profile_data'?'profile_data':'account'
  const {data:existing}=await c.from('pm_account_deletion_requests').select('id,status,requested_at').eq('user_id',user.id).eq('scope',scope).in('status',['pending','processing']).maybeSingle()
  if(existing)return NextResponse.json({ok:true,request:existing,existing:true})
  const {data,error}=await c.from('pm_account_deletion_requests').insert({user_id:user.id,scope,status:'pending'}).select('id,status,requested_at').single()
  if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
  return NextResponse.json({ok:true,request:data})
 }
 return NextResponse.json({ok:false,error:'Acción inválida.'},{status:400})
}
