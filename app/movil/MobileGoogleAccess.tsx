'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase'

const SUPABASE_URL = 'https://comerciolleno.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const RESOLVE_FUNCTION = `${SUPABASE_URL}/functions/v1/resolve-google-tenant`
const SESSION_KEYS = ['cl_access_token','cl_refresh_token','cl_company_id','cl_company_name','cl_user_role','cl_user_permissions']

function GoogleMark(){
  return <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.13 1.04 4.55l3.35-2.62Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"/></svg>
}

function persistTenant(session:any,data:any){
  SESSION_KEYS.forEach(key=>localStorage.removeItem(key))
  localStorage.setItem('cl_access_token',String(session.access_token||''))
  if(session.refresh_token)localStorage.setItem('cl_refresh_token',String(session.refresh_token))
  localStorage.setItem('cl_company_id',String(data.company_id||''))
  localStorage.setItem('cl_company_name',String(data.company_name||'Mi comercio'))
  localStorage.setItem('cl_user_role',String(data.role||'owner'))
  localStorage.setItem('cl_user_permissions',JSON.stringify(data.permissions||{}))
}

export default function MobileGoogleAccess(){
  const [host,setHost]=useState<HTMLElement|null>(null)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')

  useEffect(()=>{
    let active=true
    let observer:MutationObserver|null=null

    async function resolveReturn(){
      const params=new URLSearchParams(window.location.search)
      if(params.get('google')!=='1')return false
      setBusy(true)
      try{
        const {data,error}=await supabase.auth.getSession()
        if(error)throw error
        const auth=data.session
        if(!auth?.access_token)throw new Error('No se pudo completar el acceso con Google.')
        const response=await fetch(RESOLVE_FUNCTION,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${auth.access_token}`,'Content-Type':'application/json'},body:'{}'})
        const result=await response.json().catch(()=>({}))
        if(response.ok&&result?.ok&&result?.existing){
          persistTenant(auth,result)
          window.location.replace('/movil')
          return true
        }
        window.location.replace('/prueba-gratis?google=1')
        return true
      }catch(e){
        if(active)setError(e instanceof Error?e.message:String(e))
        window.history.replaceState({},'',window.location.pathname)
        return false
      }finally{if(active)setBusy(false)}
    }

    function attach(){
      const form=document.querySelector('main[class*="loginScreen"] div[class*="loginCard"] form')
      if(!form||form.previousElementSibling?.classList.contains('cl-mobile-google-slot'))return Boolean(form)
      const slot=document.createElement('div')
      slot.className='cl-mobile-google-slot'
      form.parentElement?.insertBefore(slot,form)
      if(active)setHost(slot)
      return true
    }

    void resolveReturn().then(redirecting=>{
      if(redirecting||!active)return
      if(attach())return
      observer=new MutationObserver(()=>{if(attach())observer?.disconnect()})
      observer.observe(document.body,{childList:true,subtree:true})
    })

    return()=>{active=false;observer?.disconnect()}
  },[])

  async function startGoogle(){
    setError('');setBusy(true)
    try{
      const redirectTo=`${window.location.origin}/movil?google=1`
      const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo,queryParams:{prompt:'select_account'}}})
      if(error)throw error
    }catch(e){setError(e instanceof Error?e.message:String(e));setBusy(false)}
  }

  if(!host)return null
  return createPortal(<div style={{margin:'0 0 16px'}}>
    <button type="button" onClick={()=>void startGoogle()} disabled={busy} style={{width:'100%',height:48,border:'1px solid #d9e1dc',borderRadius:13,background:'#fff',color:'#202623',fontSize:13,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:10,cursor:busy?'default':'pointer',opacity:busy?.72:1}}><GoogleMark/><span>{busy?'Conectando con Google…':'Continuar con Google'}</span></button>
    {error&&<div style={{marginTop:9,padding:'8px 10px',borderRadius:9,background:'#fff0f0',color:'#aa3d3d',fontSize:9}}>{error}</div>}
    <div style={{display:'flex',alignItems:'center',gap:9,margin:'14px 0 2px',color:'#8a958e',fontSize:9,fontWeight:800}}><span style={{height:1,background:'#e4e9e6',flex:1}}/><span>o ingresá con contraseña</span><span style={{height:1,background:'#e4e9e6',flex:1}}/></div>
  </div>,host)
}
