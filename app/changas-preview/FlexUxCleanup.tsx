'use client'

import {useEffect} from 'react'

export default function FlexUxCleanup(){
 useEffect(()=>{
  const enhance=()=>{
   const search=document.querySelector<HTMLElement>('.pm38-flex-search')
   const action=search?.querySelector<HTMLElement>(':scope > div:last-child')
   if(action&&!action.dataset.pm41Search){
    action.dataset.pm41Search='1'
    action.setAttribute('role','button')
    action.setAttribute('tabindex','0')
    action.setAttribute('aria-label','Buscar servicios')
    const run=()=>{
     ;(document.activeElement as HTMLElement|null)?.blur?.()
     document.querySelector<HTMLElement>('.pm7-gig-grid,.pm39-market-empty')?.scrollIntoView({behavior:'smooth',block:'start'})
    }
    action.addEventListener('click',run)
    action.addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();run()}})
   }
  }
  enhance()
  const observer=new MutationObserver(enhance)
  observer.observe(document.body,{childList:true,subtree:true})
  return()=>observer.disconnect()
 },[])
 return null
}
