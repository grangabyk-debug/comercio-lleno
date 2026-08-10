'use client'

import { useEffect, useRef, useState } from 'react'

type Product = { id: string; name: string; barcode: string; price: number; stock: number }
type CartItem = Product & { qty: number }

const demoProducts: Product[] = [
  { id: '1', name: 'Detergente 750 ml', barcode: '779000000001', price: 2500, stock: 24 },
  { id: '2', name: 'Lavandina 2 L', barcode: '779000000002', price: 1800, stock: 18 },
  { id: '3', name: 'Esponja multiuso', barcode: '779000000003', price: 950, stock: 50 },
]

export default function Home() {
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const addProduct = (product: Product) => setCart(items => {
    const found = items.find(i => i.id === product.id)
    return found ? items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...items, { ...product, qty: 1 }]
  })

  const scan = () => {
    const value = query.trim()
    const product = demoProducts.find(p => p.barcode === value)
    if (product) { addProduct(product); setQuery('') }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

  return <main className="shell">
    <header className="topbar"><div><div className="brand">Comercio <span>Lleno</span></div><div className="subtitle">Punto de venta</div></div><div className="status"><i /> Caja 1 · Operativa</div></header>
    <section className="workspace">
      <div className="products panel">
        <div className="search"><span>⌕</span><input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && scan()} placeholder="Escaneá un código de barras o buscá un producto" autoComplete="off" /></div>
        <div className="hint">El scanner USB funciona directamente sobre este campo.</div>
        <div className="quick">
          {demoProducts.map(p => <button key={p.id} onClick={() => addProduct(p)}><b>{p.name}</b><span>{money.format(p.price)}</span></button>)}
        </div>
      </div>
      <div className="ticket panel">
        <div className="ticketHead"><h1>Venta actual</h1><button onClick={() => setCart([])}>Vaciar</button></div>
        <div className="items">
          {cart.length === 0 ? <div className="empty"><div>🛒</div><b>Esperando productos</b><span>Pasá el código por el scanner para empezar.</span></div> : cart.map(item => <div className="item" key={item.id}><div><b>{item.name}</b><span>{item.qty} × {money.format(item.price)}</span></div><strong>{money.format(item.qty * item.price)}</strong></div>)}
        </div>
        <div className="checkout"><div className="total"><span>Total</span><strong>{money.format(total)}</strong></div><div className="payments"><button disabled={!cart.length}>Efectivo</button><button disabled={!cart.length}>Débito</button><button disabled={!cart.length}>Crédito</button><button disabled={!cart.length}>Transferencia</button></div><button className="charge" disabled={!cart.length}>Cobrar y facturar</button></div>
      </div>
    </section>
  </main>
}