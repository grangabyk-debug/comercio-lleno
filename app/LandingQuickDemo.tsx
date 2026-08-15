'use client'

import {useMemo,useState} from 'react'
import Link from 'next/link'
import styles from './LandingQuickDemo.module.css'

const products=[
  {name:'Detergente 750 ml',price:3150},
  {name:'Shampoo 400 ml',price:4890},
  {name:'Rollos de cocina',price:2750},
]

const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})

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
  const[cart,setCart]=useState<number[]>([])
  const[paid,setPaid]=useState(false)
  const total=useMemo(()=>cart.reduce((sum,index)=>sum+products[index].price,0),[cart])
  const add=(index:number)=>{setPaid(false);setCart(rows=>[...rows,index])}
  const reset=()=>{setCart([]);setPaid(false)}

  return <>
    <button type="button" className={styles.trigger} onClick={()=>setOpen(true)}><span className={styles.play}>▶</span><span><b>Probá una venta</b><small>cobro + ticket fiscal demo</small></span></button>
    {open&&<div className={styles.backdrop} onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false)}}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Demo rápida de una venta">
        <div className={styles.head}><div><span>DEMO INTERACTIVA</span><h2>Vendé. Cobrá. Mirá salir el ticket.</h2></div><button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar">×</button></div>
        <div className={styles.grid}>
          <div className={styles.products}>
            <p>Tocá productos como si estuvieras en la caja.</p>
            {products.map((product,index)=><button key={product.name} type="button" onClick={()=>add(index)}><span><b>{product.name}</b><small>Stock disponible</small></span><strong>{money.format(product.price)}</strong><i>+</i></button>)}
            <div className={styles.flow}><span className={cart.length?styles.done:''}>1</span><b>Productos</b><i>→</i><span className={paid?styles.done:''}>2</span><b>Cobro</b><i>→</i><span className={paid?styles.done:''}>3</span><b>Ticket</b></div>
          </div>
          <div className={styles.ticket}>
            {!paid?<>
              <div><span>VENTA DEMO</span><b>{cart.length} ítem{cart.length===1?'':'s'}</b></div>
              <ul>{cart.length?cart.map((index,row)=><li key={`${index}-${row}`}><span>{products[index].name}</span><b>{money.format(products[index].price)}</b></li>):<li className={styles.empty}>Agregá un producto para empezar.</li>}</ul>
              <div className={styles.total}><span>Total</span><strong>{money.format(total)}</strong></div>
              <button type="button" disabled={!cart.length} onClick={()=>setPaid(true)}>{cart.length?'Cobrar venta demo':'Esperando productos'}</button>
              <small>No guarda datos ni genera una venta real.</small>
            </>:<div className={styles.receiptScene}>
              <div className={styles.printer}><span className={styles.printerLight}/><div className={styles.printerSlot}/></div>
              <article className={styles.receipt}>
                <div className={styles.receiptBrand}>COMERCIO LLENO</div>
                <div className={styles.receiptMeta}>COMPROBANTE FISCAL · DEMO</div>
                <div className={styles.receiptRule}/>
                {cart.map((index,row)=><div className={styles.receiptLine} key={`${index}-${row}`}><span>{products[index].name}</span><b>{money.format(products[index].price)}</b></div>)}
                <div className={styles.receiptRule}/>
                <div className={styles.receiptTotal}><span>TOTAL</span><b>{money.format(total)}</b></div>
                <div className={styles.fiscalBox}><DemoQr/><div><b>ARCA · DEMO</b><span>CAE 00000000000000</span><small>QR DEMO · NO VÁLIDO</small></div></div>
                <div className={styles.receiptFoot}>Simulación visual. No es un comprobante fiscal real.</div>
              </article>
              <button className={styles.reset} type="button" onClick={reset}>Hacer otra venta</button>
            </div>}
          </div>
        </div>
        <div className={styles.foot}><span>La idea es que entiendas el flujo antes de registrarte.</span><Link href="/prueba-gratis">Probar con mi negocio →</Link></div>
      </div>
    </div>}
  </>
}
