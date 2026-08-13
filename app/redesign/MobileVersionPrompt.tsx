'use client'

import { useEffect } from 'react'
import { loadMobileSettings,readCachedMobileSettings } from '@/lib/comercio/mobile-settings'
import { readTenantSession } from '@/lib/comercio/session'

export default function MobileVersionPrompt(){
  useEffect(()=>{
    let cancelled=false
    const redirect=async()=>{
      const session=readTenantSession()
      const isPhone=window.matchMedia('(max-width: 760px)').matches
      if(!session||!isPhone||!location.pathname.startsWith('/redesign'))return
      let settings=readCachedMobileSettings(session.companyId)
      try{settings=await loadMobileSettings(session)}catch{}
      if(!cancelled&&settings.autoRedirect)location.replace('/movil')
    }
    const timer=window.setTimeout(()=>void redirect(),80)
    return()=>{cancelled=true;window.clearTimeout(timer)}
  },[])
  return null
}
