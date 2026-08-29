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
    const isActive=text.includes('búsqueda activa')||text.includes('busqueda activa')
    const isPro=text.includes('cv pro')
    const isFree=text.includes('diagnóstico')||text.includes('diagnostico')||text.includes('$0')

    card.style.display=isActive?'none':(isPro||isFree?'':'none')

    if(isPro&&!isActive){
     const walker=document.createTreeWalker(card,NodeFilter.SHOW_TEXT)
     let node:Node|null
     while((node=walker.nextNode())){
      const raw=node.nodeValue||''
      const next=raw
       .replace(/CV Pro(?!\+)/g,'CV Pro+')
       .replace(/\$8\.900/g,'$5.990')
       .replace(/pago único/gi,'/ 30 días')
      if(next!==raw)node.nodeValue=next
     }
    }
   })

   const grid=section.querySelector('[class*="plansGrid"]') as HTMLElement|null
   if(grid){
    grid.style.setProperty('grid-template-columns','repeat(2,minmax(0,1fr))','important')
    grid.style.setProperty('justify-content','center','important')
    grid.style.setProperty('max-width','920px','important')
    grid.style.setProperty('margin-left','auto','important')
    grid.style.setProperty('margin-right','auto','important')
   }

   const intro=heading?.parentElement?.querySelector('p') as HTMLElement|null
   const target='El diagnóstico es gratis. CV Pro+ se habilita mediante Mercado Pago y dura 30 días.'
   if(intro&&intro.textContent?.trim()!==target)intro.textContent=target

   const allText=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT)
   let node:Node|null
   while((node=allText.nextNode())){
    const parent=node.parentElement
    if(!parent||parent.closest('script,style'))continue
    const raw=node.nodeValue||''
    let next=raw
    if(raw.includes('Tablero en Búsqueda Activa'))next=next.replace('Tablero en Búsqueda Activa','Seguimiento de postulaciones')
    if(next!==raw)node.nodeValue=next
   }

   done=true
   return true
  }

  const style=document.createElement('style')
  style.id='pmcv-two-plans-layout'
  style.textContent='@media(max-width:720px){#planes [class*="plansGrid"]{grid-template-columns:1fr!important;max-width:540px!important}}'
  document.head.appendChild(style)

  if(apply())return()=>style.remove()
  const observer=new MutationObserver(()=>{
   if(done)return
   if(apply())observer.disconnect()
  })
  observer.observe(document.body,{childList:true,subtree:true})
  const timer=window.setTimeout(()=>observer.disconnect(),6000)
  return()=>{window.clearTimeout(timer);observer.disconnect();style.remove()}
 },[])
 return null
}
