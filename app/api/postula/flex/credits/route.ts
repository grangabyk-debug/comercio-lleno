import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
function userDb(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}

export async function GET(req:NextRequest){
 try{
  const db=userDb(req),{data:{user},error:userError}=await db.auth.getUser()
  if(userError||!user)return NextResponse.json({ok:false,error:'Iniciá sesión para consultar tus créditos.'},{status:401})

  const personalResult=await db.rpc('pm_get_personal_flex_wallet')
  if(personalResult.error)throw personalResult.error
  const personal=personalResult.data

  const memberResult=await db.from('pm_company_members').select('company_id,role,pm_companies(name)').eq('user_id',user.id).eq('status','active').in('role',['owner','admin','recruiter']).limit(10)
  if(memberResult.error)throw memberResult.error
  const companies=[] as any[]
  for(const member of memberResult.data||[]){
   const companyResult=await db.rpc('pm_get_company_flex_wallet',{p_company_id:member.company_id})
   if(companyResult.error)throw companyResult.error
   companies.push(companyResult.data)
  }

  return NextResponse.json({ok:true,personal,companies,packs:[{code:'flex1',credits:1,amount:1990,label:'1 publicación'},{code:'flex5',credits:5,amount:7900,label:'5 publicaciones'},{code:'flex10',credits:10,amount:13900,label:'10 publicaciones'}]})
 }catch(error){
  console.error('flex_credits_load_failed',error)
  return NextResponse.json({ok:false,error:'No pudimos consultar tus créditos ahora. Reintentá en unos segundos.'},{status:500})
 }
}
