'use client'
import {useEffect} from 'react'

const companyCredits:Record<string,string>={gratis:'1 crédito de Servicios Flex',impulso:'3 créditos de Servicios Flex por mes',seleccion:'5 créditos de Servicios Flex por mes',escala:'10 créditos de Servicios Flex por mes',empresa:'25 créditos de Servicios Flex por mes'}
const companyPlanOrder=['gratis','impulso','seleccion','escala','empresa']

export default function FlexPlanBenefitsBridge(){
 useEffect(()=>{
  const apply=()=>{
   document.querySelectorAll('#planes article').forEach(card=>{
    const title=card.querySelector('h3')?.textContent?.trim()
    const list=card.querySelector('ul')
    if(!list||list.querySelector('[data-pm-flex-benefit]'))return
    let text=''
    if(title==='CV Pro')text='✓ Incluye 2 créditos para publicar Servicios Flex'
    if(title==='Búsqueda Activa')text='✓ Incluye 5 créditos de Servicios Flex durante los 30 días'
    if(text){const li=document.createElement('li');li.dataset.pmFlexBenefit='1';li.textContent=text;li.style.fontWeight='900';list.appendChild(li)}
   })

   document.querySelectorAll('.pm7-employer-plan').forEach((card,index)=>{
    const plan=(card as HTMLElement).dataset.plan||companyPlanOrder[index]||''
    const list=card.querySelector('ul')
    if(!plan||!list||list.querySelector('[data-pm-flex-benefit]')||!companyCredits[plan])return
    ;(card as HTMLElement).dataset.plan=plan
    const li=document.createElement('li')
    li.dataset.pmFlexBenefit='1'
    li.textContent=`✓ ${companyCredits[plan]}`
    li.style.fontWeight='900'
    list.appendChild(li)
   })
  }

  apply()
  const observer=new MutationObserver(()=>apply())
  observer.observe(document.body,{childList:true,subtree:true})
  const retry=window.setInterval(apply,250)
  const stop=window.setTimeout(()=>window.clearInterval(retry),12000)
  return()=>{observer.disconnect();window.clearInterval(retry);window.clearTimeout(stop)}
 },[])
 return null
}
