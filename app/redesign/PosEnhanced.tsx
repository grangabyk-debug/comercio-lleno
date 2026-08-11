'use client'

import { useState } from 'react'
import core from './page.module.css'
import enh from './enhancements.module.css'
import type { CartLine, CommerceSnapshot } from '@/lib/comercio/types'
import type { ArcaHealth } from '@/lib/comercio/api'
import { Head, money } from './operationalShared'
import UiIcon from './UiIcon'

const payments = ['Efectivo', 'Débito', 'Crédito', 'Transferencia', 'Mercado Pago', 'Billetera Virtual']

export default function PosEnhanced({
  data, query, setQuery, filtered, cart, addProduct, changeQty, removeProduct,
  subtotal, discountKind, setDiscountKind, discountValue, setDiscountValue,
  discountAmount, total, customerId, setCustomerId, payment, setPayment,
  checkout, busy, arca, offline = false, pendingOffline = 0,
}: {
  data: CommerceSnapshot
  query: string
  setQuery: (v: string) => void
  filtered: CommerceSnapshot['products']
  cart: CartLine[]
  addProduct: (id: string) => void
  changeQty: (id: string, d: number) => void
  removeProduct: (id: string) => void
  subtotal: number
  discountKind: 'percent' | 'amount'
  setDiscountKind: (v: 'percent' | 'amount') => void
  discountValue: number
  setDiscountValue: (v: number) => void
  discountAmount: number
  total: number
  customerId: string
  setCustomerId: (v: string) => void
  payment: string
  setPayment: (v: string) => void
  checkout: () => void
  busy: boolean
  arca: ArcaHealth | null
  offline?: boolean
  pendingOffline?: number
}) {
  const [showCustomer, setShowCustomer] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const [cashReceived, setCashReceived] = useState('')

  const received = Number(String(cashReceived).replace(',', '.')) || 0
  const change = Math.max(0, received - total)
  const customer = data.customers.find(c => c.id === customerId)

  function scan() {
    const exact = data.products.find(p => String(p.barcode || '') === query.trim())
    if (exact) addProduct(exact.id)
    else if (filtered[0]) addProduct(filtered[0].id)
  }

  return <>
    <Head
      eyebrow="PUNTO DE VENTA · F2"
      title="Nueva venta"
      subtitle={offline ? 'Modo offline: podés seguir vendiendo. La facturación se sincroniza cuando vuelva Internet.' : 'Escaneá, asociá cliente, aplicá descuentos y cobrá con facturación ARCA.'}
    >
      <div className={core.headBadges}>
        <span className={`${core.badge} ${data.cashRegister?.status === 'open' ? core.badgeGreen : core.badgeRed}`}>
          {data.cashRegister?.status === 'open' ? '● Caja abierta' : '● Caja cerrada'}
        </span>
        <span className={`${core.badge} ${offline ? core.badgeAmber : arca?.connected ? core.badgeGreen : core.badgeRed}`}>
          {offline ? `● Offline${pendingOffline ? ` · ${pendingOffline} pend.` : ''}` : arca?.connected ? '● ARCA online' : '● ARCA offline'}
        </span>
      </div>
    </Head>

    <div className={core.posGrid}>
      <div className={core.posProducts}>
        <div className={core.searchCard}>
          <div className={core.searchBox}>
            <span className={core.searchIcon}><UiIcon name="search" size={19}/></span>
            <input
              className={core.inputBare}
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && scan()}
              placeholder="Escaneá un código o buscá un producto…"
            />
            <button className={core.primary} onClick={scan}>Agregar</button>
          </div>
          <div className={core.scanHint}>Scanner USB listo · Enter agrega automáticamente</div>
        </div>

        <div className={core.productList}>
          {filtered.map(p => <button key={p.id} className={core.productRow} onClick={() => addProduct(p.id)}>
            <div className={core.productIcon}><UiIcon name="products" size={19}/></div>
            <div className={core.productInfo}>
              <b>{p.name}</b>
              <small>{p.barcode || 'Sin código'} · {p.category || 'General'}</small>
            </div>
            <span className={`${core.stockMini} ${p.stock <= Number(p.min_stock ?? 5) ? core.stockLow : ''}`}>Stock {p.stock}</span>
            <strong>{money.format(p.price)}</strong>
          </button>)}
        </div>
      </div>

      <aside className={core.saleCard}>
        <div className={core.saleCardHead}>
          <div>
            <span>VENTA ACTUAL</span>
            <h2>{cart.length ? `${cart.reduce((a, i) => a + i.qty, 0)} artículos` : 'Sin productos'}</h2>
          </div>
          <button className={core.ghostDanger} onClick={() => cart.forEach(i => removeProduct(i.id))}>Vaciar</button>
        </div>

        <div className={core.cart}>
          {cart.length ? cart.map(i => <div className={core.cartLine} key={i.id}>
            <div className={core.cartName}>
              <b>{i.name}</b>
              <small>{money.format(i.price)} c/u</small>
              <div className={core.qty}>
                <button onClick={() => changeQty(i.id, -1)}>−</button>
                <b>{i.qty}</b>
                <button onClick={() => changeQty(i.id, 1)}>+</button>
                <button className={core.removeItem} onClick={() => removeProduct(i.id)}>×</button>
              </div>
            </div>
            <strong>{money.format(i.price * i.qty)}</strong>
          </div>) : <div className={core.emptyCart}>
            <div><UiIcon name="sale" size={27}/></div><b>Esperando productos</b><span>Escaneá un código para empezar.</span>
          </div>}
        </div>

        <div className={core.checkout}>
          {offline ? <div className={enh.offlineSaleBanner}>
            <div className={enh.offlineSaleIcon}>↯</div>
            <div><b>Venta offline</b><span>El cobro se guarda en este equipo. No es una factura fiscal hasta que vuelva Internet y ARCA otorgue CAE.</span></div>
          </div> : !arca?.connected && <div className={enh.offlineBanner}>
            ⚠ ARCA está sin responder. Si Internet funciona, al cobrar vas a poder decidir si registrás la venta como Pendiente ARCA.
          </div>}

          <div className={enh.saleTools}>
            <button className={`${enh.saleTool} ${customerId ? enh.saleToolActive : ''}`} onClick={() => setShowCustomer(x => !x)}>
              <UiIcon name="user" size={17}/> {customer ? customer.name : 'Agregar cliente'}
            </button>
            <button className={`${enh.saleTool} ${discountAmount > 0 ? enh.saleToolActive : ''}`} onClick={() => setShowDiscount(x => !x)}>
              <UiIcon name="discount" size={17}/> {discountAmount > 0 ? `Descuento ${money.format(discountAmount)}` : 'Agregar descuento'}
            </button>
          </div>

          {showCustomer && <div className={enh.toolPanel}>
            <label>Cliente asociado</label>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
              <option value="">Consumidor final / sin asociar</option>
              {data.customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.tax_id ? ` · ${c.tax_id}` : ''}</option>)}
            </select>
          </div>}

          {showDiscount && <div className={enh.toolPanel}>
            <label>Descuento sobre la venta</label>
            <div className={enh.discountGrid}>
              <select value={discountKind} onChange={e => setDiscountKind(e.target.value as 'percent' | 'amount')}>
                <option value="percent">Porcentaje %</option>
                <option value="amount">Importe $</option>
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountValue || ''}
                onChange={e => setDiscountValue(Math.max(0, Number(e.target.value) || 0))}
                placeholder={discountKind === 'percent' ? 'Ej: 10' : 'Ej: 1500'}
              />
            </div>
            <div className={enh.quickDiscounts}>
              <button onClick={() => { setDiscountKind('percent'); setDiscountValue(5) }}>5%</button>
              <button onClick={() => { setDiscountKind('percent'); setDiscountValue(10) }}>10%</button>
              <button onClick={() => setDiscountValue(0)}>Quitar</button>
            </div>
          </div>}

          <div className={enh.summaryLine}><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div>
          {discountAmount > 0 && <div className={`${enh.summaryLine} ${enh.discountLine}`}><span>Descuento</span><strong>− {money.format(discountAmount)}</strong></div>}
          <div className={core.totalLine}><span>Total</span><strong>{money.format(total)}</strong></div>

          <label className={core.checkoutLabel}>MEDIO DE PAGO</label>
          <div className={core.payments}>
            {payments.map(p => <button key={p} className={`${core.payment} ${payment === p ? core.paymentSelected : ''}`} onClick={() => setPayment(p)}>{p}</button>)}
          </div>

          {payment === 'Efectivo' && <div className={enh.cashChange}>
            <label>Efectivo recibido</label>
            <input
              inputMode="decimal"
              value={cashReceived}
              onChange={e => setCashReceived(e.target.value)}
              placeholder={`Ej: ${Math.ceil(total / 1000) * 1000 || 1000}`}
            />
            <div className={enh.changeResult}><span>Vuelto</span><strong>{received >= total ? money.format(change) : '—'}</strong></div>
          </div>}

          <button
            className={`${core.charge} ${enh.bigCharge}`}
            disabled={!cart.length || data.cashRegister?.status !== 'open' || busy || total <= 0}
            onClick={checkout}
          >
            {busy ? 'Procesando…' : data.cashRegister?.status === 'open' ? offline ? `Guardar venta offline · ${money.format(total)}` : `Cobrar ${money.format(total)}` : 'Abrí la caja para cobrar'}
          </button>
          {offline && <div className={enh.offlineFootnote}>Se descuenta el stock local para seguir operando. La sincronización fiscal se realiza automáticamente al recuperar conexión.</div>}
        </div>
      </aside>
    </div>
  </>
}
