'use client'

import {useEffect} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

export default function CandidateAvatarPersistence(){
 useEffect(()=>{
  let alive=true
  let retryTimers:number[]=[]
  const paint=async()=>{
   const client=cvAuthClient();const {data}=await client.auth.getSession();const token=data.session?.access_token
   if(!token||!alive)return
   const r=await fetch('/api/postula/profile',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'}).catch(()=>null)
   const d=await r?.json().catch(()=>({}));const avatar=String(d?.profile?.avatar_url||'').trim()
   if(!avatar)return
   let src=avatar
   if(!/^https?:\/\//i.test(avatar)){
    const {data:signed}=await client.storage.from('postula-private').createSignedUrl(avatar,60*60)
    src=String(signed?.signedUrl||'')
   }
   if(!src||!alive)return
   document.querySelectorAll<HTMLElement>('.pm34-mini-avatar,.pm34-avatar,.pm33-photo-preview').forEach(el=>{
    if(el.tagName==='IMG')return
    el.style.backgroundImage=`url("${src.replace(/"/g,'')}")`
    el.style.backgroundSize='cover';el.style.backgroundPosition='center';el.style.backgroundRepeat='no-repeat';el.style.color='transparent'
   })
  }
  const saveButton=()=>Array.from(document.querySelectorAll<HTMLButtonElement>('.pm34-profile-actions button')).find(button=>button.textContent?.trim()==='Guardar foto')
  const autoSave=()=>{
   const save=saveButton()
   if(!save||save.disabled||save.dataset.pmAvatarAutosave==='saving')return false
   save.dataset.pmAvatarAutosave='saving'
   save.click()
   window.setTimeout(()=>{if(document.contains(save))delete save.dataset.pmAvatarAutosave;void paint()},700)
   return true
  }
  const scheduleAutoSave=()=>{
   retryTimers.forEach(id=>window.clearTimeout(id));retryTimers=[]
   ;[120,350,800,1500,2600].forEach(delay=>retryTimers.push(window.setTimeout(()=>{if(alive)autoSave()},delay)))
  }
  const onFileChange=(event:Event)=>{
   const input=event.target as HTMLInputElement|null
   if(!input?.matches('input[type="file"][accept*="image"]')||!input.files?.length)return
   scheduleAutoSave()
  }
  void paint();autoSave()
  const observer=new MutationObserver(()=>{if(autoSave())window.setTimeout(()=>void paint(),750)})
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']})
  const refresh=()=>void paint();window.addEventListener('focus',refresh);document.addEventListener('change',onFileChange,true)
  return()=>{alive=false;observer.disconnect();retryTimers.forEach(id=>window.clearTimeout(id));window.removeEventListener('focus',refresh);document.removeEventListener('change',onFileChange,true)}
 },[])
 return null
}
