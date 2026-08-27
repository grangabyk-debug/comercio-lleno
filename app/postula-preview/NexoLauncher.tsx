'use client'

import Link from 'next/link'
import {FormEvent,useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type Gate='idle'|'loading'|'unauthenticated'|'needs_company'|'locked'|'allowed'
type Msg={role:'ai'|'user';text:string}

export default function NexoLauncher(){
 const [open,setOpen]=useState(false),[gate,setGate]=useState<Gate>('idle'),[company,setCompany]=useState<{id:string;name:string}|null>(null),[job,setJob]=useState<{id:string;title:string}|null>(null),[text,setText]=useState(''),[busy,setBusy]=useState(false),[messages,setMessages]=useState<Msg[]>([])
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[open])
 async function launch(){
  if(typeof window!=='undefined'&&window.matchMedia('(max-width: 760px)').matches){location.assign('/empresas/movil');return}
  setOpen(true);setGate('loading')
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
   setMessages([{role:'ai',text:`Hola, soy Nexo. Estoy conectado a la cuenta de ${co.name}. Puedo revisar tus búsquedas, candidatos, etapas, disponibilidad, equipo y datos operativos de selección.`}]);setGate('allowed')
  }catch{setGate('locked')}
 }
 async function ask(value:string){const q=value.trim();if(!q||busy||gate!=='allowed')return;setMessages(m=>[...m,{role:'user',text:q}]);setText('');setBusy(true);try{const {data}=await cvAuthClient().auth.getSession();const token=data.session?.access_token;if(!token)throw new Error();const r=await fetch('/api/postula/employer-assistant',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({message:q,company_id:company?.id||''})});const d=await r.json().catch(()=>({}));if(r.status===402&&d?.code==='nexo_plan_required'){setGate('locked');return}setMessages(m=>[...m,{role:'ai',text:String(d?.answer||d?.error||'No pude responder ahora.')}])}catch{setMessages(m=>[...m,{role:'ai',text:'No pude conectarme ahora. Probá nuevamente en unos segundos.'}])}finally{setBusy(false)}}
 function submit(e:FormEvent){e.preventDefault();void ask(text)}
 return <>
  <button type="button" className="pm-nexo-launcher" onClick={()=>void launch()} aria-haspopup="dialog"><span>Nexo</span><small>PREMIUM</small></button>
  {open&&<div className="pm-nexo-desktop-backdrop" role="presentation" onMouseDown={e=>{if(e.currentTarget===e.target)setOpen(false)}}><section className="pm-nexo-desktop-modal" role="dialog" aria-modal="true" aria-label="Nexo versión PC">
   <header className="pm-nexo-desktop-head"><div><span>NX</span><div><b>Nexo</b><small>ASISTENTE DE SELECCIÓN · FUNCIÓN PREMIUM</small></div></div><button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar Nexo">×</button></header>
   {gate==='loading'&&<div className="pm-nexo-desktop-state"><b>Preparando Nexo…</b><p>Verificando tu cuenta, empresa y plan activo.</p></div>}
   {gate==='unauthenticated'&&<div className="pm-nexo-desktop-state"><b>Ingresá para usar Nexo.</b><p>Nexo trabaja con la información privada de tu empresa, por eso primero necesitamos identificar tu cuenta.</p><Link href="/empresas/login">Ingresar a mi empresa</Link></div>}
   {gate==='needs_company'&&<div className="pm-nexo-desktop-state"><b>Primero completá tu empresa.</b><p>Cuando la empresa esté asociada a tu cuenta, Nexo puede trabajar con sus búsquedas y candidatos.</p><Link href="/empresas/registro">Completar empresa</Link></div>}
   {gate==='locked'&&<div className="pm-nexo-desktop-state"><span className="pm-nexo-premium">FUNCIÓN PREMIUM</span><b>Nexo se habilita desde Selección IA.</b><p>Está incluido en Selección IA, Escala y Empresa. El plan Gratis e Impulso no habilitan el agente ni la versión móvil resumida.</p><Link href="/empresas#planes">Ver planes y habilitar Nexo</Link></div>}
   {gate==='allowed'&&<><div className="pm-nexo-desktop-context"><span>EMPRESA ACTIVA</span><b>{company?.name}</b><small>{job?`Última búsqueda activa: ${job.title}. Nexo puede consultar toda la cuenta.`:'Podés preguntarme por toda tu cuenta de selección.'}</small></div><div className="pm-nexo-desktop-chat">{messages.map((m,i)=><div key={i} className={`pm-nexo-dmsg ${m.role}`}>{m.text}</div>)}{busy&&<div className="pm-nexo-dmsg ai thinking">Nexo está revisando tu cuenta…</div>}</div><div className="pm-nexo-desktop-quick"><button onClick={()=>void ask('Dame un resumen de todas mis postulaciones')}>Resumen</button><button onClick={()=>void ask('¿Quién tiene mejor disponibilidad?')}>Disponibilidad</button><button onClick={()=>void ask('¿Qué búsquedas tengo activas?')}>Búsquedas</button></div><form className="pm-nexo-desktop-compose" onSubmit={submit}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Preguntale algo a Nexo…" maxLength={1200}/><button type="submit" disabled={busy||!text.trim()}>Enviar</button></form></>}
   <footer className="pm-nexo-desktop-foot"><span>La interfaz móvil resumida también requiere un plan con Nexo.</span><Link href="/empresas/movil">Abrir Nexo móvil</Link></footer>
  </section></div>}
 </>
}
