'use client'

import {useEffect} from 'react'

export default function ServicesFlexConsentPolish(){
 useEffect(()=>{
  const polish=()=>{
   const small=document.querySelector('.pmsf-guard-accept small') as HTMLElement|null
   if(!small||small.querySelector('[data-pm-flex-privacy]'))return
   const terms=small.querySelector('a')
   if(!terms)return
   const next=terms.nextSibling
   if(next?.nodeType===Node.TEXT_NODE&&String(next.textContent||'').trim()==='.')next.textContent=''
   small.append(document.createTextNode(' y la '))
   const privacy=document.createElement('a')
   privacy.href='/privacidad'
   privacy.textContent='Política de Privacidad'
   privacy.setAttribute('data-pm-flex-privacy','true')
   small.append(privacy,document.createTextNode('.'))
  }
  polish()
  const observer=new MutationObserver(polish)
  observer.observe(document.body,{childList:true,subtree:true})
  return()=>observer.disconnect()
 },[])
 return null
}
