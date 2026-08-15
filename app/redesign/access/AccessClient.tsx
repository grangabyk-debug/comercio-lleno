'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { readTenantSession, signInTenant } from '@/lib/comercio/session'
import { supabase } from '@/lib/supabase'
import BrandLogo from '../../BrandLogo'
import styles from './access.module.css'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const loginPhoto='https://images.pexels.com/photos/16837409/pexels-photo-16837409.jpeg?auto=compress&cs=tinysrgb&w=1800'

function EyeIcon({ open }: { open: boolean }) {
  return open
    ? <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>
    : <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.7 6.6c.43-.07.86-.1 1.3-.1 6.1 0 9.5 5.5 9.5 5.5a17.7 17.7 0 0 1-2.5 3.2M6.6 8.1A17.8 17.8 0 0 0 2.5 12s3.4 5.5 9.5 5.5c1.5 0 2.83-.33 4-.82"/><path d="M9.8 9.8a3.1 3.1 0 0 0 4.4 4.4"/></svg>
}
function GoogleMark(){return <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.13 1.04 4.55l3.35-2.62Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"/></svg>}

async function finishGoogleSession(accessToken:string,refreshToken:string){
  const authUser=await supabase.auth.getUser(accessToken)
  const userId=authUser.data.user?.id
  if(!userId)throw new Error('No se pudo identificar tu cuenta de Google.')
  const profileResponse=await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=company_id,role,permissions,active&limit=1`,{headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${accessToken}`},cache:'no-store'})
  const profiles=await profileResponse.json().catch(()=>[]);const profile=Array.isArray(profiles)?profiles[0]:null
  if(!profileResponse.ok||!profile?.company_id)throw new Error('Esta cuenta de Google todavía no tiene un comercio asociado.')
  if(profile.active===false)throw new Error('Este usuario está desactivado.')
  const companyResponse=await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(profile.company_id)}&select=id,name&limit=1`,{headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${accessToken}`},cache:'no-store'})
  const companies=await companyResponse.json().catch(()=>[]);const company=Array.isArray(companies)?companies[0]:null
  if(!companyResponse.ok||!company?.id)throw new Error('No se pudo cargar el comercio asociado.')
  localStorage.setItem('cl_access_token',accessToken);if(refreshToken)localStorage.setItem('cl_refresh_token',refreshToken);localStorage.setItem('cl_company_id',String(company.id));localStorage.setItem('cl_company_name',String(company.name||'Mi comercio'));localStorage.setItem('cl_user_role',String(profile.role||'owner'));localStorage.setItem('cl_user_permissions',JSON.stringify(profile.permissions||{}))
}

export default function AccessClient() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [googleBusy,setGoogleBusy]=useState(false)
  const [recovery, setRecovery] = useState(false)
  const [recoverySent, setRecoverySent] = useState(false)

  useEffect(() => {
    if (readTenantSession()) { window.location.replace('/redesign'); return }
    const params=new URLSearchParams(window.location.search)
    if(params.get('google')!=='1')return
    setGoogleBusy(true)
    void supabase.auth.getSession().then(async({data,error})=>{
      if(error)throw error
      if(!data.session?.access_token)throw new Error('No se pudo completar el ingreso con Google.')
      await finishGoogleSession(data.session.access_token,data.session.refresh_token||'')
      window.location.replace('/redesign')
    }).catch(e=>{
      const message=e instanceof Error?e.message:String(e)
      setError(message)
      window.history.replaceState({},'',window.location.pathname)
    }).finally(()=>setGoogleBusy(false))
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault();if (!identifier.trim() || !password) return;setBusy(true);setError('')
    try { await signInTenant(identifier, password);window.location.replace('/redesign') }
    catch (e) { const message = e instanceof Error ? e.message : 'No se pudo iniciar sesión.';setError(/invalid login credentials/i.test(message) ? 'Usuario, email o contraseña incorrectos.' : message) }
    finally { setBusy(false) }
  }

  async function startGoogle(){
    setError('');setGoogleBusy(true)
    try{const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${window.location.origin}/redesign/access?google=1`,queryParams:{prompt:'select_account'}}});if(error)throw error}
    catch(e){const message=e instanceof Error?e.message:String(e);setError(/provider|unsupported|not enabled/i.test(message)?'Google todavía no está habilitado en la configuración de acceso del proyecto.':message);setGoogleBusy(false)}
  }

  async function sendRecovery(e: FormEvent) {
    e.preventDefault();const email = identifier.trim().toLowerCase()
    if (!email.includes('@') || email.endsWith('@staff.comerciolleno.local')) {setError('La recuperación por email es para la cuenta del propietario. Si sos empleado, el propietario puede restablecer tu acceso.');return}
    setBusy(true);setError('')
    try { const { error } = await supabase.auth.resetPasswordForEmail(email, {redirectTo: `${window.location.origin}/redesign/reset-password`});if (error) throw error;setRecoverySent(true) }
    catch { setRecoverySent(true) }
    finally { setBusy(false) }
  }

  return <main className={styles.page}>
    <section className={styles.shell}>
      <aside className={styles.visual}>
        <img src={loginPhoto} alt="Comerciante latinoamericana detrás del mostrador"/><div className={styles.visualShade}/>
        <div className={styles.visualCopy}><span>TU NEGOCIO, EN MARCHA</span><h2>Entrá. Vendé.<br/>Seguí con tu día.</h2><p>Ventas, stock, caja, facturación y asistencia inteligente desde el mismo lugar.</p></div>
        <div className={styles.visualFoot}><span>Web + Android</span><span>ARCA</span><span>IA integrada</span></div>
      </aside>

      <section className={styles.card}>
        <div className={styles.topline}><BrandLogo size={44} showTagline/><span className={styles.badge}>ACCESO</span></div>
        <div className={styles.copy}><p className={styles.eyebrow}>COMERCIO LLENO</p><h1>{recovery ? 'Recuperá tu contraseña' : 'Entrá a tu comercio'}</h1><p>{recovery ? 'Ingresá el email de la cuenta propietaria. Si existe una cuenta, vas a recibir un enlace para elegir una contraseña nueva.' : 'Ingresá con Google, con tu email de propietario o con el usuario que te asignaron.'}</p></div>

        {recovery ? <form onSubmit={sendRecovery} className={styles.form}>
          <label>Email del propietario<input type="email" value={identifier} onChange={e=>setIdentifier(e.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="tu@email.com" autoFocus/></label>
          {recoverySent && <div className={styles.note}><b>Revisá tu correo.</b> Si ese email está registrado, te enviamos las instrucciones para restablecer la contraseña.</div>}{error && <div className={styles.error}>{error}</div>}
          <button className={styles.submitButton} type="submit" disabled={busy || !identifier.trim()}>{busy ? 'Enviando…' : recoverySent ? 'Reenviar instrucciones' : 'Enviar enlace de recuperación'}</button>
          <button type="button" onClick={()=>{setRecovery(false);setRecoverySent(false);setError('')}} className={styles.textButton}>← Volver al acceso</button>
        </form> : <>
          <button className={styles.googleButton} type="button" onClick={()=>void startGoogle()} disabled={googleBusy||busy}><GoogleMark/><span>{googleBusy?'Abriendo Google…':'Continuar con Google'}</span></button>
          <div className={styles.divider}><span>o ingresá con tu contraseña</span></div>
          <form onSubmit={submit} className={styles.form}>
            <label>Email o usuario<input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="tu@email.com o usuario" autoFocus/></label>
            <label>Contraseña<div className={styles.passwordField}><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••"/><button type="button" className={styles.eyeButton} onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}><EyeIcon open={showPassword}/></button></div></label>
            {error && <div className={styles.error}>{error}{/no tiene un comercio asociado/i.test(error)&&<div className={styles.errorLink}><Link href="/prueba-gratis">Crear prueba gratis con Google</Link></div>}</div>}
            <button className={styles.submitButton} type="submit" disabled={busy || googleBusy || !identifier.trim() || !password}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
          </form>
          <button type="button" onClick={()=>{setRecovery(true);setPassword('');setError('')}} className={styles.textButton}>¿Olvidaste tu contraseña?</button>
        </>}
        {!recovery && <div className={styles.note}><b>Acceso por comercio.</b> Cada usuario entra solamente a la cuenta y a las funciones que le corresponden.</div>}
      </section>
    </section>
  </main>
}
