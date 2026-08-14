'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import type { TenantSession } from '@/lib/comercio/types'

type Props = { session: TenantSession; message: (m: string) => void }
type Msg = { id: string; direction: 'inbound' | 'outbound' | 'system'; body: string; created_at: string }
type State = {
  feature?: { aiSellerEntitled?: boolean; aiSellerEnabled?: boolean; company?: { name?: string } }
  conversation?: { status?: string; cart?: { items?: any[] } } | null
  messages?: Msg[]
  orders?: Array<{ id: string; status: string; total: number; sale_id?: string | null; created_at: string }>
}
type Persona = {
  tone: 'natural' | 'friendly' | 'sales' | 'formal'
  responseLength: 'short' | 'normal'
  useEmojis: boolean
  useVos: boolean
  oneQuestionAtATime: boolean
  customInstructions: string
}
type TrainingExample = {
  id: string
  source_message_id?: string | null
  rating: number
  corrected_response?: string | null
}
type TrainingState = {
  persona: Persona
  examples: TrainingExample[]
  approvedCount: number
  correctedCount: number
}

const defaultPersona: Persona = {
  tone: 'natural',
  responseLength: 'short',
  useEmojis: true,
  useVos: true,
  oneQuestionAtATime: true,
  customInstructions: 'Respondé como una persona del comercio: cálido, simple y concreto. Evitá frases acartonadas o de call center. No repitas saludos si la conversación ya empezó.',
}

async function api(session: TenantSession, payload: Record<string, unknown>) {
  const r = await fetch('/api/redesign/whatsapp/seller', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d?.error || `Error ${r.status}`)
  return d
}

const fieldStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 5,
  padding: '10px 11px',
  border: '1px solid #ccd8d2',
  borderRadius: 9,
  background: 'transparent',
  color: 'inherit',
}

const softBox: React.CSSProperties = {
  padding: 12,
  border: '1px solid #dfe7e3',
  borderRadius: 12,
  background: 'rgba(247,250,248,.55)',
}

export default function WhatsAppAiSellerPanel({ session, message }: Props) {
  const [phone, setPhone] = useState('')
  const [text, setText] = useState('')
  const [state, setState] = useState<State>({})
  const [busy, setBusy] = useState(false)
  const [commitSale, setCommitSale] = useState(false)
  const [training, setTraining] = useState<TrainingState>({ persona: defaultPersona, examples: [], approvedCount: 0, correctedCount: 0 })
  const [profileBusy, setProfileBusy] = useState(false)
  const [badMessageId, setBadMessageId] = useState('')
  const [correction, setCorrection] = useState('')
  const [feedbackBusy, setFeedbackBusy] = useState('')

  async function load(value = phone) {
    try {
      const d = await api(session, { action: 'state', phone: value })
      setState(d)
    } catch (e) { message(e instanceof Error ? e.message : String(e)) }
  }

  async function loadTraining() {
    try {
      const d = await api(session, { action: 'training_state' })
      setTraining({
        persona: d?.persona || defaultPersona,
        examples: Array.isArray(d?.examples) ? d.examples : [],
        approvedCount: Number(d?.approvedCount || 0),
        correctedCount: Number(d?.correctedCount || 0),
      })
    } catch (e) { message(e instanceof Error ? e.message : String(e)) }
  }

  useEffect(() => {
    void load('')
    void loadTraining()
  }, [session.companyId])

  async function submit(e?: FormEvent) {
    e?.preventDefault()
    if (!phone.trim() || !text.trim() || busy) return
    setBusy(true)
    try {
      const d = await api(session, { action: 'message', phone, text, commitSale })
      setText('')
      message(d?.committed ? 'Venta de prueba creada desde Vendedor IA.' : 'Vendedor IA respondió correctamente.')
      await load(phone)
    } catch (e) { message(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  async function reset() {
    if (!phone.trim() || busy) return
    setBusy(true)
    try {
      await api(session, { action: 'reset', phone })
      await load(phone)
      message('Conversación de prueba reiniciada.')
    } catch (e) { message(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  async function saveProfile() {
    if (profileBusy) return
    setProfileBusy(true)
    try {
      const d = await api(session, { action: 'training_profile', persona: training.persona })
      setTraining(old => ({ ...old, persona: d?.persona || old.persona }))
      message('Estilo del Vendedor IA guardado.')
    } catch (e) { message(e instanceof Error ? e.message : String(e)) } finally { setProfileBusy(false) }
  }

  async function rate(messageId: string, rating: 1 | -1, correctedResponse = '') {
    if (!messageId || feedbackBusy) return
    setFeedbackBusy(messageId)
    try {
      await api(session, { action: 'training_feedback', sourceMessageId: messageId, rating, correctedResponse })
      if (rating === 1) message('Respuesta aprobada. La IA la usará como ejemplo de estilo.')
      else message('Corrección guardada. La IA usará tu versión como respuesta ideal.')
      setBadMessageId('')
      setCorrection('')
      await loadTraining()
    } catch (e) { message(e instanceof Error ? e.message : String(e)) } finally { setFeedbackBusy('') }
  }

  const feedbackMap = useMemo(() => {
    const map = new Map<string, TrainingExample>()
    for (const item of training.examples || []) if (item.source_message_id) map.set(item.source_message_id, item)
    return map
  }, [training.examples])

  const entitled = state.feature?.aiSellerEntitled === true
  const enabled = state.feature?.aiSellerEnabled === true
  const messages = state.messages || []
  const items = state.conversation?.cart?.items || []

  const setPersona = (patch: Partial<Persona>) => setTraining(old => ({ ...old, persona: { ...old.persona, ...patch } }))

  return (
    <section style={{ border: '1px solid #dfe7e3', borderRadius: 14, padding: 16, display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 950, letterSpacing: '.09em', color: '#168a55' }}>S PLUS · VENDEDOR ENTRENABLE</div>
          <h3 style={{ margin: '5px 0 6px' }}>🤖 Vendedor IA WhatsApp</h3>
          <p style={{ margin: 0, opacity: .72, lineHeight: 1.5, maxWidth: 800 }}>Configurá cómo habla, probalo como si fueras un cliente y marcá cada respuesta con 👍 o 👎. Las correcciones quedan guardadas sólo para este comercio.</p>
        </div>
        <span style={{ padding: '7px 10px', borderRadius: 999, fontSize: 10, fontWeight: 950, background: entitled && enabled ? '#e8f8ee' : '#fff4df', color: entitled && enabled ? '#147244' : '#926000' }}>
          {!entitled ? 'BLOQUEADO POR PLAN' : enabled ? 'ACTIVO' : 'CONTRATADO · APAGADO'}
        </span>
      </div>

      {!entitled ? (
        <div style={{ padding: 13, borderRadius: 11, background: '#fff8e8' }}>🔒 Este comercio no tiene habilitado <b>Vendedor IA WhatsApp · S Plus</b>. Activá el módulo desde Central Llena.</div>
      ) : !enabled ? (
        <div style={{ padding: 13, borderRadius: 11, background: '#fff8e8' }}>El módulo está contratado pero apagado. Activá “Vendedor IA WhatsApp” en las automatizaciones de arriba.</div>
      ) : (
        <>
          <div style={{ ...softBox, display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div><b>Entrenamiento del estilo</b><div style={{ fontSize: 11, opacity: .65, marginTop: 3 }}>Esto cambia la forma de hablar, nunca los precios, stock ni reglas de confirmación.</div></div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, padding: '5px 8px', borderRadius: 999, background: '#e9f8ef', color: '#157348', fontWeight: 900 }}>👍 {training.approvedCount} aprobadas</span>
                <span style={{ fontSize: 10, padding: '5px 8px', borderRadius: 999, background: '#eef3ff', color: '#3d5a9b', fontWeight: 900 }}>✍️ {training.correctedCount} corregidas</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 800 }}>Tono
                <select style={fieldStyle} value={training.persona.tone} onChange={e => setPersona({ tone: e.target.value as Persona['tone'] })}>
                  <option value="natural">Natural / empleado</option>
                  <option value="friendly">Cálido y cercano</option>
                  <option value="sales">Vendedor y proactivo</option>
                  <option value="formal">Profesional</option>
                </select>
              </label>
              <label style={{ fontSize: 11, fontWeight: 800 }}>Largo de respuesta
                <select style={fieldStyle} value={training.persona.responseLength} onChange={e => setPersona({ responseLength: e.target.value as Persona['responseLength'] })}>
                  <option value="short">Corto, tipo WhatsApp</option>
                  <option value="normal">Normal</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 11 }}>
              <label><input type="checkbox" checked={training.persona.useVos} onChange={e => setPersona({ useVos: e.target.checked })} /> Usar “vos”</label>
              <label><input type="checkbox" checked={training.persona.useEmojis} onChange={e => setPersona({ useEmojis: e.target.checked })} /> Emojis moderados</label>
              <label><input type="checkbox" checked={training.persona.oneQuestionAtATime} onChange={e => setPersona({ oneQuestionAtATime: e.target.checked })} /> Una pregunta por mensaje</label>
            </div>

            <label style={{ fontSize: 11, fontWeight: 800 }}>Instrucciones propias del comercio
              <textarea
                value={training.persona.customInstructions}
                onChange={e => setPersona({ customInstructions: e.target.value.slice(0, 1200) })}
                rows={4}
                placeholder="Ej: hablá como un empleado de mostrador, no uses frases formales, ofrecé alternativas cuando falte un producto…"
                style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.45 }}
              />
            </label>
            <div><button type="button" disabled={profileBusy} onClick={() => void saveProfile()} style={{ border: 0, borderRadius: 10, padding: '10px 14px', background: '#168a55', color: '#fff', fontWeight: 900 }}>{profileBusy ? 'Guardando…' : 'Guardar entrenamiento'}</button></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px,.7fr) 1.3fr', gap: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 800 }}>Cliente de prueba
              <input value={phone} onChange={e => setPhone(e.target.value)} onBlur={() => void load(phone)} placeholder="54911..." style={fieldStyle} />
            </label>
            <div style={{ fontSize: 11, opacity: .68, alignSelf: 'end', paddingBottom: 10 }}>Usá tu número o uno ficticio. Esta simulación no envía WhatsApp: sirve para entrenar y revisar respuestas.</div>
          </div>

          <div style={{ minHeight: 200, maxHeight: 460, overflow: 'auto', border: '1px solid #e1e8e4', borderRadius: 12, padding: 12, background: 'rgba(247,250,248,.55)', display: 'grid', gap: 9 }}>
            {messages.length ? messages.map(m => {
              const feedback = feedbackMap.get(m.id)
              const isOutbound = m.direction === 'outbound'
              return (
                <div key={m.id} style={{ justifySelf: m.direction === 'inbound' ? 'start' : 'end', maxWidth: '88%', display: 'grid', gap: 5 }}>
                  <div style={{ padding: '9px 11px', borderRadius: 12, background: m.direction === 'inbound' ? '#fff' : '#e7f7ee', border: '1px solid #dbe6e0', whiteSpace: 'pre-wrap', fontSize: 12, lineHeight: 1.45 }}>
                    <b style={{ display: 'block', fontSize: 9, opacity: .55, marginBottom: 3 }}>{m.direction === 'inbound' ? 'CLIENTE' : 'VENDEDOR IA'}</b>{m.body}
                  </div>
                  {isOutbound && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5, alignItems: 'center' }}>
                      {feedback && <span style={{ fontSize: 9, opacity: .65 }}>{feedback.rating === 1 ? '✓ aprobada' : '✓ corregida'}</span>}
                      <button type="button" title="Esta respuesta está bien" disabled={feedbackBusy === m.id} onClick={() => void rate(m.id, 1)} style={{ border: '1px solid #cfe0d7', borderRadius: 8, padding: '4px 7px', background: feedback?.rating === 1 ? '#dff5e7' : 'transparent', cursor: 'pointer' }}>👍</button>
                      <button type="button" title="Quiero corregir esta respuesta" disabled={feedbackBusy === m.id} onClick={() => { setBadMessageId(m.id); setCorrection(feedback?.corrected_response || m.body) }} style={{ border: '1px solid #ead8d6', borderRadius: 8, padding: '4px 7px', background: feedback?.rating === -1 ? '#fff0ee' : 'transparent', cursor: 'pointer' }}>👎</button>
                    </div>
                  )}
                  {badMessageId === m.id && (
                    <div style={{ ...softBox, minWidth: 280, display: 'grid', gap: 7 }}>
                      <b style={{ fontSize: 10 }}>¿Cómo tendría que haber respondido?</b>
                      <textarea value={correction} onChange={e => setCorrection(e.target.value.slice(0, 4000))} rows={4} style={{ ...fieldStyle, marginTop: 0, resize: 'vertical' }} />
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => { setBadMessageId(''); setCorrection('') }} style={{ border: '1px solid #ccd8d2', borderRadius: 8, padding: '7px 9px', background: 'transparent', color: 'inherit' }}>Cancelar</button>
                        <button type="button" disabled={!correction.trim() || feedbackBusy === m.id} onClick={() => void rate(m.id, -1, correction)} style={{ border: 0, borderRadius: 8, padding: '7px 10px', background: '#168a55', color: '#fff', fontWeight: 900 }}>{feedbackBusy === m.id ? 'Guardando…' : 'Guardar corrección'}</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            }) : (
              <div style={{ placeSelf: 'center', opacity: .55, textAlign: 'center' }}>Escribí abajo como si fueras un cliente.<br />Después marcá la respuesta con 👍 o 👎 para ir puliendo el estilo.</div>
            )}
          </div>

          {items.length > 0 && <div style={{ padding: 11, borderRadius: 10, border: '1px solid #cfe5d8', background: '#f0faf4' }}><b>Carrito actual</b><div style={{ fontSize: 11, marginTop: 5, opacity: .75 }}>{items.map((i: any) => `${i.qty} × ${i.name}`).join(' · ')}</div></div>}

          <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Escribí como cliente…" disabled={busy} style={{ padding: '11px 12px', border: '1px solid #ccd8d2', borderRadius: 10, background: 'transparent', color: 'inherit' }} />
            <button disabled={busy || !phone.trim() || !text.trim()} style={{ border: 0, borderRadius: 10, padding: '11px 16px', background: '#168a55', color: '#fff', fontWeight: 900 }}>{busy ? 'Pensando…' : 'Enviar'}</button>
          </form>

          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {['Hola, ¿tenés detergente?', 'necesito desodorante de piso', 'agregame dos lavandinas', '¿qué llevo?'].map(example => <button type="button" key={example} onClick={() => setText(example)} style={{ border: '1px solid #d9e4de', borderRadius: 999, padding: '6px 9px', background: 'transparent', color: 'inherit', fontSize: 10 }}>{example}</button>)}
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: 10, borderRadius: 10, background: commitSale ? '#fff0e8' : '#f6f8f7', fontSize: 11, lineHeight: 1.45 }}>
            <input type="checkbox" checked={commitSale} onChange={e => setCommitSale(e.target.checked)} style={{ marginTop: 2 }} />
            <span><b>Permitir venta real al escribir CONFIRMAR</b><br /><span style={{ opacity: .68 }}>Dejalo apagado mientras entrenás. Encendido crea “Pedido WhatsApp” y puede descontar stock de verdad.</span></span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <small style={{ opacity: .62 }}>Los 👍 y las correcciones se aplican al estilo de las próximas respuestas del comercio.</small>
            <button type="button" disabled={busy || !phone.trim()} onClick={() => void reset()} style={{ border: '1px solid #ccd8d2', borderRadius: 9, padding: '8px 10px', background: 'transparent', color: 'inherit', fontWeight: 800 }}>Reiniciar prueba</button>
          </div>

          {(state.orders || []).length > 0 && <div style={{ borderTop: '1px solid #e1e8e4', paddingTop: 10 }}><b style={{ fontSize: 11 }}>Pedidos de esta conversación</b>{(state.orders || []).slice(0, 4).map(o => <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '7px 0', fontSize: 10 }}><span>#{o.id.slice(0, 8).toUpperCase()} · {o.status}</span><strong>${Number(o.total || 0).toLocaleString('es-AR')}</strong></div>)}</div>}
        </>
      )}
    </section>
  )
}
