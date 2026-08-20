import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
function db(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
const txt=(v:unknown,n=180)=>String(v??'').trim().slice(0,n)
async function hash(v:string){const raw=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return Array.from(new Uint8Array(raw),x=>x.toString(16).padStart(2,'0')).join('')}
function token(){const a=new Uint8Array(24);crypto.getRandomValues(a);return Array.from(a,x=>x.toString(16).padStart(2,'0')).join('')}
function first<T>(value:T|T[]|null|undefined){return Array.isArray(value)?value[0]??null:value??null}

export async function GET(req:NextRequest){
 const c=db(req)
 const {data:{user}}=await c.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const company=req.nextUrl.searchParams.get('company')||''
 const [{data:members,error:mErr},{data:invites,error:iErr}]=await Promise.all([
  c.from('pm_company_members').select('company_id,user_id,role,status,created_at').eq('company_id',company),
  c.from('pm_company_invites').select('id,email,role,status,expires_at,created_at').eq('company_id',company).order('created_at',{ascending:false})
 ])
 if(mErr||iErr)return NextResponse.json({ok:false,error:mErr?.message||iErr?.message},{status:403})
 return NextResponse.json({ok:true,members:members||[],invites:invites||[]})
}

export async function POST(req:NextRequest){
 const c=db(req)
 const {data:{user}}=await c.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const b=await req.json().catch(()=>({})),company=txt(b?.company_id,80),email=txt(b?.email,180).toLowerCase(),role=txt(b?.role,40)
 if(!company||!/^\S+@\S+\.\S+$/.test(email)||!['admin','recruiter','hiring_manager','viewer'].includes(role))return NextResponse.json({ok:false,error:'Email o rol inválido.'},{status:400})
 const raw=token(),tokenHash=await hash(raw)
 const {data,error}=await c.from('pm_company_invites').insert({company_id:company,email,role,token_hash:tokenHash,invited_by:user.id}).select('id,email,role,status,expires_at').single()
 if(error)return NextResponse.json({ok:false,error:error.message},{status:403})
 return NextResponse.json({ok:true,invite:data,invite_url:`/empresas/invitacion?token=${raw}`})
}

export async function PATCH(req:NextRequest){
 const c=db(req)
 const {data:{user}}=await c.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión.'},{status:401})
 const b=await req.json().catch(()=>({})),company=txt(b?.company_id,80),member=txt(b?.user_id,80),role=txt(b?.role,40),status=txt(b?.status,20)
 if(!company||!member||!['admin','recruiter','hiring_manager','viewer'].includes(role)||!['active','disabled'].includes(status))return NextResponse.json({ok:false,error:'Rol o estado inválido.'},{status:400})
 const {data,error}=await c.rpc('pm_update_company_member',{p_company_id:company,p_user_id:member,p_role:role,p_status:status})
 if(error)return NextResponse.json({ok:false,error:/owner role|forbidden/i.test(error.message)?'Ese cambio de permisos no está permitido.':error.message},{status:/owner role|forbidden/i.test(error.message)?403:400})
 return NextResponse.json({ok:true,member:first(data)})
}
