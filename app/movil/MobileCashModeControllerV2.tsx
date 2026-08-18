'use client'

import { useEffect,useRef,useState } from 'react'
import { loadSalesSettings,readCachedSalesSettings,saveSalesSettings,type CashMode } from '@/lib/comercio/sales-settings'
import { readTenantSession } from '@/lib/comercio/session'

function compact(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase()}

export default function MobileCashModeControllerV2(){
  const[toast,setToast]=useState('')
  const timer=useRef<number|undefined>(undefined)

  useEffect(()=>{
    const session=readTenantSession()
    if(!session)return
    let currentTarget:HTMLElement|null=null
    let cancelled=false

    const show=(message:string)=>{
      setToast(message)
      if(timer.current)window.clearTimeout(timer.current)
      timer.current=window.setTimeout(()=>setToast(''),2600)
    }

    const paint=(mode:CashMode,element=currentTarget)=>{
      if(!element)return
      const manual=mode==='manual'
      element.dataset.cashModeToggle='1'
      element.dataset.cashMode=manual?'manual':'automatic'
      element.setAttribute('role','button')
      element.setAttribute('tabindex','0')
      element.setAttribute('aria-label',manual?'Caja manual activa. Tocar para activar caja automática.':'Caja automática activa. Tocar para pasar a caja manual.')
      element.setAttribute('title',manual?'Tocar para pasar a caja automática':'Tocar para pasar a caja manual')
      element.style.cursor='pointer'
      element.style.userSelect='none'
      element.style.transition='transform .16s ease, box-shadow .16s ease'
      const icon=element.querySelector('i')
      if(icon)icon.textContent=manual?'!':'✓'
      const label=element.querySelector('b')
      if(label)label.textContent=manual?'manual':'automática'
      const mini=Array.from(document.querySelectorAll('div')).find(node=>compact(node.textContent||'')==='auto'||compact(node.textContent||'')==='manual') as HTMLElement|undefined
      if(mini&&mini!==element)mini.textContent=manual?'Manual':'Auto'
      const cashCopy=Array.from(document.querySelectorAll('p')).find(node=>compact(node.textContent||'').includes('sin abrir ni cerrar caja')) as HTMLElement|undefined
      if(cashCopy)cashCopy.textContent=manual?'Caja manual · requiere apertura y cierre diario':'Caja automática · sin abrir ni cerrar todos los días'
    }

    const click=async()=>{
      if(!currentTarget)return
      currentTarget.style.transform='scale(.97)'
      try{
        const current=await loadSalesSettings(session).catch(()=>readCachedSalesSettings(session.companyId))
        const next:CashMode=current.cashMode==='manual'?'automatic':'manual'
        const saved=await saveSalesSettings(session,{...current,cashMode:next})
        paint(saved.cashMode,currentTarget)
        show(saved.cashMode==='automatic'?'Caja automática activada':'Caja manual activada · ahora requiere apertura y cierre')
      }catch(e){show(e instanceof Error?e.message:'No se pudo cambiar el modo de caja.')}
      finally{window.setTimeout(()=>{if(currentTarget)currentTarget.style.transform=''},130)}
    }
    const key=(event:KeyboardEvent)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();void click()}}

    const locate=()=>{
      const direct=document.querySelector('[class*="autoCash"]') as HTMLElement|null
      if(direct)return direct
      const nodes=Array.from(document.querySelectorAll('div')) as HTMLElement[]
      return nodes.find(node=>{
        const value=compact(node.textContent||'')
        return value.includes('caja')&&(value.includes('automatica')||value.includes('manual'))&&Boolean(node.querySelector('b'))
      })||null
    }

    const sync=()=>{
      if(cancelled)return
      const found=locate()
      if(found!==currentTarget){
        if(currentTarget){currentTarget.removeEventListener('click',click);currentTarget.removeEventListener('keydown',key)}
        currentTarget=found
        if(currentTarget){currentTarget.addEventListener('click',click);currentTarget.addEventListener('keydown',key)}
      }
      if(currentTarget)paint(readCachedSalesSettings(session.companyId).cashMode,currentTarget)
    }

    sync()
    const observer=new MutationObserver(sync)
    observer.observe(document.body,{childList:true,subtree:true})
    void loadSalesSettings(session).then(settings=>{if(!cancelled){paint(settings.cashMode,currentTarget);sync()}}).catch(()=>{})
    const changed=(event:Event)=>{const mode=(event as CustomEvent<{cashMode?:CashMode}>).detail?.cashMode;if(mode)paint(mode,currentTarget)}
    window.addEventListener('comercio:sales-settings',changed)
    return()=>{
      cancelled=true
      observer.disconnect()
      window.removeEventListener('comercio:sales-settings',changed)
      if(currentTarget){currentTarget.removeEventListener('click',click);currentTarget.removeEventListener('keydown',key)}
      if(timer.current)window.clearTimeout(timer.current)
    }
  },[])

  return toast?<div style={{position:'fixed',zIndex:12000,left:'50%',top:18,transform:'translateX(-50%)',maxWidth:'calc(100vw - 28px)',padding:'11px 15px',borderRadius:14,background:'#163d2d',color:'#fff',fontSize:12,fontWeight:900,boxShadow:'0 12px 34px rgba(0,0,0,.22)',textAlign:'center'}}>{toast}</div>:null
}
