'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { signInTenant } from '@/lib/comercio/session'
import BrandLogo from '../BrandLogo'
import styles from './trial.module.css'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const MONTHLY_PRICE = 14900
const price = new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(MONTHLY_PRICE)
const TENANT_SESSION_KEYS = ['cl_access_token','cl_refresh_token','cl_company_id','cl_company_name','cl_user_role','cl_user_permissions']

function clearPreviousTenantSession() {
  if (typeof window === 'undefined') return
  TENANT_SESSION_KEYS.forEach(key => window.localStorage.removeItem(key))
}

export default function TrialSignup() {
  const [fullName,setFullName]=useState('')
  const [companyName,setCompanyName]=useState('')
  const [email,setEmail]=useState('')
  const [phone,setPhone]=useState('')
  const [password,setPassword]=useState('')
  const [website,setWebsite]=useState('')
  const [accepted,setAccepted]=useState(false)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [success,setSuccess]=useState('')

  async function submit(e:FormEvent){
    e.preventDefault()
    if(!accepted){setError('Tenés que aceptar las condiciones de la prueba gratuita.');return}
    setBusy(true);setError('');setSuccess('')
    try{
      const response=await fetch(`${SUPABASE_URL}/functions/v1/start-trial`,{
        method:'POST',
        headers:{apikey:PUBLISHABLE_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({full_name:fullName,company_name:companyName,email,phone,password,website}),
      })
      const data=await response.json().catch(()=>({}))
      if(!response.ok||!data?.ok)throw new Error(data?.error||'No se pudo crear la prueba gratuita.')
      const end=data?.trial_ends_at?new Date(data.trial_ends_at).toLocaleDateString('es-AR'):'dentro de 14 días'
      setSuccess(`Listo. Tu prueba está activa hasta ${end}. Entrando al sistema…`)

      // Si el alta se hace desde un equipo que ya tenía otro comercio abierto,
      // eliminamos únicamente la sesión anterior antes de iniciar la nueva.
      // Los datos/cachés de cada comercio siguen separados por company_id.
      clearPreviousTenantSession()

      try{
        await signInTenant(email,password)
        window.location.replace('/redesign')
      }catch{
        window.setTimeout(()=>window.location.replace('/redesign/access'),900)
      }
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy(false)}
  }

  return <main className={styles.page}>
    <header className={styles.top}>
      <Link className={styles.brand} href="/" aria-label="Comercio Lleno"><BrandLogo size={44}/></Link>
      <Link className={styles.login} href="/redesign/access">Ya tengo una cuenta →</Link>
    </header>
    <section className={styles.layout}>
      <div className={styles.copy}>
        <div className={styles.eyebrow}>14 DÍAS GRATIS</div>
        <h1>Creá tu comercio y empezá a probarlo hoy.</h1>
        <p>El período de prueba empieza en el momento en que creás la cuenta. Vas a entrar como Propietario y después podés cargar productos, configurar usuarios y preparar tu punto de venta.</p>
        <div className={styles.benefits}>
          <div className={styles.benefit}><i>✓</i><span>Punto de venta, productos, stock, caja y reportes.</span></div>
          <div className={styles.benefit}><i>✓</i><span>Asistente IA y modo offline para seguir vendiendo.</span></div>
          <div className={styles.benefit}><i>✓</i><span>Configuración para ARCA, lector de códigos e impresora térmica.</span></div>
          <div className={styles.benefit}><i>✓</i><span>Datos separados por comercio desde el primer minuto.</span></div>
        </div>
        <div className={styles.price}><b>{price}</b><span>por mes después de la prueba</span></div>
      </div>

      <div className={styles.card}>
        <div style={{marginBottom:18}}><BrandLogo size={52} showTagline/></div>
        <h2>Iniciar prueba gratis</h2>
        <p>No se cobra nada durante los primeros 14 días.</p>
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.row}>
            <label className={styles.label}>Tu nombre<input className={styles.input} required minLength={2} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Nombre y apellido"/></label>
            <label className={styles.label}>Nombre del comercio<input className={styles.input} required minLength={2} value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="Ej: Mi Almacén"/></label>
          </div>
          <label className={styles.label}>Email<input className={styles.input} required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vos@comercio.com"/></label>
          <div className={styles.row}>
            <label className={styles.label}>WhatsApp / teléfono<input className={styles.input} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Opcional"/></label>
            <label className={styles.label}>Contraseña<input className={styles.input} required minLength={8} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 8 caracteres"/></label>
          </div>
          <label className={styles.hidden}>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label>
          <label className={styles.terms}><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/> Entiendo que la prueba dura 14 días y que luego el plan tiene un valor de {price} por mes. Antes del primer cobro se deberá asociar un medio de pago.</label>
          {error&&<div className={styles.error}>{error}</div>}
          {success&&<div className={styles.success}>{success}</div>}
          <button className={styles.button} disabled={busy}>{busy?'Creando tu comercio…':'Crear mi prueba de 14 días'}</button>
        </form>
        <div className={styles.security}><span>🔒</span><div><b>Cuenta multi-tenant.</b> Los productos, ventas y usuarios quedan asociados únicamente a tu comercio.</div></div>
        <div className={styles.foot}>Podés configurar ARCA y el hardware después de ingresar.</div>
      </div>
    </section>
  </main>
}