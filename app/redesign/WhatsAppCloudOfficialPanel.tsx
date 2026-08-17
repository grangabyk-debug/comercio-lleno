'use client'

import { useCallback, useEffect, useState } from 'react'
import type { TenantSession } from '@/lib/comercio/types'

declare global {
  interface Window {
    FB?: {
      login: (callback: (response: any) => void, options: Record<string, unknown>) => void
    }
  }
}

type Props = { session: TenantSession; message: (value: string) => void }
type MetaIds = { wabaId: string; phoneNumberId: string; metaBusinessId?: string }
type Account = {
  waba_id?: string
  phone_number_id?: string | null
  display_phone_number?: string | null
  verified_name?: string | null
  quality_rating?: string | null
  name_status?: string | null
  status?: string
  subscribed?: boolean
  registered?: boolean
  last_error?: string | null
}

const CONFIG_ID = '1817251942977665'

function jsonData(value: unknown) {
  if (typeof value === 'string') {
    try { return JSON.parse(value) } catch { return null }
  }
  return value && typeof value === 'object' ? value : null
}

export default function WhatsAppCloudOfficialPanel({ session, message }: Props) {
  const [account, setAccount] = useState<Account | null>(null)
  const [ids, setIds] = useState<MetaIds | null>(null)
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const api = useCallback(async (path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${session.token}`)
    if (init.body) headers.set('Content-Type', 'application/json')
    const response = await fetch(path, { ...init, headers, cache: 'no-store' })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data?.error || 'No se pudo completar la operación.')
    return data
  }, [session.token])

  const refresh = useCallback(async () => {
    try {
      const data = await api('/api/meta/whatsapp/account')
      setAccount(data?.account || null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }, [api])

  useEffect(() => { void refresh() }, [refresh])

  const completeOnboarding = useCallback(async (metaIds: MetaIds, registrationPin = '') => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const data = await api('/api/meta/whatsapp/account', {
        method: 'POST',
        body: JSON.stringify({
          action: 'complete_onboarding',
          wabaId: metaIds.wabaId,
          phoneNumberId: metaIds.phoneNumberId,
          metaBusinessId: metaIds.metaBusinessId || null,
          ...(registrationPin ? { pin: registrationPin } : {}),
        }),
      })
      setAccount(data?.account || null)
      setIds(metaIds)
      if (data?.connected) {
        setPin('')
        setNotice('Conexión oficial completada. El número ya quedó registrado y suscripto a los webhooks de Comercio Lleno.')
        message('WhatsApp oficial quedó conectado correctamente.')
      } else {
        setNotice('Meta ya devolvió la cuenta y el número. Falta definir el PIN de 6 dígitos para registrar el teléfono en Cloud API.')
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }, [api, message])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') return
      const payload: any = jsonData(event.data)
      if (!payload || payload.type !== 'WA_EMBEDDED_SIGNUP') return
      if (payload.event === 'CANCEL') {
        setNotice('El registro fue cancelado antes de terminar.')
        return
      }
      if (payload.event !== 'FINISH') return
      const wabaId = String(payload?.data?.waba_id || '').trim()
      const phoneNumberId = String(payload?.data?.phone_number_id || '').trim()
      const metaBusinessId = String(payload?.data?.business_id || '').trim()
      if (!/^\d+$/.test(wabaId) || !/^\d+$/.test(phoneNumberId)) {
        setError('Meta terminó el registro, pero no devolvió los identificadores necesarios. Volvé a intentar el alta.')
        return
      }
      const nextIds = { wabaId, phoneNumberId, metaBusinessId }
      setIds(nextIds)
      void completeOnboarding(nextIds)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [completeOnboarding])

  function startSignup() {
    setError('')
    setNotice('')
    if (!window.FB?.login) {
      setError('El SDK de Meta todavía está cargando. Esperá unos segundos y volvé a intentar.')
      return
    }
    window.FB.login((response: any) => {
      if (!response?.authResponse?.code && response?.status === 'unknown') {
        setNotice('No se completó la autorización de Meta.')
      }
    }, {
      config_id: CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: '',
        sessionInfoVersion: '3',
      },
    })
  }

  async function registerPhone() {
    if (!ids) {
      setError('Primero completá el registro de Meta para obtener la cuenta y el número.')
      return
    }
    if (!/^\d{6}$/.test(pin)) {
      setError('El PIN debe tener exactamente 6 dígitos.')
      return
    }
    await completeOnboarding(ids, pin)
  }

  async function disconnect() {
    if (!window.confirm('¿Desconectar la integración oficial de Meta para este comercio?')) return
    setBusy(true)
    setError('')
    try {
      await api('/api/meta/whatsapp/account', { method: 'DELETE' })
      setAccount(null)
      setIds(null)
      setPin('')
      setNotice('La cuenta quedó desconectada de Comercio Lleno.')
      message('Integración oficial desconectada.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  const connected = account?.status === 'connected' && account?.registered
  const pendingRegistration = Boolean(account?.phone_number_id && !account?.registered)

  return (
    <section data-whatsapp-official="true" style={{display:'grid',gap:16}}>
      <div style={{border:'1px solid rgba(20,20,30,.12)',borderRadius:22,padding:22,background:'#fff',boxShadow:'0 14px 35px rgba(27,20,43,.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'flex-start',flexWrap:'wrap'}}>
          <div style={{maxWidth:720}}>
            <div style={{fontSize:12,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',opacity:.58}}>Integración oficial de Meta</div>
            <h3 style={{fontSize:25,margin:'6px 0 8px'}}>WhatsApp Business Platform</h3>
            <p style={{fontSize:15.5,lineHeight:1.55,margin:0,opacity:.76}}>Conectá el número del comercio mediante el registro oficial de Meta. No usa QR, WhatsApp Web ni Evolution API.</p>
          </div>
          <div style={{padding:'9px 13px',borderRadius:999,border:'1px solid rgba(20,20,30,.12)',fontWeight:800,fontSize:13}}>
            {connected ? 'Conectado' : pendingRegistration ? 'Falta registrar número' : account ? 'Configuración pendiente' : 'Sin conectar'}
          </div>
        </div>

        {account?.display_phone_number && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,marginTop:18}}>
            <div style={{padding:14,borderRadius:16,background:'rgba(20,20,30,.035)'}}><strong>Número</strong><div>{account.display_phone_number}</div></div>
            <div style={{padding:14,borderRadius:16,background:'rgba(20,20,30,.035)'}}><strong>Nombre verificado</strong><div>{account.verified_name || 'Pendiente'}</div></div>
            <div style={{padding:14,borderRadius:16,background:'rgba(20,20,30,.035)'}}><strong>Calidad</strong><div>{account.quality_rating || 'Sin datos'}</div></div>
          </div>
        )}

        {notice && <div style={{marginTop:16,padding:13,borderRadius:14,background:'rgba(78,52,168,.07)',lineHeight:1.45}}>{notice}</div>}
        {error && <div style={{marginTop:16,padding:13,borderRadius:14,background:'rgba(180,30,30,.07)',color:'#8b1717',lineHeight:1.45}}>{error}</div>}
        {account?.last_error && !error && <div style={{marginTop:16,padding:13,borderRadius:14,background:'rgba(160,100,0,.07)',lineHeight:1.45}}>{account.last_error}</div>}

        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:18}}>
          {!connected && <button data-whatsapp-official="true" type="button" onClick={startSignup} disabled={busy} style={{border:0,borderRadius:14,padding:'12px 17px',fontWeight:800,cursor:'pointer'}}>{busy ? 'Procesando…' : account ? 'Reintentar con Meta' : 'Conectar con Meta'}</button>}
          {account && <button data-whatsapp-official="true" type="button" onClick={()=>void refresh()} disabled={busy} style={{border:'1px solid rgba(20,20,30,.18)',borderRadius:14,padding:'12px 17px',fontWeight:700,background:'#fff',cursor:'pointer'}}>Actualizar estado</button>}
          {connected && <button data-whatsapp-official="true" type="button" onClick={()=>void disconnect()} disabled={busy} style={{border:'1px solid rgba(160,20,20,.2)',borderRadius:14,padding:'12px 17px',fontWeight:700,background:'#fff',cursor:'pointer'}}>Desconectar</button>}
        </div>
      </div>

      {(pendingRegistration || ids) && !connected && (
        <div style={{border:'1px solid rgba(20,20,30,.12)',borderRadius:22,padding:22,background:'#fff'}}>
          <h4 style={{fontSize:18,margin:'0 0 7px'}}>Registrar el número en Cloud API</h4>
          <p style={{margin:'0 0 14px',lineHeight:1.5,opacity:.75}}>Elegí un PIN nuevo de 6 dígitos. Meta lo usa para la verificación en dos pasos del número.</p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <input inputMode="numeric" autoComplete="off" maxLength={6} value={pin} onChange={event=>setPin(event.target.value.replace(/\D/g,'').slice(0,6))} placeholder="6 dígitos" style={{minWidth:180,border:'1px solid rgba(20,20,30,.18)',borderRadius:13,padding:'11px 13px',fontSize:16}} />
            <button data-whatsapp-official="true" type="button" onClick={()=>void registerPhone()} disabled={busy || pin.length!==6} style={{border:0,borderRadius:13,padding:'11px 16px',fontWeight:800,cursor:'pointer'}}>Registrar número</button>
          </div>
        </div>
      )}
    </section>
  )
}
