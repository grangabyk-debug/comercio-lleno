'use client'

import { useEffect } from 'react'

export default function MobilePwaInstallBridge(){
  useEffect(()=>{
    const intercept=(event:MouseEvent)=>{
      const target=event.target as HTMLElement|null
      const button=target?.closest?.('button[data-pwa-install="1"]') as HTMLButtonElement|null
      if(!button||button.disabled)return
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      window.location.assign('/instalar')
    }
    window.addEventListener('click',intercept,true)
    return()=>window.removeEventListener('click',intercept,true)
  },[])
  return null
}
