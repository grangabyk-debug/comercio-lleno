'use client'

import { useEffect, useState } from 'react'
import { readTenantSession, type } from '@/lib/comercio/session'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

type Subscription = {
  status: string
  trial_ends_at: string | null
  price_amount: number | string
  currency: string
  provider_status?: string | null
}

const money = new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 })

function clearSession() {
  ;['cl_access_token','cl_refresh_token','cl_company_id','cl_company_name','cl_user_role','cl_user_permissions'].forEach(key => localStorage.removeItem(key))
  location.replace('/redesign/access')
}

export default function SubscriptionGate() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const session = typeof window === 'undefined' ? null : readTenantSession()

  useEffect(() => {
    const current = readTenantSession()
    if (!current) { setLoaded(true); return }
    fetch(`${SUPABASE_URL}/rest/v1/company_subscriptions?company_id=eq.${encodeURIComponent(current.companyId)}&select=status,trial_ends_at,price_amount,currency,provider_status&limit=1`, {
      headers: { apikey:PUBLISHABLE_KEY, Authorization:`Bearer ${current.token}` },
      cache: 'no-store',
    })
      .then(async response => response.ok ? response.json() : [])
      .then(rows => setSubscription(Array.isArray(rows) ? rows[0] || null : null))
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded || !session || !subscription) return null

  const trialEnds = subscription.trial_ends_at ? new Date(subscription.trial_ends_at).getTime() : 0
  const trialActive = subscription.status === 'trialing' && trialEnds > Date.now()
  const allowed = subscription.status === 'active' || trialActive
  if (allowed) return null

  const owner = session.role === 'owner'
  const price = Number(subscription.price_amount || 14900)
  const statusText = subscription.status === 'past_due'
    ? 'El pago necesita regularización.'
    : subscription.status === 'canceled'
      ? 'La suscripción fue cancelada.'
      : 'La prueba gratuita finalizó.'

  async function activate() {
    if (!owner || busy) return
    setBusy(true)
    setError('')
    try {
      const current = readTenantSession()
      if (!current) throw new Error('La sesión venció. Volvé a ingresar.')
      const response = await fetch(`${SUPABASE_URL}/functions/v1/mercadopago-subscription`, {
        method:'POST',
        headers:{ apikey:PUBLISHABLE_KEY, Authorization:`Bearer ${current.token}`, 'Content-Type':'application/json' },
        body:JSON.stringify({ action:'checkout' }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'No pudimos abrir Mercado Pago.')
      if (data.active) { location.reload(); return }
      if (data.init_point) { location.href = String(data.init_point); return }
      throw new Error('No pudimos abrir el checkout de Mercado Pago.')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return <div style={{position:'fixed',inset:0,zIndex:100000,display:'grid',placeItems:'center',padding:20,background:'rgba(7,18,13,.88)',backdropFilter:'blur(10px)'}}>
    <section style={{width:'min(520px,100%)',background:'#fff',borderRadius:22,padding:26,boxShadow:'0 30px 90px rgba(0,0,0,.35)',color:'#17231d',fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:999,background:'#fff4df',color:'#9b5f00',fontSize:11,fontWeight:900}}>COMERCIO LLENO · PLAN</div>
      <h1 style={{fontSize:28,lineHeight:1.1,margin:'16px 0 10px'}}>Activá tu cuenta para seguir trabajando.</h1>
      <p style={{margin:0,color:'#5c6d65',lineHeight:1.55}}>{statusText} Tus datos, productos y ventas siguen guardados; el acceso operativo queda protegido hasta activar el plan.</p>
      <div style={{margin:'20px 0',padding:16,border:'1px solid #dfe8e3',borderRadius:14,background:'#f8faf9'}}>
        <div style={{fontSize:12,color:'#66776f',fontWeight:800}}>Plan Comercio Lleno</div>
        <div style={{fontSize:30,fontWeight:950,marginTop:3}}>{money.format(price)} <span style={{fontSize:13,fontWeight:700,color:'#718078'}}>/ mes</span></div>
      </div>
      {owner ? <>
        <button onClick={activate} disabled={busy} style={{width:'100%',border:0,borderRadius:12,padding:'14px 16px',background:'#168a55',color:'#fff',fontWeight:950,fontSize:15,cursor:busy?'wait':'pointer'}}>{busy?'Abriendo Mercado Pago…':'Activar con Mercado Pago'}</button>
        <p style={{fontSize:11,color:'#7a8881',lineHeight:1.45,margin:'10px 2px 0'}}>La activación se valida contra Mercado Pago antes de volver a habilitar ventas, stock, caja y reportes.</p>
      </> : <p style={{padding:12,borderRadius:12,background:'#f3f6f4',fontSize:13,lineHeight:1.45}}>Pedile al propietario del comercio que ingrese con su usuario y active el plan.</p>}
      {error && <div style={{marginTop:12,padding:11,borderRadius:10,background:'#fff0f0',color:'#a33a3a',fontSize:12,fontWeight:700}}>{error}</div>}
      <button onClick={clearSession} style={{marginTop:14,border:0,background:'transparent',color:'#5b6d64',fontWeight:800,cursor:'pointer',padding:'8px 2px'}}>Salir de la cuenta</button>
    </section>
  </div>
}
