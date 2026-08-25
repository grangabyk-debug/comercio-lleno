'use client'

import {useEffect,useMemo,useState,type CSSProperties} from 'react'
import {cvTemplates,freeTemplateCount,proTemplateCount,type CvTemplate} from './templates'
import {downloadPdfTemplate,downloadWordTemplate} from './templateEngine'

const CV_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/cv-ai'
const SESSION_KEY='cv_ai_session_token_v1'
type Filter='all'|'free'|'pro'

const featured=new Set(['pm-ejecutivo','pm-comercial','pm-premium-black','pm-hotel'])
const newOnes=new Set(['pm-pastel','pm-naranja','pm-producto','pm-remoto'])

function MiniResume({t}:{t:CvTemplate}){
 const style={'--accent':t.accent,'--soft':t.soft,'--ink':t.ink} as CSSProperties
 return <div className={`pmt-scene pmt-layout-${t.layout} pmt-template-${t.id}`} data-scene={t.scene} data-template={t.id} style={style}>
  <span className={`pmt-badge ${t.tier==='pro'?'pro':''}`}>{t.tier==='free'?'GRATIS':'CV PRO+'}</span>
  {featured.has(t.id)&&<span className="pmt-ribbon">Más elegido</span>}
  {newOnes.has(t.id)&&<span className="pmt-ribbon pmt-ribbon-new">Nuevo</span>}
  <div className="pmt-paper">
   <div className="pmt-paper-head">
    {t.photo&&<div className="pmt-photo"><span>VP</span></div>}
    <div className="pmt-head-copy"><div className="pmt-paper-name">Valentina Pérez</div><div className="pmt-paper-role">Analista Comercial</div><div className="pmt-paper-contact">Buenos Aires · valentina@email.com</div></div>
   </div>
   <div className="pmt-resume-body">
    <aside className="pmt-resume-side">
     <b>HABILIDADES</b><span>Atención al cliente</span><span>Ventas</span><span>Excel</span><span>Organización</span>
     <b>IDIOMAS</b><span>Español · Nativo</span><span>Inglés · Intermedio</span>
    </aside>
    <main className="pmt-resume-main">
     <section><b>PERFIL</b><p>Perfil orientado a resultados, atención al cliente y mejora de procesos.</p></section>
     <section><b>EXPERIENCIA</b><h4>Analista Comercial</h4><small>Empresa Actual · 2023 — Actualidad</small><p>Seguimiento de cartera, coordinación interna y resolución de necesidades comerciales.</p><h4>Asistente de Ventas</h4><small>Compañía Anterior · 2021 — 2023</small></section>
     <section><b>FORMACIÓN</b><p>Tecnicatura / Carrera relacionada · Institución</p></section>
    </main>
   </div>
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
  <section className="pmt-hero pmt-hero-v3">
   <div><span className="pmt-kicker">30 DISEÑOS REALES · 6 GRATIS</span><h1>CVs que dan ganas de usar, no plantillas que parecen de hace diez años.</h1><p>Rediseñamos la biblioteca para que cada modelo tenga una identidad clara. Hay opciones ATS, ejecutivas, creativas, técnicas, comerciales y por rubro. Lo que ves en la vista previa corresponde al estilo del archivo que descargás.</p><div className="pmt-hero-actions"><a className="pmt-primary" href="#modelos">Elegir mi diseño</a><a className="pmt-secondary" href="/mejorar-cv">Mejorar mi CV con IA</a></div><div className="pmt-hero-pills"><span>✓ Word editable</span><span>✓ PDF de muestra</span><span>✓ Compatible con Mejorar CV</span><span>✓ Sin diseños genéricos repetidos</span></div></div>
   <div className="pmt-hero-stage" aria-hidden="true"><div className="pmt-stage-card one"><MiniResume t={cvTemplates[6]}/></div><div className="pmt-stage-card two"><MiniResume t={cvTemplates[21]}/></div><div className="pmt-stage-card three"><MiniResume t={cvTemplates[3]}/></div></div>
  </section>
  <section className="pmt-summary"><div><strong>30</strong><span>modelos distintos</span></div><div><strong>{freeTemplateCount}</strong><span>gratis para descargar ahora</span></div><div><strong>{proTemplateCount}</strong><span>diseños incluidos con CV Pro+</span></div></section>
  <section className="pmt-library-intro"><div><span>COLECCIÓN 2026</span><h2>Elegí por estilo, no por obligación.</h2></div><p>Los modelos más simples priorizan compatibilidad y lectura. Los Pro+ suman composición editorial, columnas, jerarquías visuales y estilos por rubro sin sacrificar claridad.</p></section>
  <section className="pmt-toolbar" id="modelos"><div className="pmt-tabs"><button data-active={filter==='all'} onClick={()=>setFilter('all')}>Todos · 30</button><button data-active={filter==='free'} onClick={()=>setFilter('free')}>Gratis · 6</button><button data-active={filter==='pro'} onClick={()=>setFilter('pro')}>CV Pro+ · 24</button></div><span className="pmt-plan-state">{checking?'Revisando tu acceso…':paid?'✓ CV Pro+ activo · todos desbloqueados':'6 gratis · 24 con CV Pro+'}</span></section>
  <section className="pmt-grid pmt-grid-v3">{visible.map(t=><article className={`pmt-card pmt-card-v3 ${featured.has(t.id)?'is-featured':''}`} key={t.id}><MiniResume t={t}/><div className="pmt-card-body"><div className="pmt-card-top"><h3>{t.name}</h3><span className="pmt-category">{t.category}</span></div><p>{t.description}</p><div className="pmt-formats"><span>Word editable</span><span>PDF muestra</span>{t.photo&&<span>Foto opcional</span>}</div><div className="pmt-actions">{t.tier==='pro'&&!paid?<a className="pmt-unlock" href="/mejorar-cv#planes">Desbloquear con CV Pro+</a>:<><button className="pmt-word" onClick={()=>word(t)}>Descargar Word</button><button className="pmt-pdf" onClick={()=>void pdf(t)}>PDF de muestra</button></>}</div></div></article>)}</section>
  <aside className="pmt-note"><strong>PM</strong><p><b>El diseño no se pierde cuando volvés a Mejorar CV.</b> Estas plantillas llevan una firma interna de Postulá Mejor. Si volvés a subir una, el sistema puede reconocer el modelo y priorizar conservar su estructura mientras mejora el contenido.</p></aside>
  {toast&&<div className="pmt-toast" role="status">{toast}</div>}
 </>
}
