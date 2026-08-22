'use client'

import {useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'
import CandidateDashboard from './CandidateDashboard'

export default function CandidateActivationGate({jobCount=0}:{jobCount?:number}){
 const [state,setState]=useState<'loading'|'guest'|'needs_activation'|'ready'>('loading')
 const [companyName,setCompanyName]=useState('')
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 async function load(){
  const {data}=await cvAuthClient().auth.getSession();const session=data.session
  if(!session){setState('guest');return}
  try{
   const r=await fetch('/api/postula/profile',{headers:{Authorization:`Bearer ${session.access_token}`},cache:'no-store'});const d=await r.json().catch(()=>({}))
   const activated=Boolean(d?.profile?.onboarding_completed)||Boolean((d?.consents||[]).some((x:any)=>x.consent_type==='candidate_profile_activation'&&x.accepted))
   const meaningful=Boolean(d?.candidate&&(d.candidate.city||d.candidate.headline||d.candidate.resume_name||(d.candidate.skills||[]).length))
   const membership=(d?.memberships||[])[0];setCompanyName(String(membership?.pm_companies?.name||''))
   setState(activated||meaningful?'ready':'needs_activation')
  }catch{setState('needs_activation')}
 }
 useEffect(()=>{void load()},[])
 async function activate(){setBusy(true);setError('');try{const {data}=await cvAuthClient().auth.getSession();const token=data.session?.access_token;if(!token){location.assign('/login');return}const r=await fetch('/api/postula/profile',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({role:'candidate',activate_candidate:true,accept_legal:true,source:'candidate_activation',terms_version:'2026-08-21'})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos activar el perfil.');setState('ready')}catch(e){setError(e instanceof Error?e.message:'No pudimos activar el perfil.')}finally{setBusy(false)}}
 if(state==='loading')return <section className="pm-role-activation loading"><b>Preparando tu cuenta…</b></section>
 if(state==='guest')return <CandidateDashboard jobCount={jobCount}/>
 if(state==='needs_activation')return <section className="pm-role-activation"><span>PERFIL DE POSTULANTE</span><h1>Activá tu lado postulante.</h1><p>{companyName?<>Tu usuario ya administra <b>{companyName}</b>. No hace falta crear otro email ni otra contraseña. Activá un perfil personal separado para buscar empleo, postularte, usar tu CV, conversar y participar en Trabajo Flex.</>:<>Usá esta misma cuenta para crear tu perfil personal de postulante. Después podés completar CV, zona, habilidades y disponibilidad a tu ritmo.</>}</p><div className="pm-role-activation-points"><div><b>Una sola identidad</b><small>Mismo email y contraseña</small></div><div><b>Perfiles separados</b><small>Empresa y búsqueda laboral no se mezclan</small></div><div><b>Mensajes compartidos</b><small>PC y móvil, según dónde estés</small></div></div><button type="button" onClick={()=>void activate()} disabled={busy}>{busy?'Activando…':'Activar mi perfil de postulante'}</button><small className="pm-role-activation-legal">Al activar el perfil aceptás que tus datos personales de búsqueda laboral se administren por separado de los datos de la empresa, bajo los Términos y la Política de Privacidad de Postulá Mejor.</small>{error&&<div className="pm-role-activation-error">{error}</div>}</section>
 return <CandidateDashboard jobCount={jobCount}/>
}
