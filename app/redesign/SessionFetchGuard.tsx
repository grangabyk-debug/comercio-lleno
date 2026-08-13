'use client'

import { useEffect } from 'react'
import { isSessionExpiredError, readTenantSession, refreshTenantSession } from '@/lib/comercio/session'

const SUPABASE_HOST = 'wtcntclzcubkbtcsqkzc.supabase.co'

export default function SessionFetchGuard(){
  useEffect(()=>{
    const nativeFetch=window.fetch.bind(window)
    let refreshing:Promise<string>|null=null

    async function freshToken(){
      if(refreshing)return refreshing
      refreshing=(async()=>{
        const session=readTenantSession()
        if(!session)throw new Error('Sesión no disponible')
        const next=await refreshTenantSession(session,true)
        return next.token
      })()
      try{return await refreshing}finally{refreshing=null}
    }

    const guarded:typeof window.fetch=async(input,init)=>{
      const request=new Request(input,init)
      const url=new URL(request.url,location.origin)
      const supabase=url.hostname===SUPABASE_HOST
      const protectedCall=supabase&&(url.pathname.startsWith('/rest/v1/')||url.pathname.startsWith('/functions/v1/'))
      const response=await nativeFetch(request.clone())
      if(!protectedCall||response.status!==401)return response
      try{
        const token=await freshToken()
        const headers=new Headers(request.headers)
        headers.set('Authorization',`Bearer ${token}`)
        return await nativeFetch(new Request(request,{headers}))
      }catch(error){
        if(isSessionExpiredError(error)||/sesión|session|jwt/i.test(error instanceof Error?error.message:String(error))){
          location.replace('/redesign/access?expired=1')
        }
        return response
      }
    }
    window.fetch=guarded
    return()=>{window.fetch=nativeFetch}
  },[])
  return null
}
