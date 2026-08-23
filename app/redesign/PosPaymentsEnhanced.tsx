'use client'

import { useEffect,useRef,useState,type ComponentProps,CSSProperties } from 'react'
import PosWholesale from './PosWholesale'
import { readCachedSalesSettings,type SalesSettings } from '@/lib/comercio/sales-settings'
import { readTenantSession } from '@/lib/comercio/session'
import { cancelQrOrder,createQrOrder,qrAmount,waitForQrApproval,type QrOrder } from '@/lib/comercio/mercadopago-qr'
import { createQuote,printQuote,quoteLabel,type Quote } from '@/lib/comercio/quotes'
import type { DeviceSettings } from '@/lib/comercio/types'

type Props=ComponentProps<typeof PosWholesale>
const box:CSSProperties={position:'fixed',inset:0,zIndex:10100,background:'rgba(18,15,25,.62)',display:'grid',placeItems:'center',padding:18}
const card:CSSProperties={width:'min(520px,94vw)',background:'#fff',borderRadius:22,padding:26,boxShadow:'0 28px 80px rgba(0,0,0,.3)',border:'1px solid #e2d8e8'}
const DEFAULT_TICKET:DeviceSettings={paper:'58',autoPrint:false,printerMode:'browser',printerName:'',receiptCopies:1}

export default function PosPaymentsEnhanced(props:Props){
  const[settings,setSettings]=useState<SalesSettings>(()=>readCachedSalesSettings(props.data.company.id))
  const[qrBusy,setQrBusy]=useState(false)
  const[qrError,setQrError]=useState('')
  const[qrMessage,setQrMessage]=useState('')
  const[qrOrder,setQrOrder]=useState<QrOrder|null>(null)
  const[budgetBusy,setBudgetBusy]=useState(false)
  const[budgetError,setBudgetError]=useState('')
  const[budget,setBudget]=useState<Quote|null>(null)
  const autoApplied=useRef(false)
  const cancelRequested=useRef(false)

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

  async function createBudget(){
    if(!props.cart.length||budgetBusy)return
    const session=readTenantSession()
    if(!session){setBudgetError('La sesión venció. Volvé a ingresar para guardar el presupuesto.');return}
    setBudgetBusy(true);setBudgetError('');setBudget(null)
    try{
      const validUntil=new Date(Date.now()+7*86400000).toISOString().slice(0,10)
      const quote=await createQuote(session,{cart:props.cart,customer_id:props.customerId||null,discount_amount:props.discountAmount,valid_until:validUntil})
      setBudget(quote)
      const ids=props.cart.map(item=>item.id)
      ids.forEach(id=>props.removeProduct(id))
      props.setDiscountValue(0)
      props.setPaymentParts([])
      window.dispatchEvent(new CustomEvent('comercio:quotes-changed',{detail:{id:quote.id}}))
    }catch(error){setBudgetError(error instanceof Error?error.message:String(error))}
    finally{setBudgetBusy(false)}
  }

  async function printBudget(){
    if(!budget)return
    try{await printQuote(budget,props.data.company,DEFAULT_TICKET)}catch(error){setBudgetError(error instanceof Error?error.message:String(error))}
  }

  async function cancelCurrentQr(){
    if(!qrOrder?.id)return
    const session=readTenantSession()
    if(!session){setQrError('La sesión venció. Volvé a ingresar para cancelar el cobro.');return}
    cancelRequested.current=true
    setQrMessage('Cancelando el cobro en el Point…')
    try{
      const canceled=await cancelQrOrder(session,qrOrder.id)
      setQrOrder(canceled.order)
      setQrBusy(false)
      setQrError('Cobro cancelado. Ya podés volver a intentar.')
    }catch(e){
      cancelRequested.current=false
      setQrError(e instanceof Error?e.message:String(e))
    }
  }

  async function checkout(mode:'fiscal'|'internal'){
    const amount=qrAmount(props.paymentParts,props.payment,props.total)
    if(amount<=0){props.checkout(mode);return}
    const session=readTenantSession()
    if(!session){setQrError('La sesión venció. Volvé a ingresar antes de cobrar con QR.');return}
    if(typeof navigator!=='undefined'&&!navigator.onLine){setQrError('Mercado Pago QR necesita conexión a Internet.');return}
    cancelRequested.current=false
    setQrBusy(true);setQrError('');setQrOrder(null);setQrMessage('Enviando el cobro al Point de Mercado Pago…')
    try{
      const id=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`qr-${Date.now()}`
      const created=await createQrOrder(session,id,amount)
      setQrOrder(created.order)
      setQrMessage('Cobro enviado al Point. En la terminal de Mercado Pago elegí QR para mostrárselo al cliente.')
      const approved=await waitForQrApproval(session,created.order,o=>{setQrOrder(o);setQrMessage(o.approved?'Pago aprobado. Cerrando la venta…':`Esperando el pago en el Point · ${o.status_detail||o.status}`)})
      if(cancelRequested.current)return
      if(!approved.approved&&approved.status!=='processed')throw new Error('Mercado Pago no confirmó el pago QR.')
      props.checkout(mode)
    }catch(e){
      if(cancelRequested.current)setQrError('Cobro cancelado. Ya podés volver a intentar.')
      else setQrError(e instanceof Error?e.message:String(e))
    }finally{setQrBusy(false)}
  }

  return <>
    <PosWholesale {...props} setPayment={setPayment} setPaymentParts={setPaymentParts} checkout={checkout} busy={props.busy||qrBusy||budgetBusy} createBudget={()=>void createBudget()} budgetBusy={budgetBusy}/>
    {(budget||budgetError)&&<div style={{...box,background:'rgba(55,20,18,.55)'}} role="presentation"><section style={{...card,border:'1px solid #efc3bf'}} role="dialog" aria-modal="true" aria-label="Presupuesto"><div style={{fontSize:10,fontWeight:950,letterSpacing:1.4,color:'#a8433c'}}>PRESUPUESTO · NO FISCAL</div><h2 style={{margin:'7px 0 10px',fontSize:22}}>{budgetError?'No se pudo guardar el presupuesto':'Presupuesto creado'}</h2>{budgetError?<><p style={{color:'#963c36',fontWeight:750,lineHeight:1.55}}>{budgetError}</p><p style={{fontSize:11,color:'#6a5e5b'}}>Esta preview no envía un presupuesto como venta: no toca stock, caja ni ARCA.</p><button type="button" onClick={()=>setBudgetError('')} style={{height:42,padding:'0 18px',border:0,borderRadius:11,background:'#aa4941',color:'#fff',fontWeight:850,cursor:'pointer'}}>Cerrar</button></>:budget&&<><div style={{padding:16,borderRadius:15,background:'#fff4f2',border:'1px solid #f0cbc7',display:'grid',gap:6}}><b style={{fontSize:18}}>{quoteLabel(budget)}</b><span style={{fontSize:12}}>Total presupuestado</span><strong style={{fontSize:25}}>{new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(budget.total)}</strong><small>Válido hasta {budget.valid_until?new Date(`${budget.valid_until}T12:00:00`).toLocaleDateString('es-AR'):'sin fecha de vencimiento'}</small></div><p style={{fontSize:12,lineHeight:1.55,color:'#5f6964'}}>Guardado aparte de las ventas. No descontó stock, no movió caja y no se envió a ARCA.</p><div style={{display:'flex',gap:9,flexWrap:'wrap'}}><button type="button" onClick={()=>void printBudget()} style={{height:42,padding:'0 18px',border:0,borderRadius:11,background:'#aa4941',color:'#fff',fontWeight:900,cursor:'pointer'}}>Imprimir ticket</button><button type="button" onClick={()=>setBudget(null)} style={{height:42,padding:'0 18px',border:'1px solid #ddc9c6',borderRadius:11,background:'#fff',fontWeight:850,cursor:'pointer'}}>Cerrar</button></div></>}</section></div>}
    {(qrBusy||qrError)&&<div style={box}><section style={card}><div style={{fontSize:10,fontWeight:950,letterSpacing:1.4,color:'#6b3d83'}}>MERCADO PAGO QR</div><h2 style={{margin:'7px 0 10px',fontSize:22}}>{qrError?'Cobro detenido':'Cobro enviado al Point'}</h2>{qrError?<p style={{color:'#a33832',fontWeight:750,lineHeight:1.5}}>{qrError}</p>:<><p style={{lineHeight:1.55,color:'#4f5d56'}}>{qrMessage}</p>{qrOrder&&<div style={{padding:12,borderRadius:12,background:'#f6f2f8',fontSize:11}}><b>Estado:</b> {qrOrder.status_detail||qrOrder.status}</div>}<p style={{fontSize:11,color:'#6a756f'}}>Elegí QR en el Point. No vuelvas a cobrar hasta que Mercado Pago confirme el pago o canceles esta operación.</p>{qrOrder?.id&&<button type="button" onClick={cancelCurrentQr} style={{height:42,padding:'0 18px',border:'1px solid #d8ccd8',borderRadius:11,background:'#fff',color:'#5e3b67',fontWeight:850,cursor:'pointer'}}>Cancelar cobro</button>}</>}{qrError&&<button type="button" onClick={()=>{setQrError('');cancelRequested.current=false}} style={{height:42,padding:'0 18px',border:0,borderRadius:11,background:'#6b3d83',color:'#fff',fontWeight:850,cursor:'pointer'}}>Cerrar</button>}</section></div>}
  </>
}
