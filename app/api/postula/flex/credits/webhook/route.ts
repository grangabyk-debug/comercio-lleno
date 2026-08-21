import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
const URL='https://pejkycdttogpmmdntzuq.supabase.co'
function adminDb(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;return key?createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}
export async function POST(req:NextRequest){
 const admin=adminDb(),token=process.env.POSTULA_MERCADOPAGO_ACCESS_TOKEN;if(!admin||!token)return NextResponse.json({ok:false,error:'Billing no configurado.'},{status:503})
 const b=await req.json().catch(()=>({}));const paymentId=String(req.nextUrl.searchParams.get('data.id')||b?.data?.id||b?.id||'').trim();if(!paymentId)return NextResponse.json({ok:true,ignored:true})
 const response=await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const payment=await response.json().catch(()=>({}));if(!response.ok)return NextResponse.json({ok:false,error:'No pudimos verificar el pago.'},{status:502})
 const ref=String(payment?.external_reference||''),match=/^postula-flex:([0-9a-f-]{36})$/i.exec(ref);if(!match)return NextResponse.json({ok:true,ignored:true})
 const purchaseId=match[1];const {data:purchase}=await admin.from('pm_flex_credit_purchases').select('*').eq('id',purchaseId).maybeSingle();if(!purchase)return NextResponse.json({ok:true,ignored:true})
 if(Number(payment?.transaction_amount)!==Number(purchase.amount_ars))return NextResponse.json({ok:false,error:'Monto inválido.'},{status:400})
 if(String(payment?.status)==='approved'){const {data,error}=await admin.rpc('pm_flex_credit_approved_purchase',{p_purchase_id:purchaseId,p_payment_id:paymentId});if(error)return NextResponse.json({ok:false,error:error.message},{status:500});return NextResponse.json({ok:true,credited:data})}
 await admin.from('pm_flex_credit_purchases').update({status:String(payment?.status||'pending'),provider_payment_id:paymentId,updated_at:new Date().toISOString()}).eq('id',purchaseId)
 return NextResponse.json({ok:true,status:payment?.status||'pending'})
}
