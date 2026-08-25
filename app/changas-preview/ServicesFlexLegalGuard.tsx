'use client'

import {useEffect,useMemo,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type AnswerKey='adult'|'one_off'|'recurring'|'supervised'|'role_replacement'|'private_home'|'platform_transport'
type Answers=Record<AnswerKey,boolean|null>
const VERSION='services-flex-2026-08-25'
const EMPTY:Answers={adult:null,one_off:null,recurring:null,supervised:null,role_replacement:null,private_home:null,platform_transport:null}

const questions:{key:AnswerKey;title:string;help:string;yes:string;no:string}[]=[
 {key:'adult',title:'¿Sos mayor de 18 años?',help:'Para publicar o acordar un Servicio Flex exigimos mayoría de edad.',yes:'Sí',no:'No'},
 {key:'one_off',title:'¿Es una tarea concreta con principio y fin definidos?',help:'Servicios Flex está pensado para tareas u obras puntuales, no para cubrir puestos permanentes.',yes:'Sí, es puntual',no:'No / es indefinida'},
 {key:'recurring',title:'¿Se repetirá de forma habitual o indefinida con la misma persona?',help:'Por ejemplo: todos los días, todas las semanas o sin fecha de finalización.',yes:'Sí',no:'No'},
 {key:'supervised',title:'¿Habrá horario fijo permanente, órdenes continuas o supervisión como parte de un equipo?',help:'Estas señales pueden corresponder a una relación laboral y no a un servicio independiente.',yes:'Sí',no:'No'},
 {key:'role_replacement',title:'¿La publicación busca cubrir un puesto habitual de una empresa o negocio?',help:'Si reemplaza una vacante o un rol normal del equipo, corresponde publicarlo como Empleo.',yes:'Sí',no:'No'},
 {key:'private_home',title:'¿Es limpieza, mantenimiento, asistencia o cuidado dentro de una casa particular o ámbito familiar?',help:'Ese tipo de tareas puede estar alcanzado por el Régimen de Casas Particulares, aun por pocas horas.',yes:'Sí',no:'No'},
 {key:'platform_transport',title:'¿El servicio consiste principalmente en reparto de bienes o traslado de personas coordinado por la plataforma?',help:'Reparto y movilidad tienen un régimen específico para plataformas tecnológicas y no los habilitamos dentro de Servicios Flex por ahora.',yes:'Sí',no:'No'},
]

function localResult(a:Answers){
 if(a.adult===false)return'age_restricted'
 if(a.platform_transport===true)return'platform_transport'
 if(a.private_home===true)return'domestic'
 if(a.one_off===false||a.recurring===true||a.supervised===true||a.role_replacement===true)return'employment'
 return'allowed'
}

export default function ServicesFlexLegalGuard(){
 const[open,setOpen]=useState(false),[answers,setAnswers]=useState<Answers>(EMPTY),[busy,setBusy]=useState(false),[result,setResult]=useState(''),[error,setError]=useState('')
 const complete=useMemo(()=>Object.values(answers).every(v=>v!==null),[answers])

 useEffect(()=>{
  try{const cached=sessionStorage.getItem('pm_services_flex_legal_answers');if(cached)setAnswers({...EMPTY,...JSON.parse(cached)})}catch{}
  const launch=()=>{setResult('');setError('');setOpen(true)}
  const capture=(event:MouseEvent)=>{const target=event.target as Element|null;const trigger=target?.closest?.('#publicar-flex,[data-services-flex-publish]');if(!trigger)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();launch()}
  document.addEventListener('click',capture,true)
  const params=new URLSearchParams(location.search);if(params.get('clasificar')==='1'){params.delete('clasificar');const qs=params.toString();history.replaceState({},'',`${location.pathname}${qs?`?${qs}`:''}${location.hash}`);window.setTimeout(launch,0)}
  return()=>document.removeEventListener('click',capture,true)
 },[])

 async function confirm(){
  if(!complete||busy)return
  setBusy(true);setError('');const local=localResult(answers)
  try{
   sessionStorage.setItem('pm_services_flex_legal_answers',JSON.stringify(answers))
   const{data}=await cvAuthClient().auth.getSession()
   if(!data.session){setResult(local);if(local==='allowed'){setOpen(false);window.dispatchEvent(new CustomEvent('pm:flex-publish'))}return}
   const{data:record,error:rpcError}=await cvAuthClient().rpc('pm_record_flex_legal_check',{p_answers:answers,p_policy_version:VERSION})
   if(rpcError)throw rpcError
   const serverResult=String(record?.result||local);setResult(serverResult)
   if(serverResult==='allowed'){setOpen(false);window.dispatchEvent(new CustomEvent('pm:flex-publish'))}
  }catch(e){setError(e instanceof Error?e.message:'No pudimos validar el encuadre. Intentá nuevamente.')}finally{setBusy(false)}
 }

 if(!open)return null
 const blocked=result&&result!=='allowed'
 return <div className="pmsf-guard-backdrop" role="dialog" aria-modal="true" aria-labelledby="pmsf-guard-title" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
  <section className="pmsf-guard-card">
   <button type="button" className="pmsf-guard-close" onClick={()=>setOpen(false)} aria-label="Cerrar">×</button>
   <span className="pmsf-guard-kicker">ANTES DE PUBLICAR · SERVICIOS FLEX</span>
   <h2 id="pmsf-guard-title">Confirmemos que esta tarea corresponde a Servicios Flex.</h2>
   <p className="pmsf-guard-intro">El nombre de la sección no cambia la naturaleza jurídica de una relación. Estas preguntas ayudan a evitar que una búsqueda laboral o una actividad con régimen especial se publique en el lugar equivocado.</p>
   {!blocked?<div className="pmsf-guard-questions">{questions.map(q=><article key={q.key}><div><b>{q.title}</b><small>{q.help}</small></div><div><button type="button" data-on={answers[q.key]===true} onClick={()=>setAnswers(v=>({...v,[q.key]:true}))}>{q.yes}</button><button type="button" data-on={answers[q.key]===false} onClick={()=>setAnswers(v=>({...v,[q.key]:false}))}>{q.no}</button></div></article>)}</div>:<div className="pmsf-guard-blocked">
    {result==='employment'&&<><b>Esto parece corresponder a una búsqueda laboral.</b><p>Por las características indicadas —continuidad, dependencia, supervisión o cobertura de un puesto— no lo habilitamos como Servicio Flex. Publicalo desde Empresas para tratarlo como una búsqueda de empleo.</p><a href="/empresas">Ir a Empresas</a></>}
    {result==='domestic'&&<><b>Esta actividad puede estar alcanzada por el Régimen de Casas Particulares.</b><p>Las tareas de limpieza, mantenimiento, asistencia o cuidado dentro del ámbito familiar tienen un régimen específico y pueden requerir registración aunque sean por pocas horas. Por seguridad jurídica, no las habilitamos como Servicio Flex cuando encajan en ese supuesto.</p><a href="https://www.argentina.gob.ar/servicio/registrar-al-personal-de-casas-particulares" target="_blank" rel="noopener noreferrer">Ver información oficial</a></>}
    {result==='platform_transport'&&<><b>Reparto y movilidad no están habilitados en Servicios Flex.</b><p>Argentina tiene un régimen específico para plataformas tecnológicas de reparto y movilidad. Preferimos no ofrecer esa categoría hasta implementar sus requisitos de forma específica.</p></>}
    {result==='age_restricted'&&<><b>Servicios Flex está disponible sólo para mayores de 18 años.</b><p>No habilitamos publicación ni contratación de servicios puntuales para cuentas de menores dentro de esta sección.</p></>}
    <button type="button" onClick={()=>{setResult('');setAnswers(EMPTY)}}>Revisar respuestas</button>
   </div>}
   {!blocked&&<footer><div><b>El pago del servicio se acuerda entre las partes.</b><small>Postulá Mejor cobra únicamente por funciones o créditos de la plataforma. No recibe, custodia ni libera el dinero acordado por el servicio.</small></div><button type="button" disabled={!complete||busy} onClick={()=>void confirm()}>{busy?'Validando…':'Confirmar y continuar'}</button></footer>}
   {error&&<p className="pmsf-guard-error">{error}</p>}
   <p className="pmsf-guard-legal">Al continuar también deberás aceptar los <a href="/terminos/servicios-flex" target="_blank" rel="noopener noreferrer">Términos específicos de Servicios Flex</a>. Esta clasificación es preventiva y no sustituye las obligaciones legales que correspondan al caso real.</p>
  </section>
  <style jsx global>{`
   .pmsf-guard-backdrop{position:fixed;inset:0;z-index:12000;background:rgba(8,12,18,.72);backdrop-filter:blur(9px);display:grid;place-items:center;padding:22px;overflow:auto}
   .pmsf-guard-card{position:relative;width:min(860px,100%);max-height:min(900px,92vh);overflow:auto;background:#fff;border-radius:28px;padding:30px;box-shadow:0 35px 100px rgba(0,0,0,.32);color:#151822;font-family:Inter,system-ui,sans-serif}
   .pmsf-guard-close{position:absolute;right:18px;top:16px;width:40px;height:40px;border:0;border-radius:50%;background:#f0f2f5;font-size:25px;cursor:pointer}
   .pmsf-guard-kicker{font-size:11px;font-weight:950;letter-spacing:.13em;color:#5c49ff}.pmsf-guard-card h2{font-size:32px;line-height:1.03;letter-spacing:-.045em;margin:9px 50px 10px 0}.pmsf-guard-intro{font-size:14px;line-height:1.55;color:#59616d;max-width:760px}
   .pmsf-guard-questions{display:grid;gap:10px;margin-top:20px}.pmsf-guard-questions article{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:16px;padding:15px 16px;border:1px solid #e2e5e9;border-radius:17px;background:#fafbfc}.pmsf-guard-questions b{display:block;font-size:14px}.pmsf-guard-questions small{display:block;margin-top:4px;color:#69717c;line-height:1.4}.pmsf-guard-questions article>div:last-child{display:flex;gap:7px}.pmsf-guard-questions button{border:1px solid #ccd2da;background:#fff;border-radius:12px;padding:9px 12px;font-weight:850;cursor:pointer}.pmsf-guard-questions button[data-on=true]{background:#17202a;color:#fff;border-color:#17202a}
   .pmsf-guard-card footer{margin-top:18px;padding:17px;border-radius:18px;background:#f3ffcf;display:flex;align-items:center;justify-content:space-between;gap:20px}.pmsf-guard-card footer b,.pmsf-guard-card footer small{display:block}.pmsf-guard-card footer small{margin-top:3px;color:#566047}.pmsf-guard-card footer button,.pmsf-guard-blocked a,.pmsf-guard-blocked button{border:0;border-radius:13px;background:#17202a;color:#fff;text-decoration:none;padding:12px 16px;font-weight:900;cursor:pointer;white-space:nowrap}
   .pmsf-guard-blocked{margin:22px 0 10px;padding:22px;border-radius:20px;background:#fff2ef;border:1px solid #ffd1c8}.pmsf-guard-blocked>b{font-size:20px}.pmsf-guard-blocked p{line-height:1.55;color:#694c45}.pmsf-guard-blocked a,.pmsf-guard-blocked button{display:inline-block;margin:4px 8px 0 0}.pmsf-guard-blocked button{background:#eceff3;color:#242933}.pmsf-guard-error{padding:10px 12px;border-radius:12px;background:#ffe9e5;color:#8b2c20;font-weight:800}.pmsf-guard-legal{font-size:11px;line-height:1.5;color:#747b85;margin:15px 2px 0}.pmsf-guard-legal a{color:#5143e8;font-weight:850}
   @media(max-width:700px){.pmsf-guard-backdrop{padding:0;align-items:end}.pmsf-guard-card{max-height:94vh;border-radius:25px 25px 0 0;padding:24px 17px 22px}.pmsf-guard-card h2{font-size:27px}.pmsf-guard-questions article{grid-template-columns:1fr}.pmsf-guard-questions article>div:last-child{width:100%}.pmsf-guard-questions button{flex:1}.pmsf-guard-card footer{align-items:stretch;flex-direction:column}.pmsf-guard-card footer button{width:100%}}
  `}</style>
 </div>
}
