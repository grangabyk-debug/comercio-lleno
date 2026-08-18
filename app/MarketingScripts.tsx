'use client'

import {useEffect} from 'react'
import {usePathname} from 'next/navigation'
import Script from 'next/script'

type ClarityFn=(...args:unknown[])=>unknown

const googleAdsTag=`
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
  ad_storage:'denied',
  analytics_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied'
});
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

export default function MarketingScripts(){
  const pathname=usePathname()
  const privateRoute=pathname.startsWith('/movil')||pathname.startsWith('/redesign')||pathname.startsWith('/login')||pathname.startsWith('/privacidad')||pathname.startsWith('/politica-de-privacidad')||pathname.startsWith('/politica-de-cookies')||pathname.startsWith('/eliminar-cuenta')||pathname.startsWith('/cv-ia')

  useEffect(()=>{
    if(privateRoute)return
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
        clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'})
        const currentPage=pageId(pathname)
        const stage=pathname==='/'?'landing':pathname==='/prueba-gratis'?'trial':'public'
        clarity('set','page_path',pathname)
        clarity('set','funnel_stage',stage)
        clarity('event',`page_view_${currentPage}`)
        if(pathname==='/prueba-gratis')clarity('upgrade','trial_registration')
      }catch{}
    }

    annotate()
    return()=>{cancelled=true;if(timer)clearTimeout(timer)}
  },[pathname,privateRoute])

  if(privateRoute)return null
  return <>
    <Script id="microsoft-clarity" strategy="afterInteractive">{clarityTag}</Script>
    <Script id="clarity-cookieless" strategy="afterInteractive">{`window.clarity&&window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'});`}</Script>
    <Script src="https://www.googletagmanager.com/gtag/js?id=AW-18388928228" strategy="afterInteractive"/>
    <Script id="google-ads-tag" strategy="afterInteractive">{googleAdsTag}</Script>
  </>
}
