'use client'

import { useEffect,useRef,useState,type ComponentProps,CSSProperties } from 'react'
import QRCode from 'qrcode'
import PosWholesale from './PosWholesale'
import { readCachedSalesSettings,type SalesSettings } from '@/lib/comercio/sales-settings'
import { readTenantSession } from '@/lib/comercio/session'
import { createQrOrder,qrAmount,waitForQrApproval,type QrOrder } from '@/lib/comercio/mercadopago-qr'

type Props=ComponentProps<typeof PosWholesale>
const box:CSSProperties={position:'fixed',inset:0,zIndex:10100,background:'rgba(18,15,25,.62)',display:'grid',placeItems:'center',padding:18}
const card:CSSProperties={width:'min(520px,94vw)',background:'#fff',borderRadius:22,padding:26,boxShadow:'0 28px 80px rgba(0,0,0,.3)',border:'1px solid #e2d8e8'}

export default function PosPaymentsEnhanced(props:Props){
  const[settings,setSettings]=useState<SalesSettings>(()=>readCachedSalesSettings(props.data.company.id))
  const[qrBusy,setQrBusy]=useState(false)
  const[qrError,setQrError]=useState('')
  const[qrMessage,setQrMessage]=useState('')
  const[qrOrder,setQrOrder]=useState<QrOrder|null>(null)
  const[qrImage,setQrImage]=useState('')
  const autoApplied=useRef(false)

  useEffect(()=>{
    const onSettings=(e:Event)=>{const next=(e as CustomEvent<SalesSettings>).detail;if(next)setSettings(next)}
    window.addEventListener('comercio:sales-settings',onSettings)
    return()=>window.removeEventListener('comercio:sales-settings',onSettings)
  },[])
  useEffect(()=>{if(autoApplied.current&&Number(props.discountValue)!==Number(settings.cashDiscountPercent))autoApplied.current=false},[props.discountValue,settings.cashDiscountPercent])

  function setPayment(method:string){
    props.setPayment(method)
    if(method==='Efectivo'&&props.paymentParts.length===0&&settings.cashDiscountPercent>0){props.setDiscountKind('percent');props.setDiscountValue(settings.cashDiscountPercent);autoApplied.current=true}
    else if(autoApplied.current){props.setDiscountValue(0);autoApplied.current=false}
  }
  function setPaymentParts(parts:Parameters<Props['setPaymentParts']>[0]){
    if(parts.length&&autoApplied.current){props.setDiscountValue(0);autoApplied.current=false}
    props.setPaymentParts(parts)
  }

  async function checkout(mode:'fiscal'|'internal'){
    const amount=qrAmount(props.paymentParts,props.payment,props.total)
    if(amount<=0){props.checkout(mode);return}
    const session=readTenantSession()
    if(!session){setQrError('La sesión venció. Volvé a ingresar antes de cobrar con QR.');return}
    if(typeof navigator!=='undefined'&&!navigator.onLine){setQrError('Mercado Pago QR necesita conexión a Internet.');return}
    setQrBusy(true);setQrError('');setQrOrder(null);setQrImage('');setQrMessage('Generando el cobro QR en Mercado Pago…')
    try{
      const id=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`qr-${Date.now()}`
      const created=await createQrOrder(session,id,amount)
      if(!created.order.qr_data)throw new Error('Mercado Pago no devolvió el código QR de esta venta.')
      const image=await QRCode.toDataURL(created.order.qr_data,{width:320,margin:1,errorCorrectionLevel:'M'})
      setQrOrder(created.order)
      setQrImage(image)
      setQrMessage('Pedile al cliente que escanee este QR con Mercado Pago. La venta se cerrará sola cuando se acredite.')
      const approved=await waitForQrApproval(session,created.order,o=>{setQrOrder(o);setQrMessage(o.approved?'Pago QR aprobado. Cerrando la venta…':`Esperando el pago · ${o.status_detail||o.status}`)})
      if(!approved.approved&&approved.status!=='processed')throw new Error('Mercado Pago no confirmó el pago QR.')
      props.checkout(mode)
    }catch(e){setQrError(e instanceof Error?e.message:String(e))}
    finally{setQrBusy(false)}
  }

  return <>
    <PosWholesale {...props} setPayment={setPayment} setPaymentParts={setPaymentParts} checkout={checkout} busy={props.busy||qrBusy}/>
    {(qrBusy||qrError)&&<div style={box}><section style={card}><div style={{fontSize:10,fontWeight:950,letterSpacing:1.4,color:'#6b3d83'}}>MERCADO PAGO QR</div><h2 style={{margin:'7px 0 10px',fontSize:22}}>{qrError?'No se pudo completar el QR':'Cobro con QR en curso'}</h2>{qrError?<p style={{color:'#a33832',fontWeight:750,lineHeight:1.5}}>{qrError}</p>:<><p style={{lineHeight:1.55,color:'#4f5d56',marginBottom:qrImage?14:10}}>{qrMessage}</p>{qrImage&&<div style={{display:'grid',placeItems:'center',padding:14,borderRadius:18,background:'#f6f2f8',border:'1px solid #e4dce9',marginBottom:12}}><img src={qrImage} alt="Código QR de Mercado Pago" style={{display:'block',width:'min(280px,72vw)',height:'auto',borderRadius:10,background:'#fff',padding:8}}/></div>}{qrOrder&&<div style={{padding:12,borderRadius:12,background:'#f6f2f8',fontSize:11}}><b>Estado:</b> {qrOrder.status_detail||qrOrder.status}</div>}<p style={{fontSize:11,color:'#6a756f'}}>No cierres esta ventana ni vuelvas a cobrar hasta que Mercado Pago confirme el pago.</p></>}{qrError&&<button type="button" onClick={()=>{setQrError('');setQrImage('')}} style={{height:42,padding:'0 18px',border:0,borderRadius:11,background:'#6b3d83',color:'#fff',fontWeight:850,cursor:'pointer'}}>Cerrar</button>}</section></div>}
  </>
}
