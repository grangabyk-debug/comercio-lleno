'use client'

import { useEffect,useRef,useState } from 'react'
import { loadSalesSettings,readCachedSalesSettings,saveSalesSettings,type CashMode } from '@/lib/comercio/sales-settings'
import { readTenantSession } from '@/lib/comercio/session'

function setText(node:Element|null,value:string){
  if(node&&node.textContent!==value)node.textContent=value
}

export default function MobileCashModeControllerV3(){
  const[toast,setToast]=useState('')
  const toastTimer=useRef<number|undefined>(undefined)

  useEffect(()=>{
    const session=readTenantSession()
    if(!session)return
    let target:HTMLElement|null=null
    let busy=false
    let disposed=false

    const show=(message:string)=>{
      if(disposed)return
      setToast(message)
      if(toastTimer.current)window.clearTimeout(toastTimer.current)
      toastTimer.current=window.setTimeout(()=>setToast(''),2400)
    }

    const paint=(mode:CashMode,element=target)=>{
      if(!element)return
      const manual=mode==='manual'
      element.dataset.cashModeToggle='1'
      element.dataset.cashMode=manual?'manual':'automatic'
      element.setAttribute('role','button')
      element.setAttribute('tabindex','0')
      element.setAttribute('aria-label',manual?'Caja manual activa. Tocar para volver a automática.':'Caja automática activa. Tocar para pasar a manual.')
      element.setAttribute('title',manual?'Tocar para pasar a caja automática':'Tocar para pasar a caja manual')
      element.style.cursor='pointer'
      element.style.userSelect='none'
      const icon=element.querySelector('i')
      setText(icon,manual?'!':'✓')
      const label=element.querySelector('b')
      setText(label,manual?'manual':'automática')

      const mini=document.querySelector('[class*="autoMini"]') as HTMLElement|null
      setText(mini,manual?'Manual':'Auto')
      const cashHero=document.querySelector('[class*="cashHero"] p') as HTMLElement|null
      if(cashHero){
        const current=cashHero.textContent||''
        if(manual&&current.includes('sin abrir ni cerrar caja'))cashHero.textContent=current.replace('sin abrir ni cerrar caja','caja manual')
        if(!manual&&current.includes('caja manual'))cashHero.textContent=current.replace('caja manual','sin abrir ni cerrar caja')
      }
    }

    const locate=()=>document.querySelector('[class*="autoCash"]') as HTMLElement|null

    const toggle=async()=>{
      if(busy||!target)return
      busy=true
      target.style.transform='scale(.97)'
      try{
        const current=await loadSalesSettings(session).catch(()=>readCachedSalesSettings(session.companyId))
        const next:CashMode=current.cashMode==='manual'?'automatic':'manual'
        const saved=await saveSalesSettings(session,{...current,cashMode:next})
        paint(saved.cashMode,target)
        show(saved.cashMode==='manual'?'Caja manual activada · abrí la caja diaria para vender.':'Caja automática activada.')
      }catch(error){
        show(error instanceof Error?error.message:'No se pudo cambiar el modo de caja.')
      }finally{
        if(target)target.style.transform=''
        busy=false
      }
    }

    const onClick=(event:Event)=>{
      event.preventDefault()
      event.stopPropagation()
      void toggle()
    }
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();void toggle()}
    }

    const syncTarget=()=>{
      if(disposed)return
      const found=locate()
      if(found!==target){
        if(target){target.removeEventListener('click',onClick);target.removeEventListener('keydown',onKey)}
        target=found
        if(target){target.addEventListener('click',onClick);target.addEventListener('keydown',onKey)}
      }
      if(target)paint(readCachedSalesSettings(session.companyId).cashMode,target)
    }

    syncTarget()
    const interval=window.setInterval(syncTarget,700)
    void loadSalesSettings(session).then(settings=>{if(!disposed)paint(settings.cashMode,locate())}).catch(()=>{})
    const changed=(event:Event)=>{
      const mode=(event as CustomEvent<{cashMode?:CashMode}>).detail?.cashMode
      if(mode)paint(mode,locate())
    }
    window.addEventListener('comercio:sales-settings',changed)

    return()=>{
      disposed=true
      window.clearInterval(interval)
      window.removeEventListener('comercio:sales-settings',changed)
      if(target){target.removeEventListener('click',onClick);target.removeEventListener('keydown',onKey)}
      if(toastTimer.current)window.clearTimeout(toastTimer.current)
    }
  },[])

  return toast?<div style={{position:'fixed',zIndex:12000,left:'50%',top:18,transform:'translateX(-50%)',maxWidth:'calc(100vw - 28px)',padding:'11px 15px',borderRadius:14,background:'#163d2d',color:'#fff',fontSize:12,fontWeight:900,boxShadow:'0 12px 34px rgba(0,0,0,.22)',textAlign:'center'}}>{toast}</div>:null
}
