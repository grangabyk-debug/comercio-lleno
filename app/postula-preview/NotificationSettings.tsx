'use client'

import {useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type OptionalPrefs={applications:boolean;interviews:boolean;matches:boolean}
type PermissionState='default'|'granted'|'denied'|'unsupported'
const defaults:OptionalPrefs={applications:true,interviews:true,matches:false}
const PUSH_URL='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/postula-push'

function bytes(value:string){const normalized=value.replace(/-/g,'+').replace(/_/g,'/');const binary=atob(normalized.padEnd(Math.ceil(normalized.length/4)*4,'='));return Uint8Array.from(binary,character=>character.charCodeAt(0))}
async function pushRequest(token:string,body:unknown){const response=await fetch(PUSH_URL,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.error||'No pudimos configurar las notificaciones.');return data}
async function subscribeDevice(token:string){if(!('serviceWorker'in navigator)||!('PushManager'in window))throw new Error('Este navegador no ofrece Web Push compatible.');const registration=await navigator.serviceWorker.register('/postula-sw.js');const keyData=await pushRequest(token,{action:'key'});let subscription=await registration.pushManager.getSubscription();if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes(String(keyData.publicKey||''))});const serialized=subscription.toJSON();await pushRequest(token,{action:'subscribe',subscription:{endpoint:subscription.endpoint,keys:serialized.keys}});return subscription}

export default function NotificationSettings({audience='candidate'}:{audience?:'candidate'|'employer'}){
 const storageKey=`pm_notification_preferences_v1_${audience}`
 const [authed,setAuthed]=useState<boolean|null>(null)
 const [prefs,setPrefs]=useState<OptionalPrefs>(defaults)
 const [browserEnabled,setBrowserEnabled]=useState(false)
 const [permission,setPermission]=useState<PermissionState>('default')
 const [notice,setNotice]=useState('')
 const [busy,setBusy]=useState(false)
 useEffect(()=>{
  cvAuthClient().auth.getSession().then(async({data})=>{setAuthed(Boolean(data.session));if(!data.session)return;if(typeof window==='undefined'||!('Notification'in window)||Notification.permission!=='granted'||!('serviceWorker'in navigator)||!('PushManager'in window))return;try{const registration=await navigator.serviceWorker.getRegistration('/postula-sw.js');const subscription=await registration?.pushManager.getSubscription();if(subscription)setBrowserEnabled(true)}catch{}}).catch(()=>setAuthed(false))
  try{const raw=localStorage.getItem(storageKey);if(raw){const parsed=JSON.parse(raw);setPrefs({...defaults,...parsed.prefs});setBrowserEnabled(Boolean(parsed.browserEnabled))}}catch{}
  if(typeof window==='undefined'||!('Notification'in window))setPermission('unsupported')
  else setPermission(Notification.permission)
 },[storageKey])
 function persist(next:OptionalPrefs,enabled=browserEnabled){setPrefs(next);try{localStorage.setItem(storageKey,JSON.stringify({prefs:next,browserEnabled:enabled,updatedAt:new Date().toISOString()}))}catch{}}
 function toggle(key:keyof OptionalPrefs){persist({...prefs,[key]:!prefs[key]})}
 async function enableBrowser(){
  setNotice('');setBusy(true)
  if(typeof window==='undefined'||!('Notification'in window)){setPermission('unsupported');setNotice('Este navegador no ofrece notificaciones web compatibles.');setBusy(false);return}
  try{
   const result=Notification.permission==='granted'?'granted':await Notification.requestPermission();setPermission(result)
   if(result==='granted'){
    const {data}=await cvAuthClient().auth.getSession();if(!data.session)throw new Error('Iniciá sesión nuevamente para registrar este dispositivo.')
    await subscribeDevice(data.session.access_token)
    const next={...prefs,applications:true,interviews:true};setBrowserEnabled(true);persist(next,true)
    const test=await pushRequest(data.session.access_token,{action:'test'})
    setNotice(test?.sent>0?'Notificaciones activadas. Te enviamos una prueba real a este dispositivo.':'Notificaciones activadas. El dispositivo quedó registrado para recibir avisos.')
   }else if(result==='denied'){setBrowserEnabled(false);setNotice('El navegador bloqueó las notificaciones. Podés habilitarlas más adelante desde los permisos del sitio.')}
  }catch(e){setBrowserEnabled(false);setNotice(e instanceof Error?e.message:'No pudimos activar las notificaciones en este dispositivo.')}
  finally{setBusy(false)}
 }
 async function pauseBrowser(){
  setNotice('');setBusy(true)
  try{const {data}=await cvAuthClient().auth.getSession();const registration='serviceWorker'in navigator?await navigator.serviceWorker.getRegistration('/postula-sw.js'):undefined;const subscription=await registration?.pushManager.getSubscription();if(data.session&&subscription)await pushRequest(data.session.access_token,{action:'unsubscribe',subscription:{endpoint:subscription.endpoint}});if(subscription)await subscription.unsubscribe();setBrowserEnabled(false);persist(prefs,false);setNotice('Avisos del navegador pausados para este dispositivo.')}
  catch(e){setNotice(e instanceof Error?e.message:'No pudimos pausar las notificaciones.')}
  finally{setBusy(false)}
 }
 async function sendTest(){setNotice('');setBusy(true);try{const {data}=await cvAuthClient().auth.getSession();if(!data.session)throw new Error('Iniciá sesión nuevamente.');const test=await pushRequest(data.session.access_token,{action:'test'});setNotice(test?.sent>0?'Prueba enviada. Deberías recibir una notificación real en este dispositivo.':'No encontramos un dispositivo activo para esta cuenta. Reactivá las notificaciones.')}catch(e){setNotice(e instanceof Error?e.message:'No pudimos enviar la prueba.')}finally{setBusy(false)}}
 if(authed!==true)return null
 const roleCopy=audience==='employer'?'candidatos, entrevistas y actividad de tus búsquedas':'postulaciones, entrevistas y nuevas oportunidades'
 return <section className="pm16-notifications" aria-labelledby={`pm16-title-${audience}`}>
  <div className="pm16-notif-head"><div><span>NOTIFICACIONES</span><h2 id={`pm16-title-${audience}`}>Enterate de lo importante. Nada más.</h2><p>Elegí cómo querés enterarte de {roleCopy}. Podés recibir avisos tanto en PC como en móvil, según los permisos de cada dispositivo.</p></div><div className="pm16-browser-card" data-on={browserEnabled&&permission==='granted'}><small>ESTE DISPOSITIVO</small><b>{permission==='granted'?(browserEnabled?'Web Push activo':'Permiso disponible · avisos pausados'):permission==='denied'?'Notificaciones bloqueadas':permission==='unsupported'?'No compatible':'Notificaciones sin activar'}</b>{permission==='granted'&&browserEnabled?<><button type="button" onClick={()=>void sendTest()} disabled={busy}>{busy?'Enviando…':'Enviar prueba'}</button><button type="button" onClick={()=>void pauseBrowser()} disabled={busy}>Pausar en este dispositivo</button></>:permission!=='denied'&&permission!=='unsupported'?<button type="button" onClick={()=>void enableBrowser()} disabled={busy}>{busy?'Activando…':permission==='granted'?'Reactivar':'Activar notificaciones'}</button>:<span className="pm16-browser-help">Cambialo desde los permisos del sitio en tu navegador.</span>}</div></div>
  <div className="pm16-notif-grid">
   <article className="pm16-notif-row locked"><div><span className="pm16-notif-icon">✦</span><div><b>Mensajes y contactos</b><p>{audience==='employer'?'Cuando un candidato te escribe o responde':'Cuando una empresa o persona te contacta por una postulación o Trabajo Flex'}</p></div></div><span className="pm16-always">Siempre activo en Postulá Mejor · aviso en el dispositivo si diste permiso</span></article>
   <article className="pm16-notif-row"><div><span className="pm16-notif-icon">↗</span><div><b>Cambios en postulaciones</b><p>Avances, cambios de estado y novedades importantes.</p></div></div><button type="button" className="pm16-switch" data-on={prefs.applications} onClick={()=>toggle('applications')} aria-pressed={prefs.applications}><i/></button></article>
   <article className="pm16-notif-row"><div><span className="pm16-notif-icon">◷</span><div><b>Entrevistas y recordatorios</b><p>Confirmaciones, horarios y recordatorios relacionados.</p></div></div><button type="button" className="pm16-switch" data-on={prefs.interviews} onClick={()=>toggle('interviews')} aria-pressed={prefs.interviews}><i/></button></article>
   <article className="pm16-notif-row"><div><span className="pm16-notif-icon">◎</span><div><b>{audience==='employer'?'Actividad y candidatos relevantes':'Nuevas coincidencias y empleos'}</b><p>{audience==='employer'?'Nuevas respuestas o actividad que puede requerir atención.':'Oportunidades nuevas que coincidan con tus preferencias.'}</p></div></div><button type="button" className="pm16-switch" data-on={prefs.matches} onClick={()=>toggle('matches')} aria-pressed={prefs.matches}><i/></button></article>
   <article className="pm16-notif-row locked"><div><span className="pm16-notif-icon">⌾</span><div><b>Seguridad de la cuenta</b><p>Accesos, recupero, cambios críticos y avisos necesarios para proteger la cuenta.</p></div></div><span className="pm16-always">Siempre activo en Postulá Mejor · aviso en el dispositivo si diste permiso</span></article>
  </div>
  {notice&&<div className="pm16-notif-notice">{notice}</div>}
  <p className="pm16-notif-foot">El permiso depende de cada navegador y dispositivo. Podés usar Postulá Mejor desde PC o móvil y cambiar estas preferencias cuando quieras. Los avisos esenciales de mensajes y seguridad permanecen visibles dentro de tu cuenta.</p>
 </section>
}
