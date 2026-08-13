'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './page.module.css'
import parity from './parity.module.css'
import enh from './enhancements.module.css'
import shellLayout from './ShellLayout.module.css'
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
import {
  applyLocalSale,
  getOfflineDeviceId,
  listOfflineSales,
  loadOfflineSnapshot,
  markOfflineSaleError,
  overlayOfflineSales,
  queueOfflineSale,
  registerOfflineServiceWorker,
  removeOfflineSale,
  saveOfflineSnapshot,
} from '@/lib/comercio/offline'
import { printReceipt, receiptNumber } from '@/lib/comercio/receipt'
import { readDeviceSettings, readTenantSession } from '@/lib/comercio/session'
import {
  DEFAULT_SALES_SETTINGS,
  loadSalesSettings,
  readCachedSalesSettings,
  type SalesSettings,
} from '@/lib/comercio/sales-settings'
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
import { ContingencyModal, Customers, ReceiptModal } from './CoreViews'
import { CashEnhanced, DashboardEnhanced, dayKey, money, PosEnhanced, ReportsEnhanced, SalesEnhanced } from './OperationalViews'
import SidebarNavigation from './SidebarNavigation'
import UnifiedAssistant from './UnifiedAssistant'

function createId() { return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}` }

function canView(session: TenantSession, view: ViewKey) {
  if (session.role === 'owner') return true
  const p = session.permissions || {}
  const role = session.role
  if (view === 'dashboard' || view === 'assistant' || view === 'help' || view === 'settings') return true
  if (view === 'pos') return p.can_sell ?? ['cashier','seller','manager'].includes(role)
  if (view === 'cash') return p.can_open_close_cash ?? ['cashier','manager','supervisor'].includes(role)
  if (view === 'reports' || view === 'profitability') return p.can_view_reports ?? ['manager','supervisor'].includes(role)
  if (view === 'products' || view === 'stock') return p.can_manage_stock ?? ['manager','supervisor'].includes(role)
  if (view === 'purchases') return p.can_manage_purchases ?? p.can_manage_stock ?? ['manager','supervisor'].includes(role)
  if (view === 'suppliers') return p.can_manage_suppliers ?? p.can_manage_stock ?? ['manager','supervisor'].includes(role)
  if (view === 'customers' || view === 'accounts') return p.can_manage_customers ?? ['cashier','seller','manager','supervisor'].includes(role)
  if (view === 'promotions') return p.can_manage_promotions ?? ['manager','supervisor'].includes(role)
  if (view === 'returns') return p.can_manage_stock ?? ['manager','supervisor'].includes(role)
  if (view === 'sales') return (p.can_sell || p.can_view_reports) ?? true
  return true
}

function roleLabel(role: string) {
  if (role === 'owner') return 'Propietario'
  if (role === 'seller') return 'Vendedor'
  if (role === 'manager') return 'Encargado'
  if (role === 'cashier') return 'Cajero'
  if (role === 'supervisor') return 'Supervisor'
  return role
}

function looksLikeNetworkError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '')
  return typeof navigator !== 'undefined' && !navigator.onLine || /failed to fetch|network|fetch failed|load failed|internet/i.test(message)
}

function LiveClock({hour12}:{hour12:boolean}){
  const[now,setNow]=useState(()=>new Date())
  useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(timer)},[])
  return <div className={styles.time}>{now.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12})}</div>
}

export default function CommerceApp({ buildVersion }: { buildVersion: string }) {
  const [session, setSession] = useState<TenantSession | null>(null)
  const [data, setData] = useState<CommerceSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [view, setView] = useState<ViewKey>('dashboard')
  const [dark, setDark] = useState(false)
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [payment, setPayment] = useState('Efectivo')
  const [customerId, setCustomerId] = useState('')
  const [discountKind, setDiscountKind] = useState<'percent' | 'amount'>('percent')
  const [discountValue, setDiscountValue] = useState(0)
  const [saleSearch, setSaleSearch] = useState('')
  const [salePage, setSalePage] = useState(0)
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null)
  const [device, setDevice] = useState<DeviceSettings>({ paper:'80', autoPrint:false, printerMode:'browser', printerName:'', receiptCopies:1 })
  const [salesSettings, setSalesSettings] = useState<SalesSettings>(DEFAULT_SALES_SETTINGS)
  const [arca, setArca] = useState<ArcaHealth | null>(null)
  const [arcaChecking, setArcaChecking] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [contingency, setContingency] = useState<{ sale: Sale; stock: Array<{ id:string; stock:number }>; reason:string } | null>(null)
  const [online, setOnline] = useState(true)
  const [offlineMode, setOfflineMode] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [offlinePending, setOfflinePending] = useState(0)
  const [offlineSyncing, setOfflineSyncing] = useState(false)
  const syncLock = useRef(false)

  async function loadRemoteWithQueue(s: TenantSession) {
    const remote = await loadCommerceSnapshot(s)
    const queued = await listOfflineSales(s.companyId)
    const merged = overlayOfflineSales(remote, queued)
    setData(merged)
    setOfflinePending(queued.length)
    setOfflineMode(false)
    setOfflineReady(true)
    await saveOfflineSnapshot(s.companyId, merged)
    return merged
  }

  async function loadCached(s: TenantSession) {
    const cached = await loadOfflineSnapshot(s.companyId)
    if (!cached) return null
    const queued = await listOfflineSales(s.companyId)
    const merged = overlayOfflineSales(cached, queued)
    setData(merged)
    setOfflinePending(queued.length)
    setOfflineMode(true)
    setOfflineReady(true)
    return merged
  }

  async function refresh(s = session) {
    if (!s) return
    setError('')
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const cached = await loadCached(s)
      if (!cached) setError('No hay conexión y este equipo todavía no tiene una copia offline del comercio.')
      return
    }
    try { await loadRemoteWithQueue(s) }
    catch (e) {
      const cached = await loadCached(s)
      if (cached) setNotice('Modo offline activo. Se está usando la última copia guardada en este equipo.')
      else setError(e instanceof Error ? e.message : String(e))
    }
  }

  async function refreshArca(s = session) {
    if (!s || arcaChecking) return
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setArca({ connected: false, checkedAt: new Date().toISOString(), error: 'Sin conexión a Internet' })
      return
    }
    setArcaChecking(true)
    try { setArca(await checkArcaHealth(s)) }
    finally { setArcaChecking(false) }
  }

  async function syncOfflineSales(s: TenantSession) {
    if (typeof navigator === 'undefined' || !navigator.onLine || syncLock.current) return
    syncLock.current = true
    setOfflineSyncing(true)
    setError('')
    let syncedFiscal = 0
    let syncedInternal = 0
    let conflicts = 0
    try {
      let queued = await listOfflineSales(s.companyId)
      setOfflinePending(queued.length)
      if (!queued.length) {
        await loadRemoteWithQueue(s)
        await refreshArca(s)
        return
      }
      let remote = await loadCommerceSnapshot(s)
      for (const item of queued) {
        if (!navigator.onLine) break
        const existing = remote.sales.find(sale => sale.id === item.sale.id)
        if (existing) { await removeOfflineSale(item.id); continue }
        try {
          const items = item.sale.details?.items || []
          const manualPending = item.sale.details?.fiscal_intent === 'manual_pending'
          const stockConflict = salesSettings.allowNegativeStock ? [] : items.filter(line => {
            const product = remote.products.find(p => p.id === line.product_id)
            return !product || Number(product.stock || 0) < Number(line.qty || 0)
          }).map(line => line.name)
          conflicts += stockConflict.length
          const stock = items.map(line => {
            const product = remote.products.find(p => p.id === line.product_id)
            return { id: line.product_id, stock: Math.max(0, Number(product?.stock || 0) - Number(line.qty || 0)) }
          })
          if (manualPending) {
            const pending: Sale = { ...item.sale, receipt_type:'ticket', fiscal_status:'pending', cae:null, receiptNumber:undefined }
            await persistUninvoicedSale(s, pending, stock, 'Cobro registrado sin emisión fiscal inmediata')
            await removeOfflineSale(item.id)
            remote = applyLocalSale(remote, pending)
            syncedInternal += 1
            continue
          }
          const invoice = await authorizeFiscalInvoice(s, item.sale.total, item.sale.id)
          const authorized: Sale = {
            ...item.sale,
            receipt_type:'factura_c',
            fiscal_status:'authorized',
            cae:invoice.cae,
            receiptNumber:invoice.receipt_number,
            caeExpiration:invoice.cae_expiration || null,
            fiscalEnvironment:arca?.environment || 'homologacion',
            details:{...(item.sale.details || {}),offline_sync_error:null,offline_stock_conflict:stockConflict.length ? stockConflict : null},
          }
          await persistAuthorizedSale(s, authorized, stock)
          await removeOfflineSale(item.id)
          remote = applyLocalSale(remote, authorized)
          syncedFiscal += 1
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e)
          await markOfflineSaleError(item, message)
          if (!navigator.onLine || (e as Error & { arcaUnavailable?: boolean }).arcaUnavailable) break
        }
      }
      queued = await listOfflineSales(s.companyId)
      const merged = overlayOfflineSales(remote, queued)
      setData(merged)
      setOfflinePending(queued.length)
      setOfflineMode(false)
      setOfflineReady(true)
      await saveOfflineSnapshot(s.companyId, merged)
      const messages:string[]=[]
      if (syncedFiscal) messages.push(`${syncedFiscal} venta${syncedFiscal===1?'':'s'} enviada${syncedFiscal===1?'':'s'} a ARCA`)
      if (syncedInternal) messages.push(`${syncedInternal} cobro${syncedInternal===1?'':'s'} pendiente${syncedInternal===1?'':'s'} de facturación sincronizado${syncedInternal===1?'':'s'}`)
      if (messages.length) setNotice(`${messages.join(' · ')}.${conflicts ? ` ${conflicts} producto${conflicts===1?'':'s'} quedó con conflicto de stock para revisar.` : ''}`)
      if (queued.length && !messages.length) setNotice(`${queued.length} venta${queued.length===1?'':'s'} offline sigue${queued.length===1?'':'n'} pendiente${queued.length===1?'':'s'} de sincronización.`)
      await refreshArca(s)
    } catch (e) {
      setOfflineMode(true)
      await loadCached(s)
      if (!looksLikeNetworkError(e)) setError(e instanceof Error ? e.message : String(e))
    } finally {
      syncLock.current=false
      setOfflineSyncing(false)
    }
  }

  useEffect(() => {
    const s=readTenantSession()
    setSession(s)
    if(!s){setLoading(false);return}
    setDevice(readDeviceSettings(s.companyId))
    const cachedSalesSettings=readCachedSalesSettings(s.companyId)
    setSalesSettings(cachedSalesSettings)
    void loadSalesSettings(s).then(setSalesSettings).catch(()=>{})
    setOnline(navigator.onLine)
    void registerOfflineServiceWorker().then(reg=>{if(reg)setOfflineReady(true)})
    const bootstrap=async()=>{
      try{
        if(navigator.onLine){
          await loadRemoteWithQueue(s)
          setArca(await checkArcaHealth(s))
          const queued=await listOfflineSales(s.companyId)
          if(queued.length)await syncOfflineSales(s)
        }else{
          const cached=await loadCached(s)
          setArca({connected:false,checkedAt:new Date().toISOString(),error:'Sin conexión a Internet'})
          if(!cached)setError('Este equipo todavía no tiene una copia offline. Conectalo una vez a Internet y abrí Comercio Lleno para prepararlo.')
        }
      }catch(e){const cached=await loadCached(s);if(!cached)setError(e instanceof Error?e.message:String(e))}
      finally{setLoading(false)}
    }
    void bootstrap()
    const healthTimer=window.setInterval(()=>{if(navigator.onLine&&document.visibilityState==='visible')checkArcaHealth(s).then(setArca).catch(()=>{})},300000)
    const key=(e:KeyboardEvent)=>{if(e.key==='F2'&&canView(s,'pos')){e.preventDefault();setView('pos')}}
    const onOffline=()=>{setOnline(false);setOfflineMode(true);setArca({connected:false,checkedAt:new Date().toISOString(),error:'Sin conexión a Internet'});setNotice('Sin Internet: Comercio Lleno sigue funcionando con la copia local. Las ventas quedarán pendientes de sincronización.')}
    const onOnline=()=>{setOnline(true);setNotice('Volvió Internet. Sincronizando ventas pendientes…');void syncOfflineSales(s)}
    const onSalesSettings=(event:Event)=>{const next=(event as CustomEvent<SalesSettings>).detail;if(next)setSalesSettings(next)}
    window.addEventListener('keydown',key);window.addEventListener('offline',onOffline);window.addEventListener('online',onOnline);window.addEventListener('comercio:sales-settings',onSalesSettings)
    return()=>{window.clearInterval(healthTimer);window.removeEventListener('keydown',key);window.removeEventListener('offline',onOffline);window.removeEventListener('online',onOnline);window.removeEventListener('comercio:sales-settings',onSalesSettings)}
  },[])

  const today=dayKey(new Date())
  const todaySales=useMemo(()=>data?.sales.filter(s=>dayKey(s.date)===today)||[],[data,today])
  const todayTotal=useMemo(()=>todaySales.reduce((a,s)=>a+s.total,0),[todaySales])
  const lowStock=useMemo(()=>data?.products.filter(p=>p.stock<=Number(p.min_stock??5)).length||0,[data])
  const subtotal=useMemo(()=>cart.reduce((a,i)=>a+i.price*i.qty,0),[cart])
  const discountAmount=useMemo(()=>{const value=Math.max(0,Number(discountValue||0));if(!subtotal||!value)return 0;const maxPercent=Math.max(0,Math.min(100,Number(salesSettings.maxDiscount??100))),maxAmount=subtotal*maxPercent/100;if(discountKind==='percent')return Math.min(subtotal,subtotal*Math.min(maxPercent,value)/100);return Math.min(subtotal,maxAmount,value)},[subtotal,discountKind,discountValue,salesSettings.maxDiscount])
  const total=Math.max(0,subtotal-discountAmount)
  const filteredProducts=useMemo(()=>{if(!data)return[];const q=query.trim().toLowerCase(),rows=q?data.products.filter(p=>`${p.name} ${p.barcode||''} ${p.category||''}`.toLowerCase().includes(q)):data.products;return rows.slice(0,50)},[data,query])
  const openedAt=data?.cashRegister?.opened_at?new Date(data.cashRegister.opened_at).getTime():0
  const sessionSales=useMemo(()=>data?.sales.filter(s=>!openedAt||new Date(s.date).getTime()>=openedAt)||[],[data,openedAt])
  const sessionMovements=useMemo(()=>data?.cashMovements.filter(m=>!openedAt||new Date(m.occurred_at).getTime()>=openedAt)||[],[data,openedAt])
  const cashSales=sessionSales.filter(s=>/efect/i.test(s.payment)).reduce((a,s)=>a+s.total,0)
  const expenses=sessionMovements.filter(m=>m.kind==='expense'||m.kind==='egress').reduce((a,m)=>a+m.amount,0)
  const incomes=sessionMovements.filter(m=>m.kind==='income').reduce((a,m)=>a+m.amount,0)
  const cashEstimated=Number(data?.cashRegister?.opening_amount||0)+cashSales+incomes-expenses

  if(loading)return <div className={styles.loading}>Cargando Comercio Lleno · Rediseño V2…</div>
  if(!session)return <div className={styles.loginBox}><div className={styles.loginCard}><div className={styles.loginLogo}>CL</div><h1>Comercio Lleno</h1><p>Ingresá con tu cuenta para abrir el Rediseño V2.</p><button className={styles.primary} onClick={()=>location.href='/redesign/access'}>Ingresar</button></div></div>
  const tenant=session

  function go(next:ViewKey){if(canView(tenant,next))setView(next);else setNotice('Tu rol no tiene permiso para abrir esa sección.')}
  function resetSaleForm(){setCart([]);setCustomerId('');setDiscountValue(0);setDiscountKind('percent');setPayment('Efectivo')}
  function addProduct(id:string){const p=data?.products.find(x=>x.id===id);if(!p)return;if(!salesSettings.allowNegativeStock&&p.stock<=0){setNotice('Ese producto está sin stock. Activá “Permitir vender sin stock” en Configuración > Ventas y caja si necesitás venderlo igual.');return}setCart(rows=>{const f=rows.find(x=>x.id===id);return f?rows.map(x=>x.id===id?{...x,qty:salesSettings.allowNegativeStock?x.qty+1:Math.min(x.qty+1,p.stock)}:x):[...rows,{...p,qty:1}]});setQuery('')}
  function changeQty(id:string,delta:number){setCart(rows=>rows.map(x=>x.id===id?{...x,qty:Math.max(1,salesSettings.allowNegativeStock?x.qty+delta:Math.min(x.stock,x.qty+delta))}:x))}
  function removeProduct(id:string){setCart(rows=>rows.filter(x=>x.id!==id))}

  async function storeOfflineSale(base:Sale,reason:string){
    if(!data)throw new Error('No hay una copia local del comercio para guardar la venta.')
    const manualPending=base.details?.fiscal_intent==='manual_pending'
    const pending:Sale={...base,receipt_type:'ticket',fiscal_status:'offline_pending',cae:null,receiptNumber:undefined,details:{...(base.details||{}),fiscal_pending_reason:reason,fiscal_pending_since:new Date().toISOString(),offline_created_at:new Date().toISOString(),offline_device_id:getOfflineDeviceId(tenant.companyId)}}
    await queueOfflineSale(tenant.companyId,pending)
    const local=applyLocalSale(data,pending);setData(local);await saveOfflineSnapshot(tenant.companyId,local)
    const queued=await listOfflineSales(tenant.companyId);setOfflinePending(queued.length);setOfflineMode(true);resetSaleForm();setReceiptSale(pending)
    setNotice(manualPending?'Venta cobrada y guardada en este equipo. Quedó pendiente de facturación.':'Venta guardada en este equipo. Se intentará facturar cuando vuelva Internet.')
  }

  async function checkout(mode:'fiscal'|'internal'='fiscal'){
    if(!data||!cart.length||checkoutBusy)return
    if(!canView(tenant,'pos')){setNotice('Tu usuario no tiene permiso para vender.');return}
    if(data.cashRegister?.status!=='open'){setNotice('Primero tenés que abrir la caja.');return}
    if(total<=0){setNotice('El total de la venta debe ser mayor a cero.');return}
    setCheckoutBusy(true);setError('')
    const id=createId(),items=cart.map(i=>({product_id:i.id,name:i.name,barcode:i.barcode||null,qty:i.qty,unit_price:i.price,line_total:i.price*i.qty}))
    const base:Sale={id,date:new Date().toISOString(),total,payment,items:items.reduce((a,i)=>a+i.qty,0),customer_id:customerId||null,receipt_type:mode==='fiscal'?'factura_c':'ticket',fiscal_status:'pending',details:{items,subtotal_before_discount:subtotal,discount_amount:discountAmount,discount:discountAmount>0?{kind:discountKind,value:discountValue}:null,captured_at:new Date().toISOString(),fiscal_intent:mode==='fiscal'?'invoice_now':'manual_pending'}}
    const stock=cart.map(i=>({id:i.id,stock:Math.max(0,i.stock-i.qty)}))
    try{
      if(mode==='internal'){
        if(!navigator.onLine||offlineMode){await storeOfflineSale(base,'Cobro registrado sin emisión fiscal inmediata');return}
        await persistUninvoicedSale(tenant,base,stock,'Cobro registrado sin emisión fiscal inmediata');resetSaleForm();setNotice('Venta cobrada · quedó pendiente de facturación.');setReceiptSale(base);await refresh(tenant);if(device.autoPrint){try{await printReceipt(base,data.company,device)}catch{}}return
      }
      if(!navigator.onLine||offlineMode){await storeOfflineSale(base,'Sin conexión a Internet al momento de cobrar y facturar');return}
      const invoice=await authorizeFiscalInvoice(tenant,total,id)
      const authorized:Sale={...base,fiscal_status:'authorized',cae:invoice.cae,receiptNumber:invoice.receipt_number,caeExpiration:invoice.cae_expiration||null,fiscalEnvironment:arca?.environment||'homologacion'}
      await persistAuthorizedSale(tenant,authorized,stock);resetSaleForm();setNotice(`Venta registrada · Factura C ${receiptNumber(authorized)}`);setReceiptSale(authorized);setArca({...(arca||{connected:true}),connected:true,checkedAt:new Date().toISOString()});await refresh(tenant);if(device.autoPrint){try{await printReceipt(authorized,data.company,device)}catch{}}
    }catch(e){const err=e as Error&{arcaUnavailable?:boolean};if(err.arcaUnavailable){setArca({connected:false,checkedAt:new Date().toISOString(),error:err.message});if(!navigator.onLine||looksLikeNetworkError(err))await storeOfflineSale(base,err.message);else setContingency({sale:base,stock,reason:err.message})}else setError(`No se pudo facturar: ${err.message}`)}finally{setCheckoutBusy(false)}
  }

  async function confirmContingency(){if(!contingency)return;setCheckoutBusy(true);try{await persistUninvoicedSale(tenant,contingency.sale,contingency.stock,contingency.reason);resetSaleForm();setNotice('Venta registrada sin factura. Quedó Pendiente ARCA.');setContingency(null);await refresh(tenant)}catch(e){if(looksLikeNetworkError(e)){await storeOfflineSale(contingency.sale,contingency.reason||'Conexión perdida durante la venta');setContingency(null)}else setError(e instanceof Error?e.message:String(e))}finally{setCheckoutBusy(false)}}
  async function openCash(){if(!data)return;if(!navigator.onLine){setNotice('La apertura de una nueva caja requiere conexión. Si la caja ya estaba abierta, podés seguir vendiendo offline.');return}const raw=window.prompt('Importe inicial de caja',String(data.cashRegister?.opening_amount||0));if(raw==null)return;const amount=Math.max(0,Number(raw.replace(',','.'))||0);try{await openCashRegister(tenant,data.cashRegister,amount);await refresh(tenant);setNotice('Caja abierta.')}catch(e){setError(e instanceof Error?e.message:String(e))}}
  async function closeCash(){if(!data?.cashRegister)return;if(!navigator.onLine){setNotice('El cierre de caja se confirma con conexión para evitar diferencias de sincronización. Podés seguir contando efectivo offline.');return}if(!window.confirm('¿Confirmás el cierre de caja?'))return;try{await closeCashRegister(tenant,data.cashRegister);await refresh(tenant);setNotice('Caja cerrada.')}catch(e){setError(e instanceof Error?e.message:String(e))}}
  function logout(){['cl_access_token','cl_refresh_token','cl_company_id','cl_company_name','cl_user_role','cl_user_permissions'].forEach(k=>localStorage.removeItem(k));location.replace('/redesign/access')}

  const arcaConfigured=arca?(arca as ArcaHealth&{configured?:boolean}).configured!==false:true
  const arcaLabel=arcaChecking?'ARCA verificando…':!arcaConfigured?'ARCA no configurado':arca?.connected?'ARCA conectado':'ARCA desconectado'
  const arcaClass=arcaChecking?styles.statusNeutral:!arcaConfigured?styles.statusNeutral:arca?.connected?styles.statusOk:styles.statusBad
  const networkLabel=offlineSyncing?'Sincronizando…':!online||offlineMode?`Modo offline${offlinePending?` · ${offlinePending} pend.`:''}`:offlinePending?`${offlinePending} por sincronizar`:offlineReady?'Offline listo':'Preparando offline'
  const networkClass=!online||offlineMode?styles.statusBad:offlinePending?styles.statusNeutral:styles.statusOk

  return <main className={`${styles.shell} ${enh.readable} ${dark?styles.dark:''} ${dark?parity.dark:''} ${dark?enh.dark:''}`}>
    <header className={styles.topbar}>
      <div className={styles.brandWrap}><div className={styles.brandMark}>CL</div><div><div className={styles.brand}>Comercio <span>Lleno</span></div><div className={styles.tenant}>{data?.company.name||tenant.companyName} · {roleLabel(tenant.role)}</div></div></div>
      <div className={styles.headerRight}><button className={`${styles.status} ${networkClass}`} onClick={()=>online&&syncOfflineSales(tenant)}>● {networkLabel}</button><button className={`${styles.status} ${arcaClass}`} onClick={()=>refreshArca(tenant)}>● {arcaLabel}</button><span className={styles.versionPill}>Rediseño V2 · {buildVersion}</span><button className={styles.headerButton} onClick={()=>refresh(tenant)}>↻ Actualizar</button><button className={styles.headerButton} onClick={()=>setDark(x=>!x)}>{dark?'☀ Claro':'☾ Oscuro'}</button><button className={parity.logout} onClick={logout}>Salir</button></div>
    </header>
    <div className={`${styles.layout} ${shellLayout.layout}`}>
      <SidebarNavigation tenant={tenant} view={view} buildVersion={buildVersion} canView={(next)=>canView(tenant,next)} onNavigate={go}/>
      <section className={`${styles.content} ${shellLayout.content}`}>
        {(!online||offlineMode)&&<div className={enh.offlineModeBar}><b>Modo offline activo</b><span>Podés seguir cobrando con los productos guardados en este equipo. Las ventas que elijas facturar se enviarán a ARCA cuando vuelva Internet.</span>{offlinePending>0&&<strong>{offlinePending} pendiente{offlinePending===1?'':'s'}</strong>}</div>}
        {error&&<div className={styles.error}><span>{error}</span><button onClick={()=>setError('')}>×</button></div>}
        {notice&&<div className={styles.notice}><span>{notice}</span><button onClick={()=>setNotice('')}>×</button></div>}
        {data&&view==='dashboard'&&<DashboardEnhanced data={data} todayTotal={todayTotal} todayCount={todaySales.length} lowStock={lowStock} go={go} canSell={canView(tenant,'pos')} role={tenant.role}/>} 
        {data&&view==='pos'&&<PosEnhanced data={data} query={query} setQuery={setQuery} filtered={filteredProducts} cart={cart} addProduct={addProduct} changeQty={changeQty} removeProduct={removeProduct} subtotal={subtotal} discountKind={discountKind} setDiscountKind={setDiscountKind} discountValue={discountValue} setDiscountValue={setDiscountValue} discountAmount={discountAmount} total={total} customerId={customerId} setCustomerId={setCustomerId} payment={payment} setPayment={setPayment} checkout={checkout} busy={checkoutBusy} arca={arca} offline={!online||offlineMode} pendingOffline={offlinePending}/>} 
        {data&&view==='products'&&<ProductsV2 data={data} session={tenant} refresh={()=>refresh(tenant)} message={setNotice}/>} 
        {data&&view==='cash'&&<CashEnhanced data={data} session={tenant} sessionSales={sessionSales} movements={sessionMovements} cashEstimated={cashEstimated} openCash={openCash} closeCash={closeCash} refresh={()=>refresh(tenant)} message={setNotice}/>} 
        {data&&view==='settings'&&<SettingsV2 data={data} session={tenant} device={device} setDevice={setDevice} arca={arca} buildVersion={buildVersion} refresh={()=>refresh(tenant)} message={setNotice}/>} 
        {data&&view==='sales'&&<SalesEnhanced data={data} session={tenant} search={saleSearch} setSearch={x=>{setSaleSearch(x);setSalePage(0)}} page={salePage} setPage={setSalePage} device={device} onMessage={setNotice} refresh={()=>refresh(tenant)}/>} 
        {data&&view==='reports'&&<ReportsEnhanced data={data}/>} 
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
    <div className={`${styles.bottomBar} ${shellLayout.bottomBar}`}><div className={styles.bottomStats}><div><span>Ventas hoy</span><b>{money.format(todayTotal)}</b></div><div><span>Caja estimada</span><b>{money.format(cashEstimated)}</b></div><div><span>Stock bajo</span><b>{lowStock}</b></div>{offlinePending>0&&<div><span>Offline pendiente</span><b>{offlinePending}</b></div>}</div><LiveClock hour12={salesSettings.timeFormat==='12'}/></div>
    {receiptSale&&data&&<ReceiptModal sale={receiptSale} data={data} device={device} close={()=>setReceiptSale(null)} onMessage={setNotice}/>} 
    {contingency&&<ContingencyModal reason={contingency.reason} total={contingency.sale.total} busy={checkoutBusy} yes={confirmContingency} no={()=>setContingency(null)}/>} 
  </main>
}
