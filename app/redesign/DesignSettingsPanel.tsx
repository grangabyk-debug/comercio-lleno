'use client'

import { useEffect,useState } from 'react'
import { loadDesignSettings,readCachedDesignSettings,saveDesignSettings,type DesignSettings } from '@/lib/comercio/design-settings'
import type { TenantSession } from '@/lib/comercio/types'
import styles from './design-settings-panel.module.css'

type Props={session:TenantSession;message:(m:string)=>void}

export default function DesignSettingsPanel({session,message}:Props){
  const[value,setValue]=useState<DesignSettings>(()=>readCachedDesignSettings(session.companyId))
  const[saved,setSaved]=useState<DesignSettings>(()=>readCachedDesignSettings(session.companyId))
  const[busy,setBusy]=useState(false),[error,setError]=useState('')

  function preview(next:DesignSettings){
    setValue(next)
    window.dispatchEvent(new CustomEvent<DesignSettings>('comercio:design-settings',{detail:next}))
  }

  useEffect(()=>{let cancelled=false;loadDesignSettings(session).then(next=>{if(cancelled)return;setValue(next);setSaved(next);window.dispatchEvent(new CustomEvent<DesignSettings>('comercio:design-settings',{detail:next}))}).catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:String(e))});return()=>{cancelled=true}},[session.companyId,session.token])

  async function save(){setBusy(true);setError('');try{const next=await saveDesignSettings(session,value);setValue(next);setSaved(next);message('Diseño guardado para este comercio.')}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
  function restore(){preview(saved);message('Volviste al último diseño guardado.')}
  const dirty=JSON.stringify(value)!==JSON.stringify(saved)

  return <section className={styles.panel}>
    <div className={styles.head}><div><span>APARIENCIA</span><h3>Diseño de la interfaz</h3><p>Los cambios se previsualizan al instante en toda la aplicación. Guardalos para que queden aplicados a este comercio en todos sus equipos.</p></div><div className={styles.live}>● Vista previa en vivo</div></div>

    <div className={styles.group}><div className={styles.groupHead}><div><b>Tamaño de texto e interfaz</b><small>Cambia el tamaño general de títulos, menú, botones, tablas, campos y textos.</small></div></div><div className={styles.options}>
      <button className={value.fontSize==='compact'?styles.selected:''} onClick={()=>preview({...value,fontSize:'compact'})}><strong>Aa</strong><b>Compacto</b><small>Más información en pantalla. Texto aproximadamente 8–10% más chico.</small></button>
      <button className={value.fontSize==='standard'?styles.selected:''} onClick={()=>preview({...value,fontSize:'standard'})}><strong>Aa</strong><b>Equilibrado</b><small>Tamaño normal recomendado para la mayoría de las computadoras.</small></button>
      <button className={value.fontSize==='large'?styles.selected:''} onClick={()=>preview({...value,fontSize:'large'})}><strong>Aa</strong><b>Grande</b><small>Texto y controles más grandes para mejorar lectura y uso a distancia.</small></button>
    </div></div>

    <div className={styles.group}><div className={styles.groupHead}><div><b>Grosor de la tipografía</b><small>No cambia el contraste ni los colores: modifica qué tan fina o marcada se ve la letra.</small></div></div><div className={styles.options}>
      <button className={value.fontWeight==='soft'?styles.selected:''} onClick={()=>preview({...value,fontWeight:'soft'})}><strong className={styles.soft}>Texto</strong><b>Suave</b><small>Menos negrita. Aspecto más liviano y limpio.</small></button>
      <button className={value.fontWeight==='balanced'?styles.selected:''} onClick={()=>preview({...value,fontWeight:'balanced'})}><strong className={styles.balanced}>Texto</strong><b>Equilibrado</b><small>Peso intermedio y buena lectura. Recomendado.</small></button>
      <button className={value.fontWeight==='strong'?styles.selected:''} onClick={()=>preview({...value,fontWeight:'strong'})}><strong className={styles.strong}>Texto</strong><b>Fuerte</b><small>Más negrita y presencia en títulos, botones, tablas y menú.</small></button>
    </div></div>

    <div className={styles.group}><div className={styles.groupHead}><div><b>Estilo de letra</b><small>Cambia la familia tipográfica de toda la interfaz, no el tamaño.</small></div></div><div className={`${styles.options} ${styles.two}`}>
      <button className={value.fontFamily==='modern'?styles.selected:''} onClick={()=>preview({...value,fontFamily:'modern'})}><strong className={styles.modern}>Comercio Lleno</strong><b>Moderna</b><small>Inter / sistema. Más actual y compacta.</small></button>
      <button className={value.fontFamily==='classic'?styles.selected:''} onClick={()=>preview({...value,fontFamily:'classic'})}><strong className={styles.classic}>Comercio Lleno</strong><b>Clásica</b><small>Arial / Helvetica. Formas familiares y muy legibles.</small></button>
    </div></div>

    <div className={styles.preview}><span>ASÍ SE VE</span><h4>Ejemplo de lectura</h4><p>Productos, Caja diaria, Ventas y Gestión van a respetar esta combinación.</p><div><button>Botón de ejemplo</button><b>$ 123.456</b><small>Texto secundario del sistema</small></div></div>
    {error&&<div className={styles.error}>{error}</div>}
    <div className={styles.actions}><small>{dirty?'Tenés cambios sin guardar.':'El diseño actual está guardado.'}</small><div>{dirty&&<button className={styles.secondary} onClick={restore}>Deshacer cambios</button>}<button className={styles.primary} disabled={busy||!dirty} onClick={()=>void save()}>{busy?'Guardando…':'Guardar diseño'}</button></div></div>
  </section>
}
