import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const RESEND_API = 'https://api.resend.com'
const PUBLIC_KEY_B64 = 'cw3kj4oEdRd5jpp+AwobV13UZbqsGvVDVhqRDYY11w4='

type AdminBody = {
  version: 1
  issuedAt: number
  nonce: string
  action: 'inspect_domain' | 'verify_domain' | 'enable_receiving' | 'create_inbound_webhook' | 'list_webhooks' | 'get_received_email'
  domain?: string
  webhookEndpoint?: string
  emailId?: string
}

function b64ToBytes(value: string) {
  return Uint8Array.from(Buffer.from(value, 'base64'))
}

async function validSignature(raw: string, signatureB64: string) {
  try {
    const key = await crypto.subtle.importKey('raw', b64ToBytes(PUBLIC_KEY_B64), { name: 'Ed25519' }, false, ['verify'])
    return crypto.subtle.verify({ name: 'Ed25519' }, key, b64ToBytes(signatureB64), new TextEncoder().encode(raw))
  } catch {
    return false
  }
}

async function resend(apiKey: string, path: string, init?: RequestInit) {
  const response = await fetch(`${RESEND_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  const data = await response.json().catch(() => ({}))
  return { response, data }
}

function allowedDomain(value: unknown) {
  const domain = String(value ?? '').trim().toLowerCase()
  return ['postulamejor.com', 'comerciolleno.com', 'habitacionllena.com', 'comandallena.com'].includes(domain) ? domain : null
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ ok: false, error: 'mail_provider_not_configured' }, { status: 503 })

  const raw = await req.text()
  const signature = req.headers.get('x-llena-signature') || ''
  if (!raw || raw.length > 30_000 || !signature || !(await validSignature(raw, signature))) {
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 401 })
  }

  let body: AdminBody
  try {
    body = JSON.parse(raw) as AdminBody
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  if (body.version !== 1 || !Number.isFinite(body.issuedAt) || Math.abs(Date.now() - body.issuedAt) > 5 * 60_000) {
    return NextResponse.json({ ok: false, error: 'expired_request' }, { status: 401 })
  }
  if (!/^[A-Za-z0-9_-]{16,120}$/.test(String(body.nonce || ''))) {
    return NextResponse.json({ ok: false, error: 'invalid_nonce' }, { status: 400 })
  }

  if (body.action === 'list_webhooks') {
    const { response, data } = await resend(apiKey, '/webhooks')
    return NextResponse.json(response.ok ? { ok: true, data } : { ok: false, error: 'provider_error', data }, { status: response.ok ? 200 : 502 })
  }

  if (body.action === 'get_received_email') {
    const emailId = String(body.emailId || '').trim()
    if (!/^[A-Za-z0-9-]{20,80}$/.test(emailId)) return NextResponse.json({ ok: false, error: 'invalid_email_id' }, { status: 400 })
    const { response, data } = await resend(apiKey, `/emails/receiving/${encodeURIComponent(emailId)}`)
    return NextResponse.json(response.ok ? { ok: true, data } : { ok: false, error: 'provider_error' }, { status: response.ok ? 200 : 502 })
  }

  const domain = allowedDomain(body.domain)
  if (!domain) return NextResponse.json({ ok: false, error: 'invalid_domain' }, { status: 400 })

  const listed = await resend(apiKey, '/domains')
  if (!listed.response.ok) return NextResponse.json({ ok: false, error: 'provider_error' }, { status: 502 })
  const row = Array.isArray(listed.data?.data) ? listed.data.data.find((item: any) => String(item?.name || '').toLowerCase() === domain) : null
  if (!row?.id) return NextResponse.json({ ok: false, error: 'domain_not_found' }, { status: 404 })

  if (body.action === 'inspect_domain') {
    const current = await resend(apiKey, `/domains/${encodeURIComponent(row.id)}`)
    return NextResponse.json(current.response.ok ? { ok: true, data: current.data } : { ok: false, error: 'provider_error' }, { status: current.response.ok ? 200 : 502 })
  }

  if (body.action === 'verify_domain') {
    const verified = await resend(apiKey, `/domains/${encodeURIComponent(row.id)}/verify`, { method: 'POST' })
    return NextResponse.json(verified.response.ok ? { ok: true, data: verified.data } : { ok: false, error: 'provider_error', data: verified.data }, { status: verified.response.ok ? 200 : 502 })
  }

  if (body.action === 'enable_receiving') {
    const updated = await resend(apiKey, `/domains/${encodeURIComponent(row.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ capabilities: { receiving: 'enabled' } }),
    })
    return NextResponse.json(updated.response.ok ? { ok: true, data: updated.data } : { ok: false, error: 'provider_error', data: updated.data }, { status: updated.response.ok ? 200 : 502 })
  }

  if (body.action === 'create_inbound_webhook') {
    const endpoint = String(body.webhookEndpoint || '').trim()
    if (!endpoint.startsWith('https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/llena-mail-inbound')) {
      return NextResponse.json({ ok: false, error: 'invalid_webhook_endpoint' }, { status: 400 })
    }
    const created = await resend(apiKey, '/webhooks', {
      method: 'POST',
      body: JSON.stringify({ endpoint, events: ['email.received'] }),
    })
    return NextResponse.json(created.response.ok ? { ok: true, data: created.data } : { ok: false, error: 'provider_error', data: created.data }, { status: created.response.ok ? 200 : 502 })
  }

  return NextResponse.json({ ok: false, error: 'unsupported_action' }, { status: 400 })
}
