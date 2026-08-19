'use client'

import { useEffect } from 'react'
import { trackCvEvent } from './cvAuth'

function textIs(el:Element|null,value:string){return (el?.textContent||'').trim()===value}

function patchLeafText(){
  const selectors='span,b,small,h3,p,li,button,strong,a,label'
  document.querySelectorAll<HTMLElement>(selectors).forEach(el=>{
    if(el.children.length!==0)return
    const original=el.textContent||''
    const trimmed=original.trim()
    let next=original

    if(trimmed==='Filtro automático'||trimmed==='Filtro ATS')next='Filtro ATS'
    else if(trimmed==='Recruiter'||trimmed==='Recruiter IA'||trimmed==='Reclutador IA')next='Reclutador'
    else if(trimmed==='Responsable del área')next='Responsable de área'
    else if(trimmed==='CV IA')next='PostulaMejor.com'
    else if(trimmed==='Usuario de CV IA')next='Usuario de PostuláMejor.com'
    else{
      next=next
        .replace(/\$8\.900/g,'$5.990')
        .replace(/CV Pro/g,'CV PRO')
        .replace(/\bPro\b/g,'PRO')
        .replace(/Recruiter IA/g,'Reclutador')
        .replace(/Recruiter \+ responsable del área/g,'Reclutador + responsable de área')
    }

    if(next!==original)el.textContent=next
  })
}

export default function AtsBridge(){
 useEffect(()=>{
  let raf=0
  let stopped=false

  const apply=()=>{
   raf=0
   if(stopped)return
   patchLeafText()

   const heroTrust=document.querySelector('[class*="heroTrust"]')
   if(heroTrust&&!heroTrust.querySelector('[data-ats-trust]')){
    const span=document.createElement('span')
    span.setAttribute('data-ats-trust','1')
    span.textContent='✓ Evaluación y optimización ATS'
    heroTrust.appendChild(span)
   }

   const filterGrid=document.querySelector('[class*="filterGrid"]')
   const filterSection=filterGrid?.closest('section')
   if(filterSection&&!filterSection.classList.contains('postulaTripleFilterSection'))filterSection.classList.add('postulaTripleFilterSection')

   const comparison=document.querySelector('[class*="compareCard"]')
   if(comparison){
    const head=comparison.querySelector('[class*="compareHead"]')
    const cols=head?.querySelectorAll('b')
    if(cols?.[0]&&cols[0].textContent?.trim()!=='Prompt genérico IA')cols[0].textContent='Prompt genérico IA'
    if(cols?.[1]&&cols[1].textContent?.trim()!=='PostulaMejor.com')cols[1].textContent='PostulaMejor.com'
    if(!comparison.querySelector('[data-ats-comparison]')){
      const sample=comparison.querySelector<HTMLElement>('[class*="compareRow"]')
      if(sample){
        const row=document.createElement('div')
        row.className=sample.className
        row.setAttribute('data-ats-comparison','1')
        const label=document.createElement('span');label.textContent='Optimización para filtros ATS'
        const generic=document.createElement('i');generic.textContent='No incluida'
        const postula=document.createElement('strong');postula.textContent='Incluido'
        row.append(label,generic,postula)
        comparison.appendChild(row)
      }
    }
   }

   const result=document.getElementById('resultado')
   if(result&&!result.querySelector('[data-ats-offer]')){
    const upsell=result.querySelector('[class*="resultUpsell"]')
    if(upsell){
     const box=document.createElement('div')
     box.className='postulaAtsOffer'
     box.setAttribute('data-ats-offer','1')
     box.innerHTML='<div><span>ATS · INCLUIDO EN CV PRO</span><h3>Optimizar mi CV para filtros ATS</h3><p>Revisamos estructura, legibilidad y palabras relevantes de la oferta sin inventar experiencia. Después comparamos el CV final para comprobar que siga siendo fiel a tu perfil.</p></div><div class="postulaAtsScore"><b>ATS</b><small>optimización real</small></div><button type="button">Optimizar para ATS · CV PRO</button>'
     const button=box.querySelector('button')
     button?.addEventListener('click',()=>{
      void trackCvEvent('ats_pro_clicked',{source:'diagnostic_result'},'/')
      const proButton=Array.from(result.querySelectorAll('button')).find(b=>(b.textContent||'').toUpperCase().includes('CREAR MI CV PRO')) as HTMLButtonElement|undefined
      if(proButton)proButton.click()
      else document.getElementById('planes')?.scrollIntoView({behavior:'smooth',block:'start'})
     })
     upsell.parentElement?.insertBefore(box,upsell)
    }
   }

   document.querySelectorAll('[class*="plan"]').forEach(card=>{
    const title=card.querySelector('h3')
    if((textIs(title,'CV PRO')||textIs(title,'CV Pro'))&&!card.querySelector('[data-ats-included]')){
     const badge=document.createElement('div')
     badge.className='postulaAtsIncluded'
     badge.setAttribute('data-ats-included','1')
     badge.innerHTML='<b>ATS incluido</b><span>Optimización para sistemas de selección + comparación con la oferta</span>'
     const ul=card.querySelector('ul')
     if(ul)card.insertBefore(badge,ul)
    }
   })
  }

  const schedule=()=>{
    if(stopped||raf)return
    raf=window.requestAnimationFrame(apply)
  }

  schedule()
  const observer=new MutationObserver(mutations=>{
    if(mutations.some(m=>m.addedNodes.length>0))schedule()
  })
  observer.observe(document.body,{subtree:true,childList:true})
  return()=>{
    stopped=true
    observer.disconnect()
    if(raf)window.cancelAnimationFrame(raf)
  }
 },[])
 return null
}
