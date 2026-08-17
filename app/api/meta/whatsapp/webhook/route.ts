import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { SUPABASE_URL } from '@/lib/meta-whatsapp-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VERIFY_TOKEN = process.env.META_WHATSAPP_VERIFY_TOKEN || 'ComercioLlenoMeta2026'

function validSignature(rawBody: string, signature: string | null, appSecret: string) {
  if (!signature?.startsWith('sha256=')) return false
  const expected = createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex')
  const received = signature.slice('sha256='.length)
  if (received.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected))
}

function eventKey(rawBody: string, suffix: string) {
  return createHash('sha256').update(rawBody).update('|').update(suffix).digest('hex')
}

async function adminRest(path: string, init: RequestInit = {}) {
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!serviceRole) return null
  const headers = new Headers(init.headers)
  headers.set('apikey', serviceRole)
  headers.set('Authorization', `Bearer ${serviceRole}`)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return fetch(`${SUPABASE_URL}/rest/v1/${path.replace(/^\/+/, '')}`, { ...init, headers, cache: 'no-store' })
}

async function resolveCompany(wabaId: string, phoneNumberId: string) {
  const filters = phoneNumberId
    ? `phone_number_id=eq.${encodeURIComponent(phoneNumberId)}`
    : `waba_id=eq.${encodeURIComponent(wabaId)}`
  const response = await adminRest(`whatsapp_cloud_accounts?${filters}&select=company_id&limit=1`)
  if (!response?.ok) return null
  const rows = await response.json().catch(() => [])
  return Array.isArray(rows) && rows[0]?.company_id ? String(rows[0].company_id) : null
}

type StoredEvent = {
  event_key: string
  company_id: string | null
  waba_id: string | null
  phone_number_id: string | null
  event_type: string
  external_message_id: string | null
  payload: Record<string, unknown>
  received_at: string
}

type ExtractedEvent = Omit<StoredEvent, 'company_id' | 'received_at'> & {
  contactPhone?: string
  contactName?: string
  message?: any
  status?: any
}

function cleanPhone(value: unknown) {
  return String(value || '').replace(/\D/g, '').slice(0, 20)
}

function messageBody(message: any) {
  const type = String(message?.type || 'unknown')
  if (type === 'text') return String(message?.text?.body || '')
  if (type === 'button') return String(message?.button?.text || message?.button?.payload || '')
  if (type === 'interactive') {
    return String(
      message?.interactive?.button_reply?.title ||
      message?.interactive?.list_reply?.title ||
      message?.interactive?.nfm_reply?.body ||
      '[Respuesta interactiva]',
    )
  }
  if (type === 'image') return String(message?.image?.caption || '[Imagen]')
  if (type === 'document') return String(message?.document?.caption || message?.document?.filename || '[Documento]')
  if (type === 'audio') return '[Audio]'
  if (type === 'video') return String(message?.video?.caption || '[Video]')
  if (type === 'sticker') return '[Sticker]'
  if (type === 'location') return '[Ubicación]'
  if (type === 'contacts') return '[Contacto]'
  if (type === 'reaction') return String(message?.reaction?.emoji || '[Reacción]')
  return `[${type}]`
}

function metaTimestamp(value: unknown, fallback: string) {
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds <= 0) return fallback
  return new Date(seconds * 1000).toISOString()
}

function extractEvents(payload: any, rawBody: string): ExtractedEvent[] {
  const result: ExtractedEvent[] = []
  const entries = Array.isArray(payload?.entry) ? payload.entry : []

  entries.forEach((entry: any, entryIndex: number) => {
    const wabaId = entry?.id ? String(entry.id) : ''
    const changes = Array.isArray(entry?.changes) ? entry.changes : []
    changes.forEach((change: any, changeIndex: number) => {
      const field = String(change?.field || 'unknown')
      const value = change?.value && typeof change.value === 'object' ? change.value : {}
      const phoneNumberId = value?.metadata?.phone_number_id ? String(value.metadata.phone_number_id) : ''
      const contacts = Array.isArray(value?.contacts) ? value.contacts : []
      const contactMap = new Map<string, string>()
      contacts.forEach((contact: any) => {
        const waId = cleanPhone(contact?.wa_id)
        if (waId) contactMap.set(waId, String(contact?.profile?.name || '').trim())
      })
      const messages = Array.isArray(value?.messages) ? value.messages : []
      const statuses = Array.isArray(value?.statuses) ? value.statuses : []

      if (messages.length) {
        messages.forEach((message: any, itemIndex: number) => {
          const contactPhone = cleanPhone(message?.from)
          result.push({
            event_key: eventKey(rawBody, `${entryIndex}:${changeIndex}:message:${itemIndex}`),
            waba_id: wabaId || null,
            phone_number_id: phoneNumberId || null,
            event_type: `${field}:message`,
            external_message_id: message?.id ? String(message.id) : null,
            payload: { object: payload?.object || null, entryId: wabaId || null, field, metadata: value?.metadata || null, contacts, message },
            contactPhone,
            contactName: contactMap.get(contactPhone) || '',
            message,
          })
        })
      }

      if (statuses.length) {
        statuses.forEach((status: any, itemIndex: number) => {
          result.push({
            event_key: eventKey(rawBody, `${entryIndex}:${changeIndex}:status:${itemIndex}`),
            waba_id: wabaId || null,
            phone_number_id: phoneNumberId || null,
            event_type: `${field}:status`,
            external_message_id: status?.id ? String(status.id) : null,
            payload: { object: payload?.object || null, entryId: wabaId || null, field, metadata: value?.metadata || null, status },
            contactPhone: cleanPhone(status?.recipient_id),
            status,
          })
        })
      }

      if (!messages.length && !statuses.length) {
        result.push({
          event_key: eventKey(rawBody, `${entryIndex}:${changeIndex}:change`),
          waba_id: wabaId || null,
          phone_number_id: phoneNumberId || null,
          event_type: field,
          external_message_id: null,
          payload: { object: payload?.object || null, entryId: wabaId || null, field, value },
        })
      }
    })
  })

  if (!result.length) {
    result.push({
      event_key: eventKey(rawBody, 'raw'),
      waba_id: null,
      phone_number_id: null,
      event_type: String(payload?.object || 'unknown'),
      external_message_id: null,
      payload: { raw: payload },
    })
  }
  return result
}

async function conversationFor(companyId: string, phone: string, name: string, preview: string, inboundAt: string) {
  const query = `whatsapp_cloud_conversations?company_id=eq.${encodeURIComponent(companyId)}&customer_phone=eq.${encodeURIComponent(phone)}&select=id,unread_count&limit=1`
  const currentResponse = await adminRest(query)
  const currentRows = await currentResponse?.json().catch(() => [])
  const current = Array.isArray(currentRows) ? currentRows[0] : null
  const patch = {
    customer_name: name || null,
    status: 'open',
    unread_count: Number(current?.unread_count || 0) + 1,
    last_message_preview: preview.slice(0, 280),
    last_message_at: inboundAt,
    last_inbound_at: inboundAt,
    updated_at: new Date().toISOString(),
  }
  if (current?.id) {
    await adminRest(`whatsapp_cloud_conversations?id=eq.${encodeURIComponent(String(current.id))}`, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch),
    })
    return String(current.id)
  }
  const insert = await adminRest('whatsapp_cloud_conversations', {
    method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ company_id: companyId, customer_phone: phone, ...patch }),
  })
  const rows = await insert?.json().catch(() => [])
  return Array.isArray(rows) && rows[0]?.id ? String(rows[0].id) : ''
}

async function persistInbound(companyId: string, item: ExtractedEvent, receivedAt: string) {
  const phone = cleanPhone(item.contactPhone)
  const message = item.message
  const externalId = String(item.external_message_id || '')
  if (!phone || !message || !externalId) return

  const existing = await adminRest(`whatsapp_cloud_messages?external_message_id=eq.${encodeURIComponent(externalId)}&select=id&limit=1`)
  const existingRows = await existing?.json().catch(() => [])
  if (Array.isArray(existingRows) && existingRows[0]?.id) return

  const body = messageBody(message)
  const createdAt = metaTimestamp(message?.timestamp, receivedAt)
  const conversationId = await conversationFor(companyId, phone, String(item.contactName || ''), body, createdAt)
  if (!conversationId) return

  await adminRest('whatsapp_cloud_messages', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      company_id: companyId,
      conversation_id: conversationId,
      external_message_id: externalId,
      direction: 'inbound',
      message_type: String(message?.type || 'unknown'),
      body,
      status: 'received',
      payload: message,
      created_at: createdAt,
    }),
  })
}

async function persistStatus(companyId: string, item: ExtractedEvent, receivedAt: string) {
  const status = item.status
  const externalId = String(item.external_message_id || '')
  if (!status || !externalId) return
  const value = String(status?.status || 'unknown').toLowerCase()
  const timestamp = metaTimestamp(status?.timestamp, receivedAt)
  const patch: Record<string, unknown> = { status: value, payload: status }
  if (value === 'sent') patch.sent_at = timestamp
  if (value === 'delivered') patch.delivered_at = timestamp
  if (value === 'read') patch.read_at = timestamp
  await adminRest(
    `whatsapp_cloud_messages?company_id=eq.${encodeURIComponent(companyId)}&external_message_id=eq.${encodeURIComponent(externalId)}`,
    { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch) },
  )
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  return Response.json({ ok: false, error: 'verification_failed' }, { status: 403 })
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const appSecret = (process.env.META_WHATSAPP_APP_SECRET || '').trim()

  if (!appSecret) {
    console.warn('[meta-whatsapp-webhook] META_WHATSAPP_APP_SECRET no configurado; evento descartado')
    return Response.json({ received: true, processed: false }, { status: 200 })
  }

  const signature = request.headers.get('x-hub-signature-256')
  if (!validSignature(rawBody, signature, appSecret)) {
    return Response.json({ received: false, error: 'invalid_signature' }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return Response.json({ received: false, error: 'invalid_json' }, { status: 400 })
  }

  if (!(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()) {
    console.warn('[meta-whatsapp-webhook] SUPABASE_SERVICE_ROLE_KEY no configurado; evento verificado pero no persistido')
    return Response.json({ received: true, processed: false }, { status: 200 })
  }

  const receivedAt = new Date().toISOString()
  const extracted = extractEvents(payload, rawBody)
  const companyCache = new Map<string, string | null>()
  const rows: StoredEvent[] = []
  const resolved: Array<{ companyId: string | null; item: ExtractedEvent }> = []

  for (const item of extracted) {
    const cacheKey = `${item.phone_number_id || ''}|${item.waba_id || ''}`
    let companyId = companyCache.get(cacheKey)
    if (companyId === undefined) {
      companyId = await resolveCompany(item.waba_id || '', item.phone_number_id || '')
      companyCache.set(cacheKey, companyId)
    }
    rows.push({
      event_key: item.event_key,
      company_id: companyId,
      waba_id: item.waba_id,
      phone_number_id: item.phone_number_id,
      event_type: item.event_type,
      external_message_id: item.external_message_id,
      payload: item.payload,
      received_at: receivedAt,
    })
    resolved.push({ companyId, item })
  }

  const insert = await adminRest('whatsapp_cloud_events?on_conflict=event_key', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  })
  if (!insert?.ok) {
    const detail = await insert?.text().catch(() => '')
    console.error('[meta-whatsapp-webhook] no se pudieron persistir eventos', detail)
    return Response.json({ received: true, processed: false }, { status: 200 })
  }

  for (const { companyId, item } of resolved) {
    if (!companyId) continue
    try {
      if (item.message) await persistInbound(companyId, item, receivedAt)
      if (item.status) await persistStatus(companyId, item, receivedAt)
    } catch (error) {
      console.error('[meta-whatsapp-webhook] error normalizando conversación', error instanceof Error ? error.message : String(error))
    }
  }

  const touchedCompanies = [...new Set(rows.map(row => row.company_id).filter(Boolean))] as string[]
  for (const companyId of touchedCompanies) {
    await adminRest(`whatsapp_cloud_accounts?company_id=eq.${encodeURIComponent(companyId)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ last_webhook_at: receivedAt, updated_at: receivedAt }),
    })
  }

  return Response.json({ received: true, processed: true, events: rows.length }, { status: 200 })
}
