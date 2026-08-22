'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'

type Consent={analytics:boolean;marketing:boolean;version:string}
const KEY='pm_cookie_consent_v1'
const VERSION='2026-08-21'
const NECESSARY:Consent={analytics:false,marketing:false,version:VERSION}

function emit(value:Consent){
 if(typeof window==='undefined')return
 window.dispatchEvent(new CustomEvent('pm-consent-changed',{detail:value}))
}

export default function PostulaCookieConsent(){
 const [open,setOpen]=useState(false)
 const [custom,setCustom]=useState(false)
 const [prefs,setPrefs]=useState<Consent>(NECESSARY)
 useEffect(()=>{
  try{
   const raw=localStorage.getItem(KEY)
   if(raw){const parsed=JSON.parse(raw) as Consent;setPrefs({...NECESSARY,...parsed});emit({...NECESSARY,...parsed})}
   else setOpen(true)
  }catch{setOpen(true)}
  const reopen=()=>{setCustom(true);setOpen(true)}
  window.addEventListener('pm-open-cookie-settings',reopen)
  const click=(e:Event)=>{const el=e.target instanceof Element?e.target.closest('[data-postula-cookie-settings]'):null;if(el){e.preventDefault();reopen()}}
  document.addEventListener('click',click)
  return()=>{window.removeEventListener('pm-open-cookie-settings',reopen);document.removeEventListener('click',click)}
 },[])
 function save(next:Consent){const normalized={...next,version:VERSION};setPrefs(normalized);try{localStorage.setItem(KEY,JSON.stringify({...normalized,updatedAt:new Date().toISOString()}))}catch{};emit(normalized);setOpen(false);setCustom(false)}
 if(!open)return null
 return <aside className="pm-cookie-card" role="dialog" aria-modal="false" aria-label="Preferencias de privacidad y cookies">
  <div className="pm-cookie-top"><span>PRIVACIDAD Y COOKIES</span><button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar">×</button></div>
  <h2>Vos elegís qué permitís.</h2>
  <p>Usamos almacenamiento técnico necesario para iniciar sesión, proteger tu cuenta y recordar preferencias. La analítica y el marketing sólo se habilitan si los aceptás. <Link href="/privacidad#cookies">Más información</Link>.</p>
  {custom&&<div className="pm-cookie-options">
   <div><span><b>Necesarias</b><small>Sesión, seguridad, preferencias y funciones esenciales.</small></span><strong>Siempre activas</strong></div>
   <label><span><b>Analítica</b><small>Nos ayuda a entender cómo se usa Postulá Mejor para mejorar la experiencia.</small></span><input type="checkbox" checked={prefs.analytics} onChange={e=>setPrefs(v=>({...v,analytics:e.target.checked}))}/></label>
   <label><span><b>Marketing</b><small>Medición de campañas y conversiones publicitarias cuando corresponda.</small></span><input type="checkbox" checked={prefs.marketing} onChange={e=>setPrefs(v=>({...v,marketing:e.target.checked}))}/></label>
  </div>}
  <div className="pm-cookie-actions">
   <button type="button" className="necessary" onClick={()=>save(NECESSARY)}>Sólo necesarias</button>
   {custom?<button type="button" className="custom" onClick={()=>save(prefs)}>Guardar preferencias</button>:<button type="button" className="custom" onClick={()=>setCustom(true)}>Configurar</button>}
   <button type="button" className="accept" onClick={()=>save({analytics:true,marketing:true,version:VERSION})}>Aceptar todas</button>
  </div>
 </aside>
}
