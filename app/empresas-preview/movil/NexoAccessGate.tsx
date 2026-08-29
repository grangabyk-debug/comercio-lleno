'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {cvAuthClient} from '../../cv-ia/cvAuth'
import EmployerMobileHub from './EmployerMobileHub'

type PlanId='gratis'|'impulso'|'seleccion'
type GateState='loading'|'unauthenticated'|'needs_company'|'locked'|'allowed'
const LABEL:Record<PlanId,string>={gratis:'Gratis',impulso:'Impulso',seleccion:'Selección IA'}

export default function NexoAccessGate(){
 const [state,setState]=useState<GateState>('loading')
 const [plan,setPlan]=useState<PlanId>('gratis')
 const [companyName,setCompanyName]=useState('')
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 const [trial,setTrial]=useState<{ends_at:string;days_remaining:number}|null>(null)

 async function load(){
  setState('loading')
  const {data}=await cvAuthClient().auth.getSession()
  const session=data.session
  if(!session){setState('unauthenticated');return}
  const headers={Authorization:`Bearer ${session.access_token}`}
  const companyResponse=await fetch('/api/postula/company',{headers,cache:'no-store'})
  const companyPayload=await companyResponse.json().catch(()=>({}))
  const membership=companyPayload?.memberships?.[0]
  if(!membership?.company_id||!membership?.pm_companies){setState('needs_company');return}
  setCompanyName(String(membership.pm_companies.name||'Tu empresa'))
  const statusResponse=await fetch(`/api/postula/billing/status?company=${encodeURIComponent(String(membership.company_id))}`,{headers,cache:'no-store'})
  const statusPayload=await statusResponse.json().catch(()=>({}))
  const current=String(statusPayload?.plan||'gratis')
  setPlan(current==='seleccion'?'seleccion':current==='impulso'?'impulso':'gratis')
  setTrial(statusPayload?.trial?.active?{ends_at:String(statusPayload.trial.ends_at),days_remaining:Number(statusPayload.trial.days_remaining||0)}:null)
  setState(statusPayload?.nexo_enabled?'allowed':'locked')
 }

 useEffect(()=>{void load()},[])

 async function activateSelection(){
  if(busy)return
  setBusy(true);setError('')
  try{
   const {data}=await cvAuthClient().auth.getSession()
   const session=data.session
   if(!session){location.assign('/acceso?rol=empresa&next=/empresas/movil');return}
   localStorage.setItem('pm_selected_company_plan','seleccion')
   const response=await fetch('/api/postula/billing/checkout',{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({plan:'seleccion'})})
   const payload=await response.json().catch(()=>({}))
   if(response.status===409&&payload?.code==='needs_company'){
    location.assign('/empresas/registro?plan=seleccion&next=/empresas/movil')
    return
   }
   if(!response.ok||!payload?.ok)throw new Error(payload?.error||'No pudimos activar Selección IA ahora.')
   await load()
  }catch(e){setError(e instanceof Error?e.message:'No pudimos activar Selección IA ahora. Probá nuevamente.')}
  finally{setBusy(false)}
 }

 if(state==='loading')return <div className="pmm-loading">Verificando acceso a Nexo…</div>
 if(state==='allowed')return <EmployerMobileHub/>
 if(state==='unauthenticated')return <main className="pmm-empty"><h1>Nexo Móvil</h1><p>Primero ingresá con tu cuenta de empresa para verificar qué plan tenés activo.</p><Link href="/acceso?rol=empresa&next=/empresas/movil">Ingresar a mi cuenta</Link></main>
 if(state==='needs_company')return <main className="pmm-empty"><h1>Primero configurá tu empresa.</h1><p>Nexo se habilita sobre una empresa real asociada a tu cuenta.</p><Link href="/empresas/registro?plan=seleccion&next=/empresas/movil">Configurar empresa</Link></main>

 return <main className="pmm-plan-lock"><section className="pmm-plan-lock-card">
  <div className="pmm-lock-orb">NX</div><span className="pmm-lock-kicker">NEXO MÓVIL · SELECCIÓN IA</span>
  <h1>Nexo se habilita con <em>Selección IA.</em></h1>
  <p className="pmm-lock-lead">{companyName} está actualmente en <b>{LABEL[plan]}</b>. Podés activar Selección IA ahora sin pagar y usar Nexo durante 30 días.</p>
  {trial&&<div className="pmm-pending-plan"><b>Período gratis activo</b><span>Quedan {trial.days_remaining} días. Si el período termina sin pago, la empresa vuelve automáticamente a Gratis.</span></div>}
  <div className="pmm-upgrade-grid"><article className="recommended"><span>REGISTRÁNDOTE HOY</span><h2>Selección IA</h2><div><s>$34.900 / mes</s></div><strong>$0 <small>por 30 días</small></strong><p>Nexo en PC y móvil, ranking explicable, preguntas de entrevista, métricas y derivación real de candidatos a RR. HH.</p><small>Después $34.900 por mes. No te cobramos nada hoy.</small><button type="button" disabled={busy} onClick={()=>void activateSelection()}>{busy?'Activando…':'Activar 30 días gratis'}</button></article></div>
  {error&&<div className="pmm-upgrade-error" role="alert">{error}</div>}
  <div className="pmm-lock-foot"><Link href="/empresas#planes">Ver planes</Link><Link href="/empresas/panel">Volver al panel</Link></div>
 </section></main>
}
