'use client'

import { useEffect, useState } from 'react'

type PromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed';platform:string}>}
type InstallWindow=Window&{__clDedicatedInstallPrompt?:PromptEvent|null;__clDedicatedInstalled?:boolean}

function standalone(){
  const nav=navigator as Navigator&{standalone?:boolean}
  return window.matchMedia?.('(display-mode: standalone)').matches||nav.standalone===true
}

export default function InstallClient(){
  const[ready,setReady]=useState(false)
  const[installed,setInstalled]=useState(false)
  const[status,setStatus]=useState('Comprobando si Chrome puede instalar la aplicación…')

  useEffect(()=>{
    const w=window as InstallWindow
    setInstalled(standalone()||Boolean(w.__clDedicatedInstalled))
    const sync=()=>{
      const prompt=w.__clDedicatedInstallPrompt||null
      if(prompt){setReady(true);setStatus('Todo listo. Tocá “Instalar ahora” para agregar Comercio Lleno a tu teléfono.')}
    }
    sync()
    const onReady=()=>sync()
    const onInstalled=()=>{setInstalled(true);setReady(false);setStatus('Comercio Lleno quedó instalado en este teléfono.')}
    window.addEventListener('comercio:dedicated-install-ready',onReady)
    window.addEventListener('appinstalled',onInstalled)
    if('serviceWorker'in navigator){void navigator.serviceWorker.register('/sw.js?v=20260823-2',{scope:'/'}).catch(()=>{})}
    const timeout=window.setTimeout(()=>{
      if(!w.__clDedicatedInstallPrompt&&!standalone()){
        setStatus('Chrome no habilitó el instalador automático en este teléfono. No hace falta seguir esperando: podés volver y usar Comercio Lleno normalmente.')
      }
    },8000)
    return()=>{window.clearTimeout(timeout);window.removeEventListener('comercio:dedicated-install-ready',onReady);window.removeEventListener('appinstalled',onInstalled)}
  },[])

  async function install(){
    const w=window as InstallWindow
    const prompt=w.__clDedicatedInstallPrompt
    if(!prompt)return
    try{
      await prompt.prompt()
      const choice=await prompt.userChoice.catch(()=>null)
      if(choice?.outcome==='accepted'){
        w.__clDedicatedInstallPrompt=null
        setInstalled(true)
        setReady(false)
        setStatus('Comercio Lleno quedó instalado. Ya podés abrirlo desde el icono del teléfono.')
      }
    }catch{}
  }

  return <main style={{minHeight:'100dvh',background:'linear-gradient(160deg,#f7f2fb 0%,#fff 55%,#fff4ed 100%)',display:'grid',placeItems:'center',padding:20,fontFamily:'Inter,system-ui,sans-serif',color:'#251c2a'}}>
    <section style={{width:'min(100%,480px)',background:'#fff',border:'1px solid #e8e0ea',borderRadius:26,padding:'26px 22px',boxShadow:'0 24px 70px rgba(52,31,63,.14)'}}>
      <div style={{display:'flex',gap:14,alignItems:'center'}}><div style={{width:58,height:58,borderRadius:18,background:'linear-gradient(135deg,#6d36d8,#ff641d)',color:'#fff',display:'grid',placeItems:'center',fontSize:21,fontWeight:950}}>CL</div><div><span style={{fontSize:11,fontWeight:900,letterSpacing:'.12em',color:'#6d36d8'}}>COMERCIO LLENO</span><h1 style={{fontSize:25,lineHeight:1.05,margin:'5px 0 0'}}>Instalar en este teléfono</h1></div></div>
      <p style={{fontSize:15,lineHeight:1.5,color:'#6f6672',margin:'22px 0'}}>{status}</p>
      {installed?<button onClick={()=>location.href='/movil'} style={primary}>Abrir Comercio Lleno</button>:ready?<button onClick={()=>void install()} style={primary}>Instalar ahora</button>:<button disabled style={{...primary,opacity:.5}}>Comprobando instalación…</button>}
      <button onClick={()=>location.href='/movil'} style={secondary}>Volver a Comercio Lleno</button>
      <div style={{marginTop:18,padding:14,borderRadius:15,background:'#f7f3fa',fontSize:12,lineHeight:1.45,color:'#716875'}}>Se instala como aplicación web: aparece con su icono entre las apps y abre Comercio Lleno sin que tengas que buscar la página cada vez.</div>
    </section>
  </main>
}

const primary:React.CSSProperties={width:'100%',minHeight:56,border:0,borderRadius:16,background:'linear-gradient(100deg,#6d36d8,#ff641d)',color:'#fff',fontSize:16,fontWeight:900,boxShadow:'0 12px 26px rgba(91,48,140,.18)'}
const secondary:React.CSSProperties={width:'100%',minHeight:50,marginTop:10,border:'1px solid #dfd7e2',borderRadius:15,background:'#fff',color:'#5b515f',fontSize:14,fontWeight:800}
