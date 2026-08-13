'use client'

import { useEffect,useState } from 'react'
import { loadMobileSettings,readCachedMobileSettings,saveMobileSettings,type MobileSettings } from '@/lib/comercio/mobile-settings'
import type { TenantSession } from '@/lib/comercio/types'
import styles from './settings-next.module.css'

export default function MobileSettingsPanel({session,message}:{session:TenantSession;message:(m:string)=>void}){
  const[value,setValue]=useState<MobileSettings>(()=>readCachedMobileSettings(session.companyId))
  const[busy,setBusy]=useState(false),[saved,setSaved]=useState(false),[error,setError]=useState('')
  useEffect(()=>{let cancelled=false;loadMobileSettings(session).then(v=>{if(!cancelled)setValue(v)}).catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:String(e))});return()=>{cancelled=true}},[session.companyId,session.token])
  async function save(){setBusy(true);setSaved(false);setError('');try{setValue(await saveMobileSettings(session,value));setSaved(true);message('Configuración móvil guardada.');window.setTimeout(()=>setSaved(false),2600)}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
  return <section className={styles.panel}>
    <div className={styles.title}><div><h3>Móvil</h3><p>Configurá la experiencia simplificada de Comercio Lleno en teléfonos. Los cambios quedan asociados sólo a este comercio.</p></div></div>
    <label className={styles.switch}><span><b>Escáner de productos con cámara</b><small>Leer códigos de barras, consultar productos y editar precio o stock desde el celular.</small></span><input type="checkbox" checked={value.scannerEnabled} onChange={e=>setValue({...value,scannerEnabled:e.target.checked})}/></label>
    <label className={styles.switch}><span><b>Redirección automática a Móvil</b><small>Al entrar desde un teléfono, abre directamente la versión simplificada.</small></span><input type="checkbox" checked={value.autoRedirect} onChange={e=>setValue({...value,autoRedirect:e.target.checked})}/></label>
    <label className={styles.switch}><span><b>Burbuja flotante de IA</b><small>Muestra el asistente IA arrastrable dentro de Comercio Lleno Móvil.</small></span><input type="checkbox" checked={value.aiEnabled} onChange={e=>setValue({...value,aiEnabled:e.target.checked})}/></label>
    {error&&<div className={styles.error}>{error}</div>}
    <div className={styles.saveRow}><small style={{color:saved?'#14824f':undefined,fontWeight:saved?900:undefined}}>{saved?'✓ Configuración móvil guardada':'Sólo el propietario puede modificar estos ajustes.'}</small><button className={styles.primary} disabled={busy} onClick={()=>void save()}>{busy?'Guardando…':'Guardar configuración móvil'}</button></div>
  </section>
}
