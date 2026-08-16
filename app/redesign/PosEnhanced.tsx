'use client'

import { useMemo, useState } from 'react'
import core from './page.module.css'
import compact from './pos-compact.module.css'
import type { CartLine, CommerceSnapshot, PaymentPart, ViewKey } from '@/lib/comercio/types'
import type { ArcaHealth } from '@/lib/comercio/api'
import { PAYMENT_METHODS } from '@/lib/comercio/payments'
import { money } from './operationalShared'
import UiIcon from './UiIcon'

const payments = [...PAYMENT_METHODS]
type CheckoutMode = 'fiscal' | 'internal'

export default function PosEnhanced({data,query,setQuery,filtered,cart,addProduct,changeQty,removeProduct,subtotal,discountKind,setDiscountKind,discountValue,setDiscountValue,discountAmount,total,customerId,setCustomerId,payment,setPayment,paymentParts,setPaymentParts,checkout,busy,arca,offline=false,pendingOffline=0}:{
  data:CommerceSnapshot;query:string;setQuery:(v:string)=>void;filtered:CommerceSnapshot['products'];cart:CartLine[];addProduct:(id:string)=>void;changeQty:(id:string,d:number)=>void;removeProduct:(id:string)=>void;
  subtotal:number;discountKind:'percent'|'amount';setDiscountKind:(v:'percent'|'amount')=>void;discountValue:number;setDiscountValue:(v:number)=>void;discountAmount:number;total:number;customerId:string;setCustomerId:(v:string)=>void;payment:string;setPayment:(v:string)=>void;paymentParts:PaymentPart[];setPaymentParts:(v:PaymentPart[])=>void;checkout:(mode:CheckoutMode)=>void;busy:boolean;arca:ArcaHealth|null;offline?:boolean;pendingOffline?:number;
}){
  const[showCustomer,setShowCustomer]=useState(false),[showDiscount,setShowDiscount]=useState(false),[cashReceived,setCashReceived]=useState('')
  const splitActive=paymentParts.length===2
  const firstPart=paymentParts[0]
  const secondPart=paymentParts[1]
  const firstAmount=splitActive?Math.max(0,Math.min(total,Number(firstPart?.amount||0))):0
  const secondAmount=splitActive?Math.max(0,total-firstAmount):0
  const splitValid=!splitActive||(firstAmount>0&&secondAmount>0&&firstPart?.method&&secondPart?.method&&firstPart.method!==secondPart.method)
  const cashTarget=splitActive
    ? paymentParts.reduce((sum,part)=>/efect/i.test(part.method)?sum+Number(part.amount||0):sum,0)
    : payment==='Efectivo'?total:0
  const received=Number(String(cashReceived).replace(',','.'))||0,change=Math.max(0,received-cashTarget)
  const customer=data.customers.find(c=>c.id===customerId),fiscal=arca as (ArcaHealth&{configured?:boolean})|null,arcaConfigured=fiscal?.configured!==false,searching=query.trim().length>0
  function selectProduct(id:string){addProduct(id);setQuery('')}
  function scan(){const value=query.trim();if(!value)return;const exact=data.products.find(p=>String(p.barcode||'')===value);if(exact)selectProduct(exact.id);else if(filtered[0])selectProduct(filtered[0].id)}
  function goToCash(){window.dispatchEvent(new CustomEvent<ViewKey>('comercio:navigate-view',{detail:'cash'}))}
  function chooseSingle(method:string){setPayment(method);setPaymentParts([]);setCashReceived('')}
  function startSplit(){
    const first=payment||'Efectivo'
    const second=first==='Mercado Pago'?'Efectivo':'Mercado Pago'
    const suggested=Math.min(total,Math.max(0,Math.round(total/2)))
    setPaymentParts([{method:first,amount:suggested},{method:second,amount:Math.max(0,total-suggested)}])
    setCashReceived('')
  }
  function stopSplit(){setPayment(firstPart?.method||payment||'Efectivo');setPaymentParts([]);setCashReceived('')}
  function setFirstMethod(method:string){
    const fallback=payments.find(item=>item!==method&&item!==(secondPart?.method||''))||'Mercado Pago'
    const second=secondPart?.method===method?fallback:(secondPart?.method||fallback)
    setPaymentParts([{method,amount:firstAmount},{method:second,amount:secondAmount}])
  }
  function setSecondMethod(method:string){
    const fallback=payments.find(item=>item!==method&&item!==(firstPart?.method||''))||'Efectivo'
    const first=firstPart?.method===method?fallback:(firstPart?.method||fallback)
    setPaymentParts([{method:first,amount:firstAmount},{method,amount:secondAmount}])
  }
  function setFirstAmount(value:string){
    const amount=Math.max(0,Math.min(total,Number(value.replace(',','.'))||0))
    setPaymentParts([{method:firstPart?.method||'Efectivo',amount},{method:secondPart?.method||'Mercado Pago',amount:Math.max(0,total-amount)}])
  }
  const splitSummary=useMemo(()=>splitActive?`${firstPart?.method||'—'} ${money.format(firstAmount)} + ${secondPart?.method||'—'} ${money.format(secondAmount)}`:'',[splitActive,firstPart?.method,secondPart?.method,firstAmount,secondAmount])
  const disabled=!cart.length||data.cashRegister?.status!=='open'||busy||total<=0||!splitValid,itemCount=cart.reduce((a,i)=>a+i.qty,0)
  return <div className={compact.shell}>
    <div className={compact.searchWrap}><div className={core.searchCard}><div className={core.searchBox}><span className={core.searchIcon}><UiIcon name="search" size={21}/></span><input className={core.inputBare} autoFocus value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&scan()} placeholder="Buscar producto o escanear código de barras…"/><button className={core.primary} disabled={!searching} onClick={scan}>Agregar</button></div></div>
      {searching&&<div className={compact.results}>{filtered.slice(0,12).map(p=><button key={p.id} className={compact.resultRow} onClick={()=>selectProduct(p.id)}><span className={compact.resultIcon}><UiIcon name="products" size={18}/></span><span className={compact.resultInfo}><b>{p.name}</b><small>{p.barcode||'Sin código'} · {p.category||'General'}</small></span><span className={compact.resultStock}>Stock {p.stock}</span><strong className={compact.resultPrice}>{money.format(p.price)}</strong></button>)}{!filtered.length&&<div style={{padding:18,textAlign:'center',fontSize:11,color:'#74817b'}}>No encontramos productos con esa búsqueda.</div>}</div>}
    </div>
    <section className={compact.workspace}>
      <div className={compact.workspaceHead}><div><span>VENTA ACTUAL</span><h2>{itemCount?`${itemCount} artículo${itemCount===1?'':'s'}`:'Esperando productos'}</h2></div><div className={compact.headActions}><button className={core.ghostDanger} disabled={!cart.length} onClick={()=>cart.forEach(i=>removeProduct(i.id))}>Vaciar</button><div className={compact.headTotal}><span>Total</span><strong>{money.format(total)}</strong></div></div></div>
      <div className={compact.body}>
        <div className={compact.cartPanel}><div className={compact.cartLabel}>PRODUCTOS CARGADOS</div><div className={compact.cart}>{cart.length?cart.map(i=><div className={compact.cartLine} key={i.id}><div className={compact.cartProduct}><b>{i.name}</b><small>{money.format(i.price)} c/u</small></div><div className={compact.qty}><button onClick={()=>changeQty(i.id,-1)}>−</button><b>{i.qty}</b><button onClick={()=>changeQty(i.id,1)}>+</button><button className={compact.remove} onClick={()=>removeProduct(i.id)}>×</button></div><strong className={compact.lineTotal}>{money.format(i.price*i.qty)}</strong></div>):<div className={compact.empty}><div><UiIcon name="sale" size={32}/><b>Venta vacía</b><span>Usá el buscador de arriba o pasá un código con el scanner.</span></div></div>}</div></div>
        <div className={compact.controls}>
          {offline?<div className={compact.statusBanner}><b>Venta offline.</b> Si elegís facturar, se enviará cuando vuelva Internet.{pendingOffline?` Hay ${pendingOffline} pendiente${pendingOffline===1?'':'s'}.`:''}</div>:!arcaConfigured?<div className={compact.statusBanner}>ARCA no está configurado. Podés cobrar sin facturar.</div>:!arca?.connected?<div className={compact.statusBanner}>ARCA está sin responder. Podés registrar el cobro o dejar la facturación pendiente.</div>:null}
          <div className={compact.tools}><button className={`${compact.tool} ${customerId?compact.toolActive:''}`} onClick={()=>{setShowCustomer(x=>!x);setShowDiscount(false)}}><UiIcon name="user" size={17}/> {customer?customer.name:'Agregar cliente'}</button><button className={`${compact.tool} ${discountAmount>0?compact.toolActive:''}`} onClick={()=>{setShowDiscount(x=>!x);setShowCustomer(false)}}><UiIcon name="discount" size={17}/> {discountAmount>0?`Descuento ${money.format(discountAmount)}`:'Agregar descuento'}</button></div>
          {showCustomer&&<div className={compact.toolPanel}><label>Cliente asociado</label><select value={customerId} onChange={e=>setCustomerId(e.target.value)}><option value="">Consumidor final / sin asociar</option>{data.customers.map(c=><option key={c.id} value={c.id}>{c.name}{c.tax_id?` · ${c.tax_id}`:''}</option>)}</select></div>}
          {showDiscount&&<div className={compact.toolPanel}><label>Descuento sobre la venta</label><div className={compact.discountGrid}><select value={discountKind} onChange={e=>setDiscountKind(e.target.value as 'percent'|'amount')}><option value="percent">Porcentaje %</option><option value="amount">Importe $</option></select><input type="number" min="0" step="0.01" value={discountValue||''} onChange={e=>setDiscountValue(Math.max(0,Number(e.target.value)||0))} placeholder={discountKind==='percent'?'Ej: 10':'Ej: 1500'}/></div><div className={compact.quick}><button onClick={()=>{setDiscountKind('percent');setDiscountValue(5)}}>5%</button><button onClick={()=>{setDiscountKind('percent');setDiscountValue(10)}}>10%</button><button onClick={()=>setDiscountValue(0)}>Quitar</button></div></div>}
          <div className={compact.paymentHeading}><span className={compact.paymentLabel}>{splitActive?'PAGO DIVIDIDO':'MEDIO DE PAGO'}</span><button type="button" className={compact.splitButton} onClick={splitActive?stopSplit:startSplit}>{splitActive?'Usar un solo medio':'Dividir pago'}</button></div>
          {!splitActive?<div className={compact.payments}>{payments.map(p=><button key={p} className={`${compact.payment} ${payment===p?compact.paymentSelected:''}`} onClick={()=>chooseSingle(p)}>{p}</button>)}</div>:<div className={compact.splitPanel}>
            <div className={compact.splitRow}><span>1</span><select value={firstPart?.method||'Efectivo'} onChange={e=>setFirstMethod(e.target.value)}>{payments.map(method=><option key={method} value={method}>{method}</option>)}</select><input aria-label="Importe primer medio" inputMode="decimal" value={firstAmount||''} onChange={e=>setFirstAmount(e.target.value)} placeholder="$ 0"/></div>
            <div className={compact.splitRow}><span>2</span><select value={secondPart?.method||'Mercado Pago'} onChange={e=>setSecondMethod(e.target.value)}>{payments.map(method=><option key={method} value={method}>{method}</option>)}</select><div className={compact.splitRemainder}>{money.format(secondAmount)}</div></div>
            <div className={`${compact.splitCheck} ${splitValid?compact.splitCheckOk:compact.splitCheckBad}`}><span>{splitValid?'Pago completo':'Revisá los importes y medios'}</span><b>{splitSummary}</b></div>
          </div>}
          {cashTarget>0&&<div className={compact.cashRow}><label>Efectivo recibido<input inputMode="decimal" value={cashReceived} onChange={e=>setCashReceived(e.target.value)} placeholder={`Ej: ${Math.ceil(cashTarget/1000)*1000||1000}`}/></label><div className={compact.change}><span>Vuelto</span><strong>{received>=cashTarget?money.format(change):'—'}</strong></div></div>}
          <div className={compact.checkoutBox}><div className={compact.totals}><div className={compact.summary}><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div>{discountAmount>0&&<div className={`${compact.summary} ${compact.summaryDiscount}`}><span>Descuento</span><strong>− {money.format(discountAmount)}</strong></div>}<div className={compact.grand}><span>TOTAL</span><strong>{money.format(total)}</strong></div></div><div className={compact.checkoutActions}><button className={compact.invoice} disabled={disabled||!arcaConfigured} onClick={()=>checkout('fiscal')} title={data.cashRegister?.status!=='open'?'Abrí la caja antes de facturar.':!arcaConfigured?'Configurá ARCA antes de facturar.':undefined}>{busy?'Procesando…':'Cobrar y facturar'}</button><button className={compact.charge} disabled={disabled} onClick={()=>checkout('internal')}>{busy?'Procesando…':'Cobrar'}</button></div>{data.cashRegister?.status!=='open'&&<div className={compact.cashClosedWrap}><div className={compact.cashClosed}><b>Caja diaria cerrada</b><span>Abrí Caja diaria antes de poder cobrar o facturar.</span></div><button type="button" className={compact.openCashButton} onClick={goToCash}>Abrir caja</button></div>}<div className={compact.hint}><b>Cobrar</b> registra la venta sin emitir factura en ese momento.</div></div>
        </div>
      </div>
    </section>
  </div>
}