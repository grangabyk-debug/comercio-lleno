'use client'

import {useEffect,useState} from 'react'
import {usePathname} from 'next/navigation'
import Script from 'next/script'

type Consent={analytics:boolean;marketing:boolean}
const STORAGE_KEY='cl_cookie_consent_v1'

const googleAdsTag=`
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','AW-18388928228');`

const clarityTag=`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script','y23ygnz380');`

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
    const clarity=(window as typeof window & {clarity?:((...args:unknown[])=>void)}).clarity
    if(!clarity)return
    clarity('consentv2',{
      ad_Storage:prefs.marketing?'granted':'denied',
      analytics_Storage:prefs.analytics?'granted':'denied',
    })
  },[prefs])

  if(!ready||privateRoute)return null
  return <>
    {prefs.analytics&&<>
      <Script id="microsoft-clarity" strategy="afterInteractive">{clarityTag}</Script>
      <Script id="clarity-consent" strategy="afterInteractive">{`window.clarity&&window.clarity('consentv2',{ad_Storage:'${prefs.marketing?'granted':'denied'}',analytics_Storage:'granted'});`}</Script>
    </>}
    {prefs.marketing&&<>
      <Script src="https://www.googletagmanager.com/gtag/js?id=AW-18388928228" strategy="afterInteractive"/>
      <Script id="google-ads-tag" strategy="afterInteractive">{googleAdsTag}</Script>
    </>}
  </>
}
