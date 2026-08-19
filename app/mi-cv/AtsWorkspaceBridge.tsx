'use client'

import { useEffect } from 'react'
import { CV_PRO_API, SESSION_KEY, authHeaders, trackCvEvent } from '../cv-ia/cvAuth'

function esc(v:any){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]||m))}

async function loadResume(){
 const token=localStorage.getItem(SESSION_KEY)||''
 const headers:Record<string,string>={'Content-Type':'application/json',...(await authHeaders())}
 const r=await fetch(CV_PRO_API,{method:'POST',headers,body:JSON.stringify({action:'get_resume',token})})
 const d=await r.json().catch(()=>({ok:false,error:'No pudimos leer el CV.'}))
 if(!r.ok||!d?.ok||!d?.resume)throw new Error(d?.error||'No pudimos leer el CV.')
 return d.resume
}

function atsHtml(r:any){
 const contact=[r?.contact?.email,r?.contact?.phone,r?.contact?.location,r?.contact?.linkedin].filter(Boolean).map(esc).join(' · ')
 const exp=(Array.isArray(r.experience)?r.experience:[]).map((x:any)=>`<section><h3>${esc(x.role)} — ${esc(x.company)}</h3><p class="dates">${esc([x.start_date,x.end_date].filter(Boolean).join(' — '))}</p><ul>${(Array.isArray(x.bullets)?x.bullets:[]).map((b:any)=>`<li>${esc(b)}</li>`).join('')}</ul></section>`).join('')
 const edu=(Array.isArray(r.education)?r.education:[]).map((x:any)=>`<p><strong>${esc(x.degree)}</strong> — ${esc(x.institution)}${x.date?` · ${esc(x.date)}`:''}</p>`).join('')
 const skills=(Array.isArray(r.skills)?r.skills:[]).map(esc).join(' · ')
 const languages=(Array.isArray(r.languages)?r.languages:[]).map(esc).join(' · ')
 const certifications=(Array.isArray(r.certifications)?r.certifications:[]).map(esc).join(' · ')
 return `<!doctype html><html><head><meta charset="utf-8"><title>CV ATS ${esc(r.candidate_name)}</title><style>@page{size:A4;margin:17mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;line-height:1.42;font-size:11pt}h1{font-size:22pt;margin:0 0 4px}h2{font-size:12.5pt;margin:18px 0 7px;border-bottom:1px solid #222;padding-bottom:3px}h3{font-size:11.5pt;margin:12px 0 2px}.headline{font-weight:700;margin:0 0 5px}.contact{font-size:9.5pt;margin:0 0 15px}.dates{font-size:9.5pt;margin:0 0 4px}p{margin:5px 0}ul{margin:5px 0 10px 20px;padding:0}li{margin:2px 0}section{break-inside:avoid}small{font-size:8.5pt}</style></head><body><h1>${esc(r.candidate_name)}</h1><p class="headline">${esc(r.headline)}</p><p class="contact">${contact}</p><h2>PERFIL PROFESIONAL</h2><p>${esc(r.summary)}</p><h2>EXPERIENCIA</h2>${exp}<h2>FORMACIÓN</h2>${edu}<h2>HABILIDADES</h2><p>${skills}</p>${languages?`<h2>IDIOMAS</h2><p>${languages}</p>`:''}${certifications?`<h2>CERTIFICACIONES</h2><p>${certifications}</p>`:''}<p><small>Versión ATS generada por PostuláMejor.com a partir del contenido factual aprobado del CV.</small></p></body></html>`
}

export default function AtsWorkspaceBridge(){
 useEffect(()=>{
  const apply=()=>{
   const tabs=document.querySelector('[data-workspace-tabs]') as HTMLElement|null
   if(!tabs||document.querySelector('[data-ats-workspace-download]'))return
   const wrap=document.createElement('div');wrap.className='atsWorkspaceDownload';wrap.setAttribute('data-ats-workspace-download','1')
   wrap.innerHTML='<div><b>Versión ATS incluida</b><span>Una sola columna, secciones estándar y contenido priorizado según la oferta.</span></div><button type="button">Descargar CV ATS</button>'
   const button=wrap.querySelector('button') as HTMLButtonElement|null
   button?.addEventListener('click',async()=>{
    if(!button)return
    const original=button.textContent;button.disabled=true;button.textContent='Preparando ATS…'
    try{
     const resume=await loadResume(),blob=new Blob([atsHtml(resume)],{type:'application/msword;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a')
     a.href=url;a.download=`CV-ATS-${String(resume.candidate_name||'Postula-Mejor').replace(/[^a-z0-9]+/gi,'-')}.doc`;a.click();URL.revokeObjectURL(url);void trackCvEvent('ats_cv_downloaded',{format:'word'},'/mi-cv')
     button.textContent='✓ CV ATS descargado'
     window.setTimeout(()=>{button.textContent=original||'Descargar CV ATS';button.disabled=false},1800)
    }catch{button.textContent='Reintentar descarga ATS';button.disabled=false}
   })
   tabs.insertAdjacentElement('afterend',wrap)
  }
  apply();const obs=new MutationObserver(apply);obs.observe(document.body,{subtree:true,childList:true});return()=>obs.disconnect()
 },[])
 return null
}
