'use client'

import { FormEvent, useEffect, useState } from 'react'
import { readTenantSession, signInTenant } from '@/lib/comercio/session'
import { supabase } from '@/lib/supabase'
import BrandLogo from '../../BrandLogo'
import styles from './access.module.css'

function EyeIcon({ open }: { open: boolean }) {
  return open
    ? <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>
    : <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.7 6.6c.43-.07.86-.1 1.3-.1 6.1 0 9.5 5.5 9.5 5.5a17.7 17.7 0 0 1-2.5 3.2M6.6 8.1A17.8 17.8 0 0 0 2.5 12s3.4 5.5 9.5 5.5c1.5 0 2.83-.33 4-.82"/><path d="M9.8 9.8a3.1 3.1 0 0 0 4.4 4.4"/></svg>
}

export default function AccessClient() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [recovery, setRecovery] = useState(false)
  const [recoverySent, setRecoverySent] = useState(false)

  useEffect(() => {
    if (readTenantSession()) window.location.replace('/redesign')
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!identifier.trim() || !password) return
    setBusy(true)
    setError('')
    try {
      await signInTenant(identifier, password)
      window.location.replace('/redesign')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo iniciar sesión.'
      setError(/invalid login credentials/i.test(message) ? 'Usuario, email o contraseña incorrectos.' : message)
    } finally {
      setBusy(false)
    }
  }

  async function sendRecovery(e: FormEvent) {
    e.preventDefault()
    const email = identifier.trim().toLowerCase()
    if (!email.includes('@') || email.endsWith('@staff.comerciolleno.local')) {
      setError('La recuperación por email es para la cuenta del propietario. Si sos empleado, el propietario puede restablecer tu acceso.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redesign/reset-password`,
      })
      if (error) throw error
      setRecoverySent(true)
    } catch {
      // Evita revelar si una dirección está registrada o no.
      setRecoverySent(true)
    } finally {
      setBusy(false)
    }
  }

  return <main className={styles.page}>
    <section className={styles.card}>
      <div className={styles.topline}><BrandLogo size={52} showTagline/><span className={styles.badge}>REDISEÑO V2</span></div>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>COMERCIO LLENO · ACCESO SEGURO</p>
        <h1>{recovery ? 'Recuperá tu contraseña' : 'Entrá a tu comercio'}</h1>
        <p>{recovery ? 'Ingresá el email de la cuenta propietaria. Si existe una cuenta, vas a recibir un enlace para elegir una contraseña nueva.' : 'Propietarios pueden ingresar con su email. Empleados pueden ingresar directamente con el usuario creado por el comercio.'}</p>
      </div>

      {recovery ? <form onSubmit={sendRecovery} className={styles.form}>
        <label>Email del propietario
          <input type="email" value={identifier} onChange={e=>setIdentifier(e.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="tu@email.com" autoFocus/>
        </label>
        {recoverySent && <div className={styles.note}><b>Revisá tu correo.</b> Si ese email está registrado, te enviamos las instrucciones para restablecer la contraseña.</div>}
        {error && <div className={styles.error}>{error}</div>}
        <button className={styles.submitButton} type="submit" disabled={busy || !identifier.trim()}>{busy ? 'Enviando…' : recoverySent ? 'Reenviar instrucciones' : 'Enviar enlace de recuperación'}</button>
        <button type="button" onClick={()=>{setRecovery(false);setRecoverySent(false);setError('')}} style={{border:0,background:'transparent',padding:'8px 0',cursor:'pointer',fontWeight:800,color:'#456356'}}>← Volver al acceso</button>
      </form> : <>
        <form onSubmit={submit} className={styles.form}>
          <label> Email o usuario
            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="tu@email.com o usuario" autoFocus/>
          </label>
          <label>Contraseña
            <div className={styles.passwordField}>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••"/>
              <button type="button" className={styles.eyeButton} onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}><EyeIcon open={showPassword}/></button>
            </div>
          </label>
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.submitButton} type="submit" disabled={busy || !identifier.trim() || !password}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
        </form>
        <button type="button" onClick={()=>{setRecovery(true);setPassword('');setError('')}} style={{border:0,background:'transparent',padding:'10px 0',cursor:'pointer',fontWeight:800,color:'#456356',textDecoration:'underline',textUnderlineOffset:3}}>¿Olvidaste tu contraseña?</button>
      </>}
      {!recovery && <div className={styles.note}><b>Cuenta protegida:</b> cada empleado queda asociado al comercio que lo creó y solo accede a ese <code>company_id</code> y a los permisos de su rol.</div>}
    </section>
  </main>
}
