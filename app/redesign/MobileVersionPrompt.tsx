'use client'

import { useEffect } from 'react'

/**
 * The desktop/redesign dashboard and the dedicated mobile app are intentionally
 * separate experiences. If a phone (or a real mobile-width preview) lands on
 * /redesign, send it to /movil instead of squeezing the desktop dashboard into a
 * narrow viewport. The /movil route owns the mobile scanner and mobile UI.
 */
export default function MobileVersionPrompt(){
  useEffect(()=>{
    const media=window.matchMedia('(max-width: 760px)')
    const redirectToMobile=()=>{
      if(!media.matches)return
      if(window.location.pathname==='/movil')return
      window.location.replace('/movil')
    }
    redirectToMobile()
    media.addEventListener?.('change',redirectToMobile)
    return()=>media.removeEventListener?.('change',redirectToMobile)
  },[])

  return null
}
