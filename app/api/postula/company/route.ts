import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
function db(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
const txt=(v:unknown,n=180)=>String(v??'').trim().slice(0,n)
function first<T>(value:T|T[]|null|undefined){return Array.isArray(value)?value[0]??null:value??null}

export async function GET(req:NextRequest){
 const client=db(req)
 const {data:{user}}=await client.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const {data:members,error}=await client.from('pm_company_members').select('company_id,role,status,pm_companies(*)').eq('user_id',user.id).eq('status','active')
 if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
 return NextResponse.json({ok:true,memberships:members||[]})
}

export async function POST(req:NextRequest){
 const client=db(req)
 const {data:{user}}=await client.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const body=await req.json().catch(()=>({}))
 const name=txt(body?.name,120),city=txt(body?.city,100),province=txt(body?.province,100),website=txt(body?.website,300),phone=txt(body?.phone,60),industry=txt(body?.industry,120),responsible=txt(body?.responsible_role,100),tax=txt(body?.tax_id,40)
 if(name.length<2||city.length<2||phone.length<6||industry.length<2||responsible.length<2)return NextResponse.json({ok:false,error:'Completá nombre, actividad, ciudad, teléfono y tu rol.'},{status:400})
 const {data:companyId,error}=await client.rpc('pm_create_company',{p_name:name,p_city:city,p_province:province||null,p_website:website||null,p_phone:phone})
 if(error||!companyId)return NextResponse.json({ok:false,error:error?.message||'No pudimos crear la empresa.'},{status:400})
 const {error:updateError}=await client.rpc('pm_update_company_profile',{p_company_id:companyId,p_patch:{industry,responsible_role:responsible,tax_id:tax||null}})
 if(updateError)return NextResponse.json({ok:false,error:updateError.message},{status:400})
 return NextResponse.json({ok:true,company_id:companyId,verification_status:'basic',trust_score:website?55:45})
}

export async function PATCH(req:NextRequest){
 const client=db(req)
 const {data:{user}}=await client.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const b=await req.json().catch(()=>({}))
 const id=txt(b?.company_id,80)
 if(!id)return NextResponse.json({ok:false,error:'Empresa inválida.'},{status:400})
 const patch:Record<string,string|null>={}
 for(const [key,max] of [['name',120],['legal_name',180],['city',100],['province',100],['website',300],['work_email_domain',180],['phone',60],['description',2000],['industry',120],['responsible_role',100],['tax_id',40]] as const){
  if(key in b)patch[key]=txt(b[key],max)||null
 }
 if(!Object.keys(patch).length)return NextResponse.json({ok:false,error:'No hay cambios para guardar.'},{status:400})
 const {data,error}=await client.rpc('pm_update_company_profile',{p_company_id:id,p_patch:patch})
 if(error)return NextResponse.json({ok:false,error:/forbidden/i.test(error.message)?'No tenés permiso para editar esta empresa.':error.message},{status:/forbidden/i.test(error.message)?403:400})
 return NextResponse.json({ok:true,company:first(data)})
}
