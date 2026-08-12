'use client'

import { FormEvent, useEffect, useState } from 'react'
import core from './page.module.css'
import styles from './settings-tenant.module.css'
import PrinterSettingsPanel from './PrinterSettingsPanel'
import UpdatesCenter from './UpdatesCenter'
import {
  createStaff,
  loadStaff,
  resetSalesData,
  updateCompanyIdentity,
  updateStaff,
  type ArcaHealth,
  type StaffProfile,
} from '@/lib/comercio/api'
import {
  DEFAULT_SALES_SETTINGS,
  loadSalesSettings,
  readCachedSalesSettings,
  saveSalesSettings,
  type SalesSettings,
} from '@/lib/comercio/sales-settings'
import { writeDeviceSettings } from '@/lib/comercio/session'
import type { CommerceSnapshot, DeviceSettings, TenantSession, UserPermissions } from '@/lib/comercio/types'

type Props = {
  data: CommerceSnapshot
  session: TenantSession
  device: DeviceSettings
  setDevice: (d: DeviceSettings) => void
  arca: ArcaHealth | null
  buildVersion: string
  refresh: () => Promise<void>
  message: (m: string) => void
}

type Tab = 'commerce' | 'sales' | 'arca' | 'printer' | 'stock' | 'users' | 'updates' | 'maintenance'

function Head() {
  return <div className={core.pageHead}><div><div className={core.eyebrow}>ADMINISTRACIÓN</div><h1>Configuración</h1><p>Ajustes del comercio, caja, facturación, impresora y permisos.</p></div></div>
}

function SalesPanel({ session, message }: { session: TenantSession; message: (m: string) => void }) {
  const [value, setValue] = useState<SalesSettings>(() => readCachedSalesSettings(session.companyId))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    loadSalesSettings(session).then(next => { if (!cancelled) setValue(next) }).catch(() => {})
    return () => { cancelled = true }
  }, [session.companyId, session.token])

  async function save() {
    setBusy(true); setError('')
    try {
      const next = await saveSalesSettings(session, value)
      setValue(next)
      message('Ajustes de ventas y caja guardados para este comercio.')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  return <div className={styles.panel}>
    <h3>Ventas y caja</h3>
    <p>Estos ajustes quedan asociados al comercio y se aplican en la pantalla Nueva venta.</p>

    <label className={styles.switch}>
      <span><b>Permitir vender sin stock</b><small>Si está activado, podés agregar y cobrar productos aunque el stock figure en 0. El stock no baja de 0.</small></span>
      <input type="checkbox" checked={value.allowNegativeStock} onChange={e => setValue(v => ({ ...v, allowNegativeStock: e.target.checked }))}/>
    </label>

    <div className={styles.field}>
      <span>Formato horario</span>
      <div className={styles.choice}>
        <button type="button" className={value.timeFormat === '24' ? styles.selected : ''} onClick={() => setValue(v => ({ ...v, timeFormat: '24' }))}>24 horas · 18:45</button>
        <button type="button" className={value.timeFormat === '12' ? styles.selected : ''} onClick={() => setValue(v => ({ ...v, timeFormat: '12' }))}>12 horas · 6:45 PM</button>
      </div>
      <small>El formato predeterminado es 24 horas.</small>
    </div>

    <label className={styles.field}>Descuento máximo (%)
      <input type="number" min="0" max="100" value={value.maxDiscount} onChange={e => setValue(v => ({ ...v, maxDiscount: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))}/>
    </label>

    {error && <div className={styles.error}>{error}</div>}
    <div className={styles.saveRow}><small>Se guarda en la cuenta del comercio; no depende solamente de esta computadora.</small><button className={styles.save} disabled={busy} onClick={save}>{busy ? 'Guardando…' : 'Guardar ajustes'}</button></div>
  </div>
}

function StockPanel() {
  const [low, setLow] = useState(5)
  const [allowNegative, setAllowNegative] = useState(false)
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem('cl_settings') || '{}')
      setLow(Number(all?.stock?.low ?? 5))
      setAllowNegative(Boolean(all?.stock?.allowNegative))
    } catch {}
  }, [])
  function save() {
    let all: Record<string, unknown> = {}
    try { all = JSON.parse(localStorage.getItem('cl_settings') || '{}') } catch {}
    ;(all as any).stock = { low, allowNegative }
    localStorage.setItem('cl_settings', JSON.stringify(all))
    setSaved(true); setTimeout(() => setSaved(false), 1800)
  }
  return <div className={styles.panel}><h3>Stock e inventario</h3><p>Avisos y comportamiento general del inventario.</p><div className={styles.grid}><label className={styles.field}>Avisar stock bajo desde<input type="number" min="0" value={low} onChange={e => setLow(Math.max(0, Number(e.target.value) || 0))}/></label><label className={styles.switch}><span><b>Permitir stock negativo en ajustes manuales</b><small>No modifica la opción de vender sin stock de Ventas y caja.</small></span><input type="checkbox" checked={allowNegative} onChange={e => setAllowNegative(e.target.checked)}/></label></div><div className={styles.saveRow}><small>{saved ? 'Ajustes guardados.' : 'Ajuste local de inventario.'}</small><button className={styles.save} onClick={save}>Guardar ajustes</button></div></div>
}

function StaffRow({ staff, session, saved }: { staff: StaffProfile; session: TenantSession; saved: () => Promise<void> }) {
  const [role, setRole] = useState(staff.role)
  const [permissions, setPermissions] = useState<UserPermissions>(staff.permissions || {})
  const [busy, setBusy] = useState(false)
  function setP(k: keyof UserPermissions, checked: boolean) { setPermissions(p => ({ ...p, [k]: checked })) }
  async function save() { setBusy(true); try { await updateStaff(session, staff.id, role, permissions); await saved() } finally { setBusy(false) } }
  return <div className={styles.staff}><div><b>{staff.full_name || staff.username || 'Usuario'}</b><small>{staff.username || ''}</small></div><select value={role} onChange={e => setRole(e.target.value)}><option value="cashier">Encargado / Cajero</option><option value="supervisor">Supervisor</option></select><div className={styles.permissions}><label><input type="checkbox" checked={permissions.can_sell !== false} onChange={e => setP('can_sell', e.target.checked)}/> Vender</label><label><input type="checkbox" checked={permissions.can_view_reports !== false} onChange={e => setP('can_view_reports', e.target.checked)}/> Reportes</label><label><input type="checkbox" checked={permissions.can_manage_stock !== false} onChange={e => setP('can_manage_stock', e.target.checked)}/> Stock</label><label><input type="checkbox" checked={permissions.can_manage_customers !== false} onChange={e => setP('can_manage_customers', e.target.checked)}/> Clientes</label></div><button className={styles.mini} disabled={busy} onClick={save}>{busy ? 'Guardando…' : 'Guardar'}</button></div>
}

function NewStaffModal({ session, close, saved }: { session: TenantSession; close: () => void; saved: () => Promise<void> }) {
  const [name, setName] = useState(''), [username, setUsername] = useState(''), [password, setPassword] = useState(''), [role, setRole] = useState<'cashier'|'supervisor'>('cashier')
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault(); setError('')
    if (!username.trim() || password.length < 6) { setError('Completá usuario y una contraseña de al menos 6 caracteres.'); return }
    const permissions: UserPermissions = role === 'supervisor' ? { can_sell:false, can_view_reports:true, can_manage_stock:true, can_manage_customers:true } : { can_sell:true, can_view_reports:true, can_manage_stock:true, can_manage_customers:true }
    setBusy(true)
    try { await createStaff(session, { username, password, full_name:name, role, permissions }); await saved() }
    catch(e){ setError(e instanceof Error ? e.message : String(e)); setBusy(false) }
  }
  return <div className={styles.modal}><form className={styles.modalCard} onSubmit={submit}><div className={styles.modalHead}><h3>Crear usuario del comercio</h3><button type="button" onClick={close}>×</button></div><div className={styles.grid}><label className={styles.field}>Nombre<input value={name} onChange={e=>setName(e.target.value)}/></label><label className={styles.field}>Usuario<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="ej: caja1"/></label><label className={styles.field}>Contraseña<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><label className={styles.field}>Rol<select value={role} onChange={e=>setRole(e.target.value as 'cashier'|'supervisor')}><option value="cashier">Encargado / Cajero</option><option value="supervisor">Supervisor</option></select></label></div>{error&&<div className={styles.error}>{error}</div>}<div className={styles.actions}><button type="button" onClick={close}>Cancelar</button><button className={styles.primary} disabled={busy}>{busy?'Creando…':'Crear usuario'}</button></div></form></div>
}

export default function SettingsTenant({ data, session, device, setDevice, arca, buildVersion, refresh, message }: Props) {
  const owner = session.role === 'owner'
  const [tab, setTab] = useState<Tab>('commerce')
  const [name, setName] = useState(data.company.name), [tax, setTax] = useState(data.company.tax_id || '')
  const [staff, setStaff] = useState<StaffProfile[]>([]), [staffError, setStaffError] = useState(''), [newStaff, setNewStaff] = useState(false)
  const [resetOpen, setResetOpen] = useState(false), [resetPass, setResetPass] = useState(''), [resetBusy, setResetBusy] = useState(false), [resetError, setResetError] = useState('')
  const fiscal = arca as (ArcaHealth & { configured?: boolean }) | null
  const configured = fiscal?.configured !== false

  async function saveCommerce(){try{await updateCompanyIdentity(session,name,tax);await refresh();message('Datos del comercio guardados.')}catch(e){message(e instanceof Error?e.message:String(e))}}
  function savePrinter(next:DeviceSettings){setDevice(next);writeDeviceSettings(session.companyId,next)}
  async function loadUsers(){if(!owner)return;try{setStaff(await loadStaff(session));setStaffError('')}catch(e){setStaffError(e instanceof Error?e.message:String(e))}}
  useEffect(()=>{if(tab==='users')void loadUsers()},[tab])
  async function resetSales(){if(!resetPass)return;setResetBusy(true);setResetError('');try{await resetSalesData(session,resetPass);setResetOpen(false);setResetPass('');await refresh();message('Las ventas quedaron restablecidas a cero.')}catch(e){setResetError(e instanceof Error?e.message:String(e))}finally{setResetBusy(false)}}

  const tabs: Array<[Tab,string]> = [['commerce','Comercio'],['sales','Ventas y caja'],['arca','ARCA'],['printer','Impresora y tickets'],['stock','Stock'],...(owner ? [['users','Usuarios y roles'],['updates','Actualizaciones'],['maintenance','Mantenimiento']] as Array<[Tab,string]> : [])]

  return <><Head/><div className={styles.layout}><aside className={styles.nav}>{tabs.map(([id,label])=><button key={id} className={tab===id?styles.active:''} onClick={()=>setTab(id)}>{label}</button>)}</aside><section className={styles.body}>
    {tab==='commerce'&&<div className={styles.panel}><h3>Datos del comercio</h3><p>Información exclusiva de este tenant.</p><div className={styles.grid}><label className={styles.field}>Nombre<input value={name} onChange={e=>setName(e.target.value)}/></label><label className={styles.field}>CUIT<input value={tax} onChange={e=>setTax(e.target.value)}/></label></div><div className={styles.saveRow}><small>Los datos de otros comercios no son visibles desde esta cuenta.</small><button className={styles.save} onClick={saveCommerce}>Guardar cambios</button></div></div>}
    {tab==='sales'&&<SalesPanel session={session} message={message}/>} 
    {tab==='arca'&&<div className={styles.panel}><h3>ARCA / Facturación electrónica</h3><p>La configuración fiscal es independiente para cada comercio.</p><div className={styles.status}><div className={styles.statusRow}><span>Configuración</span><b className={configured?styles.ok:styles.neutral}>{configured?'Configurada':'No configurada'}</b></div><div className={styles.statusRow}><span>Conexión</span><b className={fiscal?.connected?styles.ok:styles.bad}>{fiscal?.connected?'Conectado':configured?'Desconectado':'—'}</b></div><div className={styles.statusRow}><span>Servicio</span><b>{configured?(fiscal?.service||'wsfev1'):'—'}</b></div><div className={styles.statusRow}><span>Punto de venta</span><b>{configured?(fiscal?.pointOfSale??'—'):'—'}</b></div><div className={styles.statusRow}><span>Entorno</span><b>{configured?(fiscal?.environment||'homologación'):'—'}</b></div></div><div className={styles.note}>{configured?'Las credenciales fiscales utilizadas por este comercio están aisladas por tenant.':'Este comercio todavía no tiene ARCA configurado. Para habilitar facturación necesita sus propias credenciales/certificado y su propio punto de venta. Nunca se reutilizan credenciales de otro comercio.'}</div>{fiscal?.error&&configured&&<div className={styles.error}>{fiscal.error}</div>}</div>}
    {tab==='printer'&&<PrinterSettingsPanel company={data.company} device={device} onSave={savePrinter} message={message}/>} 
    {tab==='stock'&&<StockPanel/>}
    {tab==='users'&&owner&&<div className={styles.panel}><div className={styles.staffHead}><div><h3>Usuarios, roles y permisos</h3><p>Usuarios asociados únicamente a este comercio.</p></div><button className={styles.save} onClick={()=>setNewStaff(true)}>+ Crear usuario</button></div>{staffError&&<div className={styles.error}>{staffError}</div>}<div className={styles.staffList}>{staff.filter(x=>x.role!=='owner').map(x=><StaffRow key={x.id} staff={x} session={session} saved={loadUsers}/>)}</div></div>}
    {tab==='updates'&&owner&&<UpdatesCenter session={session} buildVersion={buildVersion} message={message}/>} 
    {tab==='maintenance'&&owner&&<div className={`${styles.panel} ${styles.danger}`}><h3>Restablecer valores de ventas</h3><p>Pone en cero ventas, reportes e historial de este comercio. No modifica otros tenants.</p><button className={styles.dangerButton} onClick={()=>setResetOpen(true)}>Restablecer ventas a cero</button></div>}
    <div className={styles.version}>Comercio Lleno · Rediseño V2 · build {buildVersion} · tenant {session.companyId.slice(0,8)}</div>
  </section></div>{newStaff&&<NewStaffModal session={session} close={()=>setNewStaff(false)} saved={async()=>{setNewStaff(false);await loadUsers()}}/>}{resetOpen&&<div className={styles.modal}><div className={styles.modalCard}><div className={styles.modalHead}><h3>Restablecer ventas</h3><button onClick={()=>setResetOpen(false)}>×</button></div><p>Se eliminará el historial de ventas de este comercio. Esta acción no afecta a ningún otro tenant.</p><label className={styles.field}>Contraseña del propietario<input type="password" value={resetPass} onChange={e=>setResetPass(e.target.value)}/></label>{resetError&&<div className={styles.error}>{resetError}</div>}<div className={styles.actions}><button onClick={()=>setResetOpen(false)}>Cancelar</button><button className={styles.dangerButton} disabled={resetBusy} onClick={resetSales}>{resetBusy?'Restableciendo…':'Confirmar'}</button></div></div></div>}</>
}
