'use client'

import { useEffect } from 'react'
import CvPerspectiveRebuild from './CvPerspectiveRebuild'

const LEGACY_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/cv-ai'
const COMMENTS_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/cv-ai-comments'

function injectPublishedComment(comment:any){
  window.setTimeout(()=>{
    const list=document.querySelector<HTMLElement>('[class*="commentsList"]')
    if(!list||!comment?.id||list.querySelector(`[data-live-comment="${CSS.escape(String(comment.id))}"]`))return
    const empty=list.querySelector<HTMLElement>('[class*="emptyComments"]');if(empty)empty.remove()
    const sample=list.querySelector<HTMLElement>('article')
    const article=document.createElement('article');article.setAttribute('data-live-comment',String(comment.id))
    if(sample)article.className=sample.className
    const avatar=document.createElement('div');avatar.className=sample?.querySelector<HTMLElement>('[class*="avatar"]')?.className||'';avatar.textContent=String(comment.display_name||'?').slice(0,1).toUpperCase()
    const body=document.createElement('div')
    const title=document.createElement('b');title.textContent=`${comment.display_name||'Usuario'} ${'★'.repeat(Math.max(1,Math.min(5,Number(comment.rating||5))))}`
    const role=document.createElement('small');role.textContent=comment.role_label||'Usuario de PostuláMejor.com'
    const text=document.createElement('p');text.textContent=comment.body||''
    body.append(title,role,text);article.append(avatar,body);list.prepend(article);list.scrollTo({top:0,behavior:'smooth'})
  },80)
}

export default function CommentPolicyBridge(){
  useEffect(()=>{
    const nativeFetch=window.fetch.bind(window)
    const patched:typeof window.fetch=async(input,init)=>{
      try{
        const url=typeof input==='string'?input:input instanceof URL?input.toString():input.url
        if(url===LEGACY_API&&typeof init?.body==='string'){
          const body=JSON.parse(init.body)
          if(body?.action==='comments'||body?.action==='submit_comment'){
            const response=await nativeFetch(COMMENTS_API,init)
            if(body?.action==='submit_comment'&&response.ok){
              void response.clone().json().then(data=>{if(data?.published&&data?.comment)injectPublishedComment(data.comment)}).catch(()=>{})
            }
            return response
          }
        }
      }catch{}
      return nativeFetch(input as any,init)
    }
    window.fetch=patched
    const rewrite=()=>{
      for(const el of Array.from(document.querySelectorAll<HTMLElement>('p,div,span,small,b'))){
        if(el.children.length!==0)continue
        const text=el.textContent||''
        if(text.includes('Quedó enviado para una revisión rápida antes de publicarse.'))el.textContent='Gracias. Tu comentario ya se publicó.'
        if(text.includes('Los comentarios se publican después de una revisión simple para evitar spam, datos privados o contenido falso.'))el.textContent='Las opiniones se publican en el momento. Sólo pedimos respeto: los insultos o malas palabras no se publican.'
        if(text.trim()==='Usuario de CV IA')el.textContent='Usuario de PostuláMejor.com'
      }
    }
    rewrite()
    const observer=new MutationObserver(rewrite);observer.observe(document.body,{subtree:true,childList:true,characterData:true})
    return()=>{window.fetch=nativeFetch as typeof window.fetch;observer.disconnect()}
  },[])
  return <CvPerspectiveRebuild/>
}
