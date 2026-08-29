'use client'
import {useEffect} from 'react'

const companyCredits:Record<string,string>={
 gratis:'1 crédito de Servicios Flex',
 impulso:'3 créditos de Servicios Flex por mes',
 seleccion:'5 créditos de Servicios Flex por mes',
}
const companyPlanOrder=['gratis','impulso','seleccion']

export default function FlexPlanBenefitsBridge(){
 useEffect(()=>{
  const comparisonStyle=document.createElement('style')
  comparisonStyle.dataset.pmCvComparisonSemantics='1'
  comparisonStyle.textContent=`
   .pmcv-page .pmcv-shell section:has([class*="compareCard"]) [class*="compareCard"]>[class*="compareRow"]:nth-child(2)>i{background:#f0fbf5!important;color:#168451!important}
   .pmcv-page .pmcv-shell section:has([class*="compareCard"]) [class*="compareCard"]>[class*="compareRow"]:nth-child(2)>i::before{content:"✓"!important;background:#dff8ea!important;color:#168451!important}
  `
  document.head.appendChild(comparisonStyle)

  const apply=()=>{
   let touched=false
   document.querySelectorAll('.pm7-employer-plan').forEach((card,index)=>{
    const plan=(card as HTMLElement).dataset.plan||companyPlanOrder[index]||''
    const list=card.querySelector('ul')
    if(!plan||!list||!companyCredits[plan])return
    ;(card as HTMLElement).dataset.plan=plan
    if(list.querySelector('[data-pm-flex-benefit]')||list.textContent?.includes('Servicios Flex')){touched=true;return}
    const li=document.createElement('li')
    li.dataset.pmFlexBenefit='1'
    li.textContent=`✓ ${companyCredits[plan]}`
    li.style.fontWeight='900'
    list.appendChild(li)
    touched=true
   })
   return touched
  }

  if(!apply()){
   const observer=new MutationObserver(()=>{if(apply())observer.disconnect()})
   observer.observe(document.body,{childList:true,subtree:true})
   const stop=window.setTimeout(()=>observer.disconnect(),3000)
   return()=>{comparisonStyle.remove();observer.disconnect();window.clearTimeout(stop)}
  }
  return()=>comparisonStyle.remove()
 },[])
 return null
}
