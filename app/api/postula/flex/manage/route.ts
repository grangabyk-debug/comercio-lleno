import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const text=(v:unknown,n=1800)=>String(v??'').trim().slice(0,n)

function db(req:NextRequest){
 const auth=req.headers.get('authorization')||''
 const options:any={auth:{persistSession:false,autoRefreshToken:false}}
 if(auth)options.global={headers:{Authorization:auth}}
 return createClient(URL,KEY,options)
}

export async function POST(req:NextRequest){
 const c=db(req)
 const{data:{user}}=await c.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión para administrar tus publicaciones.'},{status:401})

 const body=await req.json().catch(()=>({}))
 const action=text(body?.action,40)
 const postId=text(body?.post_id,80)
 if(!postId)return NextResponse.json({ok:false,error:'Publicación inválida.'},{status:400})

 const{data:post,error:readErr}=await c.from('pm_flex_posts').select('id,title,description,status,publisher_user_id').eq('id',postId).eq('publisher_user_id',user.id).maybeSingle()
 if(readErr)return NextResponse.json({ok:false,error:'No pudimos verificar la publicación.'},{status:400})
 if(!post)return NextResponse.json({ok:false,error:'No encontramos esa publicación dentro de tu cuenta.'},{status:404})

 if(action==='edit_description'){
  if(post.status!=='published')return NextResponse.json({ok:false,error:'Solo podés editar la descripción mientras la publicación está activa.'},{status:400})
  const description=text(body?.description,1800)
  if(description.length<15)return NextResponse.json({ok:false,error:'La descripción tiene que tener al menos 15 caracteres.'},{status:400})
  const{data:updated,error}=await c.from('pm_flex_posts').update({description,updated_at:new Date().toISOString()}).eq('id',postId).eq('publisher_user_id',user.id).eq('status','published').select('id,title,description,status,updated_at').maybeSingle()
  if(error||!updated)return NextResponse.json({ok:false,error:error?.message||'No pudimos guardar la descripción.'},{status:400})
  return NextResponse.json({ok:true,post:updated,message:'Descripción actualizada.'})
 }

 if(action==='finish'){
  if(post.status!=='published')return NextResponse.json({ok:false,error:'Esta publicación ya no está activa.'},{status:400})
  const{data:updated,error}=await c.from('pm_flex_posts').update({status:'closed',updated_at:new Date().toISOString()}).eq('id',postId).eq('publisher_user_id',user.id).eq('status','published').select('id,title,status,updated_at').maybeSingle()
  if(error||!updated)return NextResponse.json({ok:false,error:error?.message||'No pudimos finalizar la publicación.'},{status:400})
  await c.from('pm_flex_favorites').delete().eq('post_id',postId)
  return NextResponse.json({ok:true,post:updated,credit_refunded:false,message:'Publicación finalizada. El crédito Flex utilizado no se devuelve.'})
 }

 if(action==='remove'){
  if(!['published','closed'].includes(String(post.status)))return NextResponse.json({ok:false,error:'Esta publicación ya fue eliminada o no puede modificarse.'},{status:400})
  const{data:updated,error}=await c.from('pm_flex_posts').update({status:'removed',updated_at:new Date().toISOString()}).eq('id',postId).eq('publisher_user_id',user.id).in('status',['published','closed']).select('id,title,status,updated_at').maybeSingle()
  if(error||!updated)return NextResponse.json({ok:false,error:error?.message||'No pudimos eliminar la publicación.'},{status:400})
  await c.from('pm_flex_favorites').delete().eq('post_id',postId)
  return NextResponse.json({ok:true,post:updated,credit_refunded:false,message:'Publicación eliminada. El crédito Flex utilizado no se devuelve.'})
 }

 return NextResponse.json({ok:false,error:'Acción inválida.'},{status:400})
}
