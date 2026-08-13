'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { TenantSession } from '@/lib/comercio/types'
import base from './settings-next.module.css'

type Status = {
  ok?: boolean
  configured?: boolean
  connected?: boolean
  state?: string
  instance?: string
  error?: string
  licenseRequired?: boolean
  qr?: { base64?: string; pairingCode?: string } | null
}

type Props = { session: TenantSession; message: (m: string) => void }
type ResultTone = 'neutral' | 'ok' | 'error'

async function callApi(session: TenantSession, payload: Record<string, unknown>) {
  const r = await fetch('/api/redesign/whatsapp', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok && !d?.error) d.error = `HTTP ${r.status}`
  return d as Status & { sent?: boolean; preview?: string }
}

async function disconnectApi(session: TenantSession) {
  const r = await fetch('/api/redesign/whatsapp/disconnect', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok && !d?.error) d.error = `HTTP ${r.status}`
  return d as { ok?: boolean; disconnected?: boolean; error?: string }
}

function qrSource(v?: string) {
  if (!v) return ''
  return v.startsWith('data:image') ? v : `data:image/png;base64,${v}`
}

const box: CSSProperties = {
  border: '1px solid #dfe7e3',
  borderRadius: 14,
  padding: 14,
  background: 'rgba(247,250,248,.72)',
}
const input: CSSProperties = {
  width: '100%',
  border: '1px solid #ccd8d2',
  borderRadius: 10,
  padding: '11px 12px',
  background: 'var(--surface,#fff)',
  color: 'inherit',
  font: 'inherit',
}

export default function WhatsAppSettingsPanel({ session, message }: Props) {
  const [status, setStatus] = useState<Status>({ state: 'loading' })
  const [busy, setBusy] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [number, setNumber] = useState('')
  const [preset, setPreset] = useState<'test' | 'ticket' | 'ready'>('test')
  const [ticketNumber, setTicketNumber] = useState('102')
  const [total, setTotal] = useState('5500')
  const [result, setResult] = useState('')
  const [resultTone, setResultTone] = useState<ResultTone>('neutral')
  const [lastChecked, setLastChecked] = useState('')
  const pollRef = useRef<number | null>(null)

  const connected = Boolean(status.connected)
  const label = connected
    ? 'Conectado'
    : status.state === 'loading'
      ? 'Revisando…'
      : status.state === 'connecting'
        ? 'Esperando vinculación'
        : status.state === 'unconfigured'
          ? 'Servidor pendiente'
          : status.licenseRequired
            ? 'Activación pendiente'
            : status.state === 'error'
              ? 'Error de conexión'
              : 'Desconectado'
  const dot = connected ? '#24a867' : status.state === 'connecting' || status.state === 'loading' ? '#e1a51c' : '#cf4e46'

  async function refresh(showFeedback = false) {
    if (showFeedback) {
      setRefreshing(true)
      setResult('Consultando estado de WhatsApp…')
      setResultTone('neutral')
    }
    try {
      const next = await callApi(session, { action: 'status' })
      setStatus(old => ({ ...old, ...next, qr: next.connected ? null : old.qr }))
      setLastChecked(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      if (showFeedback) {
        setResult(next.error ? next.error : `Estado actualizado: ${next.connected ? 'conectado' : 'desconectado'}.`)
        setResultTone(next.error ? 'error' : 'ok')
      }
      if (next.connected && pollRef.current) {
        window.clearInterval(pollRef.current)
        pollRef.current = null
      }
    } finally {
      if (showFeedback) setRefreshing(false)
    }
  }

  useEffect(() => {
    void refresh(false)
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current)
    }
  }, [session.companyId])

  function startPolling() {
    if (pollRef.current) window.clearInterval(pollRef.current)
    pollRef.current = window.setInterval(() => void refresh(false), 5000)
    window.setTimeout(() => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current)
        pollRef.current = null
      }
    }, 90000)
  }

  async function connect() {
    setBusy(true)
    setResult('Generando vínculo seguro con WhatsApp…')
    setResultTone('neutral')
    try {
      const next = await callApi(session, { action: 'connect' })
      setStatus(old => ({ ...old, ...next }))
      if (next.error) {
        setResult(next.error)
        setResultTone('error')
      } else if (next.connected) {
        setResult('WhatsApp ya está conectado.')
        setResultTone('ok')
      } else {
        setResult('QR generado. Escanealo desde Dispositivos vinculados en WhatsApp.')
        setResultTone('ok')
      }
      if (!next.connected && next.configured && !next.licenseRequired) startPolling()
    } finally {
      setBusy(false)
    }
  }

  async function disconnect() {
    if (!window.confirm('¿Querés desvincular este WhatsApp de Comercio Lleno? Después podés volver a conectarlo con un QR nuevo.')) return
    setBusy(true)
    setResult('Desvinculando WhatsApp…')
    setResultTone('neutral')
    try {
      const next = await disconnectApi(session)
      if (!next.ok) {
        setResult(next.error || 'No se pudo desvincular WhatsApp.')
        setResultTone('error')
        return
      }
      if (pollRef.current) {
        window.clearInterval(pollRef.current)
        pollRef.current = null
      }
      setStatus(old => ({ ...old, connected: false, state: 'close', qr: null, error: undefined }))
      setResult('WhatsApp desvinculado correctamente.')
      setResultTone('ok')
      message('WhatsApp desvinculado correctamente.')
    } finally {
      setBusy(false)
    }
  }

  async function send() {
    setBusy(true)
    setResult('Enviando mensaje de prueba…')
    setResultTone('neutral')
    try {
      const next = await callApi(session, { action: 'send', number, preset, ticketNumber, total: Number(total || 0) })
      if (next.sent) {
        setResult(next.preview || 'Mensaje enviado correctamente.')
        setResultTone('ok')
        message('Mensaje de prueba enviado por WhatsApp.')
      } else {
        setResult(next.error || 'No se pudo enviar el mensaje.')
        setResultTone('error')
      }
    } finally {
      setBusy(false)
    }
  }

  const qr = qrSource(status.qr?.base64)
  const resultBackground = resultTone === 'error' ? '#fff1ef' : resultTone === 'ok' ? '#eefaf3' : 'rgba(247,250,248,.72)'

  return (
    <section className={base.panel} style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: '0 0 6px' }}>WhatsApp</h3>
          <p style={{ margin: 0, opacity: .72 }}>Vinculá el WhatsApp del comercio por QR y verificá la conexión antes de activar automatizaciones.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #ccd8d2', borderRadius: 999, padding: '8px 12px', fontWeight: 900 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: dot }} /> {label}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
        <div style={box}><small style={{ opacity: .65 }}>Estado</small><br /><b>{label}</b></div>
        <div style={box}><small style={{ opacity: .65 }}>Instancia</small><br /><b>{status.instance || '—'}</b></div>
        <div style={box}><small style={{ opacity: .65 }}>Tráfico de control</small><br /><b>Bajo</b><div style={{ fontSize: 12, opacity: .65, marginTop: 4 }}>Una consulta al abrir. Sólo repite durante el QR.</div></div>
        <div style={box}><small style={{ opacity: .65 }}>Última comprobación</small><br /><b>{lastChecked || '—'}</b></div>
      </div>

      {status.configured === false && <div style={{ ...box, background: '#fff8e8' }}><b>Interfaz lista.</b> Falta conectar el servidor Evolution para generar un QR real.</div>}
      {status.licenseRequired && <div style={{ ...box, background: '#fff1ef' }}><b>Evolution requiere activación.</b> El servidor está accesible pero todavía no permite crear la sesión.</div>}
      {status.error && <div style={{ ...box, background: '#fff1ef' }}>{status.error}</div>}

      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
        {!connected && <button className={base.primary} disabled={busy || status.configured === false} onClick={() => void connect()}>{busy ? 'Procesando…' : qr ? 'Generar otro QR' : 'Vincular WhatsApp por QR'}</button>}
        <button disabled={busy || refreshing} onClick={() => void refresh(true)} style={{ border: '1px solid #ccd8d2', borderRadius: 10, padding: '10px 14px', fontWeight: 800, cursor: 'pointer', background: 'transparent', color: 'inherit' }}>{refreshing ? 'Consultando…' : 'Actualizar estado'}</button>
        {connected && <button disabled={busy} onClick={() => void disconnect()} style={{ border: '1px solid #d86a62', borderRadius: 10, padding: '10px 14px', fontWeight: 900, cursor: 'pointer', background: '#fff1ef', color: '#a8322a' }}>{busy ? 'Procesando…' : 'Desvincular WhatsApp'}</button>}
      </div>

      {result && <div style={{ ...box, background: resultBackground }}>{result}</div>}

      {qr && !connected && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px,300px) 1fr', gap: 20, alignItems: 'center' }}>
          <div style={{ ...box, background: '#fff' }}><img src={qr} alt="Código QR para vincular WhatsApp" style={{ display: 'block', width: '100%', maxWidth: 280, margin: '0 auto' }} /></div>
          <div>
            <h4>Escanealo desde el celular del comercio</h4>
            <ol style={{ lineHeight: 1.8 }}><li>Abrí WhatsApp.</li><li>Entrá a <b>Dispositivos vinculados</b>.</li><li>Tocá <b>Vincular un dispositivo</b>.</li><li>Escaneá este QR.</li></ol>
            <small style={{ opacity: .65 }}>Durante esta vinculación se revisa el estado cada 5 segundos y se detiene al conectar o a los 90 segundos.</small>
          </div>
        </div>
      )}

      {status.qr?.pairingCode && !qr && !connected && <div style={box}>Código alternativo: <b style={{ fontSize: 24, letterSpacing: 3 }}>{status.qr.pairingCode}</b></div>}

      <div style={{ borderTop: '1px solid #dfe7e3', paddingTop: 18, display: 'grid', gap: 14, opacity: connected ? 1 : .62 }}>
        <div><h4 style={{ margin: '0 0 6px' }}>Prueba de envío</h4><p style={{ margin: 0, opacity: .72 }}>Mandá un mensaje controlado para comprobar la conexión. No activa automatizaciones.</p></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12 }}>
          <label>Número destino<input style={input} value={number} onChange={e => setNumber(e.target.value)} placeholder="Código de país + área + número" disabled={!connected} /></label>
          <label>Mensaje<select style={input} value={preset} onChange={e => setPreset(e.target.value as 'test' | 'ticket' | 'ready')} disabled={!connected}><option value="test">Prueba de conexión</option><option value="ticket">Ticket de ejemplo</option><option value="ready">Pedido listo</option></select></label>
          {preset === 'ticket' && <><label>Ticket<input style={input} value={ticketNumber} onChange={e => setTicketNumber(e.target.value)} disabled={!connected} /></label><label>Total<input style={input} type="number" value={total} onChange={e => setTotal(e.target.value)} disabled={!connected} /></label></>}
        </div>
        <div><button className={base.primary} disabled={!connected || busy || number.replace(/\D/g, '').length < 10} onClick={() => void send()}>{busy ? 'Enviando…' : 'Enviar mensaje de test'}</button></div>
      </div>
    </section>
  )
}
