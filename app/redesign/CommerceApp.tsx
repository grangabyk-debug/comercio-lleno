'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './page.module.css'
import { loadCommerceSnapshot } from '@/lib/comercio/api'
import { downloadReceiptPdf, printReceipt, receiptNumber } from '@/lib/comercio/receipt'
import { readDeviceSettings, readTenantSession, writeDeviceSettings } from '@/lib/comercio/session'
import type { CartLine, CommerceSnapshot, DeviceSettings, Sale, ViewKey } from '@/lib/comercio/types'

const SAFE_PREVIEW = true
const payments = ['Efectivo','Débito','Crédito','Transferencia','Mercado Pago','Billetera Virtual']
const nav: Array<[ViewKey,string,string]> = [
  ['dashboard','⌂','Inicio'],['pos','▣','Caja'],['sales','▤','Ventas'],['products','▦','Productos'],['stock','◈','Stock'],['reports','◔','Reportes'],['customers','♙','Clientes'],['cash','◷','Caja diaria'],['settings','⚙','Configuración'],
]
const money = new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})

function dayKey(value:string|Date){const d=value instanceof Date?value:new Date(value);if(Number.isNaN(d.getTime()))return'';return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function daysAgo(n:number){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-n);return d.getTime()}

export default function CommerceApp(){
  const [session,setSession]=useState<ReturnType<typeof readTenantSession>>(null)
  const [data,setData]=useState<CommerceSnapshot|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [view,setView]=useState<ViewKey>('dashboard')
  const [dark,setDark]=useState(false)
  const [now,setNow]=useState(new Date())
  const [query,setQuery]=useState('')
  const [cart,setCart]=useState<CartLine[]>([])
  const [payment,setPayment]=useState('Efectivo')
  const [saleSearch,setSaleSearch]=useState('')
  const [salePage,setSalePage]=useState(0)
  const [receiptSale,setReceiptSale]=useState<Sale|null>(null)
  const [notice,setNotice]=useState('')
  const [device,setDevice]=useState<DeviceSettings>({paper:'80',autoPrint:false,printerMode:'browser',printerName:'',receiptCopies:1})

  async function refresh(s=session){
    if(!s)return
    setError('')
    try{setData(await loadCommerceSnapshot(s))}catch(e){setError(e instanceof Error?e.message:String(e))}
  }

  useEffect(()=>{
    const s=readTenantSession();setSession(s);setLoading(false)
    if(!s)return
    setDevice(readDeviceSettings(s.companyId))
    setLoading(true);loadCommerceSnapshot(s).then(setData).catch(e=>setError(e instanceof Error?e.message:String(e))).finally(()=>setLoading(false))
    const timer=window.setInterval(()=>setNow(new Date()),1000)
    const key=(e:KeyboardEvent)=>{if(e.key==='F2'){e.preventDefault();setView('pos')}}
    window.addEventListener('keydown',key)
    return()=>{window.clearInterval(timer);window.removeEventListener('keydown',key)}
  },[])

  const today=dayKey(new Date())
  const todaySales=useMemo(()=>data?.sales.filter(s=>dayKey(s.date)===today)||[],[data,today])
  const todayTotal=useMemo(()=>todaySales.reduce((a,s)=>a+s.total,0),[todaySales])
  const lowStock=useMemo(()=>data?.products.filter(p=>p.stock<=Number(p.min_stock??5)).length||0,[data])
  const total=useMemo(()=>cart.reduce((a,i)=>a+i.price*i.qty,0),[cart])
  const filteredProducts=useMemo(()=>{
    if(!data)return[]
    const q=query.trim().toLowerCase()
    const rows=q?data.products.filter(p=>`${p.name} ${p.barcode||''} ${p.category||''}`.toLowerCase().includes(q)):data.products
    return rows.slice(0,40)
  },[data,query])
  const openedAt=data?.cashRegister?.opened_at?new Date(data.cashRegister.opened_at).getTime():0
  const sessionSales=useMemo(()=>data?.sales.filter(s=>!openedAt||new Date(s.date).getTime()>=openedAt)||[],[data,openedAt])
  const sessionMovements=useMemo(()=>data?.cashMovements.filter(m=>!openedAt||new Date(m.occurred_at).getTime()>=openedAt)||[],[data,openedAt])
  const cashSales=sessionSales.filter(s=>/efect/i.test(s.payment)).reduce((a,s)=>a+s.total,0)
  const expenses=sessionMovements.filter(m=>m.kind==='expense'||m.kind==='egress').reduce((a,m)=>a+m.amount,0)
  const incomes=sessionMovements.filter(m=>m.kind==='income').reduce((a,m)=>a+m.amount,0)
  const cashEstimated=Number(data?.cashRegister?.opening_amount||0)+cashSales+incomes-expenses

  if(loading)return <div className={styles.loading}>Cargando Comercio Lleno…</div>
  if(!session)return <div className={styles.loginBox}><div className={styles.loginCard}><h1>Comercio Lleno</h1><p>Esta vista usa tu sesión real, pero no carga los scripts viejos. Ingresá primero al sistema actual y después abrí el rediseño.</p><button className={styles.primary} onClick={()=>location.href='/login'}>Ir a ingresar</button></div></div>

  function addProduct(id:string){
    const p=data?.products.find(x=>x.id===id);if(!p)return
    if(p.stock<=0){setNotice('Ese producto está sin stock.');return}
    setCart(rows=>{const f=rows.find(x=>x.id===id);return f?rows.map(x=>x.id===id?{...x,qty:Math.min(x.qty+1,p.stock)}:x):[...rows,{...p,qty:1}]})
    setQuery('')
  }
  function changeQty(id:string,delta:number){setCart(rows=>rows.map(x=>x.id===id?{...x,qty:Math.max(1,Math.min(x.stock,x.qty+delta))}:x))}
  function previewCheckout(){setNotice('Modo seguro: esta versión todavía no envía la venta a ARCA ni modifica la base. Cuando aprobemos el rediseño, activamos el flujo real.')}
  function saveDevice(next:DeviceSettings){setDevice(next);writeDeviceSettings(session!.companyId,next);setNotice('Configuración de esta PC guardada localmente. No se modificó la base de datos.')}

  const visibleNav=nav.filter(([key])=>session.role==='owner'||key!=='settings')

  return <main className={`${styles.shell} ${dark?styles.dark:''}`}>
    <header className={styles.topbar}>
      <div className={styles.brandWrap}><div className={styles.brandMark}>CL</div><div><div className={styles.brand}>Comercio <span>Lleno</span></div><div className={styles.tenant}>{data?.company.name||session.companyName} · {session.role==='owner'?'Propietario':session.role}</div></div></div>
      <div className={styles.headerRight}>
        <span className={`${styles.status} ${styles.statusOk}`}>● Modo seguro · solo lectura</span>
        <button className={styles.headerButton} onClick={()=>refresh()}>↻ Actualizar</button>
        <button className={styles.headerButton} onClick={()=>setDark(x=>!x)}>{dark?'☀ Claro':'☾ Oscuro'}</button>
        <button className={styles.headerButton} onClick={()=>location.href='/?app=1'}>Versión actual</button>
      </div>
    </header>
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        {visibleNav.map(([key,icon,label])=><button key={key} className={`${styles.navButton} ${view===key?styles.navActive:''}`} onClick={()=>setView(key)}><span>{icon}</span>{label}</button>)}
        <div className={styles.sidebarBottom}><b>Rediseño aislado</b><br/>Sin observers, sin overlays y sin scripts que modifiquen React desde afuera.</div>
      </aside>
      <section className={styles.content}>
        {error&&<div className={styles.error} style={{marginBottom:14}}>{error}</div>}
        {notice&&<div className={styles.notice} style={{marginBottom:14,display:'flex',justifyContent:'space-between',gap:12}}><span>{notice}</span><button className={styles.ghost} onClick={()=>setNotice('')}>Cerrar</button></div>}
        {data&&view==='dashboard'&&<Dashboard data={data} todayTotal={todayTotal} todayCount={todaySales.length} lowStock={lowStock} setView={setView}/>} 
        {data&&view==='pos'&&<Pos data={data} query={query} setQuery={setQuery} filtered={filteredProducts} cart={cart} addProduct={addProduct} changeQty={changeQty} total={total} payment={payment} setPayment={setPayment} checkout={previewCheckout}/>} 
        {data&&view==='sales'&&<Sales data={data} search={saleSearch} setSearch={x=>{setSaleSearch(x);setSalePage(0)}} page={salePage} setPage={setSalePage} openReceipt={setReceiptSale}/>} 
        {data&&view==='products'&&<Products data={data}/>} 
        {data&&view==='stock'&&<Stock data={data}/>} 
        {data&&view==='reports'&&<Reports data={data}/>} 
        {data&&view==='customers'&&<Customers data={data}/>} 
        {data&&view==='cash'&&<Cash data={data} sessionSales={sessionSales} movements={sessionMovements} cashEstimated={cashEstimated} safeAction={previewCheckout}/>} 
        {data&&view==='settings'&&<Settings data={data} device={device} saveDevice={saveDevice}/>} 
      </section>
    </div>
    <div className={styles.bottomBar}><div className={styles.bottomStats}><div><span>Ventas de hoy</span><b>{money.format(todayTotal)}</b></div><div><span>Caja estimada</span><b>{money.format(cashEstimated)}</b></div><div><span>Stock bajo</span><b>{lowStock}</b></div></div><div className={styles.time}>{now.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</div></div>
    {receiptSale&&data&&<ReceiptModal sale={receiptSale} data={data} device={device} close={()=>setReceiptSale(null)} onMessage={setNotice}/>} 
  </main>
}

function Head({eyebrow,title,subtitle,children}:{eyebrow:string;title:string;subtitle:string;children?:React.ReactNode}){return <div className={styles.pageHead}><div><div className={styles.eyebrow}>{eyebrow}</div><h1>{title}</h1><p className={styles.muted}>{subtitle}</p></div>{children}</div>}

function Dashboard({data,todayTotal,todayCount,lowStock,setView}:{data:CommerceSnapshot;todayTotal:number;todayCount:number;lowStock:number;setView:(v:ViewKey)=>void}){
  const recent=data.sales.slice(0,6)
  return <><Head eyebrow={data.company.name} title="Inicio" subtitle="Todo lo importante del comercio, sin recargar la página."><button className={styles.primary} onClick={()=>setView('pos')}>+ Nueva venta</button></Head><div className={styles.kpis}><div className={`${styles.kpi} ${styles.kpiAccent}`}><span>Ventas de hoy</span><strong>{money.format(todayTotal)}</strong><small>{todayCount} operaciones</small></div><div className={styles.kpi}><span>Ticket promedio</span><strong>{money.format(todayCount?todayTotal/todayCount:0)}</strong><small>Promedio del día</small></div><div className={styles.kpi}><span>Stock bajo</span><strong>{lowStock}</strong><small>Según mínimo por producto</small></div><div className={styles.kpi}><span>Caja</span><strong>{data.cashRegister?.status==='open'?'Abierta':'Cerrada'}</strong><small>{data.cashRegister?.opened_at?`Desde ${new Date(data.cashRegister.opened_at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}`:'Sin apertura activa'}</small></div></div><div className={styles.gridTwo}><div className={styles.panel}><div className={styles.panelTitle}><div><b>Últimas ventas</b><small>Actividad real de este comercio</small></div><button className={styles.rowButton} onClick={()=>setView('sales')}>Ver todas</button></div>{recent.length?recent.map(s=><div className={styles.recentRow} key={s.id}><span className={styles.roundIcon}>$</span><div><b>{s.receiptNumber?`Factura C ${receiptNumber(s)}`:`Venta #${s.id.slice(0,8)}`}</b><small>{new Date(s.date).toLocaleString('es-AR')} · {s.payment}</small></div><strong>{money.format(s.total)}</strong></div>):<div className={styles.empty}>Todavía no hay ventas.</div>}</div><div className={styles.panel}><div className={styles.panelTitle}><div><b>Accesos rápidos</b><small>Operación diaria</small></div></div><div className={styles.shortcutGrid}><button className={styles.shortcut} onClick={()=>setView('pos')}><b>▣ Ir a Caja</b><span>F2 abre el punto de venta</span></button><button className={styles.shortcut} onClick={()=>setView('stock')}><b>◈ Revisar stock</b><span>Detectá faltantes antes de vender</span></button><button className={styles.shortcut} onClick={()=>setView('reports')}><b>◔ Ver reportes</b><span>Hoy, semana y últimos 30 días</span></button></div></div></div></>
}

function Pos({data,query,setQuery,filtered,cart,addProduct,changeQty,total,payment,setPayment,checkout}:{data:CommerceSnapshot;query:string;setQuery:(v:string)=>void;filtered:CommerceSnapshot['products'];cart:CartLine[];addProduct:(id:string)=>void;changeQty:(id:string,d:number)=>void;total:number;payment:string;setPayment:(v:string)=>void;checkout:()=>void}){
  function scan(){const exact=data.products.find(p=>String(p.barcode||'')===query.trim());if(exact)addProduct(exact.id);else if(filtered[0])addProduct(filtered[0].id)}
  return <><Head eyebrow="Punto de venta · F2" title="Caja" subtitle="Búsqueda, scanner, carrito y facturación en una sola pantalla."><span className={`${styles.badge} ${data.cashRegister?.status==='open'?styles.badgeGreen:styles.badgeRed}`}>{data.cashRegister?.status==='open'?'● Caja abierta':'● Caja cerrada'}</span></Head><div className={styles.posGrid}><div className={styles.panel}><div className={styles.searchBox}><input className={styles.input} autoFocus value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&scan()} placeholder="Código de barras o nombre del producto"/><button className={styles.primary} onClick={scan}>Agregar</button></div><div className={styles.results}>{filtered.map(p=><button key={p.id} className={styles.result} onClick={()=>addProduct(p.id)}><span><b>{p.name}</b><small>{p.barcode||'Sin código'} · {p.category||'General'} · Stock {p.stock}</small></span><strong>{money.format(p.price)}</strong></button>)}</div><div className={styles.hint}>El scanner USB funciona como teclado: lee el código y Enter agrega el producto.</div></div><div className={`${styles.panel} ${styles.ticket}`}><div className={styles.ticketHead}><h2>Venta actual</h2><button className={styles.ghost} onClick={()=>location.reload()}>Vaciar</button></div><div className={styles.cart}>{cart.length?cart.map(i=><div className={styles.cartLine} key={i.id}><div><b>{i.name}</b><small>{money.format(i.price)} c/u · Stock {i.stock}</small><div className={styles.qty}><button onClick={()=>changeQty(i.id,-1)}>−</button><b>{i.qty}</b><button onClick={()=>changeQty(i.id,1)}>+</button></div></div><strong className={styles.lineTotal}>{money.format(i.price*i.qty)}</strong></div>):<div className={styles.empty}>Esperando productos<br/>Pasá un código o buscá por nombre.</div>}</div><div className={styles.checkout}><div className={`${styles.moneyLine} ${styles.grandTotal}`}><span>Total</span><strong>{money.format(total)}</strong></div><div className={styles.payments}>{payments.map(p=><button key={p} className={`${styles.payment} ${payment===p?styles.paymentSelected:''}`} onClick={()=>setPayment(p)}>{p}</button>)}</div><button className={styles.charge} disabled={!cart.length||data.cashRegister?.status!=='open'} onClick={checkout}>{data.cashRegister?.status==='open'?'Cobrar · vista previa':'Abrí la caja para cobrar'}</button></div></div></div></>
}

function Sales({data,search,setSearch,page,setPage,openReceipt}:{data:CommerceSnapshot;search:string;setSearch:(v:string)=>void;page:number;setPage:(v:number)=>void;openReceipt:(s:Sale)=>void}){
  const q=search.trim().toLowerCase();const filtered=data.sales.filter(s=>`${s.id} ${s.receiptNumber||''} ${s.payment} ${s.cae||''}`.toLowerCase().includes(q));const size=25;const pages=Math.max(1,Math.ceil(filtered.length/size));const current=Math.min(page,pages-1);const rows=filtered.slice(current*size,current*size+size)
  return <><Head eyebrow="Operaciones" title="Ventas" subtitle="Historial estable, paginado y sin MutationObserver."/><div className={styles.tableTools}><input className={styles.input} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar factura, operación, CAE o medio de pago…"/></div><div className={styles.table}><div className={`${styles.tableRow} ${styles.tableHead}`}><span>Fecha</span><span>Operación</span><span>Medio</span><span>Items</span><span>Total</span><span>Acción</span></div>{rows.map(s=><div className={styles.tableRow} key={s.id}><span>{new Date(s.date).toLocaleString('es-AR')}</span><span>{s.receiptNumber?`FC ${receiptNumber(s)}`:`#${s.id.slice(0,8)}`}</span><span>{s.payment}</span><span>{s.items}</span><span><b>{money.format(s.total)}</b></span><span>{s.cae?<button className={styles.rowButton} onClick={()=>openReceipt(s)}>Ver factura</button>:<span className={`${styles.badge} ${styles.badgeAmber}`}>Sin CAE</span>}</span></div>)}</div><div className={styles.pager}><button className={styles.secondary} disabled={current===0} onClick={()=>setPage(current-1)}>←</button><span>Página {current+1} de {pages} · {filtered.length} ventas</span><button className={styles.secondary} disabled={current>=pages-1} onClick={()=>setPage(current+1)}>→</button></div></>
}

function Products({data}:{data:CommerceSnapshot}){const[q,setQ]=useState('');const rows=data.products.filter(p=>`${p.name} ${p.barcode||''} ${p.category||''}`.toLowerCase().includes(q.toLowerCase())).slice(0,300);return <><Head eyebrow="Catálogo" title="Productos" subtitle={`${data.products.length} productos activos del comercio.`}/><div className={styles.tableTools}><input className={styles.input} value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar producto, código o categoría…"/></div><div className={`${styles.table} ${styles.productTable}`}><div className={`${styles.tableRow} ${styles.tableHead}`}><span>Producto</span><span>Código</span><span>Categoría</span><span>Precio</span><span>Stock</span></div>{rows.map(p=><div className={styles.tableRow} key={p.id}><span><b>{p.name}</b></span><span>{p.barcode||'—'}</span><span>{p.category||'General'}</span><span>{money.format(p.price)}</span><span>{p.stock}</span></div>)}</div></>}

function Stock({data}:{data:CommerceSnapshot}){const[mode,setMode]=useState<'all'|'low'|'out'>('all');const rows=data.products.filter(p=>mode==='all'||mode==='out'&&p.stock<=0||mode==='low'&&p.stock>0&&p.stock<=Number(p.min_stock??5));return <><Head eyebrow="Inventario" title="Stock" subtitle="Control de existencias usando el mínimo propio de cada producto."><div className={styles.actions}><button className={styles.secondary} onClick={()=>setMode('all')}>Todos</button><button className={styles.secondary} onClick={()=>setMode('low')}>Bajo</button><button className={styles.secondary} onClick={()=>setMode('out')}>Agotados</button></div></Head><div className={`${styles.table} ${styles.stockTable}`}><div className={`${styles.tableRow} ${styles.tableHead}`}><span>Producto</span><span>Categoría</span><span>Stock</span><span>Mínimo</span><span>Estado</span></div>{rows.map(p=>{const min=Number(p.min_stock??5);return <div className={styles.tableRow} key={p.id}><span><b>{p.name}</b></span><span>{p.category||'General'}</span><span>{p.stock}</span><span>{min}</span><span><span className={`${styles.badge} ${p.stock<=0?styles.badgeRed:p.stock<=min?styles.badgeAmber:styles.badgeGreen}`}>{p.stock<=0?'Agotado':p.stock<=min?'Bajo':'Normal'}</span></span></div>})}</div></>}

function Reports({data}:{data:CommerceSnapshot}){const now=Date.now();const periods=[['Hoy',new Date().setHours(0,0,0,0)],['7 días',daysAgo(6)],['30 días',daysAgo(29)]] as const;return <><Head eyebrow="Análisis" title="Reportes" subtitle="Lectura directa de las ventas del tenant."/><div className={styles.reportGrid}>{periods.map(([label,start])=>{const rows=data.sales.filter(s=>new Date(s.date).getTime()>=start&&new Date(s.date).getTime()<=now);const total=rows.reduce((a,s)=>a+s.total,0);return <div className={styles.reportCard} key={label}><span>{label}</span><strong>{money.format(total)}</strong><small className={styles.muted}>{rows.length} operaciones · Ticket prom. {money.format(rows.length?total/rows.length:0)}</small></div>})}</div><div className={styles.spacer}/><div className={styles.panel}><div className={styles.panelTitle}><div><b>Medios de pago · últimos 30 días</b><small>Distribución de facturación</small></div></div>{payments.map(p=>{const rows=data.sales.filter(s=>new Date(s.date).getTime()>=daysAgo(29)&&s.payment===p);const total=rows.reduce((a,s)=>a+s.total,0);return <div className={styles.recentRow} key={p}><span className={styles.roundIcon}>%</span><div><b>{p}</b><small>{rows.length} operaciones</small></div><strong>{money.format(total)}</strong></div>})}</div></>}

function Customers({data}:{data:CommerceSnapshot}){const[q,setQ]=useState('');const rows=data.customers.filter(c=>`${c.name} ${c.phone||''} ${c.email||''} ${c.tax_id||''}`.toLowerCase().includes(q.toLowerCase()));return <><Head eyebrow="CRM" title="Clientes" subtitle={`${data.customers.length} clientes asociados al comercio.`}/><div className={styles.tableTools}><input className={styles.input} value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar nombre, teléfono, email o CUIT…"/></div><div className={`${styles.table} ${styles.customerTable}`}><div className={`${styles.tableRow} ${styles.tableHead}`}><span>Nombre</span><span>Teléfono</span><span>Email</span><span>CUIT/DNI</span></div>{rows.map(c=><div className={styles.tableRow} key={c.id}><span><b>{c.name}</b></span><span>{c.phone||'—'}</span><span>{c.email||'—'}</span><span>{c.tax_id||'—'}</span></div>)}</div></>}

function Cash({data,sessionSales,movements,cashEstimated,safeAction}:{data:CommerceSnapshot;sessionSales:Sale[];movements:CommerceSnapshot['cashMovements'];cashEstimated:number;safeAction:()=>void}){const salesTotal=sessionSales.reduce((a,s)=>a+s.total,0);const exp=movements.filter(m=>m.kind==='expense'||m.kind==='egress').reduce((a,m)=>a+m.amount,0);return <><Head eyebrow="Control de caja" title="Caja diaria" subtitle="Apertura, ventas, movimientos y saldo de la sesión."><button className={data.cashRegister?.status==='open'?styles.danger:styles.primary} onClick={safeAction}>{data.cashRegister?.status==='open'?'Cerrar caja':'Abrir caja'}</button></Head><div className={styles.cashHero}><div className={styles.cashStat}><span>Estado</span><strong>{data.cashRegister?.status==='open'?'Abierta':'Cerrada'}</strong></div><div className={styles.cashStat}><span>Apertura</span><strong>{money.format(Number(data.cashRegister?.opening_amount||0))}</strong></div><div className={styles.cashStat}><span>Ventas sesión</span><strong>{money.format(salesTotal)}</strong></div><div className={styles.cashStat}><span>Efectivo estimado</span><strong>{money.format(cashEstimated)}</strong></div></div><div className={styles.gridTwo}><div className={styles.panel}><div className={styles.panelTitle}><div><b>Ventas desde la apertura</b><small>{sessionSales.length} operaciones</small></div></div>{sessionSales.slice(0,20).map(s=><div className={styles.recentRow} key={s.id}><span className={styles.roundIcon}>$</span><div><b>{s.receiptNumber?`Factura ${receiptNumber(s)}`:`Venta #${s.id.slice(0,8)}`}</b><small>{new Date(s.date).toLocaleString('es-AR')} · {s.payment}</small></div><strong>{money.format(s.total)}</strong></div>)}</div><div className={styles.panel}><div className={styles.panelTitle}><div><b>Movimientos</b><small>Ingresos y egresos</small></div><strong>{money.format(exp)}</strong></div>{movements.slice(0,20).map(m=><div className={styles.recentRow} key={m.id}><span className={styles.roundIcon}>{m.kind==='income'?'+':'−'}</span><div><b>{m.note||m.kind}</b><small>{new Date(m.occurred_at).toLocaleString('es-AR')}</small></div><strong>{money.format(m.amount)}</strong></div>)}</div></div></>}

function Settings({data,device,saveDevice}:{data:CommerceSnapshot;device:DeviceSettings;saveDevice:(d:DeviceSettings)=>void}){const[draft,setDraft]=useState(device);useEffect(()=>setDraft(device),[device]);return <><Head eyebrow="Administración" title="Configuración" subtitle="Separada en datos del comercio y configuración de esta PC."><button className={styles.primary} onClick={()=>saveDevice(draft)}>Guardar dispositivo</button></Head><div className={styles.settingsGrid}><div className={styles.settingCard}><h3>Datos del comercio</h3><p>Estos datos vienen del tenant. En esta etapa se muestran sin editar para no tocar la base.</p><div className={styles.formGrid}><div className={styles.field}><label>Nombre</label><input className={styles.input} value={data.company.name} readOnly/></div><div className={styles.field}><label>CUIT</label><input className={styles.input} value={data.company.tax_id||''} readOnly placeholder="No informado"/></div></div></div><div className={styles.settingCard}><h3>ARCA</h3><p>El rediseño conserva la función fiscal actual detrás de un único servicio. No se modificaron certificados, CUIT, punto de venta ni la función de Supabase.</p><div className={styles.switchRow}><span>Estado del rediseño</span><span className={`${styles.badge} ${styles.badgeAmber}`}>Desactivado en vista previa</span></div><div className={styles.switchRow}><span>Comprobante</span><b>Factura C</b></div></div><div className={styles.settingCard}><h3>Impresora de esta PC</h3><p>Esto se guarda solamente en este navegador. No pertenece a la base multi-tenant.</p><div className={styles.formGrid}><div className={styles.field}><label>Papel</label><select className={styles.select} value={draft.paper} onChange={e=>setDraft({...draft,paper:e.target.value as '80'|'58'})}><option value="80">80 mm</option><option value="58">58 mm</option></select></div><div className={styles.field}><label>Modo</label><select className={styles.select} value={draft.printerMode} onChange={e=>setDraft({...draft,printerMode:e.target.value as 'browser'|'bridge'})}><option value="browser">Navegador</option><option value="bridge">Bridge local / silencioso</option></select></div><div className={styles.field}><label>Nombre impresora</label><input className={styles.input} value={draft.printerName} onChange={e=>setDraft({...draft,printerName:e.target.value})} placeholder="Se completa al conectar la térmica"/></div><div className={styles.field}><label>Copias</label><input className={styles.input} type="number" min="1" max="3" value={draft.receiptCopies} onChange={e=>setDraft({...draft,receiptCopies:Math.max(1,Math.min(3,Number(e.target.value)||1))})}/></div></div><div className={styles.switchRow}><span>Imprimir automáticamente después de ARCA</span><input className={styles.check} type="checkbox" checked={draft.autoPrint} onChange={e=>setDraft({...draft,autoPrint:e.target.checked})}/></div></div><div className={styles.settingCard}><h3>Arquitectura nueva</h3><p>React controla la interfaz; Supabase la persistencia; ARCA la capa fiscal; y la impresora queda como adaptador local. No hay scripts globales buscando botones por texto.</p><div className={styles.switchRow}><span>Multi-tenant</span><span className={`${styles.badge} ${styles.badgeGreen}`}>company_id</span></div><div className={styles.switchRow}><span>Vista Ventas</span><span className={`${styles.badge} ${styles.badgeGreen}`}>Paginada</span></div><div className={styles.switchRow}><span>Scripts legacy</span><span className={`${styles.badge} ${styles.badgeGreen}`}>No cargados</span></div></div></div></>}

function ReceiptModal({sale,data,device,close,onMessage}:{sale:Sale;data:CommerceSnapshot;device:DeviceSettings;close:()=>void;onMessage:(m:string)=>void}){async function print(){try{await printReceipt(sale,data.company,device)}catch(e){onMessage(e instanceof Error?e.message:String(e))}}return <div className={styles.modal} onMouseDown={e=>e.target===e.currentTarget&&close()}><div className={styles.modalCard}><div className={styles.modalHead}><div><h3>Factura C {receiptNumber(sale)}</h3><p>Comprobante fiscal guardado en la venta</p></div><button className={styles.secondary} onClick={close}>Cerrar</button></div><div className={styles.receiptMeta}><div><span>Total</span><b>{money.format(sale.total)}</b></div><div><span>Fecha</span><b>{new Date(sale.date).toLocaleString('es-AR')}</b></div><div><span>CAE</span><b>{sale.cae||'—'}</b></div><div><span>Vencimiento CAE</span><b>{sale.caeExpiration||'—'}</b></div></div><div className={styles.actions}><button className={styles.primary} onClick={()=>downloadReceiptPdf(sale,data.company)}>↓ Descargar PDF</button><button className={styles.secondary} onClick={print}>▣ Imprimir {device.paper} mm</button></div><div className={styles.notice} style={{marginTop:12}}>La impresión usa la configuración local de esta PC. El PDF se genera desde los datos ya guardados de la venta.</div></div></div>}
