'use client'

import {useEffect} from 'react'

export default function CandidatePlanOnly(){
 useEffect(()=>{
  let done=false
  const apply=()=>{
   const heading=Array.from(document.querySelectorAll('h2')).find(x=>(x.textContent||'').includes('Pagás cuando querés pasar del diagnóstico a la acción')) as HTMLElement|null
   const section=heading?.closest('section') as HTMLElement|null
   if(!section)return false
   const cards=Array.from(section.querySelectorAll('article')) as HTMLElement[]
   if(!cards.length)return false
   cards.forEach(card=>{
    const text=(card.textContent||'').toLowerCase()
    card.style.display=text.includes('cv pro')?'':'none'
    if(text.includes('cv pro')){
     const walker=document.createTreeWalker(card,NodeFilter.SHOW_TEXT)
     let node:Node|null
     while((node=walker.nextNode())){
      const raw=node.nodeValue||''
      const next=raw.replace(/CV Pro(?!\+)/g,'CV Pro+').replace(/pago único/gi,'/ 30 días')
      if(next!==raw)node.nodeValue=next
     }
    }
   })
   const grid=section.querySelector('[class*="plansGrid"]') as HTMLElement|null
   if(grid){
    grid.style.setProperty('grid-template-columns','minmax(280px,520px)','important')
    grid.style.setProperty('justify-content','center','important')
    grid.style.setProperty('max-width','620px','important')
   }
   const intro=heading?.parentElement?.querySelector('p') as HTMLElement|null
   const target='CV Pro+ se habilita mediante Mercado Pago y dura 30 días.'
   if(intro&&intro.textContent?.trim()!==target)intro.textContent=target
   done=true
   return true
  }
  if(apply())return
  const observer=new MutationObserver(()=>{
   if(done)return
   if(apply())observer.disconnect()
  })
  observer.observe(document.body,{childList:true,subtree:true})
  const timer=window.setTimeout(()=>observer.disconnect(),6000)
  return()=>{window.clearTimeout(timer);observer.disconnect()}
 },[])
 return null
}
