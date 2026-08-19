'use client'

import {useEffect} from 'react'
import {DESIRED_TEMPLATE_KEY,SOURCE_TEMPLATE_KEY,getPostulaTemplate} from '../cv-ia/postulaTemplates'

function wordCss(id:string,accent:string,side:string){
 const base=`@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#17191d}.cv{width:100%;min-height:1000px;background:#fff}.side{padding:30px 22px;background:${side};color:#fff}.side h4{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#d9ff61;margin:22px 0 7px}.side p,.side li{font-size:10px;line-height:1.5}.side ul{padding-left:16px}.main{padding:40px 36px}.photo{width:105px;height:105px;object-fit:cover;border-radius:14px;display:block;margin:0 auto 22px}.name{font-size:31px;line-height:1;margin:0}.headline{font-size:13px;color:${accent};font-weight:700;margin:8px 0 22px}.sectionTitle{font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;border-bottom:2px solid #17191d;padding-bottom:5px;margin:22px 0 10px}.summary,.job li{font-size:10.5px;line-height:1.55}.job h3{font-size:11.5px;margin:12px 0 2px}.job small{font-size:9px;color:#666}.job ul{padding-left:17px}`
 if(id==='pm01')return base+`.cv{display:block}.side{background:#f4f3ff;color:#20232a;border-top:8px solid ${accent};display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:14px;padding:18px 30px}.side h4{color:${accent};margin:0 0 5px}.side .photo{display:none}.main{padding:34px 48px}.sectionTitle{border-bottom-color:${accent}}`
 if(id==='pm02')return base+`.cv{display:grid;grid-template-columns:190px 1fr}.side{background:#e9f4ef;color:#1b2925;border-top:12px solid ${accent};min-height:1000px}.side h4{color:${accent}}.main{padding:42px}.sectionTitle{border-bottom-color:${accent}}`
 if(id==='pm03')return base+`.cv{display:block;padding:42px 52px}.side{background:#fff;color:#17191d;border:1px solid #d8dadd;padding:14px 18px}.side h4{display:inline;color:#17191d;margin-right:10px}.side .photo{display:none}.main{padding:24px 0}.sectionTitle{border-bottom:1px solid #17191d}`
 if(id==='pm04')return base+`.cv{display:grid;grid-template-columns:220px 1fr;border-top:16px solid ${side}}.side{min-height:1000px}.main{padding:46px 42px}.name{font-size:36px}.sectionTitle{border-bottom-color:${accent}}`
 if(id==='pm05')return base+`.cv{display:grid;grid-template-columns:1fr 205px}.side{grid-column:2;grid-row:1;background:#f7e9ee;color:#2e1c23}.side h4{color:${accent}}.main{grid-column:1;grid-row:1;padding:50px 44px}.name{font-family:Georgia,serif;font-size:38px}.sectionTitle{border-bottom:1px solid ${accent}}`
 if(id==='pm06')return base+`body{background:#f2f0fa;padding:20px}.cv{display:grid;grid-template-columns:215px 1fr;gap:16px;background:#f2f0fa}.side,.main{border-radius:16px}.side{background:${side}}.main{background:#fff}.sectionTitle{border-bottom-color:${accent}}`
 if(id==='pm07')return base+`.cv{display:grid;grid-template-columns:210px 1fr;border-top:92px solid #17191d}.side{background:#f2f2f0;color:#17191d}.side h4{color:${accent}}.main{padding:40px}.name{font-size:40px}.sectionTitle{border-bottom:4px solid ${accent}}`
 if(id==='pm08')return base+`body{background:#fbf7ef;font-family:Georgia,serif}.cv{display:grid;grid-template-columns:205px 1fr;background:#fbf7ef;padding:26px}.side{background:#efe5d8;color:#352a20}.side h4{color:${accent}}.main{padding:38px}.sectionTitle{border-bottom:1px solid ${accent}}`
 if(id==='pm09')return base+`.cv{display:grid;grid-template-columns:210px 1fr;border-left:14px solid ${side}}.side{background:#e7f3ef;color:#17352f}.side h4{color:${accent}}.main{padding:44px}.sectionTitle{border-bottom-color:${accent};border-bottom-style:dashed}`
 return base+`.cv{display:grid;grid-template-columns:220px 1fr;background:linear-gradient(135deg,#fff 0 84%,#f6e5ec 84%)}.side{background:${side};min-height:1000px}.main{padding:48px 42px}.name{font-size:42px}.headline{font-size:15px}.sectionTitle{border-bottom:7px solid ${accent};padding-bottom:7px}`
}

function wordFromResume(resume:HTMLElement,id:string){
 const clone=resume.cloneNode(true) as HTMLElement
 const map:[string,string][]=[['modernSide','side'],['modernMain','main'],['photo','photo'],['name','name'],['headline','headline'],['sectionTitle','sectionTitle'],['summary','summary'],['job','job']]
 for(const [needle,name] of map)clone.querySelectorAll<HTMLElement>(`[class*="${needle}"]`).forEach(el=>{el.className=name})
 clone.className='cv';clone.removeAttribute('data-pm-template')
 const computed=getComputedStyle(resume),accent=computed.getPropertyValue('--cv-accent').trim()||'#6957ff',side=computed.getPropertyValue('--cv-side').trim()||'#17191d'
 return `<!doctype html><html><head><meta charset="utf-8"><meta name="postulamejor-template" content="${id}"><style>${wordCss(id,accent,side)}</style></head><body><!-- POSTULAMEJOR_TEMPLATE:${id} -->${clone.outerHTML}</body></html>`
}

function downloadPreserved(resume:HTMLElement,id:string){
 const html=wordFromResume(resume,id),blob=new Blob([html],{type:'application/msword;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a')
 const name=(resume.querySelector<HTMLElement>('[class*="name"]')?.textContent||'CV').trim().replace(/[^a-z0-9]+/gi,'-')
 a.href=url;a.download=`PostulaMejor-CV-${id.toUpperCase()}-${name}.doc`;a.click();URL.revokeObjectURL(url)
}

export default function TemplateWorkspaceBridge(){
 useEffect(()=>{
  const params=new URLSearchParams(location.search)
  const fromQuery=getPostulaTemplate(params.get('template'))?.id
  if(fromQuery){localStorage.setItem(SOURCE_TEMPLATE_KEY,fromQuery);localStorage.setItem(DESIRED_TEMPLATE_KEY,fromQuery)}
  let activeId=getPostulaTemplate(localStorage.getItem(SOURCE_TEMPLATE_KEY)||localStorage.getItem(DESIRED_TEMPLATE_KEY))?.id||''
  if(!activeId)return
  let forcingModern=false,raf=0

  const clearPreserved=()=>{
   localStorage.removeItem(SOURCE_TEMPLATE_KEY);localStorage.removeItem(DESIRED_TEMPLATE_KEY);activeId=''
   document.querySelector<HTMLElement>('[data-pm-template]')?.removeAttribute('data-pm-template')
   document.querySelector('.pmTemplateButton')?.remove();document.querySelector('.pmTemplateNote')?.remove();document.querySelector('[class*="templateBtns"]')?.classList.remove('pmHasSourceTemplate')
  }

  const apply=()=>{
   raf=0
   const t=getPostulaTemplate(activeId);if(!t)return
   const resume=document.querySelector<HTMLElement>('[class*="resumeWrap"] [class*="resume"]')
   const controls=document.querySelector<HTMLElement>('[class*="templateBtns"]')
   if(!resume||!controls)return
   if(!resume.querySelector('[class*="modernSide"]')){
    const modern=Array.from(controls.querySelectorAll('button')).find(b=>(b.textContent||'').trim()==='Moderno') as HTMLButtonElement|undefined
    if(modern&&!forcingModern){forcingModern=true;modern.click();queueMicrotask(()=>{forcingModern=false});return}
   }
   resume.dataset.pmTemplate=t.id
   controls.classList.add('pmHasSourceTemplate')
   if(!controls.querySelector('.pmTemplateButton')){
    const button=document.createElement('button');button.type='button';button.className='pmTemplateButton';button.setAttribute('data-on','true');button.innerHTML=`<small>${t.tier==='pro'?'PLANTILLA Pro+':'PLANTILLA ORIGINAL'}</small><b>${t.name}</b>`;controls.prepend(button)
   }
   if(!controls.parentElement?.querySelector('.pmTemplateNote')){
    const note=document.createElement('p');note.className='pmTemplateNote';note.innerHTML=`Detectamos <b>${t.name}</b>. CV Pro+ conserva este diseño. Podés cambiar el color sin alterar la estructura; si elegís Moderno o Clásico, reemplazás voluntariamente esta plantilla.`;controls.insertAdjacentElement('afterend',note)
   }
  }

  const schedule=()=>{if(!activeId||raf)return;raf=requestAnimationFrame(apply)}
  const click=(e:MouseEvent)=>{
   const button=(e.target as Element|null)?.closest('button') as HTMLButtonElement|null;if(!button)return
   const text=(button.textContent||'').trim()
   if(!forcingModern&&(text==='Moderno'||text==='Clásico')){clearPreserved();return}
   if(activeId&&text.includes('Descargar para Word')){
    const resume=document.querySelector<HTMLElement>('[data-pm-template]');if(!resume)return
    e.preventDefault();e.stopPropagation();downloadPreserved(resume,activeId)
   }
  }
  document.addEventListener('click',click,true)
  const observer=new MutationObserver(m=>{if(m.some(x=>x.addedNodes.length))schedule()});observer.observe(document.body,{subtree:true,childList:true});schedule()
  return()=>{document.removeEventListener('click',click,true);observer.disconnect();if(raf)cancelAnimationFrame(raf)}
 },[])
 return null
}
