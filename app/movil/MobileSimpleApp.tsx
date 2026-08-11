'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { loadCommerceSnapshot } from '@/lib/comercio/api'
import { readTenantSession, signInTenant } from '@/lib/comercio/session'
import type { CartLine, CommerceSnapshot, Product, TenantSession } from '@/lib/comercio/types'
import styles from './mobile.module.css'

type View = 'home' | 'sale' | 'products' | 'cash' | 'settings'
type PreviewSale = { total:number; payment:string; items:number }

const money = new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 })
const payments = ['Efectivo', 'Transferencia', 'Débito', 'Crédito', 'Mercado Pago']

function dayKey(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function clearSession(){
  ;['cl_access_token','cl_refresh_token','cl_company_id','cl_company_name','cl_user_role','cl_user_permissions'].forEach(key=>localStorage.removeItem(key))
}
function previewProductKey(companyId:string){ return `cl_mobile_preview_products_${companyId}` }
function stockKey(companyId:string){ return `cl_mobile_stock_${companyId}` }

export default function MobileSimpleApp(){
  const [session,setSession]=useState<TenantSession|null>(null)
  const [data,setData]=useState<CommerceSnapshot|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [view,setView]=useState<View>('home')
  const [query,setQuery]=useState('')
  const [cart,setCart]=useState<CartLine[]>([])
  const [payment,setPayment]=useState('Efectivo')
  const [previewSales,setPreviewSales]=useState<PreviewSale[]>([])
  const [previewProducts,setPreviewProducts]=useState<Product[]>([])
  const [toast,setToast]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loginBusy,setLoginBusy]=useState(false)
  const [stockEnabled,setStockEnabled]=useState(false)
  const [createOpen,setCreateOpen]=useState(false)
  const [newName,setNewName]=useState('')
  const [newPrice,setNewPrice]=useState('')
  const [newCategory,setNewCategory]=useState('')
  const [newStock,setNewStock]=useState('')

  function loadLocalPreferences(s:TenantSession){
    setStockEnabled(localStorage.getItem(stockKey(s.companyId))==='1')
    try{
      const parsed=JSON.parse(localStorage.getItem(previewProductKey(s.companyId))||'[]')
      setPreviewProducts(Array.isArray(parsed)?parsed:[])
    }catch{ setPreviewProducts([]) }
  }

  async function load(s:TenantSession){
    setLoading(true);setError('')
    try{ setData(await loadCommerceSnapshot(s)) }
    catch(e){ setError(e instanceof Error?e.message:String(e)) }
    finally{ setLoading(false) }
  }

  useEffect(()=>{
    const s=readTenantSession()
    setSession(s)
    if(s){ loadLocalPreferences(s); void load(s) }
    else setLoading(false)
  },[])

  const allProducts=useMemo(()=>[...previewProducts,...(data?.products||[])],[previewProducts,data])
  const today=dayKey(new Date())
  const todaySales=useMemo(()=>data?.sales.filter(sale=>dayKey(sale.date)===today)||[],[data,today])
  const actualTotal=useMemo(()=>todaySales.reduce((sum,sale)=>sum+sale.total,0),[todaySales])
  const previewTotal=useMemo(()=>previewSales.reduce((sum,sale)=>sum+sale.total,0),[previewSales])
  const todayTotal=actualTotal+previewTotal
  const todayCount=todaySales.length+previewSales.length
  const cartTotal=useMemo(()=>cart.reduce((sum,item)=>sum+item.price*item.qty,0),[cart])
  const cartItems=useMemo(()=>cart.reduce((sum,item)=>sum+item.qty,0),[cart])
  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase()
    if(!q)return allProducts.slice(0,60)
    return allProducts.filter(product=>`${product.name} ${product.barcode||''} ${product.category||''}`.toLowerCase().includes(q)).slice(0,60)
  },[allProducts,query])
  const paymentTotals=useMemo(()=>{
    const totals=new Map<string,number>()
    todaySales.forEach(sale=>totals.set(sale.payment,(totals.get(sale.payment)||0)+sale.total))
    previewSales.forEach(sale=>totals.set(sale.payment,(totals.get(sale.payment)||0)+sale.total))
    return Array.from(totals.entries()).sort((a,b)=>b[1]-a[1])
  },[todaySales,previewSales])

  function showToast(message:string,ms=1800){ setToast(message); window.setTimeout(()=>setToast(''),ms) }

  function addProduct(id:string){
    const product=allProducts.find(item=>item.id===id)
    if(!product)return
    if(stockEnabled && Number(product.stock||0)<=0){ showToast('Ese producto está sin stock.'); return }
    setCart(rows=>{
      const current=rows.find(item=>item.id===id)
      if(current){
        if(stockEnabled && current.qty>=Number(product.stock||0)){ showToast('No hay más stock disponible.'); return rows }
        return rows.map(item=>item.id===id?{...item,qty:item.qty+1}:item)
      }
      return [...rows,{...product,qty:1}]
    })
    showToast(`${product.name} agregado`,1000)
  }

  function changeQty(id:string,delta:number){
    setCart(rows=>rows.map(item=>{
      if(item.id!==id)return item
      const max=stockEnabled?Math.max(0,Number(item.stock||0)):999999
      return {...item,qty:Math.max(0,Math.min(max,item.qty+delta))}
    }).filter(item=>item.qty>0))
  }

  function simulateInvoice(){
    if(!cart.length||cartTotal<=0)return
    setPreviewSales(rows=>[...rows,{total:cartTotal,payment,items:cartItems}])
    setCart([]);setPayment('Efectivo');setQuery('');setView('home')
    showToast('✓ Venta simulada. No se modificaron datos reales.',3200)
  }

  function createPreviewProduct(event:FormEvent){
    event.preventDefault()
    if(!session)return
    const name=newName.trim()
    const price=Math.max(0,Number(String(newPrice).replace(',','.'))||0)
    if(!name||price<=0){ showToast('Completá nombre y precio.'); return }
    const product:Product={
      id:`preview-${Date.now()}`,
      name,
      price,
      stock:stockEnabled?Math.max(0,Number(newStock)||0):0,
      category:newCategory.trim()||'General',
      active:true,
    }
    const next=[product,...previewProducts]
    setPreviewProducts(next)
    localStorage.setItem(previewProductKey(session.companyId),JSON.stringify(next))
    setNewName('');setNewPrice('');setNewCategory('');setNewStock('');setCreateOpen(false)
    showToast('✓ Producto creado en la preview.',2400)
  }

  function toggleStock(){
    if(!session)return
    const next=!stockEnabled
    setStockEnabled(next)
    localStorage.setItem(stockKey(session.companyId),next?'1':'0')
    showToast(next?'Stock activado.':'Stock desactivado.')
  }

  async function login(event:FormEvent){
    event.preventDefault();if(loginBusy)return
    setLoginBusy(true);setError('')
    try{
      const s=await signInTenant(email,password)
      setSession(s);loadLocalPreferences(s);await load(s)
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setLoginBusy(false)}
  }

  function logout(){
    if(!window.confirm('¿Desea salir?'))return
    clearSession();setSession(null);setData(null);setView('home')
  }

  if(!session)return <main className={styles.loginScreen}><div className={styles.loginCard}>
    <div className={styles.logo}>CL</div><span className={styles.previewTag}>PREVIEW</span>
    <h1>Comercio Lleno Móvil</h1><p>La versión simple para vender y facturar desde el celular.</p>
    <form onSubmit={login}><label>Usuario o email</label><input value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" placeholder="tu@email.com"/><label>Contraseña</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••"/>{error&&<div className={styles.loginError}>{error}</div>}<button className={styles.loginButton} disabled={loginBusy}>{loginBusy?'Ingresando…':'Entrar'}</button></form>
    <small>Preview segura: muestra datos reales, pero las ventas y productos creados acá no modifican producción.</small>
  </div></main>

  if(loading)return <main className={styles.loading}><div className={styles.loader}/><b>Cargando tu comercio…</b></main>

  return <main className={styles.app}><div className={styles.phoneShell}>
    <header className={styles.topbar}>
      <div className={styles.brandBlock}><div className={styles.logoSmall}>CL</div><div><b>Comercio Lleno</b><span>{data?.company.name||session.companyName}</span></div></div>
      <button className={styles.settingsButton} onClick={()=>setView('settings')} aria-label="Configuración">⚙</button>
    </header>

    <div className={styles.planStrip}><span>Plan Simple · Preview</span></div>
    {error&&<div className={styles.errorBar}>{error}<button onClick={()=>setError('')}>×</button></div>}
    {toast&&<div className={styles.toast}>{toast}</div>}

    <section className={styles.content}>
      {view==='home'&&<>
        <div className={styles.greeting}><div><span>Hoy</span><h1>{money.format(todayTotal)}</h1><p>{todayCount} venta{todayCount===1?'':'s'} registrada{todayCount===1?'':'s'}</p></div><div className={styles.autoCash}><i>✓</i><span>Caja<br/><b>automática</b></span></div></div>
        <button className={styles.saleHero} onClick={()=>setView('sale')}><span className={styles.plus}>+</span><span><b>Nueva venta</b><small>Elegí productos y facturá</small></span><i>›</i></button>
        <div className={styles.bigGrid}>
          <button className={styles.bigAction} onClick={()=>setView('products')}><span className={styles.actionIcon}>▦</span><b>Productos</b><small>Ver y crear productos</small></button>
          <button className={styles.bigAction} onClick={()=>setView('cash')}><span className={styles.actionIcon}>$</span><b>Movimientos</b><small>Resumen de lo vendido hoy</small></button>
        </div>
        <div className={styles.summaryCard}><div className={styles.cardHead}><div><span>RESUMEN DE HOY</span><b>Cómo viene el día</b></div><button onClick={()=>setView('cash')}>Ver todo</button></div><div className={styles.summaryRow}><span>Ventas</span><b>{todayCount}</b></div><div className={styles.summaryRow}><span>Total vendido</span><b>{money.format(todayTotal)}</b></div><div className={styles.summaryRow}><span>Productos</span><b>{allProducts.length}</b></div></div>
      </>}

      {view==='sale'&&<>
        <div className={styles.sectionHead}><button onClick={()=>setView('home')}>‹</button><div><span>VENTA RÁPIDA</span><h2>Nueva venta</h2></div><div className={styles.cartCount}>{cartItems}</div></div>
        <div className={styles.searchBox}><span>⌕</span><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar producto…"/></div>
        <div className={styles.productPicker}>{filtered.length?filtered.map(product=><button className={styles.productItem} key={product.id} onClick={()=>addProduct(product.id)}><div><b>{product.name}</b><small>{product.category||'General'}{stockEnabled?` · Stock ${product.stock}`:''}</small></div><strong>{money.format(product.price)}</strong><span>+</span></button>):<div className={styles.empty}>No encontramos productos.</div>}</div>
        <div className={styles.cartCard}><div className={styles.cartTitle}><div><span>VENTA ACTUAL</span><b>{cartItems?`${cartItems} ítem${cartItems===1?'':'s'}`:'Sin productos'}</b></div>{cart.length>0&&<button onClick={()=>setCart([])}>Vaciar</button>}</div>
          {cart.length?<div className={styles.cartLines}>{cart.map(item=><div className={styles.cartLine} key={item.id}><div className={styles.cartName}><b>{item.name}</b><small>{money.format(item.price)} c/u</small></div><div className={styles.qty}><button onClick={()=>changeQty(item.id,-1)}>−</button><b>{item.qty}</b><button onClick={()=>changeQty(item.id,1)}>+</button></div><strong>{money.format(item.price*item.qty)}</strong></div>)}</div>:<div className={styles.emptyCart}>Tocá un producto para empezar.</div>}
          <label className={styles.paymentLabel}>Medio de pago</label><div className={styles.paymentGrid}>{payments.map(item=><button key={item} onClick={()=>setPayment(item)} className={payment===item?styles.paymentActive:''}>{item}</button>)}</div><div className={styles.totalRow}><span>Total</span><b>{money.format(cartTotal)}</b></div><button className={styles.invoiceButton} disabled={!cart.length} onClick={simulateInvoice}>Facturar {cart.length?money.format(cartTotal):''}</button><small className={styles.demoNote}>Preview: el cobro se simula y no afecta producción.</small>
        </div>
      </>}

      {view==='products'&&<>
        <div className={styles.sectionHead}><button onClick={()=>setView('home')}>‹</button><div><span>CATÁLOGO</span><h2>Productos</h2></div><div className={styles.countBubble}>{allProducts.length}</div></div>
        <button className={styles.createProductButton} onClick={()=>setCreateOpen(true)}><span>＋</span><b>Crear producto</b></button>
        <div className={styles.searchBox}><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar producto…"/></div>
        <div className={styles.catalogList}>{filtered.map(product=><div className={styles.catalogRow} key={product.id}><div><b>{product.name}</b><small>{product.category||'General'}{stockEnabled?` · Stock ${product.stock}`:''}</small></div><strong>{money.format(product.price)}</strong></div>)}</div>
        {!allProducts.length&&<div className={styles.emptyState}><span>▦</span><b>Todavía no hay productos</b><p>Creá el primero desde el botón de arriba.</p></div>}
      </>}

      {view==='cash'&&<>
        <div className={styles.sectionHead}><button onClick={()=>setView('home')}>‹</button><div><span>HOY</span><h2>Movimientos</h2></div><div className={styles.autoMini}>Auto</div></div>
        <div className={styles.cashHero}><span>Total vendido hoy</span><h2>{money.format(todayTotal)}</h2><p>{todayCount} venta{todayCount===1?'':'s'} · sin abrir ni cerrar caja</p></div>
        <div className={styles.summaryCard}><div className={styles.cardHead}><div><span>POR MEDIO DE PAGO</span><b>Distribución</b></div></div>{paymentTotals.length?paymentTotals.map(([name,amount])=><div className={styles.summaryRow} key={name}><span>{name}</span><b>{money.format(amount)}</b></div>):<div className={styles.emptyInline}>Todavía no hubo ventas hoy.</div>}</div>
        <div className={styles.summaryCard}><div className={styles.cardHead}><div><span>ÚLTIMAS VENTAS</span><b>Actividad reciente</b></div></div>{todaySales.slice(0,8).map(sale=><div className={styles.saleHistory} key={sale.id}><div><b>{new Date(sale.date).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</b><small>{sale.payment}</small></div><strong>{money.format(sale.total)}</strong></div>)}{previewSales.slice().reverse().slice(0,4).map((sale,index)=><div className={styles.saleHistory} key={`preview-${index}`}><div><b>Ahora</b><small>{sale.payment} · preview</small></div><strong>{money.format(sale.total)}</strong></div>)}</div>
      </>}

      {view==='settings'&&<>
        <div className={styles.sectionHead}><button onClick={()=>setView('home')}>‹</button><div><span>BÁSICO</span><h2>Configuración</h2></div><div className={styles.settingsMini}>⚙</div></div>
        <div className={styles.settingsCard}>
          <div className={styles.settingRow}><div><b>Control de stock</b><p>{stockEnabled?'Se muestran existencias y se limita la cantidad disponible.':'Vendé sin cargar ni controlar existencias.'}</p></div><button className={`${styles.switch} ${stockEnabled?styles.switchOn:''}`} onClick={toggleStock} aria-label="Activar o desactivar stock"><span/></button></div>
          <div className={styles.settingStatus}><span>Estado actual</span><b>{stockEnabled?'Stock activado':'Stock desactivado'}</b></div>
        </div>
        <div className={styles.settingsCard}><div className={styles.settingInfo}><span>PLAN SIMPLE</span><b>La versión simple no te limita</b><p>Si alguna vez necesitás reportes avanzados, proveedores, usuarios o más herramientas, podés seguir usando la versión completa.</p><button onClick={()=>location.href='/redesign'}>Abrir versión completa</button></div></div>
      </>}
    </section>

    <nav className={styles.bottomNav}>
      <button className={view==='home'?styles.navActive:''} onClick={()=>setView('home')}><span>⌂</span><b>Inicio</b></button>
      <button className={view==='sale'?styles.navActive:''} onClick={()=>setView('sale')}><span>＋</span><b>Venta</b></button>
      <button className={view==='products'?styles.navActive:''} onClick={()=>setView('products')}><span>▦</span><b>Productos</b></button>
      <button className={view==='cash'?styles.navActive:''} onClick={()=>setView('cash')}><span>$</span><b>Movimientos</b></button>
      <button className={styles.logoutNav} onClick={logout}><span>↪</span><b>Salir</b></button>
    </nav>

    {createOpen&&<div className={styles.modalBackdrop} onMouseDown={e=>{if(e.target===e.currentTarget)setCreateOpen(false)}}><form className={styles.modalCard} onSubmit={createPreviewProduct}><div className={styles.modalHead}><div><span>NUEVO</span><h3>Crear producto</h3></div><button type="button" onClick={()=>setCreateOpen(false)}>×</button></div><label>Nombre</label><input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Ej: Corte de pelo"/><label>Precio</label><input inputMode="decimal" value={newPrice} onChange={e=>setNewPrice(e.target.value)} placeholder="$ 0"/><label>Categoría <small>opcional</small></label><input value={newCategory} onChange={e=>setNewCategory(e.target.value)} placeholder="Ej: Servicios"/>{stockEnabled&&<><label>Stock inicial</label><input inputMode="numeric" value={newStock} onChange={e=>setNewStock(e.target.value)} placeholder="0"/></>}<button className={styles.saveProduct} type="submit">Crear producto</button><small className={styles.demoNote}>En esta preview se guarda solo en este navegador.</small></form></div>}
  </div></main>
}
