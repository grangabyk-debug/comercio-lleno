'use client'

import {useMemo,useState} from 'react'
import Link from 'next/link'
import styles from './LandingQuickDemo.module.css'
import mobile from './LandingQuickDemoMobile.module.css'

const products=[
  {name:'Detergente 750 ml',category:'Limpieza',price:3150},
  {name:'Shampoo 400 ml',category:'Perfumería',price:4890},
  {name:'Rollos de cocina',category:'Hogar',price:2750},
  {name:'Gaseosa cola 2,25 L',category:'Kiosco',price:4200},
  {name:'Alfajor triple',category:'Kiosco',price:1850},
  {name:'Papas clásicas 90 g',category:'Kiosco',price:2650},
]
const payments=['Efectivo','Débito','Crédito','Transferencia','Mercado Pago','Billetera Virtual']
const mobilePayments=['Efectivo','Mercado Pago','Débito']
const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})

type Cart=Record<number,number>
type CheckoutMode='fiscal'|'internal'

function DemoQr(){
  const cells=[] as Array<{x:number;y:number}>
  const finder=(x:number,y:number,ox:number,oy:number)=>x>=ox&&x<ox+7&&y>=oy&&y<oy+7&&(x===ox||x===ox+6||y===oy||y===oy+6||(x>=ox+2&&x<=ox+4&&y>=oy+2&&y<=oy+4))
  for(let y=0;y<21;y++)for(let x=0;x<21;x++){
    const fixed=finder(x,y,0,0)||finder(x,y,14,0)||finder(x,y,0,14)
    const data=!fixed&&((x*11+y*7+x*y*3+5)%13<5)
    if(fixed||data)cells.push({x,y})
  }
  return <svg className={styles.qr} viewBox="0 0 21 21" aria-label="QR de demostración no válido"><rect width="21" height="21" fill="#fff"/>{cells.map((cell,index)=><rect key={index} x={cell.x} y={cell.y} width="1" height="1" fill="#111"/>)}</svg>
}

export default function LandingQuickDemo(){
  const[open,setOpen]=useState(false)
  const[cart,setCart]=useState<Cart>({})
  const[payment,setPayment]=useState('Efectivo')
  const[cashReceived,setCashReceived]=useState('')
  const[customer,setCustomer]=useState(false)
  const[discount,setDiscount]=useState(false)
  const[paid,setPaid]=useState<CheckoutMode|null>(null)

  const lines=useMemo(()=>Object.entries(cart).filter(([,qty])=>qty>0).map(([index,qty])=>({index:Number(index),qty,product:products[Number(index)]})),[cart])
  const itemCount=useMemo(()=>lines.reduce((sum,line)=>sum+line.qty,0),[lines])
  const subtotal=useMemo(()=>lines.reduce((sum,line)=>sum+line.product.price*line.qty,0),[lines])
  const discountAmount=discount?Math.round(subtotal*.1):0
  const total=Math.max(0,subtotal-discountAmount)
  const received=Number(String(cashReceived).replace(',','.'))||0
  const change=payment==='Efectivo'&&received>=total?received-total:0

  const add=(index:number)=>{setPaid(null);setCart(rows=>({...rows,[index]:(rows[index]||0)+1}))}
  const changeQty=(index:number,delta:number)=>{setPaid(null);setCart(rows=>{const next=Math.max(0,(rows[index]||0)+delta);const copy={...rows};if(next)copy[index]=next;else delete copy[index];return copy})}
  const reset=()=>{setCart({});setPaid(null);setCashReceived('');setPayment('Efectivo');setCustomer(false);setDiscount(false)}
  const checkout=(mode:CheckoutMode)=>{if(!itemCount)return;setPaid(mode)}

  return <>
    <button type="button" className={styles.trigger} onClick={()=>setOpen(true)}>
      <span className={styles.triggerMark}>$</span>
      <span className={styles.triggerCopy}><b>Probá una venta</b><small>Sumá productos, elegí el pago y cobrá</small></span>
      <span className={styles.triggerAction}>Abrir demo</span>
    </button>

    {open&&<div className={styles.backdrop} onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false)}}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Demo interactiva de Comercio Lleno">
        <div className={`${styles.head} ${mobile.compactHead}`}>
          <div><span>DEMO INTERACTIVA</span><h2>Probá el flujo real de una venta.</h2><p>Sin registrarte y sin guardar datos. Tocá, sumá productos y llegá hasta el ticket.</p></div>
          <button type="button" className={styles.close} onClick={()=>setOpen(false)} aria-label="Cerrar">×</button>
        </div>

        {!paid?<>
          <div className={`${styles.posShell} ${mobile.desktopOnly}`}>
            <section className={styles.catalog}>
              <div className={styles.sectionHead}><div><span>PASO 1</span><b>Elegí productos</b></div><small>Podés repetirlos para probar cantidades.</small></div>
              <div className={styles.productGrid}>
                {products.map((product,index)=><button key={product.name} type="button" className={styles.productCard} onClick={()=>add(index)}>
                  <span className={styles.productCategory}>{product.category}</span>
                  <b>{product.name}</b>
                  <div><strong>{money.format(product.price)}</strong><i>Agregar</i></div>
                </button>)}
              </div>
              <div className={styles.demoHint}><b>Tip de la demo</b><span>Probá agregar varias unidades y después cambiá el medio de pago. Todo responde como una caja real.</span></div>
            </section>

            <section className={styles.salePanel}>
              <div className={styles.saleHead}><div><span>VENTA ACTUAL</span><b>{itemCount?`${itemCount} artículo${itemCount===1?'':'s'}`:'Esperando productos'}</b></div><div className={styles.saleTopRight}>{itemCount>0&&<button type="button" onClick={()=>setCart({})}>Vaciar</button>}<span><small>TOTAL</small><strong>{money.format(total)}</strong></span></div></div>

              <div className={styles.cartArea}>
                <div className={styles.cartTitle}>PRODUCTOS CARGADOS</div>
                {lines.length?<div className={styles.cartList}>{lines.map(line=><div className={styles.cartRow} key={line.index}><div><b>{line.product.name}</b><small>{money.format(line.product.price)} c/u</small></div><div className={styles.qty}><button type="button" onClick={()=>changeQty(line.index,-1)}>−</button><b>{line.qty}</b><button type="button" onClick={()=>changeQty(line.index,1)}>+</button></div><strong>{money.format(line.product.price*line.qty)}</strong></div>)}</div>:<div className={styles.emptyCart}><b>Tu venta aparece acá</b><span>Agregá un producto del panel izquierdo para empezar.</span></div>}
              </div>

              <div className={styles.checkoutPanel}>
                <div className={styles.tools}><button type="button" className={customer?styles.toolActive:''} onClick={()=>setCustomer(value=>!value)}>{customer?'Cliente demo asociado':'Agregar cliente'}</button><button type="button" className={discount?styles.toolDiscountActive:''} onClick={()=>setDiscount(value=>!value)}>{discount?'Descuento 10% aplicado':'Agregar descuento'}</button></div>
                <div className={styles.paymentBlock}><span>MEDIO DE PAGO</span><div className={styles.payments}>{payments.map(value=><button key={value} type="button" className={payment===value?styles.paymentSelected:''} onClick={()=>setPayment(value)}>{value}</button>)}</div></div>
                {payment==='Efectivo'&&<div className={styles.cashRow}><label>Efectivo recibido<input inputMode="decimal" value={cashReceived} onChange={event=>setCashReceived(event.target.value)} placeholder={itemCount?`Ej: ${Math.ceil(total/1000)*1000}`:'Ej: 10000'}/></label><div className={styles.change}><span>Vuelto</span><strong>{received>=total&&total>0?money.format(change):'—'}</strong></div></div>}
                <div className={styles.totals}>{discountAmount>0&&<div><span>Subtotal</span><b>{money.format(subtotal)}</b></div>}{discountAmount>0&&<div className={styles.discountLine}><span>Descuento</span><b>− {money.format(discountAmount)}</b></div>}<div className={styles.grand}><span>TOTAL</span><strong>{money.format(total)}</strong></div></div>
                <div className={styles.checkoutActions}><button type="button" className={styles.invoice} disabled={!itemCount} onClick={()=>checkout('fiscal')}>Cobrar y facturar</button><button type="button" className={styles.charge} disabled={!itemCount} onClick={()=>checkout('internal')}>Cobrar</button></div>
                <div className={styles.safeNote}>Demo segura · no crea ventas, facturas ni movimientos reales.</div>
              </div>
            </section>
          </div>

          <div className={mobile.mobileDemo}>
            <div className={mobile.mobileStep}><span>1</span><div><b>Sumá productos</b><small>Una muestra rápida del flujo de caja.</small></div>{itemCount>0&&<button type="button" onClick={()=>setCart({})}>Vaciar</button>}</div>
            <div className={mobile.mobileProducts}>
              {products.slice(0,4).map((product,index)=><article className={mobile.mobileProduct} key={product.name}>
                <span>{product.category}</span><b>{product.name}</b><strong>{money.format(product.price)}</strong>
                <div>{cart[index]>0&&<><button type="button" onClick={()=>changeQty(index,-1)}>−</button><em>{cart[index]}</em></>}<button type="button" className={mobile.mobileAdd} onClick={()=>add(index)}>+</button></div>
              </article>)}
            </div>
            <div className={mobile.mobileSale}>
              <div><span>VENTA DEMO</span><b>{itemCount?`${itemCount} artículo${itemCount===1?'':'s'}`:'Elegí un producto'}</b></div><strong>{money.format(total)}</strong>
            </div>
            {itemCount>0&&<div className={mobile.mobileSummary}>{lines.slice(0,2).map(line=><span key={line.index}>{line.product.name} × {line.qty}</span>)}{lines.length>2&&<span>+ {lines.length-2} más</span>}</div>}
            <div className={mobile.mobilePayment}><span>2 · MEDIO DE PAGO</span><div>{mobilePayments.map(value=><button type="button" key={value} className={payment===value?mobile.mobilePaymentActive:''} onClick={()=>setPayment(value)}>{value}</button>)}</div></div>
            <button type="button" className={mobile.mobileCheckout} disabled={!itemCount} onClick={()=>checkout('fiscal')}><span>{itemCount?'Cobrar y ver ticket':'Agregá un producto'}</span>{itemCount>0&&<b>{money.format(total)}</b>}</button>
            <small className={mobile.mobileSafe}>Demo segura · no crea ventas ni facturas reales.</small>
          </div>
        </>:<>
          <div className={`${styles.successScene} ${mobile.desktopOnly}`}>
            <div className={styles.successCopy}><span>{paid==='fiscal'?'FACTURACIÓN DEMO':'VENTA DEMO'}</span><h3>{paid==='fiscal'?'Venta cobrada y ticket listo.':'Venta cobrada correctamente.'}</h3><p>{paid==='fiscal'?'Así se siente el cierre de una venta con facturación integrada.':'La venta queda registrada sin emitir factura en ese momento.'}</p><div className={styles.successStats}><div><small>Artículos</small><b>{itemCount}</b></div><div><small>Medio de pago</small><b>{payment}</b></div><div><small>Total</small><b>{money.format(total)}</b></div></div><div className={styles.successActions}><button type="button" onClick={reset}>Hacer otra venta</button><Link href="/prueba-gratis">Probar con mi negocio</Link></div></div>
            <div className={styles.receiptStage}><div className={styles.printer}><span/><i/></div><article className={styles.receipt}><div className={styles.receiptBrand}>COMERCIO LLENO</div><div className={styles.receiptMeta}>{paid==='fiscal'?'COMPROBANTE FISCAL · DEMO':'VENTA INTERNA · DEMO'}</div><div className={styles.receiptRule}/>{lines.map(line=><div className={styles.receiptLine} key={line.index}><span>{line.qty} × {line.product.name}</span><b>{money.format(line.product.price*line.qty)}</b></div>)}{discountAmount>0&&<div className={styles.receiptLine}><span>Descuento 10%</span><b>− {money.format(discountAmount)}</b></div>}<div className={styles.receiptRule}/><div className={styles.receiptTotal}><span>TOTAL</span><b>{money.format(total)}</b></div><div className={styles.receiptPayment}>Pago: {payment}</div>{paid==='fiscal'&&<div className={styles.fiscalBox}><DemoQr/><div><b>ARCA · DEMO</b><span>CAE 00000000000000</span><small>QR DEMO · NO VÁLIDO</small></div></div>}<div className={styles.receiptFoot}>Simulación visual. No es un comprobante real.</div></article></div>
          </div>
          <div className={mobile.mobileSuccess}>
            <div className={mobile.mobileSuccessMark}>✓</div><span>VENTA DEMO</span><h3>Cobro listo.</h3><p>Así termina una venta en Comercio Lleno.</p>
            <div className={mobile.mobileReceipt}><div><span>{itemCount} artículos</span><b>{money.format(total)}</b></div><small>{payment} · Ticket fiscal demo</small><i>ARCA · DEMO</i></div>
            <button type="button" onClick={reset}>Hacer otra venta</button><Link href="/prueba-gratis">Probar con mi negocio →</Link>
          </div>
        </>}

        <div className={`${styles.foot} ${mobile.compactFoot}`}><div className={styles.steps}><span className={itemCount?styles.stepDone:''}><b>1</b> Productos</span><span className={itemCount?styles.stepDone:''}><b>2</b> Pago</span><span className={paid?styles.stepDone:''}><b>3</b> Ticket</span></div><Link href="/prueba-gratis">Empezar prueba gratis →</Link></div>
      </div>
    </div>}
  </>
}
