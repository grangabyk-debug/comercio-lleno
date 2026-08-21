'use client'

import {useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type PlanId='gratis'|'impulso'|'seleccion'|'escala'|'empresa'
const PLAN_IDS:PlanId[]=['gratis','impulso','seleccion','escala','empresa']
const PLAN_LABEL:Record<PlanId,string>={gratis:'Gratis',impulso:'Impulso',seleccion:'Selección IA',escala:'Escala',empresa:'Empresa'}

export default function EmployerPlansUpgrade(){
 const [notice,setNotice]=useState('')
 async function startPlan(plan:PlanId){
  try{
   localStorage.setItem('pm_selected_company_plan',plan)
   const {data}=await cvAuthClient().auth.getSession()
   const session=data.session
   if(!session){
    location.assign(`/empresas/registro?plan=${encodeURIComponent(plan)}`)
    return
   }
   if(plan==='gratis'){
    location.assign('/empresas/panel?plan=gratis')
    return
   }
   if(plan==='empresa'){
    location.assign('/empresas/configuracion?plan=empresa&origen=planes')
    return
   }
   const response=await fetch('/api/postula/billing/checkout',{
    method:'POST',
    headers:{Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},
    body:JSON.stringify({plan}),
   })
   const payload=await response.json().catch(()=>({}))
   if(response.status===409&&payload?.code==='needs_company'){
    location.assign(`/empresas/registro?plan=${encodeURIComponent(plan)}`)
    return
   }
   if(response.ok&&payload?.init_point){
    location.assign(payload.init_point)
    return
   }
   setNotice(payload?.error||`Tu plan ${PLAN_LABEL[plan]} quedó seleccionado. Terminá la configuración de la empresa para continuar.`)
  }catch{
   setNotice('No pudimos abrir el pago ahora. Tu plan quedó seleccionado para continuar después.')
  }
 }

 useEffect(()=>{
  const enhance=()=>{
   const plans=document.querySelector('.pm7-employer-plans') as HTMLElement|null
   if(plans){
    const section=plans.closest('section') as HTMLElement|null
    section?.classList.add('pm19-plans-ready')
    const head=section?.querySelector('.pm7-section-head') as HTMLElement|null
    const kicker=head?.querySelector('.pm7-eyebrow') as HTMLElement|null
    const title=head?.querySelector('h2') as HTMLElement|null
    const copy=head?.querySelector(':scope > p') as HTMLElement|null
    if(kicker)kicker.textContent='PLANES PARA EMPRESAS'
    if(title)title.textContent='Cinco planes. Elegí el que te acompaña hoy.'
    if(copy)copy.textContent='Primero creás tu cuenta y configurás la empresa. Después elegís el plan y, si corresponde, pasás al pago. Sin vueltas y sin perder lo que ya completaste.'
    const cards=Array.from(plans.querySelectorAll('.pm7-employer-plan')) as HTMLElement[]
    cards.forEach((card,index)=>{
     const plan=PLAN_IDS[index]
     if(!plan)return
     card.dataset.plan=plan
     card.tabIndex=0
     const link=card.querySelector('a') as HTMLAnchorElement|null
     if(link){
      link.href=`/empresas/registro?plan=${plan}`
      link.textContent=plan==='gratis'?'Crear cuenta gratis':plan==='empresa'?'Configurar plan a medida':`Elegir ${PLAN_LABEL[plan]}`
      link.onclick=(event)=>{event.preventDefault();void startPlan(plan)}
     }
     card.onclick=(event)=>{
      if((event.target as HTMLElement).closest('a'))return
      cards.forEach(item=>item.classList.remove('pm19-active'))
      card.classList.add('pm19-active')
     }
     card.onkeydown=(event)=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();cards.forEach(item=>item.classList.remove('pm19-active'));card.classList.add('pm19-active')}
     }
    })
   }

   if(location.pathname.startsWith('/empresas/registro')){
    const chosen=(localStorage.getItem('pm_selected_company_plan')||'') as PlanId
    if(PLAN_IDS.includes(chosen)){
     const doneLink=document.querySelector('a[href="/empresas/panel"]') as HTMLAnchorElement|null
     if(doneLink&&!doneLink.dataset.pmPlanEnhanced){
      doneLink.dataset.pmPlanEnhanced='1'
      doneLink.textContent=chosen==='gratis'?'Entrar al panel':chosen==='empresa'?'Continuar con plan Empresa':`Continuar con ${PLAN_LABEL[chosen]}`
      doneLink.onclick=(event)=>{event.preventDefault();void startPlan(chosen)}
     }
    }
   }
  }
  enhance()
  const observer=new MutationObserver(enhance)
  observer.observe(document.body,{childList:true,subtree:true})
  return()=>observer.disconnect()
 },[])

 if(!notice)return null
 return <div className="pm19-plan-notice" role="status"><div><b>Plan guardado</b><span>{notice}</span></div><button type="button" onClick={()=>setNotice('')} aria-label="Cerrar">×</button></div>
}
