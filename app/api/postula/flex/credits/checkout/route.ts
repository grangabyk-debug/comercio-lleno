import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const FLEX_BILLING_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/postula-flex-billing'
const PACKS={flex1:{credits:1,amount:995},flex5:{credits:5,amount:3950},flex10:{credits:10,amount:6950}} as const
type Pack=keyof typeof PACKS
function userDb(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}

export async function POST(req:NextRequest){
 const auth=req.headers.get('authorization')||''
 const db=userDb(req),{data:{user}}=await db.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Primero creá o iniciá sesión.'},{status:401})
 const b=await req.json().catch(()=>({})),pack=String(b?.pack||'') as Pack,companyId=String(b?.company_id||'').trim()||null
 if(!(pack in PACKS))return NextResponse.json({ok:false,error:'Pack inválido.'},{status:400})
 if(companyId){
  const {data:member}=await db.from('pm_company_members').select('company_id').eq('company_id',companyId).eq('user_id',user.id).eq('status','active').limit(1).maybeSingle()
  if(!member)return NextResponse.json({ok:false,error:'No tenés permiso para comprar créditos para esa empresa.'},{status:403})
 }

 const response=await fetch(`${FLEX_BILLING_API}?action=create`,{
  method:'POST',
  headers:{Authorization:auth,'Content-Type':'application/json'},
  body:JSON.stringify({pack,company_id:companyId}),
  cache:'no-store',
 })
 const payload=await response.json().catch(()=>({}))
 const chosen=PACKS[pack]
 if(!response.ok||!payload?.ok||!payload?.init_point||Number(payload?.price)!==chosen.amount||Number(payload?.credits)!==chosen.credits||String(payload?.pack)!==pack){
  return NextResponse.json({ok:false,error:payload?.error||'No pudimos abrir Mercado Pago.'},{status:response.ok?502:response.status})
 }
 return NextResponse.json({ok:true,purchase_id:String(payload.purchase_id||''),init_point:String(payload.init_point)})
}
