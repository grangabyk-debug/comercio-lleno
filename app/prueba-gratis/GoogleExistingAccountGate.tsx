'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import TrialSignup from './TrialSignup'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const RESOLVE_FUNCTION = `${SUPABASE_URL}/functions/v1/resolve-google-tenant`
const SESSION_KEYS = ['cl_access_token','cl_refresh_token','cl_company_id','cl_company_name','cl_user_role','cl_user_permissions']

function clearTenantSession() {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key))
}

function persistExistingTenant(session: any, data: any) {
  clearTenantSession()
  localStorage.setItem('cl_access_token', session.access_token)
  if (session.refresh_token) localStorage.setItem('cl_refresh_token', session.refresh_token)
  localStorage.setItem('cl_company_id', String(data.company_id || ''))
  localStorage.setItem('cl_company_name', String(data.company_name || 'Mi comercio'))
  localStorage.setItem('cl_user_role', String(data.role || 'owner'))
  localStorage.setItem('cl_user_permissions', JSON.stringify(data.permissions || {}))
}

export default function GoogleExistingAccountGate() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function resolveGoogleReturn() {
      const params = new URLSearchParams(window.location.search)
      if (params.get('google') !== '1') {
        if (active) setReady(true)
        return
      }

      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        const session = data.session
        if (!session?.access_token) {
          if (active) setReady(true)
          return
        }

        const response = await fetch(RESOLVE_FUNCTION, {
          method: 'POST',
          headers: {
            apikey: PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: '{}',
        })
        const result = await response.json().catch(() => ({}))

        if (response.ok && result?.ok && result?.existing) {
          persistExistingTenant(session, result)
          window.history.replaceState({}, '', window.location.pathname)
          window.location.replace('/redesign')
          return
        }
      } catch {
        // Si no se puede resolver como cuenta existente, el alta normal
        // conserva su manejo de errores y permite continuar con Google.
      }

      if (active) setReady(true)
    }

    void resolveGoogleReturn()
    return () => { active = false }
  }, [])

  if (!ready) {
    return (
      <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#180f22',color:'#fff',fontFamily:'inherit'}}>
        <div style={{textAlign:'center',padding:24}}>
          <strong style={{display:'block',fontSize:22,marginBottom:8}}>Conectando tu cuenta de Google…</strong>
          <span style={{opacity:.72,fontSize:14}}>Estamos verificando si ya tenés un comercio creado.</span>
        </div>
      </main>
    )
  }

  return <TrialSignup />
}
