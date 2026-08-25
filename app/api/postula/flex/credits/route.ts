import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const PERSONAL_MONTHLY_ALLOWANCE=2
const PERSONAL_WELCOME_BONUS=1
const COMPANY_ALLOWANCE:Record<string,number>={gratis:1,impulso:3,seleccion:5,escala:10,empresa:25}
function userDb(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
function adminDb(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;return key?createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}
function argentinaMonth(){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit'}).formatToParts(new Date())
 const year=Number(parts.find(p=>p.type==='year')?.value||new Date().getUTCFullYear()),month=Number(parts.find(p=>p.type==='month')?.value||1)
 return {key:`${year}-${String(month).padStart(2,'0')}`,expires:new Date(Date.UTC(year,month,1,3,0,0)).toISOString()}
}
function total(w:any){return Number(w?.free_remaining||0)+Number(w?.bonus_remaining||0)+Math.max(0,Number(w?.period_allowance||0)-Number(w?.period_used||0))+Number(w?.purchased_remaining||0)}
async function ensureWallet(admin:any,scope:string,seed:any){
 const first=await admin.from('pm_flex_credit_wallets').select('*').eq('scope_key',scope).maybeSingle()
 if(first.error)throw first.error
 if(first.data)return first.data
 const inserted=await admin.from('pm_flex_credit_wallets').insert({scope_key:scope,...seed}).select('*').maybeSingle()
 if(inserted.error&&inserted.error.code!=='23505')throw inserted.error
 if(inserted.data)return inserted.data
 const reread=await admin.from('pm_flex_credit_wallets').select('*').eq('scope_key',scope).maybeSingle()
 if(reread.error||!reread.data)throw reread.error||new Error('No pudimos crear el saldo de Trabajo Flex.')
 return reread.data
}
async function ensurePersonal(admin:any,userId:string){
 const scope=`user:${userId}`,monthly=argentinaMonth(),baseKey=`personal-free:${monthly.key}`
 let w=await ensureWallet(admin,scope,{owner_user_id:userId,free_remaining:0,bonus_remaining:PERSONAL_WELCOME_BONUS,period_allowance:PERSONAL_MONTHLY_ALLOWANCE,period_used:0,period_key:baseKey,period_expires_at:monthly.expires,purchased_remaining:0})
 const {data:session,error:sessionError}=await admin.from('cv_ai_sessions').select('id,plan,entitlement_until,updated_at').eq('user_id',userId).order('updated_at',{ascending:false}).limit(1).maybeSingle()
 if(sessionError)throw sessionError
 let allowance=PERSONAL_MONTHLY_ALLOWANCE,periodKey=baseKey,expires=monthly.expires
 if(session?.plan==='active'&&(!session.entitlement_until||new Date(session.entitlement_until).getTime()>Date.now())){
  allowance=5;expires=session.entitlement_until||new Date(Date.now()+30*86400000).toISOString();periodKey=`candidate-active:${session.id}:${expires.slice(0,10)}`
 }
 const periodPatch=w.period_key===periodKey?{period_allowance:allowance,period_expires_at:expires,updated_at:new Date().toISOString()}:{period_allowance:allowance,period_used:0,period_key:periodKey,period_expires_at:expires,updated_at:new Date().toISOString()}
 const periodUpdate=await admin.from('pm_flex_credit_wallets').update(periodPatch).eq('scope_key',scope).select('*').single()
 if(periodUpdate.error)throw periodUpdate.error
 w=periodUpdate.data
 if(session?.plan==='pro'){
  const grantKey=`candidate-pro:${session.id}`
  const {data:grant,error:grantReadError}=await admin.from('pm_flex_credit_grants').select('id').eq('scope_key',scope).eq('grant_key',grantKey).maybeSingle()
  if(grantReadError)throw grantReadError
  if(!grant){
   const created=await admin.from('pm_flex_credit_grants').insert({scope_key:scope,grant_key:grantKey,credits:2,grant_type:'candidate_pro'}).select('id').maybeSingle()
   if(created.error&&created.error.code!=='23505')throw created.error
   if(created.data){const bonus=await admin.from('pm_flex_credit_wallets').update({bonus_remaining:Number(w?.bonus_remaining||0)+2,updated_at:new Date().toISOString()}).eq('scope_key',scope).select('*').single();if(bonus.error)throw bonus.error;w=bonus.data}
  }
 }
 return {...w,total:total(w),label:'Mi cuenta',monthly_allowance:PERSONAL_MONTHLY_ALLOWANCE,welcome_bonus:PERSONAL_WELCOME_BONUS}
}
async function ensureCompany(admin:any,company:any){
 const scope=`company:${company.company_id}`,monthly=argentinaMonth()
 let w=await ensureWallet(admin,scope,{company_id:company.company_id,free_remaining:0,bonus_remaining:0,period_allowance:0,period_used:0,purchased_remaining:0})
 const {data:sub,error:subError}=await admin.from('pm_company_subscriptions').select('plan,status,current_period_end').eq('company_id',company.company_id).maybeSingle()
 if(subError)throw subError
 const plan=sub?.status==='authorized'?String(sub.plan||'gratis'):'gratis',allowance=COMPANY_ALLOWANCE[plan]??1
 const expires=sub?.current_period_end&&new Date(sub.current_period_end).getTime()>Date.now()?sub.current_period_end:monthly.expires,periodKey=`company:${plan}:${expires.slice(0,10)}`
 const patch=w.period_key===periodKey?{period_allowance:allowance,period_expires_at:expires,updated_at:new Date().toISOString()}:{period_allowance:allowance,period_used:0,period_key:periodKey,period_expires_at:expires,updated_at:new Date().toISOString()}
 const updated=await admin.from('pm_flex_credit_wallets').update(patch).eq('scope_key',scope).select('*').single()
 if(updated.error)throw updated.error
 w=updated.data
 return {...w,total:total(w),label:company.pm_companies?.name||'Empresa',plan}
}
export async function GET(req:NextRequest){
 try{
  const db=userDb(req),admin=adminDb(),{data:{user}}=await db.auth.getUser()
  if(!user)return NextResponse.json({ok:false,error:'Iniciá sesión para consultar tus créditos.'},{status:401})
  if(!admin)return NextResponse.json({ok:false,error:'Créditos temporalmente no disponibles.'},{status:503})
  const personal=await ensurePersonal(admin,user.id)
  const memberResult=await db.from('pm_company_members').select('company_id,role,pm_companies(name)').eq('user_id',user.id).eq('status','active').in('role',['owner','admin','recruiter']).limit(10)
  if(memberResult.error)throw memberResult.error
  const companies=[] as any[]
  for(const member of memberResult.data||[])companies.push(await ensureCompany(admin,member))
  return NextResponse.json({ok:true,personal,companies,packs:[{code:'flex1',credits:1,amount:1990,label:'1 publicación'},{code:'flex5',credits:5,amount:7900,label:'5 publicaciones'},{code:'flex10',credits:10,amount:13900,label:'10 publicaciones'}]})
 }catch(error){
  console.error('flex_credits_load_failed',error)
  return NextResponse.json({ok:false,error:'No pudimos consultar tus créditos ahora. Reintentá en unos segundos.'},{status:500})
 }
}
