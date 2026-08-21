import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const text=(v:unknown,n=900)=>String(v??'').trim().slice(0,n)
function db(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}

export async function GET(req:NextRequest){
 const c=db(req)
 const mine=req.nextUrl.searchParams.get('mine')==='1'
 if(mine){
  const {data:{user}}=await c.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
  const [{data:posts,error:pErr},{data:responses,error:rErr}]=await Promise.all([
   c.from('pm_flex_posts').select('*').eq('publisher_user_id',user.id).order('created_at',{ascending:false}).limit(50),
   c.from('pm_flex_responses').select('*,pm_flex_posts(title,location_text,compensation_text)').eq('candidate_user_id',user.id).order('created_at',{ascending:false}).limit(50),
  ])
  if(pErr||rErr)return NextResponse.json({ok:false,error:pErr?.message||rErr?.message},{status:400})
  return NextResponse.json({ok:true,posts:posts||[],responses:responses||[]})
 }
 const {data,error}=await c.from('pm_flex_posts').select('id,title,category,description,location_text,compensation_text,duration_text,scheduled_for,verification_level,status,created_at,company_id').eq('status','published').order('created_at',{ascending:false}).limit(60)
 if(error)return NextResponse.json({ok:false,error:'No pudimos cargar Trabajos Flex.'},{status:400})
 return NextResponse.json({ok:true,posts:data||[]})
}

export async function POST(req:NextRequest){
 const c=db(req);const {data:{user}}=await c.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Creá o iniciá sesión para continuar.'},{status:401})
 const b=await req.json().catch(()=>({}));const action=text(b?.action,30)||'create'
 if(action==='respond'){
  const postId=text(b?.post_id,80),message=text(b?.message,1200)
  if(!postId||message.length<3)return NextResponse.json({ok:false,error:'Escribí un mensaje para contactar a quien publicó.'},{status:400})
  const {data:post}=await c.from('pm_flex_posts').select('id,publisher_user_id,status').eq('id',postId).eq('status','published').maybeSingle()
  if(!post)return NextResponse.json({ok:false,error:'Este Trabajo Flex ya no está disponible.'},{status:404})
  if(String(post.publisher_user_id)===user.id)return NextResponse.json({ok:false,error:'No podés responder a tu propia publicación.'},{status:400})
  const {data,error}=await c.from('pm_flex_responses').insert({post_id:postId,candidate_user_id:user.id,message,status:'sent'}).select('id,status,created_at').single()
  if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
  return NextResponse.json({ok:true,response:data})
 }
 if(action!=='create')return NextResponse.json({ok:false,error:'Acción inválida.'},{status:400})
 if(b?.responsibility_ack!==true)return NextResponse.json({ok:false,error:'Necesitás aceptar las reglas de publicación y asumir la responsabilidad de la publicación.'},{status:400})
 const title=text(b?.title,140),category=text(b?.category,80),description=text(b?.description,1800),location=text(b?.location_text,180),compensation=text(b?.compensation_text,120),duration=text(b?.duration_text,100),scheduled=text(b?.scheduled_for,80),companyId=text(b?.company_id,80)
 if(title.length<5||category.length<2||description.length<15||location.length<2||compensation.length<2)return NextResponse.json({ok:false,error:'Completá título, categoría, descripción, zona e importe.'},{status:400})
 if(companyId){const {data:member}=await c.from('pm_company_members').select('role').eq('company_id',companyId).eq('user_id',user.id).eq('status','active').in('role',['owner','admin','recruiter']).maybeSingle();if(!member)return NextResponse.json({ok:false,error:'No tenés permiso para publicar por esa empresa.'},{status:403})}
 const version=text(b?.policy_version,40)||'2026-08-21'
 const consentRows=['terms','privacy','flex_publish_rules'].map(consent_type=>({user_id:user.id,consent_type,version,accepted:true,source:'flex_publish'}))
 const {error:consentErr}=await c.from('pm_consents').upsert(consentRows,{onConflict:'user_id,consent_type,version'});if(consentErr)return NextResponse.json({ok:false,error:'No pudimos registrar la aceptación de las reglas. Intentá nuevamente.'},{status:400})
 const row={publisher_user_id:user.id,company_id:companyId||null,title,category,description,location_text:location,compensation_text:compensation,duration_text:duration||null,scheduled_for:scheduled?new Date(scheduled).toISOString():null,verification_level:'basic',status:'published'}
 const {data,error}=await c.from('pm_flex_posts').insert(row).select('*').single();if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
 return NextResponse.json({ok:true,post:data})
}
