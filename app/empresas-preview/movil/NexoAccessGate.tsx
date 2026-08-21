'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {cvAuthClient} from '../../cv-ia/cvAuth'
import EmployerMobileHub from './EmployerMobileHub'

type PlanId='gratis'|'impulso'|'seleccion'|'escala'|'empresa'
type GateState='loading'|'unauthenticated'|'needs_company'|'locked'|'allowed'
const LABEL:Record<PlanId,string>={gratis:'Gratis',impulso:'Impulso',seleccion:'Selección IA',escala:'Escala',empresa:'Empresa'}

export default function NexoAccessGate(){
 const [state,setState]=useState<GateState>('loading')
 const [plan,setPlan]=useState<PlanId>('gratis')
 const [pendingPlan,setPendingPlan]=useState<PlanId|null>(null)
 const [companyName,setCompanyName]=useState('')
 const [busy,setBusy]=useState<PlanId|null>(null)
 const [error,setError]=useState('')

 async function load(){
  setState('loading')
  const {data}=await cvAuthClient().auth.getSession()
  const session=data.session
  if(!session){setState('unauthenticated');return}
  const headers={Authorization:`Bearer ${session.access_token}`}
  const companyResponse=await fetch('/api/postula/company',{headers})
  const companyPayload=await companyResponse.json().catch(()=>({}))
  const membership=companyPayload?.memberships?.[0]
  if(!membership?.company_id||!membership?.pm_companies){setState('needs_company');return}
  setCompanyName(String(membership.pm_companies.name||'Tu empresa'))
  const statusResponse=await fetch(`/api/postula/billing/status?company=${encodeURIComponent(String(membership.company_id))}`,{headers,cache:'no-store'})
  const statusPayload=await statusResponse.json().catch(()=>({}))
  const current=(String(statusPayload?.plan||'gratis')) as PlanId
  const pending=statusPayload?.pending_plan?String(statusPayload.pending_plan) as PlanId:null
  setPlan(current in LABEL?current:'gratis')
  setPendingPlan(pending&&pending in LABEL?pending:null)
  setState(statusPayload?.nexo_enabled?'allowed':'locked')
 }

 useEffect(()=>{void load()},[])

 async function upgrade(next:PlanId){
  setBusy(next);setError('')
  try{
   const {data}=await cvAuthClient().auth.getSession()
   const session=data.session
   if(!session){location.assign('/acceso?rol=empresa&next=/empresas/movil');return}
   localStorage.setItem('pm_selected_company_plan',next)
   if(next==='empresa'){
    location.assign('/empresas/configuracion?plan=empresa&origen=nexo')
    return
   }
   const response=await fetch('/api/postula/billing/checkout',{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({plan:next})})
   const payload=await response.json().catch(()=>({}))
   if(response.status===409&&payload?.code==='needs_company'){
    location.assign(`/empresas/registro?plan=${encodeURIComponent(next)}`)
    return
   }
   if(response.ok&&payload?.init_point){location.assign(payload.init_point);return}
   setError(payload?.error||'No pudimos iniciar el cambio de plan ahora.')
  }catch{
   setError('No pudimos iniciar el cambio de plan ahora. Probá nuevamente en unos minutos.')
  }finally{setBusy(null)}
 }

 if(state==='loading')return <div className="pmm-loading">Verificando acceso a Nexo…</div>
 if(state==='allowed')return <EmployerMobileHub/>
 if(state==='unauthenticated')return <main className="pmm-empty"><h1>Nexo Móvil</h1><p>Primero ingresá con tu cuenta de empresa para verificar qué plan tenés activo.</p><Link href="/acceso?rol=empresa&next=/empresas/movil">Ingresar a mi cuenta</Link></main>
 if(state==='needs_company')return <main className="pmm-empty"><h1>Primero configurá tu empresa.</h1><p>Nexo se habilita sobre una empresa real asociada a tu cuenta.</p><Link href="/empresas/registro?next=/empresas/movil">Configurar empresa</Link></main>

 return <main className="pmm-plan-lock">
  <section className="pmm-plan-lock-card">
   <div className="pmm-lock-orb">NX</div>
   <span className="pmm-lock-kicker">NEXO MÓVIL · FUNCIÓN PREMIUM</span>
   <h1>Nexo se habilita desde <em>Selección IA.</em></h1>
   <p className="pmm-lock-lead">{companyName} está actualmente en <b>{LABEL[plan]}</b>. Para usar Nexo desde el celular necesitás Selección IA, Escala o Empresa.</p>
   {pendingPlan&&<div className="pmm-pending-plan"><b>Tenés {LABEL[pendingPlan]} pendiente.</b><span>Si ya completaste el pago, volvé a verificar el acceso. La activación se realiza cuando Mercado Pago confirma la suscripción.</span><button type="button" onClick={()=>void load()}>Verificar nuevamente</button></div>}
   <div className="pmm-upgrade-grid">
    <article className="recommended"><span>MÍNIMO PARA NEXO</span><h2>Selección IA</h2><strong>$34.900 <small>/ mes</small></strong><p>Nexo móvil, entrevistas, shortlist explicada y hasta 2.000 postulaciones por mes.</p><button type="button" disabled={Boolean(busy)} onClick={()=>void upgrade('seleccion')}>{busy==='seleccion'?'Abriendo pago…':'Subir a Selección IA'}</button></article>
    <article><span>MÁS VOLUMEN</span><h2>Escala</h2><strong>$74.900 <small>/ mes</small></strong><p>Incluye Nexo y suma varias áreas, usuarios, reglas, auditoría y mayor capacidad.</p><button type="button" disabled={Boolean(busy)} onClick={()=>void upgrade('escala')}>{busy==='escala'?'Abriendo pago…':'Elegir Escala'}</button></article>
    <article><span>ORGANIZACIONES</span><h2>Empresa</h2><strong>A medida</strong><p>Nexo incluido, múltiples unidades, gobierno corporativo e integraciones acordadas.</p><button type="button" disabled={Boolean(busy)} onClick={()=>void upgrade('empresa')}>Hablar por plan Empresa</button></article>
   </div>
   {error&&<div className="pmm-upgrade-error" role="alert">{error}</div>}
   <div className="pmm-lock-foot"><Link href="/empresas#planes">Ver los cinco planes</Link><Link href="/empresas/panel">Volver al panel</Link></div>
  </section>
 </main>
}
