'use client'

import {useEffect} from 'react'
import {SOURCE_TEMPLATE_KEY,templateIdFromName,templateIdFromText} from './postulaTemplates'

export default function TemplateIdentityBridge(){
 useEffect(()=>{
  const onChange=async(e:Event)=>{
   const input=e.target as HTMLInputElement|null
   if(!input||input.type!=='file'||!input.files?.[0])return
   const file=input.files[0]
   let id=templateIdFromName(file.name)
   if(!id&&/\.(doc|txt|html?)$/i.test(file.name)&&file.size<4*1024*1024){
    try{id=templateIdFromText(await file.text())}catch{}
   }
   if(id)localStorage.setItem(SOURCE_TEMPLATE_KEY,id)
   else localStorage.removeItem(SOURCE_TEMPLATE_KEY)
  }
  document.addEventListener('change',onChange,true)
  return()=>document.removeEventListener('change',onChange,true)
 },[])
 return null
}
