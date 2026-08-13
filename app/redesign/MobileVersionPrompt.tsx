'use client'

import { useEffect } from 'react'
import { readTenantSession } from '@/lib/comercio/session'

export default function MobileVersionPrompt(){
  useEffect(()=>{
    const redirect=()=>{
      const session=readTenantSession()
      const isPhone=window.matchMedia('(max-width: 760px)').matches
      if(session&&isPhone&&location.pathname.startsWith('/redesign'))location.replace('/movil')
    }
    const timer=window.setTimeout(redirect,80)
    return()=>window.clearTimeout(timer)
  },[])
  return null
}
