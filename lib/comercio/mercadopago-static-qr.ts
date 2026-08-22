import type { TenantSession } from './types'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const FUNCTION_URL=`${SUPABASE_URL.replace(/\/$/,'')}/functions/v1/mercadopago-static-qr`

export type StaticQrPos={id:string;name:string;external_id:string;store_id:string;external_store_id:string;status:string;fixed_amount:boolean;qr_image?:string;qr_template_document?:string;qr_template_image?:string}
export type StaticQrStore={id:string;name:string;external_id:string;location?:unknown}
export type StaticQrLink={pos_id?:string|null;external_pos_id?:string|null;store_id?:string|null;external_store_id?:string|null;name?:string|null;image?:string|null;template?:string|null;linked_at?:string|null}
export type StaticQrStatus={ok:boolean;account_connected:boolean;linked:boolean;qr?:StaticQrLink|null}
export type StaticQrOrder={id:string;status:string;status_detail?:string;external_reference?:string;payment_id?:string;payment_status?:string;approved?:boolean;final?:boolean}

async function callStaticQr<T>(session:TenantSession,body:Record<string,unknown>):Promise<T>{
  const response=await fetch(FUNCTION_URL,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'})
  const data=await response.json().catch(()=>({})) as T&{ok?:boolean;error?:string}
  if(!response.ok||data?.ok===false){const error=new Error(data?.error||'No se pudo comunicar con Mercado Pago QR.') as Error&{status?:number};error.status=response.status;throw error}
  return data
}
function idempotencyKey(prefix='qr'){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`}
export function getStaticQrStatus(session:TenantSession){return callStaticQr<StaticQrStatus>(session,{action:'status'})}
export function listStaticQrPos(session:TenantSession){return callStaticQr<{ok:true;positions:StaticQrPos[]}>(session,{action:'list_pos'})}
export function listStaticQrStores(session:TenantSession){return callStaticQr<{ok:true;stores:StaticQrStore[]}>(session,{action:'list_stores'})}
export function selectStaticQrPos(session:TenantSession,posId:string){return callStaticQr<{ok:true;linked:true;qr:StaticQrPos}>(session,{action:'select_pos',pos_id:posId})}
export function unlinkStaticQr(session:TenantSession){return callStaticQr<{ok:true;linked:false}>(session,{action:'unlink'})}
export function createStaticQrPos(session:TenantSession,input:{name:string;store_id:string;external_store_id:string;external_id:string;category?:number}){return callStaticQr<{ok:true;linked:true;qr:StaticQrPos}>(session,{action:'create_pos',...input})}
export function createStaticQrOrder(session:TenantSession,amount:number,externalReference:string){return callStaticQr<{ok:true;order:StaticQrOrder}>(session,{action:'create_order',amount,external_reference:externalReference,idempotency_key:idempotencyKey('qr-create')})}
export function getStaticQrOrder(session:TenantSession,orderId:string){return callStaticQr<{ok:true;order:StaticQrOrder}>(session,{action:'order_status',order_id:orderId})}
export function cancelStaticQrOrder(session:TenantSession,orderId:string){return callStaticQr<{ok:true;order:StaticQrOrder}>(session,{action:'cancel_order',order_id:orderId,idempotency_key:idempotencyKey('qr-cancel')})}
export async function waitForStaticQrApproval(session:TenantSession,initial:StaticQrOrder,onStatus?:(order:StaticQrOrder)=>void,timeoutMs=15*60_000){let order=initial;onStatus?.(order);const started=Date.now();while(Date.now()-started<timeoutMs){if(order.approved||order.status==='processed')return order;if(order.final||['failed','canceled','expired','refunded','action_required'].includes(order.status)){const error=new Error(order.status==='canceled'?'El cobro QR fue cancelado.':order.status==='expired'?'El cobro QR venció.':'Mercado Pago no confirmó el pago QR.') as Error&{order?:StaticQrOrder};error.order=order;throw error}await new Promise(resolve=>setTimeout(resolve,1400));order=(await getStaticQrOrder(session,order.id)).order;onStatus?.(order)}throw new Error('El QR no confirmó el pago dentro de los 15 minutos. Revisá Mercado Pago antes de volver a cobrar.')}
