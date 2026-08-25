'use client'

import {useEffect,useMemo,useState,type CSSProperties} from 'react'
import {cvTemplates,freeTemplateCount,proTemplateCount,type CvTemplate} from './templates'
import {downloadPdfTemplate,downloadWordTemplate} from './templateEngineV4'

const CV_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/cv-ai'
const SESSION_KEY='cv_ai_session_token_v1'
type Filter='all'|'free'|'pro'
const featured=new Set(['pm-ejecutivo','pm-comercial','pm-premium-black','pm-hotel'])
const newOnes=new Set(['pm-pastel','pm-naranja','pm-producto','pm-remoto'])
const totalTemplates=cvTemplates.length

function MiniResume({t,accent}:{t:CvTemplate;accent?:string}){
 const actual=accent||t.accent
 const style={'--accent':actual,'--soft':t.soft,'--ink':t.ink} as CSSProperties
 return <div className={`pmt-scene pmt-layout-${t.layout} pmt-template-${t.id}`} data-scene={t.scene} data-design={t.design} style={style}>
  <span className={`pmt-badge ${t.tier==='pro'?'pro':''}`}>{t.tier==='free'?'GRATIS':'CV PRO+'}</span>
  {featured.has(t.id)&&<span className="pmt-ribbon">Más elegido</span>}
  {newOnes.has(t.id)&&<span className="pmt-ribbon pmt-ribbon-new">Nuevo</span>}
  <div className="pmt-paper">
   <div className="pmt-paper-head">
    {t.photo&&<div className="pmt-photo"><span>VP</span></div>}
    <div className="pmt-head-copy"><div className="pmt-paper-name">Valentina Pérez</div><div className="pmt-paper-role">Analista Comercial</div><div className="pmt-paper-contact">Buenos Aires · valentina@email.com</div></div>
   </div>
   <div className="pmt-kpi-row"><span><b>18%</b><small>crecimiento</small></span><span><b>42</b><small>clientes</small></span><span><b>4.8</b><small>score</small></span></div>
   <div className="pmt-resume-body">
    <aside className="pmt-resume-side">
     <b>HABILIDADES</b><span>Atención al cliente</span><span>Ventas</span><span>Excel</span><span>Organización</span>
     <div className="pmt-skill-bars"><i/><i/><i/></div>
     <b>IDIOMAS</b><span>Español · Nativo</span><span>Inglés · Intermedio</span>
    </aside>
    <main className="pmt-resume-main">
     <section className="pmt-profile"><b>PERFIL</b><p>Perfil orientado a resultados, atención al cliente y mejora de procesos.</p></section>
     <section className="pmt-exp"><b>EXPERIENCIA</b><div className="pmt-job"><i/><div><h4>Analista Comercial</h4><small>Empresa Actual · 2023 — Actualidad</small><p>Seguimiento de cartera, coordinación interna y resolución de necesidades comerciales.</p></div></div><div className="pmt-job"><i/><div><h4>Asistente de Ventas</h4><small>Compañía Anterior · 2021 — 2023</small></div></div></section>
     <section className="pmt-education"><b>FORMACIÓN</b><p>Tecnicatura / Carrera relacionada · Institución</p></section>
     <section className="pmt-projects"><b>PROYECTOS</b><div className="pmt-mini-cards"><span>CRM</span><span>Ventas</span><span>Reportes</span></div></section>
     <section className="pmt-chart"><b>FORTALEZAS</b><div><i/><i/><i/><i/></div></section>
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
 const [colors,setColors]=useState<Record<string,string>>({})
 useEffect(()=>{let alive=true;(async()=>{try{const token=localStorage.getItem(SESSION_KEY)||'';if(!token)return;const r=await fetch(CV_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'status',token})});const d=await r.json().catch(()=>null);if(alive&&r.ok&&d?.ok)setPaid(d.session?.plan==='pro'||d.session?.plan==='active')}catch{}finally{if(alive)setChecking(false)}})();return()=>{alive=false}},[])
 const visible=useMemo(()=>cvTemplates.filter(t=>filter==='all'||t.tier===filter),[filter])
 const heroA=cvTemplates.find(t=>t.id==='pm-premium-black')||cvTemplates[0]
 const heroB=cvTemplates.find(t=>t.id==='pm-tech')||cvTemplates[1]
 const heroC=cvTemplates.find(t=>t.id==='pm-hotel')||cvTemplates[2]
 const styled=(t:CvTemplate)=>colors[t.id]?{...t,accent:colors[t.id]}:t
 function flash(text:string){setToast(text);window.setTimeout(()=>setToast(''),2100)}
 function word(t:CvTemplate){const x=styled(t);if(x.tier==='pro'&&!paid){flash('Esta plantilla se desbloquea con CV Pro+.');return}downloadWordTemplate(x);flash('Word editable descargado. Podés abrirlo y modificarlo.')}
 async function pdf(t:CvTemplate){const x=styled(t);if(x.tier==='pro'&&!paid){flash('Esta plantilla se desbloquea con CV Pro+.');return}await downloadPdfTemplate(x);flash('PDF de muestra descargado. Para editar, usá la versión Word.')}
 return <>
  <section className="pmt-hero pmt-hero-v3">
   <div><span className="pmt-kicker">{totalTemplates} MODELOS · {freeTemplateCount} GRATIS</span><h1>Distintos de verdad. No el mismo CV pintado de otro color.</h1><p>Los gratuitos son simples y prácticos. Los CV Pro+ cambian estructura, jerarquía y recursos visuales: métricas, timelines, módulos, barras, paneles y composiciones por rubro. Algunos modelos además permiten elegir color sin convertir esa variante en una plantilla nueva.</p><div className="pmt-hero-actions"><a className="pmt-primary" href="#modelos">Ver los modelos</a><a className="pmt-secondary" href="/mejorar-cv">Mejorar mi CV con IA</a></div><div className="pmt-hero-pills"><span>✓ Word editable</span><span>✓ PDF de muestra</span><span>✓ Diseño reconocible por Mejorar CV</span><span>✓ Variantes de color en modelos seleccionados</span></div></div>
   <div className="pmt-hero-stage" aria-hidden="true"><div className="pmt-stage-card one"><MiniResume t={heroA}/></div><div className="pmt-stage-card two"><MiniResume t={heroB}/></div><div className="pmt-stage-card three"><MiniResume t={heroC}/></div></div>
  </section>
  <section className="pmt-summary"><div><strong>{totalTemplates}</strong><span>estructuras visuales identificables</span></div><div><strong>{freeTemplateCount}</strong><span>gratis y deliberadamente simples</span></div><div><strong>{proTemplateCount}</strong><span>Pro+ con recursos más avanzados</span></div></section>
  <section className="pmt-library-intro"><div><span>COLECCIÓN 2026</span><h2>Elegí una estructura. Después, si el modelo lo permite, elegí color.</h2></div><p>Un cambio de color no cuenta como un CV nuevo. Cada tarjeta representa una composición diferente; los pequeños círculos de color aparecen sólo en los modelos que tienen variantes.</p></section>
  <section className="pmt-toolbar" id="modelos"><div className="pmt-tabs"><button data-active={filter==='all'} onClick={()=>setFilter('all')}>Todos · {totalTemplates}</button><button data-active={filter==='free'} onClick={()=>setFilter('free')}>Gratis · {freeTemplateCount}</button><button data-active={filter==='pro'} onClick={()=>setFilter('pro')}>CV Pro+ · {proTemplateCount}</button></div><span className="pmt-plan-state">{checking?'Revisando tu acceso…':paid?'✓ CV Pro+ activo · todos desbloqueados':`${freeTemplateCount} gratis · ${proTemplateCount} con CV Pro+`}</span></section>
  <section className="pmt-grid pmt-grid-v3">{visible.map(t=>{const accent=colors[t.id]||t.accent;return <article className={`pmt-card pmt-card-v3 ${featured.has(t.id)?'is-featured':''}`} key={t.id}><MiniResume t={t} accent={accent}/><div className="pmt-card-body"><div className="pmt-card-top"><h3>{t.name}</h3><span className="pmt-category">{t.category}</span></div><p>{t.description}</p>{t.palette&&<div className="pmt-palette"><b>Color</b>{t.palette.map(c=><button key={c} type="button" aria-label={`Usar color ${c}`} data-active={accent===c} style={{background:c}} onClick={()=>setColors(v=>({...v,[t.id]:c}))}/>)}</div>}<div className="pmt-formats"><span>Word editable</span><span>PDF muestra</span>{t.photo&&<span>Foto opcional</span>}</div><div className="pmt-actions">{t.tier==='pro'&&!paid?<a className="pmt-unlock" href="/mejorar-cv#planes">Desbloquear con CV Pro+</a>:<><button className="pmt-word" onClick={()=>word(t)}>Descargar Word</button><button className="pmt-pdf" onClick={()=>void pdf(t)}>PDF de muestra</button></>}</div></div></article>})}</section>
  <aside className="pmt-note"><strong>PM</strong><p><b>Cada modelo conserva su identidad.</b> Si descargás una plantilla de Postulá Mejor y después la volvés a subir a Mejorar CV, el sistema puede reconocerla y priorizar conservar esa estructura mientras trabaja sobre el contenido.</p></aside>
  {toast&&<div className="pmt-toast" role="status">{toast}</div>}
 </>
}
