'use client'

import {useEffect,useState} from 'react'
import {usePathname} from 'next/navigation'
import Script from 'next/script'

type Consent={analytics:boolean;marketing:boolean}
type ClarityFn=(...args:unknown[])=>unknown
const STORAGE_KEY='cl_cookie_consent_v1'

const googleAdsTag=`
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','AW-18388928228');`

const clarityTag=`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script','y23ygnz380');`

function pageId(pathname:string){
  if(pathname==='/')return 'landing'
  if(pathname==='/prueba-gratis')return 'trial-registration'
  if(pathname==='/soluciones')return 'solutions'
  if(pathname.startsWith('/soluciones/'))return `solution-${pathname.split('/').filter(Boolean).pop()||'detail'}`
  return pathname.replace(/^\/+|\/+$/g,'').replace(/[^a-z0-9-]+/gi,'-')||'home'
}

function getOrCreateId(storage:Storage,key:string,prefix:string){
  const existing=storage.getItem(key)
  if(existing)return existing
  const random=typeof crypto!=='undefined'&&'randomUUID' in crypto?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`
  const value=`${prefix}-${random}`
  storage.setItem(key,value)
  return value
}

export default function MarketingScripts(){
  const pathname=usePathname()
  const[prefs,setPrefs]=useState<Consent>({analytics:false,marketing:false})
  const[ready,setReady]=useState(false)

  const privateRoute=pathname.startsWith('/movil')||pathname.startsWith('/redesign')||pathname.startsWith('/login')||pathname.startsWith('/privacidad')||pathname.startsWith('/politica-de-privacidad')||pathname.startsWith('/politica-de-cookies')||pathname.startsWith('/eliminar-cuenta')

  useEffect(()=>{
    try{
      const stored=localStorage.getItem(STORAGE_KEY)
      if(stored)setPrefs(JSON.parse(stored) as Consent)
    }catch{}
    setReady(true)
    const update=(event:Event)=>setPrefs((event as CustomEvent<Consent>).detail)
    window.addEventListener('cl-consent-changed',update)
    return()=>window.removeEventListener('cl-consent-changed',update)
  },[])

  useEffect(()=>{
    const clarity=(window as typeof window & {clarity?:ClarityFn}).clarity
    if(!clarity)return
    clarity('consentv2',{
      ad_Storage:prefs.marketing?'granted':'denied',
      analytics_Storage:prefs.analytics?'granted':'denied',
    })
  },[prefs])

  useEffect(()=>{
    if(!ready||privateRoute)return
    let cancelled=false
    let timer:ReturnType<typeof setTimeout>|undefined
    let attempts=0

    const annotate=()=>{
      if(cancelled)return
      const clarity=(window as typeof window & {clarity?:ClarityFn}).clarity
      if(!clarity){
        if(attempts++<20)timer=setTimeout(annotate,250)
        return
      }
      try{
        const currentPage=pageId(pathname)
        const stage=pathname==='/'?'landing':pathname==='/prueba-gratis'?'trial':'public'

        // Without analytics consent, keep Clarity in cookieless mode and avoid
        // creating our own persistent visitor/session identifiers.
        if(prefs.analytics){
          const anonymousId=getOrCreateId(localStorage,'cl_clarity_anon_id','visitor')
          const sessionId=getOrCreateId(sessionStorage,'cl_clarity_session_id','session')
          clarity('identify',anonymousId,sessionId,currentPage)
        }

        clarity('set','page_path',pathname)
        clarity('set','funnel_stage',stage)
        clarity('event',`page_view_${currentPage}`)
        if(pathname==='/prueba-gratis')clarity('upgrade','trial_registration')
      }catch{}
    }

    annotate()
    return()=>{cancelled=true;if(timer)clearTimeout(timer)}
  },[pathname,privateRoute,prefs.analytics,ready])

  if(!ready||privateRoute)return null
  return <>
    <Script id="microsoft-clarity" strategy="afterInteractive">{clarityTag}</Script>
    <Script id="clarity-consent" strategy="afterInteractive">{`window.clarity&&window.clarity('consentv2',{ad_Storage:'${prefs.marketing?'granted':'denied'}',analytics_Storage:'${prefs.analytics?'granted':'denied'}'});`}</Script>
    {prefs.marketing&&<>
      <Script src="https://www.googletagmanager.com/gtag/js?id=AW-18388928228" strategy="afterInteractive"/>
      <Script id="google-ads-tag" strategy="afterInteractive">{googleAdsTag}</Script>
    </>}
  </>
}
