'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './page.module.css'
import parity from './parity.module.css'
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
import { printReceipt, receiptNumber } from '@/lib/comercio/receipt'
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
import { Cash, ContingencyModal, Customers, Dashboard, dayKey, money, Pos, ReceiptModal, Reports, Sales } from './CoreViews'
import UnifiedAssistant from './UnifiedAssistant'

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
    try { setArca(await checkArcaHealth(s)) }
    finally { setArcaChecking(false) }
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

  function go(next: ViewKey) {
    if (canView(tenant, next)) setView(next)
    else setNotice('Tu rol no tiene permiso para abrir esa sección.')
  }

  function addProduct(id: string) {
    const p = data?.products.find(x=>x.id===id)
    if(!p)return
    if(p.stock<=0){ setNotice('Ese producto está sin stock.'); return }
    setCart(rows=>{const f=rows.find(x=>x.id===id);return f?rows.map(x=>x.id===id?{...x,qty:Math.min(x.qty+1,p.stock)}:x):[...rows,{...p,qty:1}]})
    setQuery('')
  }
  function changeQty(id:string,delta:number){setCart(rows=>rows.map(x=>x.id===id?{...x,qty:Math.max(1,Math.min(x.stock,x.qty+delta))}:x))}
  function removeProduct(id:string){setCart(rows=>rows.filter(x=>x.id!==id))}

  async function checkout() {
    if(!data||!cart.length||checkoutBusy)return
    if(!canView(tenant,'pos')){setNotice('Tu usuario no tiene permiso para vender.');return}
    if(data.cashRegister?.status!=='open'){setNotice('Primero tenés que abrir la caja.');return}
    setCheckoutBusy(true);setError('')
    const id=createId()
    const items=cart.map(i=>({product_id:i.id,name:i.name,barcode:i.barcode||null,qty:i.qty,unit_price:i.price,line_total:i.price*i.qty}))
    const base:Sale={id,date:new Date().toISOString(),total,payment,items:items.reduce((a,i)=>a+i.qty,0),receipt_type:'factura_c',fiscal_status:'pending',details:{items,subtotal_before_discount:total,captured_at:new Date().toISOString()}}
    const stock=cart.map(i=>({id:i.id,stock:Math.max(0,i.stock-i.qty)}))
    try{
      const invoice=await authorizeFiscalInvoice(tenant,total,id)
      const authorized:Sale={...base,fiscal_status:'authorized',cae:invoice.cae,receiptNumber:invoice.receipt_number,caeExpiration:invoice.cae_expiration||null,fiscalEnvironment:arca?.environment||'homologacion'}
      await persistAuthorizedSale(tenant,authorized,stock)
      setCart([])
      setNotice(`Venta registrada · Factura C ${receiptNumber(authorized)}`)
      setReceiptSale(authorized)
      setArca({...(arca||{connected:true}),connected:true,checkedAt:new Date().toISOString()})
      await refresh(tenant)
      if(device.autoPrint){try{await printReceipt(authorized,data.company,device)}catch{}}
    }catch(e){
      const err=e as Error&{arcaUnavailable?:boolean}
      if(err.arcaUnavailable){setArca({connected:false,checkedAt:new Date().toISOString(),error:err.message});setContingency({sale:base,stock,reason:err.message})}
      else setError(`No se pudo facturar: ${err.message}`)
    }finally{setCheckoutBusy(false)}
  }

  async function confirmContingency(){
    if(!contingency)return
    setCheckoutBusy(true)
    try{await persistUninvoicedSale(tenant,contingency.sale,contingency.stock,contingency.reason);setCart([]);setNotice('Venta registrada sin factura. Quedó Pendiente ARCA.');setContingency(null);await refresh(tenant)}
    catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setCheckoutBusy(false)}
  }

  async function openCash(){
    if(!data)return
    const raw=window.prompt('Importe inicial de caja',String(data.cashRegister?.opening_amount||0))
    if(raw==null)return
    const amount=Math.max(0,Number(raw.replace(',','.'))||0)
    try{await openCashRegister(tenant,data.cashRegister,amount);await refresh(tenant);setNotice('Caja abierta.')}
    catch(e){setError(e instanceof Error?e.message:String(e))}
  }

  async function closeCash(){
    if(!data?.cashRegister)return
    if(!window.confirm('¿Confirmás el cierre de caja?'))return
    try{await closeCashRegister(tenant,data.cashRegister);await refresh(tenant);setNotice('Caja cerrada.')}
    catch(e){setError(e instanceof Error?e.message:String(e))}
  }

  function logout(){['cl_access_token','cl_refresh_token','cl_company_id','cl_company_name','cl_user_role','cl_user_permissions'].forEach(k=>localStorage.removeItem(k));location.replace('/redesign/access')}

  const arcaLabel=arcaChecking?'ARCA verificando…':arca?.connected?'ARCA conectado':'ARCA desconectado'
  const arcaClass=arcaChecking?styles.statusNeutral:arca?.connected?styles.statusOk:styles.statusBad
  const mainNav:Array<[ViewKey,string,string,string?]>=[['dashboard','⌂','Inicio'],['pos','▣','Caja'],['products','▦','Productos'],['cash','◷','Caja diaria'],['settings','⚙','Configuración'],['assistant','✦','Asistente IA','assistant']]
  const management:Array<[ViewKey,string,string]>=[['sales','▤','Ventas'],['reports','◔','Reportes'],['customers','♙','Clientes'],['profitability','↗','Rentabilidad'],['accounts','¤','Cuentas corrientes'],['returns','↩','Devoluciones'],['promotions','%','Promociones']]

  return <main className={`${styles.shell} ${dark?styles.dark:''} ${dark?parity.dark:''}`}>
    <header className={styles.topbar}>
      <div className={styles.brandWrap}><div className={styles.brandMark}>CL</div><div><div className={styles.brand}>Comercio <span>Lleno</span></div><div className={styles.tenant}>{data?.company.name||tenant.companyName} · {tenant.role==='owner'?'Propietario':tenant.role==='supervisor'?'Supervisor':'Encargado / Cajero'}</div></div></div>
      <div className={styles.headerRight}><button className={`${styles.status} ${arcaClass}`} onClick={()=>refreshArca(tenant)}>● {arcaLabel}</button><span className={styles.versionPill}>Rediseño V2 · {buildVersion}</span><button className={styles.headerButton} onClick={()=>refresh(tenant)}>↻ Actualizar</button><button className={styles.headerButton} onClick={()=>setDark(x=>!x)}>{dark?'☀ Claro':'☾ Oscuro'}</button><button className={parity.logout} onClick={logout}>Salir</button></div>
    </header>

    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.navLabel}>OPERACIÓN</div>
        {mainNav.map(([key,icon,label,special])=>canView(tenant,key)&&<button key={key} className={`${styles.navButton} ${view===key?styles.navActive:''} ${special==='assistant'?parity.supportAssistant:''}`} onClick={()=>go(key)}><span>{icon}</span>{label}</button>)}
        <button className={parity.navGroupButton} onClick={()=>setManagementOpen(x=>!x)}><span>▦</span>Gestión<span>{managementOpen?'⌃':'⌄'}</span></button>
        {managementOpen&&<div className={parity.navChildren}>{management.filter(([key])=>canView(tenant,key)).map(([key,icon,label])=><button key={key} className={`${parity.navChild} ${view===key?parity.navChildActive:''}`} onClick={()=>go(key)}><span>{icon}</span>{label}</button>)}</div>}
        {canView(tenant,'purchases')&&<button className={`${styles.navButton} ${view==='purchases'?styles.navActive:''}`} onClick={()=>go('purchases')}><span>▦</span>Compras</button>}
        {canView(tenant,'suppliers')&&<button className={`${styles.navButton} ${view==='suppliers'?styles.navActive:''}`} onClick={()=>go('suppliers')}><span>♜</span>Proveedores</button>}
        <div className={styles.sidebarBottom}><b>Comercio Lleno</b><span>Rediseño V2 · {buildVersion}</span><small>Tenant {tenant.companyId.slice(0,8)} · {tenant.role}</small></div>
      </aside>

      <section className={styles.content}>
        {error&&<div className={styles.error}><span>{error}</span><button onClick={()=>setError('')}>×</button></div>}
        {notice&&<div className={styles.notice}><span>{notice}</span><button onClick={()=>setNotice('')}>×</button></div>}
        {data&&view==='dashboard'&&<Dashboard data={data} todayTotal={todayTotal} todayCount={todaySales.length} lowStock={lowStock} go={go} canSell={canView(tenant,'pos')} role={tenant.role}/>} 
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
        {view==='assistant'&&<UnifiedAssistant/>}
      </section>
    </div>

    <div className={styles.bottomBar}><div className={styles.bottomStats}><div><span>Ventas hoy</span><b>{money.format(todayTotal)}</b></div><div><span>Caja estimada</span><b>{money.format(cashEstimated)}</b></div><div><span>Stock bajo</span><b>{lowStock}</b></div></div><div className={styles.time}>{now.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</div></div>
    {receiptSale&&data&&<ReceiptModal sale={receiptSale} data={data} device={device} close={()=>setReceiptSale(null)} onMessage={setNotice}/>} 
    {contingency&&<ContingencyModal reason={contingency.reason} total={contingency.sale.total} busy={checkoutBusy} yes={confirmContingency} no={()=>setContingency(null)}/>} 
  </main>
}
