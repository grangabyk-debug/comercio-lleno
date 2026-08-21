import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const PLAN={
 impulso:{label:'Impulso',amount:18900},
 seleccion:{label:'Selección IA',amount:34900},
 escala:{label:'Escala',amount:74900},
} as const

type PaidPlan=keyof typeof PLAN
function db(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}

export async function POST(req:NextRequest){
 const client=db(req)
 const {data:{user}}=await client.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Primero creá o iniciá sesión con tu cuenta de empresa.'},{status:401})
 const body=await req.json().catch(()=>({}))
 const plan=String(body?.plan||'') as PaidPlan
 if(!(plan in PLAN))return NextResponse.json({ok:false,error:'Plan inválido.'},{status:400})
 const {data:members,error}=await client.from('pm_company_members').select('company_id,status').eq('user_id',user.id).eq('status','active').limit(1)
 if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
 const companyId=members?.[0]?.company_id
 if(!companyId)return NextResponse.json({ok:false,code:'needs_company',error:'Primero completá la configuración de tu empresa.'},{status:409})
 const token=process.env.POSTULA_MERCADOPAGO_ACCESS_TOKEN
 if(!token)return NextResponse.json({ok:false,code:'billing_not_configured',error:'Tu plan quedó seleccionado. El cobro online de Postulá Mejor todavía no está habilitado en este entorno; no se realizó ningún cargo.'},{status:503})
 const chosen=PLAN[plan]
 const externalReference=`postula:${user.id}:${companyId}:${plan}`
 const response=await fetch('https://api.mercadopago.com/preapproval',{
  method:'POST',
  headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
  body:JSON.stringify({
   reason:`Postulá Mejor · ${chosen.label}`,
   external_reference:externalReference,
   payer_email:user.email,
   auto_recurring:{frequency:1,frequency_type:'months',transaction_amount:chosen.amount,currency_id:'ARS'},
   back_url:`https://postulamejor.com/empresas/panel?billing=return&plan=${plan}`,
   status:'pending',
  }),
 })
 const payload=await response.json().catch(()=>({}))
 if(!response.ok||!payload?.init_point)return NextResponse.json({ok:false,error:payload?.message||'No pudimos iniciar el pago del plan.'},{status:502})
 return NextResponse.json({ok:true,plan,init_point:payload.init_point,preapproval_id:payload.id||null})
}
