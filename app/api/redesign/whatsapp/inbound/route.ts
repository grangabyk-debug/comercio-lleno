import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { processSellerMessage } from '../seller/engine'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const EVOLUTION_URL = (process.env.EVOLUTION_API_URL || '').replace(/\/+$/, '')
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || ''
const WEBHOOK_SECRET = process.env.EVOLUTION_WEBHOOK_SECRET || ''
const CENTRAL_URL = 'https://pejkycdttogpmmdntzuq.supabase.co'
const CENTRAL_KEY = 'sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const MAX_WEBHOOK_BYTES = 64 * 1024
const MAX_TEXT_LENGTH = 1500
const MAX_MESSAGES_PER_MINUTE = 30

function companyIdFromInstance(instance: string) {
  const raw = instance.replace(/^cl-/, '').replace(/[^a-f0-9]/gi, '').toLowerCase()
  if (raw.length !== 32) return ''
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`
}

function textFrom(data: any) {
  return String(
    data?.message?.conversation ||
    data?.message?.extendedTextMessage?.text ||
    data?.message?.imageMessage?.caption ||
    data?.message?.videoMessage?.caption ||
    data?.message?.buttonsResponseMessage?.selectedDisplayText ||
    data?.message?.listResponseMessage?.title ||
    '',
  ).trim().slice(0, MAX_TEXT_LENGTH)
}

function phoneFromJid(value: unknown) {
  return String(value || '').split('@')[0].replace(/\D/g, '').slice(0, 18)
}

function secretMatches(received: string, expected: string) {
  if (!received || !expected) return false
  const a = Buffer.from(received)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function serviceRest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(`Supabase ${response.status}`)
  return data
}

async function serviceRpc(name: string, body: Record<string, unknown>) {
  return serviceRest(`rpc/${name}`, { method: 'POST', body: JSON.stringify(body) })
}

async function companyName(companyId: string) {
  const rows = await serviceRest(`companies?id=eq.${encodeURIComponent(companyId)}&select=name&limit=1`)
  return String(rows?.[0]?.name || 'Mi comercio')
}

async function centralRuntime(companyId: string) {
  const response = await fetch(`${CENTRAL_URL}/rest/v1/rpc/commerce_runtime_entitlements`, {
    method: 'POST',
    headers: { apikey: CENTRAL_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_company_id: companyId }),
    cache: 'no-store',
  })
  const rows = await response.json().catch(() => [])
  if (!response.ok) throw new Error('Central unavailable')
  const row = Array.isArray(rows) ? rows[0] : null
  return {
    found: Boolean(row),
    accessPaused: row?.access_paused === true,
    aiSeller: row?.whatsapp_ai_seller === true,
  }
}

async function rateAllowed(companyId: string, phone: string) {
  const conversations = await serviceRest(
    `whatsapp_ai_conversations?company_id=eq.${encodeURIComponent(companyId)}&customer_phone=eq.${encodeURIComponent(phone)}&select=id&limit=1`,
  )
  const conversationId = String(conversations?.[0]?.id || '')
  if (!conversationId) return true
  const since = new Date(Date.now() - 60_000).toISOString()
  const rows = await serviceRest(
    `whatsapp_ai_messages?conversation_id=eq.${encodeURIComponent(conversationId)}&direction=eq.inbound&created_at=gte.${encodeURIComponent(since)}&select=id&limit=${MAX_MESSAGES_PER_MINUTE + 1}`,
  )
  return !Array.isArray(rows) || rows.length < MAX_MESSAGES_PER_MINUTE
}

async function send(instance: string, number: string, text: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)
  try {
    const response = await fetch(`${EVOLUTION_URL}/message/sendText/${encodeURIComponent(instance)}`, {
      method: 'POST',
      headers: { apikey: EVOLUTION_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ number, text, delay: 600 }),
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Evolution ${response.status}`)
  } finally {
    clearTimeout(timeout)
  }
}

export async function POST(req: NextRequest) {
  if (!SERVICE_KEY || !EVOLUTION_URL || !EVOLUTION_KEY || !WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: 'webhook_unavailable' }, { status: 503 })
  }

  const contentLength = Number(req.headers.get('content-length') || 0)
  if (contentLength > MAX_WEBHOOK_BYTES) {
    return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 })
  }

  const received = req.headers.get('x-whatsapp-webhook-secret') || req.headers.get('x-evolution-webhook-secret') || ''
  if (!secretMatches(received, WEBHOOK_SECRET)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const payload = await req.json().catch(() => ({}))
  const event = String(payload?.event || payload?.type || '').toLowerCase()
  if (event && event !== 'messages.upsert') return NextResponse.json({ ok: true, ignored: true, event })

  const instance = String(payload?.instance || payload?.instanceName || payload?.data?.instance || '')
  const companyId = companyIdFromInstance(instance)
  if (!companyId) return NextResponse.json({ ok: true, ignored: true, reason: 'unknown_instance' })

  const data = Array.isArray(payload?.data) ? payload.data[0] : payload?.data || payload
  if (data?.key?.fromMe === true) return NextResponse.json({ ok: true, ignored: true, reason: 'from_me' })

  const remoteJid = String(data?.key?.remoteJid || data?.remoteJid || '')
  if (!remoteJid || /@g\.us$|status@broadcast/i.test(remoteJid)) {
    return NextResponse.json({ ok: true, ignored: true, reason: 'not_direct_chat' })
  }

  const phone = phoneFromJid(remoteJid)
  const text = textFrom(data)
  const externalMessageId = String(data?.key?.id || payload?.id || '').slice(0, 180)
  if (phone.length < 8 || !text) return NextResponse.json({ ok: true, ignored: true, reason: 'no_text' })

  let locked = false
  try {
    const central = await centralRuntime(companyId)
    if (!central.found || central.accessPaused || !central.aiSeller) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'feature_disabled' })
    }
    if (!(await rateAllowed(companyId, phone))) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'rate_limited' })
    }

    locked = (await serviceRpc('claim_whatsapp_processing_lock', { p_company_id: companyId, p_phone: phone })) === true
    if (!locked) return NextResponse.json({ ok: false, error: 'busy' }, { status: 503 })

    const result = await processSellerMessage({
      token: SERVICE_KEY,
      companyId,
      companyName: await companyName(companyId),
      phone,
      text,
      externalMessageId,
      commitSale: true,
    })
    if (result?.reply) await send(instance, phone, String(result.reply))
    return NextResponse.json({ ok: true, processed: true, duplicate: Boolean(result?.duplicate) })
  } catch (error) {
    console.error('WhatsApp inbound processing failed', error instanceof Error ? error.message : 'unknown_error')
    return NextResponse.json({ ok: false, error: 'processing_failed' }, { status: 500 })
  } finally {
    if (locked) {
      try { await serviceRpc('release_whatsapp_processing_lock', { p_company_id: companyId, p_phone: phone }) } catch {}
    }
  }
}
