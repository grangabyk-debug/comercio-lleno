'use client'

import { useEffect } from 'react'

const LEGACY_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/cv-ai'
const COMMENTS_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/cv-ai-comments'

export default function CommentPolicyBridge(){
  useEffect(()=>{
    const nativeFetch=window.fetch.bind(window)
    const patched:typeof window.fetch=async(input,init)=>{
      try{
        const url=typeof input==='string'?input:input instanceof URL?input.toString():input.url
        if(url===LEGACY_API&&typeof init?.body==='string'){
          const body=JSON.parse(init.body)
          if(body?.action==='comments'||body?.action==='submit_comment')return nativeFetch(COMMENTS_API,init)
        }
      }catch{}
      return nativeFetch(input as any,init)
    }
    window.fetch=patched
    const rewrite=()=>{
      for(const el of Array.from(document.querySelectorAll<HTMLElement>('p,div,span'))){
        if(el.children.length!==0)continue
        const text=el.textContent||''
        if(text.includes('Quedó enviado para una revisión rápida antes de publicarse.'))el.textContent='Gracias. Tu comentario ya se publicó.'
        if(text.includes('Los comentarios se publican después de una revisión simple para evitar spam, datos privados o contenido falso.'))el.textContent='Las opiniones se publican automáticamente. Sólo pedimos respeto: los insultos o malas palabras no se publican.'
      }
    }
    rewrite()
    const observer=new MutationObserver(rewrite);observer.observe(document.body,{subtree:true,childList:true,characterData:true})
    return()=>{window.fetch=nativeFetch as typeof window.fetch;observer.disconnect()}
  },[])
  return null
}
