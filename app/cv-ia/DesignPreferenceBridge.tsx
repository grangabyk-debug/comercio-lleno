'use client'

import {useEffect,useState} from 'react'
import {createPortal} from 'react-dom'
import './design-preference.css'

const MODE_KEY='postula_cv_design_mode_v1'
const TEMPLATE_KEY='postula_cv_template_id_v1'
const MARKER='PM_TEMPLATE:'
type Mode='preserve'|'improve'

async function detectTemplate(file:File){
 try{
  if(/\.pdf$/i.test(file.name)||file.type==='application/pdf'){
   const {PDFDocument}=await import('pdf-lib');const pdf=await PDFDocument.load(await file.arrayBuffer(),{ignoreEncryption:true});const meta=[pdf.getSubject(),pdf.getTitle(),pdf.getKeywords()].filter(Boolean).join(' ');const m=meta.match(/PM_TEMPLATE:([a-z0-9-]+)/i);return m?.[1]||''
  }
  const text=await file.text();const m=text.match(/PM_TEMPLATE:([a-z0-9-]+)/i);return m?.[1]||''
 }catch{return ''}
}

export default function DesignPreferenceBridge(){
 const [host,setHost]=useState<HTMLElement|null>(null)
 const [mode,setMode]=useState<Mode>('improve')
 const [templateId,setTemplateId]=useState('')
 useEffect(()=>{
  try{const saved=localStorage.getItem(MODE_KEY);if(saved==='preserve'||saved==='improve')setMode(saved)}catch{}
  let alive=true,input:HTMLInputElement|null=null
  const mount=()=>{
   const form=document.getElementById('analisis') as HTMLFormElement|null;if(!form)return false
   input=form.querySelector<HTMLInputElement>('input[type=file]');const submit=form.querySelector<HTMLButtonElement>('button[type=submit]');if(!input||!submit)return false
   let node=form.querySelector<HTMLElement>('[data-pm-design-pref]');if(!node){node=document.createElement('div');node.dataset.pmDesignPref='1';submit.insertAdjacentElement('beforebegin',node)}
   if(alive)setHost(node);return true
  }
  const onFile=async()=>{const file=input?.files?.[0];if(!file){setTemplateId('');try{localStorage.removeItem(TEMPLATE_KEY)}catch{};return}const id=await detectTemplate(file);if(!alive)return;setTemplateId(id);try{id?localStorage.setItem(TEMPLATE_KEY,id):localStorage.removeItem(TEMPLATE_KEY)}catch{};if(id){setMode('preserve');try{localStorage.setItem(MODE_KEY,'preserve')}catch{}}}
  let timer:number|undefined
  if(!mount())timer=window.setInterval(()=>{if(mount()){window.clearInterval(timer);input?.addEventListener('change',onFile)}},160);else input?.addEventListener('change',onFile)

  const originalFetch=window.fetch.bind(window)
  window.fetch=async(inputArg:RequestInfo|URL,init?:RequestInit)=>{
   try{
    const url=typeof inputArg==='string'?inputArg:inputArg instanceof URL?inputArg.toString():inputArg.url
    if(url.includes('/functions/v1/cv-ai')&&typeof init?.body==='string'){
     const data=JSON.parse(init.body);if(['diagnose','generate_pro','active_adapt'].includes(String(data?.action||''))){data.design_mode=localStorage.getItem(MODE_KEY)||'improve';data.template_id=localStorage.getItem(TEMPLATE_KEY)||null;init={...init,body:JSON.stringify(data)}}
    }
   }catch{}
   return originalFetch(inputArg as any,init)
  }
  return()=>{alive=false;if(timer)window.clearInterval(timer);input?.removeEventListener('change',onFile);window.fetch=originalFetch}
 },[])
 function choose(next:Mode){setMode(next);try{localStorage.setItem(MODE_KEY,next)}catch{};window.dispatchEvent(new CustomEvent('pm:cv-design-mode',{detail:{mode:next,templateId}}))}
 if(!host)return null
 return createPortal(<div className="pm-design-pref">
  <div className="pm-design-pref-head"><div><b>¿Qué querés hacer con el diseño?</b><span>La información se adapta al puesto; vos decidís qué pasa con la estética.</span></div><a href="/plantillas">Ver 30 plantillas →</a></div>
  <div className="pm-design-pref-options">
   <button type="button" className="pm-design-option" data-active={mode==='improve'} onClick={()=>choose('improve')}><strong>Mejorar también el diseño</strong><small>Reorganizamos la presentación para que se vea más clara y profesional. Después podés elegir color y tipografía.</small></button>
   <button type="button" className="pm-design-option" data-active={mode==='preserve'} onClick={()=>choose('preserve')}><strong>Mantener mi diseño actual</strong><small>Conservamos la estructura y la foto como referencia y trabajamos principalmente sobre el contenido.</small></button>
  </div>
  {templateId&&<div className="pm-template-detected">✓ Plantilla Postulá Mejor detectada · {templateId}. La dejamos en modo “Mantener mi diseño actual” para no reemplazar nuestro diseño.</div>}
  <p className="pm-design-hint">Si el archivo viene de otra herramienta y tiene una maquetación muy compleja, puede requerir un retoque final en Word. Las plantillas de Postulá Mejor están preparadas para ser reconocidas por el sistema.</p>
 </div>,host)
}
