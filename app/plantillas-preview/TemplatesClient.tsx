'use client'

import Link from 'next/link'
import {CSSProperties,useEffect,useMemo,useState} from 'react'
import styles from './templates.module.css'

const CV_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/cv-ai'
const SESSION_KEY='cv_ai_session_token_v1'

type Layout='ats'|'editorial'|'modern'|'rail'|'executive'|'studio'|'signature'|'tech'|'compact'|'creative'
type Template={id:string;name:string;desc:string;free:boolean;layout:Layout;accent:string;tag:string}
type Content={name:string;headline:string;email:string;phone:string;location:string;summary:string;role:string;company:string;period:string;bullet1:string;bullet2:string;skills:string;education:string}
type Custom={accent:string;font:string;density:'aire'|'normal'|'compacto';radius:'recto'|'suave'|'redondo';headings:'normal'|'uppercase';sidebar:'claro'|'oscuro'}

const templates:Template[]=[
 {id:'claro-ats',name:'Claro ATS',desc:'Una columna, limpia y preparada para lectura automática.',free:true,layout:'ats',accent:'#3157ff',tag:'Simple y segura'},
 {id:'editorial-porteno',name:'Editorial Porteño',desc:'Tipografía protagonista, aire y una jerarquía elegante.',free:true,layout:'editorial',accent:'#d85f49',tag:'Sobria'},
 {id:'moderno-simple',name:'Moderno Simple',desc:'Bloques suaves, habilidades visibles y lectura rápida.',free:true,layout:'modern',accent:'#168b76',tag:'Versátil'},
 {id:'rail-pro',name:'Rail Pro',desc:'Panel lateral, datos compactos y experiencia dominante.',free:false,layout:'rail',accent:'#5a45e8',tag:'PRO+ · Comercial'},
 {id:'executive-pro',name:'Executive',desc:'Presencia ejecutiva, líneas finas y composición premium.',free:false,layout:'executive',accent:'#15334c',tag:'PRO+ · Dirección'},
 {id:'studio-pro',name:'Studio',desc:'Diseño editorial contemporáneo para perfiles creativos.',free:false,layout:'studio',accent:'#9b4dff',tag:'PRO+ · Creativa'},
 {id:'signature-pro',name:'Signature',desc:'Nombre protagonista, datos flotantes y detalles de autor.',free:false,layout:'signature',accent:'#b66b23',tag:'PRO+ · Personal'},
 {id:'tech-grid-pro',name:'Tech Grid',desc:'Retícula precisa, skills visibles y estética tecnológica.',free:false,layout:'tech',accent:'#00a48a',tag:'PRO+ · Tecnología'},
 {id:'compact-pro',name:'Compact Pro',desc:'Máxima información sin perder legibilidad ni jerarquía.',free:false,layout:'compact',accent:'#355b78',tag:'PRO+ · Operativa'},
 {id:'creative-pro',name:'Creative Rail',desc:'Color, secciones moduladas y una presencia mucho más visual.',free:false,layout:'creative',accent:'#ff5f72',tag:'PRO+ · Diseño'},
]

const palette=['#3157ff','#168b76','#d85f49','#7d4ee8','#b66b23','#162f46','#d63d70','#008f9c']
const initialContent:Content={name:'Nombre Apellido',headline:'Perfil profesional · Buenos Aires',email:'email@ejemplo.com',phone:'+54 11 0000 0000',location:'CABA, Argentina',summary:'Profesional orientado a resultados con experiencia en atención, operaciones y coordinación. Busco aportar criterio, organización y una buena experiencia de trabajo.',role:'Responsable de operaciones',company:'Empresa ejemplo',period:'2023 — Actualidad',bullet1:'Coordinación diaria de tareas, prioridades y atención a clientes.',bullet2:'Mejora de procesos con foco en tiempos, orden y calidad de servicio.',skills:'Atención al cliente · Organización · Excel · Comunicación · Ventas',education:'Institución ejemplo · Formación / curso · 2024'}
const initialCustom:Custom={accent:'#3157ff',font:'Inter',density:'normal',radius:'suave',headings:'normal',sidebar:'oscuro'}

async function readPlan(){
 const token=typeof window!=='undefined'?localStorage.getItem(SESSION_KEY)||'':''
 if(!token)return{paid:false,token:''}
 try{const r=await fetch(CV_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'status',token})});const data=await r.json();const s=data?.session;const until=s?.entitlement_until?new Date(s.entitlement_until).getTime():null;return{paid:Boolean((s?.plan==='pro'||s?.plan==='active')&&(!until||until>Date.now())),token}}catch{return{paid:false,token}}
}

function Preview({template,custom,content,large=false}:{template:Template;custom:Custom;content:Content;large?:boolean}){
 const style={'--cv-accent':custom.accent||template.accent,'--cv-radius':custom.radius==='recto'?'0px':custom.radius==='redondo'?'22px':'10px','--cv-font':custom.font,'--cv-gap':custom.density==='aire'?'1.26':custom.density==='compacto'?'.78':'1'} as CSSProperties
 return <div className={`${styles.cv} ${styles[template.layout]} ${large?styles.cvLarge:''} ${custom.headings==='uppercase'?styles.uppercase:''} ${custom.sidebar==='claro'?styles.sidebarLight:''}`} style={style}>
   <div className={styles.cvTop}><div><h3>{content.name}</h3><p>{content.headline}</p></div><div className={styles.contact}>{content.email}<br/>{content.phone}<br/>{content.location}</div></div>
   <div className={styles.cvBody}>
    <aside className={styles.cvSide}><span className={styles.avatar}>NA</span><b>Habilidades</b><p>{content.skills}</p><b>Contacto</b><p>{content.email}<br/>{content.phone}</p></aside>
    <section className={styles.cvMain}><h4>Perfil</h4><p>{content.summary}</p><h4>Experiencia</h4><div className={styles.role}><strong>{content.role}</strong><span>{content.company} · {content.period}</span></div><ul><li>{content.bullet1}</li><li>{content.bullet2}</li></ul><h4>Formación</h4><p>{content.education}</p><div className={styles.skillRow}>{content.skills.split('·').slice(0,5).map(x=><span key={x}>{x.trim()}</span>)}</div></section>
   </div>
  </div>
}

export default function TemplatesClient(){
 const [paid,setPaid]=useState(false)
 const [token,setToken]=useState('')
 const [checking,setChecking]=useState(true)
 const [selected,setSelected]=useState<Template|null>(null)
 const [content,setContent]=useState<Content>(initialContent)
 const [custom,setCustom]=useState<Custom>(initialCustom)
 const [downloading,setDownloading]=useState(false)
 const [notice,setNotice]=useState('')
 useEffect(()=>{void readPlan().then(x=>{setPaid(x.paid);setToken(x.token);setChecking(false)})},[])
 const selectedLocked=Boolean(selected&&!selected.free&&!paid)
 const freeCount=useMemo(()=>templates.filter(t=>t.free).length,[])
 function open(t:Template){if(!t.free&&!paid)return;setSelected(t);setCustom({...initialCustom,accent:t.accent});setNotice('')}
 async function downloadEditable(){if(!selected||selectedLocked||downloading)return;setDownloading(true);setNotice('');try{const r=await fetch('/api/postula/templates/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({templateId:selected.id,token,content,custom})});if(!r.ok){const data=await r.json().catch(()=>({}));throw new Error(data?.error||'No pudimos preparar el archivo.')}const blob=await r.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`CV-${content.name.replace(/[^a-z0-9]+/gi,'-')}-${selected.id}.doc`;a.click();URL.revokeObjectURL(url);setNotice('Archivo editable descargado. Podés abrirlo en Word, LibreOffice o Google Docs.')}catch(e){setNotice(e instanceof Error?e.message:'No pudimos descargar el archivo.')}finally{setDownloading(false)}}
 return <>
  <div className={styles.libraryBar}><div><b>{freeCount} gratis</b><span>editables y descargables</span></div><div><b>{templates.length-freeCount} Pro+</b><span>visibles completos, edición protegida</span></div><div><b>{checking?'Revisando plan…':paid?'Pro+ activo':'Plan Gratis'}</b><span>{paid?'biblioteca completa habilitada':'podés mirar todos los diseños'}</span></div></div>
  <div className={styles.grid}>{templates.map(t=>{const locked=!t.free&&!paid;const c={...initialCustom,accent:t.accent};return <article className={`${styles.card} ${locked?styles.cardLocked:''}`} key={t.id}>
    <div className={styles.previewFrame}><Preview template={t} custom={c} content={initialContent}/><span className={`${styles.badge} ${t.free?'':styles.badgePaid}`}>{t.free?'GRATIS':'PRO+'}</span></div>
    <div className={styles.meta}><div><strong>{t.name}</strong><small>{t.desc}</small></div><span className={styles.templateTag}>{t.tag}</span></div>
    <div className={styles.actions}>{locked?<><Link href="/cv-ia#planes" className={styles.proLink}>Activar Pro+</Link><span className={styles.lockText}>Vista completa · edición bloqueada</span></>:<><button onClick={()=>open(t)}>Abrir y editar</button><span className={styles.lockText}>{t.free?'Color + densidad incluidos':'Personalización avanzada incluida'}</span></>}</div>
   </article>})}</div>
  {selected&&<div className={styles.sheetWrap} role="dialog" aria-modal="true"><div className={styles.editorShell}>
    <aside className={styles.editorPanel}><div className={styles.editorHead}><div><span>{selected.free?'PLANTILLA GRATIS':'PRO+'}</span><h2>{selected.name}</h2></div><button onClick={()=>setSelected(null)} aria-label="Cerrar">×</button></div>
      <div className={styles.editorSection}><b>Estilo</b><label>Color principal<div className={styles.colors}>{palette.map(color=><button type="button" aria-label={`Usar color ${color}`} key={color} data-on={custom.accent===color} style={{background:color}} onClick={()=>setCustom(c=>({...c,accent:color}))}/>)}</div></label><label>Densidad<select value={custom.density} onChange={e=>setCustom(c=>({...c,density:e.target.value as Custom['density']}))}><option value="aire">Con aire</option><option value="normal">Normal</option><option value="compacto">Compacta</option></select></label></div>
      {!selected.free&&<div className={styles.editorSection}><b>Opciones Pro+</b><label>Tipografía<select value={custom.font} onChange={e=>setCustom(c=>({...c,font:e.target.value}))}><option>Inter</option><option>Georgia</option><option>Arial</option><option>Trebuchet MS</option></select></label><label>Terminación<select value={custom.radius} onChange={e=>setCustom(c=>({...c,radius:e.target.value as Custom['radius']}))}><option value="recto">Recta</option><option value="suave">Suave</option><option value="redondo">Redondeada</option></select></label><label>Títulos<select value={custom.headings} onChange={e=>setCustom(c=>({...c,headings:e.target.value as Custom['headings']}))}><option value="normal">Natural</option><option value="uppercase">Mayúsculas editoriales</option></select></label><label>Panel lateral<select value={custom.sidebar} onChange={e=>setCustom(c=>({...c,sidebar:e.target.value as Custom['sidebar']}))}><option value="oscuro">Contraste</option><option value="claro">Claro</option></select></label></div>}
      <div className={styles.editorSection}><b>Contenido editable</b>{([['name','Nombre'],['headline','Título profesional'],['email','Email'],['phone','Teléfono'],['location','Ubicación'],['role','Puesto'],['company','Empresa'],['period','Período'],['education','Formación']] as [keyof Content,string][]).map(([key,label])=><label key={key}>{label}<input value={content[key]} onChange={e=>setContent(v=>({...v,[key]:e.target.value}))}/></label>)}<label>Perfil<textarea rows={4} value={content.summary} onChange={e=>setContent(v=>({...v,summary:e.target.value}))}/></label><label>Logro / tarea 1<textarea rows={2} value={content.bullet1} onChange={e=>setContent(v=>({...v,bullet1:e.target.value}))}/></label><label>Logro / tarea 2<textarea rows={2} value={content.bullet2} onChange={e=>setContent(v=>({...v,bullet2:e.target.value}))}/></label><label>Habilidades<input value={content.skills} onChange={e=>setContent(v=>({...v,skills:e.target.value}))}/></label></div>
      <div className={styles.editorActions}><button onClick={()=>window.print()}>Guardar PDF</button><button className={styles.primaryAction} onClick={downloadEditable} disabled={downloading}>{downloading?'Preparando…':'Descargar editable .DOC'}</button></div>{notice&&<p className={styles.notice}>{notice}</p>}
    </aside>
    <div className={styles.sheetPanel}><Preview template={selected} custom={custom} content={content} large/></div>
  </div></div>}
 </>
}
