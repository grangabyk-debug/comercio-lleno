'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BrandLogo from '../BrandLogo'
import TrialSignup from './TrialSignup'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const RESOLVE_FUNCTION = `${SUPABASE_URL}/functions/v1/resolve-google-tenant`
const TRIAL_FUNCTION = `${SUPABASE_URL}/functions/v1/start-trial-google`
const SESSION_KEYS = ['cl_access_token','cl_refresh_token','cl_company_id','cl_company_name','cl_user_role','cl_user_permissions']

type GoogleSession = {
  access_token: string
  refresh_token?: string
  user?: { email?: string; user_metadata?: Record<string, unknown> }
}

function clearTenantSession() {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key))
}

function persistExistingTenant(session: GoogleSession, data: any) {
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
  const [googleSession, setGoogleSession] = useState<GoogleSession | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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
        const session = data.session as GoogleSession | null
        if (!session?.access_token) throw new Error('No pudimos recuperar tu acceso de Google. Volvé a intentarlo.')

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

        if (active) {
          setGoogleSession(session)
          setReady(true)
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : 'No pudimos completar el acceso con Google.')
          setReady(true)
        }
      }
    }

    void resolveGoogleReturn()
    return () => { active = false }
  }, [])

  async function createGoogleCommerce(event: FormEvent) {
    event.preventDefault()
    setErrorMessage('')
    if (!googleSession?.access_token) return setErrorMessage('Volvé a iniciar sesión con Google.')
    if (companyName.trim().length < 2) return setErrorMessage('Ingresá el nombre de tu comercio.')
    if (!accepted) return setErrorMessage('Aceptá los Términos y Condiciones y la Política de Privacidad para continuar.')

    setBusy(true)
    try {
      const response = await fetch(TRIAL_FUNCTION, {
        method: 'POST',
        headers: {
          apikey: PUBLISHABLE_KEY,
          Authorization: `Bearer ${googleSession.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'google',
          company_name: companyName.trim(),
          accepted_terms: true,
          accepted_privacy: true,
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result?.ok) throw new Error(result?.error || 'No pudimos crear tu comercio.')
      persistExistingTenant(googleSession, result)
      window.history.replaceState({}, '', window.location.pathname)
      window.location.replace('/redesign?setup=pending')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos crear tu comercio.')
    } finally {
      setBusy(false)
    }
  }

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

  if (googleSession) {
    const email = String(googleSession.user?.email || '')
    return (
      <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'32px 18px',background:'radial-gradient(circle at 18% 8%,rgba(255,100,29,.18),transparent 35%),radial-gradient(circle at 88% 18%,rgba(109,54,216,.22),transparent 38%),#130d19',color:'#fff'}}>
        <section style={{width:'min(620px,100%)',border:'1px solid rgba(255,255,255,.14)',background:'rgba(255,255,255,.08)',backdropFilter:'blur(24px)',borderRadius:32,padding:'34px clamp(22px,5vw,44px)',boxShadow:'0 28px 80px rgba(0,0,0,.3)'}}>
          <div style={{marginBottom:30}}><BrandLogo size={42}/></div>
          <span style={{display:'inline-block',fontSize:12,fontWeight:900,letterSpacing:'.12em',color:'#ff7b3f',marginBottom:14}}>ÚLTIMO PASO</span>
          <h1 style={{fontSize:'clamp(34px,6vw,54px)',lineHeight:1.02,letterSpacing:'-.045em',margin:'0 0 14px'}}>Bienvenido a<br/>Comercio Lleno.</h1>
          <p style={{fontSize:'clamp(17px,2.2vw,21px)',lineHeight:1.5,color:'rgba(255,255,255,.78)',margin:'0 0 28px'}}>Una última cosa: ¿cómo se llama tu comercio?</p>
          {email && <div style={{fontSize:14,color:'rgba(255,255,255,.58)',marginBottom:18}}>Cuenta de Google: <strong style={{color:'#fff'}}>{email}</strong></div>}
          <form onSubmit={createGoogleCommerce}>
            <label style={{display:'block',fontSize:13,fontWeight:850,marginBottom:9}}>Nombre del comercio</label>
            <input autoFocus value={companyName} onChange={event=>setCompanyName(event.target.value)} placeholder="Ej: Almacén San Martín" maxLength={120} style={{width:'100%',boxSizing:'border-box',border:'1px solid rgba(255,255,255,.2)',background:'rgba(255,255,255,.1)',color:'#fff',borderRadius:18,padding:'17px 18px',fontSize:18,outline:'none',marginBottom:18}}/>
            <div style={{fontSize:12,lineHeight:1.5,color:'rgba(255,255,255,.62)',margin:'0 0 16px',padding:'12px 14px',borderRadius:14,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)'}}>Plan Impulso: 90 días gratis. Incluye 1 sucursal, hasta 1.000 productos y 500 comprobantes ARCA. Después, 3 meses a $14.900/mes y luego $29.800/mes. Ampliaciones opcionales desde $4.900. <Link href="/terminos" target="_blank" style={{color:'#fff',fontWeight:850}}>Ver condiciones.</Link></div>
            <label style={{display:'flex',alignItems:'flex-start',gap:10,fontSize:13,lineHeight:1.45,color:'rgba(255,255,255,.72)',marginBottom:20}}>
              <input type="checkbox" checked={accepted} onChange={event=>setAccepted(event.target.checked)} style={{marginTop:3,width:17,height:17}}/>
              <span>Acepto los <Link href="/terminos" target="_blank" style={{color:'#fff',fontWeight:800}}>Términos y Condiciones</Link> y la <Link href="/politica-de-privacidad" target="_blank" style={{color:'#fff',fontWeight:800}}>Política de Privacidad</Link>.</span>
            </label>
            {errorMessage && <div style={{background:'rgba(220,38,38,.16)',border:'1px solid rgba(248,113,113,.35)',color:'#fecaca',borderRadius:15,padding:'12px 14px',fontSize:14,marginBottom:16}}>{errorMessage}</div>}
            <button disabled={busy} style={{width:'100%',border:0,borderRadius:18,padding:'17px 20px',fontSize:17,fontWeight:950,color:'#fff',background:'linear-gradient(135deg,#ff641d,#ff7f42 58%,#7b42df 150%)',cursor:busy?'wait':'pointer',boxShadow:'0 14px 34px rgba(255,100,29,.22)'}}>{busy?'Creando tu comercio…':'Crear mi comercio e ingresar'}</button>
          </form>
          <p style={{margin:'18px 0 0',fontSize:13,color:'rgba(255,255,255,.52)',textAlign:'center'}}>Tu comercio y la sucursal principal se crean automáticamente.</p>
        </section>
      </main>
    )
  }

  if (errorMessage) {
    return (
      <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#180f22',color:'#fff'}}>
        <div style={{maxWidth:520,textAlign:'center'}}>
          <h1 style={{fontSize:30,marginBottom:12}}>No pudimos completar Google</h1>
          <p style={{opacity:.75,lineHeight:1.5}}>{errorMessage}</p>
          <Link href="/prueba-gratis" style={{display:'inline-block',marginTop:18,color:'#fff',fontWeight:900}}>Volver al registro</Link>
        </div>
      </main>
    )
  }

  return <TrialSignup />
}
