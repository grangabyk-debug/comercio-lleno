'use client'

import {useEffect,useRef,useState} from 'react'
import {usePathname,useRouter} from 'next/navigation'

const CORE_ROUTES=['/mejorar-cv','/empleos','/servicios-flex']

function labelFor(pathname:string){
 if(pathname.startsWith('/mejorar-cv'))return'Abriendo Mejorar CV…'
 if(pathname.startsWith('/empleos'))return'Cargando empleos…'
 if(pathname.startsWith('/servicios-flex'))return'Cargando Servicios Flex…'
 if(pathname.startsWith('/mensajes'))return'Abriendo mensajes…'
 if(pathname.startsWith('/mi-cuenta'))return'Abriendo tu cuenta…'
 if(pathname.startsWith('/empresas'))return'Abriendo Empresas…'
 return'Cargando…'
}

function sameOriginHref(anchor:HTMLAnchorElement){
 try{
  const url=new URL(anchor.href,window.location.href)
  if(url.origin!==window.location.origin)return null
  return url
 }catch{return null}
}

const css=`
.pm-nav-progress{position:fixed;left:0;right:0;top:0;height:3px;z-index:2147483000;overflow:hidden;background:rgba(105,87,255,.16);pointer-events:none}
.pm-nav-progress::after{content:"";position:absolute;inset:0;width:42%;background:linear-gradient(90deg,#6957ff,#a88cff,#d8ff4f);animation:pmNavProgress 1s ease-in-out infinite;transform:translateX(-120%)}
.pm-nav-toast{position:fixed;left:50%;bottom:24px;z-index:2147483000;transform:translateX(-50%);display:flex;align-items:center;gap:9px;max-width:calc(100vw - 28px);padding:10px 14px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(17,20,27,.94);color:#fff;box-shadow:0 16px 44px rgba(0,0,0,.24);backdrop-filter:blur(14px);font:800 12px/1.2 Inter,system-ui,sans-serif;letter-spacing:-.01em;pointer-events:none}
.pm-nav-toast i{width:8px;height:8px;flex:0 0 8px;border-radius:50%;background:#d8ff4f;box-shadow:0 0 0 5px rgba(216,255,79,.12);animation:pmNavPulse .9s ease-in-out infinite alternate}
@keyframes pmNavProgress{0%{transform:translateX(-120%)}65%{transform:translateX(170%)}100%{transform:translateX(260%)}}
@keyframes pmNavPulse{to{transform:scale(.72);opacity:.72}}
@media(max-width:760px){.pm-nav-toast{bottom:86px;padding:9px 12px;font-size:11px}}
@media(prefers-reduced-motion:reduce){.pm-nav-progress::after,.pm-nav-toast i{animation:none}.pm-nav-progress::after{width:70%;transform:none}}
`

export default function PostulaNavigationExperience(){
 const router=useRouter()
 const pathname=usePathname()
 const warmed=useRef(new Set<string>())
 const stopTimer=useRef<number|null>(null)
 const [busy,setBusy]=useState(false)
 const [label,setLabel]=useState('Cargando…')

 useEffect(()=>{
  setBusy(false)
  if(stopTimer.current!==null){window.clearTimeout(stopTimer.current);stopTimer.current=null}
 },[pathname])

 useEffect(()=>{
  const prefetch=(href:string)=>{
   if(warmed.current.has(href))return
   warmed.current.add(href)
   try{router.prefetch(href)}catch{}
  }
  const warmCore=()=>{
   const connection=(navigator as any).connection
   if(connection?.saveData||/2g/i.test(String(connection?.effectiveType||'')))return
   if(pathname==='/'||pathname==='/empresas')CORE_ROUTES.forEach(prefetch)
  }
  const w=window as any
  let idleId:number|undefined
  let timer:number|undefined
  if(typeof w.requestIdleCallback==='function')idleId=w.requestIdleCallback(warmCore,{timeout:1800})
  else timer=window.setTimeout(warmCore,800)

  const onIntent=(event:Event)=>{
   const target=event.target
   if(!(target instanceof Element))return
   const anchor=target.closest('a[href]') as HTMLAnchorElement|null
   if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return
   const url=sameOriginHref(anchor)
   if(!url||url.pathname===location.pathname&&url.search===location.search)return
   prefetch(`${url.pathname}${url.search}`)
  }
  document.addEventListener('pointerover',onIntent,{passive:true})
  document.addEventListener('focusin',onIntent)
  return()=>{
   if(idleId!==undefined&&typeof w.cancelIdleCallback==='function')w.cancelIdleCallback(idleId)
   if(timer!==undefined)window.clearTimeout(timer)
   document.removeEventListener('pointerover',onIntent)
   document.removeEventListener('focusin',onIntent)
  }
 },[pathname,router])

 useEffect(()=>{
  const onClick=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return
   const target=event.target
   if(!(target instanceof Element))return
   const anchor=target.closest('a[href]') as HTMLAnchorElement|null
   if(!anchor||anchor.target&&anchor.target!=='_self'||anchor.hasAttribute('download'))return
   const url=sameOriginHref(anchor)
   if(!url)return
   const current=`${location.pathname}${location.search}`
   const next=`${url.pathname}${url.search}`
   if(next===current)return
   setLabel(labelFor(url.pathname))
   setBusy(true)
   if(stopTimer.current!==null)window.clearTimeout(stopTimer.current)
   stopTimer.current=window.setTimeout(()=>setBusy(false),10000)
  }
  document.addEventListener('click',onClick,true)
  return()=>document.removeEventListener('click',onClick,true)
 },[])

 return <><style>{css}</style>{busy&&<><div className="pm-nav-progress" aria-hidden="true"/><div className="pm-nav-toast" role="status" aria-live="polite"><i aria-hidden="true"/><span>{label}</span></div></>}</>
}
