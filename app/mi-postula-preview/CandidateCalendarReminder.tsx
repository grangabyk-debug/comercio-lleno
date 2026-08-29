'use client'

import {useEffect,useState} from 'react'
import {createPortal} from 'react-dom'
import CalendarPeek from '../postula-preview/CalendarPeek'

export default function CandidateCalendarReminder(){
 const [host,setHost]=useState<HTMLElement|null>(null),[active,setActive]=useState(false)
 useEffect(()=>{
  let observer:MutationObserver|null=null
  const sync=()=>{
   const workspace=document.querySelector<HTMLElement>('.pm42-workspace')
   if(!workspace){setActive(false);setHost(null);return}
   const isSummary=workspace.dataset.view==='resumen'
   setActive(isSummary)
   if(!isSummary){setHost(null);return}
   const view=workspace.querySelector<HTMLElement>('.pm42-view')
   const summary=view?.querySelector<HTMLElement>('.pm42-summary-grid')
   if(!view||!summary)return
   let slot=view.querySelector<HTMLElement>('.pm42-calendar-reminder-slot')
   if(!slot){
    slot=document.createElement('div')
    slot.className='pm42-calendar-reminder-slot'
    const reputation=view.querySelector<HTMLElement>('.pm42-reputation-explainer')
    if(reputation)view.insertBefore(slot,reputation);else summary.insertAdjacentElement('afterend',slot)
   }
   setHost(slot)
  }
  sync()
  const workspace=document.querySelector<HTMLElement>('.pm42-workspace')
  if(workspace){observer=new MutationObserver(sync);observer.observe(workspace,{attributes:true,attributeFilter:['data-view'],childList:true,subtree:true})}
  else{const timer=window.setInterval(()=>{const w=document.querySelector<HTMLElement>('.pm42-workspace');if(w){window.clearInterval(timer);sync();observer=new MutationObserver(sync);observer.observe(w,{attributes:true,attributeFilter:['data-view'],childList:true,subtree:true})}},100);return()=>{window.clearInterval(timer);observer?.disconnect()}}
  return()=>observer?.disconnect()
 },[])
 if(!host||!active)return null
 return createPortal(<CalendarPeek audience="candidate"/>,host)
}
