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

export default function LandingQuickDemo(){
  const[open,setOpen]=useState(false)
  const[cart,setCart]=useState<number[]>([])
  const total=useMemo(()=>cart.reduce((sum,index)=>sum+products[index].price,0),[cart])
  const add=(index:number)=>setCart(rows=>[...rows,index])

  return <>
    <button type="button" className={styles.trigger} onClick={()=>setOpen(true)}><span className={styles.play}>▶</span><span><b>Probá una venta</b><small>demo de 30 segundos</small></span></button>
    {open&&<div className={styles.backdrop} onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false)}}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Demo rápida de una venta">
        <div className={styles.head}><div><span>DEMO INTERACTIVA</span><h2>Hacé una venta ahora.</h2></div><button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar">×</button></div>
        <div className={styles.grid}>
          <div className={styles.products}>
            <p>Tocá productos como si estuvieras en la caja.</p>
            {products.map((product,index)=><button key={product.name} type="button" onClick={()=>add(index)}><span><b>{product.name}</b><small>Stock disponible</small></span><strong>{money.format(product.price)}</strong><i>+</i></button>)}
          </div>
          <div className={styles.ticket}>
            <div><span>VENTA DEMO</span><b>{cart.length} ítem{cart.length===1?'':'s'}</b></div>
            <ul>{cart.length?cart.map((index,row)=><li key={`${index}-${row}`}><span>{products[index].name}</span><b>{money.format(products[index].price)}</b></li>):<li className={styles.empty}>Agregá un producto para empezar.</li>}</ul>
            <div className={styles.total}><span>Total</span><strong>{money.format(total)}</strong></div>
            <button type="button" disabled={!cart.length} onClick={()=>setCart([])}>{cart.length?'Cobrar venta demo':'Esperando productos'}</button>
            <small>No guarda datos ni genera una venta real.</small>
          </div>
        </div>
        <div className={styles.foot}><span>Si esto te resulta simple, el resto también.</span><Link href="/prueba-gratis">Probar con mi negocio →</Link></div>
      </div>
    </div>}
  </>
}
