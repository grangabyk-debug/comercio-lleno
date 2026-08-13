'use client'

import { useEffect, useState } from 'react'
import SettingsTenant from './SettingsTenant'
import styles from './settings-tenant.module.css'
import {
  loadMobileSettings,
  readCachedMobileSettings,
  saveMobileSettings,
  type MobileSettings,
} from '@/lib/comercio/mobile-settings'
import type { ArcaHealth } from '@/lib/comercio/api'
import type { CommerceSnapshot, DeviceSettings, TenantSession } from '@/lib/comercio/types'

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

function MobileSettingsCard({ session, message }: { session: TenantSession; message: (m: string) => void }) {
  const [value, setValue] = useState<MobileSettings>(() => readCachedMobileSettings(session.companyId))
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    loadMobileSettings(session).then(next => { if (!cancelled) setValue(next) }).catch(() => {})
    return () => { cancelled = true }
  }, [session.companyId, session.token])

  async function save() {
    setBusy(true); setError(''); setSaved(false)
    try {
      const next = await saveMobileSettings(session, value)
      setValue(next); setSaved(true)
      message(next.scannerEnabled ? 'Escáner móvil activado.' : 'Escáner móvil desactivado.')
      window.setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  return <div style={{marginBottom:16}} className={styles.panel}>
    <div><h3 style={{margin:0}}>Comercio Lleno Móvil</h3><p style={{margin:'5px 0 0'}}>Configuración de la experiencia simplificada para celulares.</p></div>
    <label className={styles.switch}>
      <span><b>Escáner de productos con cámara</b><small>Permite leer códigos de barras, consultar precios y editar/agregar productos desde el celular.</small></span>
      <input type="checkbox" checked={value.scannerEnabled} onChange={e => setValue({scannerEnabled:e.target.checked})}/>
    </label>
    {error && <div className={styles.error}>{error}</div>}
    <div className={styles.saveRow}><small style={{color:saved?'#14824f':undefined,fontWeight:saved?900:undefined}}>{saved?'✓ Configuración móvil guardada':'Sólo el propietario puede modificar este ajuste.'}</small><button className={styles.save} disabled={busy} onClick={save}>{busy?'Guardando…':'Guardar configuración móvil'}</button></div>
  </div>
}

export default function SettingsWithMobile(props: Props) {
  return <>
    {props.session.role === 'owner' && <MobileSettingsCard session={props.session} message={props.message}/>} 
    <SettingsTenant {...props}/>
  </>
}
