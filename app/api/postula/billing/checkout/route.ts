import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const BILLING_API='https://wtcntclzcubkbtcsqkzc.supabase.co/functions/v1/postula-company-purchase'
const SYNC_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/postula-company-billing-sync'
const PLAN={
 impulso:{label:'Impulso',amount:18900},
 seleccion:{label:'Selección IA',amount:34900},
 escala:{label:'Escala',amount:74900},
} as const

type PaidPlan=keyof typeof PLAN
function db(req:NextRequest){const auth=req.headers.get('authorization')||'';return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}})}

export async function POST(req:NextRequest){
 const auth=req.headers.get('authorization')||''
 const client=db(req)
 const {data:{user}}=await client.auth.getUser()
 if(!user)return NextResponse.json({ok:false,error:'Primero creá o iniciá sesión con tu cuenta de empresa.'},{status:401})
 const body=await req.json().catch(()=>({}))
 const plan=String(body?.plan||'') as PaidPlan
 if(!(plan in PLAN))return NextResponse.json({ok:false,error:'Plan inválido.'},{status:400})
 const {data:members,error}=await client.from('pm_company_members').select('company_id,role,status').eq('user_id',user.id).eq('status','active').in('role',['owner','admin']).limit(1)
 if(error)return NextResponse.json({ok:false,error:error.message},{status:400})
 const companyId=members?.[0]?.company_id
 if(!companyId)return NextResponse.json({ok:false,code:'needs_billing_permission',error:'Sólo el propietario o un administrador de la empresa puede contratar o cambiar un plan.'},{status:403})

 const chosen=PLAN[plan]
 const response=await fetch(`${BILLING_API}?action=checkout`,{
  method:'POST',
  headers:{'Content-Type':'application/json',Authorization:auth},
  body:JSON.stringify({plan,email:user.email,user_id:user.id,company_id:companyId}),
  cache:'no-store',
 })
 const payload=await response.json().catch(()=>({}))
 if(!response.ok||!payload?.init_point||!payload?.preapproval_id)return NextResponse.json({ok:false,error:payload?.error||'No pudimos iniciar el pago del plan.'},{status:502})
 if(Number(payload?.price)!==chosen.amount)return NextResponse.json({ok:false,error:'No pudimos validar el importe del plan.'},{status:502})

 const syncResponse=await fetch(SYNC_API,{
  method:'POST',
  headers:{'Content-Type':'application/json',Authorization:auth},
  body:JSON.stringify({id:String(payload.preapproval_id)}),
  cache:'no-store',
 })
 const syncPayload=await syncResponse.json().catch(()=>({}))
 if(!syncResponse.ok||!syncPayload?.ok)return NextResponse.json({ok:false,error:syncPayload?.error||'No pudimos preparar el plan para el pago. No se realizó ningún cargo desde Postulá Mejor.'},{status:502})
 if(String(syncPayload.company_id||'')!==String(companyId)||String(syncPayload.plan||'')!==plan)return NextResponse.json({ok:false,error:'No pudimos validar la suscripción creada.'},{status:409})

 return NextResponse.json({ok:true,plan,init_point:String(payload.init_point),preapproval_id:String(payload.preapproval_id)})
}