'use client'
import {useEffect} from 'react'
const companyCredits:Record<string,string>={gratis:'1 crédito de Trabajo Flex',impulso:'3 créditos de Trabajo Flex por mes',seleccion:'5 créditos de Trabajo Flex por mes',escala:'10 créditos de Trabajo Flex por mes',empresa:'25 créditos de Trabajo Flex por mes'}
export default function FlexPlanBenefitsBridge(){
 useEffect(()=>{
  const frame=requestAnimationFrame(()=>{
   document.querySelectorAll('#planes article').forEach(card=>{const title=card.querySelector('h3')?.textContent?.trim();const list=card.querySelector('ul');if(!list||list.querySelector('[data-pm-flex-benefit]'))return;let text='';if(title==='CV Pro')text='✓ Incluye 2 créditos para publicar Trabajo Flex';if(title==='Búsqueda Activa')text='✓ Incluye 5 créditos Flex durante los 30 días';if(text){const li=document.createElement('li');li.dataset.pmFlexBenefit='1';li.textContent=text;li.style.fontWeight='900';list.appendChild(li)}})
   document.querySelectorAll('.pm7-employer-plan').forEach(card=>{const plan=(card as HTMLElement).dataset.plan||'';const list=card.querySelector('ul');if(!plan||!list||list.querySelector('[data-pm-flex-benefit]')||!companyCredits[plan])return;const li=document.createElement('li');li.dataset.pmFlexBenefit='1';li.textContent=`✓ ${companyCredits[plan]}`;li.style.fontWeight='900';list.appendChild(li)})
  })
  return()=>cancelAnimationFrame(frame)
 },[])
 return null
}
