'use client'

import {useEffect,useMemo,useState} from 'react'
import styles from './templates.module.css'
import {DESIRED_TEMPLATE_KEY,POSTULA_TEMPLATES,SOURCE_TEMPLATE_KEY,getPostulaTemplate,type PostulaTemplate} from '../cv-ia/postulaTemplates'

function esc(v:string){return v.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[m]||m))}

const sample={name:'TU NOMBRE Y APELLIDO',headline:'Puesto o perfil profesional',contact:'tu@email.com · 11 0000 0000 · Ciudad, Provincia',summary:'Escribí acá un resumen breve de tu perfil, experiencia y el tipo de oportunidad que estás buscando.',role:'Puesto / Rol',company:'Empresa o proyecto',dates:'Mes AAAA — Mes AAAA',bullet:'Responsabilidad, tarea o logro concreto que quieras destacar.',degree:'Título, curso o formación',school:'Institución · Año',skills:'Habilidad 1 · Habilidad 2 · Habilidad 3 · Habilidad 4'}

function docCss(t:PostulaTemplate){
 const a=t.accent
 const base=`@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#17191d;margin:0;background:#fff}.cv{width:100%;min-height:960px}h1{margin:0;font-size:30px;line-height:1}h2{font-size:11px;text-transform:uppercase;letter-spacing:.12em;margin:22px 0 8px}h3{font-size:12px;margin:12px 0 2px}p,li{font-size:10.5px;line-height:1.5}small{font-size:9px}.muted{color:#68707a}.accent{color:${a}}`
 if(t.id==='pm01')return base+`.head{border-bottom:5px solid ${a};padding:0 0 20px}.contact{margin:8px 0}.section{max-width:690px}.skills{padding:10px 12px;background:#f4f3ff;border-left:4px solid ${a}}`
 if(t.id==='pm02')return base+`.cv{display:grid;grid-template-columns:180px 1fr}.side{background:#eef7f3;padding:28px 18px;border-top:10px solid ${a}}.main{padding:30px}.side h2{color:${a};border-bottom:1px solid #bad8cd;padding-bottom:5px}.main h2{border-bottom:2px solid ${a};padding-bottom:5px}`
 return base+`.head{padding-bottom:16px;border-bottom:2px solid #16191d}.meta{display:flex;gap:14px;margin-top:8px}.section h2{border-bottom:1px solid #222;padding-bottom:5px}.skills{font-weight:700}`
}

function editableDoc(t:PostulaTemplate){
 const e=(v:string)=>esc(v)
 const common=`<!-- POSTULAMEJOR_TEMPLATE:${t.id} --><meta name="postulamejor-template" content="${t.id}"><h2>Perfil profesional</h2><p>${e(sample.summary)}</p><h2>Experiencia</h2><h3>${e(sample.role)} · ${e(sample.company)}</h3><small class="muted">${e(sample.dates)}</small><ul><li>${e(sample.bullet)}</li><li>${e(sample.bullet)}</li></ul><h2>Formación</h2><h3>${e(sample.degree)}</h3><p class="muted">${e(sample.school)}</p>`
 let body=''
 if(t.id==='pm02')body=`<div class="cv"><aside class="side"><h2>Contacto</h2><p>${e(sample.contact)}</p><h2>Habilidades</h2><p>${e(sample.skills)}</p></aside><main class="main"><h1>${e(sample.name)}</h1><p class="accent"><b>${e(sample.headline)}</b></p>${common}</main></div>`
 else body=`<div class="cv"><header class="head"><h1>${e(sample.name)}</h1><p class="accent"><b>${e(sample.headline)}</b></p><p class="contact muted">${e(sample.contact)}</p></header><div class="section">${common}<h2>Habilidades</h2><p class="skills">${e(sample.skills)}</p></div></div>`
 return `<!doctype html><html><head><meta charset="utf-8"><title>Plantilla ${esc(t.name)} · Postulá Mejor</title><style>${docCss(t)}</style></head><body>${body}</body></html>`
}

function downloadFree(t:PostulaTemplate){
 const html=editableDoc(t),blob=new Blob([html],{type:'application/msword;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a')
 a.href=url;a.download=`PostulaMejor-CV-${t.id.toUpperCase()}-${t.name.replace(/\s+/g,'-')}.doc`;a.click();URL.revokeObjectURL(url)
 localStorage.setItem(SOURCE_TEMPLATE_KEY,t.id)
}

export default function TemplatesGallery(){
 const [selected,setSelected]=useState('')
 const current=useMemo(()=>selected?getPostulaTemplate(selected)||null:null,[selected])

 useEffect(()=>{
   if(!current)return
   const previousOverflow=document.body.style.overflow
   document.body.style.overflow='hidden'
   const onKeyDown=(event:KeyboardEvent)=>{if(event.key==='Escape')setSelected('')}
   window.addEventListener('keydown',onKeyDown)
   return()=>{
     window.removeEventListener('keydown',onKeyDown)
     document.body.style.overflow=previousOverflow
   }
 },[current])

 function closePreview(){setSelected('')}
 function choosePro(t:PostulaTemplate){localStorage.setItem(DESIRED_TEMPLATE_KEY,t.id);localStorage.setItem(SOURCE_TEMPLATE_KEY,t.id);location.href='/#planes'}
 return <>
  <section className={styles.hero}><div><span className={styles.kicker}>PLANTILLAS DE CV</span><h1>Elegí una estructura. Después hacela tuya.</h1><p>Tenés 3 plantillas gratuitas para descargar y editar directamente. Las otras 7 forman parte de CV Pro+ y mantienen su diseño cuando Postulá Mejor reescribe el contenido.</p><div className={styles.heroBadges}><b>3 gratis</b><b>7 incluidas en Pro+</b><b>Word editable</b></div></div><div className={styles.heroSheet}><div className={styles.fakeName}/><div className={styles.fakeRole}/><div className={styles.fakeLine}/><div className={styles.fakeLine}/><div className={styles.fakeLineShort}/><aside/></div></section>

  <section className={styles.info}><div><b>Descargá y completá</b><span>Las gratuitas ya vienen estructuradas: reemplazás los textos y listo.</span></div><div><b>Si la volvés a subir</b><span>Reconocemos que es una plantilla Postulá Mejor y conservamos su diseño.</span></div><div><b>En CV Pro+</b><span>Podés cambiar el color sin perder la estructura. Si querés, después podés pasar voluntariamente a un diseño básico.</span></div></section>

  <section className={styles.catalog}><div className={styles.catalogHead}><div><span>CATÁLOGO INICIAL</span><h2>10 diseños para empezar.</h2></div><p>Las tres primeras priorizan simplicidad. Las Pro+ tienen una identidad visual más marcada, pero siguen ordenando la información para una lectura rápida.</p></div><div className={styles.grid}>{POSTULA_TEMPLATES.map(t=><article className={styles.card} key={t.id} data-tier={t.tier}><button type="button" className={styles.previewButton} onClick={()=>setSelected(t.id)} aria-label={`Ver ${t.name}`}><div className={styles.miniCv} data-template={t.id} style={{'--accent':t.accent} as React.CSSProperties}><div className={styles.miniHeader}><i/><b/><span/></div><div className={styles.miniBody}><aside><i/><i/><i/><i/></aside><main><b/><i/><i/><b/><i/><i/><i/></main></div></div></button><div className={styles.cardText}><div><span className={t.tier==='pro'?styles.proBadge:styles.freeBadge}>{t.tier==='pro'?'Pro+':'Gratis'}</span><small>{t.id.toUpperCase()}</small></div><h3>{t.name}</h3><p>{t.tagline}</p><em>{t.bestFor}</em></div><div className={styles.actions}><button type="button" onClick={()=>setSelected(t.id)}>Vista previa</button>{t.tier==='free'?<button type="button" className={styles.primary} onClick={()=>downloadFree(t)}>Descargar editable</button>:<button type="button" className={styles.primary} onClick={()=>choosePro(t)}>Usar con Pro+</button>}</div></article>)}</div></section>

  {current&&<div className={styles.modal} role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)closePreview()}}><section className={styles.modalCard} role="dialog" aria-modal="true" aria-label={`Vista previa de ${current.name}`} onMouseDown={e=>e.stopPropagation()}><button type="button" className={styles.close} onClick={closePreview}>Cerrar</button><div className={styles.largePreview} data-template={current.id} style={{'--accent':current.accent} as React.CSSProperties}><header><span>{current.id.toUpperCase()} · {current.tier==='pro'?'CV Pro+':'Plantilla gratis'}</span><h2>Marina González</h2><p>Analista Comercial</p></header><div className={styles.largeColumns}><aside><b>Contacto</b><p>marina@email.com<br/>Buenos Aires<br/>linkedin.com/in/marina</p><b>Habilidades</b><p>Ventas consultivas<br/>CRM<br/>Excel<br/>Seguimiento comercial</p></aside><main><b>Perfil profesional</b><p>Perfil orientado a resultados, con experiencia en atención, seguimiento de clientes y organización comercial.</p><b>Experiencia</b><h3>Analista Comercial · Empresa</h3><small>2023 — Actualidad</small><ul><li>Seguimiento de cartera y oportunidades comerciales.</li><li>Coordinación de propuestas y contacto con clientes.</li></ul><b>Formación</b><p>Tecnicatura en Comercialización · Instituto</p></main></div></div><div className={styles.modalInfo}><span className={current.tier==='pro'?styles.proBadge:styles.freeBadge}>{current.tier==='pro'?'Incluida en CV Pro+':'Descarga gratuita'}</span><h2>{current.name}</h2><p>{current.tagline} {current.bestFor}.</p><div className={styles.modalActions}>{current.tier==='free'?<button type="button" onClick={()=>downloadFree(current)}>Descargar Word editable</button>:<button type="button" onClick={()=>choosePro(current)}>Elegir esta plantilla con Pro+</button>}<button type="button" className={styles.secondary} onClick={closePreview}>Seguir mirando</button></div></div></section></div>}
 </>
}
