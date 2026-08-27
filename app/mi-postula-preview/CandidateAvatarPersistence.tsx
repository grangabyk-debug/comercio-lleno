'use client'

import {useEffect} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

export default function CandidateAvatarPersistence(){
 useEffect(()=>{
  let alive=true
  const paintExternal=async()=>{
   const {data}=await cvAuthClient().auth.getSession();const token=data.session?.access_token
   if(!token||!alive)return
   const r=await fetch('/api/postula/profile',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'}).catch(()=>null)
   const d=await r?.json().catch(()=>({}));const avatar=String(d?.profile?.avatar_url||'')
   if(!/^https?:\/\//i.test(avatar))return
   document.querySelectorAll<HTMLElement>('.pm34-mini-avatar,.pm34-avatar').forEach(el=>{if(!el.style.backgroundImage)el.style.backgroundImage=`url("${avatar.replace(/"/g,'')}")`})
  }
  const autoSave=()=>{
   const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('.pm34-profile-actions button'))
   const save=buttons.find(button=>button.textContent?.trim()==='Guardar foto')
   if(save&&!save.disabled&&!save.dataset.pmAvatarAutosave){save.dataset.pmAvatarAutosave='1';setTimeout(()=>{if(document.contains(save)&&!save.disabled)save.click()},80)}
  }
  void paintExternal();autoSave()
  const observer=new MutationObserver(autoSave)
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']})
  return()=>{alive=false;observer.disconnect()}
 },[])
 return null
}
