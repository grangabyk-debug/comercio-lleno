'use client'

import { FormEvent, useEffect, useState } from 'react'
import { readTenantSession, signInTenant } from '@/lib/comercio/session'
import styles from './access.module.css'

export default function AccessClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (readTenantSession()) window.location.replace('/redesign')
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setBusy(true)
    setError('')
    try {
      await signInTenant(email, password)
      window.location.replace('/redesign')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.')
    } finally {
      setBusy(false)
    }
  }

  return <main className={styles.page}>
    <section className={styles.card}>
      <div className={styles.topline}><span className={styles.logo}>CL</span><span className={styles.badge}>REDISEÑO V2</span></div>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>COMERCIO LLENO · PILOTO NUEVO</p>
        <h1>Entrá al sistema rediseñado</h1>
        <p>Este acceso queda dentro del preview nuevo y no te devuelve a la interfaz anterior.</p>
      </div>
      <form onSubmit={submit} className={styles.form}>
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="tu@email.com" /></label>
        <label>Contraseña<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" /></label>
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit" disabled={busy || !email.trim() || !password}>{busy ? 'Ingresando…' : 'Abrir Rediseño V2'}</button>
      </form>
      <div className={styles.note}><b>Importante:</b> este login usa Supabase real y conserva el aislamiento multi-tenant por comercio.</div>
    </section>
  </main>
}
