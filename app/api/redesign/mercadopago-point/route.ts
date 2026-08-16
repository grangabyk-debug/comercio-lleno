import { NextRequest, NextResponse } from 'next/server'

export const runtime='nodejs'
export const dynamic='force-dynamic'

type Terminal={id:string;pos_id?:string|number|null;store_id?:string|number|null;external_pos_id?:string|null;operating_mode?:string|null}

const MP_BASE='https://api.mercadopago.com'
const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

function accessToken(){return process.env.MERCADOPAGO_POINT_ACCESS_TOKEN||process.env.MERCADOPAGO_ACCESS_TOKEN||''}
function decodeJwtSub(token:string){try{const payload=token.split('.')[1];if(!payload)return'';return String(JSON.parse(Buffer.from(payload,'base64url').toString('utf8'))?.sub||'')}catch{return''}}

async function authorize(request:NextRequest){
  const authorization=request.headers.get('authorization')||''
  if(!authorization.toLowerCase().startsWith('bearer '))throw new Error('UNAUTHORIZED')
  const token=authorization.slice(7).trim(),userId=decodeJwtSub(token)
  if(!userId)throw new Error('UNAUTHORIZED')
  const response=await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=company_id,role,active&limit=1`,{headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${token}`},cache:'no-store'})
  const rows=await response.json().catch(()=>[]),profile=Array.isArray(rows)?rows[0]:null
  if(!response.ok||!profile?.company_id||profile.active===false)throw new Error('UNAUTHORIZED')
  if(profile.role!=='owner')throw new Error('OWNER_ONLY')
  return{companyId:String(profile.company_id),token}
}

async function mpFetch(path:string,init?:RequestInit){
  const token=accessToken();if(!token)throw new Error('Falta configurar MERCADOPAGO_POINT_ACCESS_TOKEN en el servidor.')
  const response=await fetch(`${MP_BASE}${path}`,{...init,cache:'no-store',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,...(init?.headers||{})}})
  const raw=await response.text();let data:any=null;try{data=raw?JSON.parse(raw):null}catch{data={message:raw}}
  if(!response.ok){const message=data?.message||data?.error||data?.cause?.[0]?.description||`Mercado Pago respondió ${response.status}`;const error=new Error(message)as Error&{status?:number};error.status=response.status;throw error}
  return data
}

function authError(error:unknown){const message=error instanceof Error?error.message:String(error);if(message==='UNAUTHORIZED')return NextResponse.json({error:'Sesión inválida.'},{status:401});if(message==='OWNER_ONLY')return NextResponse.json({error:'Sólo el propietario puede configurar Mercado Pago.'},{status:403});return null}

export async function GET(request:NextRequest){
  try{
    const auth=await authorize(request)
    const data=await mpFetch('/terminals/v1/list?limit=50&offset=0')
    const terminals:Terminal[]=Array.isArray(data?.data?.terminals)?data.data.terminals:[]
    return NextResponse.json({connected:true,terminals,count:terminals.length,company_id:auth.companyId,source:process.env.MERCADOPAGO_POINT_ACCESS_TOKEN?'point-token':'mercadopago-token'})
  }catch(error){const auth=authError(error);if(auth)return auth;const err=error as Error&{status?:number};return NextResponse.json({connected:false,terminals:[],error:err.message},{status:err.status||500})}
}

export async function PATCH(request:NextRequest){
  try{
    await authorize(request)
    const body=await request.json().catch(()=>({})),terminalId=String(body?.terminal_id||'').trim()
    if(!terminalId)return NextResponse.json({error:'terminal_id es obligatorio'},{status:400})
    const data=await mpFetch('/terminals/v1/setup',{method:'PATCH',body:JSON.stringify({terminals:[{id:terminalId,operating_mode:'PDV'}]})})
    return NextResponse.json({ok:true,data})
  }catch(error){const auth=authError(error);if(auth)return auth;const err=error as Error&{status?:number};return NextResponse.json({error:err.message},{status:err.status||500})}
}

export async function POST(request:NextRequest){
  try{
    const auth=await authorize(request)
    const body=await request.json().catch(()=>({})),terminalId=String(body?.terminal_id||'').trim(),amount=Number(body?.amount||0)
    const reference=String(body?.external_reference||`CL-${auth.companyId.slice(0,8)}-${Date.now()}`).replace(/[^A-Za-z0-9_-]/g,'').slice(0,64)
    if(!terminalId)return NextResponse.json({error:'Elegí una terminal Point.'},{status:400})
    if(!Number.isFinite(amount)||amount<=0)return NextResponse.json({error:'El importe debe ser mayor a cero.'},{status:400})
    const data=await mpFetch('/v1/orders',{method:'POST',headers:{'X-Idempotency-Key':crypto.randomUUID()},body:JSON.stringify({type:'point',external_reference:reference,expiration_time:'PT5M',transactions:{payments:[{amount:amount.toFixed(2)}]},config:{point:{terminal_id:terminalId,print_on_terminal:'no_ticket'}},description:'Cobro Comercio Lleno'})})
    return NextResponse.json({ok:true,order:data})
  }catch(error){const auth=authError(error);if(auth)return auth;const err=error as Error&{status?:number};return NextResponse.json({error:err.message},{status:err.status||500})}
}
