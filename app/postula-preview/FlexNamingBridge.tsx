'use client'

import {useEffect} from 'react'

const TEXT_REPLACEMENTS:[RegExp,string][]=[
 [/TRABAJOS FLEX/g,'SERVICIOS FLEX'],
 [/Trabajos Flex/g,'Servicios Flex'],
 [/Trabajo Flex/g,'Servicio Flex'],
 [/trabajos Flex/g,'servicios Flex'],
 [/trabajo Flex/g,'servicio Flex'],
]

function replaceTextValue(value:string){let next=value;for(const[r,to]of TEXT_REPLACEMENTS)next=next.replace(r,to);return next}

function processNode(root:Node){
 if(root.nodeType===Node.TEXT_NODE){const value=root.nodeValue||'';const next=replaceTextValue(value);if(next!==value)root.nodeValue=next;return}
 const el=root as Element;if(!el.querySelectorAll)return
 const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT)
 let node=walker.nextNode();while(node){const value=node.nodeValue||'';const next=replaceTextValue(value);if(next!==value)node.nodeValue=next;node=walker.nextNode()}
 const links=[...(el.matches?.('a[href]')?[el]:[]),...Array.from(el.querySelectorAll('a[href]'))] as HTMLAnchorElement[]
 for(const a of links){const raw=a.getAttribute('href')||'';if(!raw.includes('trabajos-flex')&&!raw.includes('publicar%3D1'))continue;let next=raw.replaceAll('/trabajos-flex','/servicios-flex').replaceAll('trabajos-flex','servicios-flex');if(next.includes('servicios-flex')&&next.includes('publicar%3D1'))next=next.replaceAll('publicar%3D1','clasificar%3D1');if(next.includes('/servicios-flex?publicar=1'))next=next.replace('/servicios-flex?publicar=1','/servicios-flex?clasificar=1');if(next!==raw)a.setAttribute('href',next)}
 if(location.pathname==='/servicios-flex'){
  el.querySelectorAll('option').forEach(option=>{if((option.textContent||'').trim()==='Repartos y mensajería'){option.setAttribute('disabled','true');option.textContent='Repartos y mensajería — no disponible'}})
 }
}

export default function FlexNamingBridge(){
 useEffect(()=>{
  const apply=()=>{processNode(document.body);document.title=replaceTextValue(document.title);document.querySelectorAll('meta[content]').forEach(meta=>{const content=meta.getAttribute('content')||'';const next=replaceTextValue(content).replaceAll('https://postulamejor.com/trabajos-flex','https://postulamejor.com/servicios-flex');if(next!==content)meta.setAttribute('content',next)})}
  apply()
  const observer=new MutationObserver(records=>{for(const record of records)record.addedNodes.forEach(processNode)})
  observer.observe(document.body,{childList:true,subtree:true})
  return()=>observer.disconnect()
 },[])
 return null
}
