'use client'

import {useEffect} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

function unwrapBackground(value:string){
 const match=value.match(/^url\(["']?(.*?)["']?\)$/)
 return match?.[1]||''
}

export default function CandidateAvatarConsistency(){
 useEffect(()=>{
  let alive=true
  let currentUrl=''
  let applying=false

  const apply=(url=currentUrl)=>{
   if(!url||applying)return
   applying=true
   document.querySelectorAll<HTMLElement>('.pm42-avatar').forEach(node=>{
    node.style.setProperty('background-image',`url("${url.replace(/"/g,'%22')}")`,'important')
    node.style.setProperty('background-size','cover','important')
    node.style.setProperty('background-position','50% 35%','important')
    node.style.setProperty('background-repeat','no-repeat','important')
    node.style.setProperty('overflow','hidden','important')
    node.style.setProperty('color','transparent','important')
    node.dataset.pmAvatarReady='1'
   })
   applying=false
  }

  const resolve=async()=>{
   const client=cvAuthClient()
   const {data}=await client.auth.getSession()
   const session=data.session
   if(!session||!alive)return
   const response=await fetch('/api/postula/profile',{headers:{Authorization:`Bearer ${session.access_token}`},cache:'no-store'})
   const body=await response.json().catch(()=>({}))
   const raw=String(body?.profile?.avatar_url||'').trim()
   if(!raw){currentUrl='';return}
   if(/^https?:\/\//i.test(raw))currentUrl=raw
   else{
    const {data:signed}=await client.storage.from('postula-private').createSignedUrl(raw,60*60)
    currentUrl=String(signed?.signedUrl||'')
   }
   if(alive)apply()
  }

  const copyLiveAvatar=()=>{
   const live=Array.from(document.querySelectorAll<HTMLElement>('.pm42-avatar')).map(x=>unwrapBackground(x.style.backgroundImage)).find(Boolean)
   if(live){currentUrl=live;apply(live)}
  }

  void resolve().catch(()=>copyLiveAvatar())
  const observer=new MutationObserver(()=>{if(currentUrl)apply();else copyLiveAvatar()})
  observer.observe(document.body,{childList:true,subtree:true})

  const onChange=(event:Event)=>{
   const target=event.target as HTMLInputElement|null
   if(!target?.matches('.pm42-workspace input[type="file"][accept*="image"]'))return
   window.setTimeout(()=>void resolve().catch(copyLiveAvatar),900)
   window.setTimeout(()=>void resolve().catch(copyLiveAvatar),2200)
  }
  const onFocus=()=>void resolve().catch(copyLiveAvatar)
  document.addEventListener('change',onChange,true)
  window.addEventListener('focus',onFocus)
  const timer=window.setInterval(()=>void resolve().catch(()=>{}),45*60*1000)

  return()=>{alive=false;observer.disconnect();document.removeEventListener('change',onChange,true);window.removeEventListener('focus',onFocus);window.clearInterval(timer)}
 },[])
 return <style>{`
  .pm42-avatar[data-pm-avatar-ready="1"]{background-color:#eef0f4!important;box-shadow:inset 0 0 0 1px rgba(18,29,38,.08),0 4px 14px rgba(18,29,38,.08)!important}
  .pm42-profile-top .pm42-avatar[data-pm-avatar-ready="1"]{border-radius:50%!important;width:78px!important;height:78px!important;box-shadow:0 0 0 5px #fff,0 12px 28px rgba(20,30,42,.13)!important}
  .pm42-summary-profile .pm42-avatar[data-pm-avatar-ready="1"]{border-radius:50%!important}
 `}</style>
}
