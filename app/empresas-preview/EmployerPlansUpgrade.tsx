'use client'

import {useEffect,useRef,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type PlanId='gratis'|'impulso'|'seleccion'
const PLAN_IDS:PlanId[]=['gratis','impulso','seleccion']
const PLAN_LABEL:Record<PlanId,string>={gratis:'Gratis',impulso:'Impulso',seleccion:'Selección IA'}

export default function EmployerPlansUpgrade(){
 const [notice,setNotice]=useState('')
 const [busyPlan,setBusyPlan]=useState<PlanId|null>(null)
 const checkoutLock=useRef(false)

 async function startPlan(plan:PlanId){
  if(checkoutLock.current)return
  checkoutLock.current=true
  try{
   localStorage.setItem('pm_selected_company_plan',plan)
   setNotice('')
   setBusyPlan(plan)
   const {data}=await cvAuthClient().auth.getSession()
   const session=data.session
   if(!session){setBusyPlan(null);checkoutLock.current=false;location.assign(`/empresas/registro?plan=${encodeURIComponent(plan)}`);return}
   if(plan==='gratis'){setBusyPlan(null);checkoutLock.current=false;location.assign('/empresas/panel?plan=gratis');return}
   const response=await fetch('/api/postula/billing/checkout',{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({plan})})
   const payload=await response.json().catch(()=>({}))
   if(response.status===409&&payload?.code==='needs_company'){setBusyPlan(null);checkoutLock.current=false;location.assign(`/empresas/registro?plan=${encodeURIComponent(plan)}`);return}
   if(response.ok&&payload?.ok){localStorage.removeItem('pm_selected_company_plan');location.assign(`/empresas/panel?trial=1&plan=${encodeURIComponent(plan)}`);return}
   setBusyPlan(null);checkoutLock.current=false
   setNotice(payload?.error||`No pudimos activar ${PLAN_LABEL[plan]} ahora.`)
  }catch{
   setBusyPlan(null);checkoutLock.current=false
   setNotice('No pudimos activar el plan ahora. Probá nuevamente en unos segundos.')
  }
 }

 useEffect(()=>{
  const enhance=()=>{
   const plans=document.querySelector('.pm7-employer-plans') as HTMLElement|null
   if(plans&&!plans.dataset.pmPlansEnhanced){
    plans.dataset.pmPlansEnhanced='1'
    const section=plans.closest('section') as HTMLElement|null
    section?.classList.add('pm19-plans-ready')
    const head=section?.querySelector('.pm7-section-head') as HTMLElement|null
    const kicker=head?.querySelector('.pm7-eyebrow') as HTMLElement|null
    const title=head?.querySelector('h2') as HTMLElement|null
    const copy=head?.querySelector(':scope > p') as HTMLElement|null
    if(kicker)kicker.textContent='PLANES PARA EMPRESAS'
    if(title)title.textContent='Probá 30 días gratis. Después decidís.'
    if(copy)copy.textContent='Gratis sigue en $0. Impulso y Selección IA se activan hoy sin pago durante 30 días. Antes del vencimiento te avisamos; si no continuás, la cuenta vuelve automáticamente al plan Gratis.'
    const cards=Array.from(plans.querySelectorAll('.pm7-employer-plan')) as HTMLElement[]
    cards.forEach((card,index)=>{
     const plan=PLAN_IDS[index];if(!plan)return
     card.dataset.plan=plan;card.tabIndex=0
     const link=card.querySelector('a') as HTMLAnchorElement|null
     if(link){
      link.href=`/empresas/registro?plan=${plan}`
      link.textContent=plan==='gratis'?'Crear cuenta gratis':`Activar ${PLAN_LABEL[plan]} gratis 30 días`
      link.onclick=(event)=>{event.preventDefault();void startPlan(plan)}
     }
     card.onclick=(event)=>{if((event.target as HTMLElement).closest('a'))return;cards.forEach(item=>item.classList.remove('pm19-active'));card.classList.add('pm19-active')}
     card.onkeydown=(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();cards.forEach(item=>item.classList.remove('pm19-active'));card.classList.add('pm19-active')}}
    })
   }

   if(location.pathname.startsWith('/empresas/registro')){
    const chosen=(localStorage.getItem('pm_selected_company_plan')||'') as PlanId
    if(PLAN_IDS.includes(chosen)){
     const doneLink=document.querySelector('a[href="/empresas/panel"]') as HTMLAnchorElement|null
     if(doneLink&&!doneLink.dataset.pmPlanEnhanced){
      doneLink.dataset.pmPlanEnhanced='1'
      doneLink.textContent=chosen==='gratis'?'Entrar al panel':`Activar ${PLAN_LABEL[chosen]} gratis 30 días`
      doneLink.onclick=(event)=>{event.preventDefault();void startPlan(chosen)}
     }
    }
   }
  }

  enhance()
  const observer=new MutationObserver(()=>enhance())
  observer.observe(document.body,{childList:true,subtree:true})
  const retry=window.setInterval(enhance,250)
  const stop=window.setTimeout(()=>window.clearInterval(retry),12000)
  return()=>{observer.disconnect();window.clearInterval(retry);window.clearTimeout(stop)}
 },[])

 return <>
  {busyPlan&&<div className="pm19-checkout-overlay" role="status" aria-live="polite" aria-busy="true"><div className="pm19-checkout-card"><div className="pm19-checkout-spinner" aria-hidden="true"/><strong>{busyPlan==='gratis'?'Preparando tu cuenta':'Activando tus 30 días gratis'}</strong><p>{busyPlan==='gratis'?'Estamos abriendo tu panel.':`Estamos activando ${PLAN_LABEL[busyPlan]} sin cobro inicial.`}</p><small>Puede tardar unos segundos.</small></div></div>}
  {notice&&<div className="pm19-plan-notice" role="status"><div><b>No pudimos continuar</b><span>{notice}</span></div><button type="button" onClick={()=>setNotice('')} aria-label="Cerrar">×</button></div>}
 </>
}
