'use client'

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import styles from './page.module.css'
import parity from './parity.module.css'
import {
  authorizeFiscalInvoice,
  checkArcaHealth,
  closeCashRegister,
  createCustomer,
  loadCommerceSnapshot,
  openCashRegister,
  persistAuthorizedSale,
  persistUninvoicedSale,
  type ArcaHealth,
} from '@/lib/comercio/api'
import { downloadReceiptPdf, emailReceipt, printReceipt, receiptNumber } from '@/lib/comercio/receipt'
import { readDeviceSettings, readTenantSession } from '@/lib/comercio/session'
import type { CartLine, CommerceSnapshot, DeviceSettings, Sale, TenantSession, ViewKey } from '@/lib/comercio/types'
import {
  AccountsV2,
  ProductsV2,
  ProfitabilityV2,
  PromotionsV2,
  PurchasesV2,
  ReturnsV2,
  SettingsV2,
  SuppliersV2,
} from './ManagementViews'

const payments = ['Efectivo', 'Débito', 'Crédito', 'Transferencia', 'Mercado Pago', 'Billetera Virtual']
const denoms = [100, 200, 500, 1000, 2000, 5000, 10000, 20000]
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

function dayKey(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function daysAgo(n: number) { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-n); return d.getTime() }
function createId() { return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}` }

function canView(session: TenantSession, view: ViewKey) {
  if (session.role === 'owner') return true
  const p = session.permissions || {}
  if (view === 'pos') return p.can_sell ?? session.role !== 'supervisor'
  if (view === 'reports' || view === 'profitability') return p.can_view_reports !== false
  if (view === 'products' || view === 'purchases' || view === 'suppliers' || view === 'stock') return p.can_manage_stock !== false
  if (view === 'customers' || view === 'accounts') return p.can_manage_customers !== false
  if (view === 'returns' || view === 'promotions') return session.role === 'supervisor'
  return true
}

export default function CommerceApp({ buildVersion }: { buildVersion: string }) {
  const [session, setSession] = useState<TenantSession | null>(null)
  const [data, setData] = useState<CommerceSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [view, setView] = useState<ViewKey>('dashboard')
  const [managementOpen, setManagementOpen] = useState(true)
  const [dark, setDark] = useState(false)
  const [now, setNow] = useState(new Date())
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [payment, setPayment] = useState('Efectivo')
  const [saleSearch, setSaleSearch] = useState('')
  const [salePage, setSalePage] = useState(0)
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null)
  const [device, setDevice] = useState<DeviceSettings>({ paper:'80', autoPrint:false, printerMode:'browser', printerName:'', receiptCopies:1 })
  const [arca, setArca] = useState<ArcaHealth | null>(null)
  const [arcaChecking, setArcaChecking] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [contingency, setContingency] = useState<{ sale: Sale; stock: Array<{ id:string; stock:number }>; reason:string } | null>(null)

  async function refresh(s = session) {
    if (!s) return
    setError('')
    try { setData(await loadCommerceSnapshot(s)) }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }
  async function refreshArca(s = session) {
    if (!s || arcaChecking) return
    setArcaChecking(true)
    try { setArca(await checkArcaHealth(s)) } finally { setArcaChecking(false) }
  }

  useEffect(() => {
    const s = readTenantSession()
    setSession(s)
    if (!s) { setLoading(false); return }
    setDevice(readDeviceSettings(s.companyId))
    Promise.all([loadCommerceSnapshot(s), checkArcaHealth(s)])
      .then(([snapshot, health]) => { setData(snapshot); setArca(health) })
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
    const clock = window.setInterval(() => setNow(new Date()), 1000)
    const healthTimer = window.setInterval(() => { checkArcaHealth(s).then(setArca).catch(() => {}) }, 60000)
    const key = (e: KeyboardEvent) => { if (e.key === 'F2' && canView(s, 'pos')) { e.preventDefault(); setView('pos') } }
    window.addEventListener('keydown', key)
    return () => { window.clearInterval(clock); window.clearInterval(healthTimer); window.removeEventListener('keydown', key) }
  }, [])

  const today = dayKey(new Date())
  const todaySales = useMemo(() => data?.sales.filter(s => dayKey(s.date) === today) || [], [data, today])
  const todayTotal = useMemo(() => todaySales.reduce((a,s)=>a+s.total,0), [todaySales])
  const lowStock = useMemo(() => data?.products.filter(p => p.stock <= Number(p.min_stock ?? 5)).length || 0, [data])
  const total = useMemo(() => cart.reduce((a,i)=>a+i.price*i.qty,0), [cart])
  const filteredProducts = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    const rows = q ? data.products.filter(p => `${p.name} ${p.barcode || ''} ${p.category || ''}`.toLowerCase().includes(q)) : data.products
    return rows.slice(0,50)
  }, [data, query])
  const openedAt = data?.cashRegister?.opened_at ? new Date(data.cashRegister.opened_at).getTime() : 0
  const sessionSales = useMemo(() => data?.sales.filter(s => !openedAt || new Date(s.date).getTime() >= openedAt) || [], [data, openedAt])
  const sessionMovements = useMemo(() => data?.cashMovements.filter(m => !openedAt || new Date(m.occurred_at).getTime() >= openedAt) || [], [data, openedAt])
  const cashSales = sessionSales.filter(s => /efect/i.test(s.payment)).reduce((a,s)=>a+s.total,0)
  const expenses = sessionMovements.filter(m => m.kind === 'expense' || m.kind === 'egress').reduce((a,m)=>a+m.amount,0)
  const incomes = sessionMovements.filter(m => m.kind === 'income').reduce((a,m)=>a+m.amount,0)
  const cashEstimated = Number(data?.cashRegister?.opening_amount || 0) + cashSales + incomes - expenses

  if (loading) return <div className={styles.loading}>Cargando Comercio Lleno · Rediseño V2…</div>
  if (!session) return <div className={styles.loginBox}><div className={styles.loginCard}><div className={styles.loginLogo}>CL</div><h1>Comercio Lleno</h1><p>Ingresá con tu cuenta para abrir el Rediseño V2.</p><button className={styles.primary} onClick={() => location.href='/redesign/access'}>Ingresar</button></div></div>
  const tenant = session

  function go(next: ViewKey) { if (canView(tenant, next)) setView(next); else setNotice('Tu rol no tiene permiso para abrir esa sección.') }
  function addProduct(id: string) {
    const p = data?.products.find(x=>x.id===id); if(!p)return
    if(p.stock<=0){ setNotice('Ese producto está sin stock.'); return }
    setCart(rows=>{const f=rows.find(x=>x.id===id);return f?rows.map(x=>x.id===id?{...x,qty:Math.min(x.qty+1,p.stock)}:x):[...rows,{...p,qty:1}]});setQuery('')
  }
  function changeQty(id:string,delta:number){setCart(rows=>rows.map(x=>x.id===id?{...x,qty:Math.max(1,Math.min(x.stock,x.qty+delta))}:x))}
  function removeProduct(id:string){setCart(rows=>rows.filter(x=>x.id!==id))}

  async function checkout() {
    if(!data||!cart.length||checkoutBusy)return
    if(!canView(tenant,'pos')){setNotice('Tu usuario no tiene permiso para vender.');return}
    if(data.cashRegister?.status!=='open'){setNotice('Primero tenés que abrir la caja.');return}
    setCheckoutBusy(true);setError('')
    const id=createId(),items=cart.map(i=>({product_id:i.id,name:i.name,barcode:i.barcode||null,qty:i.qty,unit_price:i.price,line_total:i.price*i.qty}))
    const base:Sale={id,date:new Date().toISOString(),total,payment,items:items.reduce((a,i)=>a+i.qty,0),receipt_type:'factura_c',fiscal_status:'pending',details:{items,subtotal_before_discount:total,captured_at:new Date().toISOString()}}
    const stock=cart.map(i=>({id:i.id,stock:Math.max(0,i.stock-i.qty)}))
    try{
      const invoice=await authorizeFiscalInvoice(tenant,total,id)
      const authorized:Sale={...base,fiscal_status:'authorized',cae:invoice.cae,receiptNumber:invoice.receipt_number,caeExpiration:invoice.cae_expiration||null,fiscalEnvironment:arca?.environment||'homologacion'}
      await persistAuthorizedSale(tenant,authorized,stock);setCart([]);setNotice(`Venta registrada · Factura C ${receiptNumber(authorized)}`);setReceiptSale(authorized);setArca({...(arca||{connected:true}),connected:true,checkedAt:new Date().toISOString()});await refresh(tenant)
      if(device.autoPrint){try{await printReceipt(authorized,data.company,device)}catch{}}
    }catch(e){const err=e as Error&{arcaUnavailable?:boolean};if(err.arcaUnavailable){setArca({connected:false,checkedAt:new Date().toISOString(),error:err.message});setContingency({sale:base,stock,reason:err.message})}else setError(`No se pudo facturar: ${err.message}`)}finally{setCheckoutBusy(false)}
  }
  async function confirmContingency(){if(!contingency)return;setCheckoutBusy(true);try{await persistUninvoicedSale(tenant,contingency.sale,contingency.stock,contingency.reason);setCart([]);setNotice('Venta registrada sin factura. Quedó Pendiente ARCA.');setContingency(null);await refresh(tenant)}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setCheckoutBusy(false)}}
  async function openCash(){if(!data)return;const raw=window.prompt('Importe inicial de caja',String(data.cashRegister?.opening_amount||0));if(raw==null)return;const amount=Math.max(0,Number(raw.replace(',','.'))||0);try{await openCashRegister(tenant,data.cashRegister,amount);await refresh(tenant);setNotice('Caja abierta.')}catch(e){setError(e instanceof Error?e.message:String(e))}}
  async function closeCash(){if(!data?.cashRegister)return;if(!window.confirm('¿Confirmás el cierre de caja?'))return;try{await closeCashRegister(tenant,data.cashRegister);await refresh(tenant);setNotice('Caja cerrada.')}catch(e){setError(e instanceof Error?e.message:String(e))}}
  function logout(){['cl_access_token','cl_refresh_token','cl_company_id','cl_company_name','cl_user_role','cl_user_permissions'].forEach(k=>localStorage.removeItem(k));location.replace('/redesign/access')}

  const arcaLabel=arcaChecking?'ARCA verificando…':arca?.connected?'ARCA conectado':'ARCA desconectado'
  const arcaClass=arcaChecking?styles.statusNeutral:arca?.connected?styles.statusOk:styles.statusBad
  const mainNav:Array<[ViewKey,string,string,string?]>=[['dashboard','⌂','Inicio'],['pos','▣','Caja'],['products','▦','Productos'],['cash','◷','Caja diaria'],['settings','⚙','Configuración'],['assistant','✦','Asistente','assistant'],['help','?','Ayuda','help']]
  const management:Array<[ViewKey,string,string]>=[['sales','▤','Ventas'],['reports','◔','Reportes'],['customers','♙','Clientes'],['profitability','↗','Rentabilidad'],['accounts','¤','Cuentas corrientes'],['returns','↩','Devoluciones'],['promotions','%','Promociones']]

  return <main className={`${styles.shell} ${dark?styles.dark:''} ${dark?parity.dark:''}`}>
    <header className={styles.topbar}><div className={styles.brandWrap}><div className={styles.brandMark}>CL</div><div><div className={styles.brand}>Comercio <span>Lleno</span></div><div className={styles.tenant}>{data?.company.name||tenant.companyName} · {tenant.role==='owner'?'Propietario':tenant.role==='supervisor'?'Supervisor':'Encargado / Cajero'}</div></div></div><div className={styles.headerRight}><button className={`${styles.status} ${arcaClass}`} onClick={()=>refreshArca(tenant)}>● {arcaLabel}</button><span className={styles.versionPill}>Rediseño V2 · {buildVersion}</span><button className={styles.headerButton} onClick={()=>refresh(tenant)}>↻ Actualizar</button><button className={styles.headerButton} onClick={()=>setDark(x=>!x)}>{dark?'☀ Claro':'☾ Oscuro'}</button><button className={parity.logout} onClick={logout}>Salir</button></div></header>
    <div className={styles.layout}><aside className={styles.sidebar}>
      <div className={styles.navLabel}>OPERACIÓN</div>
      {mainNav.map(([key,icon,label,special])=>canView(tenant,key)&&<button key={key} className={`${styles.navButton} ${view===key?styles.navActive:''} ${special==='assistant'?parity.supportAssistant:''} ${special==='help'?parity.supportHelp:''}`} onClick={()=>go(key)}><span>{icon}</span>{label}</button>)}
      <button className={parity.navGroupButton} onClick={()=>setManagementOpen(x=>!x)}><span>▦</span>Gestión<span>{managementOpen?'⌃':'⌄'}</span></button>
      {managementOpen&&<div className={parity.navChildren}>{management.filter(([key])=>canView(tenant,key)).map(([key,icon,label])=><button key={key} className={`${parity.navChild} ${view===key?parity.navChildActive:''}`} onClick={()=>go(key)}><span>{icon}</span>{label}</button>)}</div>}
      {canView(tenant,'purchases')&&<button className={`${styles.navButton} ${view==='purchases'?styles.navActive:''}`} onClick={()=>go('purchases')}><span>▦</span>Compras</button>}
      {canView(tenant,'suppliers')&&<button className={`${styles.navButton} ${view==='suppliers'?styles.navActive:''}`} onClick={()=>go('suppliers')}><span>♜</span>Proveedores</button>}
      <div className={styles.sidebarBottom}><b>Comercio Lleno</b><span>Rediseño V2 · {buildVersion}</span><small>Tenant {tenant.companyId.slice(0,8)} · <span className={parity.roleBadge}>{tenant.role}</span></small></div>
    </aside><section className={styles.content}>
      {error&&<div className={styles.error}><span>{error}</span><button onClick={()=>setError('')}>×</button></div>}{notice&&<div className={styles.notice}><span>{notice}</span><button onClick={()=>setNotice('')}>×</button></div>}
      {data&&view==='dashboard'&&<Dashboard data={data} todayTotal={todayTotal} todayCount={todaySales.length} lowStock={lowStock} go={go} session={tenant}/>} 
      {data&&view==='pos'&&<Pos data={data} query={query} setQuery={setQuery} filtered={filteredProducts} cart={cart} addProduct={addProduct} changeQty={changeQty} removeProduct={removeProduct} total={total} payment={payment} setPayment={setPayment} checkout={checkout} busy={checkoutBusy} arca={arca}/>} 
      {data&&view==='products'&&<ProductsV2 data={data} session={tenant} refresh={()=>refresh(tenant)} message={setNotice}/>} 
      {data&&view==='cash'&&<Cash data={data} sessionSales={sessionSales} movements={sessionMovements} cashEstimated={cashEstimated} openCash={openCash} closeCash={closeCash}/>} 
      {data&&view==='settings'&&<SettingsV2 data={data} session={tenant} device={device} setDevice={setDevice} arca={arca} buildVersion={buildVersion} refresh={()=>refresh(tenant)} message={setNotice}/>} 
      {data&&view==='sales'&&<Sales data={data} search={saleSearch} setSearch={x=>{setSaleSearch(x);setSalePage(0)}} page={salePage} setPage={setSalePage} openReceipt={setReceiptSale} device={device} onMessage={setNotice}/>} 
      {data&&view==='reports'&&<Reports data={data}/>} 
      {data&&view==='customers'&&<Customers data={data} session={tenant} refresh={()=>refresh(tenant)} message={setNotice}/>} 
      {data&&view==='profitability'&&<ProfitabilityV2 data={data}/>} 
      {data&&view==='accounts'&&<AccountsV2 data={data} session={tenant}/>} 
      {data&&view==='returns'&&<ReturnsV2 data={data} session={tenant} refresh={()=>refresh(tenant)} message={setNotice}/>} 
      {data&&view==='promotions'&&<PromotionsV2 data={data} session={tenant}/>} 
      {data&&view==='purchases'&&<PurchasesV2 data={data} session={tenant} refresh={()=>refresh(tenant)}/>} 
      {view==='suppliers'&&<SuppliersV2 session={tenant}/>} 
      {data&&view==='assistant'&&<AssistantView data={data}/>} 
      {view==='help'&&<HelpView/>}
    </section></div>
    <div className={styles.bottomBar}><div className={styles.bottomStats}><div><span>Ventas hoy</span><b>{money.format(todayTotal)}</b></div><div><span>Caja estimada</span><b>{money.format(cashEstimated)}</b></div><div><span>Stock bajo</span><b>{lowStock}</b></div></div><div className={styles.time}>{now.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</div></div>
    {receiptSale&&data&&<ReceiptModal sale={receiptSale} data={data} device={device} close={()=>setReceiptSale(null)} onMessage={setNotice}/>} 
    {contingency&&<ContingencyModal reason={contingency.reason} total={contingency.sale.total} busy={checkoutBusy} yes={confirmContingency} no={()=>setContingency(null)}/>} 
  </main>
}

function Head({eyebrow,title,subtitle,children}:{eyebrow:string;title:string;subtitle:string;children?:ReactNode}){return <div className={styles.pageHead}><div><div className={styles.eyebrow}>{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{children}</div>}

function Dashboard({data,todayTotal,todayCount,lowStock,go,session}:{data:CommerceSnapshot;todayTotal:number;todayCount:number;lowStock:number;go:(v:ViewKey)=>void;session:TenantSession}){const recent=data.sales.slice(0,6);return <><Head eyebrow={data.company.name} title="Inicio" subtitle="Resumen del comercio y accesos de operación.">{canView(session,'pos')&&<button className={styles.primary} onClick={()=>go('pos')}>+ Nueva venta</button>}</Head>{session.role==='supervisor'&&<div className={styles.notice}><span>Panel de supervisión · indicadores visibles según tus permisos.</span></div>}<div className={styles.kpis}><div className={`${styles.kpi} ${styles.kpiAccent}`}><span>Ventas de hoy</span><strong>{money.format(todayTotal)}</strong><small>{todayCount} operaciones</small></div><div className={styles.kpi}><span>Ticket promedio</span><strong>{money.format(todayCount?todayTotal/todayCount:0)}</strong><small>Promedio del día</small></div><div className={styles.kpi}><span>Stock bajo</span><strong>{lowStock}</strong><small>Productos para revisar</small></div><div className={styles.kpi}><span>Caja</span><strong>{data.cashRegister?.status==='open'?'Abierta':'Cerrada'}</strong><small>{data.cashRegister?.opened_at?`Desde ${new Date(data.cashRegister.opened_at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}`:'Sin apertura activa'}</small></div></div><div className={styles.gridTwo}><div className={styles.panel}><div className={styles.panelTitle}><div><b>Últimas ventas</b><small>Actividad más reciente</small></div><button className={styles.linkButton} onClick={()=>go('sales')}>Ver todas →</button></div>{recent.length?recent.map(s=><div className={styles.recentRow} key={s.id}><span className={styles.roundIcon}>{s.cae?'✓':'!'}</span><div><b>{s.receiptNumber?`Factura C ${receiptNumber(s)}`:`Venta #${s.id.slice(0,8)}`}</b><small>{new Date(s.date).toLocaleString('es-AR')} · {s.payment}</small></div><strong>{money.format(s.total)}</strong></div>):<div className={styles.empty}>Todavía no hay ventas.</div>}</div><div className={styles.panel}><div className={styles.panelTitle}><div><b>Accesos rápidos</b><small>Funciones frecuentes</small></div></div><div className={styles.shortcutGrid}>{canView(session,'pos')&&<button className={styles.shortcut} onClick={()=>go('pos')}><span>▣</span><div><b>Ir a Caja</b><small>Scanner, carrito y cobro</small></div></button>}{canView(session,'products')&&<button className={styles.shortcut} onClick={()=>go('products')}><span>▦</span><div><b>Productos</b><small>Editar precios, stock y costos</small></div></button>}<button className={styles.shortcut} onClick={()=>go('cash')}><span>◷</span><div><b>Caja diaria</b><small>Cierre y contador de billetes</small></div></button></div></div></div></>}

function Pos({data,query,setQuery,filtered,cart,addProduct,changeQty,removeProduct,total,payment,setPayment,checkout,busy,arca}:{data:CommerceSnapshot;query:string;setQuery:(v:string)=>void;filtered:CommerceSnapshot['products'];cart:CartLine[];addProduct:(id:string)=>void;changeQty:(id:string,d:number)=>void;removeProduct:(id:string)=>void;total:number;payment:string;setPayment:(v:string)=>void;checkout:()=>void;busy:boolean;arca:ArcaHealth|null}){function scan(){const exact=data.products.find(p=>String(p.barcode||'')===query.trim());if(exact)addProduct(exact.id);else if(filtered[0])addProduct(filtered[0].id)}return <><Head eyebrow="PUNTO DE VENTA · F2" title="Caja" subtitle="Scanner USB, cobro, ARCA y ticket térmico."><div className={styles.headBadges}><span className={`${styles.badge} ${data.cashRegister?.status==='open'?styles.badgeGreen:styles.badgeRed}`}>{data.cashRegister?.status==='open'?'● Caja abierta':'● Caja cerrada'}</span><span className={`${styles.badge} ${arca?.connected?styles.badgeGreen:styles.badgeRed}`}>{arca?.connected?'● ARCA online':'● ARCA offline'}</span></div></Head><div className={styles.posGrid}><div className={styles.posProducts}><div className={styles.searchCard}><div className={styles.searchBox}><span className={styles.searchIcon}>⌕</span><input className={styles.inputBare} autoFocus value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&scan()} placeholder="Escaneá un código o buscá un producto…"/><button className={styles.primary} onClick={scan}>Agregar</button></div><div className={styles.scanHint}>Scanner USB listo · Enter agrega automáticamente</div></div><div className={styles.productList}>{filtered.map(p=><button key={p.id} className={styles.productRow} onClick={()=>addProduct(p.id)}><div className={styles.productIcon}>▦</div><div className={styles.productInfo}><b>{p.name}</b><small>{p.barcode||'Sin código'} · {p.category||'General'}</small></div><span className={`${styles.stockMini} ${p.stock<=Number(p.min_stock??5)?styles.stockLow:''}`}>Stock {p.stock}</span><strong>{money.format(p.price)}</strong></button>)}</div></div><aside className={styles.saleCard}><div className={styles.saleCardHead}><div><span>VENTA ACTUAL</span><h2>{cart.length?`${cart.reduce((a,i)=>a+i.qty,0)} artículos`:'Sin productos'}</h2></div><button className={styles.ghostDanger} onClick={()=>cart.forEach(i=>removeProduct(i.id))}>Vaciar</button></div><div className={styles.cart}>{cart.length?cart.map(i=><div className={styles.cartLine} key={i.id}><div className={styles.cartName}><b>{i.name}</b><small>{money.format(i.price)} c/u</small><div className={styles.qty}><button onClick={()=>changeQty(i.id,-1)}>−</button><b>{i.qty}</b><button onClick={()=>changeQty(i.id,1)}>+</button><button className={styles.removeItem} onClick={()=>removeProduct(i.id)}>×</button></div></div><strong>{money.format(i.price*i.qty)}</strong></div>):<div className={styles.emptyCart}><div>▣</div><b>Esperando productos</b><span>Escaneá un código para empezar.</span></div>}</div><div className={styles.checkout}><div className={styles.totalLine}><span>Total</span><strong>{money.format(total)}</strong></div><label className={styles.checkoutLabel}>MEDIO DE PAGO</label><div className={styles.payments}>{payments.map(p=><button key={p} className={`${styles.payment} ${payment===p?styles.paymentSelected:''}`} onClick={()=>setPayment(p)}>{p}</button>)}</div>{!arca?.connected&&<div className={styles.arcaWarning}>ARCA figura desconectado. Si al cobrar no responde, podés registrar la venta como Pendiente ARCA.</div>}<button className={styles.charge} disabled={!cart.length||data.cashRegister?.status!=='open'||busy} onClick={checkout}>{busy?'Procesando…':data.cashRegister?.status==='open'?`Cobrar ${money.format(total)}`:'Abrí la caja para cobrar'}</button></div></aside></div></>}

function Sales({data,search,setSearch,page,setPage,openReceipt,device,onMessage}:{data:CommerceSnapshot;search:string;setSearch:(v:string)=>void;page:number;setPage:(v:number)=>void;openReceipt:(s:Sale)=>void;device:DeviceSettings;onMessage:(m:string)=>void}){const q=search.trim().toLowerCase(),filtered=data.sales.filter(s=>`${s.id} ${s.receiptNumber||''} ${s.payment} ${s.cae||''} ${s.fiscal_status||''}`.toLowerCase().includes(q)),size=20,pages=Math.max(1,Math.ceil(filtered.length/size)),current=Math.min(page,pages-1),rows=filtered.slice(current*size,current*size+size);async function sendMail(s:Sale){const customer=data.customers.find(c=>c.id===s.customer_id);let email=customer?.email||'';if(!email)email=window.prompt('Email del cliente','')||'';const result=await emailReceipt(s,data.company,email);if(result==='mailto')onMessage('Abrimos tu correo y descargamos el PDF para adjuntar.')}async function print(s:Sale){try{await printReceipt(s,data.company,device)}catch(e){onMessage(e instanceof Error?e.message:String(e))}}return <><Head eyebrow="GESTIÓN" title="Ventas" subtitle="Historial paginado con comprobantes y estado fiscal."/><div className={styles.tableTools}><div className={styles.searchSlim}><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar factura, operación, CAE o medio de pago…"/></div></div><div className={styles.table}><div className={`${styles.tableRow} ${styles.tableHead}`}><span>Fecha</span><span>Comprobante</span><span>Pago</span><span>Total</span><span>Estado</span><span>Acciones</span></div>{rows.map(s=><div className={styles.tableRow} key={s.id}><span><b>{new Date(s.date).toLocaleDateString('es-AR')}</b><small>{new Date(s.date).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</small></span><span>{s.receiptNumber?<><b>Factura C</b><small>{receiptNumber(s)}</small></>:<><b>Venta #{s.id.slice(0,8)}</b><small>Sin comprobante fiscal</small></>}</span><span>{s.payment}</span><span><b>{money.format(s.total)}</b></span><span>{s.cae?<span className={`${styles.badge} ${styles.badgeGreen}`}>Autorizada</span>:<span className={`${styles.badge} ${styles.badgeAmber}`}>Pendiente ARCA</span>}</span><span>{s.cae?<div className={styles.rowActions}><button onClick={()=>downloadReceiptPdf(s,data.company)}>PDF</button><button onClick={()=>print(s)}>Imprimir</button><button onClick={()=>sendMail(s)}>Enviar mail</button><button onClick={()=>openReceipt(s)}>Ver</button></div>:<span className={styles.pendingText}>Venta registrada sin factura</span>}</span></div>)}</div><div className={styles.pager}><button disabled={current===0} onClick={()=>setPage(current-1)}>← Anterior</button><span>Página {current+1} de {pages} · {filtered.length} ventas</span><button disabled={current>=pages-1} onClick={()=>setPage(current+1)}>Siguiente →</button></div></>}

function Reports({data}:{data:CommerceSnapshot}){const now=Date.now(),periods=[['Hoy',new Date().setHours(0,0,0,0)],['7 días',daysAgo(6)],['30 días',daysAgo(29)]] as const;return <><Head eyebrow="GESTIÓN" title="Reportes" subtitle="Ventas por período y medio de pago."/><div className={styles.reportGrid}>{periods.map(([label,start])=>{const rows=data.sales.filter(s=>new Date(s.date).getTime()>=start&&new Date(s.date).getTime()<=now),total=rows.reduce((a,s)=>a+s.total,0);return <div className={styles.reportCard} key={label}><span>{label}</span><strong>{money.format(total)}</strong><small>{rows.length} operaciones · Ticket prom. {money.format(rows.length?total/rows.length:0)}</small></div>})}</div><div className={styles.panel}><div className={styles.panelTitle}><div><b>Medios de pago · últimos 30 días</b><small>Distribución de ventas</small></div></div>{payments.map(p=>{const rows=data.sales.filter(s=>new Date(s.date).getTime()>=daysAgo(29)&&s.payment===p),total=rows.reduce((a,s)=>a+s.total,0);return <div className={styles.recentRow} key={p}><span className={styles.roundIcon}>%</span><div><b>{p}</b><small>{rows.length} operaciones</small></div><strong>{money.format(total)}</strong></div>})}</div></>}

function Customers({data,session,refresh,message}:{data:CommerceSnapshot;session:TenantSession;refresh:()=>Promise<void>;message:(m:string)=>void}){const [q,setQ]=useState(''),[show,setShow]=useState(false),[name,setName]=useState(''),[phone,setPhone]=useState(''),[email,setEmail]=useState(''),[tax,setTax]=useState(''),[busy,setBusy]=useState(false);const rows=data.customers.filter(c=>`${c.name} ${c.phone||''} ${c.email||''} ${c.tax_id||''}`.toLowerCase().includes(q.toLowerCase()));async function submit(e:FormEvent){e.preventDefault();if(!name.trim())return;setBusy(true);try{await createCustomer(session,{name:name.trim(),phone,email,tax_id:tax});setName('');setPhone('');setEmail('');setTax('');setShow(false);await refresh();message('Cliente agregado.')}catch(e){message(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}return <><Head eyebrow="GESTIÓN" title="Clientes" subtitle={`${data.customers.length} contactos asociados al comercio.`}><button className={styles.primary} onClick={()=>setShow(x=>!x)}>+ Agregar cliente</button></Head>{show&&<form className={parity.customerForm} onSubmit={submit}><input placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)}/><input placeholder="Teléfono" value={phone} onChange={e=>setPhone(e.target.value)}/><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="CUIT / DNI" value={tax} onChange={e=>setTax(e.target.value)}/><button disabled={busy}>{busy?'Guardando…':'Guardar'}</button></form>}<div className={styles.tableTools}><div className={styles.searchSlim}><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar nombre, teléfono, email o CUIT…"/></div></div><div className={`${styles.table} ${styles.customerTable}`}><div className={`${styles.tableRow} ${styles.tableHead}`}><span>Nombre</span><span>Teléfono</span><span>Email</span><span>CUIT/DNI</span></div>{rows.map(c=><div className={styles.tableRow} key={c.id}><span><b>{c.name}</b></span><span>{c.phone||'—'}</span><span>{c.email||'—'}</span><span>{c.tax_id||'—'}</span></div>)}</div></>}

function Cash({data,sessionSales,movements,cashEstimated,openCash,closeCash}:{data:CommerceSnapshot;sessionSales:Sale[];movements:CommerceSnapshot['cashMovements'];cashEstimated:number;openCash:()=>void;closeCash:()=>void}){const [counts,setCounts]=useState<Record<number,number>>({});const counted=denoms.reduce((sum,d)=>sum+d*(counts[d]||0),0),salesTotal=sessionSales.reduce((a,s)=>a+s.total,0),exp=movements.filter(m=>m.kind==='expense'||m.kind==='egress').reduce((a,m)=>a+m.amount,0),diff=counted-cashEstimated;return <><Head eyebrow="CONTROL DE CAJA" title="Caja diaria" subtitle="Apertura, ventas, movimientos, cierre y contador de billetes."><button className={data.cashRegister?.status==='open'?styles.danger:styles.primary} onClick={data.cashRegister?.status==='open'?closeCash:openCash}>{data.cashRegister?.status==='open'?'Cerrar caja':'Abrir caja'}</button></Head><div className={styles.cashHero}><div className={styles.cashStat}><span>Estado</span><strong>{data.cashRegister?.status==='open'?'Abierta':'Cerrada'}</strong></div><div className={styles.cashStat}><span>Apertura</span><strong>{money.format(Number(data.cashRegister?.opening_amount||0))}</strong></div><div className={styles.cashStat}><span>Ventas sesión</span><strong>{money.format(salesTotal)}</strong></div><div className={styles.cashStat}><span>Efectivo estimado</span><strong>{money.format(cashEstimated)}</strong></div></div><div className={styles.cashLayout}><div className={styles.panel}><div className={styles.panelTitle}><div><b>Actividad desde la apertura</b><small>{sessionSales.length} ventas · egresos {money.format(exp)}</small></div></div>{sessionSales.slice(0,18).map(s=><div className={styles.recentRow} key={s.id}><span className={styles.roundIcon}>{s.cae?'✓':'!'}</span><div><b>{s.receiptNumber?`Factura ${receiptNumber(s)}`:`Venta #${s.id.slice(0,8)}`}</b><small>{new Date(s.date).toLocaleString('es-AR')} · {s.payment}</small></div><strong>{money.format(s.total)}</strong></div>)}</div><div className={styles.counterCard}><div className={styles.counterHead}><div><span>CONTADOR DE BILLETES</span><h3>Arqueo rápido</h3></div><div className={styles.counterTotal}><small>Total contado</small><strong>{money.format(counted)}</strong></div></div><div className={styles.denomList}>{denoms.map(d=><div className={styles.denomRow} key={d}><label>{money.format(d)}</label><span>×</span><input type="number" min="0" inputMode="numeric" value={counts[d]||''} onChange={e=>setCounts({...counts,[d]:Math.max(0,Number(e.target.value)||0)})}/><b>{money.format(d*(counts[d]||0))}</b></div>)}</div><div className={styles.counterSummary}><div><span>Sistema</span><b>{money.format(cashEstimated)}</b></div><div><span>Contado</span><b>{money.format(counted)}</b></div><div className={Math.abs(diff)<1?styles.diffOk:styles.diffBad}><span>Diferencia</span><b>{money.format(diff)}</b></div></div><button className={styles.counterReset} onClick={()=>setCounts({})}>Limpiar conteo</button></div></div></>}

function AssistantView({data}:{data:CommerceSnapshot}){const [messages,setMessages]=useState<Array<{who:'bot'|'user';text:string}>>([{who:'bot',text:'Hola. Soy el asistente actual de Comercio Lleno. Puedo consultar ventas, stock y orientarte dentro del sistema.'}]),[q,setQ]=useState('');function answer(text:string){const x=text.toLowerCase();if(x.includes('más vendido')||x.includes('mas vendido')){const count=new Map<string,{name:string;qty:number}>();data.sales.forEach(s=>(s.details?.items||[]).forEach(i=>{const old=count.get(i.product_id)||{name:i.name,qty:0};old.qty+=i.qty;count.set(i.product_id,old)}));const top=[...count.values()].sort((a,b)=>b.qty-a.qty)[0];return top?`El producto más vendido es ${top.name}, con ${top.qty} unidades registradas.`:'Todavía no hay detalle suficiente para calcularlo.'}if(x.includes('hoy')&&x.includes('venta')){const rows=data.sales.filter(s=>dayKey(s.date)===dayKey(new Date()));return `Hoy hay ${rows.length} ventas por ${money.format(rows.reduce((a,s)=>a+s.total,0))}.`}if(x.includes('stock bajo')){const rows=data.products.filter(p=>p.stock<=Number(p.min_stock??5));return rows.length?`Hay ${rows.length} productos con stock bajo. Los primeros son: ${rows.slice(0,5).map(p=>`${p.name} (${p.stock})`).join(', ')}.`:'No hay productos con stock bajo.'}if(x.includes('editar')&&x.includes('producto'))return 'Entrá en Productos, buscá el artículo y tocá “Editar”. Ahí podés cambiar nombre, código, costo, precio, mayorista, stock, mínimos y proveedor.';if(x.includes('caja diaria'))return 'Entrá en Caja diaria. Ahí podés abrir/cerrar caja y usar el contador de billetes para el arqueo.';return 'En esta etapa puedo responder consultas básicas sobre ventas, stock y uso del sistema. La versión con IA unificada va a reemplazar este asistente.'}function ask(text:string){if(!text.trim())return;setMessages(m=>[...m,{who:'user',text},{who:'bot',text:answer(text)}]);setQ('')}return <><Head eyebrow="SOPORTE" title="Asistente" subtitle="Consultas rápidas del negocio y del uso del sistema."/><div className={parity.assistantGrid}><div className={parity.chatCard}><div className={parity.chatHead}><b>Asistente Comercio</b><span>Consulta contextual del comercio actual</span></div><div className={parity.messages}>{messages.map((m,i)=><div key={i} className={m.who==='bot'?parity.bot:parity.user}>{m.text}</div>)}</div><div className={parity.quick}><button onClick={()=>ask('¿Cómo vienen las ventas hoy?')}>Ventas de hoy</button><button onClick={()=>ask('¿Cuál es el producto más vendido?')}>Más vendido</button><button onClick={()=>ask('¿Qué productos tienen stock bajo?')}>Stock bajo</button><button onClick={()=>ask('¿Cómo editar un producto?')}>Editar producto</button></div><form className={parity.chatForm} onSubmit={e=>{e.preventDefault();ask(q)}}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Preguntá sobre el negocio o el sistema…"/><button>Enviar</button></form></div><HelpMini/></div></>}
function HelpMini(){return <div className={parity.helpCard}><h3>Ayuda rápida</h3><p>Guías cortas para las operaciones principales.</p><Faq q="¿Cómo cargar un producto?" a="Productos → Agregar producto. Completá los datos y guardá."/><Faq q="¿Cómo pasar una venta?" a="Caja → escaneá o buscá productos → elegí medio de pago → Cobrar."/><Faq q="¿Dónde están usuarios y roles?" a="Configuración → Usuarios y roles. Esta sección es exclusiva del Propietario."/><a className={parity.humanButton} href="https://wa.me/5491159609135?text=Hola%2C%20necesito%20ayuda%20con%20Comercio%20Lleno" target="_blank" rel="noreferrer">Ayuda humana</a><div className={parity.humanNote}>Abre WhatsApp para contactar soporte.</div></div>}
function HelpView(){return <><Head eyebrow="SOPORTE" title="Ayuda" subtitle="Guía rápida para operar Comercio Lleno."/><div className={parity.assistantGrid}><div className={parity.helpCard}><h3>Preguntas frecuentes</h3><p>Funciones principales del sistema.</p><Faq q="¿Cómo agregar o editar un producto?" a="Entrá en Productos. Podés crear uno nuevo o tocar Editar en cualquier fila. Ahí están costos, precios, mayorista, stock, mínimos, objetivo y proveedor."/><Faq q="¿Cómo imprimir etiquetas?" a="En Productos seleccioná los artículos, indicá cuántas etiquetas querés y tocá Imprimir etiquetas."/><Faq q="¿Cómo revisar ventas anteriores?" a="Gestión → Ventas. Desde cada factura podés descargar PDF, imprimir, enviar por mail o ver el comprobante."/><Faq q="¿Cómo usar Caja diaria?" a="Abrí Caja diaria para apertura/cierre, movimientos y contador de billetes."/><Faq q="¿Dónde cambio usuarios y permisos?" a="Configuración → Usuarios y roles. Solo el Propietario puede administrar esta sección."/><Faq q="¿Dónde restablezco ventas a cero?" a="Configuración → Mantenimiento. Solo el Propietario puede hacerlo y debe confirmar con su contraseña."/></div><HelpMini/></div></>}
function Faq({q,a}:{q:string;a:string}){return <div className={parity.faq}><b>{q}</b><span>{a}</span></div>}

function ReceiptModal({sale,data,device,close,onMessage}:{sale:Sale;data:CommerceSnapshot;device:DeviceSettings;close:()=>void;onMessage:(m:string)=>void}){async function print(){try{await printReceipt(sale,data.company,device)}catch(e){onMessage(e instanceof Error?e.message:String(e))}}async function mail(){const customer=data.customers.find(c=>c.id===sale.customer_id);let email=customer?.email||'';if(!email)email=window.prompt('Email del cliente','')||'';const result=await emailReceipt(sale,data.company,email);if(result==='mailto')onMessage('Abrimos tu correo y descargamos el PDF para adjuntar.')}return <div className={styles.modal} onMouseDown={e=>e.target===e.currentTarget&&close()}><div className={styles.modalCard}><div className={styles.modalHead}><div><span>COMPROBANTE FISCAL</span><h3>Factura C {receiptNumber(sale)}</h3><p>Guardada dentro de la venta</p></div><button onClick={close}>×</button></div><div className={styles.receiptHero}><div><span>Total</span><strong>{money.format(sale.total)}</strong></div><div><span>CAE</span><b>{sale.cae||'—'}</b></div><div><span>Vencimiento</span><b>{sale.caeExpiration||'—'}</b></div></div><div className={styles.modalActions}><button className={styles.primary} onClick={()=>downloadReceiptPdf(sale,data.company)}>↓ Descargar PDF</button><button className={styles.secondary} onClick={print}>▣ Imprimir</button><button className={styles.secondary} onClick={mail}>✉ Enviar por mail</button></div></div></div>}
function ContingencyModal({reason,total,busy,yes,no}:{reason:string;total:number;busy:boolean;yes:()=>void;no:()=>void}){return <div className={styles.modal}><div className={`${styles.modalCard} ${styles.contingencyCard}`}><div className={styles.alertIcon}>!</div><h3>ARCA perdió conexión</h3><p>No pudimos emitir la Factura C en este momento.</p><div className={styles.reasonBox}>{reason}</div><div className={styles.contingencyTotal}><span>Venta</span><strong>{money.format(total)}</strong></div><p>¿Querés registrar igualmente la venta? Quedará como <b>Pendiente ARCA</b>, sin CAE ni número de factura.</p><div className={styles.modalActions}><button className={styles.secondary} disabled={busy} onClick={no}>No, volver</button><button className={styles.primary} disabled={busy} onClick={yes}>{busy?'Guardando…':'Sí, registrar venta'}</button></div></div></div>}
