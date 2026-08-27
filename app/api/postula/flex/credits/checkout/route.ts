import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const PAYMENT_API='https://wtcntclzcubkbtcsqkzc.supabase.co/functions/v1/postula-company-purchase'
const PACKS={flex1:{credits:1,amount:995,label:'1 publicación de Servicios Flex'},flex5:{credits:5,amount:3950,label:'5 publicaciones de Servicios Flex'},flex10:{credits:10,amount:6950,label:'10 publicaciones de Servicios Flex'}} as const
type Pack=keyof typeof PACKS
function userDb(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
function adminDb(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;return key?createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}

export async function POST(req:NextRequest){
 const db=userDb(req),admin=adminDb(),{data:{user}}=await db.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Primero creá o iniciá sesión.'},{status:401})
 if(!admin)return NextResponse.json({ok:false,error:'El cobro de créditos todavía no está disponible.'},{status:503})
 const b=await req.json().catch(()=>({})),pack=String(b?.pack||'') as Pack,companyId=String(b?.company_id||'').trim()||null
 if(!(pack in PACKS))return NextResponse.json({ok:false,error:'Pack inválido.'},{status:400})
 if(companyId){
  const {data:member}=await db.from('pm_company_members').select('company_id').eq('company_id',companyId).eq('user_id',user.id).eq('status','active').limit(1).maybeSingle()
  if(!member)return NextResponse.json({ok:false,error:'No tenés permiso para comprar créditos para esa empresa.'},{status:403})
 }
 const chosen=PACKS[pack]
 const {data:purchase,error:pErr}=await admin.from('pm_flex_credit_purchases').insert({buyer_user_id:user.id,company_id:companyId,pack_code:pack,credits:chosen.credits,amount_ars:chosen.amount,status:'pending',provider:'mercadopago',external_reference:`pending:${crypto.randomUUID()}`}).select('*').single()
 if(pErr||!purchase)return NextResponse.json({ok:false,error:pErr?.message||'No pudimos iniciar la compra.'},{status:500})
 const externalReference=`postula-flex:${purchase.id}`
 await admin.from('pm_flex_credit_purchases').update({external_reference:externalReference}).eq('id',purchase.id)

 const response=await fetch(`${PAYMENT_API}?action=flex-checkout`,{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({pack,purchase_id:purchase.id,email:user.email,return_to:companyId?'company':'public'}),
  cache:'no-store',
 })
 const payload=await response.json().catch(()=>({}))
 if(!response.ok||!payload?.ok||!payload?.init_point||Number(payload?.price)!==chosen.amount||Number(payload?.credits)!==chosen.credits||String(payload?.pack)!==pack){
  await admin.from('pm_flex_credit_purchases').update({status:'failed',updated_at:new Date().toISOString()}).eq('id',purchase.id)
  return NextResponse.json({ok:false,error:payload?.error||'No pudimos abrir Mercado Pago.'},{status:502})
 }
 await admin.from('pm_flex_credit_purchases').update({provider_preference_id:String(payload.preference_id||'')||null,updated_at:new Date().toISOString()}).eq('id',purchase.id)
 return NextResponse.json({ok:true,purchase_id:purchase.id,init_point:String(payload.init_point)})
}
