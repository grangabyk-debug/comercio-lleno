'use client'

import {useEffect} from 'react'

export default function FlexMessageModalPolish(){
 useEffect(()=>{
  let raf=0
  const enhance=()=>{
   document.querySelectorAll<HTMLFormElement>('.pm7-mini-chat').forEach(form=>{
    const card=form.closest<HTMLElement>('.pm7-gig-modal-card')
    if(card)card.dataset.chatOpen='true'
    if(form.querySelector('.pm48-flex-chat-close'))return
    const close=document.createElement('button')
    close.type='button';close.className='pm48-flex-chat-close';close.setAttribute('aria-label','Cerrar mensaje');close.textContent='×'
    close.addEventListener('click',()=>card?.querySelector<HTMLButtonElement>('.pm7-modal-close')?.click())
    form.prepend(close)
   })
  }
  const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(enhance)}
  const observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true})
  enhance()
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){const card=document.querySelector<HTMLElement>('.pm7-gig-modal-card[data-chat-open="true"]');card?.querySelector<HTMLButtonElement>('.pm7-modal-close')?.click()}}
  window.addEventListener('keydown',key)
  return()=>{cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('keydown',key)}
 },[])
 return null
}
