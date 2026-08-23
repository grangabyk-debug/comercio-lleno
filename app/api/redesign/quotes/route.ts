import type { NextRequest } from 'next/server'

export const runtime='nodejs'
const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

type Profile={company_id:string;active:boolean}
type QuoteItem={product_id?:string|null;name:string;barcode?:string|null;qty:number;unit_price:number;line_total:number}

function authHeader(req:NextRequest){const auth=req.headers.get('authorization')||'';return auth.toLowerCase().startsWith('bearer ')?auth:''}
async function rest<T>(auth:string,path:string,init:RequestInit={}){const response=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...init,headers:{apikey:PUBLISHABLE_KEY,Authorization:auth,'Content-Type':'application/json',...(init.headers||{})},cache:'no-store'});const text=await response.text();let data:any=null;try{data=text?JSON.parse(text):null}catch{data=text}if(!response.ok){const error=new Error(data?.message||data?.error||text||`HTTP ${response.status}`);(error as Error&{status?:number}).status=response.status;throw error}return data as T}
async function context(req:NextRequest){
  const auth=authHeader(req);if(!auth)throw Object.assign(new Error('Sesión no disponible.'),{status:401})
  const userResponse=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:PUBLISHABLE_KEY,Authorization:auth},cache:'no-store'});const user=await userResponse.json().catch(()=>null);if(!userResponse.ok||!user?.id)throw Object.assign(new Error('Sesión no válida.'),{status:401})
  const profiles=await rest<Profile[]>(auth,`profiles?select=company_id,active&id=eq.${encodeURIComponent(String(user.id))}&limit=1`);const profile=profiles[0];if(!profile?.company_id||profile.active!==true)throw Object.assign(new Error('Perfil del comercio no disponible.'),{status:403})
  let branchId=String(req.headers.get('x-comercio-branch-id')||'').trim()
  if(!/^[0-9a-f-]{36}$/i.test(branchId)){const rows=await rest<Array<{id:string}>>(auth,`branches?select=id&company_id=eq.${encodeURIComponent(profile.company_id)}&active=eq.true&is_primary=eq.true&limit=1`);branchId=rows[0]?.id||''}
  if(!/^[0-9a-f-]{36}$/i.test(branchId))throw new Error('Elegí una sucursal válida.')
  return{auth,companyId:profile.company_id,branchId}
}
function cleanItems(value:unknown):QuoteItem[]{
  if(!Array.isArray(value))return[]
  return value.slice(0,500).map((raw:any)=>{const qty=Math.max(0,Number(raw?.qty||0));const unit=Math.max(0,Number(raw?.unit_price??raw?.price??0));return{product_id:/^[0-9a-f-]{36}$/i.test(String(raw?.product_id||''))?String(raw.product_id):null,name:String(raw?.name||'Producto').trim().slice(0,180)||'Producto',barcode:String(raw?.barcode||'').trim().slice(0,80)||null,qty,unit_price:Number(unit.toFixed(2)),line_total:Number((qty*unit).toFixed(2))}}).filter(item=>item.qty>0)
}
function fail(error:unknown){const status=Number((error as {status?:number})?.status)||400;const raw=error instanceof Error?error.message:String(error);const schemaMissing=/quotes|relation.*does not exist|schema cache/i.test(raw);return Response.json({ok:false,error:schemaMissing?'La estructura de Presupuestos está preparada en esta preview pero la migración todavía no fue aplicada al entorno de datos.':raw,preview_schema_pending:schemaMissing},{status:schemaMissing?409:status})}

export async function GET(req:NextRequest){try{const{auth,companyId,branchId}=await context(req);const rows=await rest<any[]>(auth,`quotes?select=id,company_id,branch_id,customer_id,quote_number,status,subtotal,discount_amount,total,valid_until,items,note,created_at,updated_at&company_id=eq.${encodeURIComponent(companyId)}&branch_id=eq.${encodeURIComponent(branchId)}&order=created_at.desc&limit=500`);return Response.json({ok:true,quotes:rows})}catch(error){return fail(error)}}

export async function POST(req:NextRequest){try{
  const{auth,companyId,branchId}=await context(req);const body=await req.json().catch(()=>({}));const items=cleanItems(body?.items);if(!items.length)throw new Error('El presupuesto no contiene productos.')
  const subtotal=Number(items.reduce((sum,item)=>sum+item.line_total,0).toFixed(2));const discount=Math.max(0,Math.min(subtotal,Number(body?.discount_amount||0)));const total=Number((subtotal-discount).toFixed(2));if(total<0)throw new Error('Total de presupuesto inválido.')
  const customerId=/^[0-9a-f-]{36}$/i.test(String(body?.customer_id||''))?String(body.customer_id):null
  if(customerId){const customer=await rest<Array<{id:string}>>(auth,`customers?select=id&id=eq.${encodeURIComponent(customerId)}&company_id=eq.${encodeURIComponent(companyId)}&limit=1`);if(!customer.length)throw new Error('El cliente no pertenece a este comercio.')}
  const payload={company_id:companyId,branch_id:branchId,customer_id:customerId,subtotal,discount_amount:Number(discount.toFixed(2)),total,items,status:'open',note:String(body?.note||'').trim().slice(0,2000)||null,valid_until:/^\d{4}-\d{2}-\d{2}$/.test(String(body?.valid_until||''))?String(body.valid_until):null}
  const rows=await rest<any[]>(auth,'quotes?select=id,company_id,branch_id,customer_id,quote_number,status,subtotal,discount_amount,total,valid_until,items,note,created_at,updated_at',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});const quote=rows[0];if(!quote?.id)throw new Error('No se pudo guardar el presupuesto.')
  return Response.json({ok:true,quote})
}catch(error){return fail(error)}}

export async function DELETE(req:NextRequest){try{const{auth,companyId,branchId}=await context(req);const id=String(new URL(req.url).searchParams.get('id')||'');if(!/^[0-9a-f-]{36}$/i.test(id))throw new Error('Presupuesto inválido.');await rest(auth,`quotes?id=eq.${encodeURIComponent(id)}&company_id=eq.${encodeURIComponent(companyId)}&branch_id=eq.${encodeURIComponent(branchId)}`,{method:'DELETE'});return Response.json({ok:true})}catch(error){return fail(error)}}
