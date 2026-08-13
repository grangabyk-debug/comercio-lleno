'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { readTenantSession } from '@/lib/comercio/session'
import type { TenantSession } from '@/lib/comercio/types'

type Status = {
  ok?: boolean
  configured?: boolean
  connected?: boolean
  state?: string
  instance?: string
  message?: string
  error?: string
  licenseRequired?: boolean
  registerUrl?: string | null
  qr?: { base64?: string; code?: string; pairingCode?: string; count?: number } | null
}

const shell: React.CSSProperties = { minHeight: '100vh', background: '#f4f7f6', color: '#17201d', padding: '28px 16px 60px', fontFamily: 'Arial, Helvetica, sans-serif' }
const wrap: React.CSSProperties = { width: 'min(980px, 100%)', margin: '0 auto' }
const card: React.CSSProperties = { background: '#fff', border: '1px solid #dfe7e3', borderRadius: 20, padding: 24, boxShadow: '0 14px 38px rgba(27,52,43,.08)' }
const button: React.CSSProperties = { border: 0, borderRadius: 12, padding: '12px 17px', fontWeight: 800, cursor: 'pointer', background: '#137a58', color: '#fff', fontSize: 15 }
const secondary: React.CSSProperties = { ...button, background: '#eef4f1', color: '#244239', border: '1px solid #d8e4df' }
const input: React.CSSProperties = { width: '100%', border: '1px solid #ccd9d3', borderRadius: 11, padding: '12px 13px', fontSize: 16, background: '#fff', color: '#17201d' }

async function callApi(session: TenantSession, payload: Record<string, unknown>) {
  const response = await fetch('/api/redesign/whatsapp', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok && !data?.error) data.error = `HTTP ${response.status}`
  return data as Status & { sent?: boolean; preview?: string }
}

export default function WhatsAppPreviewPage() {
  const [session, setSession] = useState<TenantSession | null>(null)
  const [status, setStatus] = useState<Status>({ state: 'loading' })
  const [busy, setBusy] = useState(false)
  const [number, setNumber] = useState('')
  const [preset, setPreset] = useState('test')
  const [ticketNumber, setTicketNumber] = useState('102')
  const [total, setTotal] = useState('5500')
  const [lastMessage, setLastMessage] = useState('')
  const pollRef = useRef<number | null>(null)

  const stateLabel = useMemo(() => {
    if (status.connected) return 'Conectado'
    if (status.state === 'loading') return 'Revisando…'
    if (status.state === 'unconfigured') return 'Falta servidor Evolution'
    if (status.state === 'license_required') return 'Evolution requiere activación'
    if (status.state === 'connecting') return 'Esperando vinculación'
    if (status.state === 'error') return 'Error de conexión'
    return 'Desconectado'
  }, [status])

  const stateColor = status.connected ? '#137a58' : status.state === 'connecting' ? '#a26800' : '#a13b34'

  useEffect(() => {
    const s = readTenantSession()
    if (!s) {
      location.replace('/redesign/access')
      return
    }
    if (s.role !== 'owner') {
      setStatus({ state: 'error', error: 'Sólo el propietario puede configurar WhatsApp.' })
      return
    }
    setSession(s)
    void refresh(s)
    return () => { if (pollRef.current) window.clearInterval(pollRef.current) }
  }, [])

  async function refresh(s = session) {
    if (!s) return
    const next = await callApi(s, { action: 'status' })
    setStatus((old) => ({ ...old, ...next, qr: next.connected ? null : old.qr }))
    if (next.connected && pollRef.current) {
      window.clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  function startPolling(s: TenantSession) {
    if (pollRef.current) window.clearInterval(pollRef.current)
    pollRef.current = window.setInterval(() => { void refresh(s) }, 3000)
    window.setTimeout(() => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current)
        pollRef.current = null
      }
    }, 90_000)
  }

  async function connect() {
    if (!session) return
    setBusy(true)
    setLastMessage('')
    try {
      const next = await callApi(session, { action: 'connect' })
      setStatus((old) => ({ ...old, ...next }))
      if (next.error) setLastMessage(next.error)
      if (!next.connected && next.configured && !next.licenseRequired) startPolling(session)
    } finally {
      setBusy(false)
    }
  }

  async function send() {
    if (!session) return
    setBusy(true)
    setLastMessage('')
    try {
      const next = await callApi(session, { action: 'send', number, preset, ticketNumber, total: Number(total || 0) })
      if (next.sent) setLastMessage(`Enviado correctamente.\n\n${next.preview || ''}`)
      else setLastMessage(next.error || 'No se pudo enviar el mensaje.')
    } finally {
      setBusy(false)
    }
  }

  return <main style={shell}><div style={wrap}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
      <div><div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.4, color: '#64756f' }}>COMERCIO LLENO · LABORATORIO</div><h1 style={{ margin: '7px 0 6px', fontSize: 'clamp(28px,5vw,42px)' }}>WhatsApp por QR</h1><p style={{ margin: 0, color: '#64756f', maxWidth: 640, lineHeight: 1.5 }}>Prueba aislada. Esta pantalla no modifica la versión publicada ni activa envíos automáticos en las ventas.</p></div>
      <span style={{ borderRadius: 999, padding: '8px 12px', background: '#fff0d6', color: '#7c5200', fontWeight: 900, fontSize: 13 }}>PREVIEW · NO PRODUCCIÓN</span>
    </div>

    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div><h2 style={{ margin: 0, fontSize: 22 }}>Estado de WhatsApp</h2><p style={{ color: '#64756f', margin: '6px 0 0' }}>Instancia: <b>{status.instance || '—'}</b></p></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, color: stateColor }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: stateColor }}/>{stateLabel}</div>
      </div>

      {status.configured === false && <div style={{ marginTop: 20, padding: 17, borderRadius: 14, background: '#fff7e7', border: '1px solid #f0d69c', lineHeight: 1.5 }}><b>La integración de Comercio Lleno ya está preparada.</b><br/>Para generar un QR verdadero falta conectar un servidor Evolution 24/7 y cargar sus dos credenciales privadas en la Preview. No se muestra un QR falso.</div>}
      {status.licenseRequired && <div style={{ marginTop: 20, padding: 17, borderRadius: 14, background: '#fff1ef', border: '1px solid #efc3bd', lineHeight: 1.5 }}><b>Evolution está online, pero todavía no está activado.</b><br/>Las versiones nuevas bloquean los endpoints hasta completar la activación del servidor.</div>}
      {status.error && <div style={{ marginTop: 20, padding: 14, borderRadius: 12, background: '#fff1ef', color: '#8d302b' }}>{status.error}</div>}

      {!status.connected && status.configured !== false && !status.licenseRequired && <div style={{ marginTop: 22 }}><button style={button} disabled={busy} onClick={() => void connect()}>{busy ? 'Generando…' : status.qr?.base64 ? 'Generar otro QR' : 'Generar QR y vincular'}</button></div>}

      {status.qr?.base64 && !status.connected && <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'minmax(220px,320px) 1fr', gap: 24, alignItems: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #d9e4df', borderRadius: 18, padding: 14, textAlign: 'center' }}><img src={status.qr.base64} alt="Código QR para vincular WhatsApp" style={{ width: '100%', maxWidth: 280, display: 'block', margin: '0 auto' }}/></div>
        <div><h3 style={{ marginTop: 0 }}>Escanealo desde el WhatsApp del comercio</h3><ol style={{ paddingLeft: 20, lineHeight: 1.8, color: '#455750' }}><li>Abrí WhatsApp en el celular.</li><li>Entrá a <b>Dispositivos vinculados</b>.</li><li>Tocá <b>Vincular un dispositivo</b>.</li><li>Escaneá este QR.</li></ol><p style={{ color: '#64756f' }}>Comercio Lleno revisa el estado automáticamente y cambia a “Conectado” cuando WhatsApp termina la vinculación.</p></div>
      </div>}

      {!status.qr?.base64 && status.qr?.pairingCode && !status.connected && <div style={{ marginTop: 22, padding: 18, borderRadius: 14, background: '#eef7f3' }}><div style={{ color: '#64756f', marginBottom: 6 }}>Código de vinculación alternativo</div><strong style={{ fontSize: 28, letterSpacing: 3 }}>{status.qr.pairingCode}</strong></div>}
    </section>

    <section style={{ ...card, marginTop: 20, opacity: status.connected ? 1 : .62 }}>
      <h2 style={{ marginTop: 0, fontSize: 22 }}>Enviar mensaje preset</h2><p style={{ color: '#64756f', lineHeight: 1.5 }}>Para esta prueba sólo habilité tres mensajes controlados. No hay campañas masivas ni texto libre.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginTop: 18 }}>
        <label style={{ display: 'grid', gap: 7, fontWeight: 800 }}>Número destino <input style={input} value={number} onChange={e => setNumber(e.target.value)} placeholder="Ej: 5491159609135" disabled={!status.connected}/><small style={{ color: '#75837e', fontWeight: 500 }}>País + área + número, sólo dígitos.</small></label>
        <label style={{ display: 'grid', gap: 7, fontWeight: 800 }}>Mensaje <select style={input} value={preset} onChange={e => setPreset(e.target.value)} disabled={!status.connected}><option value="test">Prueba de conexión</option><option value="ticket">Ticket de ejemplo</option><option value="ready">Pedido listo</option></select></label>
        {preset === 'ticket' && <><label style={{ display: 'grid', gap: 7, fontWeight: 800 }}>Ticket <input style={input} value={ticketNumber} onChange={e => setTicketNumber(e.target.value)} disabled={!status.connected}/></label><label style={{ display: 'grid', gap: 7, fontWeight: 800 }}>Total <input style={input} type="number" value={total} onChange={e => setTotal(e.target.value)} disabled={!status.connected}/></label></>}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}><button style={button} disabled={!status.connected || busy} onClick={() => void send()}>{busy ? 'Enviando…' : 'Enviar mensaje de prueba'}</button><button style={secondary} disabled={busy} onClick={() => void refresh()}>Actualizar estado</button></div>
      {lastMessage && <pre style={{ whiteSpace: 'pre-wrap', margin: '18px 0 0', padding: 15, borderRadius: 12, background: '#f5f8f7', border: '1px solid #e0e7e4', fontFamily: 'inherit', lineHeight: 1.5 }}>{lastMessage}</pre>}
    </section>

    <section style={{ ...card, marginTop: 20 }}><h2 style={{ marginTop: 0, fontSize: 20 }}>Qué pasa por detrás</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
      {[['1','Comercio Lleno pide una instancia única para este comercio.'],['2','Evolution genera el QR desde la sesión de WhatsApp Web.'],['3','El celular autoriza ese dispositivo al escanearlo.'],['4','Después el POS manda los presets por API, sin volver a escanear mientras la sesión siga válida.']].map(([n,t]) => <div key={n} style={{ padding: 15, borderRadius: 14, background: '#f6f9f8' }}><b style={{ display: 'block', marginBottom: 7, color: '#137a58' }}>{n}</b><span style={{ lineHeight: 1.5 }}>{t}</span></div>)}
    </div></section>
  </div></main>
}
