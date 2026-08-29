'use client'

import {useEffect} from 'react'

export default function CandidatePlanOnly(){
 useEffect(()=>{
  const apply=()=>{
   const section=document.getElementById('planes') as HTMLElement|null
   if(!section)return

   const cards=Array.from(section.querySelectorAll('article')) as HTMLElement[]
   for(const card of cards){
    const title=card.querySelector('h3') as HTMLElement|null
    const name=(title?.textContent||'').trim().toLowerCase()

    if(name.includes('búsqueda activa')||name.includes('busqueda activa')){
     card.remove()
     continue
    }

    if(name==='diagnóstico'||name==='diagnostico'){
     card.style.display=''
     continue
    }

    if(name==='cv pro'||name==='cv pro+'){
     card.style.display=''
     if(title)title.textContent='CV Pro+'
     const price=card.querySelector('[class*="price"] strong') as HTMLElement|null
     const suffix=card.querySelector('[class*="price"] small') as HTMLElement|null
     if(price)price.textContent='$5.990'
     if(suffix)suffix.textContent=' / 30 días'
     const button=card.querySelector('button') as HTMLButtonElement|null
     if(button)button.textContent='Quiero mi CV Pro+'
    }
   }

   const grid=section.querySelector('[class*="plansGrid"]') as HTMLElement|null
   if(grid){
    grid.style.setProperty('grid-template-columns','repeat(2,minmax(0,1fr))','important')
    grid.style.setProperty('justify-content','center','important')
    grid.style.setProperty('max-width','920px','important')
    grid.style.setProperty('margin-left','auto','important')
    grid.style.setProperty('margin-right','auto','important')
   }

   const heading=section.querySelector('h2') as HTMLElement|null
   const intro=heading?.parentElement?.querySelector('p') as HTMLElement|null
   if(intro)intro.textContent='El diagnóstico es gratis. CV Pro+ se habilita mediante Mercado Pago y dura 30 días.'

   const compareRows=Array.from(document.querySelectorAll('[class*="compareRow"]')) as HTMLElement[]
   compareRows.forEach(row=>{
    const text=(row.textContent||'').toLowerCase()
    if(text.includes('búsqueda activa')||text.includes('busqueda activa'))row.remove()
   })
  }

  const style=document.createElement('style')
  style.id='pmcv-candidate-plans-final'
  style.textContent='@media(max-width:720px){#planes [class*="plansGrid"]{grid-template-columns:1fr!important;max-width:540px!important}}'
  document.head.appendChild(style)

  apply()
  const frame=requestAnimationFrame(apply)
  return()=>{cancelAnimationFrame(frame);style.remove()}
 },[])
 return null
}
