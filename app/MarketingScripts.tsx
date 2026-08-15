'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

const googleAdsTag = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-18388928228');`

export default function MarketingScripts(){
  const pathname=usePathname()
  const[enabled,setEnabled]=useState(false)

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search)
    const privateRoute=
      pathname.startsWith('/movil')||
      pathname.startsWith('/redesign')||
      pathname.startsWith('/login')||
      pathname.startsWith('/privacidad')||
      pathname.startsWith('/eliminar-cuenta')||
      (pathname==='/'&&params.get('app')==='1')
    setEnabled(!privateRoute)
  },[pathname])

  if(!enabled)return null
  return <>
    <Script src="https://www.googletagmanager.com/gtag/js?id=AW-18388928228" strategy="afterInteractive"/>
    <Script id="google-ads-tag" strategy="afterInteractive">{googleAdsTag}</Script>
  </>
}
