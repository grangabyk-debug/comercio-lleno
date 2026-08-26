import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const text=(v:unknown,n=1800)=>String(v??'').trim().slice(0,n)
function normalized(v:unknown){return text(v,2600).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9$+\s-]/g,' ').replace(/\s+/g,' ').trim()}
function employmentLikeService(values:{title:string;category:string;description:string;duration:string;compensation:string;availability:string}){
 const hay=normalized(`${values.title} ${values.category} ${values.description} ${values.duration} ${values.compensation} ${values.availability}`)
 const hardRole=/\b(ninera|ninero|babysitter|empleada domestica|empleado domestico|personal domestico|personal de casas particulares|ama de llaves)\b/
 if(hardRole.test(hay))return true
 const strongEmployment=/\b(relacion de dependencia|relacion laboral|puesto de trabajo|puesto laboral|vacante|sueldo|salario|jornada laboral|full time|part time|media jornada|empleado|empleada|incorporacion inmediata|obra social|aguinaldo|presentismo|franco semanal|contrato laboral)\b/
 if(strongEmployment.test(hay))return true
 const role=/\b(cajero|cajera|vendedor|vendedora|repositor|repositora|recepcionista|administrativo|administrativa|secretario|secretaria|operario|operaria|mozo|moza|camarero|camarera|cocinero|cocinera|bachero|bachera|chofer|conductor|conductora|sereno|vigilador|vigiladora|encargado|encargada|supervisor|supervisora|gerente|telemarketer|promotor|promotora|playero|playera|cuidador|cuidadora)\b/
 const hiring=/\b(se busca|buscamos|busco|se necesita|necesitamos|contratamos|para cubrir|cubrir puesto|reemplazo de personal|turno fijo|horario fijo|lunes a viernes|lunes a sabado|todos los dias|cada semana|semanal|mensual|permanente|estable)\b/
 return role.test(hay)&&hiring.test(hay)
}

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

 const{data:post,error:readErr}=await c.from('pm_flex_posts').select('id,title,category,description,location_text,compensation_text,duration_text,availability_text,listing_type,status,publisher_user_id').eq('id',postId).eq('publisher_user_id',user.id).maybeSingle()
 if(readErr)return NextResponse.json({ok:false,error:'No pudimos verificar la publicación.'},{status:400})
 if(!post)return NextResponse.json({ok:false,error:'No encontramos esa publicación dentro de tu cuenta.'},{status:404})
 const type=String(post.listing_type||'request')==='offer'?'offer':'request'

 if(action==='edit_description'){
  if(post.status!=='published')return NextResponse.json({ok:false,error:'Solo podés editar la descripción mientras la publicación está activa.'},{status:400})
  const description=text(body?.description,1800)
  if(description.length<15)return NextResponse.json({ok:false,error:'La descripción tiene que tener al menos 15 caracteres.'},{status:400})
  if(employmentLikeService({title:String(post.title||''),category:String(post.category||''),description,duration:String(post.duration_text||''),compensation:String(post.compensation_text||''),availability:String(post.availability_text||'')}))return NextResponse.json({ok:false,code:'employment_like_service',error:'La edición parece corresponder a una búsqueda laboral o relación de trabajo. Ese contenido debe publicarse en Empleos.'},{status:400})
  const{data:updated,error}=await c.from('pm_flex_posts').update({description,updated_at:new Date().toISOString()}).eq('id',postId).eq('publisher_user_id',user.id).eq('status','published').select('id,title,description,status,updated_at').maybeSingle()
  if(error||!updated)return NextResponse.json({ok:false,error:error?.message||'No pudimos guardar la descripción.'},{status:400})
  return NextResponse.json({ok:true,post:updated,message:'Descripción actualizada.'})
 }

 if(action==='edit_offer'){
  if(type!=='offer')return NextResponse.json({ok:false,error:'Esta edición completa está disponible para los servicios que ofrecés.'},{status:400})
  if(!['published','paused'].includes(String(post.status)))return NextResponse.json({ok:false,error:'Esta publicación ya no puede editarse.'},{status:400})
  const description=text(body?.description,1800),location=text(body?.location_text,180),compensation=text(body?.compensation_text,120),availability=text(body?.availability_text,120),duration=text(body?.duration_text,100)
  if(description.length<15||location.length<2)return NextResponse.json({ok:false,error:'Completá una descripción y una zona o modalidad válidas.'},{status:400})
  if(employmentLikeService({title:String(post.title||''),category:String(post.category||''),description,duration,compensation,availability}))return NextResponse.json({ok:false,code:'employment_like_service',error:'La edición parece corresponder a una búsqueda laboral o relación de trabajo. Servicio Flex es únicamente para prestaciones independientes.'},{status:400})
  const{data:updated,error}=await c.from('pm_flex_posts').update({description,location_text:location,compensation_text:compensation||null,availability_text:availability||null,duration_text:duration||null,updated_at:new Date().toISOString()}).eq('id',postId).eq('publisher_user_id',user.id).in('status',['published','paused']).select('id,title,description,location_text,compensation_text,availability_text,duration_text,status,updated_at').maybeSingle()
  if(error||!updated)return NextResponse.json({ok:false,error:error?.message||'No pudimos guardar los cambios.'},{status:400})
  return NextResponse.json({ok:true,post:updated,message:'Servicio actualizado.'})
 }

 if(action==='pause'){
  if(type!=='offer')return NextResponse.json({ok:false,error:'Sólo los servicios ofrecidos pueden pausarse.'},{status:400})
  if(post.status!=='published')return NextResponse.json({ok:false,error:'Este servicio ya no está activo.'},{status:400})
  const{data:updated,error}=await c.from('pm_flex_posts').update({status:'paused',updated_at:new Date().toISOString()}).eq('id',postId).eq('publisher_user_id',user.id).eq('status','published').select('id,title,status,updated_at').maybeSingle()
  if(error||!updated)return NextResponse.json({ok:false,error:error?.message||'No pudimos pausar el servicio.'},{status:400})
  return NextResponse.json({ok:true,post:updated,credit_refunded:false,message:'Servicio pausado. Podés reactivarlo cuando quieras sin consumir otro crédito.'})
 }

 if(action==='reactivate'){
  if(type!=='offer')return NextResponse.json({ok:false,error:'Sólo los servicios ofrecidos pueden reactivarse.'},{status:400})
  if(post.status!=='paused')return NextResponse.json({ok:false,error:'Este servicio no está pausado.'},{status:400})
  const{data:updated,error}=await c.from('pm_flex_posts').update({status:'published',updated_at:new Date().toISOString()}).eq('id',postId).eq('publisher_user_id',user.id).eq('status','paused').select('id,title,status,updated_at').maybeSingle()
  if(error||!updated)return NextResponse.json({ok:false,error:error?.message||'No pudimos reactivar el servicio.'},{status:400})
  return NextResponse.json({ok:true,post:updated,credit_refunded:false,message:'Servicio reactivado y visible nuevamente.'})
 }

 if(action==='finish'){
  if(!['published','paused'].includes(String(post.status)))return NextResponse.json({ok:false,error:'Esta publicación ya no está activa.'},{status:400})
  const{data:updated,error}=await c.from('pm_flex_posts').update({status:'closed',updated_at:new Date().toISOString()}).eq('id',postId).eq('publisher_user_id',user.id).in('status',['published','paused']).select('id,title,status,updated_at').maybeSingle()
  if(error||!updated)return NextResponse.json({ok:false,error:error?.message||'No pudimos finalizar la publicación.'},{status:400})
  await c.from('pm_flex_favorites').delete().eq('post_id',postId)
  return NextResponse.json({ok:true,post:updated,credit_refunded:false,message:'Publicación finalizada. El crédito Flex utilizado no se devuelve.'})
 }

 if(action==='remove'){
  if(!['published','paused','closed'].includes(String(post.status)))return NextResponse.json({ok:false,error:'Esta publicación ya fue eliminada o no puede modificarse.'},{status:400})
  const{data:updated,error}=await c.from('pm_flex_posts').update({status:'removed',updated_at:new Date().toISOString()}).eq('id',postId).eq('publisher_user_id',user.id).in('status',['published','paused','closed']).select('id,title,status,updated_at').maybeSingle()
  if(error||!updated)return NextResponse.json({ok:false,error:error?.message||'No pudimos eliminar la publicación.'},{status:400})
  await c.from('pm_flex_favorites').delete().eq('post_id',postId)
  return NextResponse.json({ok:true,post:updated,credit_refunded:false,message:'Publicación eliminada. El crédito Flex utilizado no se devuelve.'})
 }

 return NextResponse.json({ok:false,error:'Acción inválida.'},{status:400})
}