'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { checkArcaHealth, type ArcaHealth } from '@/lib/comercio/api'
import { readTenantSession } from '@/lib/comercio/session'
import type { TenantSession } from '@/lib/comercio/types'

const THEME_KEY='cl_mobile_theme'

export default function MobileArcaStatus(){
  const [host,setHost]=useState<HTMLElement|null>(null)
  const [arca,setArca]=useState<ArcaHealth|null>(null)
  const [checking,setChecking]=useState(true)
  const [dark,setDark]=useState(false)

  useEffect(()=>{
    const saved=localStorage.getItem(THEME_KEY)
    const initial=saved==='dark'||(!saved&&window.matchMedia?.('(prefers-color-scheme: dark)').matches)
    setDark(initial)
    document.documentElement.dataset.clMobileTheme=initial?'dark':'light'
    document.documentElement.style.colorScheme=initial?'dark':'light'
    return()=>{
      delete document.documentElement.dataset.clMobileTheme
      document.documentElement.style.colorScheme=''
    }
  },[])

  useEffect(()=>{
    let active=true
    let observer:MutationObserver|null=null

    function attach(){
      const strip=document.querySelector('div[class*="planStrip"]') as HTMLElement|null
      if(!strip)return false
      const existing=strip.querySelector('.cl-mobile-arca-slot') as HTMLElement|null
      if(existing){if(active)setHost(existing);return true}
      Array.from(strip.children).forEach(child=>{
        if(child instanceof HTMLElement)child.style.display='none'
      })
      const slot=document.createElement('div')
      slot.className='cl-mobile-arca-slot'
      slot.style.display='flex'
      slot.style.alignItems='center'
      slot.style.width='100%'
      slot.style.height='100%'
      strip.appendChild(slot)
      if(active)setHost(slot)
      return true
    }

    if(!attach()){
      observer=new MutationObserver(()=>{if(attach())observer?.disconnect()})
      observer.observe(document.body,{childList:true,subtree:true})
    }

    return()=>{
      active=false
      observer?.disconnect()
      const slot=document.querySelector('.cl-mobile-arca-slot') as HTMLElement|null
      const strip=slot?.parentElement
      slot?.remove()
      if(strip)Array.from(strip.children).forEach(child=>{if(child instanceof HTMLElement)child.style.display=''})
    }
  },[])

  async function refresh(session:TenantSession){
    setChecking(true)
    try{setArca(await checkArcaHealth(session))}
    finally{setChecking(false)}
  }

  useEffect(()=>{
    if(!host)return
    const session=readTenantSession()
    if(!session){setChecking(false);return}
    void refresh(session)
    const timer=window.setInterval(()=>{if(document.visibilityState==='visible')void refresh(session)},300000)
    const online=()=>void refresh(session)
    window.addEventListener('online',online)
    return()=>{window.clearInterval(timer);window.removeEventListener('online',online)}
  },[host])

  function toggleTheme(){
    setDark(current=>{
      const next=!current
      localStorage.setItem(THEME_KEY,next?'dark':'light')
      document.documentElement.dataset.clMobileTheme=next?'dark':'light'
      document.documentElement.style.colorScheme=next?'dark':'light'
      return next
    })
  }

  const configured=arca?(arca as ArcaHealth&{configured?:boolean}).configured!==false:true
  const connected=Boolean(arca?.connected&&configured)
  const label=checking?'ARCA verificando…':!configured?'ARCA no configurado':connected?'ARCA conectado':'ARCA desconectado'
  const background=dark?(checking?'#211a29':connected?'#14251c':'#2a171b'):(checking?'#f5f1fb':connected?'#e9f8ef':'#fff0f0')
  const border=dark?(checking?'#3b2d4c':connected?'#274736':'#543036'):(checking?'#e3d9f3':connected?'#cfeada':'#f0cccc')
  const color=dark?(checking?'#c9adff':connected?'#73d7a0':'#ff9292'):(checking?'#6d36d8':connected?'#177a4b':'#b83e3e')

  useEffect(()=>{
    const strip=host?.parentElement as HTMLElement|null
    if(!strip)return
    strip.style.background=background
    strip.style.borderBottomColor=border
  },[host,background,border])

  if(!host)return null
  return createPortal(
    <div style={{width:'100%',height:'100%',display:'flex',alignItems:'stretch',justifyContent:'space-between',gap:0,color,font:'inherit'}}>
      <button type="button" onClick={()=>{const session=readTenantSession();if(session)void refresh(session)}} aria-label="Verificar conexión con ARCA" style={{minWidth:0,flex:'1 1 auto',height:'100%',border:0,background:'transparent',padding:'0 10px 0 0',display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,color,cursor:'pointer',font:'inherit'}}>
        <span style={{display:'inline-flex',alignItems:'center',gap:7,fontSize:9.5,fontWeight:950,letterSpacing:'.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}><i style={{width:8,height:8,borderRadius:'50%',background:checking?'#8d57ef':connected?'#1ca15e':'#d84b4b',boxShadow:connected?'0 0 0 4px rgba(28,161,94,.10)':'none'}}/>{label}</span>
        <small style={{fontSize:8,fontWeight:800,opacity:.72,textTransform:'none',letterSpacing:0,whiteSpace:'nowrap'}}>{checking?'':'Verificar'}</small>
      </button>
      <button type="button" onClick={toggleTheme} aria-label={dark?'Cambiar a modo claro':'Cambiar a modo oscuro'} aria-pressed={dark} style={{flex:'0 0 auto',height:'100%',border:0,borderLeft:`1px solid ${border}`,background:'transparent',padding:'0 0 0 10px',display:'inline-flex',alignItems:'center',gap:6,color:dark?'#eee7f1':'#5e5662',cursor:'pointer',font:'inherit'}}>
        <span style={{fontSize:8,fontWeight:900,letterSpacing:'.04em'}}>OSCURO</span>
        <i style={{position:'relative',display:'inline-block',width:28,height:16,borderRadius:999,background:dark?'#6d36d8':'#cfc7d2',transition:'background .2s ease'}}><b style={{position:'absolute',top:2,left:dark?14:2,width:12,height:12,borderRadius:'50%',background:'#fff',boxShadow:'0 1px 4px rgba(0,0,0,.22)',transition:'left .2s ease'}}/></i>
      </button>
    </div>,
    host,
  )
}
