import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const PAYMENT_API='https://wtcntclzcubkbtcsqkzc.supabase.co/functions/v1/postula-company-purchase'
function adminDb(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;return key?createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}

export async function POST(req:NextRequest){
 const admin=adminDb()
 if(!admin)return NextResponse.json({ok:false,error:'Billing no configurado.'},{status:503})
 const b=await req.json().catch(()=>({}))
 const paymentId=String(req.nextUrl.searchParams.get('data.id')||req.nextUrl.searchParams.get('id')||b?.data?.id||b?.id||'').trim()
 if(!paymentId)return NextResponse.json({ok:true,ignored:true})

 const verifyResponse=await fetch(`${PAYMENT_API}?action=flex-verify`,{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({id:paymentId}),
  cache:'no-store',
 })
 const payment=await verifyResponse.json().catch(()=>({}))
 if(!verifyResponse.ok||!payment?.ok)return NextResponse.json({ok:false,error:payment?.error||'No pudimos verificar el pago.'},{status:502})
 if(payment?.ignored)return NextResponse.json({ok:true,ignored:true})

 const ref=String(payment?.external_reference||''),match=/^postula-flex:([0-9a-f-]{36})$/i.exec(ref)
 if(!match)return NextResponse.json({ok:true,ignored:true})
 const purchaseId=match[1]
 if(String(payment?.purchase_id||'')!==purchaseId)return NextResponse.json({ok:false,error:'Referencia de pago inválida.'},{status:400})
 const {data:purchase}=await admin.from('pm_flex_credit_purchases').select('*').eq('id',purchaseId).maybeSingle()
 if(!purchase)return NextResponse.json({ok:true,ignored:true})
 if(Number(payment?.transaction_amount)!==Number(purchase.amount_ars)||String(payment?.currency_id||'ARS')!=='ARS')return NextResponse.json({ok:false,error:'Monto inválido.'},{status:400})

 const verifiedPaymentId=String(payment?.payment_id||paymentId)
 if(String(payment?.status)==='approved'){
  const {data,error}=await admin.rpc('pm_flex_credit_approved_purchase',{p_purchase_id:purchaseId,p_payment_id:verifiedPaymentId})
  if(error)return NextResponse.json({ok:false,error:error.message},{status:500})
  return NextResponse.json({ok:true,credited:data})
 }
 await admin.from('pm_flex_credit_purchases').update({status:String(payment?.status||'pending'),provider_payment_id:verifiedPaymentId,updated_at:new Date().toISOString()}).eq('id',purchaseId)
 return NextResponse.json({ok:true,status:payment?.status||'pending'})
}
