'use client'

import { useEffect, useMemo, useState } from 'react'
import { loadCommerceSnapshot } from '@/lib/comercio/api'
import { readTenantSession, signInTenant } from '@/lib/comercio/session'
import type { CartLine, CommerceSnapshot, TenantSession } from '@/lib/comercio/types'
import styles from './mobile.module.css'

type View = 'home' | 'sale' | 'products' | 'cash'

type PreviewSale = {
  total: number
  payment: string
  items: number
}

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
const payments = ['Efectivo', 'Transferencia', 'Débito', 'Crédito', 'Mercado Pago']

function dayKey(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function clearSession() {
  ;['cl_access_token','cl_refresh_token','cl_company_id','cl_company_name','cl_user_role','cl_user_permissions'].forEach(key => localStorage.removeItem(key))
}

export default function MobileSimpleApp() {
  const [session, setSession] = useState<TenantSession | null>(null)
  const [data, setData] = useState<CommerceSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState<View>('home')
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [payment, setPayment] = useState('Efectivo')
  const [previewSales, setPreviewSales] = useState<PreviewSale[]>([])
  const [toast, setToast] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)

  async function load(s: TenantSession) {
    setLoading(true)
    setError('')
    try {
      const snapshot = await loadCommerceSnapshot(s)
      setData(snapshot)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const s = readTenantSession()
    setSession(s)
    if (s) void load(s)
    else setLoading(false)
  }, [])

  const today = dayKey(new Date())
  const todaySales = useMemo(() => data?.sales.filter(sale => dayKey(sale.date) === today) || [], [data, today])
  const actualTotal = useMemo(() => todaySales.reduce((sum, sale) => sum + sale.total, 0), [todaySales])
  const previewTotal = useMemo(() => previewSales.reduce((sum, sale) => sum + sale.total, 0), [previewSales])
  const todayTotal = actualTotal + previewTotal
  const todayCount = todaySales.length + previewSales.length
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart])
  const cartItems = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart])
  const filtered = useMemo(() => {
    const products = data?.products || []
    const q = query.trim().toLowerCase()
    if (!q) return products.slice(0, 50)
    return products.filter(product => `${product.name} ${product.barcode || ''} ${product.category || ''}`.toLowerCase().includes(q)).slice(0, 50)
  }, [data, query])

  const paymentTotals = useMemo(() => {
    const totals = new Map<string, number>()
    todaySales.forEach(sale => totals.set(sale.payment, (totals.get(sale.payment) || 0) + sale.total))
    previewSales.forEach(sale => totals.set(sale.payment, (totals.get(sale.payment) || 0) + sale.total))
    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1])
  }, [todaySales, previewSales])

  function addProduct(id: string) {
    const product = data?.products.find(item => item.id === id)
    if (!product) return
    setCart(rows => {
      const current = rows.find(item => item.id === id)
      if (current) return rows.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item)
      return [...rows, { ...product, qty: 1 }]
    })
    setToast(`${product.name} agregado`)
    window.setTimeout(() => setToast(''), 1200)
  }

  function changeQty(id: string, delta: number) {
    setCart(rows => rows
      .map(item => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item)
      .filter(item => item.qty > 0))
  }

  function simulateInvoice() {
    if (!cart.length || cartTotal <= 0) return
    setPreviewSales(rows => [...rows, { total: cartTotal, payment, items: cartItems }])
    setCart([])
    setPayment('Efectivo')
    setQuery('')
    setView('home')
    setToast('✓ Venta simulada. La preview no modificó datos reales.')
    window.setTimeout(() => setToast(''), 3200)
  }

  async function login(event: React.FormEvent) {
    event.preventDefault()
    if (loginBusy) return
    setLoginBusy(true)
    setError('')
    try {
      const s = await signInTenant(email, password)
      setSession(s)
      await load(s)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoginBusy(false)
    }
  }

  function logout() {
    clearSession()
    setSession(null)
    setData(null)
    setView('home')
  }

  if (!session) {
    return <main className={styles.loginScreen}>
      <div className={styles.loginCard}>
        <div className={styles.logo}>CL</div>
        <span className={styles.previewTag}>PREVIEW</span>
        <h1>Comercio Lleno Móvil</h1>
        <p>La versión simple para vender y facturar desde el celular.</p>
        <form onSubmit={login}>
          <label>Usuario o email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" placeholder="tu@email.com" />
          <label>Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" />
          {error && <div className={styles.loginError}>{error}</div>}
          <button className={styles.loginButton} disabled={loginBusy}>{loginBusy ? 'Ingresando…' : 'Entrar'}</button>
        </form>
        <small>Esta preview usa tu cuenta real solo para mostrar datos. Las ventas hechas acá se simulan y no modifican stock ni caja.</small>
      </div>
    </main>
  }

  if (loading) return <main className={styles.loading}><div className={styles.loader}/><b>Cargando tu comercio…</b></main>

  return <main className={styles.app}>
    <div className={styles.phoneShell}>
      <header className={styles.topbar}>
        <div className={styles.brandBlock}>
          <div className={styles.logoSmall}>CL</div>
          <div>
            <b>Comercio Lleno</b>
            <span>{data?.company.name || session.companyName}</span>
          </div>
        </div>
        <a className={styles.fullLink} href="/redesign">Versión completa</a>
      </header>

      <div className={styles.planStrip}>
        <span>Plan Simple · Preview</span>
        <b>Caja automática</b>
      </div>

      {error && <div className={styles.errorBar}>{error}<button onClick={() => setError('')}>×</button></div>}
      {toast && <div className={styles.toast}>{toast}</div>}

      <section className={styles.content}>
        {view === 'home' && <>
          <div className={styles.greeting}>
            <div>
              <span>Hoy</span>
              <h1>{money.format(todayTotal)}</h1>
              <p>{todayCount} venta{todayCount === 1 ? '' : 's'} registrada{todayCount === 1 ? '' : 's'}</p>
            </div>
            <div className={styles.autoCash}><i>✓</i><span>Caja<br/><b>automática</b></span></div>
          </div>

          <button className={styles.saleHero} onClick={() => setView('sale')}>
            <span className={styles.plus}>+</span>
            <span><b>Nueva venta</b><small>Elegí productos y facturá</small></span>
            <i>›</i>
          </button>

          <div className={styles.bigGrid}>
            <button className={styles.bigAction} onClick={() => setView('products')}>
              <span className={styles.actionIcon}>▦</span>
              <b>Productos</b>
              <small>Ver productos y servicios</small>
            </button>
            <button className={styles.bigAction} onClick={() => setView('cash')}>
              <span className={styles.actionIcon}>$</span>
              <b>Movimientos</b>
              <small>Resumen de lo vendido hoy</small>
            </button>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardHead}><div><span>RESUMEN DE HOY</span><b>Cómo viene el día</b></div><button onClick={() => setView('cash')}>Ver todo</button></div>
            <div className={styles.summaryRow}><span>Ventas</span><b>{todayCount}</b></div>
            <div className={styles.summaryRow}><span>Total vendido</span><b>{money.format(todayTotal)}</b></div>
            <div className={styles.summaryRow}><span>Productos / servicios</span><b>{data?.products.length || 0}</b></div>
          </div>

          <button className={styles.switchCard} onClick={() => location.href = '/redesign'}>
            <div><span>¿Necesitás más?</span><b>Pasá a la versión completa cuando quieras</b><small>Reportes, stock avanzado, proveedores, usuarios y más.</small></div><i>→</i>
          </button>
        </>}

        {view === 'sale' && <>
          <div className={styles.sectionHead}><button onClick={() => setView('home')}>‹</button><div><span>VENTA RÁPIDA</span><h2>Nueva venta</h2></div><div className={styles.cartCount}>{cartItems}</div></div>

          <div className={styles.searchBox}>
            <span>⌕</span>
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar producto o servicio…" />
          </div>

          <div className={styles.productPicker}>
            {filtered.length ? filtered.map(product => <button className={styles.productItem} key={product.id} onClick={() => addProduct(product.id)}>
              <div><b>{product.name}</b><small>{product.category || 'General'}</small></div>
              <strong>{money.format(product.price)}</strong>
              <span>+</span>
            </button>) : <div className={styles.empty}>No encontramos productos con esa búsqueda.</div>}
          </div>

          <div className={styles.cartCard}>
            <div className={styles.cartTitle}><div><span>VENTA ACTUAL</span><b>{cartItems ? `${cartItems} ítem${cartItems === 1 ? '' : 's'}` : 'Sin productos'}</b></div>{cart.length > 0 && <button onClick={() => setCart([])}>Vaciar</button>}</div>
            {cart.length ? <div className={styles.cartLines}>{cart.map(item => <div className={styles.cartLine} key={item.id}>
              <div className={styles.cartName}><b>{item.name}</b><small>{money.format(item.price)} c/u</small></div>
              <div className={styles.qty}><button onClick={() => changeQty(item.id, -1)}>−</button><b>{item.qty}</b><button onClick={() => changeQty(item.id, 1)}>+</button></div>
              <strong>{money.format(item.price * item.qty)}</strong>
            </div>)}</div> : <div className={styles.emptyCart}>Tocá un producto para empezar.</div>}

            <label className={styles.paymentLabel}>Medio de pago</label>
            <div className={styles.paymentGrid}>{payments.map(item => <button key={item} onClick={() => setPayment(item)} className={payment === item ? styles.paymentActive : ''}>{item}</button>)}</div>
            <div className={styles.totalRow}><span>Total</span><b>{money.format(cartTotal)}</b></div>
            <button className={styles.invoiceButton} disabled={!cart.length} onClick={simulateInvoice}>Facturar {cart.length ? money.format(cartTotal) : ''}</button>
            <small className={styles.demoNote}>Preview segura: este botón simula el resultado y no registra una venta real.</small>
          </div>
        </>}

        {view === 'products' && <>
          <div className={styles.sectionHead}><button onClick={() => setView('home')}>‹</button><div><span>CATÁLOGO</span><h2>Productos y servicios</h2></div><div className={styles.countBubble}>{data?.products.length || 0}</div></div>
          <div className={styles.searchBox}><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar…" /></div>
          <div className={styles.catalogList}>{filtered.map(product => <div className={styles.catalogRow} key={product.id}>
            <div><b>{product.name}</b><small>{product.category || 'General'}{product.stock != null ? ` · Stock ${product.stock}` : ''}</small></div><strong>{money.format(product.price)}</strong>
          </div>)}</div>
          {!data?.products.length && <div className={styles.emptyState}><span>▦</span><b>Todavía no hay productos</b><p>En la versión final vas a poder cargar productos o servicios desde acá, o usar la versión completa.</p><a href="/redesign">Ir a versión completa</a></div>}
        </>}

        {view === 'cash' && <>
          <div className={styles.sectionHead}><button onClick={() => setView('home')}>‹</button><div><span>HOY</span><h2>Movimientos</h2></div><div className={styles.autoMini}>Auto</div></div>
          <div className={styles.cashHero}><span>Total vendido hoy</span><h2>{money.format(todayTotal)}</h2><p>{todayCount} venta{todayCount === 1 ? '' : 's'} · sin abrir ni cerrar caja</p></div>
          <div className={styles.summaryCard}>
            <div className={styles.cardHead}><div><span>POR MEDIO DE PAGO</span><b>Distribución</b></div></div>
            {paymentTotals.length ? paymentTotals.map(([name, amount]) => <div className={styles.summaryRow} key={name}><span>{name}</span><b>{money.format(amount)}</b></div>) : <div className={styles.emptyInline}>Todavía no hubo ventas hoy.</div>}
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.cardHead}><div><span>ÚLTIMAS VENTAS</span><b>Actividad reciente</b></div></div>
            {todaySales.slice(0, 8).map(sale => <div className={styles.saleHistory} key={sale.id}><div><b>{new Date(sale.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</b><small>{sale.payment}</small></div><strong>{money.format(sale.total)}</strong></div>)}
            {previewSales.map((sale, index) => <div className={styles.saleHistory} key={`preview-${index}`}><div><b>Ahora</b><small>{sale.payment} · simulada</small></div><strong>{money.format(sale.total)}</strong></div>)}
            {!todaySales.length && !previewSales.length && <div className={styles.emptyInline}>Sin movimientos todavía.</div>}
          </div>
          <div className={styles.autoInfo}><span>✓</span><div><b>Caja automática</b><p>Esta versión no obliga al usuario a abrir o cerrar caja. El día se resume automáticamente a partir de las ventas.</p></div></div>
        </>}
      </section>

      <nav className={styles.bottomNav}>
        <button className={view === 'home' ? styles.navActive : ''} onClick={() => setView('home')}><span>⌂</span><small>Inicio</small></button>
        <button className={view === 'products' ? styles.navActive : ''} onClick={() => setView('products')}><span>▦</span><small>Productos</small></button>
        <button className={`${styles.centerSale} ${view === 'sale' ? styles.centerActive : ''}`} onClick={() => setView('sale')}><span>+</span><small>Vender</small></button>
        <button className={view === 'cash' ? styles.navActive : ''} onClick={() => setView('cash')}><span>$</span><small>Hoy</small></button>
        <button onClick={logout}><span>⋯</span><small>Salir</small></button>
      </nav>
    </div>
  </main>
}
