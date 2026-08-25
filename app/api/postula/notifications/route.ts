import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
function db(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
const clean=(v:unknown,n=120)=>String(v??'').trim().slice(0,n)

export async function GET(req:NextRequest){
 const c=db(req);const {data:{user}}=await c.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const {data,error}=await c.from('pm_notifications').select('id,notification_type,title,body,payload,read_at,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(120)
 if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
 const rows=data||[],unread=rows.filter(x=>!x.read_at),messageRows=unread.filter(x=>x.notification_type==='message')
 return NextResponse.json({
  ok:true,
  counts:{
   applications:unread.filter(x=>x.notification_type==='application_status').length,
   messages:messageRows.length,
   employment_messages:messageRows.filter(x=>String((x.payload as any)?.kind||'application')!=='flex').length,
   flex_messages:messageRows.filter(x=>String((x.payload as any)?.kind||'')==='flex').length,
   total:unread.length
  },
  notifications:rows.slice(0,40)
 })
}

export async function PATCH(req:NextRequest){
 const c=db(req);const {data:{user}}=await c.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const body=await req.json().catch(()=>({})),scope=clean(body?.scope,30),applicationId=clean(body?.application_id,80),conversationId=clean(body?.conversation_id,80)
 let q=c.from('pm_notifications').update({read_at:new Date().toISOString()}).eq('user_id',user.id).is('read_at',null)
 if(applicationId)q=q.eq('notification_type','application_status').contains('payload',{application_id:applicationId})
 else if(conversationId)q=q.eq('notification_type','message').contains('payload',{conversation_id:conversationId})
 else if(scope==='applications')q=q.eq('notification_type','application_status')
 else if(scope==='messages')q=q.eq('notification_type','message')
 else if(scope!=='all')return NextResponse.json({ok:false,error:'Alcance inválido.'},{status:400})
 const {error}=await q
 if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
 return NextResponse.json({ok:true})
}
