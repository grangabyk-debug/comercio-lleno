import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
const URL='https://pejkycdttogpmmdntzuq.supabase.co',KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const PACKS={flex1:{credits:1,amount:995,label:'1 publicación de Servicios Flex'},flex5:{credits:5,amount:3950,label:'5 publicaciones de Servicios Flex'},flex10:{credits:10,amount:6950,label:'10 publicaciones de Servicios Flex'}} as const
type Pack=keyof typeof PACKS
function userDb(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}
function adminDb(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;return key?createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}
function mercadoPagoToken(){return process.env.POSTULA_MERCADOPAGO_ACCESS_TOKEN||process.env.MERCADOPAGO_ACCESS_TOKEN||process.env.MP_ACCESS_TOKEN||''}
export async function POST(req:NextRequest){
 const db=userDb(req),admin=adminDb(),{data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({ok:false,error:'Primero creá o iniciá sesión.'},{status:401});if(!admin)return NextResponse.json({ok:false,error:'El cobro de créditos todavía no está disponible.'},{status:503})
 const b=await req.json().catch(()=>({})),pack=String(b?.pack||'') as Pack,companyId=String(b?.company_id||'').trim()||null
 if(!(pack in PACKS))return NextResponse.json({ok:false,error:'Pack inválido.'},{status:400})
 if(companyId){const {data:member}=await db.from('pm_company_members').select('company_id').eq('company_id',companyId).eq('user_id',user.id).eq('status','active').limit(1).maybeSingle();if(!member)return NextResponse.json({ok:false,error:'No tenés permiso para comprar créditos para esa empresa.'},{status:403})}
 const token=mercadoPagoToken();if(!token)return NextResponse.json({ok:false,code:'billing_not_configured',error:'Mercado Pago todavía no está vinculado a esta instalación. No se realizó ningún cargo.'},{status:503})
 const chosen=PACKS[pack]
 const {data:purchase,error:pErr}=await admin.from('pm_flex_credit_purchases').insert({buyer_user_id:user.id,company_id:companyId,pack_code:pack,credits:chosen.credits,amount_ars:chosen.amount,status:'pending',provider:'mercadopago',external_reference:`pending:${crypto.randomUUID()}`}).select('*').single()
 if(pErr||!purchase)return NextResponse.json({ok:false,error:pErr?.message||'No pudimos iniciar la compra.'},{status:500})
 const externalReference=`postula-flex:${purchase.id}`
 await admin.from('pm_flex_credit_purchases').update({external_reference:externalReference}).eq('id',purchase.id)
 const response=await fetch('https://api.mercadopago.com/checkout/preferences',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({items:[{title:`Postulá Mejor · ${chosen.label}`,quantity:1,currency_id:'ARS',unit_price:chosen.amount}],payer:{email:user.email},external_reference:externalReference,back_urls:{success:`https://postulamejor.com/servicios-flex?flex_payment=success&purchase=${purchase.id}`,pending:`https://postulamejor.com/servicios-flex?flex_payment=pending&purchase=${purchase.id}`,failure:`https://postulamejor.com/servicios-flex?flex_payment=failure&purchase=${purchase.id}`},auto_return:'approved',notification_url:'https://postulamejor.com/api/postula/flex/credits/webhook',statement_descriptor:'POSTULA MEJOR'})})
 const payload=await response.json().catch(()=>({}))
 if(!response.ok||!payload?.init_point){await admin.from('pm_flex_credit_purchases').update({status:'failed',updated_at:new Date().toISOString()}).eq('id',purchase.id);return NextResponse.json({ok:false,error:payload?.message||'No pudimos abrir Mercado Pago.'},{status:502})}
 await admin.from('pm_flex_credit_purchases').update({provider_preference_id:payload.id||null,updated_at:new Date().toISOString()}).eq('id',purchase.id)
 return NextResponse.json({ok:true,purchase_id:purchase.id,init_point:payload.init_point})
}
