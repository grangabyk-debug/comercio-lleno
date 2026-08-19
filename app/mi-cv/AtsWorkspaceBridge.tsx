'use client'

import { useEffect } from 'react'
import { CV_PRO_API, SESSION_KEY, authHeaders, trackCvEvent } from '../cv-ia/cvAuth'

function esc(v:any){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]||m))}

type AtsTheme={accent:string;accentDark:string;soft:string}
const themes:Record<string,AtsTheme>={
 navy:{accent:'#1f4b73',accentDark:'#172532',soft:'#eef5fa'},
 graphite:{accent:'#46545b',accentDark:'#202427',soft:'#f0f2f2'},
 violet:{accent:'#6957ff',accentDark:'#30246f',soft:'#f1efff'},
 burgundy:{accent:'#8f2848',accentDark:'#52152b',soft:'#fff0f4'},
 forest:{accent:'#176b5b',accentDark:'#123f36',soft:'#edf8f5'},
 sand:{accent:'#a56832',accentDark:'#5b412e',soft:'#fbf3e9'},
}

function getTheme(){
 try{return themes[localStorage.getItem('postula_cv_palette')||'navy']||themes.navy}catch{return themes.navy}
}

async function loadResume(){
 const token=localStorage.getItem(SESSION_KEY)||''
 const headers:Record<string,string>={'Content-Type':'application/json',...(await authHeaders())}
 const r=await fetch(CV_PRO_API,{method:'POST',headers,body:JSON.stringify({action:'get_resume',token})})
 const d=await r.json().catch(()=>({ok:false,error:'No pudimos leer el CV.'}))
 if(!r.ok||!d?.ok||!d?.resume)throw new Error(d?.error||'No pudimos leer el CV.')
 return d.resume
}

function atsHtml(r:any,theme:AtsTheme){
 const contact=[r?.contact?.email,r?.contact?.phone,r?.contact?.location,r?.contact?.linkedin].filter(Boolean).map(esc).join('  ·  ')
 const exp=(Array.isArray(r.experience)?r.experience:[]).map((x:any)=>`<section class="entry"><table class="entryHead" cellspacing="0" cellpadding="0"><tr><td><h3>${esc(x.role)} <span>· ${esc(x.company)}</span></h3></td><td class="dates">${esc([x.start_date,x.end_date].filter(Boolean).join(' — '))}</td></tr></table><ul>${(Array.isArray(x.bullets)?x.bullets:[]).map((b:any)=>`<li>${esc(b)}</li>`).join('')}</ul></section>`).join('')
 const edu=(Array.isArray(r.education)?r.education:[]).map((x:any)=>`<div class="education"><strong>${esc(x.degree)}</strong><span>${esc(x.institution)}${x.date?` · ${esc(x.date)}`:''}</span></div>`).join('')
 const skills=(Array.isArray(r.skills)?r.skills:[]).map(esc)
 const languages=(Array.isArray(r.languages)?r.languages:[]).map(esc)
 const certifications=(Array.isArray(r.certifications)?r.certifications:[]).map(esc)
 const skillText=skills.join('  ·  ')
 const languageText=languages.join('  ·  ')
 const certificationText=certifications.join('  ·  ')
 return `<!doctype html><html><head><meta charset="utf-8"><title>CV ATS ${esc(r.candidate_name)}</title><style>
 @page{size:A4;margin:14mm 16mm 15mm}
 *{box-sizing:border-box}
 body{font-family:Arial,Helvetica,sans-serif;color:#17191d;margin:0;background:#fff;line-height:1.48;font-size:10.6pt}
 .topbar{height:7px;background:${theme.accent};font-size:0;line-height:0;margin:0 0 20px}
 .identity{border-bottom:1px solid #dfe3e7;padding:0 0 15px;margin:0 0 15px}
 .label{font-size:8pt;letter-spacing:1.4px;text-transform:uppercase;color:${theme.accent};font-weight:700;margin:0 0 7px}
 h1{font-size:27pt;line-height:1.03;letter-spacing:-.7px;color:${theme.accentDark};margin:0 0 5px;font-weight:700}
 .headline{font-size:11.5pt;line-height:1.35;color:${theme.accent};font-weight:700;margin:0 0 8px}
 .contact{font-size:9pt;color:#414851;margin:0;line-height:1.5}
 h2{font-size:10.3pt;line-height:1;text-transform:uppercase;letter-spacing:1.15px;color:${theme.accentDark};margin:20px 0 9px;padding:0 0 6px;border-bottom:2px solid ${theme.accent}}
 .summary{font-size:10.4pt;color:#252b32;margin:0;line-height:1.58}
 .entry{break-inside:avoid;margin:0 0 14px}
 .entryHead{width:100%;border-collapse:collapse;margin:0 0 4px}
 .entryHead td{vertical-align:top;padding:0}
 .entryHead td:last-child{text-align:right;width:29%}
 h3{font-size:10.8pt;line-height:1.3;color:#17191d;margin:0;font-weight:700}
 h3 span{font-weight:600;color:#3d454e}
 .dates{font-size:8.7pt;color:#626a74;white-space:nowrap;padding-top:1px!important}
 ul{margin:5px 0 0 17px;padding:0}
 li{font-size:10pt;line-height:1.5;color:#282e35;margin:2px 0;padding-left:1px}
 .education{break-inside:avoid;margin:0 0 8px}
 .education strong{display:block;font-size:10.3pt;color:#17191d;margin:0 0 1px}
 .education span{display:block;font-size:9.3pt;color:#555e68}
 .skillsBox{background:${theme.soft};border-left:4px solid ${theme.accent};padding:10px 12px;margin:0}
 .skillsBox p{font-size:9.8pt;line-height:1.55;margin:0;color:#222a31}
 .plainList{font-size:9.8pt;line-height:1.55;margin:0;color:#222a31}
 .footer{margin-top:20px;padding-top:7px;border-top:1px solid #e1e4e7;font-size:7.8pt;color:#747b84}
 p{margin:5px 0}
</style></head><body>
 <div class="topbar">&nbsp;</div>
 <header class="identity"><p class="label">Currículum profesional · Versión ATS</p><h1>${esc(r.candidate_name)}</h1><p class="headline">${esc(r.headline)}</p><p class="contact">${contact}</p></header>
 <h2>Perfil profesional</h2><p class="summary">${esc(r.summary)}</p>
 <h2>Experiencia</h2>${exp}
 <h2>Formación</h2>${edu}
 ${skills.length?`<h2>Habilidades</h2><div class="skillsBox"><p>${skillText}</p></div>`:''}
 ${languages.length?`<h2>Idiomas</h2><p class="plainList">${languageText}</p>`:''}
 ${certifications.length?`<h2>Certificaciones</h2><p class="plainList">${certificationText}</p>`:''}
 <p class="footer">Versión ATS Pro+ · PostuláMejor.com · Estructura de una columna y encabezados estándar para facilitar la lectura automatizada.</p>
</body></html>`
}

export default function AtsWorkspaceBridge(){
 useEffect(()=>{
  const apply=()=>{
   const tabs=document.querySelector('[data-workspace-tabs]') as HTMLElement|null
   if(!tabs||document.querySelector('[data-ats-workspace-download]'))return
   const wrap=document.createElement('div');wrap.className='atsWorkspaceDownload';wrap.setAttribute('data-ats-workspace-download','1')
   wrap.innerHTML='<div><b>Versión ATS Pro+ incluida</b><span>Mismo contenido profesional y color de tu CV, en un diseño limpio de una columna preparado para sistemas ATS.</span></div><button type="button">Descargar CV ATS Pro+</button>'
   const button=wrap.querySelector('button') as HTMLButtonElement|null
   button?.addEventListener('click',async()=>{
    if(!button)return
    const original=button.textContent;button.disabled=true;button.textContent='Preparando versión ATS…'
    try{
     const resume=await loadResume(),theme=getTheme(),blob=new Blob([atsHtml(resume,theme)],{type:'application/msword;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a')
     a.href=url;a.download=`CV-ATS-Pro-${String(resume.candidate_name||'Postula-Mejor').replace(/[^a-z0-9]+/gi,'-')}.doc`;a.click();URL.revokeObjectURL(url);void trackCvEvent('ats_cv_downloaded',{format:'word',style:'pro_plus'},'/mi-cv')
     button.textContent='✓ CV ATS Pro+ descargado'
     window.setTimeout(()=>{button.textContent=original||'Descargar CV ATS Pro+';button.disabled=false},1800)
    }catch{button.textContent='Reintentar descarga ATS';button.disabled=false}
   })
   tabs.insertAdjacentElement('afterend',wrap)
  }
  apply();const obs=new MutationObserver(apply);obs.observe(document.body,{subtree:true,childList:true});return()=>obs.disconnect()
 },[])
 return null
}
