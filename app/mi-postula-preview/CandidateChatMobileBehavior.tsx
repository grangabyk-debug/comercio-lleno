'use client'

import {useEffect} from 'react'

export default function CandidateChatMobileBehavior(){
 useEffect(()=>{
  let root:HTMLElement|null=null
  const prepare=()=>{
   const found=document.querySelector<HTMLElement>('.pm42-chat-wrap .pmc-page')
   if(!found)return false
   root=found
   if(!root.classList.contains('pmc-mobile-thread-mode'))root.classList.add('pmc-mobile-list-mode')
   return true
  }
  prepare()
  const observer=new MutationObserver(()=>prepare())
  observer.observe(document.body,{childList:true,subtree:true})

  const click=(event:MouseEvent)=>{
   const target=event.target as HTMLElement|null
   if(!target)return
   const page=target.closest<HTMLElement>('.pm42-chat-wrap .pmc-page')
   if(!page)return
   if(target.closest('.pmc-thread')){
    page.classList.remove('pmc-mobile-list-mode')
    page.classList.add('pmc-mobile-thread-mode')
    return
   }
   if(target.closest('.pmc-mobile-back')){
    event.preventDefault()
    event.stopPropagation()
    page.classList.remove('pmc-mobile-thread-mode')
    page.classList.add('pmc-mobile-list-mode')
    requestAnimationFrame(()=>document.querySelector<HTMLElement>('.pm42-chat-wrap')?.scrollIntoView({block:'start',behavior:'smooth'}))
   }
  }
  document.addEventListener('click',click,true)
  return()=>{observer.disconnect();document.removeEventListener('click',click,true)}
 },[])
 return null
}
