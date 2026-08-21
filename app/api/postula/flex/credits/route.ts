import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const COMPANY_ALLOWANCE:Record<string,number>={gratis:1,impulso:3,seleccion:5,escala:10,empresa:25}
function userDb(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
function adminDb(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;return key?createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}
function monthEnd(){const d=new Date();return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1)-1).toISOString()}
function total(w:any){return Number(w?.free_remaining||0)+Number(w?.bonus_remaining||0)+Math.max(0,Number(w?.period_allowance||0)-Number(w?.period_used||0))+Number(w?.purchased_remaining||0)}
async function ensurePersonal(admin:any,userId:string){
 const scope=`user:${userId}`
 let {data:w}=await admin.from('pm_flex_credit_wallets').select('*').eq('scope_key',scope).maybeSingle()
 if(!w){const r=await admin.from('pm_flex_credit_wallets').insert({scope_key:scope,owner_user_id:userId,free_remaining:1}).select('*').single();w=r.data}
 const {data:session}=await admin.from('cv_ai_sessions').select('id,plan,entitlement_until,updated_at').eq('user_id',userId).order('updated_at',{ascending:false}).limit(1).maybeSingle()
 if(session?.plan==='pro'){
  const grantKey=`candidate-pro:${session.id}`
  const {data:grant}=await admin.from('pm_flex_credit_grants').select('id').eq('scope_key',scope).eq('grant_key',grantKey).maybeSingle()
  if(!grant){await admin.from('pm_flex_credit_grants').insert({scope_key:scope,grant_key:grantKey,credits:2,grant_type:'candidate_pro'});await admin.from('pm_flex_credit_wallets').update({bonus_remaining:Number(w?.bonus_remaining||0)+2,updated_at:new Date().toISOString()}).eq('scope_key',scope)}
 }
 if(session?.plan==='active'&&(!session.entitlement_until||new Date(session.entitlement_until).getTime()>Date.now())){
  const expires=session.entitlement_until||new Date(Date.now()+30*86400000).toISOString(),periodKey=`candidate-active:${session.id}:${expires.slice(0,10)}`
  const {data:current}=await admin.from('pm_flex_credit_wallets').select('*').eq('scope_key',scope).single()
  const patch=current.period_key===periodKey?{period_allowance:5,period_expires_at:expires,updated_at:new Date().toISOString()}:{period_allowance:5,period_used:0,period_key:periodKey,period_expires_at:expires,updated_at:new Date().toISOString()}
  await admin.from('pm_flex_credit_wallets').update(patch).eq('scope_key',scope)
 }
 const {data:final}=await admin.from('pm_flex_credit_wallets').select('*').eq('scope_key',scope).single()
 return {...final,total:total(final),label:'Mi cuenta'}
}
async function ensureCompany(admin:any,company:any){
 const scope=`company:${company.company_id}`
 let {data:w}=await admin.from('pm_flex_credit_wallets').select('*').eq('scope_key',scope).maybeSingle()
 if(!w){const r=await admin.from('pm_flex_credit_wallets').insert({scope_key:scope,company_id:company.company_id,free_remaining:0}).select('*').single();w=r.data}
 const {data:sub}=await admin.from('pm_company_subscriptions').select('plan,status,current_period_end').eq('company_id',company.company_id).maybeSingle()
 const plan=sub?.status==='authorized'?String(sub.plan||'gratis'):'gratis',allowance=COMPANY_ALLOWANCE[plan]??1
 const expires=sub?.current_period_end&&new Date(sub.current_period_end).getTime()>Date.now()?sub.current_period_end:monthEnd(),periodKey=`company:${plan}:${expires.slice(0,10)}`
 const patch=w.period_key===periodKey?{period_allowance:allowance,period_expires_at:expires,updated_at:new Date().toISOString()}:{period_allowance:allowance,period_used:0,period_key:periodKey,period_expires_at:expires,updated_at:new Date().toISOString()}
 await admin.from('pm_flex_credit_wallets').update(patch).eq('scope_key',scope)
 const {data:final}=await admin.from('pm_flex_credit_wallets').select('*').eq('scope_key',scope).single()
 return {...final,total:total(final),label:company.pm_companies?.name||'Empresa',plan}
}
export async function GET(req:NextRequest){
 const db=userDb(req),admin=adminDb(),{data:{user}}=await db.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión para consultar tus créditos.'},{status:401})
 if(!admin)return NextResponse.json({ok:false,error:'Créditos temporalmente no disponibles.'},{status:503})
 const personal=await ensurePersonal(admin,user.id)
 const {data:members}=await db.from('pm_company_members').select('company_id,role,pm_companies(name)').eq('user_id',user.id).eq('status','active').in('role',['owner','admin','recruiter']).limit(10)
 const companies=[] as any[]
 for(const member of members||[])companies.push(await ensureCompany(admin,member))
 return NextResponse.json({ok:true,personal,companies,packs:[{code:'flex1',credits:1,amount:1990,label:'1 publicación'},{code:'flex5',credits:5,amount:7900,label:'5 publicaciones'},{code:'flex10',credits:10,amount:13900,label:'10 publicaciones'}]})
}
