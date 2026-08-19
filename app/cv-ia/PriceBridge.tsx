'use client'

import { useEffect } from 'react'

export default function PriceBridge(){
 useEffect(()=>{
  const update=()=>{
   const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT)
   let node:Node|null
   while((node=walker.nextNode())){
    if(node.nodeValue?.includes('$8.900'))node.nodeValue=node.nodeValue.replace(/\$8\.900/g,'$5.990')
   }
  }
  update();const obs=new MutationObserver(update);obs.observe(document.body,{subtree:true,childList:true,characterData:true});return()=>obs.disconnect()
 },[])
 return null
}
