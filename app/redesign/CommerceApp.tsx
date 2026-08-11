'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './page.module.css'
import {
  authorizeFiscalInvoice,
  checkArcaHealth,
  closeCashRegister,
  loadCommerceSnapshot,
  openCashRegister,
  persistAuthorizedSale,
  persistUninvoicedSale,
  type ArcaHealth,
} from '@/lib/comercio/api'
import { downloadReceiptPdf, emailReceipt, printReceipt, receiptNumber } from '@/lib/comercio/receipt'
import { readDeviceSettings, readTenantSession, writeDeviceSettings } from '@/lib/comercio/session'
import type { CartLine, CommerceSnapshot, DeviceSettings, Sale, ViewKey } from '@/lib/comercio/types'

const payments = ['Efectivo', 'Débito', 'Crédito', 'Transferencia', 'Mercado Pago', 'Billetera Virtual']
const denoms = [100, 200, 500, 1000, 2000, 5000, 10000, 20000]
const nav: Array<[ViewKey, string, string]> = [
  ['dashboard', '⌂', 'Inicio'],
  ['pos', '▣', 'Caja'],
  ['sales', '▤', 'Ventas'],
  ['products', '▦', 'Productos'],
  ['stock', '◈', 'Stock'],
  ['reports', '◔', 'Reportes'],
  ['customers', '♙', 'Clientes'],
  ['cash', '◷', 'Caja diaria'],
  ['settings', '⚙', 'Configuración'],
]
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

function dayKey(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysAgo(n: number) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d.getTime()
}

function createId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function CommerceApp({ buildVersion }: { buildVersion: string }) {
  const [session, setSession] = useState<ReturnType<typeof readTenantSession>>(null)
  const [data, setData] = useState<CommerceSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [view, setView] = useState<ViewKey>('dashboard')
  const [dark, setDark] = useState(false)
  const [now, setNow] = useState(new Date())
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [payment, setPayment] = useState('Efectivo')
  const [saleSearch, setSaleSearch] = useState('')
  const [salePage, setSalePage] = useState(0)
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null)
  const [device, setDevice] = useState<DeviceSettings>({ paper: '80', autoPrint: false, printerMode: 'browser', printerName: '', receiptCopies: 1 })
  const [arca, setArca] = useState<ArcaHealth | null>(null)
  const [arcaChecking, setArcaChecking] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [contingency, setContingency] = useState<{ sale: Sale; stock: Array<{ id: string; stock: number }>; reason: string } | null>(null)

  async function refresh(s = session) {
    if (!s) return
    setError('')
    try { setData(await loadCommerceSnapshot(s)) }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }

  async function refreshArca(s = session) {
    if (!s || arcaChecking) return
    setArcaChecking(true)
    try { setArca(await checkArcaHealth(s)) }
    finally { setArcaChecking(false) }
  }

  useEffect(() => {
    const s = readTenantSession()
    setSession(s)
    if (!s) { setLoading(false); return }
    setDevice(readDeviceSettings(s.companyId))
    setLoading(true)
    Promise.all([loadCommerceSnapshot(s), checkArcaHealth(s)])
      .then(([snapshot, health]) => { setData(snapshot); setArca(health) })
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))

    const clock = window.setInterval(() => setNow(new Date()), 1000)
    const healthTimer = window.setInterval(() => { checkArcaHealth(s).then(setArca).catch(() => {}) }, 60000)
    const key = (e: KeyboardEvent) => { if (e.key === 'F2') { e.preventDefault(); setView('pos') } }
    window.addEventListener('keydown', key)
    return () => {
      window.clearInterval(clock)
      window.clearInterval(healthTimer)
      window.removeEventListener('keydown', key)
    }
  }, [])

  const today = dayKey(new Date())
  const todaySales = useMemo(() => data?.sales.filter(s => dayKey(s.date) === today) || [], [data, today])
  const todayTotal = useMemo(() => todaySales.reduce((a, s) => a + s.total, 0), [todaySales])
  const lowStock = useMemo(() => data?.products.filter(p => p.stock <= Number(p.min_stock ?? 5)).length || 0, [data])
  const total = useMemo(() => cart.reduce((a, i) => a + i.price * i.qty, 0), [cart])
  const filteredProducts = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    const rows = q ? data.products.filter(p => `${p.name} ${p.barcode || ''} ${p.category || ''}`.toLowerCase().includes(q)) : data.products
    return rows.slice(0, 50)
  }, [data, query])
  const openedAt = data?.cashRegister?.opened_at ? new Date(data.cashRegister.opened_at).getTime() : 0
  const sessionSales = useMemo(() => data?.sales.filter(s => !openedAt || new Date(s.date).getTime() >= openedAt) || [], [data, openedAt])
  const sessionMovements = useMemo(() => data?.cashMovements.filter(m => !openedAt || new Date(m.occurred_at).getTime() >= openedAt) || [], [data, openedAt])
  const cashSales = sessionSales.filter(s => /efect/i.test(s.payment)).reduce((a, s) => a + s.total, 0)
  const expenses = sessionMovements.filter(m => m.kind === 'expense' || m.kind === 'egress').reduce((a, m) => a + m.amount, 0)
  const incomes = sessionMovements.filter(m => m.kind === 'income').reduce((a, m) => a + m.amount, 0)
  const cashEstimated = Number(data?.cashRegister?.opening_amount || 0) + cashSales + incomes - expenses

  if (loading) return <div className={styles.loading}>Cargando Comercio Lleno…</div>
  if (!session) return <div className={styles.loginBox}><div className={styles.loginCard}><div className={styles.loginLogo}>CL</div><h1>Comercio Lleno</h1><p>Ingresá con tu cuenta para abrir el piloto nuevo.</p><button className={styles.primary} onClick={() => location.href = '/login'}>Ingresar</button></div></div>

  const tenant = session

  function addProduct(id: string) {
    const p = data?.products.find(x => x.id === id)
    if (!p) return
    if (p.stock <= 0) { setNotice('Ese producto está sin stock.'); return }
    setCart(rows => {
      const f = rows.find(x => x.id === id)
      return f ? rows.map(x => x.id === id ? { ...x, qty: Math.min(x.qty + 1, p.stock) } : x) : [...rows, { ...p, qty: 1 }]
    })
    setQuery('')
  }

  function changeQty(id: string, delta: number) {
    setCart(rows => rows.map(x => x.id === id ? { ...x, qty: Math.max(1, Math.min(x.stock, x.qty + delta)) } : x))
  }

  function removeProduct(id: string) { setCart(rows => rows.filter(x => x.id !== id)) }
  function saveDevice(next: DeviceSettings) { setDevice(next); writeDeviceSettings(tenant.companyId, next); setNotice('Configuración de esta PC guardada.') }

  async function checkout() {
    if (!data || !cart.length || checkoutBusy) return
    if (data.cashRegister?.status !== 'open') { setNotice('Primero tenés que abrir la caja.'); return }
    setCheckoutBusy(true)
    setError('')
    const id = createId()
    const items = cart.map(i => ({ product_id: i.id, name: i.name, barcode: i.barcode || null, qty: i.qty, unit_price: i.price, line_total: i.price * i.qty }))
    const base: Sale = {
      id,
      date: new Date().toISOString(),
      total,
      payment,
      items: items.reduce((a, i) => a + i.qty, 0),
      receipt_type: 'factura_c',
      fiscal_status: 'pending',
      details: { items, subtotal_before_discount: total, captured_at: new Date().toISOString() },
    }
    const stock = cart.map(i => ({ id: i.id, stock: Math.max(0, i.stock - i.qty) }))

    try {
      const invoice = await authorizeFiscalInvoice(tenant, total, id)
      const authorized: Sale = {
        ...base,
        fiscal_status: 'authorized',
        cae: invoice.cae,
        receiptNumber: invoice.receipt_number,
        caeExpiration: invoice.cae_expiration || null,
        fiscalEnvironment: arca?.environment || 'homologacion',
      }
      await persistAuthorizedSale(tenant, authorized, stock)
      setCart([])
      setNotice(`Venta registrada · Factura C ${receiptNumber(authorized)}`)
      setReceiptSale(authorized)
      setArca({ ...(arca || { connected: true }), connected: true, checkedAt: new Date().toISOString() })
      await refresh(tenant)
      if (device.autoPrint) {
        try { await printReceipt(authorized, data.company, device) } catch {}
      }
    } catch (e) {
      const err = e as Error & { arcaUnavailable?: boolean }
      if (err.arcaUnavailable) {
        setArca({ connected: false, checkedAt: new Date().toISOString(), error: err.message })
        setContingency({ sale: base, stock, reason: err.message })
      } else {
        setError(`No se pudo facturar: ${err.message}`)
      }
    } finally {
      setCheckoutBusy(false)
    }
  }

  async function confirmContingency() {
    if (!contingency) return
    setCheckoutBusy(true)
    try {
      await persistUninvoicedSale(tenant, contingency.sale, contingency.stock, contingency.reason)
      setCart([])
      setNotice('Venta registrada sin factura. Quedó marcada como Pendiente ARCA.')
      setContingency(null)
      await refresh(tenant)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setCheckoutBusy(false) }
  }

  async function openCash() {
    if (!data) return
    const raw = window.prompt('Importe inicial de caja', String(data.cashRegister?.opening_amount || 0))
    if (raw == null) return
    const amount = Math.max(0, Number(raw.replace(',', '.')) || 0)
    try { await openCashRegister(tenant, data.cashRegister, amount); await refresh(tenant); setNotice('Caja abierta.') }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }

  async function closeCash() {
    if (!data?.cashRegister) return
    if (!window.confirm('¿Confirmás el cierre de caja?')) return
    try { await closeCashRegister(tenant, data.cashRegister); await refresh(tenant); setNotice('Caja cerrada.') }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }

  const visibleNav = nav.filter(([key]) => tenant.role === 'owner' || key !== 'settings')
  const arcaLabel = arcaChecking ? 'ARCA verificando…' : arca?.connected ? 'ARCA conectado' : 'ARCA desconectado'
  const arcaClass = arcaChecking ? styles.statusNeutral : arca?.connected ? styles.statusOk : styles.statusBad

  return <main className={`${styles.shell} ${dark ? styles.dark : ''}`}>
    <header className={styles.topbar}>
      <div className={styles.brandWrap}>
        <div className={styles.brandMark}>CL</div>
        <div><div className={styles.brand}>Comercio <span>Lleno</span></div><div className={styles.tenant}>{data?.company.name || tenant.companyName} · {tenant.role === 'owner' ? 'Propietario' : tenant.role}</div></div>
      </div>
      <div className={styles.headerRight}>
        <button className={`${styles.status} ${arcaClass}`} onClick={() => refreshArca(tenant)} title={arca?.error || (arca?.latencyMs ? `Respuesta ${arca.latencyMs} ms` : 'Verificar ARCA')}>● {arcaLabel}</button>
        <span className={styles.versionPill}>Piloto · {buildVersion}</span>
        <button className={styles.headerButton} onClick={() => refresh(tenant)}>↻ Actualizar</button>
        <button className={styles.headerButton} onClick={() => setDark(x => !x)}>{dark ? '☀ Claro' : '☾ Oscuro'}</button>
        <button className={styles.headerButton} onClick={() => location.href = '/?app=1'}>Versión actual</button>
      </div>
    </header>

    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.navLabel}>OPERACIÓN</div>
        {visibleNav.map(([key, icon, label]) => <button key={key} className={`${styles.navButton} ${view === key ? styles.navActive : ''}`} onClick={() => setView(key)}><span>{icon}</span>{label}</button>)}
        <div className={styles.sidebarBottom}><b>Comercio Lleno</b><span>Versión piloto {buildVersion}</span><small>Arquitectura multi-tenant · tenant {tenant.companyId.slice(0, 8)}</small></div>
      </aside>

      <section className={styles.content}>
        {error && <div className={styles.error}><span>{error}</span><button onClick={() => setError('')}>×</button></div>}
        {notice && <div className={styles.notice}><span>{notice}</span><button onClick={() => setNotice('')}>×</button></div>}
        {data && view === 'dashboard' && <Dashboard data={data} todayTotal={todayTotal} todayCount={todaySales.length} lowStock={lowStock} setView={setView} />}
        {data && view === 'pos' && <Pos data={data} query={query} setQuery={setQuery} filtered={filteredProducts} cart={cart} addProduct={addProduct} changeQty={changeQty} removeProduct={removeProduct} total={total} payment={payment} setPayment={setPayment} checkout={checkout} busy={checkoutBusy} arca={arca} />}
        {data && view === 'sales' && <Sales data={data} search={saleSearch} setSearch={x => { setSaleSearch(x); setSalePage(0) }} page={salePage} setPage={setSalePage} openReceipt={setReceiptSale} device={device} onMessage={setNotice} />}
        {data && view === 'products' && <Products data={data} />}
        {data && view === 'stock' && <Stock data={data} />}
        {data && view === 'reports' && <Reports data={data} />}
        {data && view === 'customers' && <Customers data={data} />}
        {data && view === 'cash' && <Cash data={data} sessionSales={sessionSales} movements={sessionMovements} cashEstimated={cashEstimated} openCash={openCash} closeCash={closeCash} />}
        {data && view === 'settings' && <Settings data={data} device={device} saveDevice={saveDevice} arca={arca} buildVersion={buildVersion} />}
      </section>
    </div>

    <div className={styles.bottomBar}><div className={styles.bottomStats}><div><span>Ventas hoy</span><b>{money.format(todayTotal)}</b></div><div><span>Caja estimada</span><b>{money.format(cashEstimated)}</b></div><div><span>Stock bajo</span><b>{lowStock}</b></div></div><div className={styles.time}>{now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div></div>

    {receiptSale && data && <ReceiptModal sale={receiptSale} data={data} device={device} close={() => setReceiptSale(null)} onMessage={setNotice} />}
    {contingency && <ContingencyModal reason={contingency.reason} total={contingency.sale.total} busy={checkoutBusy} yes={confirmContingency} no={() => setContingency(null)} />}
  </main>
}

function Head({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children?: React.ReactNode }) {
  return <div className={styles.pageHead}><div><div className={styles.eyebrow}>{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{children}</div>
}

function Dashboard({ data, todayTotal, todayCount, lowStock, setView }: { data: CommerceSnapshot; todayTotal: number; todayCount: number; lowStock: number; setView: (v: ViewKey) => void }) {
  const recent = data.sales.slice(0, 6)
  return <><Head eyebrow={data.company.name} title="Inicio" subtitle="Resumen del comercio y accesos de operación."><button className={styles.primary} onClick={() => setView('pos')}>+ Nueva venta</button></Head><div className={styles.kpis}><div className={`${styles.kpi} ${styles.kpiAccent}`}><span>Ventas de hoy</span><strong>{money.format(todayTotal)}</strong><small>{todayCount} operaciones</small></div><div className={styles.kpi}><span>Ticket promedio</span><strong>{money.format(todayCount ? todayTotal / todayCount : 0)}</strong><small>Promedio del día</small></div><div className={styles.kpi}><span>Stock bajo</span><strong>{lowStock}</strong><small>Productos para revisar</small></div><div className={styles.kpi}><span>Caja</span><strong>{data.cashRegister?.status === 'open' ? 'Abierta' : 'Cerrada'}</strong><small>{data.cashRegister?.opened_at ? `Desde ${new Date(data.cashRegister.opened_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : 'Sin apertura activa'}</small></div></div><div className={styles.gridTwo}><div className={styles.panel}><div className={styles.panelTitle}><div><b>Últimas ventas</b><small>Actividad más reciente</small></div><button className={styles.linkButton} onClick={() => setView('sales')}>Ver todas →</button></div>{recent.length ? recent.map(s => <div className={styles.recentRow} key={s.id}><span className={styles.roundIcon}>{s.cae ? '✓' : '!'}</span><div><b>{s.receiptNumber ? `Factura C ${receiptNumber(s)}` : `Venta #${s.id.slice(0, 8)}`}</b><small>{new Date(s.date).toLocaleString('es-AR')} · {s.payment}</small></div><strong>{money.format(s.total)}</strong></div>) : <div className={styles.empty}>Todavía no hay ventas.</div>}</div><div className={styles.panel}><div className={styles.panelTitle}><div><b>Accesos rápidos</b><small>Lo más usado del día</small></div></div><div className={styles.shortcutGrid}><button className={styles.shortcut} onClick={() => setView('pos')}><span>▣</span><div><b>Ir a Caja</b><small>Escáner, carrito y cobro</small></div></button><button className={styles.shortcut} onClick={() => setView('stock')}><span>◈</span><div><b>Revisar stock</b><small>Faltantes y mínimos</small></div></button><button className={styles.shortcut} onClick={() => setView('cash')}><span>◷</span><div><b>Caja diaria</b><small>Cierre y contador</small></div></button></div></div></div></>
}

function Pos({ data, query, setQuery, filtered, cart, addProduct, changeQty, removeProduct, total, payment, setPayment, checkout, busy, arca }: { data: CommerceSnapshot; query: string; setQuery: (v: string) => void; filtered: CommerceSnapshot['products']; cart: CartLine[]; addProduct: (id: string) => void; changeQty: (id: string, d: number) => void; removeProduct: (id: string) => void; total: number; payment: string; setPayment: (v: string) => void; checkout: () => void; busy: boolean; arca: ArcaHealth | null }) {
  function scan() { const exact = data.products.find(p => String(p.barcode || '') === query.trim()); if (exact) addProduct(exact.id); else if (filtered[0]) addProduct(filtered[0].id) }
  return <><Head eyebrow="Punto de venta · F2" title="Caja" subtitle="Venta rápida con scanner, control de stock y facturación ARCA."><div className={styles.headBadges}><span className={`${styles.badge} ${data.cashRegister?.status === 'open' ? styles.badgeGreen : styles.badgeRed}`}>{data.cashRegister?.status === 'open' ? '● Caja abierta' : '● Caja cerrada'}</span><span className={`${styles.badge} ${arca?.connected ? styles.badgeGreen : styles.badgeRed}`}>{arca?.connected ? '● ARCA online' : '● ARCA offline'}</span></div></Head><div className={styles.posGrid}><div className={styles.posProducts}><div className={styles.searchCard}><div className={styles.searchBox}><span className={styles.searchIcon}>⌕</span><input className={styles.inputBare} autoFocus value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && scan()} placeholder="Escaneá un código o buscá un producto…"/><button className={styles.primary} onClick={scan}>Agregar</button></div><div className={styles.scanHint}>Scanner USB listo · Enter agrega automáticamente</div></div><div className={styles.productList}>{filtered.map(p => <button key={p.id} className={styles.productRow} onClick={() => addProduct(p.id)}><div className={styles.productIcon}>▦</div><div className={styles.productInfo}><b>{p.name}</b><small>{p.barcode || 'Sin código'} · {p.category || 'General'}</small></div><span className={`${styles.stockMini} ${p.stock <= Number(p.min_stock ?? 5) ? styles.stockLow : ''}`}>Stock {p.stock}</span><strong>{money.format(p.price)}</strong></button>)}</div></div><aside className={styles.saleCard}><div className={styles.saleCardHead}><div><span>VENTA ACTUAL</span><h2>{cart.length ? `${cart.reduce((a, i) => a + i.qty, 0)} artículos` : 'Sin productos'}</h2></div><button className={styles.ghostDanger} onClick={() => cart.forEach(i => removeProduct(i.id))}>Vaciar</button></div><div className={styles.cart}>{cart.length ? cart.map(i => <div className={styles.cartLine} key={i.id}><div className={styles.cartName}><b>{i.name}</b><small>{money.format(i.price)} c/u</small><div className={styles.qty}><button onClick={() => changeQty(i.id, -1)}>−</button><b>{i.qty}</b><button onClick={() => changeQty(i.id, 1)}>+</button><button className={styles.removeItem} onClick={() => removeProduct(i.id)}>×</button></div></div><strong>{money.format(i.price * i.qty)}</strong></div>) : <div className={styles.emptyCart}><div>▣</div><b>Esperando productos</b><span>Escaneá un código para empezar.</span></div>}</div><div className={styles.checkout}><div className={styles.totalLine}><span>Total</span><strong>{money.format(total)}</strong></div><label className={styles.checkoutLabel}>MEDIO DE PAGO</label><div className={styles.payments}>{payments.map(p => <button key={p} className={`${styles.payment} ${payment === p ? styles.paymentSelected : ''}`} onClick={() => setPayment(p)}>{p}</button>)}</div>{!arca?.connected && <div className={styles.arcaWarning}>ARCA figura desconectado. Si al cobrar no responde, vas a poder registrar la venta igualmente como pendiente de facturación.</div>}<button className={styles.charge} disabled={!cart.length || data.cashRegister?.status !== 'open' || busy} onClick={checkout}>{busy ? 'Procesando…' : data.cashRegister?.status === 'open' ? `Cobrar ${money.format(total)}` : 'Abrí la caja para cobrar'}</button></div></aside></div></>
}

function Sales({ data, search, setSearch, page, setPage, openReceipt, device, onMessage }: { data: CommerceSnapshot; search: string; setSearch: (v: string) => void; page: number; setPage: (v: number) => void; openReceipt: (s: Sale) => void; device: DeviceSettings; onMessage: (m: string) => void }) {
  const q = search.trim().toLowerCase()
  const filtered = data.sales.filter(s => `${s.id} ${s.receiptNumber || ''} ${s.payment} ${s.cae || ''} ${s.fiscal_status || ''}`.toLowerCase().includes(q))
  const size = 20, pages = Math.max(1, Math.ceil(filtered.length / size)), current = Math.min(page, pages - 1), rows = filtered.slice(current * size, current * size + size)
  async function sendMail(s: Sale) { const customer = data.customers.find(c => c.id === s.customer_id); let email = customer?.email || ''; if (!email) email = window.prompt('Email del cliente', '') || ''; const result = await emailReceipt(s, data.company, email); if (result === 'mailto') onMessage('Abrimos tu correo y descargamos el PDF para adjuntar.'); }
  async function print(s: Sale) { try { await printReceipt(s, data.company, device) } catch (e) { onMessage(e instanceof Error ? e.message : String(e)) } }
  return <><Head eyebrow="Operaciones" title="Ventas" subtitle="Historial paginado con comprobantes y estado fiscal."/><div className={styles.tableTools}><div className={styles.searchSlim}><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar factura, operación, CAE o medio de pago…"/></div></div><div className={styles.table}><div className={`${styles.tableRow} ${styles.tableHead}`}><span>Fecha</span><span>Comprobante</span><span>Pago</span><span>Total</span><span>Estado</span><span>Acciones</span></div>{rows.map(s => <div className={styles.tableRow} key={s.id}><span><b>{new Date(s.date).toLocaleDateString('es-AR')}</b><small>{new Date(s.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</small></span><span>{s.receiptNumber ? <><b>Factura C</b><small>{receiptNumber(s)}</small></> : <><b>Venta #{s.id.slice(0, 8)}</b><small>Sin comprobante fiscal</small></>}</span><span>{s.payment}</span><span><b>{money.format(s.total)}</b></span><span>{s.cae ? <span className={`${styles.badge} ${styles.badgeGreen}`}>Autorizada</span> : <span className={`${styles.badge} ${styles.badgeAmber}`}>Pendiente ARCA</span>}</span><span>{s.cae ? <div className={styles.rowActions}><button onClick={() => downloadReceiptPdf(s, data.company)}>PDF</button><button onClick={() => print(s)}>Imprimir</button><button onClick={() => sendMail(s)}>Enviar mail</button><button onClick={() => openReceipt(s)}>Ver</button></div> : <span className={styles.pendingText}>Venta registrada sin factura</span>}</span></div>)}</div><div className={styles.pager}><button disabled={current === 0} onClick={() => setPage(current - 1)}>← Anterior</button><span>Página {current + 1} de {pages} · {filtered.length} ventas</span><button disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>Siguiente →</button></div></>
}

function Products({ data }: { data: CommerceSnapshot }) { const [q, setQ] = useState(''); const rows = data.products.filter(p => `${p.name} ${p.barcode || ''} ${p.category || ''}`.toLowerCase().includes(q.toLowerCase())).slice(0, 300); return <><Head eyebrow="Catálogo" title="Productos" subtitle={`${data.products.length} productos activos.`}/><div className={styles.tableTools}><div className={styles.searchSlim}><span>⌕</span><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar producto, código o categoría…"/></div></div><div className={`${styles.table} ${styles.productTable}`}><div className={`${styles.tableRow} ${styles.tableHead}`}><span>Producto</span><span>Código</span><span>Categoría</span><span>Precio</span><span>Stock</span></div>{rows.map(p => <div className={styles.tableRow} key={p.id}><span><b>{p.name}</b></span><span>{p.barcode || '—'}</span><span>{p.category || 'General'}</span><span>{money.format(p.price)}</span><span>{p.stock}</span></div>)}</div></> }

function Stock({ data }: { data: CommerceSnapshot }) { const [mode, setMode] = useState<'all' | 'low' | 'out'>('all'); const rows = data.products.filter(p => mode === 'all' || mode === 'out' && p.stock <= 0 || mode === 'low' && p.stock > 0 && p.stock <= Number(p.min_stock ?? 5)); return <><Head eyebrow="Inventario" title="Stock" subtitle="Existencias y alertas por mínimo."><div className={styles.segment}><button className={mode === 'all' ? styles.segmentActive : ''} onClick={() => setMode('all')}>Todos</button><button className={mode === 'low' ? styles.segmentActive : ''} onClick={() => setMode('low')}>Bajo</button><button className={mode === 'out' ? styles.segmentActive : ''} onClick={() => setMode('out')}>Agotados</button></div></Head><div className={`${styles.table} ${styles.stockTable}`}><div className={`${styles.tableRow} ${styles.tableHead}`}><span>Producto</span><span>Categoría</span><span>Stock</span><span>Mínimo</span><span>Estado</span></div>{rows.map(p => { const min = Number(p.min_stock ?? 5); return <div className={styles.tableRow} key={p.id}><span><b>{p.name}</b></span><span>{p.category || 'General'}</span><span>{p.stock}</span><span>{min}</span><span><span className={`${styles.badge} ${p.stock <= 0 ? styles.badgeRed : p.stock <= min ? styles.badgeAmber : styles.badgeGreen}`}>{p.stock <= 0 ? 'Agotado' : p.stock <= min ? 'Bajo' : 'Normal'}</span></span></div> })}</div></> }

function Reports({ data }: { data: CommerceSnapshot }) { const now = Date.now(); const periods = [['Hoy', new Date().setHours(0, 0, 0, 0)], ['7 días', daysAgo(6)], ['30 días', daysAgo(29)]] as const; return <><Head eyebrow="Análisis" title="Reportes" subtitle="Lectura directa de las ventas del comercio."/><div className={styles.reportGrid}>{periods.map(([label, start]) => { const rows = data.sales.filter(s => new Date(s.date).getTime() >= start && new Date(s.date).getTime() <= now); const total = rows.reduce((a, s) => a + s.total, 0); return <div className={styles.reportCard} key={label}><span>{label}</span><strong>{money.format(total)}</strong><small>{rows.length} operaciones · Ticket prom. {money.format(rows.length ? total / rows.length : 0)}</small></div> })}</div><div className={styles.panel}><div className={styles.panelTitle}><div><b>Medios de pago · últimos 30 días</b><small>Distribución de ventas</small></div></div>{payments.map(p => { const rows = data.sales.filter(s => new Date(s.date).getTime() >= daysAgo(29) && s.payment === p); const total = rows.reduce((a, s) => a + s.total, 0); return <div className={styles.recentRow} key={p}><span className={styles.roundIcon}>%</span><div><b>{p}</b><small>{rows.length} operaciones</small></div><strong>{money.format(total)}</strong></div> })}</div></> }

function Customers({ data }: { data: CommerceSnapshot }) { const [q, setQ] = useState(''); const rows = data.customers.filter(c => `${c.name} ${c.phone || ''} ${c.email || ''} ${c.tax_id || ''}`.toLowerCase().includes(q.toLowerCase())); return <><Head eyebrow="Clientes" title="Clientes" subtitle={`${data.customers.length} contactos asociados al comercio.`}/><div className={styles.tableTools}><div className={styles.searchSlim}><span>⌕</span><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar nombre, teléfono, email o CUIT…"/></div></div><div className={`${styles.table} ${styles.customerTable}`}><div className={`${styles.tableRow} ${styles.tableHead}`}><span>Nombre</span><span>Teléfono</span><span>Email</span><span>CUIT/DNI</span></div>{rows.map(c => <div className={styles.tableRow} key={c.id}><span><b>{c.name}</b></span><span>{c.phone || '—'}</span><span>{c.email || '—'}</span><span>{c.tax_id || '—'}</span></div>)}</div></> }

function Cash({ data, sessionSales, movements, cashEstimated, openCash, closeCash }: { data: CommerceSnapshot; sessionSales: Sale[]; movements: CommerceSnapshot['cashMovements']; cashEstimated: number; openCash: () => void; closeCash: () => void }) {
  const [counts, setCounts] = useState<Record<number, number>>({})
  const counted = denoms.reduce((sum, d) => sum + d * (counts[d] || 0), 0)
  const salesTotal = sessionSales.reduce((a, s) => a + s.total, 0)
  const exp = movements.filter(m => m.kind === 'expense' || m.kind === 'egress').reduce((a, m) => a + m.amount, 0)
  const diff = counted - cashEstimated
  return <><Head eyebrow="Control de caja" title="Caja diaria" subtitle="Apertura, ventas, movimientos, cierre y contador de billetes."><button className={data.cashRegister?.status === 'open' ? styles.danger : styles.primary} onClick={data.cashRegister?.status === 'open' ? closeCash : openCash}>{data.cashRegister?.status === 'open' ? 'Cerrar caja' : 'Abrir caja'}</button></Head><div className={styles.cashHero}><div className={styles.cashStat}><span>Estado</span><strong>{data.cashRegister?.status === 'open' ? 'Abierta' : 'Cerrada'}</strong></div><div className={styles.cashStat}><span>Apertura</span><strong>{money.format(Number(data.cashRegister?.opening_amount || 0))}</strong></div><div className={styles.cashStat}><span>Ventas sesión</span><strong>{money.format(salesTotal)}</strong></div><div className={styles.cashStat}><span>Efectivo estimado</span><strong>{money.format(cashEstimated)}</strong></div></div><div className={styles.cashLayout}><div className={styles.panel}><div className={styles.panelTitle}><div><b>Actividad desde la apertura</b><small>{sessionSales.length} ventas · egresos {money.format(exp)}</small></div></div>{sessionSales.slice(0, 18).map(s => <div className={styles.recentRow} key={s.id}><span className={styles.roundIcon}>{s.cae ? '✓' : '!'}</span><div><b>{s.receiptNumber ? `Factura ${receiptNumber(s)}` : `Venta #${s.id.slice(0, 8)}`}</b><small>{new Date(s.date).toLocaleString('es-AR')} · {s.payment}</small></div><strong>{money.format(s.total)}</strong></div>)}</div><div className={styles.counterCard}><div className={styles.counterHead}><div><span>CONTADOR DE BILLETES</span><h3>Arqueo rápido</h3></div><div className={styles.counterTotal}><small>Total contado</small><strong>{money.format(counted)}</strong></div></div><div className={styles.denomList}>{denoms.map(d => <div className={styles.denomRow} key={d}><label>{money.format(d)}</label><span>×</span><input type="number" min="0" inputMode="numeric" value={counts[d] || ''} onChange={e => setCounts({ ...counts, [d]: Math.max(0, Number(e.target.value) || 0) })}/><b>{money.format(d * (counts[d] || 0))}</div>)}</div><div className={styles.counterSummary}><div><span>Sistema</span><b>{money.format(cashEstimated)}</b></div><div><span>Contado</span><b>{money.format(counted)}</b></div><div className={Math.abs(diff) < 1 ? styles.diffOk : styles.diffBad}><span>Diferencia</span><b>{money.format(diff)}</b></div></div><button className={styles.counterReset} onClick={() => setCounts({})}>Limpiar conteo</button></div></div></>
}

function Settings({ data, device, saveDevice, arca, buildVersion }: { data: CommerceSnapshot; device: DeviceSettings; saveDevice: (d: DeviceSettings) => void; arca: ArcaHealth | null; buildVersion: string }) { const [draft, setDraft] = useState(device); useEffect(() => setDraft(device), [device]); return <><Head eyebrow="Administración" title="Configuración" subtitle="Datos del comercio y configuración propia de esta PC."><button className={styles.primary} onClick={() => saveDevice(draft)}>Guardar dispositivo</button></Head><div className={styles.settingsGrid}><div className={styles.settingCard}><span className={styles.cardKicker}>TENANT</span><h3>Datos del comercio</h3><p>Identidad fiscal y comercial asociada a esta cuenta.</p><div className={styles.formGrid}><label>Nombre<input className={styles.input} value={data.company.name} readOnly/></label><label>CUIT<input className={styles.input} value={data.company.tax_id || ''} readOnly placeholder="No informado"/></label></div></div><div className={styles.settingCard}><span className={styles.cardKicker}>FACTURACIÓN</span><h3>ARCA</h3><p>Estado real del servicio fiscal para este comercio.</p><div className={styles.settingLine}><span>Conexión</span><b className={arca?.connected ? styles.textGreen : styles.textRed}>{arca?.connected ? 'Conectado' : 'Desconectado'}</b></div><div className={styles.settingLine}><span>Servicio</span><b>{arca?.service || 'wsfev1'}</b></div><div className={styles.settingLine}><span>Punto de venta</span><b>{arca?.pointOfSale ?? '—'}</b></div></div><div className={styles.settingCard}><span className={styles.cardKicker}>ESTE DISPOSITIVO</span><h3>Impresora térmica</h3><p>Se guarda localmente en esta PC, no en el tenant.</p><div className={styles.formGrid}><label>Papel<select className={styles.select} value={draft.paper} onChange={e => setDraft({ ...draft, paper: e.target.value as '80' | '58' })}><option value="80">80 mm</option><option value="58">58 mm</option></select></label><label>Modo<select className={styles.select} value={draft.printerMode} onChange={e => setDraft({ ...draft, printerMode: e.target.value as 'browser' | 'bridge' })}><option value="browser">Navegador</option><option value="bridge">Bridge local / automático</option></select></label><label>Nombre impresora<input className={styles.input} value={draft.printerName} onChange={e => setDraft({ ...draft, printerName: e.target.value })} placeholder="Al conectar la térmica"/></label><label>Copias<input className={styles.input} type="number" min="1" max="3" value={draft.receiptCopies} onChange={e => setDraft({ ...draft, receiptCopies: Math.max(1, Math.min(3, Number(e.target.value) || 1)) })}/></label></div><label className={styles.toggleLine}><span>Imprimir automáticamente luego de ARCA</span><input type="checkbox" checked={draft.autoPrint} onChange={e => setDraft({ ...draft, autoPrint: e.target.checked })}/></label></div><div className={styles.settingCard}><span className={styles.cardKicker}>SISTEMA</span><h3>Versión</h3><p>Este número cambia automáticamente con cada publicación.</p><div className={styles.versionBig}>Piloto · {buildVersion}</div><div className={styles.settingLine}><span>Arquitectura</span><b>Multi-tenant</b></div><div className={styles.settingLine}><span>Separación</span><b>company_id</b></div></div></div></> }

function ReceiptModal({ sale, data, device, close, onMessage }: { sale: Sale; data: CommerceSnapshot; device: DeviceSettings; close: () => void; onMessage: (m: string) => void }) {
  async function print() { try { await printReceipt(sale, data.company, device) } catch (e) { onMessage(e instanceof Error ? e.message : String(e)) } }
  async function mail() { const customer = data.customers.find(c => c.id === sale.customer_id); let email = customer?.email || ''; if (!email) email = window.prompt('Email del cliente', '') || ''; const result = await emailReceipt(sale, data.company, email); if (result === 'mailto') onMessage('Abrimos tu correo y descargamos el PDF para adjuntar.'); }
  return <div className={styles.modal} onMouseDown={e => e.target === e.currentTarget && close()}><div className={styles.modalCard}><div className={styles.modalHead}><div><span>COMPROBANTE FISCAL</span><h3>Factura C {receiptNumber(sale)}</h3><p>Guardada dentro de la venta</p></div><button onClick={close}>×</button></div><div className={styles.receiptHero}><div><span>Total</span><strong>{money.format(sale.total)}</strong></div><div><span>CAE</span><b>{sale.cae || '—'}</b></div><div><span>Vencimiento</span><b>{sale.caeExpiration || '—'}</b></div></div><div className={styles.modalActions}><button className={styles.primary} onClick={() => downloadReceiptPdf(sale, data.company)}>↓ Descargar PDF</button><button className={styles.secondary} onClick={print}>▣ Imprimir</button><button className={styles.secondary} onClick={mail}>✉ Enviar por mail</button></div></div></div>
}

function ContingencyModal({ reason, total, busy, yes, no }: { reason: string; total: number; busy: boolean; yes: () => void; no: () => void }) {
  return <div className={styles.modal}><div className={`${styles.modalCard} ${styles.contingencyCard}`}><div className={styles.alertIcon}>!</div><h3>ARCA perdió conexión</h3><p>No pudimos emitir la Factura C en este momento.</p><div className={styles.reasonBox}>{reason}</div><div className={styles.contingencyTotal}><span>Venta</span><strong>{money.format(total)}</strong></div><p>¿Querés registrar igualmente la venta? Quedará guardada como <b>Pendiente ARCA</b>, sin CAE ni número de factura.</p><div className={styles.modalActions}><button className={styles.secondary} disabled={busy} onClick={no}>No, volver</button><button className={styles.primary} disabled={busy} onClick={yes}>{busy ? 'Guardando…' : 'Sí, registrar venta'}</button></div></div></div>
}
