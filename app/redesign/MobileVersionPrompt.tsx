'use client'

import { useEffect, useState } from 'react'
import MobileScanner from '../movil/MobileScanner'

/**
 * Mobile safety bridge.
 *
 * The old /movil experience was a preview and never persisted sales. Production
 * users must stay on the real redesign flow, which has the atomic sale write and
 * cash-register guard. We still expose the camera scanner on phones from here so
 * the mobile workflow keeps the useful native feature without leaving production.
 */
export default function MobileVersionPrompt(){
  const [isPhone,setIsPhone]=useState(false)

  useEffect(()=>{
    const media=window.matchMedia('(max-width: 760px)')
    const sync=()=>setIsPhone(media.matches)
    sync()
    media.addEventListener?.('change',sync)
    return()=>media.removeEventListener?.('change',sync)
  },[])

  return isPhone?<MobileScanner/>:null
}
