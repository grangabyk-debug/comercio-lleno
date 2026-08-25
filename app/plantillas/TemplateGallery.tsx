'use client'

import {useEffect,useMemo,useState,type CSSProperties} from 'react'
import {cvTemplates,freeTemplateCount,proTemplateCount,type CvTemplate} from './templates'
import {downloadPdfTemplate,downloadWordTemplate} from './templateEngine'

const CV_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/cv-ai'
const SESSION_KEY='cv_ai_session_token_v1'

type Filter='all'|'free'|'pro'

function MiniResume({t}:{t:CvTemplate}){
 const style={'--accent':t.accent,'--soft':t.soft} as CSSProperties
 return <div className={`pmt-scene pmt-layout-${t.layout}`} data-scene={t.scene} style={style}>
  <span className={`pmt-badge ${t.tier==='pro'?'pro':''}`}>{t.tier==='free'?'GRATIS':'CV PRO+'}</span>
  <div className="pmt-paper">
   <div className="pmt-paper-head"><div className="pmt-paper-name">Valentina Pérez</div><div className="pmt-paper-role">{t.category} · Perfil profesional</div></div>
   {t.photo&&<div className="pmt-photo"/>}
   <div className="pmt-line mid"/><div className="pmt-line short"/><div className="pmt-title"/>
   <div className="pmt-line"/><div className="pmt-line"/><div className="pmt-line mid"/><div className="pmt-title"/>
   <div className="pmt-line"/><div className="pmt-line mid"/><div className="pmt-line"/><div className="pmt-title"/>
   <div className="pmt-tags"><i/><i/><i/><i/></div>
  </div>
 </div>
}

export default function TemplateGallery(){
 const [filter,setFilter]=useState<Filter>('all')
 const [paid,setPaid]=useState(false)
 const [checking,setChecking]=useState(true)
 const [toast,setToast]=useState('')
 useEffect(()=>{let alive=true;(async()=>{try{const token=localStorage.getItem(SESSION_KEY)||'';if(!token)return;const r=await fetch(CV_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'status',token})});const d=await r.json().catch(()=>null);if(alive&&r.ok&&d?.ok)setPaid(d.session?.plan==='pro'||d.session?.plan==='active')}catch{}finally{if(alive)setChecking(false)}})();return()=>{alive=false}},[])
 const visible=useMemo(()=>cvTemplates.filter(t=>filter==='all'||t.tier===filter),[filter])
 function flash(text:string){setToast(text);window.setTimeout(()=>setToast(''),2100)}
 function word(t:CvTemplate){if(t.tier==='pro'&&!paid){flash('Esta plantilla se desbloquea con CV Pro+.');return}downloadWordTemplate(t);flash('Word editable descargado. Podés abrirlo y modificarlo.')}
 async function pdf(t:CvTemplate){if(t.tier==='pro'&&!paid){flash('Esta plantilla se desbloquea con CV Pro+.');return}await downloadPdfTemplate(t);flash('PDF de muestra descargado. Para editar, usá la versión Word.')}
 return <>
  <section className="pmt-hero">
   <div><span className="pmt-kicker">PLANTILLAS CV · POSTULÁ MEJOR</span><h1>Un buen CV también tiene que verse como vos.</h1><p>Treinta diseños originales, desde modelos ATS simples hasta currículums más visuales para perfiles comerciales, creativos, técnicos y de liderazgo. Descargalos, editá el Word por tu cuenta y después podés volver a subirlo a Mejorar CV.</p><div className="pmt-hero-actions"><a className="pmt-primary" href="#modelos">Ver los 30 modelos</a><a className="pmt-secondary" href="/mejorar-cv">Mejorar mi CV con IA</a></div></div>
   <div className="pmt-hero-stack" aria-hidden="true"><div className="pmt-hero-sheet"><i/><b>Base ATS</b><span/><span/><span/><span/></div><div className="pmt-hero-sheet"><i/><b>Comercial</b><span/><span/><span/><span/></div><div className="pmt-hero-sheet"><i/><b>Ejecutivo</b><span/><span/><span/><span/></div></div>
  </section>
  <section className="pmt-summary"><div><strong>30</strong><span>modelos disponibles</span></div><div><strong>{freeTemplateCount}</strong><span>plantillas gratuitas para descargar ahora</span></div><div><strong>{proTemplateCount}</strong><span>diseños incluidos con CV Pro+</span></div></section>
  <section className="pmt-toolbar" id="modelos"><div className="pmt-tabs"><button data-active={filter==='all'} onClick={()=>setFilter('all')}>Todos · 30</button><button data-active={filter==='free'} onClick={()=>setFilter('free')}>Gratis · 6</button><button data-active={filter==='pro'} onClick={()=>setFilter('pro')}>CV Pro+ · 24</button></div><span className="pmt-plan-state">{checking?'Revisando tu acceso…':paid?'✓ CV Pro+ activo · todos desbloqueados':'6 gratis · 24 con CV Pro+'}</span></section>
  <section className="pmt-grid">{visible.map(t=><article className="pmt-card" key={t.id}><MiniResume t={t}/><div className="pmt-card-body"><div className="pmt-card-top"><h3>{t.name}</h3><span className="pmt-category">{t.category}</span></div><p>{t.description}</p><div className="pmt-formats"><span>Word editable</span><span>PDF muestra</span>{t.photo&&<span>Con foto</span>}</div><div className="pmt-actions">{t.tier==='pro'&&!paid?<a className="pmt-unlock" href="/mejorar-cv#planes">Desbloquear con CV Pro+</a>:<><button className="pmt-word" onClick={()=>word(t)}>Descargar Word</button><button className="pmt-pdf" onClick={()=>void pdf(t)}>PDF de muestra</button></>}</div></div></article>)}</section>
  <aside className="pmt-note"><strong>PM</strong><p><b>Estas plantillas llevan una firma interna de Postulá Mejor.</b> Si después las volvés a subir al analizador, el sistema puede reconocer el modelo y priorizar conservar su diseño mientras adapta el contenido.</p></aside>
  {toast&&<div className="pmt-toast" role="status">{toast}</div>}
 </>
}
