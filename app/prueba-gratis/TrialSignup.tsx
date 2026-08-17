'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { signInTenant } from '@/lib/comercio/session'
import BrandLogo from '../BrandLogo'
import TurnstileWidget from './TurnstileWidget'
import styles from './trial.module.css'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const TRIAL_FUNCTION = `${SUPABASE_URL}/functions/v1/start-trial-turnstile`
const MONTHLY_PRICE = 14900
const monthlyPrice = new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(MONTHLY_PRICE)
const SESSION_KEYS=['cl_access_token','cl_refresh_token','cl_company_id','cl_company_name','cl_user_role','cl_user_permissions']
const strong=(value:string)=>value.length>=8&&/[A-Z]/.test(value)&&/\d/.test(value)&&/[^A-Za-z0-9]/.test(value)

function GoogleMark(){
  return <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.13 1.04 4.55l3.35-2.62Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"/></svg>
}

function EyeIcon({open}:{open:boolean}){
  return open
    ? <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>
    : <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.7 6.6c.43-.07.86-.1 1.3-.1 6.1 0 9.5 5.5 9.5 5.5a17.7 17.7 0 0 1-2.5 3.2M6.6 8.1A17.8 17.8 0 0 0 2.5 12s3.4 5.5 9.5 5.5c1.5 0 2.83-.33 4-.82"/><path d="M9.8 9.8a3.1 3.1 0 0 0 4.4 4.4"/></svg>
}

function clearPreviousTenantSession(){if(typeof window!=='undefined')SESSION_KEYS.forEach(key=>localStorage.removeItem(key))}

export default function TrialSignup(){
  const[fullName,setFullName]=useState('')
  const[email,setEmail]=useState('')
  const[password,setPassword]=useState('')
  const[showPassword,setShowPassword]=useState(false)
  const[companyName,setCompanyName]=useState('')
  const[accepted,setAccepted]=useState(false)
  const[busy,setBusy]=useState(false)
  const[googleBusy,setGoogleBusy]=useState(false)
  const[error,setError]=useState('')
  const[success,setSuccess]=useState('')
  const[turnstileToken,setTurnstileToken]=useState('')
  const[turnstileReset,setTurnstileReset]=useState(0)

  async function startGoogle(){
    setError('');setGoogleBusy(true)
    try{
      const redirectTo=`${window.location.origin}/prueba-gratis?google=1`
      const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo,queryParams:{prompt:'select_account'}}})
      if(error)throw error
    }catch(e){
      const message=e instanceof Error?e.message:String(e)
      setError(/provider|unsupported|not enabled/i.test(message)?'El acceso con Google todavía no está disponible. Podés registrarte con email.':message)
      setGoogleBusy(false)
    }
  }

  function validateCommon(){
    if(!companyName.trim()){setError('Ingresá el nombre de tu comercio.');return false}
    if(!accepted){setError('Para registrarte tenés que aceptar los Términos y Condiciones y la Política de Privacidad.');return false}
    if(!turnstileToken){setError('Completá la verificación de seguridad para continuar.');return false}
    return true
  }

  async function submit(e:FormEvent){
    e.preventDefault();setError('')
    if(!fullName.trim()||!email.trim()||!companyName.trim()){setError('Completá tu nombre, email y nombre del comercio.');return}
    if(!strong(password)){setError('La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un signo especial.');return}
    if(!validateCommon())return
    setBusy(true)
    try{
      const response=await fetch(TRIAL_FUNCTION,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({full_name:fullName.trim(),company_name:companyName.trim(),email:email.trim().toLowerCase(),password,website:'',turnstile_token:turnstileToken,accepted_terms:true,accepted_privacy:true})})
      const data=await response.json().catch(()=>({}))
      if(!response.ok||!data?.ok)throw new Error(data?.error||'No se pudo crear la prueba gratuita.')
      setSuccess('Listo. Tus 90 días gratis ya están activos. Entrando al sistema…');clearPreviousTenantSession()
      try{await signInTenant(email,password);location.replace('/redesign?setup=pending')}catch{setTimeout(()=>location.replace('/redesign/access'),700)}
    }catch(e){
      setError(e instanceof Error?e.message:String(e))
      setTurnstileToken('')
      setTurnstileReset(value=>value+1)
    }finally{setBusy(false)}
  }

  return <main className={styles.page}>
    <header className={styles.top}>
      <Link className={styles.brand} href="/" aria-label="Comercio Lleno"><BrandLogo size={42}/></Link>
      <Link className={styles.login} href="/redesign/access">Ya tengo una cuenta</Link>
    </header>

    <section className={styles.layout}>
      <div className={styles.copy}>
        <div className={styles.eyebrow}>PLAN IMPULSO · 3 MESES GRATIS · SIN TARJETA</div>
        <h1>Tu comercio listo<br/><span>en menos de un minuto.</span></h1>
        <p className={styles.lead}>Creá tu cuenta y usá Comercio Lleno completo durante 90 días por $0. Después, seguí por {monthlyPrice} por mes.</p>
        <div className={styles.simpleSteps}>
          <div><b>01</b><span><strong>Creá tu acceso</strong><small>Google o email. Sin formularios eternos.</small></span></div>
          <div><b>02</b><span><strong>Decinos cómo se llama tu comercio</strong><small>Nosotros preparamos el resto para arrancar.</small></span></div>
          <div><b>03</b><span><strong>Usalo 90 días gratis</strong><small>ARCA, empleados, dirección y datos fiscales se completan después.</small></span></div>
        </div>
        <div className={styles.mobilePromise}><span>DESDE CUALQUIER LUGAR</span><strong>También podés manejar tu comercio desde el celular.</strong><small>Ventas, productos, stock, caja y seguimiento del negocio con una experiencia pensada para pantalla chica.</small></div>
        <div className={styles.price}><div><b>$0</b><span>/ 90 días</span></div><p>Después {monthlyPrice} por mes. Cancelás cuando quieras.</p></div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}><div><span>REGISTRO SIMPLE</span><h2>Activá tus 3 meses gratis</h2><p>Lo demás lo configurás cuando quieras.</p></div><div className={styles.timeBadge}>1 PASO</div></div>

        <button type="button" className={styles.googleButton} onClick={()=>void startGoogle()} disabled={googleBusy||busy}><GoogleMark/><span>{googleBusy?'Abriendo Google…':'Continuar con Google'}</span></button>
        <p className={styles.googleHint}>Google completa tu nombre y email. Después sólo elegís el nombre del comercio.</p>
        <div className={styles.divider}><span>o registrate con email</span></div>

        <form className={styles.form} onSubmit={submit}>
          <div className={styles.fieldGrid}><label className={styles.label}>Tu nombre<input className={styles.input} autoComplete="name" required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Nombre y apellido"/></label><label className={styles.label}>Email<input className={styles.input} autoComplete="email" required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vos@comercio.com"/></label></div>
          <label className={styles.label}>Nombre del comercio<input className={styles.input} required value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="Ej: Almacén San Martín"/></label>
          <label className={styles.label}>Contraseña<div className={styles.passwordWrap}><input className={styles.input} autoComplete="new-password" required type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Ej: Comercio#2026"/><button type="button" className={styles.eye} onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?'Ocultar contraseña':'Mostrar contraseña'}><EyeIcon open={showPassword}/></button></div><small className={strong(password)?styles.goodHint:styles.hint}>8+ caracteres, mayúscula, número y signo.</small></label>
          <TurnstileWidget onToken={setTurnstileToken} resetSignal={turnstileReset}/>
          <label className={styles.terms}><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>Acepto los <Link href="/terminos" target="_blank">Términos y Condiciones</Link> y la <Link href="/politica-de-privacidad" target="_blank">Política de Privacidad</Link>.</span></label>
          {error&&<div className={styles.error}>{error}</div>}{success&&<div className={styles.success}>{success}</div>}
          <button className={styles.button} disabled={busy||googleBusy}>{busy?'Creando tu comercio…':'Activar 3 meses gratis'}</button>
          <p className={styles.afterNote}>Después podés completar CUIT, dirección, facturación ARCA, empleados y sucursales desde Configuración.</p>
        </form>
      </div>
    </section>
  </main>
}
