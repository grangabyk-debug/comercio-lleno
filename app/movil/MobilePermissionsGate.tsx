'use client'

import { useEffect, useState } from 'react'
import { readTenantSession } from '@/lib/comercio/session'

const KEY='comercio-mobile-permissions-v1'

type PermissionState='granted'|'denied'|'prompt'|'unsupported'|'unknown'

export default function MobilePermissionsGate(){
  const[open,setOpen]=useState(false)
  const[notifications,setNotifications]=useState<PermissionState>('unknown')
  const[camera,setCamera]=useState<PermissionState>('unknown')
  const[busy,setBusy]=useState(false)

  useEffect(()=>{
    let cancelled=false
    const sync=async()=>{
      if(typeof window==='undefined')return
      const session=readTenantSession()
      if(!session)return
      setNotifications('Notification'in window?(Notification.permission as PermissionState):'unsupported')
      try{
        if(navigator.permissions?.query){
          const status=await navigator.permissions.query({name:'camera' as PermissionName})
          if(!cancelled)setCamera(status.state as PermissionState)
        }
      }catch{if(!cancelled)setCamera(navigator.mediaDevices?.getUserMedia?'prompt':'unsupported')}
      if(!window.localStorage.getItem(KEY))window.setTimeout(()=>!cancelled&&setOpen(true),900)
    }
    void sync()
    return()=>{cancelled=true}
  },[])

  async function prepareDevice(){
    setBusy(true)
    try{
      try{
        const AudioContextCtor=window.AudioContext||(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext
        if(AudioContextCtor){const ctx=new AudioContextCtor();await ctx.resume();const o=ctx.createOscillator(),g=ctx.createGain();g.gain.value=0.0001;o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+0.01);window.setTimeout(()=>void ctx.close(),80)}
      }catch{}
      try{navigator.vibrate?.(35)}catch{}
      if('serviceWorker'in navigator)await navigator.serviceWorker.register('/comercio-sw.js').catch(()=>undefined)
      if('Notification'in window&&Notification.permission==='default'){
        const result=await Notification.requestPermission()
        setNotifications(result as PermissionState)
      }else if('Notification'in window)setNotifications(Notification.permission as PermissionState)
      window.localStorage.setItem(KEY,'1')
      setOpen(false)
    }finally{setBusy(false)}
  }

  function dismiss(){window.localStorage.setItem(KEY,'1');setOpen(false)}

  if(!open||!readTenantSession())return null
  return <div style={{position:'fixed',inset:0,zIndex:10020,background:'rgba(7,8,12,.72)',backdropFilter:'blur(9px)',display:'grid',placeItems:'center',padding:18}}>
    <section style={{width:'min(440px,100%)',background:'#111218',color:'#fff',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:22,boxShadow:'0 28px 80px rgba(0,0,0,.48)'}}>
      <div style={{fontSize:12,fontWeight:800,letterSpacing:1.2,color:'#ff7a2f',marginBottom:8}}>PREPARAR ESTE CELULAR</div>
      <h2 style={{fontSize:25,lineHeight:1.08,margin:'0 0 10px'}}>Activá las funciones de Comercio Lleno</h2>
      <p style={{margin:'0 0 18px',color:'#c7c8d0',fontSize:15,lineHeight:1.45}}>Con un solo toque dejamos listo el sonido y la vibración del escáner y te pedimos permiso para recibir notificaciones importantes.</p>
      <div style={{display:'grid',gap:9,marginBottom:18}}>
        <div style={{padding:'12px 14px',borderRadius:15,background:'rgba(255,255,255,.055)'}}><b style={{display:'block',fontSize:14}}>Sonido y vibración</b><span style={{fontSize:13,color:'#aaaeba'}}>Se activan con tu interacción. No requieren un permiso adicional del sistema.</span></div>
        <div style={{padding:'12px 14px',borderRadius:15,background:'rgba(255,255,255,.055)'}}><b style={{display:'block',fontSize:14}}>Notificaciones</b><span style={{fontSize:13,color:'#aaaeba'}}>{notifications==='denied'?'Están bloqueadas en el navegador.':'Te pediremos autorización para avisos importantes.'}</span></div>
        <div style={{padding:'12px 14px',borderRadius:15,background:'rgba(255,255,255,.055)'}}><b style={{display:'block',fontSize:14}}>Cámara</b><span style={{fontSize:13,color:'#aaaeba'}}>{camera==='granted'?'Ya está autorizada.':'El permiso se solicitará cuando abras el escáner, justo cuando se necesita.'}</span></div>
      </div>
      <button onClick={()=>void prepareDevice()} disabled={busy} style={{width:'100%',border:0,borderRadius:15,padding:'14px 16px',fontWeight:900,fontSize:15,background:'linear-gradient(135deg,#ff6b2c,#7b45ff)',color:'#fff',cursor:'pointer'}}>{busy?'Preparando…':'Preparar mi celular'}</button>
      <button onClick={dismiss} style={{width:'100%',border:0,background:'transparent',color:'#9b9da8',padding:'13px 10px 3px',fontSize:13,cursor:'pointer'}}>Ahora no</button>
    </section>
  </div>
}
