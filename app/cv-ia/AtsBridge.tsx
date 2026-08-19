'use client'

import { useEffect } from 'react'
import { trackCvEvent } from './cvAuth'

function textIs(el:Element|null,value:string){return (el?.textContent||'').trim()===value}

export default function AtsBridge(){
 useEffect(()=>{
  const apply=()=>{
   document.querySelectorAll('span,b').forEach(el=>{
    if(textIs(el,'Filtro automático'))el.textContent='Filtro ATS'
   })

   const heroTrust=document.querySelector('[class*="heroTrust"]')
   if(heroTrust&&!heroTrust.querySelector('[data-ats-trust]')){
    const span=document.createElement('span');span.setAttribute('data-ats-trust','1');span.textContent='✓ Evaluación y optimización ATS';heroTrust.appendChild(span)
   }

   const result=document.getElementById('resultado')
   if(result&&!result.querySelector('[data-ats-offer]')){
    const upsell=result.querySelector('[class*="resultUpsell"]')
    if(upsell){
     const box=document.createElement('div');box.className='postulaAtsOffer';box.setAttribute('data-ats-offer','1')
     box.innerHTML='<div><span>ATS · INCLUIDO EN CV PRO</span><h3>Optimizar mi CV para filtros ATS</h3><p>Revisamos estructura, legibilidad y palabras relevantes de la oferta sin inventar experiencia. Después comparamos el CV final para comprobar que siga siendo fiel a tu perfil.</p></div><div class="postulaAtsScore"><b>ATS</b><small>optimización real</small></div><button type="button">Optimizar para ATS · CV Pro</button>'
     const button=box.querySelector('button')
     button?.addEventListener('click',()=>{
      void trackCvEvent('ats_pro_clicked',{source:'diagnostic_result'},'/')
      const proButton=Array.from(result.querySelectorAll('button')).find(b=>(b.textContent||'').includes('Crear mi CV Pro')) as HTMLButtonElement|undefined
      if(proButton)proButton.click()
      else document.getElementById('planes')?.scrollIntoView({behavior:'smooth',block:'start'})
     })
     upsell.parentElement?.insertBefore(box,upsell)
    }
   }

   document.querySelectorAll('[class*="plan"]').forEach(card=>{
    const title=card.querySelector('h3')
    if(textIs(title,'CV Pro')&&!card.querySelector('[data-ats-included]')){
     const badge=document.createElement('div');badge.className='postulaAtsIncluded';badge.setAttribute('data-ats-included','1');badge.innerHTML='<b>ATS incluido</b><span>Optimización para sistemas de selección + comparación con la oferta</span>'
     const ul=card.querySelector('ul');if(ul)card.insertBefore(badge,ul)
    }
   })
  }
  apply();const observer=new MutationObserver(apply);observer.observe(document.body,{subtree:true,childList:true});return()=>observer.disconnect()
 },[])
 return null
}
