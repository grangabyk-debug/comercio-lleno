'use client'

import {useEffect,useState} from 'react'
import {createPortal} from 'react-dom'
import CalendarPeek from '../postula-preview/CalendarPeek'

export default function CandidateCalendarReminder(){
 const [host,setHost]=useState<HTMLElement|null>(null),[active,setActive]=useState(false)
 useEffect(()=>{
  let observer:MutationObserver|null=null,slot:HTMLDivElement|null=null
  const mount=()=>{
   const workspace=document.querySelector<HTMLElement>('.pm42-workspace'),main=document.querySelector<HTMLElement>('.pm42-main')
   if(!workspace||!main)return false
   slot=document.createElement('div');slot.className='pm42-calendar-reminder-slot';main.insertBefore(slot,main.children[1]||main.firstChild)
   const sync=()=>setActive(workspace.dataset.view==='resumen')
   sync();observer=new MutationObserver(sync);observer.observe(workspace,{attributes:true,attributeFilter:['data-view']});setHost(slot);return true
  }
  if(!mount()){const timer=window.setInterval(()=>{if(mount())window.clearInterval(timer)},100);return()=>window.clearInterval(timer)}
  return()=>{observer?.disconnect();slot?.remove()}
 },[])
 if(!host||!active)return null
 return createPortal(<CalendarPeek audience="candidate"/>,host)
}
