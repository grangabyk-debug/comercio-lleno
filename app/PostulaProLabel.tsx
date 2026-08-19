'use client'

import { useEffect } from 'react'

function isPostulaHost(){
  const host=window.location.hostname.toLowerCase()
  return host==='postulamejor.com'||host==='www.postulamejor.com'
}

function rewrite(value:string){
  return value
    .replace(/CV PRO\b/g,'CV Pro+')
    .replace(/CV Pro(?!\+)/g,'CV Pro+')
    .replace(/\bPRO\b/g,'Pro+')
    .replace(/\bPro\b(?!\+)/g,'Pro+')
}

function patchTextNode(node:Node){
  if(node.nodeType!==Node.TEXT_NODE)return
  const parent=node.parentElement
  if(!parent||['SCRIPT','STYLE','NOSCRIPT','CODE','PRE','TEXTAREA'].includes(parent.tagName))return
  const original=node.nodeValue||''
  const next=rewrite(original)
  if(next!==original)node.nodeValue=next
}

function patchTree(root:Node){
  if(root.nodeType===Node.TEXT_NODE){patchTextNode(root);return}
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT)
  let node:Node|null
  while((node=walker.nextNode()))patchTextNode(node)
}

export default function PostulaProLabel(){
  useEffect(()=>{
    if(!isPostulaHost())return
    patchTree(document.body)
    const observer=new MutationObserver(mutations=>{
      for(const mutation of mutations){
        if(mutation.type==='characterData')patchTextNode(mutation.target)
        for(const node of Array.from(mutation.addedNodes))patchTree(node)
      }
    })
    observer.observe(document.body,{subtree:true,childList:true,characterData:true})
    return()=>observer.disconnect()
  },[])
  return null
}
