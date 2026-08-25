'use client'

import {useEffect} from 'react'

const TEXT_REPLACEMENTS:[RegExp,string][]=[
 [/TRABAJOS FLEX/g,'SERVICIOS FLEX'],
 [/Trabajos Flex/g,'Servicios Flex'],
 [/Trabajo Flex/g,'Servicio Flex'],
 [/trabajos Flex/g,'servicios Flex'],
 [/trabajo Flex/g,'servicio Flex'],
]
const SERVICES_REPLACEMENTS:[RegExp,string][]=[
 [/Pago \/ importe/g,'Importe del servicio'],
 [/Pago visible/g,'Importe visible'],
 [/Contá la tarea, el pago, la zona y cuándo la necesitás\./g,'Contá la tarea, el importe, la zona y cuándo la necesitás.'],
 [/Aclaralo por tarea, hora o jornada\./g,'Indicá cómo se calcula el importe: por tarea, hora o jornada puntual.'],
]

function replaceTextValue(value:string){let next=value;for(const[r,to]of TEXT_REPLACEMENTS)next=next.replace(r,to);if(typeof location!=='undefined'&&location.pathname==='/servicios-flex')for(const[r,to]of SERVICES_REPLACEMENTS)next=next.replace(r,to);return next}

function enhanceServicesFlex(){
 if(location.pathname!=='/servicios-flex')return
 document.querySelectorAll('option').forEach(option=>{if((option.textContent||'').trim()==='Repartos y mensajería'){option.setAttribute('disabled','true');option.textContent='Repartos y mensajería — no disponible'}})
 const policy=document.querySelector('.pm34-policy-check span')
 if(policy&&!policy.querySelector('[data-services-flex-terms]')){const suffix=document.createTextNode(', los '),link=document.createElement('a');link.href='/terminos/servicios-flex';link.target='_blank';link.rel='noopener noreferrer';link.dataset.servicesFlexTerms='1';link.textContent='Términos específicos de Servicios Flex';policy.append(suffix,link,document.createTextNode('.'))}
 const rules=document.querySelector('.pm34-rules')
 if(rules&&!rules.querySelector('[data-services-flex-payment]')){const box=document.createElement('div');box.dataset.servicesFlexPayment='1';box.style.cssText='margin-top:14px;padding:13px 14px;border-radius:14px;background:#f3ffcf;border:1px solid #d8ee91;font-size:12px;line-height:1.5;color:#424b38';box.innerHTML='<b style="display:block;margin-bottom:3px;color:#1b2414">Pago directo entre las partes</b>Postulá Mejor no recibe, retiene, custodia ni libera el dinero del servicio. Los pagos dentro de la plataforma corresponden únicamente a planes, herramientas o créditos de publicación.';const check=rules.querySelector('.pm34-policy-check');if(check)rules.insertBefore(box,check);else rules.appendChild(box)}
}

function processNode(root:Node){
 if(root.nodeType===Node.TEXT_NODE){const value=root.nodeValue||'';const next=replaceTextValue(value);if(next!==value)root.nodeValue=next;return}
 const el=root as Element;if(!el.querySelectorAll)return
 const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT)
 let node=walker.nextNode();while(node){const value=node.nodeValue||'';const next=replaceTextValue(value);if(next!==value)node.nodeValue=next;node=walker.nextNode()}
 const links=[...(el.matches?.('a[href]')?[el]:[]),...Array.from(el.querySelectorAll('a[href]'))] as HTMLAnchorElement[]
 for(const a of links){const raw=a.getAttribute('href')||'';if(!raw.includes('trabajos-flex')&&!raw.includes('publicar%3D1'))continue;let next=raw.replaceAll('/trabajos-flex','/servicios-flex').replaceAll('trabajos-flex','servicios-flex');if(next.includes('servicios-flex')&&next.includes('publicar%3D1'))next=next.replaceAll('publicar%3D1','clasificar%3D1');if(next.includes('/servicios-flex?publicar=1'))next=next.replace('/servicios-flex?publicar=1','/servicios-flex?clasificar=1');if(next!==raw)a.setAttribute('href',next)}
 enhanceServicesFlex()
}

export default function FlexNamingBridge(){
 useEffect(()=>{
  const w=window as typeof window&{__pmFlexNamingBridge?:boolean};if(w.__pmFlexNamingBridge)return;w.__pmFlexNamingBridge=true
  const apply=()=>{processNode(document.body);document.title=replaceTextValue(document.title);document.querySelectorAll('meta[content]').forEach(meta=>{const content=meta.getAttribute('content')||'';const next=replaceTextValue(content).replaceAll('https://postulamejor.com/trabajos-flex','https://postulamejor.com/servicios-flex');if(next!==content)meta.setAttribute('content',next)});enhanceServicesFlex()}
  apply()
  const observer=new MutationObserver(records=>{for(const record of records)record.addedNodes.forEach(processNode);enhanceServicesFlex()})
  observer.observe(document.body,{childList:true,subtree:true})
  return()=>{observer.disconnect();w.__pmFlexNamingBridge=false}
 },[])
 return null
}
