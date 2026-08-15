'use client'

import { useEffect, useMemo, useState } from 'react'
import { checkArcaHealth, type ArcaHealth } from '@/lib/comercio/api'
import { loadMobileSettings, readCachedMobileSettings, saveMobileSettings, type MobileSettings } from '@/lib/comercio/mobile-settings'
import { loadSalesSettings, readCachedSalesSettings, saveSalesSettings, type SalesSettings } from '@/lib/comercio/sales-settings'
import { readTenantSession } from '@/lib/comercio/session'
import { loadTenantAdmin, saveBranch, saveCompanyAdmin, type BranchAdmin, type CompanyAdmin } from '@/lib/comercio/tenant-admin-api'
import type { StaffProfile } from '@/lib/comercio/api'
import type { TenantSession } from '@/lib/comercio/types'
import styles from './mobile-settings-overlay.module.css'

type Section = 'home'|'commerce'|'sales'|'stock'|'mobile'|'receipts'|'arca'|'admin'|'app'
type ReceiptPrefs = { afterSale:'ask'|'download'|'share'; shareChannel:'whatsapp'|'email'|'system' }
const DEFAULT_RECEIPTS:ReceiptPrefs={afterSale:'ask',shareChannel:'whatsapp'}
const roleLabel:Record<string,string>={owner:'Propietario',supervisor:'Supervisor',manager:'Encargado',cashier:'Cajero',seller:'Vendedor'}

function stockKey(companyId:string){return `cl_mobile_stock_${companyId}`}
function receiptKey(companyId:string){return `cl_mobile_receipt_prefs_${companyId}`}
function readLowStock(){try{return Math.max(0,Number(JSON.parse(localStorage.getItem('cl_settings')||'{}')?.stock?.low??5)||0)}catch{return 5}}
function writeLowStock(low:number){let all:any={};try{all=JSON.parse(localStorage.getItem('cl_settings')||'{}')}catch{};all.stock={...(all.stock||{}),low};localStorage.setItem('cl_settings',JSON.stringify(all))}
function readReceipts(companyId:string):ReceiptPrefs{try{const raw=JSON.parse(localStorage.getItem(receiptKey(companyId))||'null');return raw&&['ask','download','share'].includes(raw.afterSale)?{afterSale:raw.afterSale,shareChannel:['whatsapp','email','system'].includes(raw.shareChannel)?raw.shareChannel:'whatsapp'}:DEFAULT_RECEIPTS}catch{return DEFAULT_RECEIPTS}}

export default function MobileSettingsOverlay(){
  const[open,setOpen]=useState(false),[section,setSection]=useState<Section>('home'),[session,setSession]=useState<TenantSession|null>(null)
  const[company,setCompany]=useState<CompanyAdmin|null>(null),[branches,setBranches]=useState<BranchAdmin[]>([]),[staff,setStaff]=useState<StaffProfile[]>([])
  const[sales,setSales]=useState<SalesSettings|null>(null),[mobile,setMobile]=useState<MobileSettings|null>(null),[arca,setArca]=useState<ArcaHealth|null>(null)
  const[stockEnabled,setStockEnabled]=useState(false),[lowStock,setLowStock]=useState(5),[receipts,setReceipts]=useState<ReceiptPrefs>(DEFAULT_RECEIPTS)
  const[busy,setBusy]=useState(''),[notice,setNotice]=useState(''),[error,setError]=useState(''),[stockNeedsReload,setStockNeedsReload]=useState(false)
  const[newBranchName,setNewBranchName]=useState(''),[newBranchAddress,setNewBranchAddress]=useState('')
  const[cameraPermission,setCameraPermission]=useState<'unknown'|'granted'|'denied'>('unknown')
  const[notificationPermission,setNotificationPermission]=useState<'unsupported'|'default'|'granted'|'denied'>('unsupported')

  const owner=session?.role==='owner'
  const apkVersion=useMemo(()=>{if(typeof navigator==='undefined')return null;const m=navigator.userAgent.match(/ComercioLlenoApp\/([^\s]+)/);return m?.[1]||null},[open])

  function flash(message:string){setNotice(message);window.setTimeout(()=>setNotice(''),2600)}
  function fail(value:unknown){setError(value instanceof Error?value.message:String(value));window.setTimeout(()=>setError(''),4200)}

  async function loadAll(s:TenantSession){
    setBusy('load');setError('')
    setSales(readCachedSalesSettings(s.companyId));setMobile(readCachedMobileSettings(s.companyId));setStockEnabled(localStorage.getItem(stockKey(s.companyId))==='1');setLowStock(readLowStock());setReceipts(readReceipts(s.companyId))
    try{
      const [admin,salesRemote,mobileRemote,arcaRemote]=await Promise.all([
        loadTenantAdmin(s).catch(()=>null),
        loadSalesSettings(s).catch(()=>readCachedSalesSettings(s.companyId)),
        loadMobileSettings(s).catch(()=>readCachedMobileSettings(s.companyId)),
        checkArcaHealth(s),
      ])
      if(admin){setCompany(admin.company||null);setBranches(admin.branches||[]);setStaff(admin.staff||[])}
      setSales(salesRemote);setMobile(mobileRemote);setArca(arcaRemote)
    }finally{setBusy('')}
  }

  useEffect(()=>{
    const s=readTenantSession();setSession(s)
    if(s){setSales(readCachedSalesSettings(s.companyId));setMobile(readCachedMobileSettings(s.companyId));setStockEnabled(localStorage.getItem(stockKey(s.companyId))==='1');setLowStock(readLowStock());setReceipts(readReceipts(s.companyId))}
    const intercept=(event:MouseEvent)=>{
      const target=event.target as HTMLElement|null
      const button=target?.closest?.('button[aria-label="Configuración"]')
      if(!button)return
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()
      const current=readTenantSession();setSession(current);setSection('home');setOpen(true)
      if(current)void loadAll(current)
    }
    document.addEventListener('click',intercept,true)
    return()=>document.removeEventListener('click',intercept,true)
  },[])

  useEffect(()=>{if(!open)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old}},[open])

  useEffect(()=>{
    if(typeof window==='undefined'||!session)return
    const observer=new MutationObserver(()=>{
      const download=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Descargar factura') as HTMLButtonElement|undefined
      if(!download)return
      const card=download.parentElement as HTMLElement|null
      if(!card||!card.textContent?.includes('VENTA FINALIZADA')||card.dataset.clReceiptHandled==='1')return
      card.dataset.clReceiptHandled='1'
      const pref=readReceipts(session.companyId)
      if(pref.afterSale==='download')window.setTimeout(()=>download.click(),80)
      if(pref.afterSale==='share')window.setTimeout(()=>{
        const send=[...card.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Enviar factura') as HTMLButtonElement|undefined
        send?.click()
        if(pref.shareChannel==='system')return
        window.setTimeout(()=>{
          const label=pref.shareChannel==='email'?'Email':'WhatsApp'
          const channel=[...card.querySelectorAll('button')].find(b=>b.textContent?.trim()===label) as HTMLButtonElement|undefined
          channel?.click()
        },100)
      },80)
    })
    observer.observe(document.body,{subtree:true,childList:true})
    return()=>observer.disconnect()
  },[session?.companyId])

  function close(){setOpen(false);setSection('home');if(stockNeedsReload)window.setTimeout(()=>location.reload(),80)}
  function go(next:Section){setError('');setNotice('');setSection(next)}

  async function saveCommerce(){if(!session||!company||!owner)return;setBusy('commerce');try{await saveCompanyAdmin(session,{name:company.name,legal_name:company.legal_name||company.name,owner_phone:company.owner_phone||null,address:company.address||null,country:company.country||null,province:company.province||null,tax_id:company.tax_id||null});flash('Datos del comercio guardados.')}catch(e){fail(e)}finally{setBusy('')}}
  async function saveSales(){if(!session||!sales||!owner)return;setBusy('sales');try{setSales(await saveSalesSettings(session,sales));flash('Ajustes de ventas guardados.')}catch(e){fail(e)}finally{setBusy('')}}
  function saveStock(){if(!session||!owner)return;localStorage.setItem(stockKey(session.companyId),stockEnabled?'1':'0');writeLowStock(lowStock);setStockNeedsReload(true);window.dispatchEvent(new CustomEvent('comercio:mobile-stock',{detail:{enabled:stockEnabled,low:lowStock}}));flash('Stock guardado. Se aplicará al volver.')} 
  async function saveMobile(){if(!session||!mobile||!owner)return;setBusy('mobile');try{setMobile(await saveMobileSettings(session,mobile));flash('Funciones móviles guardadas.')}catch(e){fail(e)}finally{setBusy('')}}
  function saveReceipts(){if(!session||!owner)return;localStorage.setItem(receiptKey(session.companyId),JSON.stringify(receipts));flash('Preferencia de comprobantes guardada.')}
  async function refreshArca(){if(!session)return;setBusy('arca');try{setArca(await checkArcaHealth(session));flash('Estado de ARCA actualizado.')}catch(e){fail(e)}finally{setBusy('')}}
  async function createBranch(){if(!session||!owner||!newBranchName.trim())return;setBusy('branch');try{await saveBranch(session,{name:newBranchName.trim(),address:newBranchAddress.trim()||null,is_primary:false});const admin=await loadTenantAdmin(session);setBranches(admin.branches||[]);setNewBranchName('');setNewBranchAddress('');flash('Sucursal creada.')}catch(e){fail(e)}finally{setBusy('')}}
  async function testCamera(){try{const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});stream.getTracks().forEach(t=>t.stop());setCameraPermission('granted');flash('Cámara habilitada.')}catch(e){setCameraPermission('denied');fail(e)}}
  async function requestNotifications(){if(!('Notification'in window)){setNotificationPermission('unsupported');return}try{const p=await Notification.requestPermission();setNotificationPermission(p);flash(p==='granted'?'Notificaciones permitidas.':'Permiso de notificaciones no concedido.')}catch(e){fail(e)}}

  useEffect(()=>{if(!open)return;if('Notification'in window)setNotificationPermission(Notification.permission)},[open])

  if(!open)return null

  const header=<header className={styles.header}><button className={styles.back} onClick={()=>section==='home'?close():go('home')}>{section==='home'?'×':'‹'}</button><div><span>COMERCIO LLENO</span><h1>{section==='home'?'Configuración':sectionTitle(section)}</h1></div><button className={styles.close} onClick={close}>×</button></header>

  return <div className={styles.overlay}><div className={styles.shell}>{header}{notice&&<div className={styles.notice}>{notice}</div>}{error&&<div className={styles.error}>{error}</div>}
    <main className={styles.body}>
      {section==='home'&&<>
        <div className={styles.hero}><div><b>{company?.name||session?.companyName||'Tu comercio'}</b><span>{owner?'Propietario':'Configuración disponible según tu rol'}</span></div><i>{apkVersion?`APK ${apkVersion}`:'Web móvil'}</i></div>
        <div className={styles.menu}>
          <Menu icon="▣" title="Mi comercio" text="Datos del local, sucursales y contacto" onClick={()=>go('commerce')}/>
          <Menu icon="$" title="Ventas" text="Stock negativo, descuentos y horario" onClick={()=>go('sales')}/>
          <Menu icon="#" title="Stock" text="Control de existencias y aviso de stock bajo" onClick={()=>go('stock')}/>
          <Menu icon="◎" title="Funciones móviles" text="Escáner, IA y comportamiento en teléfonos" onClick={()=>go('mobile')}/>
          <Menu icon="▤" title="Comprobantes" text="Qué hacer con el PDF al terminar una venta" onClick={()=>go('receipts')}/>
          <Menu icon="A" title="ARCA" text={`${arca?.connected?'Conectado':'Estado fiscal y punto de venta'}`} status={arca?.connected?'ok':undefined} onClick={()=>go('arca')}/>
          <Menu icon="U" title="Administración" text="Usuarios, sucursales y estado del comercio" onClick={()=>go('admin')}/>
          <Menu icon="⚙" title="Aplicación" text="Permisos, actualización y versión completa" onClick={()=>go('app')}/>
        </div>
        {!owner&&<div className={styles.readOnly}>Algunos ajustes sólo los puede cambiar el Propietario. Tu usuario puede consultarlos sin modificar la configuración general.</div>}
      </>}

      {section==='commerce'&&<section className={styles.card}><h2>Datos del comercio</h2><p>Los mismos datos principales de la versión de escritorio, adaptados al celular.</p>{company?<div className={styles.fields}><label>Nombre del local<input disabled={!owner} value={company.name||''} onChange={e=>setCompany({...company,name:e.target.value})}/></label><label>WhatsApp del propietario<input disabled={!owner} value={company.owner_phone||''} onChange={e=>setCompany({...company,owner_phone:e.target.value})} placeholder="+54 9…"/></label><label>Dirección<input disabled={!owner} value={company.address||''} onChange={e=>setCompany({...company,address:e.target.value})} placeholder="Dirección del local"/></label><label>CUIT / CUIL<input disabled value={company.tax_id||''} placeholder="Se modifica desde la versión completa"/></label></div>:<Loading/>}<div className={styles.subCard}><b>Sucursales</b>{branches.length?branches.map(b=><div className={styles.row} key={b.id}><span>{b.name}<small>{b.is_primary?'Local principal':b.address||'Sin dirección'}</small></span><strong>{b.active!==false?'Activa':'Inactiva'}</strong></div>):<small>No se pudieron cargar sucursales.</small>}</div>{owner&&<button className={styles.primary} disabled={busy==='commerce'||!company} onClick={()=>void saveCommerce()}>{busy==='commerce'?'Guardando…':'Guardar comercio'}</button>}</section>}

      {section==='sales'&&<section className={styles.card}><h2>Ventas y caja</h2><p>Ajustes rápidos que también existen en escritorio.</p>{sales?<><SwitchRow title="Permitir vender sin stock" text="Si está activo, una venta puede continuar aunque no queden unidades." value={sales.allowNegativeStock} disabled={!owner} onChange={v=>setSales({...sales,allowNegativeStock:v})}/><label className={styles.field}>Descuento máximo (%)<input disabled={!owner} type="number" min="0" max="100" value={sales.maxDiscount} onChange={e=>setSales({...sales,maxDiscount:Math.max(0,Math.min(100,Number(e.target.value)||0))})}/></label><div className={styles.choice}><button disabled={!owner} className={sales.timeFormat==='24'?styles.selected:''} onClick={()=>setSales({...sales,timeFormat:'24'})}>24 horas</button><button disabled={!owner} className={sales.timeFormat==='12'?styles.selected:''} onClick={()=>setSales({...sales,timeFormat:'12'})}>12 horas</button></div><SwitchRow title="Precios mayoristas" text="Mantiene habilitada la lógica mayorista del comercio." value={sales.wholesalePricingEnabled} disabled={!owner} onChange={v=>setSales({...sales,wholesalePricingEnabled:v})}/>{owner&&<button className={styles.primary} disabled={busy==='sales'} onClick={()=>void saveSales()}>{busy==='sales'?'Guardando…':'Guardar ventas'}</button>}</>:<Loading/>}</section>}

      {section==='stock'&&<section className={styles.card}><h2>Stock e inventario</h2><p>Controlá existencias desde la app y definí cuándo considerás que un producto está bajo.</p><SwitchRow title="Control de stock" text={stockEnabled?'Muestra existencias y limita cantidades disponibles.':'Permite operar sin controlar existencias desde el teléfono.'} value={stockEnabled} disabled={!owner} onChange={setStockEnabled}/><label className={styles.field}>Avisar stock bajo desde<input disabled={!owner} type="number" min="0" value={lowStock} onChange={e=>setLowStock(Math.max(0,Number(e.target.value)||0))}/></label>{owner&&<button className={styles.primary} onClick={saveStock}>Guardar stock</button>}</section>}

      {section==='mobile'&&<section className={styles.card}><h2>Funciones móviles</h2><p>Herramientas pensadas específicamente para usar Comercio Lleno desde el teléfono.</p>{mobile?<><SwitchRow title="Escáner con cámara" text="Lee códigos de barras y permite consultar o editar productos." value={mobile.scannerEnabled} disabled={!owner} onChange={v=>setMobile({...mobile,scannerEnabled:v})}/><SwitchRow title="Asistente IA" text="Muestra la burbuja flotante para consultar ventas, productos y stock." value={mobile.aiEnabled} disabled={!owner} onChange={v=>setMobile({...mobile,aiEnabled:v})}/><SwitchRow title="Abrir Móvil automáticamente" text="Desde un teléfono, prioriza esta experiencia simplificada." value={mobile.autoRedirect} disabled={!owner} onChange={v=>setMobile({...mobile,autoRedirect:v})}/>{owner&&<button className={styles.primary} disabled={busy==='mobile'} onClick={()=>void saveMobile()}>{busy==='mobile'?'Guardando…':'Guardar funciones móviles'}</button>}</>:<Loading/>}</section>}

      {section==='receipts'&&<section className={styles.card}><h2>Comprobantes</h2><p>Elegí qué querés que haga la app después de terminar una venta.</p><div className={styles.options}><button disabled={!owner} className={receipts.afterSale==='ask'?styles.selected:''} onClick={()=>setReceipts({...receipts,afterSale:'ask'})}><b>Preguntar siempre</b><small>Muestra Descargar o Enviar.</small></button><button disabled={!owner} className={receipts.afterSale==='download'?styles.selected:''} onClick={()=>setReceipts({...receipts,afterSale:'download'})}><b>Descargar PDF</b><small>Inicia la descarga al finalizar.</small></button><button disabled={!owner} className={receipts.afterSale==='share'?styles.selected:''} onClick={()=>setReceipts({...receipts,afterSale:'share'})}><b>Compartir</b><small>Abre el canal elegido al finalizar.</small></button></div>{receipts.afterSale==='share'&&<><h3 className={styles.miniTitle}>Canal preferido</h3><div className={styles.choice}><button disabled={!owner} className={receipts.shareChannel==='whatsapp'?styles.selected:''} onClick={()=>setReceipts({...receipts,shareChannel:'whatsapp'})}>WhatsApp</button><button disabled={!owner} className={receipts.shareChannel==='email'?styles.selected:''} onClick={()=>setReceipts({...receipts,shareChannel:'email'})}>Email</button><button disabled={!owner} className={receipts.shareChannel==='system'?styles.selected:''} onClick={()=>setReceipts({...receipts,shareChannel:'system'})}>Elegir app</button></div></>}{owner&&<button className={styles.primary} onClick={saveReceipts}>Guardar comprobantes</button>}</section>}

      {section==='arca'&&<section className={styles.card}><h2>ARCA / Facturación</h2><p>Acá mostramos sólo el estado operativo. Los certificados y cambios sensibles siguen en escritorio.</p><div className={`${styles.statusHero} ${arca?.connected?styles.good:styles.bad}`}><span>{arca?.connected?'✓':'!'}</span><div><b>{arca?.connected?'ARCA conectado':'ARCA sin conexión'}</b><small>{arca?.error||'Estado consultado en este momento'}</small></div></div><div className={styles.lines}><div><span>Servicio</span><b>{arca?.service||'wsfev1'}</b></div><div><span>Punto de venta</span><b>{arca?.pointOfSale??'—'}</b></div><div><span>Entorno</span><b>{arca?.environment||'—'}</b></div><div><span>Listo para emitir</span><b>{arca?.readyToIssue?'Sí':'—'}</b></div></div><button className={styles.primary} disabled={busy==='arca'} onClick={()=>void refreshArca()}>{busy==='arca'?'Consultando…':'Actualizar estado'}</button></section>}

      {section==='admin'&&<section className={styles.card}><h2>Administración</h2><p>Una vista rápida de usuarios y sucursales sin cargar toda la pantalla de escritorio.</p><div className={styles.metrics}><div><span>Sucursales</span><b>{branches.length}</b></div><div><span>Usuarios</span><b>{staff.filter(s=>s.active!==false).length}</b></div><div><span>ARCA</span><b>{arca?.connected?'OK':'—'}</b></div></div><div className={styles.subCard}><b>Usuarios</b>{staff.filter(s=>s.role!=='owner').slice(0,8).map(s=><div className={styles.row} key={s.id}><span>{s.full_name||s.username||'Usuario'}<small>{s.username||''}</small></span><strong>{roleLabel[s.role]||s.role}</strong></div>)}{!staff.filter(s=>s.role!=='owner').length&&<small>No hay otros usuarios cargados.</small>}</div><div className={styles.subCard}><b>Sucursales</b>{branches.map(b=><div className={styles.row} key={b.id}><span>{b.name}<small>{b.address||'Sin dirección'}</small></span><strong>{b.is_primary?'Principal':'Activa'}</strong></div>)}</div>{owner&&<div className={styles.newBranch}><h3>Agregar sucursal</h3><input value={newBranchName} onChange={e=>setNewBranchName(e.target.value)} placeholder="Nombre"/><input value={newBranchAddress} onChange={e=>setNewBranchAddress(e.target.value)} placeholder="Dirección (opcional)"/><button className={styles.secondary} disabled={busy==='branch'||!newBranchName.trim()} onClick={()=>void createBranch()}>{busy==='branch'?'Creando…':'+ Crear sucursal'}</button></div>}<button className={styles.secondary} onClick={()=>{location.href='/redesign'}}>Abrir administración completa</button></section>}

      {section==='app'&&<section className={styles.card}><h2>Aplicación</h2><p>Estado del teléfono, permisos y acceso a la versión completa.</p><div className={styles.lines}><div><span>Modo</span><b>{apkVersion?'APK Android':'Web móvil'}</b></div><div><span>Versión APK</span><b>{apkVersion||'—'}</b></div><div><span>Cámara</span><b>{cameraPermission==='granted'?'Permitida':cameraPermission==='denied'?'Bloqueada':'Sin comprobar'}</b></div><div><span>Notificaciones</span><b>{notificationPermission==='granted'?'Permitidas':notificationPermission==='denied'?'Bloqueadas':notificationPermission==='unsupported'?'No disponibles':'Sin decidir'}</b></div></div><div className={styles.actionGrid}><button onClick={()=>void testCamera()}>Probar cámara</button><button onClick={()=>void requestNotifications()}>Permitir notificaciones</button><button onClick={()=>location.reload()}>Buscar cambios</button><button onClick={()=>{location.href='/redesign'}}>Versión completa</button></div><div className={styles.info}>La APK abre la versión móvil conectada a Comercio Lleno. Las mejoras web se reciben al volver a abrir o actualizar la app; cambios nativos de Android requieren una nueva APK.</div></section>}
    </main>
  </div></div>
}

function sectionTitle(section:Section){return({home:'Configuración',commerce:'Mi comercio',sales:'Ventas',stock:'Stock',mobile:'Funciones móviles',receipts:'Comprobantes',arca:'ARCA',admin:'Administración',app:'Aplicación'} as Record<Section,string>)[section]}
function Loading(){return <div className={styles.loading}>Cargando configuración…</div>}
function Menu({icon,title,text,status,onClick}:{icon:string;title:string;text:string;status?:'ok';onClick:()=>void}){return <button className={styles.menuItem} onClick={onClick}><span className={styles.menuIcon}>{icon}</span><span><b>{title}</b><small>{text}</small></span>{status==='ok'&&<i className={styles.ok}>✓</i>}<strong>›</strong></button>}
function SwitchRow({title,text,value,disabled,onChange}:{title:string;text:string;value:boolean;disabled?:boolean;onChange:(v:boolean)=>void}){return <div className={styles.switchRow}><span><b>{title}</b><small>{text}</small></span><button disabled={disabled} className={`${styles.switch} ${value?styles.switchOn:''}`} onClick={()=>onChange(!value)} aria-pressed={value}><i/></button></div>}
