'use client'

import { useEffect } from 'react'

const WHATSAPP_LABEL=/whats\s*app/i
const WHATSAPP_HREF=/(?:^|\/\/)(?:wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)(?:\/|$)|^whatsapp:|\/whatsapp-preview(?:[/?#]|$)/i

function findControl(target:EventTarget|null){
  if(!(target instanceof Element))return null
  const control=target.closest('a,button,[role="button"]')
  return control instanceof HTMLElement?control:null
}

function isWhatsAppControl(control:HTMLElement){
  const href=control.getAttribute('href')||''
  const label=[control.textContent||'',control.getAttribute('aria-label')||'',control.getAttribute('title')||''].join(' ')
  return WHATSAPP_HREF.test(href)||WHATSAPP_LABEL.test(label)
}

function hideWhatsAppControls(root:ParentNode){
  root.querySelectorAll<HTMLElement>('a,button,[role="button"]').forEach(control=>{
    if(!isWhatsAppControl(control))return
    control.dataset.clWhatsappTemporarilyHidden='true'
    control.style.setProperty('display','none','important')
  })
}

export default function TemporaryWhatsAppHide(){
  useEffect(()=>{
    const block=(event:MouseEvent)=>{
      const control=findControl(event.target)
      if(!control||!isWhatsAppControl(control))return
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    }

    hideWhatsAppControls(document)
    const observer=new MutationObserver(()=>hideWhatsAppControls(document))
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['href','title','aria-label']})
    document.addEventListener('click',block,true)
    return()=>{
      observer.disconnect()
      document.removeEventListener('click',block,true)
    }
  },[])

  return <style>{`a[href*="wa.me"],a[href*="api.whatsapp.com"],a[href*="web.whatsapp.com"],a[href^="whatsapp:"],a[href*="/whatsapp-preview"]{display:none!important}`}</style>
}
