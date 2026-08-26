'use client'

import {useEffect,useRef,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type PlanId='gratis'|'impulso'|'seleccion'|'escala'|'empresa'
const PLAN_IDS:PlanId[]=['gratis','impulso','seleccion','escala','empresa']
const PLAN_LABEL:Record<PlanId,string>={gratis:'Gratis',impulso:'Impulso',seleccion:'Selección IA',escala:'Escala',empresa:'Empresa'}

export default function EmployerPlansUpgrade(){
 const [notice,setNotice]=useState('')
 const [busyPlan,setBusyPlan]=useState<PlanId|null>(null)
 const checkoutLock=useRef(false)

 async function startPlan(plan:PlanId){
  if(checkoutLock.current)return
  checkoutLock.current=true
  const paid=plan==='impulso'||plan==='seleccion'||plan==='escala'
  try{
   localStorage.setItem('pm_selected_company_plan',plan)
   setNotice('')
   if(paid){
    setBusyPlan(plan)
    await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()))
   }
   const {data}=await cvAuthClient().auth.getSession()
   const session=data.session
   if(!session){setBusyPlan(null);checkoutLock.current=false;location.assign(`/empresas/registro?plan=${encodeURIComponent(plan)}`);return}
   if(plan==='gratis'){setBusyPlan(null);checkoutLock.current=false;location.assign('/empresas/panel?plan=gratis');return}
   if(plan==='empresa'){setBusyPlan(null);checkoutLock.current=false;location.assign('/empresas/configuracion?plan=empresa&origen=planes');return}
   const response=await fetch('/api/postula/billing/checkout',{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({plan})})
   const payload=await response.json().catch(()=>({}))
   if(response.status===409&&payload?.code==='needs_company'){setBusyPlan(null);checkoutLock.current=false;location.assign(`/empresas/registro?plan=${encodeURIComponent(plan)}`);return}
   if(response.ok&&payload?.init_point){location.assign(payload.init_point);return}
   setBusyPlan(null)
   checkoutLock.current=false
   setNotice(payload?.error||`Tu plan ${PLAN_LABEL[plan]} quedó seleccionado. Terminá la configuración de la empresa para continuar.`)
  }catch{
   setBusyPlan(null)
   checkoutLock.current=false
   setNotice('No pudimos abrir el pago ahora. Tu plan quedó seleccionado para continuar después.')
  }
 }

 useEffect(()=>{
  const ensureHint=(rel:string,href:string)=>{
   if(document.head.querySelector(`link[rel="${rel}"][href="${href}"]`))return
   const link=document.createElement('link')
   link.rel=rel
   link.href=href
   if(rel==='preconnect')link.crossOrigin='anonymous'
   document.head.appendChild(link)
  }
  ensureHint('dns-prefetch','//www.mercadopago.com.ar')
  ensureHint('preconnect','https://www.mercadopago.com.ar')

  let frame=0
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
    if(title)title.textContent='Cinco planes. Elegí el que te acompaña hoy.'
    if(copy)copy.textContent='Primero creás tu cuenta y configurás la empresa. Después elegís el plan y, si corresponde, pasás al pago. Sin vueltas y sin perder lo que ya completaste.'
    const cards=Array.from(plans.querySelectorAll('.pm7-employer-plan')) as HTMLElement[]
    cards.forEach((card,index)=>{
     const plan=PLAN_IDS[index];if(!plan)return
     card.dataset.plan=plan;card.tabIndex=0
     const link=card.querySelector('a') as HTMLAnchorElement|null
     if(link){link.href=`/empresas/registro?plan=${plan}`;link.textContent=plan==='gratis'?'Crear cuenta gratis':plan==='empresa'?'Configurar plan a medida':`Elegir ${PLAN_LABEL[plan]}`;link.onclick=(event)=>{event.preventDefault();void startPlan(plan)}}
     card.onclick=(event)=>{if((event.target as HTMLElement).closest('a'))return;cards.forEach(item=>item.classList.remove('pm19-active'));card.classList.add('pm19-active')}
     card.onkeydown=(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();cards.forEach(item=>item.classList.remove('pm19-active'));card.classList.add('pm19-active')}}
    })
   }

   if(location.pathname.startsWith('/empresas/registro')){
    const chosen=(localStorage.getItem('pm_selected_company_plan')||'') as PlanId
    if(PLAN_IDS.includes(chosen)){
     const doneLink=document.querySelector('a[href="/empresas/panel"]') as HTMLAnchorElement|null
     if(doneLink&&!doneLink.dataset.pmPlanEnhanced){doneLink.dataset.pmPlanEnhanced='1';doneLink.textContent=chosen==='gratis'?'Entrar al panel':chosen==='empresa'?'Continuar con plan Empresa':`Continuar con ${PLAN_LABEL[chosen]}`;doneLink.onclick=(event)=>{event.preventDefault();void startPlan(chosen)}}
    }
   }
  }
  frame=requestAnimationFrame(enhance)
  return()=>cancelAnimationFrame(frame)
 },[])

 return <>
  {busyPlan&&<div className="pm19-checkout-overlay" role="status" aria-live="polite" aria-busy="true">
   <div className="pm19-checkout-card">
    <div className="pm19-checkout-provider"><span>MP</span><b>Mercado Pago</b></div>
    <div className="pm19-checkout-spinner" aria-hidden="true"/>
    <strong>Te estamos llevando a Mercado Pago</strong>
    <p>Estamos preparando el checkout seguro de <b>{PLAN_LABEL[busyPlan]}</b>. Puede tardar unos segundos.</p>
    <small>No cierres esta ventana.</small>
   </div>
  </div>}
  {notice&&<div className="pm19-plan-notice" role="status"><div><b>No pudimos continuar</b><span>{notice}</span></div><button type="button" onClick={()=>setNotice('')} aria-label="Cerrar">×</button></div>}
 </>
}
