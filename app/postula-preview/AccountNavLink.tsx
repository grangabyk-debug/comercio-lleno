'use client'

import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

export default function AccountNavLink({audience,className}:{audience:'candidate'|'employer';className?:string}){
 const router=useRouter()
 const loginHref=audience==='candidate'?'/login':'/empresas/login'
 const accountHref=audience==='candidate'?'/mi-cuenta':'/empresas/panel'
 const [href,setHref]=useState(loginHref)
 const [authed,setAuthed]=useState(false)
 const [busy,setBusy]=useState(false)
 const label=audience==='employer'?(authed?'Panel':'Ingresar'):'Mi cuenta'

 useEffect(()=>{
  let alive=true
  const sync=(session:unknown)=>{
   if(!alive)return
   const active=Boolean(session)
   setAuthed(active)
   setHref(active?accountHref:loginHref)
   if(active)router.prefetch(accountHref)
  }
  cvAuthClient().auth.getSession().then(({data})=>sync(data.session)).catch(()=>sync(null))
  const {data:listener}=cvAuthClient().auth.onAuthStateChange((_event,session)=>sync(session))
  return()=>{alive=false;listener.subscription.unsubscribe()}
 },[accountHref,loginHref,router])

 async function logout(){
  if(busy)return
  setBusy(true)
  try{await cvAuthClient().auth.signOut({scope:'local'})}catch{}
  finally{
   setAuthed(false)
   setHref(loginHref)
   location.replace(audience==='employer'?'/empresas':'/')
  }
 }

 return <>
  <Link href={href} prefetch={authed} className={className} onMouseEnter={()=>router.prefetch(href)} onFocus={()=>router.prefetch(href)}>{label}</Link>
  {authed&&<button
   type="button"
   onClick={()=>void logout()}
   disabled={busy}
   aria-label="Cerrar sesión"
   title="Cerrar sesión"
   style={{width:40,height:40,flex:'0 0 40px',display:'grid',placeItems:'center',padding:0,border:'1px solid rgba(122,16,16,.18)',borderRadius:12,background:busy?'#b91c1c':'#e53935',color:'#fff',boxShadow:'0 7px 18px rgba(194,35,35,.22)',cursor:busy?'wait':'pointer',opacity:busy?0.72:1}}
  >
   <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 4H5v16h5"/>
    <path d="M14 8l4 4-4 4"/>
    <path d="M18 12H9"/>
   </svg>
  </button>}
 </>
}
