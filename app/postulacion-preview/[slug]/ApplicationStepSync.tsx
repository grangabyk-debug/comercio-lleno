'use client'

import {useEffect} from 'react'

export default function ApplicationStepSync({activeClass}:{activeClass:string}){
 useEffect(()=>{
  const flow=document.querySelector<HTMLElement>('[data-pm-apply-flow]')
  if(!flow)return
  const steps=Array.from(flow.querySelectorAll<HTMLElement>('[data-pm-apply-step]'))
  const sync=()=>{
   const heading=(flow.querySelector('form h1')?.textContent||flow.querySelector('h1')?.textContent||'').trim().toLowerCase()
   let current=1
   if(heading.includes('tu presentación'))current=2
   else if(heading.includes('revisá y autorizá'))current=3
   else if(heading.includes('postulación enviada')||heading.includes('confirmá y enviá')||heading.includes('enviar postulación'))current=4
   steps.forEach(item=>{
    const active=Number(item.dataset.pmApplyStep)===current
    item.classList.toggle(activeClass,active)
    if(active)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current')
   })
  }
  sync()
  const observer=new MutationObserver(sync)
  observer.observe(flow,{subtree:true,childList:true,characterData:true})
  return()=>observer.disconnect()
 },[activeClass])
 return null
}
