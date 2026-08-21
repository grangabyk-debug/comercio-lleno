'use client'

import {useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type OptionalPrefs={applications:boolean;interviews:boolean;matches:boolean}
type PermissionState='default'|'granted'|'denied'|'unsupported'
const defaults:OptionalPrefs={applications:true,interviews:true,matches:false}

export default function NotificationSettings({audience='candidate'}:{audience?:'candidate'|'employer'}){
 const storageKey=`pm_notification_preferences_v1_${audience}`
 const [authed,setAuthed]=useState<boolean|null>(null)
 const [prefs,setPrefs]=useState<OptionalPrefs>(defaults)
 const [browserEnabled,setBrowserEnabled]=useState(false)
 const [permission,setPermission]=useState<PermissionState>('default')
 const [notice,setNotice]=useState('')
 useEffect(()=>{
  cvAuthClient().auth.getSession().then(({data})=>setAuthed(Boolean(data.session))).catch(()=>setAuthed(false))
  try{const raw=localStorage.getItem(storageKey);if(raw){const parsed=JSON.parse(raw);setPrefs({...defaults,...parsed.prefs});setBrowserEnabled(Boolean(parsed.browserEnabled))}}catch{}
  if(typeof window==='undefined'||!('Notification'in window))setPermission('unsupported')
  else setPermission(Notification.permission)
 },[storageKey])
 function persist(next:OptionalPrefs,enabled=browserEnabled){setPrefs(next);try{localStorage.setItem(storageKey,JSON.stringify({prefs:next,browserEnabled:enabled,updatedAt:new Date().toISOString()}))}catch{}}
 function toggle(key:keyof OptionalPrefs){persist({...prefs,[key]:!prefs[key]})}
 async function enableBrowser(){
  setNotice('')
  if(typeof window==='undefined'||!('Notification'in window)){setPermission('unsupported');setNotice('Este navegador no ofrece notificaciones web compatibles.');return}
  try{
   const result=await Notification.requestPermission();setPermission(result)
   if(result==='granted'){
    setBrowserEnabled(true);try{localStorage.setItem(storageKey,JSON.stringify({prefs,browserEnabled:true,updatedAt:new Date().toISOString()}))}catch{}
    setNotice('Notificaciones activadas en este dispositivo.')
    try{new Notification('Postulá Mejor',{body:'Listo. Este dispositivo puede mostrarte avisos cuando corresponda.',tag:'pm-notifications-ready'})}catch{}
   }else if(result==='denied'){setBrowserEnabled(false);setNotice('El navegador bloqueó las notificaciones. Podés habilitarlas más adelante desde los permisos del sitio.')}
  }catch{setNotice('No pudimos solicitar el permiso de notificaciones en este dispositivo.')}
 }
 function pauseBrowser(){setBrowserEnabled(false);try{localStorage.setItem(storageKey,JSON.stringify({prefs,browserEnabled:false,updatedAt:new Date().toISOString()}))}catch{}setNotice('Avisos del navegador pausados para este dispositivo.')}
 if(authed!==true)return null
 const roleCopy=audience==='employer'?'candidatos, entrevistas y actividad de tus búsquedas':'postulaciones, entrevistas y nuevas oportunidades'
 return <section className="pm16-notifications" aria-labelledby={`pm16-title-${audience}`}>
  <div className="pm16-notif-head"><div><span>NOTIFICACIONES</span><h2 id={`pm16-title-${audience}`}>Enterate de lo importante. Nada más.</h2><p>Elegí cómo querés enterarte de {roleCopy}. Los avisos dentro de la plataforma y los del navegador se manejan por separado.</p></div><div className="pm16-browser-card" data-on={browserEnabled&&permission==='granted'}><small>ESTE DISPOSITIVO</small><b>{permission==='granted'?(browserEnabled?'Notificaciones activas':'Permiso disponible · avisos pausados'):permission==='denied'?'Notificaciones bloqueadas':permission==='unsupported'?'No compatible':'Notificaciones sin activar'}</b>{permission==='granted'&&browserEnabled?<button type="button" onClick={pauseBrowser}>Pausar en este dispositivo</button>:permission!=='denied'&&permission!=='unsupported'?<button type="button" onClick={enableBrowser}>{permission==='granted'?'Reactivar':'Activar notificaciones'}</button>:<span className="pm16-browser-help">Cambialo desde los permisos del sitio en tu navegador.</span>}</div></div>
  <div className="pm16-notif-grid">
   <article className="pm16-notif-row locked"><div><span className="pm16-notif-icon">✦</span><div><b>Mensajes y contactos</b><p>{audience==='employer'?'Cuando un candidato te escribe o responde':'Cuando una empresa o persona te contacta por una postulación o Trabajo Flex'}</p></div></div><span className="pm16-always">Siempre dentro de la app</span></article>
   <article className="pm16-notif-row"><div><span className="pm16-notif-icon">↗</span><div><b>Cambios en postulaciones</b><p>Avances, cambios de estado y novedades importantes.</p></div></div><button type="button" className="pm16-switch" data-on={prefs.applications} onClick={()=>toggle('applications')} aria-pressed={prefs.applications}><i/></button></article>
   <article className="pm16-notif-row"><div><span className="pm16-notif-icon">◷</span><div><b>Entrevistas y recordatorios</b><p>Confirmaciones, horarios y recordatorios relacionados.</p></div></div><button type="button" className="pm16-switch" data-on={prefs.interviews} onClick={()=>toggle('interviews')} aria-pressed={prefs.interviews}><i/></button></article>
   <article className="pm16-notif-row"><div><span className="pm16-notif-icon">◎</span><div><b>{audience==='employer'?'Actividad y candidatos relevantes':'Nuevas coincidencias y empleos'}</b><p>{audience==='employer'?'Nuevas respuestas o actividad que puede requerir atención.':'Oportunidades nuevas que coincidan con tus preferencias.'}</p></div></div><button type="button" className="pm16-switch" data-on={prefs.matches} onClick={()=>toggle('matches')} aria-pressed={prefs.matches}><i/></button></article>
   <article className="pm16-notif-row locked"><div><span className="pm16-notif-icon">⌾</span><div><b>Seguridad de la cuenta</b><p>Accesos, recupero, cambios críticos y avisos necesarios para proteger la cuenta.</p></div></div><span className="pm16-always">Siempre dentro de la app</span></article>
  </div>
  {notice&&<div className="pm16-notif-notice">{notice}</div>}
  <p className="pm16-notif-foot">El permiso del navegador siempre depende de la persona y del dispositivo. Podés cambiar estas preferencias cuando quieras. Algunas comunicaciones necesarias para acceso y seguridad pueden seguir mostrándose dentro de Postulá Mejor.</p>
 </section>
}
