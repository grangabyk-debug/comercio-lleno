'use client'

import {useEffect,useState} from 'react'
import {usePathname} from 'next/navigation'
import Link from 'next/link'
import styles from './CookieConsent.module.css'

type Consent={analytics:boolean;marketing:boolean}
const STORAGE_KEY='cl_cookie_consent_v1'
const DEFAULTS:Consent={analytics:false,marketing:false}

function emitConsent(consent:Consent){
  window.dispatchEvent(new CustomEvent('cl-consent-changed',{detail:consent}))
  const clarity=(window as typeof window & {clarity?:((...args:unknown[])=>void)}).clarity
  if(clarity){
    clarity('consentv2',{
      ad_Storage:consent.marketing?'granted':'denied',
      analytics_Storage:consent.analytics?'granted':'denied',
    })
  }
}

export default function CookieConsent(){
  const pathname=usePathname()
  const[open,setOpen]=useState(false)
  const[customize,setCustomize]=useState(false)
  const[prefs,setPrefs]=useState<Consent>(DEFAULTS)

  const privateRoute=pathname.startsWith('/movil')||pathname.startsWith('/redesign')||pathname.startsWith('/login')||pathname.startsWith('/eliminar-cuenta')||pathname.startsWith('/politica-de-privacidad')||pathname.startsWith('/politica-de-cookies')

  useEffect(()=>{
    if(privateRoute)return
    try{
      const stored=localStorage.getItem(STORAGE_KEY)
      if(stored){
        const parsed=JSON.parse(stored) as Consent
        setPrefs(parsed)
        emitConsent(parsed)
      }else setOpen(true)
    }catch{setOpen(true)}

    const reopen=()=>{setCustomize(false);setOpen(true)}
    const nodes=Array.from(document.querySelectorAll<HTMLElement>('[data-cookie-settings]'))
    nodes.forEach(node=>node.addEventListener('click',reopen))
    return()=>nodes.forEach(node=>node.removeEventListener('click',reopen))
  },[privateRoute])

  if(privateRoute||!open)return null

  const save=(next:Consent)=>{
    setPrefs(next)
    localStorage.setItem(STORAGE_KEY,JSON.stringify(next))
    emitConsent(next)
    setOpen(false)
    setCustomize(false)
  }

  return <aside className={styles.card} role="dialog" aria-live="polite" aria-label="Preferencias de cookies">
    <div className={styles.topline}><span>PRIVACIDAD</span><button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar">×</button></div>
    <h2>Tu privacidad, sin vueltas.</h2>
    <p>Usamos cookies necesarias para que el sitio funcione y, si nos autorizás, cookies de analítica y marketing para entender qué funciona mejor. <Link href="/politica-de-cookies">Ver política de cookies</Link>.</p>

    {customize&&<div className={styles.preferences}>
      <div><span><b>Necesarias</b><small>Inicio de sesión, seguridad y preferencias básicas.</small></span><em>Siempre activas</em></div>
      <label><span><b>Analítica</b><small>Microsoft Clarity para comprender el uso del sitio.</small></span><input type="checkbox" checked={prefs.analytics} onChange={e=>setPrefs(value=>({...value,analytics:e.target.checked}))}/></label>
      <label><span><b>Marketing</b><small>Google Ads para medir campañas publicitarias.</small></span><input type="checkbox" checked={prefs.marketing} onChange={e=>setPrefs(value=>({...value,marketing:e.target.checked}))}/></label>
    </div>}

    <div className={styles.actions}>
      <button type="button" className={styles.necessary} onClick={()=>save(DEFAULTS)}>Solo necesarias</button>
      {customize
        ?<button type="button" className={styles.save} onClick={()=>save(prefs)}>Guardar preferencias</button>
        :<button type="button" className={styles.customize} onClick={()=>setCustomize(true)}>Personalizar</button>}
      <button type="button" className={styles.accept} onClick={()=>save({analytics:true,marketing:true})}>Aceptar todas</button>
    </div>
  </aside>
}
