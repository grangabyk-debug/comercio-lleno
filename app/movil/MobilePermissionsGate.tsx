'use client'

import { useEffect, useState } from 'react'
import { readTenantSession } from '@/lib/comercio/session'

const KEY='comercio-mobile-permissions-v2'
const PUSH_URL='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/customer-push'
type PermissionState='granted'|'denied'|'prompt'|'unsupported'|'unknown'

function bytes(value:string){const normalized=value.replace(/-/g,'+').replace(/_/g,'/');const binary=atob(normalized.padEnd(Math.ceil(normalized.length/4)*4,'='));return Uint8Array.from(binary,character=>character.charCodeAt(0))}

export default function MobilePermissionsGate(){
  const[open,setOpen]=useState(false)
  const[notifications,setNotifications]=useState<PermissionState>('unknown')
  const[camera,setCamera]=useState<PermissionState>('unknown')
  const[busy,setBusy]=useState(false)
  const[error,setError]=useState('')

  useEffect(()=>{
    let cancelled=false
    const sync=async()=>{
      if(typeof window==='undefined')return
      const session=readTenantSession()
      if(!session)return
      setNotifications('Notification'in window?(Notification.permission as PermissionState):'unsupported')
      try{if(navigator.permissions?.query){const status=await navigator.permissions.query({name:'camera' as PermissionName});if(!cancelled)setCamera(status.state as PermissionState)}}
      catch{if(!cancelled)setCamera(navigator.mediaDevices?.getUserMedia?'prompt':'unsupported')}
      if(!window.localStorage.getItem(KEY))window.setTimeout(()=>!cancelled&&setOpen(true),900)
    }
    void sync();return()=>{cancelled=true}
  },[])

  async function enablePush(){
    const session=readTenantSession();if(!session)throw new Error('Iniciá sesión nuevamente.')
    if(!('serviceWorker'in navigator)||!('PushManager'in window))throw new Error('Este navegador no permite notificaciones push en este modo.')
    const registration=await navigator.serviceWorker.register('/comercio-sw.js')
    const keyResponse=await fetch(PUSH_URL,{method:'POST',headers:{Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:JSON.stringify({action:'key'}),cache:'no-store'})
    const keyData=await keyResponse.json().catch(()=>({}));if(!keyResponse.ok||!keyData?.publicKey)throw new Error(keyData?.error||'No se pudo preparar el canal de notificaciones.')
    let subscription=await registration.pushManager.getSubscription()
    if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes(String(keyData.publicKey))})
    const serialized=subscription.toJSON()
    const saveResponse=await fetch(PUSH_URL,{method:'POST',headers:{Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:JSON.stringify({action:'subscribe',subscription:{endpoint:subscription.endpoint,keys:serialized.keys}}),cache:'no-store'})
    const saveData=await saveResponse.json().catch(()=>({}));if(!saveResponse.ok)throw new Error(saveData?.error||'No se pudo registrar este celular para avisos.')
  }

  async function prepareDevice(){
    setBusy(true);setError('')
    try{
      try{const AudioContextCtor=window.AudioContext||(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(AudioContextCtor){const ctx=new AudioContextCtor();await ctx.resume();const o=ctx.createOscillator(),g=ctx.createGain();g.gain.value=0.0001;o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+0.01);window.setTimeout(()=>void ctx.close(),80)}}catch{}
      try{navigator.vibrate?.(35)}catch{}
      let permission:NotificationPermission|'unsupported'='unsupported'
      if('Notification'in window){permission=Notification.permission;if(permission==='default')permission=await Notification.requestPermission();setNotifications(permission as PermissionState)}
      if(permission==='granted')await enablePush()
      window.localStorage.setItem(KEY,'1');setOpen(false)
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy(false)}
  }

  function dismiss(){window.localStorage.setItem(KEY,'1');setOpen(false)}
  if(!open||!readTenantSession())return null
  return <div style={{position:'fixed',inset:0,zIndex:10060,background:'rgba(7,8,12,.72)',backdropFilter:'blur(9px)',display:'grid',placeItems:'center',padding:18}}>
    <section style={{width:'min(440px,100%)',background:'#111218',color:'#fff',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:22,boxShadow:'0 28px 80px rgba(0,0,0,.48)'}}>
      <div style={{fontSize:12,fontWeight:800,letterSpacing:1.2,color:'#ff7a2f',marginBottom:8}}>PREPARAR ESTE CELULAR</div>
      <h2 style={{fontSize:25,lineHeight:1.08,margin:'0 0 10px'}}>Activá las funciones de Comercio Lleno</h2>
      <p style={{margin:'0 0 18px',color:'#c7c8d0',fontSize:15,lineHeight:1.45}}>Con un solo toque dejamos listo el sonido y la vibración del escáner y registramos este celular para recibir avisos de Comercio Lleno y respuestas de soporte.</p>
      <div style={{display:'grid',gap:9,marginBottom:18}}>
        <div style={{padding:'12px 14px',borderRadius:15,background:'rgba(255,255,255,.055)'}}><b style={{display:'block',fontSize:14}}>Sonido y vibración</b><span style={{fontSize:13,color:'#aaaeba'}}>Quedan preparados para confirmar lecturas del escáner.</span></div>
        <div style={{padding:'12px 14px',borderRadius:15,background:'rgba(255,255,255,.055)'}}><b style={{display:'block',fontSize:14}}>Notificaciones push</b><span style={{fontSize:13,color:'#aaaeba'}}>{notifications==='denied'?'Están bloqueadas en la configuración del navegador.':'Podrás recibir novedades y respuestas aunque Comercio Lleno no esté abierto.'}</span></div>
        <div style={{padding:'12px 14px',borderRadius:15,background:'rgba(255,255,255,.055)'}}><b style={{display:'block',fontSize:14}}>Cámara</b><span style={{fontSize:13,color:'#aaaeba'}}>{camera==='granted'?'Ya está autorizada.':'Se solicitará al abrir el escáner, justo cuando se necesita.'}</span></div>
      </div>
      {error&&<div style={{marginBottom:12,padding:'10px 12px',borderRadius:12,background:'rgba(220,60,60,.12)',color:'#ffaaa8',fontSize:12}}>{error}</div>}
      <button onClick={()=>void prepareDevice()} disabled={busy} style={{width:'100%',border:0,borderRadius:15,padding:'14px 16px',fontWeight:900,fontSize:15,background:'linear-gradient(135deg,#ff6b2c,#7b45ff)',color:'#fff',cursor:'pointer'}}>{busy?'Preparando…':'Preparar mi celular'}</button>
      <button onClick={dismiss} style={{width:'100%',border:0,background:'transparent',color:'#9b9da8',padding:'13px 10px 3px',fontSize:13,cursor:'pointer'}}>Ahora no</button>
    </section>
  </div>
}
