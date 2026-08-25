'use client'

import {useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

const PUSH_URL='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/postula-push'
const DISMISS_KEY='pm_push_device_prompt_dismissed_until_v1'
function bytes(value:string){const normalized=value.replace(/-/g,'+').replace(/_/g,'/');const binary=atob(normalized.padEnd(Math.ceil(normalized.length/4)*4,'='));return Uint8Array.from(binary,character=>character.charCodeAt(0))}
async function request(token:string,body:unknown){const r=await fetch(PUSH_URL,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.error||'No pudimos configurar las notificaciones.');return d}
async function registerCurrentDevice(token:string,askPermission:boolean){
 if(!('Notification'in window)||!('serviceWorker'in navigator)||!('PushManager'in window))throw new Error('Este navegador no ofrece notificaciones web compatibles.')
 let permission=Notification.permission
 if(permission==='denied')throw new Error('Las notificaciones están bloqueadas en este navegador.')
 if(permission!=='granted'&&askPermission)permission=await Notification.requestPermission()
 if(permission!=='granted')return null
 const registration=await navigator.serviceWorker.register('/postula-sw.js')
 let subscription=await registration.pushManager.getSubscription()
 if(!subscription){const key=await request(token,{action:'key'});subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes(String(key.publicKey||''))})}
 const serialized=subscription.toJSON();await request(token,{action:'subscribe',subscription:{endpoint:subscription.endpoint,keys:serialized.keys}})
 return subscription
}

export default function PushDevicePrompt(){
 const[show,setShow]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('')
 useEffect(()=>{let cancelled=false;const timer=window.setTimeout(()=>{void(async()=>{
  const{data}=await cvAuthClient().auth.getSession();if(cancelled||!data.session)return
  if(!('Notification'in window)||!('serviceWorker'in navigator)||!('PushManager'in window)||Notification.permission==='denied')return
  try{const registration=await navigator.serviceWorker.register('/postula-sw.js');const subscription=await registration.pushManager.getSubscription();if(subscription&&Notification.permission==='granted'){const serialized=subscription.toJSON();await request(data.session.access_token,{action:'subscribe',subscription:{endpoint:subscription.endpoint,keys:serialized.keys}});return}}catch{}
  const until=Number(localStorage.getItem(DISMISS_KEY)||0);if(Date.now()<until)return
  if(!cancelled)setShow(true)
 })()},1100);return()=>{cancelled=true;window.clearTimeout(timer)}},[])
 async function enable(){setBusy(true);setNotice('');try{const{data}=await cvAuthClient().auth.getSession();if(!data.session)throw new Error('Iniciá sesión nuevamente.');const subscription=await registerCurrentDevice(data.session.access_token,true);if(!subscription){setNotice('Necesitamos que aceptes el permiso del navegador para poder avisarte.');return}localStorage.removeItem(DISMISS_KEY);setNotice('Listo. Este dispositivo va a recibir avisos de mensajes y avances de tus postulaciones.');window.setTimeout(()=>setShow(false),1700)}catch(e){setNotice(e instanceof Error?e.message:'No pudimos activar las notificaciones.')}finally{setBusy(false)}}
 function later(){try{localStorage.setItem(DISMISS_KEY,String(Date.now()+7*24*60*60*1000))}catch{}setShow(false)}
 if(!show)return null
 return <div className="pm-push-device" role="dialog" aria-live="polite" aria-label="Activar notificaciones en este dispositivo"><div className="pm-push-device-icon">↗</div><div className="pm-push-device-copy"><span>AVISOS EN ESTE DISPOSITIVO</span><b>No te pierdas un mensaje o un avance.</b><p>Activá notificaciones acá. Si entrás desde otra computadora o teléfono, Postulá Mejor te lo va a ofrecer también en ese dispositivo.</p>{notice&&<small>{notice}</small>}</div><div className="pm-push-device-actions"><button type="button" className="primary" disabled={busy} onClick={()=>void enable()}>{busy?'Activando…':'Activar avisos'}</button><button type="button" disabled={busy} onClick={later}>Ahora no</button></div></div>
}
