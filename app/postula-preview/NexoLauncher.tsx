'use client'

import Link from 'next/link'
import {FormEvent,useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type Gate='idle'|'loading'|'unauthenticated'|'needs_company'|'locked'|'allowed'
type Msg={role:'ai'|'user';text:string;delivery?:{destination:string;recipient:string;count:number;status:string}}
const NEXO_STYLE_HINT='Respondé de forma breve y directa, idealmente en 2 a 5 líneas. No muestres estados internos de la postulación (submitted, viewed, shortlist, interview, hired, rejected, withdrawn) salvo que el usuario los pida expresamente. No repitas datos ni expliques el criterio salvo que te lo pidan.'
function compactNexoAnswer(value:string){
 return value
  .replace(/\s*\(estado:\s*[^)]+\)/gi,'')
  .replace(/\s*\(status:\s*[^)]+\)/gi,'')
  .replace(/\s*[·,;-]?\s*estado:\s*(submitted|viewed|shortlist|interview|hired|rejected|withdrawn)\b[.,;]?/gi,'')
  .replace(/\s*[·,;-]?\s*(submitted|viewed|shortlist|interview|hired|rejected|withdrawn)\b(?=\s*[·,.;]|$)/gi,'')
  .replace(/Puesto:\s*/gi,'')
  .replace(/Match orientativo:\s*(\d+(?:[.,]\d+)?)\s*%?/gi,'$1% de ajuste')
  .replace(/Match:\s*(\d+(?:[.,]\d+)?)\s*%?/gi,'$1% de ajuste')
  .replace(/,\s*,/g,',')
  .replace(/\s+\./g,'.')
  .replace(/[ \t]{2,}/g,' ')
  .trim()
}

export default function NexoLauncher(){
 const [open,setOpen]=useState(false),[gate,setGate]=useState<Gate>('idle'),[company,setCompany]=useState<{id:string;name:string}|null>(null),[job,setJob]=useState<{id:string;title:string}|null>(null),[text,setText]=useState(''),[busy,setBusy]=useState(false),[messages,setMessages]=useState<Msg[]>([]),[contextIds,setContextIds]=useState<string[]>([])
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[open])
 useEffect(()=>{const scrollPlans=()=>{if(location.hash!=='#planes')return;window.setTimeout(()=>document.querySelector('[data-plan="seleccion"]')?.scrollIntoView({behavior:'smooth',block:'center'}),80)};scrollPlans();window.addEventListener('hashchange',scrollPlans);return()=>window.removeEventListener('hashchange',scrollPlans)},[])
 async function launch(){
  if(typeof window!=='undefined'&&window.matchMedia('(max-width: 760px)').matches){location.assign('/empresas/movil');return}
  setOpen(true);setGate('loading');setContextIds([])
  const {data}=await cvAuthClient().auth.getSession();const session=data.session
  if(!session){setGate('unauthenticated');return}
  try{
   const headers={Authorization:`Bearer ${session.access_token}`}
   const cr=await fetch('/api/postula/company',{headers,cache:'no-store'});const cd=await cr.json().catch(()=>({}));const membership=cd?.memberships?.[0]
   if(!membership?.company_id||!membership?.pm_companies){setGate('needs_company');return}
   const co={id:String(membership.company_id),name:String(membership.pm_companies.name||'Tu empresa')};setCompany(co)
   const sr=await fetch(`/api/postula/billing/status?company=${encodeURIComponent(co.id)}`,{headers,cache:'no-store'});const sd=await sr.json().catch(()=>({}))
   if(!sd?.nexo_enabled){setGate('locked');return}
   const jr=await fetch(`/api/postula/company/jobs?company=${encodeURIComponent(co.id)}`,{headers,cache:'no-store'});const jd=await jr.json().catch(()=>({}));const first=(jd?.jobs||[]).find((x:any)=>x.status==='published')||(jd?.jobs||[])[0]
   if(first)setJob({id:String(first.id),title:String(first.title)})
   setMessages([{role:'ai',text:`Hola, soy Nexo. Estoy conectado a la cuenta de ${co.name}. Podés preguntarme por postulantes, CV, búsquedas, métricas, equipo y plan; también puedo preparar shortlists y derivarlas a RR. HH.`}]);setGate('allowed')
  }catch{setGate('locked')}
 }
 async function ask(value:string){
  const q=value.trim();if(!q||busy||gate!=='allowed')return
  setMessages(m=>[...m,{role:'user',text:q}]);setText('');setBusy(true)
  try{
   const {data}=await cvAuthClient().auth.getSession();const token=data.session?.access_token;if(!token)throw new Error()
   const r=await fetch('/api/postula/employer-assistant',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({message:`${q}\n\n${NEXO_STYLE_HINT}`,company_id:company?.id||'',context_candidate_ids:contextIds})})
   const d=await r.json().catch(()=>({}))
   if(r.status===402&&d?.code==='nexo_plan_required'){setGate('locked');return}
   if(Array.isArray(d?.selected_candidate_ids))setContextIds(d.selected_candidate_ids.map(String).slice(0,50))
   const answer=compactNexoAnswer(String(d?.answer||d?.error||'No pude responder ahora.'))
   setMessages(m=>[...m,{role:'ai',text:answer,delivery:d?.delivery}])
  }catch{setMessages(m=>[...m,{role:'ai',text:'No pude conectarme ahora. Probá nuevamente en unos segundos.'}])}finally{setBusy(false)}
 }
 function submit(e:FormEvent){e.preventDefault();void ask(text)}
 return <>
  <button type="button" className="pm-nexo-launcher" onClick={()=>void launch()} aria-haspopup="dialog"><span>Nexo</span><small>PREMIUM</small></button>
  {open&&<div className="pm-nexo-desktop-backdrop" role="presentation" onMouseDown={e=>{if(e.currentTarget===e.target)setOpen(false)}}><section className="pm-nexo-desktop-modal" role="dialog" aria-modal="true" aria-label="Nexo versión PC">
   <header className="pm-nexo-desktop-head"><div><span>NX</span><div><b>Nexo</b><small>ASISTENTE AGÉNTICO DE SELECCIÓN</small></div></div><button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar Nexo">×</button></header>
   {gate==='loading'&&<div className="pm-nexo-desktop-state"><b>Preparando Nexo…</b><p>Verificando tu cuenta, empresa y plan activo.</p></div>}
   {gate==='unauthenticated'&&<div className="pm-nexo-desktop-state"><b>Ingresá para usar Nexo.</b><p>Nexo trabaja con la información privada de tu empresa, por eso primero necesitamos identificar tu cuenta.</p><Link href="/empresas/login">Ingresar a mi empresa</Link></div>}
   {gate==='needs_company'&&<div className="pm-nexo-desktop-state"><b>Primero completá tu empresa.</b><p>Cuando la empresa esté asociada a tu cuenta, Nexo puede trabajar con sus búsquedas y candidatos.</p><Link href="/empresas/registro?plan=seleccion">Completar empresa</Link></div>}
   {gate==='locked'&&<div className="pm-nexo-desktop-state"><span className="pm-nexo-premium">30 DÍAS GRATIS</span><b>Nexo se habilita con Selección IA.</b><p>Activándolo hoy pagás $0 durante 30 días. Después cuesta $34.900 por mes; si no continuás, volvés a Gratis automáticamente.</p><Link href="/empresas#planes">Activar Selección IA</Link></div>}
   {gate==='allowed'&&<><div className="pm-nexo-desktop-context"><span>EMPRESA ACTIVA</span><b>{company?.name}</b><small>{job?`Última búsqueda activa: ${job.title}. Nexo puede consultar toda la cuenta.`:'Podés preguntarme por toda tu cuenta de selección.'}</small></div><div className="pm-nexo-desktop-chat">{messages.map((m,i)=><div key={i} className={`pm-nexo-dmsg ${m.role}`}>{m.text}{m.delivery&&<small>Derivación creada: {m.delivery.count} postulaciones · {m.delivery.recipient}</small>}</div>)}{busy&&<div className="pm-nexo-dmsg ai thinking">Nexo está revisando tu cuenta…</div>}</div><div className="pm-nexo-desktop-quick"><button onClick={()=>void ask('¿Cuántas postulaciones recibí?')}>Cantidad</button><button onClick={()=>void ask('Buscá los 20 mejores candidatos alineados a mis búsquedas')}>Top 20</button><button onClick={()=>void ask('Enviá esos candidatos a Recursos Humanos')}>Enviar a RR. HH.</button></div><form className="pm-nexo-desktop-compose" onSubmit={submit}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Preguntá o dale una orden a Nexo…" maxLength={1600}/><button type="submit" disabled={busy||!text.trim()}>Enviar</button></form></>}
   <footer className="pm-nexo-desktop-foot"><span>Nexo conserva el contexto de la selección dentro de esta conversación.</span><Link href="/empresas/movil">Abrir Nexo móvil</Link></footer>
  </section></div>}
 </>
}
