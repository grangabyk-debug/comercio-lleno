'use client'

import {useEffect} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

export default function CandidateAvatarPersistence(){
 useEffect(()=>{
  let alive=true
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
  const autoSave=()=>{
   const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('.pm34-profile-actions button'))
   const save=buttons.find(button=>button.textContent?.trim()==='Guardar foto')
   if(save&&!save.disabled&&!save.dataset.pmAvatarAutosave){save.dataset.pmAvatarAutosave='1';setTimeout(()=>{if(document.contains(save)&&!save.disabled)save.click()},80)}
  }
  void paint();autoSave()
  const observer=new MutationObserver(()=>{autoSave();void paint()})
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']})
  const refresh=()=>void paint();window.addEventListener('focus',refresh)
  return()=>{alive=false;observer.disconnect();window.removeEventListener('focus',refresh)}
 },[])
 return null
}
