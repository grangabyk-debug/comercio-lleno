import {NextRequest,NextResponse} from 'next/server'

const FLEX_BILLING_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/postula-flex-billing'

export async function POST(req:NextRequest){
 const b=await req.json().catch(()=>({}))
 const paymentId=String(req.nextUrl.searchParams.get('data.id')||req.nextUrl.searchParams.get('id')||b?.data?.id||b?.id||'').trim()
 if(!paymentId)return NextResponse.json({ok:true,ignored:true})
 const response=await fetch(`${FLEX_BILLING_API}?action=webhook`,{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({...b,id:paymentId}),
  cache:'no-store',
 })
 const payload=await response.json().catch(()=>({}))
 return NextResponse.json(payload,{status:response.status})
}
