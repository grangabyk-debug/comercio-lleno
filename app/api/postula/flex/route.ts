import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const FLEX_PUBLIC=`${URL}/storage/v1/object/public/postula-flex-media/`
const BRAND_PUBLIC=`${URL}/storage/v1/object/public/postula-branding/`
const text=(v:unknown,n=900)=>String(v??'').trim().slice(0,n)
function db(req:NextRequest){const auth=req.headers.get('authorization')||'';const options:any={auth:{persistSession:false,autoRefreshToken:false}};if(auth)options.global={headers:{Authorization:auth}};return createClient(URL,KEY,options)}
function objectUrl(base:string,path:string){return base+path.split('/').map(encodeURIComponent).join('/')}
function firstName(v:string){return v.split(/\s+/).filter(Boolean)[0]||'Persona'}
function external(v:unknown){const s=text(v,800);return /^https?:\/\//i.test(s)?s:''}
const PUBLIC_FIELDS='id,title,category,description,location_text,compensation_text,duration_text,scheduled_for,verification_level,status,created_at,company_id,publisher_user_id,image_path,image_source,image_status,public_identity,publisher_kind,publisher_display_name,publisher_avatar_url'

async function decoratePosts(c:any,posts:any[]){
 const avatarPaths=Array.from(new Set(posts.filter(p=>p?.public_identity!==false).map(p=>text(p?.publisher_avatar_url,600)).filter((p:string)=>p&&!/^https?:\/\//i.test(p)))) as string[]
 const signed=new Map<string,string>()
 if(avatarPaths.length){
  const{data}=await c.storage.from('postula-private').createSignedUrls(avatarPaths,60*60)
  for(const row of data||[])if(row?.path&&row?.signedUrl)signed.set(String(row.path),String(row.signedUrl))
 }
 return posts.map(p=>{
  const avatar=text(p.publisher_avatar_url,800)
  const publisherAvatar=p.public_identity===false?'':external(avatar)||(p.publisher_kind==='company'&&avatar?objectUrl(BRAND_PUBLIC,avatar):signed.get(avatar)||'')
  return {...p,image_url:p.image_path?objectUrl(FLEX_PUBLIC,String(p.image_path)):'',publisher_avatar_public:publisherAvatar}
 })
}

export async function GET(req:NextRequest){
 const c=db(req);const mine=req.nextUrl.searchParams.get('mine')==='1';const favoritesOnly=req.nextUrl.searchParams.get('favorites')==='1';const{data:{user}}=await c.auth.getUser()
 if(mine){
  if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
  const [{data:posts,error:pErr},{data:responses,error:rErr}]=await Promise.all([
   c.from('pm_flex_posts').select('*').eq('publisher_user_id',user.id).order('created_at',{ascending:false}).limit(50),
   c.from('pm_flex_responses').select('*,pm_flex_posts(title,location_text,compensation_text)').eq('candidate_user_id',user.id).order('created_at',{ascending:false}).limit(50),
  ])
  if(pErr||rErr)return NextResponse.json({ok:false,error:pErr?.message||rErr?.message},{status:400})
  return NextResponse.json({ok:true,posts:posts||[],responses:responses||[]})
 }
 let favoriteIds:string[]=[]
 if(user){const{data}=await c.from('pm_flex_favorites').select('post_id,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100);favoriteIds=(data||[]).map((x:any)=>String(x.post_id))}
 if(favoritesOnly){
  if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión para ver tus favoritos.'},{status:401})
  if(!favoriteIds.length)return NextResponse.json({ok:true,posts:[],favorites:[]})
  const{data,error}=await c.from('pm_flex_posts').select(PUBLIC_FIELDS).in('id',favoriteIds).eq('status','published')
  if(error)return NextResponse.json({ok:false,error:'No pudimos cargar tus favoritos.'},{status:400})
  const order=new Map(favoriteIds.map((id,i)=>[id,i]));const posts=[...(data||[])].sort((a:any,b:any)=>(order.get(String(a.id))??999)-(order.get(String(b.id))??999))
  return NextResponse.json({ok:true,posts:await decoratePosts(c,posts),favorites:favoriteIds})
 }
 const{data,error}=await c.from('pm_flex_posts').select(PUBLIC_FIELDS).eq('status','published').order('created_at',{ascending:false}).limit(60)
 if(error)return NextResponse.json({ok:false,error:'No pudimos cargar Servicios Flex.'},{status:400})
 return NextResponse.json({ok:true,posts:await decoratePosts(c,data||[]),favorites:favoriteIds})
}

export async function POST(req:NextRequest){
 const c=db(req);const{data:{user}}=await c.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Creá o iniciá sesión para continuar.'},{status:401})
 const b=await req.json().catch(()=>({}));const action=text(b?.action,30)||'create'
 if(action==='favorite'){
  const postId=text(b?.post_id,80),saved=b?.saved===true;if(!postId)return NextResponse.json({ok:false,error:'Publicación inválida.'},{status:400})
  const{data:post}=await c.from('pm_flex_posts').select('id').eq('id',postId).eq('status','published').maybeSingle();if(!post)return NextResponse.json({ok:false,error:'Este Servicio Flex ya no está disponible.'},{status:404})
  const{error}=saved?await c.from('pm_flex_favorites').upsert({user_id:user.id,post_id:postId},{onConflict:'user_id,post_id'}):await c.from('pm_flex_favorites').delete().eq('user_id',user.id).eq('post_id',postId)
  if(error)return NextResponse.json({ok:false,error:'No pudimos actualizar favoritos.'},{status:400});return NextResponse.json({ok:true,saved})
 }
 if(action==='respond'){
  const postId=text(b?.post_id,80),message=text(b?.message,1200)
  if(!postId||message.length<3)return NextResponse.json({ok:false,error:'Escribí un mensaje para contactar a quien publicó.'},{status:400})
  const{data:post}=await c.from('pm_flex_posts').select('id,publisher_user_id,status').eq('id',postId).eq('status','published').maybeSingle()
  if(!post)return NextResponse.json({ok:false,error:'Este Servicio Flex ya no está disponible.'},{status:404})
  if(String(post.publisher_user_id)===user.id)return NextResponse.json({ok:false,error:'No podés responder a tu propia publicación.'},{status:400})
  const{data:response,error}=await c.from('pm_flex_responses').insert({post_id:postId,candidate_user_id:user.id,message,status:'sent'}).select('id,status,created_at').single()
  if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
  const{data:conversation,error:convErr}=await c.rpc('pm_ensure_flex_conversation',{p_response:response.id})
  if(convErr||!conversation)return NextResponse.json({ok:false,error:convErr?.message||'No pudimos abrir la conversación.'},{status:400})
  const{error:msgErr}=await c.from('pm_messages').insert({conversation_id:conversation,sender_user_id:user.id,body:message,message_type:'text',metadata:{source:'services_flex_first_contact'}})
  if(msgErr)return NextResponse.json({ok:false,error:msgErr.message},{status:400})
  await c.from('pm_conversations').update({last_message_at:new Date().toISOString()}).eq('id',conversation)
  return NextResponse.json({ok:true,response,conversation_id:conversation})
 }
 if(action!=='create')return NextResponse.json({ok:false,error:'Acción inválida.'},{status:400})
 if(b?.responsibility_ack!==true)return NextResponse.json({ok:false,error:'Necesitás aceptar las reglas de publicación y asumir la responsabilidad de la publicación.'},{status:400})

 const now=new Date().toISOString()
 const{data:legalCheck,error:legalErr}=await c.from('pm_flex_legal_checks').select('id,result,answers,policy_version,expires_at').eq('user_id',user.id).eq('result','allowed').gt('expires_at',now).order('created_at',{ascending:false}).limit(1).maybeSingle()
 if(legalErr||!legalCheck)return NextResponse.json({ok:false,code:'legal_check_required',error:'Antes de publicar completá el encuadre de Servicios Flex. Cerrá este formulario y volvé a tocar Publicar servicio.'},{status:400})
 const legalAnswers=(legalCheck.answers||{}) as Record<string,unknown>
 if(legalAnswers.adult!==true||legalAnswers.one_off!==true||legalAnswers.recurring===true||legalAnswers.supervised===true||legalAnswers.role_replacement===true||legalAnswers.private_home===true||legalAnswers.platform_transport===true)return NextResponse.json({ok:false,code:'legal_check_required',error:'El encuadre de esta publicación no corresponde a Servicios Flex. Revisá la clasificación antes de continuar.'},{status:400})

 const title=text(b?.title,140),category=text(b?.category,80),description=text(b?.description,1800),location=text(b?.location_text,180),compensation=text(b?.compensation_text,120),duration=text(b?.duration_text,100),scheduled=text(b?.scheduled_for,80),companyId=text(b?.company_id,80),imagePath=text(b?.image_path,600)
 if(title.length<5||category.length<2||description.length<15||location.length<2||compensation.length<2)return NextResponse.json({ok:false,error:'Completá título, categoría, descripción, zona e importe.'},{status:400})
 if(/repart|delivery|mensajer[ií]a|movilidad|traslado\s+de\s+personas/i.test(category))return NextResponse.json({ok:false,code:'restricted_category',error:'Reparto y movilidad no están habilitados dentro de Servicios Flex porque tienen un régimen específico para plataformas.'},{status:400})
 let company:any=null
 if(companyId){
  const{data:member}=await c.from('pm_company_members').select('role').eq('company_id',companyId).eq('user_id',user.id).eq('status','active').in('role',['owner','admin','recruiter']).maybeSingle();if(!member)return NextResponse.json({ok:false,error:'No tenés permiso para publicar por esa empresa.'},{status:403})
  const{data}=await c.from('pm_companies').select('id,name,logo_path').eq('id',companyId).maybeSingle();company=data
 }
 if(imagePath){const{data:review}=await c.from('pm_flex_media_reviews').select('id').eq('user_id',user.id).eq('public_path',imagePath).eq('status','approved').maybeSingle();if(!review)return NextResponse.json({ok:false,error:'La imagen todavía no pasó la verificación automática.'},{status:400})}
 const publicIdentity=b?.public_identity!==false
 let rawName='',avatar=''
 if(company){rawName=text(company.name,100)||'Empresa';avatar=text(company.logo_path,600)}else{const{data:profile}=await c.from('pm_profiles').select('display_name,avatar_url').eq('user_id',user.id).maybeSingle();rawName=text(profile?.display_name||user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split('@')[0],100)||'Persona';avatar=text(profile?.avatar_url||user.user_metadata?.avatar_url||user.user_metadata?.picture,800)}
 const publisherKind=company?'company':'person';const displayName=publicIdentity?rawName:(company?'Empresa':firstName(rawName));const publisherAvatar=publicIdentity?avatar:''
 const version=text(b?.policy_version,40)||'services-flex-2026-08-25';const consentRows=['terms','privacy','flex_publish_rules'].map(consent_type=>({user_id:user.id,consent_type,version,accepted:true,source:'services_flex_publish'}));const{error:consentErr}=await c.from('pm_consents').upsert(consentRows,{onConflict:'user_id,consent_type,version'});if(consentErr)return NextResponse.json({ok:false,error:'No pudimos registrar la aceptación de las reglas. Intentá nuevamente.'},{status:400})
 const scopeKey=`user:${user.id}`
 const{data,error}=await c.rpc('pm_publish_flex_with_credit',{p_scope_key:scopeKey,p_company_id:companyId||null,p_title:title,p_category:category,p_description:description,p_location_text:location,p_compensation_text:compensation,p_duration_text:duration,p_scheduled_for:scheduled?new Date(scheduled).toISOString():null})
 if(error){const noCredits=/no_flex_credits|wallet_not_found/i.test(error.message);return NextResponse.json({ok:false,code:noCredits?'no_credits':'publish_failed',error:noCredits?'No te quedan créditos para publicar. Podés usar un crédito incluido en tu cuenta o comprar un pack de Servicios Flex.':error.message},{status:noCredits?402:400})}
 const postId=text((data as any)?.id,80);let post:any=data
 if(postId){const{data:updated,error:updateErr}=await c.from('pm_flex_posts').update({image_path:imagePath||null,image_source:imagePath?'custom':'category',image_status:imagePath?'approved':'default',public_identity:publicIdentity,publisher_kind:publisherKind,publisher_display_name:displayName,publisher_avatar_url:publisherAvatar||null,legal_check_id:legalCheck.id}).eq('id',postId).select(PUBLIC_FIELDS).single();if(!updateErr&&updated)post=updated}
 const decorated=await decoratePosts(c,[post])
 return NextResponse.json({ok:true,post:decorated[0]||post})
}
