'use client'

import {useEffect,useMemo,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type AnswerKey='adult'|'one_off'|'recurring'|'supervised'|'role_replacement'|'private_home'|'platform_transport'
type Answers=Record<AnswerKey,boolean|null>
const VERSION='services-flex-2026-08-25'
const EMPTY:Answers={adult:null,one_off:null,recurring:null,supervised:null,role_replacement:null,private_home:null,platform_transport:null}

function normalizedAnswers(adult:boolean):Answers{
 return {adult,one_off:true,recurring:false,supervised:false,role_replacement:false,private_home:false,platform_transport:false}
}

export default function ServicesFlexLegalGuard(){
 const[open,setOpen]=useState(false),[adult,setAdult]=useState<boolean|null>(null),[accepted,setAccepted]=useState(false),[busy,setBusy]=useState(false),[result,setResult]=useState(''),[error,setError]=useState('')
 const complete=useMemo(()=>adult===true&&accepted,[adult,accepted])

 useEffect(()=>{
  try{
   const cached=sessionStorage.getItem('pm_services_flex_legal_answers')
   if(cached){const parsed={...EMPTY,...JSON.parse(cached)} as Answers;if(parsed.adult===true){setAdult(true);setAccepted(true)}}
  }catch{}
  const launch=()=>{setResult('');setError('');setOpen(true)}
  const capture=(event:MouseEvent)=>{const target=event.target as Element|null;const trigger=target?.closest?.('#publicar-flex,[data-services-flex-publish]');if(!trigger)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();launch()}
  document.addEventListener('click',capture,true)
  const params=new URLSearchParams(location.search);if(params.get('clasificar')==='1'){params.delete('clasificar');const qs=params.toString();history.replaceState({},'',`${location.pathname}${qs?`?${qs}`:''}${location.hash}`);window.setTimeout(launch,0)}
  return()=>document.removeEventListener('click',capture,true)
 },[])

 async function confirm(){
  if(!complete||busy)return
  const answers=normalizedAnswers(true)
  setBusy(true);setError('')
  try{
   sessionStorage.setItem('pm_services_flex_legal_answers',JSON.stringify(answers))
   const{data}=await cvAuthClient().auth.getSession()
   if(!data.session){setOpen(false);window.dispatchEvent(new CustomEvent('pm:flex-publish'));return}
   const{data:record,error:rpcError}=await cvAuthClient().rpc('pm_record_flex_legal_check',{p_answers:answers,p_policy_version:VERSION})
   if(rpcError)throw rpcError
   const serverResult=String(record?.result||'allowed');setResult(serverResult)
   if(serverResult==='allowed'){setOpen(false);window.dispatchEvent(new CustomEvent('pm:flex-publish'))}
  }catch(e){setError(e instanceof Error?e.message:'No pudimos validar el encuadre. Intentá nuevamente.')}finally{setBusy(false)}
 }

 if(!open)return null
 const ageBlocked=adult===false||result==='age_restricted'
 return <div className="pmsf-guard-backdrop" role="dialog" aria-modal="true" aria-labelledby="pmsf-guard-title" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
  <section className="pmsf-guard-card">
   <button type="button" className="pmsf-guard-close" onClick={()=>setOpen(false)} aria-label="Cerrar">×</button>
   <span className="pmsf-guard-kicker">ANTES DE PUBLICAR · SERVICIOS FLEX</span>
   <h2 id="pmsf-guard-title">Una confirmación rápida.</h2>
   <p className="pmsf-guard-intro">Servicios Flex es para tareas puntuales entre partes independientes. Antes de continuar, confirmá estas dos condiciones.</p>

   {!ageBlocked?<div className="pmsf-guard-compact">
    <article className="pmsf-guard-age"><div><b>¿Sos mayor de 18 años?</b><small>Servicios Flex está disponible únicamente para personas adultas.</small></div><div className="pmsf-age-actions"><button type="button" data-on={adult===true} onClick={()=>setAdult(true)}>Sí</button><button type="button" data-on={adult===false} onClick={()=>{setAdult(false);setAccepted(false)}}>No</button></div></article>
    <label className="pmsf-guard-accept" data-disabled={adult!==true}>
     <input type="checkbox" checked={accepted} disabled={adult!==true} onChange={e=>setAccepted(e.target.checked)}/>
     <span><b>Acepto las condiciones de Servicios Flex</b><small>Confirmo que la tarea es puntual e independiente, que no reemplaza un puesto de trabajo permanente, no implica una relación laboral continua o supervisada, no corresponde a trabajo habitual de casas particulares y no consiste principalmente en reparto o traslado de personas coordinado por la plataforma. También acepto los <a href="/terminos/servicios-flex" target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}>Términos de Servicios Flex</a>.</small></span>
    </label>
   </div>:<div className="pmsf-guard-blocked"><b>Servicios Flex está disponible sólo para mayores de 18 años.</b><p>No habilitamos publicación ni contratación de servicios puntuales para cuentas de menores dentro de esta sección.</p><button type="button" onClick={()=>{setAdult(null);setAccepted(false);setResult('')}}>Volver</button></div>}

   {!ageBlocked&&<footer><div><b>El pago se acuerda directamente entre las partes.</b><small>Postulá Mejor no recibe ni custodia el dinero del servicio.</small></div><button type="button" disabled={!complete||busy} onClick={()=>void confirm()}>{busy?'Validando…':'Aceptar y continuar'}</button></footer>}
   {error&&<p className="pmsf-guard-error">{error}</p>}
  </section>
  <style jsx global>{`
   .pmsf-guard-backdrop{position:fixed;inset:0;z-index:12000;background:rgba(8,12,18,.72);backdrop-filter:blur(9px);display:grid;place-items:center;padding:22px;overflow:auto}
   .pmsf-guard-card{position:relative;width:min(720px,100%);background:#fff;border-radius:28px;padding:30px;box-shadow:0 35px 100px rgba(0,0,0,.32);color:#151822;font-family:Inter,system-ui,sans-serif}
   .pmsf-guard-close{position:absolute;right:18px;top:16px;width:40px;height:40px;border:0;border-radius:50%;background:#f0f2f5;font-size:25px;cursor:pointer}
   .pmsf-guard-kicker{font-size:11px;font-weight:950;letter-spacing:.13em;color:#5c49ff}.pmsf-guard-card h2{font-size:32px;line-height:1.03;letter-spacing:-.045em;margin:9px 50px 8px 0}.pmsf-guard-intro{font-size:14px;line-height:1.5;color:#59616d;max-width:620px;margin-bottom:20px}
   .pmsf-guard-compact{display:grid;gap:12px}.pmsf-guard-age{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:16px;padding:16px 17px;border:1px solid #e2e5e9;border-radius:17px;background:#fafbfc}.pmsf-guard-age b,.pmsf-guard-accept b{display:block;font-size:14px}.pmsf-guard-age small,.pmsf-guard-accept small{display:block;margin-top:4px;color:#69717c;line-height:1.45}.pmsf-age-actions{display:flex;gap:7px}.pmsf-age-actions button{border:1px solid #ccd2da;background:#fff;border-radius:12px;padding:9px 15px;font-weight:850;cursor:pointer}.pmsf-age-actions button[data-on=true]{background:#17202a;color:#fff;border-color:#17202a}
   .pmsf-guard-accept{display:grid;grid-template-columns:24px 1fr;gap:12px;align-items:flex-start;padding:17px;border:1px solid #dfe3e8;border-radius:17px;background:#f7f8fa;cursor:pointer}.pmsf-guard-accept[data-disabled=true]{opacity:.55;cursor:not-allowed}.pmsf-guard-accept input{width:20px;height:20px;margin:1px 0 0;accent-color:#17202a}.pmsf-guard-accept a{color:#5143e8;font-weight:850}
   .pmsf-guard-card footer{margin-top:16px;padding:16px;border-radius:18px;background:#f3ffcf;display:flex;align-items:center;justify-content:space-between;gap:20px}.pmsf-guard-card footer b,.pmsf-guard-card footer small{display:block}.pmsf-guard-card footer small{margin-top:3px;color:#566047}.pmsf-guard-card footer button,.pmsf-guard-blocked button{border:0;border-radius:13px;background:#17202a;color:#fff;text-decoration:none;padding:12px 16px;font-weight:900;cursor:pointer;white-space:nowrap}.pmsf-guard-card footer button:disabled{opacity:.45;cursor:not-allowed}
   .pmsf-guard-blocked{margin:20px 0 0;padding:20px;border-radius:20px;background:#fff2ef;border:1px solid #ffd1c8}.pmsf-guard-blocked>b{font-size:20px}.pmsf-guard-blocked p{line-height:1.55;color:#694c45}.pmsf-guard-blocked button{margin-top:4px;background:#eceff3;color:#242933}.pmsf-guard-error{padding:10px 12px;border-radius:12px;background:#ffe9e5;color:#8b2c20;font-weight:800}
   @media(max-width:700px){.pmsf-guard-backdrop{padding:0;align-items:end}.pmsf-guard-card{border-radius:25px 25px 0 0;padding:24px 17px 22px}.pmsf-guard-card h2{font-size:27px}.pmsf-guard-age{grid-template-columns:1fr}.pmsf-age-actions{width:100%}.pmsf-age-actions button{flex:1}.pmsf-guard-card footer{align-items:stretch;flex-direction:column}.pmsf-guard-card footer button{width:100%}}
  `}</style>
 </div>
}
