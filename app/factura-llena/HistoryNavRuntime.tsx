'use client'

import { useEffect } from 'react'

export default function HistoryNavRuntime(){
  useEffect(()=>{
    const bind=()=>{
      const buttons=Array.from(document.querySelectorAll('nav button'))
      const target=buttons.find(button=>/^facturas$/i.test((button.textContent||'').trim()))
      if(!target||target.getAttribute('data-history-bound')==='1')return
      target.setAttribute('data-history-bound','1')
      target.addEventListener('click',()=>{window.location.href='/factura-llena/facturas'},{capture:true})
    }
    bind()
    const observer=new MutationObserver(bind)
    observer.observe(document.body,{subtree:true,childList:true})
    return()=>observer.disconnect()
  },[])
  return null
}
