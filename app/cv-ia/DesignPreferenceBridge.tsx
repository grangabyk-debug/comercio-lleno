'use client'

import {useEffect,useState} from 'react'
import {createPortal} from 'react-dom'
import './design-preference.css'

const MODE_KEY='postula_cv_design_mode_v1'
const TEMPLATE_KEY='postula_cv_template_id_v1'
type Mode='preserve'|'improve'

async function detectTemplate(file:File){
 try{
  if(/\.pdf$/i.test(file.name)||file.type==='application/pdf'){
   const {PDFDocument}=await import('pdf-lib')
   const pdf=await PDFDocument.load(await file.arrayBuffer(),{ignoreEncryption:true})
   const meta=[pdf.getSubject(),pdf.getTitle(),pdf.getKeywords()].filter(Boolean).join(' ')
   const m=meta.match(/PM_TEMPLATE:([a-z0-9-]+)/i)
   return m?.[1]||''
  }
  const text=await file.text()
  const m=text.match(/PM_TEMPLATE:([a-z0-9-]+)/i)
  return m?.[1]||''
 }catch{return ''}
}

export default function DesignPreferenceBridge(){
 const [host,setHost]=useState<HTMLElement|null>(null)
 const [mode,setMode]=useState<Mode|null>(null)
 const [templateId,setTemplateId]=useState('')

 useEffect(()=>{
  let alive=true
  let input:HTMLInputElement|null=null
  let currentHost:HTMLElement|null=null
  let fileRun=0

  const syncFile=async()=>{
   const file=input?.files?.[0]
   const run=++fileRun
   if(!file){
    setTemplateId('')
    setMode(null)
    try{localStorage.removeItem(TEMPLATE_KEY);localStorage.removeItem(MODE_KEY)}catch{}
    return
   }
   const id=await detectTemplate(file)
   if(!alive||run!==fileRun)return
   setTemplateId(id)
   try{id?localStorage.setItem(TEMPLATE_KEY,id):localStorage.removeItem(TEMPLATE_KEY)}catch{}
   if(id){
    setMode('preserve')
    try{localStorage.setItem(MODE_KEY,'preserve')}catch{}
   }else{
    setMode(null)
    try{localStorage.removeItem(MODE_KEY)}catch{}
   }
  }

  const bindInput=()=>{
   const form=document.getElementById('analisis') as HTMLFormElement|null
   const next=form?.querySelector<HTMLInputElement>('input[type=file]')||null
   if(next===input)return
   input?.removeEventListener('change',syncFile)
   input=next
   input?.addEventListener('change',syncFile)
   if(input?.files?.[0])void syncFile()
  }

  const mountPaid=()=>{
   bindInput()
   const workspace=document.querySelector<HTMLElement>('[class*="workspace"]')
   const inner=workspace?.querySelector<HTMLElement>('[class*="workspaceInner"]')||workspace
   if(!inner){
    if(currentHost){currentHost.remove();currentHost=null;if(alive)setHost(null)}
    return false
   }
   // Si el CV final ya existe, la decisión ya fue aplicada y no hace falta repetirla.
   if(inner.querySelector('[class*="tabs"]')){
    if(currentHost){currentHost.remove();currentHost=null;if(alive)setHost(null)}
    return true
   }
   let node=inner.querySelector<HTMLElement>('[data-pm-design-pref]')
   if(!node){
    node=document.createElement('div')
    node.dataset.pmDesignPref='1'
    const anchor=inner.querySelector<HTMLElement>('[class*="outputCard"]')
    if(anchor)anchor.insertAdjacentElement('beforebegin',node)
    else inner.appendChild(node)
   }
   currentHost=node
   if(alive)setHost(node)
   return true
  }

  mountPaid()
  const observer=new MutationObserver(()=>mountPaid())
  observer.observe(document.body,{childList:true,subtree:true})

  const originalFetch=window.fetch.bind(window)
  window.fetch=async(inputArg:RequestInfo|URL,init?:RequestInit)=>{
   try{
    const url=typeof inputArg==='string'?inputArg:inputArg instanceof URL?inputArg.toString():inputArg.url
    if(url.includes('/functions/v1/cv-ai')&&typeof init?.body==='string'){
     const data=JSON.parse(init.body)
     const action=String(data?.action||'')
     // El análisis gratuito no toca ni decide diseño. La preferencia se usa recién al generar CV Pro+.
     if(action==='generate_pro'||action==='active_adapt'){
      const selected=localStorage.getItem(MODE_KEY)
      if(action==='generate_pro'&&!selected){
       window.dispatchEvent(new CustomEvent('pm:cv-design-required'))
       return new Response(JSON.stringify({ok:false,error:'Antes de generar tu CV Pro+, elegí si querés mejorar el diseño o mantener el actual.'}),{status:409,headers:{'Content-Type':'application/json'}})
      }
      data.design_mode=selected||'preserve'
      data.template_id=localStorage.getItem(TEMPLATE_KEY)||null
      init={...init,body:JSON.stringify(data)}
     }
    }
   }catch{}
   return originalFetch(inputArg as any,init)
  }

  const focusRequired=()=>{mountPaid();window.setTimeout(()=>currentHost?.scrollIntoView({behavior:'smooth',block:'center'}),80)}
  window.addEventListener('pm:cv-design-required',focusRequired)

  return()=>{
   alive=false
   fileRun++
   observer.disconnect()
   input?.removeEventListener('change',syncFile)
   window.removeEventListener('pm:cv-design-required',focusRequired)
   window.fetch=originalFetch
  }
 },[])

 function choose(next:Mode){
  setMode(next)
  try{localStorage.setItem(MODE_KEY,next)}catch{}
  window.dispatchEvent(new CustomEvent('pm:cv-design-mode',{detail:{mode:next,templateId}}))
 }

 if(!host)return null
 return createPortal(<div className="pm-design-pref">
  <div className="pm-design-pref-head"><div><span className="pm-design-pref-kicker">CV PRO+</span><b>¿Qué querés hacer con el diseño?</b><span>Esta elección se aplica recién al generar tu CV Pro+. El análisis gratis sólo diagnostica y no modifica tu archivo.</span></div></div>
  <div className="pm-design-pref-options">
   <button type="button" className="pm-design-option" data-active={mode==='improve'} onClick={()=>choose('improve')}><strong>Mejorar también el diseño</strong><small>Reorganizamos la presentación para que se vea más clara y profesional, sin inventar información.</small></button>
   <button type="button" className="pm-design-option" data-active={mode==='preserve'} onClick={()=>choose('preserve')}><strong>Mantener mi diseño actual</strong><small>Conservamos la estructura y la foto como referencia y trabajamos principalmente sobre el contenido.</small></button>
  </div>
  {!mode&&<div className="pm-design-required">Elegí una opción para poder generar tu CV Pro+.</div>}
  {templateId&&<div className="pm-template-detected">✓ Detectamos un diseño reconocido por Postulá Mejor. Dejamos seleccionado “Mantener mi diseño actual” para no reemplazarlo.</div>}
  <p className="pm-design-hint">Si tu archivo tiene una maquetación muy compleja, mantener exactamente cada detalle puede requerir un retoque final en Word. El contenido nunca se completa con experiencia o logros inventados.</p>
 </div>,host)
}
