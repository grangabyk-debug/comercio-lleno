import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
function client(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}

export async function GET(req:NextRequest){
 const db=client(req);const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const id=req.nextUrl.searchParams.get('conversation')||''
 if(id){const {data:conversation,error:cErr}=await db.from('pm_conversations').select('id,application_id,company_id,candidate_user_id,last_message_at,pm_companies(name),pm_applications(status,pm_jobs(title))').eq('id',id).maybeSingle();if(cErr||!conversation)return NextResponse.json({ok:false,error:'Conversación no disponible.'},{status:404});const {data:messages,error}=await db.from('pm_messages').select('id,sender_user_id,body,message_type,metadata,read_at,created_at').eq('conversation_id',id).order('created_at',{ascending:true}).limit(250);if(error)return NextResponse.json({ok:false,error:error.message},{status:400});return NextResponse.json({ok:true,conversation,messages:messages||[],me:user.id})}
 const {data,error}=await db.from('pm_conversations').select('id,application_id,company_id,candidate_user_id,last_message_at,pm_companies(name),pm_applications(status,pm_jobs(title))').order('last_message_at',{ascending:false}).limit(80);if(error)return NextResponse.json({ok:false,error:error.message},{status:400});return NextResponse.json({ok:true,conversations:data||[],me:user.id})
}

export async function POST(req:NextRequest){
 const db=client(req);const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const body=await req.json().catch(()=>({}));let conversation=String(body?.conversation_id||'').trim();const application=String(body?.application_id||'').trim();
 if(!conversation&&application){const {data,error}=await db.rpc('pm_ensure_conversation',{p_application:application});if(error||!data)return NextResponse.json({ok:false,error:error?.message||'No pudimos abrir el chat.'},{status:403});conversation=String(data)}
 if(!conversation)return NextResponse.json({ok:false,error:'Falta la conversación.'},{status:400})
 const text=String(body?.text||'').replace(/\s+/g,' ').trim().slice(0,4000);if(!text)return NextResponse.json({ok:false,error:'Escribí un mensaje.'},{status:400})
 const type=body?.message_type==='voice_transcript'?'voice_transcript':'text';const metadata=type==='voice_transcript'?{transcribed:true,source:'employer_voice'}:{}
 const {data,error}=await db.from('pm_messages').insert({conversation_id:conversation,sender_user_id:user.id,body:text,message_type:type,metadata}).select('id,body,message_type,metadata,created_at,sender_user_id').single();if(error)return NextResponse.json({ok:false,error:error.message},{status:403});
 await db.from('pm_conversations').update({last_message_at:new Date().toISOString()}).eq('id',conversation)
 return NextResponse.json({ok:true,message:data})
}
