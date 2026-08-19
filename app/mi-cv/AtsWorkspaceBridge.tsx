'use client'

import { useEffect } from 'react'
import { CV_PRO_API, SESSION_KEY, authHeaders, trackCvEvent } from '../cv-ia/cvAuth'

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

function rgb(hex:string){
 const h=hex.replace('#',''),n=parseInt(h,16)
 return [((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255].map(v=>Number(v.toFixed(3))) as [number,number,number]
}

function winAnsiByte(ch:string){
 const code=ch.charCodeAt(0)
 if(code<=255)return code
 const map:Record<string,number>={'€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159}
 return map[ch]??63
}

function pdfString(value:any){
 const text=String(value??'').replace(/\r?\n/g,' ').replace(/\s+/g,' ').trim()
 let out=''
 for(const ch of text){
  const b=winAnsiByte(ch)
  if(b===40||b===41||b===92)out+='\\'+String.fromCharCode(b)
  else if(b<32||b>126)out+='\\'+b.toString(8).padStart(3,'0')
  else out+=String.fromCharCode(b)
 }
 return out
}

let measureCtx:CanvasRenderingContext2D|null=null
function measure(text:string,size:number,bold=false){
 if(typeof document==='undefined')return text.length*size*.52
 if(!measureCtx)measureCtx=document.createElement('canvas').getContext('2d')
 if(!measureCtx)return text.length*size*.52
 measureCtx.font=`${bold?'700':'400'} ${size}px Arial`
 return measureCtx.measureText(text).width
}

function wrapText(value:any,maxWidth:number,size:number,bold=false){
 const text=String(value??'').replace(/\r?\n/g,' ').replace(/\s+/g,' ').trim()
 if(!text)return [] as string[]
 const words=text.split(' '),lines:string[]=[]
 let line=''
 for(const word of words){
  const test=line?`${line} ${word}`:word
  if(!line||measure(test,size,bold)<=maxWidth)line=test
  else{lines.push(line);line=word}
 }
 if(line)lines.push(line)
 return lines
}

function buildAtsPdf(r:any,theme:AtsTheme){
 const W=595.28,H=841.89,left=48,right=48,usable=W-left-right,bottom=55
 const accent=rgb(theme.accent),dark=rgb(theme.accentDark),soft=rgb(theme.soft)
 const pages:string[][]=[]
 let page:string[]=[],y=0
 const cmd=(s:string)=>page.push(s)
 const setFill=(c:[number,number,number])=>`${c[0]} ${c[1]} ${c[2]} rg`
 const setStroke=(c:[number,number,number])=>`${c[0]} ${c[1]} ${c[2]} RG`

 function newPage(){
  if(page.length)pages.push(page)
  page=[];y=H-48
  cmd(`q ${setFill(accent)} 0 ${H-11} ${W} 11 re f Q`)
 }
 function ensure(height:number){if(y-height<bottom)newPage()}
 function textLine(text:string,x:number,size:number,color:[number,number,number]=[.1,.11,.13],bold=false){
  cmd(`BT /${bold?'F2':'F1'} ${size} Tf ${setFill(color)} 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfString(text)}) Tj ET`)
 }
 function wrapped(text:any,x:number,maxWidth:number,size:number,lineHeight:number,color:[number,number,number]=[.15,.17,.2],bold=false,prefix=''){
  const lines=wrapText(text,maxWidth-prefix.length*size*.45,size,bold)
  for(let i=0;i<lines.length;i++){
   ensure(lineHeight+3)
   textLine(`${i===0?prefix:''}${lines[i]}`,x,size,color,bold)
   y-=lineHeight
  }
  return lines.length
 }
 function section(title:string){
  ensure(38);y-=8;textLine(title.toUpperCase(),left,10.5,dark,true);y-=7
  cmd(`q ${setStroke(accent)} 1.6 w ${left} ${y.toFixed(2)} m ${(W-right).toFixed(2)} ${y.toFixed(2)} l S Q`);y-=14
 }

 newPage()
 textLine('CURRICULUM PROFESIONAL · VERSION ATS PRO+',left,8.2,accent,true);y-=20
 wrapped(r?.candidate_name||'',left,usable,26,29,dark,true);y-=2
 wrapped(r?.headline||'',left,usable,11.6,15,accent,true);y-=3
 const contact=[r?.contact?.email,r?.contact?.phone,r?.contact?.location,r?.contact?.linkedin].filter(Boolean).join(' · ')
 wrapped(contact,left,usable,8.8,12,[.28,.31,.35],false);y-=8
 cmd(`q .86 .88 .9 RG .8 w ${left} ${y.toFixed(2)} m ${(W-right).toFixed(2)} ${y.toFixed(2)} l S Q`);y-=7

 section('Perfil profesional')
 wrapped(r?.summary||'',left,usable,10.3,15,[.15,.17,.2]);y-=3

 const experience=Array.isArray(r?.experience)?r.experience:[]
 if(experience.length){
  section('Experiencia')
  for(const job of experience){
   ensure(58)
   const roleCompany=[job?.role,job?.company].filter(Boolean).join(' · ')
   wrapped(roleCompany,left,usable,10.7,14,[.08,.09,.11],true)
   const dates=[job?.start_date,job?.end_date].filter(Boolean).join(' — ')
   if(dates){textLine(dates,left,8.5,[.38,.41,.45]);y-=12}
   const bullets=Array.isArray(job?.bullets)?job.bullets:[]
   for(const b of bullets)wrapped(b,left+12,usable-12,9.8,13.5,[.16,.18,.2],false,'- ')
   y-=7
  }
 }

 const education=Array.isArray(r?.education)?r.education:[]
 if(education.length){
  section('Formación')
  for(const ed of education){
   ensure(38)
   wrapped(ed?.degree||'',left,usable,10.2,13,[.08,.09,.11],true)
   const meta=[ed?.institution,ed?.date].filter(Boolean).join(' · ')
   if(meta)wrapped(meta,left,usable,9,12,[.34,.37,.41]);
   y-=6
  }
 }

 const skills=Array.isArray(r?.skills)?r.skills.filter(Boolean):[]
 if(skills.length){
  section('Habilidades')
  const skillText=skills.join(' · '),lines=wrapText(skillText,usable-24,9.6,false),boxH=Math.max(34,lines.length*13+18)
  ensure(boxH+5)
  cmd(`q ${setFill(soft)} ${left} ${(y-boxH+8).toFixed(2)} ${usable} ${boxH.toFixed(2)} re f Q`)
  cmd(`q ${setFill(accent)} ${left} ${(y-boxH+8).toFixed(2)} 4 ${boxH.toFixed(2)} re f Q`)
  const oldY=y;y-=4
  wrapped(skillText,left+14,usable-25,9.6,13,[.14,.16,.18]);
  y=Math.min(y,oldY-boxH+2);y-=5
 }

 const languages=Array.isArray(r?.languages)?r.languages.filter(Boolean):[]
 if(languages.length){section('Idiomas');wrapped(languages.join(' · '),left,usable,9.7,13,[.15,.17,.2]);y-=3}
 const certifications=Array.isArray(r?.certifications)?r.certifications.filter(Boolean):[]
 if(certifications.length){section('Certificaciones');wrapped(certifications.join(' · '),left,usable,9.7,13,[.15,.17,.2]);y-=3}

 if(page.length)pages.push(page)
 pages.forEach((p,index)=>{
  p.push(`q .87 .88 .9 RG .7 w ${left} 38 m ${(W-right).toFixed(2)} 38 l S Q`)
  p.push(`BT /F1 7.5 Tf .43 .46 .5 rg 1 0 0 1 ${left} 25 Tm (${pdfString('PostuláMejor.com · CV ATS Pro+ · estructura de una columna para lectura automatizada')}) Tj ET`)
  p.push(`BT /F1 7.5 Tf .43 .46 .5 rg 1 0 0 1 ${(W-right-30).toFixed(2)} 25 Tm (${pdfString(`${index+1}/${pages.length}`)}) Tj ET`)
 })

 const objects:string[]=[]
 objects[1]='<< /Type /Catalog /Pages 2 0 R >>'
 objects[3]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
 objects[4]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
 const kids:string[]=[]
 pages.forEach((commands,i)=>{
  const pageId=5+i*2,contentId=pageId+1,stream=commands.join('\n')
  kids.push(`${pageId} 0 R`)
  objects[pageId]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W.toFixed(2)} ${H.toFixed(2)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`
  objects[contentId]=`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
 })
 objects[2]=`<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`

 const enc=new TextEncoder(),chunks:string[]=['%PDF-1.4\n'],offsets:number[]=[0]
 let offset=enc.encode(chunks[0]).length
 for(let id=1;id<objects.length;id++){
  const obj=`${id} 0 obj\n${objects[id]}\nendobj\n`
  offsets[id]=offset;chunks.push(obj);offset+=enc.encode(obj).length
 }
 const xrefOffset=offset
 let xref=`xref\n0 ${objects.length}\n0000000000 65535 f \n`
 for(let id=1;id<objects.length;id++)xref+=`${String(offsets[id]).padStart(10,'0')} 00000 n \n`
 const trailer=`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
 return new Blob([enc.encode(chunks.join('')+xref+trailer)],{type:'application/pdf'})
}

export default function AtsWorkspaceBridge(){
 useEffect(()=>{
  const apply=()=>{
   const tabs=document.querySelector('[data-workspace-tabs]') as HTMLElement|null
   if(!tabs||document.querySelector('[data-ats-workspace-download]'))return
   const wrap=document.createElement('div');wrap.className='atsWorkspaceDownload';wrap.setAttribute('data-ats-workspace-download','1')
   wrap.innerHTML='<div><b>Versión ATS Pro+ incluida</b><span>Mismo contenido profesional y color de tu CV, en un PDF limpio de una columna preparado para sistemas ATS.</span></div><button type="button">Descargar PDF ATS Pro+</button>'
   const button=wrap.querySelector('button') as HTMLButtonElement|null
   button?.addEventListener('click',async()=>{
    if(!button)return
    const original=button.textContent;button.disabled=true;button.textContent='Preparando PDF ATS…'
    try{
     const resume=await loadResume(),blob=buildAtsPdf(resume,getTheme()),url=URL.createObjectURL(blob),a=document.createElement('a')
     a.href=url;a.download=`CV-ATS-Pro-${String(resume.candidate_name||'Postula-Mejor').replace(/[^a-z0-9]+/gi,'-')}.pdf`;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1500);void trackCvEvent('ats_cv_downloaded',{format:'pdf',style:'pro_plus'},'/mi-cv')
     button.textContent='✓ PDF ATS Pro+ descargado'
     window.setTimeout(()=>{button.textContent=original||'Descargar PDF ATS Pro+';button.disabled=false},1800)
    }catch{button.textContent='Reintentar descarga ATS';button.disabled=false}
   })
   tabs.insertAdjacentElement('afterend',wrap)
  }
  apply();const obs=new MutationObserver(apply);obs.observe(document.body,{subtree:true,childList:true});return()=>obs.disconnect()
 },[])
 return null
}
