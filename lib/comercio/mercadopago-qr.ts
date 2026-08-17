import type { TenantSession } from './types'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const URL=`${SUPABASE_URL.replace(/\/$/,'')}/functions/v1/mercadopago-qr`

export type QrOrder={id:string;status:string;status_detail?:string;amount?:number;approved?:boolean;final?:boolean;qr_data?:string}
async function call<T>(session:TenantSession,body:Record<string,unknown>):Promise<T>{const r=await fetch(URL,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok||d?.ok===false)throw new Error(d?.error||'No se pudo procesar el cobro QR.');return d as T}
export async function createQrOrder(session:TenantSession,saleId:string,amount:number){return call<{ok:true;external_pos_id:string;order:QrOrder}>(session,{action:'create_order',sale_id:saleId,amount})}
export async function getQrOrder(session:TenantSession,orderId:string){return call<{ok:true;order:QrOrder}>(session,{action:'get_order',order_id:orderId})}
export async function cancelQrOrder(session:TenantSession,orderId:string){return call<{ok:true;order:QrOrder}>(session,{action:'cancel_order',order_id:orderId})}
export function qrAmount(parts:Array<{method:string;amount:number}>,single:string,total:number){const isQr=(m:string)=>/^mercado\s*pago\s*qr$/i.test(String(m||'').trim());if(parts.length===2)return Math.round(parts.reduce((s,p)=>isQr(p.method)?s+Number(p.amount||0):s,0)*100)/100;return isQr(single)?Math.round(total*100)/100:0}
export async function waitForQrApproval(session:TenantSession,initial:QrOrder,onStatus?:(o:QrOrder)=>void,timeoutMs=5*60_000){let order=initial;onStatus?.(order);const start=Date.now();while(Date.now()-start<timeoutMs){if(order.approved||order.status==='processed')return order;if(order.final&&order.status!=='processed')throw new Error(`El cobro QR terminó con estado ${order.status_detail||order.status}.`);await new Promise(r=>setTimeout(r,1400));order=(await getQrOrder(session,order.id)).order;onStatus?.(order)}throw new Error('El cobro QR no se confirmó dentro de los 5 minutos. Revisá Mercado Pago antes de volver a cobrar.')}
