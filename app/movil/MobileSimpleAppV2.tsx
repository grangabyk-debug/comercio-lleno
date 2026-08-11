'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { loadCommerceSnapshot } from '@/lib/comercio/api'
import { readTenantSession, signInTenant } from '@/lib/comercio/session'
import type { CartLine, CommerceSnapshot, Product, TenantSession } from '@/lib/comercio/types'
import styles from './mobile.module.css'

type View = 'home' | 'sale' | 'products' | 'cash' | 'settings'
type PreviewSale = { total:number; payment:string; items:number }
type InvoiceLine = { name:string; qty:number; price:number }
type PreviewInvoice = { id:string; date:string; company:string; payment:string; total:number; items:InvoiceLine[] }

const money = new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 })
const payments = ['Efectivo', 'Transferencia', 'Débito', 'Crédito', 'Mercado Pago']

function dayKey(date:Date|string){
  const d=typeof date==='string'?new Date(date):date
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function clearSession(){
  ;['cl_access_token','cl_refresh_token','cl_company_id','cl_company_name','cl_user_role','cl_user_permissions'].forEach(key=>localStorage.removeItem(key))
}
function previewProductKey(companyId:string){return `cl_mobile_preview_products_${companyId}`}
function stockKey(companyId:string){return `cl_mobile_stock_${companyId}`}
function ascii(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,' ')}
function pdfEscape(value:string){return ascii(value).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
function invoicePdf(invoice:PreviewInvoice){
  const lines=[
    'COMERCIO LLENO - FACTURA PREVIEW',
    invoice.company,
    `Comprobante: ${invoice.id}`,
    `Fecha: ${new Date(invoice.date).toLocaleString('es-AR')}`,
    `Medio de pago: ${invoice.payment}`,
    '------------------------------------------',
    ...invoice.items.map(item=>`${item.qty} x ${item.name}  $${Math.round(item.price*item.qty)}`),
    '------------------------------------------',
    `TOTAL  $${Math.round(invoice.total)}`,
    '',
    'Documento generado para probar el flujo mobile.',
    'No es un comprobante fiscal real.',
  ]
  const stream=lines.map((line,index)=>{
    const size=index===0?17:index===8?15:10
    const y=800-index*24
    return `BT /F1 ${size} Tf 48 ${y} Td (${pdfEscape(line)}) Tj ET`
  }).join('\n')
  const objects=[
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf='%PDF-1.4\n'
  const offsets=[0]
  objects.forEach((object,index)=>{offsets[index+1]=pdf.length;pdf+=`${index+1} 0 obj\n${object}\nendobj\n`})
  const xref=pdf.length
  pdf+='xref\n0 6\n0000000000 65535 f \n'
  pdf+=offsets.slice(1).map(offset=>`${String(offset).padStart(10,'0')} 00000 n \n`).join('')
  pdf+=`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([pdf],{type:'application/pdf'})
}

export default function MobileSimpleAppV2(){
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

  const [productOpen,setProductOpen]=useState(false)
  const [editingId,setEditingId]=useState<string|null>(null)
  const [productName,setProductName]=useState('')
  const [productPrice,setProductPrice]=useState('')
  const [productCategory,setProductCategory]=useState('')
  const [productStock,setProductStock]=useState('')

  const [extraOpen,setExtraOpen]=useState(false)
  const [extraAmount,setExtraAmount]=useState('')
  const [extraDetail,setExtraDetail]=useState('')

  const [invoice,setInvoice]=useState<PreviewInvoice|null>(null)
  const [shareChoices,setShareChoices]=useState(false)

  function showToast(message:string,ms=1800){setToast(message);window.setTimeout(()=>setToast(''),ms)}
  function saveLocalProducts(next:Product[]){
    setPreviewProducts(next)
    if(session)localStorage.setItem(previewProductKey(session.companyId),JSON.stringify(next))
  }
  function loadLocalPreferences(s:TenantSession){
    setStockEnabled(localStorage.getItem(stockKey(s.companyId))==='1')
    try{
      const parsed=JSON.parse(localStorage.getItem(previewProductKey(s.companyId))||'[]')
      setPreviewProducts(Array.isArray(parsed)?parsed:[])
    }catch{setPreviewProducts([])}
  }
  async function load(s:TenantSession){
    setLoading(true);setError('')
    try{setData(await loadCommerceSnapshot(s))}
    catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setLoading(false)}
  }

  useEffect(()=>{
    const s=readTenantSession()
    setSession(s)
    if(s){loadLocalPreferences(s);void load(s)}else setLoading(false)
  },[])

  const allProducts=useMemo(()=>{
    const map=new Map<string,Product>()
    previewProducts.forEach(product=>map.set(product.id,product))
    ;(data?.products||[]).forEach(product=>{if(!map.has(product.id))map.set(product.id,product)})
    return Array.from(map.values())
  },[previewProducts,data])
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

  function addProduct(id:string){
    const product=allProducts.find(item=>item.id===id)
    if(!product)return
    if(stockEnabled&&Number(product.stock||0)<=0){showToast('Ese producto está sin stock.');return}
    setCart(rows=>{
      const current=rows.find(item=>item.id===id)
      if(current){
        if(stockEnabled&&current.qty>=Number(product.stock||0)){showToast('No hay más stock disponible.');return rows}
        return rows.map(item=>item.id===id?{...item,qty:item.qty+1}:item)
      }
      return [...rows,{...product,qty:1}]
    })
    showToast(`${product.name} agregado`,1000)
  }
  function changeQty(id:string,delta:number){
    setCart(rows=>rows.map(item=>{
      if(item.id!==id)return item
      const max=item.id.startsWith('extra-')?999999:stockEnabled?Math.max(0,Number(item.stock||0)):999999
      return {...item,qty:Math.max(0,Math.min(max,item.qty+delta))}
    }).filter(item=>item.qty>0))
  }

  function openCreateProduct(){
    setEditingId(null);setProductName('');setProductPrice('');setProductCategory('');setProductStock('');setProductOpen(true)
  }
  function openEditProduct(product:Product){
    setEditingId(product.id);setProductName(product.name);setProductPrice(String(product.price));setProductCategory(product.category||'');setProductStock(String(product.stock||0));setProductOpen(true)
  }
  function saveProduct(event:FormEvent){
    event.preventDefault()
    const name=productName.trim()
    const price=Math.max(0,Number(productPrice.replace(',','.'))||0)
    if(!name||price<=0){showToast('Completá nombre y precio.');return}
    if(editingId){
      const current=allProducts.find(product=>product.id===editingId)
      if(!current)return
      const updated:Product={...current,name,price,category:productCategory.trim()||'General',stock:stockEnabled?Math.max(0,Number(productStock)||0):Number(current.stock||0),active:true}
      saveLocalProducts([updated,...previewProducts.filter(product=>product.id!==editingId)])
      showToast('✓ Producto actualizado en la preview.',2300)
    }else{
      const created:Product={id:`preview-${Date.now()}`,name,price,category:productCategory.trim()||'General',stock:stockEnabled?Math.max(0,Number(productStock)||0):0,active:true}
      saveLocalProducts([created,...previewProducts])
      showToast('✓ Producto creado en la preview.',2300)
    }
    setProductOpen(false)
  }

  function addExtra(event:FormEvent){
    event.preventDefault()
    const price=Math.max(0,Number(extraAmount.replace(',','.'))||0)
    if(price<=0){showToast('Ingresá un importe.');return}
    const item:CartLine={id:`extra-${Date.now()}`,name:extraDetail.trim()||'Extra',price,stock:999999,category:'Extra',active:true,qty:1}
    setCart(rows=>[...rows,item])
    setExtraAmount('');setExtraDetail('');setExtraOpen(false)
    showToast(`${item.name} agregado`,1200)
  }

  function finishSale(){
    if(!cart.length||cartTotal<=0)return
    const next:PreviewInvoice={
      id:`PV-${Date.now().toString().slice(-7)}`,
      date:new Date().toISOString(),
      company:data?.company.name||session?.companyName||'Comercio Lleno',
      payment,
      total:cartTotal,
      items:cart.map(item=>({name:item.name,qty:item.qty,price:item.price})),
    }
    setPreviewSales(rows=>[...rows,{total:cartTotal,payment,items:cartItems}])
    setInvoice(next);setShareChoices(false)
    setCart([]);setPayment('Efectivo');setQuery('')
  }
  function downloadInvoice(current=invoice){
    if(!current)return
    const url=URL.createObjectURL(invoicePdf(current))
    const anchor=document.createElement('a')
    anchor.href=url;anchor.download=`Factura-${current.id}.pdf`;anchor.click()
    window.setTimeout(()=>URL.revokeObjectURL(url),1500)
  }
  async function shareInvoice(channel:'whatsapp'|'email'){
    if(!invoice)return
    const blob=invoicePdf(invoice)
    const file=new File([blob],`Factura-${invoice.id}.pdf`,{type:'application/pdf'})
    const text=`Hola, te envío la factura de ${invoice.company} por ${money.format(invoice.total)}.`
    const canShareFiles=typeof navigator.canShare==='function'&&navigator.canShare({files:[file]})
    if(typeof navigator.share==='function'&&canShareFiles){
      try{
        showToast(channel==='whatsapp'?'Elegí WhatsApp y luego el contacto.':'Elegí tu app de correo.',2600)
        await navigator.share({title:`Factura ${invoice.id}`,text,files:[file]})
        return
      }catch(e){if(e instanceof DOMException&&e.name==='AbortError')return}
    }
    downloadInvoice(invoice)
    if(channel==='whatsapp'){
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\nEl PDF quedó descargado para adjuntarlo.`)}`,'_blank')
      showToast('El navegador no permite adjuntar el PDF directo. Lo descargamos para que lo adjuntes en WhatsApp.',4200)
    }else{
      location.href=`mailto:?subject=${encodeURIComponent(`Factura ${invoice.id}`)}&body=${encodeURIComponent(`${text}\nEl PDF quedó descargado para adjuntarlo.`)}`
      showToast('El PDF quedó descargado para adjuntarlo al email.',3500)
    }
  }
  function closeInvoice(){setInvoice(null);setShareChoices(false);setView('home')}

  function toggleStock(){
    if(!session)return
    const next=!stockEnabled
    setStockEnabled(next);localStorage.setItem(stockKey(session.companyId),next?'1':'0')
    showToast(next?'Stock activado.':'Stock desactivado.')
  }
  async function login(event:FormEvent){
    event.preventDefault();if(loginBusy)return
    setLoginBusy(true);setError('')
    try{const s=await signInTenant(email,password);setSession(s);loadLocalPreferences(s);await load(s)}
    catch(e){setError(e instanceof Error?e.message:String(e))}
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
    <small>Preview segura: muestra datos reales, pero las ventas y cambios hechos acá no modifican producción.</small>
  </div></main>

  if(loading)return <main className={styles.loading}><div className={styles.loader}/><b>Cargando tu comercio…</b></main>

  return <main className={styles.app}><div className={styles.phoneShell}>
    <header className={styles.topbar}><div className={styles.brandBlock}><div className={styles.logoSmall}>CL</div><div><b>Comercio Lleno</b><span>{data?.company.name||session.companyName}</span></div></div><button className={styles.settingsButton} onClick={()=>setView('settings')} aria-label="Configuración">⚙</button></header>
    <div className={styles.planStrip}><span>Plan Simple · Preview</span></div>
    {error&&<div className={styles.errorBar}>{error}<button onClick={()=>setError('')}>×</button></div>}
    {toast&&<div className={styles.toast}>{toast}</div>}

    <section className={styles.content}>
      {view==='home'&&<>
        <div className={styles.greeting}><div><span>Hoy</span><h1>{money.format(todayTotal)}</h1><p>{todayCount} venta{todayCount===1?'':'s'} registrada{todayCount===1?'':'s'}</p></div><div className={styles.autoCash}><i>✓</i><span>Caja<br/><b>automática</b></span></div></div>
        <button className={styles.saleHero} onClick={()=>setView('sale')}><span className={styles.plus}>+</span><span><b>Nueva venta</b><small>Elegí productos y facturá</small></span><i>›</i></button>
        <div className={styles.bigGrid}><button className={styles.bigAction} onClick={()=>setView('products')}><span className={styles.actionIcon}>▦</span><b>Productos</b><small>Ver, crear y editar</small></button><button className={styles.bigAction} onClick={()=>setView('cash')}><span className={styles.actionIcon}>$</span><b>Movimientos</b><small>Resumen de lo vendido hoy</small></button></div>
        <div className={styles.summaryCard}><div className={styles.cardHead}><div><span>RESUMEN DE HOY</span><b>Cómo viene el día</b></div><button onClick={()=>setView('cash')}>Ver todo</button></div><div className={styles.summaryRow}><span>Ventas</span><b>{todayCount}</b></div><div className={styles.summaryRow}><span>Total vendido</span><b>{money.format(todayTotal)}</b></div><div className={styles.summaryRow}><span>Productos</span><b>{allProducts.length}</b></div></div>
      </>}

      {view==='sale'&&<>
        <div className={styles.sectionHead}><button onClick={()=>setView('home')}>‹</button><div><span>VENTA RÁPIDA</span><h2>Nueva venta</h2></div><div className={styles.cartCount}>{cartItems}</div></div>
        <div className={styles.searchBox}><span>⌕</span><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar producto…"/></div>
        <button className={styles.createProductButton} style={{background:'#fff',color:'#14784a',border:'1px solid #d8e7df',boxShadow:'none',minHeight:46}} onClick={()=>setExtraOpen(true)}><span>＋</span><b>Agregar extra · importe libre</b></button>
        <div className={styles.productPicker}>{filtered.length?filtered.map(product=><button className={styles.productItem} key={product.id} onClick={()=>addProduct(product.id)}><div><b>{product.name}</b><small>{product.category||'General'}{stockEnabled?` · Stock ${product.stock}`:''}</small></div><strong>{money.format(product.price)}</strong><span>+</span></button>):<div className={styles.empty}>No encontramos productos.</div>}</div>
        <div className={styles.cartCard}><div className={styles.cartTitle}><div><span>VENTA ACTUAL</span><b>{cartItems?`${cartItems} ítem${cartItems===1?'':'s'}`:'Sin productos'}</b></div>{cart.length>0&&<button onClick={()=>setCart([])}>Vaciar</button>}</div>
          {cart.length?<div className={styles.cartLines}>{cart.map(item=><div className={styles.cartLine} key={item.id}><div className={styles.cartName}><b>{item.name}</b><small>{money.format(item.price)} c/u</small></div><div className={styles.qty}><button onClick={()=>changeQty(item.id,-1)}>−</button><b>{item.qty}</b><button onClick={()=>changeQty(item.id,1)}>+</button></div><strong>{money.format(item.price*item.qty)}</strong></div>)}</div>:<div className={styles.emptyCart}>Tocá un producto o agregá un extra.</div>}
          <label className={styles.paymentLabel}>Medio de pago</label><div className={styles.paymentGrid}>{payments.map(item=><button key={item} onClick={()=>setPayment(item)} className={payment===item?styles.paymentActive:''}>{item}</button>)}</div><div className={styles.totalRow}><span>Total</span><b>{money.format(cartTotal)}</b></div><button className={styles.invoiceButton} disabled={!cart.length} onClick={finishSale}>Facturar {cart.length?money.format(cartTotal):''}</button><small className={styles.demoNote}>Preview: la venta se simula. El PDF sí se genera para probar descarga y envío.</small>
        </div>
      </>}

      {view==='products'&&<>
        <div className={styles.sectionHead}><button onClick={()=>setView('home')}>‹</button><div><span>CATÁLOGO</span><h2>Productos</h2></div><div className={styles.countBubble}>{allProducts.length}</div></div>
        <button className={styles.createProductButton} onClick={openCreateProduct}><span>＋</span><b>Crear producto</b></button>
        <div className={styles.searchBox}><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar producto…"/></div>
        <div className={styles.catalogList}>{filtered.map(product=><button className={styles.catalogRow} style={{cursor:'pointer',font:'inherit',color:'inherit',textAlign:'left'}} key={product.id} onClick={()=>openEditProduct(product)}><div><b>{product.name}</b><small>{product.category||'General'}{stockEnabled?` · Stock ${product.stock}`:''}</small></div><div style={{textAlign:'right'}}><strong>{money.format(product.price)}</strong><small style={{display:'block'}}>Tocar para editar</small></div></button>)}</div>
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
        <div className={styles.settingsCard}><div className={styles.settingRow}><div><b>Control de stock</b><p>{stockEnabled?'Se muestran existencias y se limita la cantidad disponible.':'Vendé sin cargar ni controlar existencias.'}</p></div><button className={`${styles.switch} ${stockEnabled?styles.switchOn:''}`} onClick={toggleStock} aria-label="Activar o desactivar stock"><span/></button></div><div className={styles.settingStatus}><span>Estado actual</span><b>{stockEnabled?'Stock activado':'Stock desactivado'}</b></div></div>
        <div className={styles.settingsCard}><div className={styles.settingInfo}><span>PLAN SIMPLE</span><b>La versión simple no te limita</b><p>Si alguna vez necesitás reportes avanzados, proveedores, usuarios o más herramientas, podés seguir usando la versión completa.</p><button onClick={()=>location.href='/redesign'}>Abrir versión completa</button></div></div>
      </>}
    </section>

    <nav className={styles.bottomNav}><button className={view==='home'?styles.navActive:''} onClick={()=>setView('home')}><span>⌂</span><b>Inicio</b></button><button className={view==='sale'?styles.navActive:''} onClick={()=>setView('sale')}><span>＋</span><b>Venta</b></button><button className={view==='products'?styles.navActive:''} onClick={()=>setView('products')}><span>▦</span><b>Productos</b></button><button className={view==='cash'?styles.navActive:''} onClick={()=>setView('cash')}><span>$</span><b>Movimientos</b></button><button className={styles.logoutNav} onClick={logout}><span>↪</span><b>Salir</b></button></nav>

    {productOpen&&<div className={styles.modalBackdrop} onMouseDown={e=>{if(e.target===e.currentTarget)setProductOpen(false)}}><form className={styles.modalCard} onSubmit={saveProduct}><div className={styles.modalHead}><div><span>{editingId?'EDITAR':'NUEVO'}</span><h3>{editingId?'Editar producto':'Crear producto'}</h3></div><button type="button" onClick={()=>setProductOpen(false)}>×</button></div><label>Nombre</label><input autoFocus value={productName} onChange={e=>setProductName(e.target.value)} placeholder="Ej: Corte de pelo"/><label>Precio</label><input inputMode="decimal" value={productPrice} onChange={e=>setProductPrice(e.target.value)} placeholder="$ 0"/><label>Categoría <small>opcional</small></label><input value={productCategory} onChange={e=>setProductCategory(e.target.value)} placeholder="Ej: Servicios"/>{stockEnabled&&<><label>Stock</label><input inputMode="numeric" value={productStock} onChange={e=>setProductStock(e.target.value)} placeholder="0"/></>}<button className={styles.saveProduct} type="submit">{editingId?'Guardar cambios':'Crear producto'}</button><small className={styles.demoNote}>En esta preview los cambios se guardan solo en este navegador.</small></form></div>}

    {extraOpen&&<div className={styles.modalBackdrop} onMouseDown={e=>{if(e.target===e.currentTarget)setExtraOpen(false)}}><form className={styles.modalCard} onSubmit={addExtra}><div className={styles.modalHead}><div><span>VENTA RÁPIDA</span><h3>Agregar extra</h3></div><button type="button" onClick={()=>setExtraOpen(false)}>×</button></div><label>Importe</label><input autoFocus inputMode="decimal" value={extraAmount} onChange={e=>setExtraAmount(e.target.value)} placeholder="$ 0"/><label>Detalle <small>opcional</small></label><input value={extraDetail} onChange={e=>setExtraDetail(e.target.value)} placeholder="Extra"/><button className={styles.saveProduct} type="submit">Agregar a la venta</button><small className={styles.demoNote}>Si no escribís detalle, queda como “Extra”.</small></form></div>}

    {invoice&&<div className={styles.modalBackdrop}><div className={styles.modalCard}><div style={{textAlign:'center',padding:'8px 0 14px'}}><div style={{width:52,height:52,borderRadius:18,display:'grid',placeItems:'center',background:'#e9f7ef',color:'#158653',fontSize:26,fontWeight:900,margin:'0 auto 10px'}}>✓</div><span style={{fontSize:9,fontWeight:900,color:'#728078',letterSpacing:'.08em'}}>VENTA FINALIZADA</span><h3 style={{fontSize:22,margin:'5px 0'}}>{money.format(invoice.total)}</h3><p style={{fontSize:10,color:'#748178',margin:0}}>{invoice.payment} · {invoice.items.reduce((sum,item)=>sum+item.qty,0)} ítems</p></div><button className={styles.saveProduct} type="button" onClick={()=>downloadInvoice()}>Descargar factura</button><button className={styles.createProductButton} style={{marginTop:6}} type="button" onClick={()=>setShareChoices(value=>!value)}>Enviar factura</button>{shareChoices&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,margin:'8px 0 10px'}}><button type="button" onClick={()=>void shareInvoice('whatsapp')} style={{minHeight:46,border:'1px solid #cfe5d8',borderRadius:12,background:'#eef9f2',color:'#167448',fontWeight:900}}>WhatsApp</button><button type="button" onClick={()=>void shareInvoice('email')} style={{minHeight:46,border:'1px solid #dbe3df',borderRadius:12,background:'#f8faf9',color:'#34473d',fontWeight:900}}>Email</button></div>}<button type="button" onClick={closeInvoice} style={{width:'100%',minHeight:44,border:'1px solid #dce5df',borderRadius:12,background:'#fff',color:'#526158',fontWeight:850}}>Cerrar</button><small className={styles.demoNote} style={{paddingTop:9}}>El PDF es de prueba. En la versión final se compartirá el comprobante fiscal real.</small></div></div>}
  </div></main>
}
