import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const RESEND_API = 'https://api.resend.com'
const PUBLIC_KEY_B64 = 'cw3kj4oEdRd5jpp+AwobV13UZbqsGvVDVhqRDYY11w4='

const BRANDS = {
  postula: { name: 'Postulá Mejor', domain: 'postulamejor.com' },
  comercio: { name: 'Comercio Lleno', domain: 'comerciolleno.com' },
  habitacion: { name: 'Habitación Llena', domain: 'habitacionllena.com' },
  comanda: { name: 'Comanda Llena', domain: 'comandallena.com' },
} as const

type Brand = keyof typeof BRANDS

type SignedMail = {
  version: 1
  issuedAt: number
  nonce: string
  brand: Brand
  mode: 'transactional' | 'human'
  to: string
  subject: string
  html?: string
  text?: string
  tags?: Array<{ name: string; value: string }>
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

function cleanEmail(value: unknown) {
  const email = String(value ?? '').trim().toLowerCase()
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

function cleanText(value: unknown, max: number) {
  return String(value ?? '').trim().slice(0, max)
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ ok: false, error: 'mail_provider_not_configured' }, { status: 503 })

  const raw = await req.text()
  if (!raw || raw.length > 220_000) return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 })

  const signature = req.headers.get('x-llena-signature') || ''
  if (!signature || !(await validSignature(raw, signature))) {
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 401 })
  }

  let body: SignedMail
  try {
    body = JSON.parse(raw) as SignedMail
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  if (body.version !== 1 || !BRANDS[body.brand]) return NextResponse.json({ ok: false, error: 'invalid_brand' }, { status: 400 })
  if (!Number.isFinite(body.issuedAt) || Math.abs(Date.now() - body.issuedAt) > 5 * 60_000) {
    return NextResponse.json({ ok: false, error: 'expired_request' }, { status: 401 })
  }
  if (!/^[A-Za-z0-9_-]{16,120}$/.test(String(body.nonce || ''))) {
    return NextResponse.json({ ok: false, error: 'invalid_nonce' }, { status: 400 })
  }

  const to = cleanEmail(body.to)
  const subject = cleanText(body.subject, 200)
  const html = typeof body.html === 'string' ? body.html.slice(0, 180_000) : ''
  const text = typeof body.text === 'string' ? body.text.slice(0, 80_000) : ''
  if (!to || !subject || (!html && !text)) return NextResponse.json({ ok: false, error: 'missing_mail_fields' }, { status: 400 })

  const brand = BRANDS[body.brand]
  const human = body.mode === 'human'
  const fromAddress = human ? `hola@${brand.domain}` : `no-reply@${brand.domain}`
  const replyTo = `hola@${brand.domain}`

  const tags = Array.isArray(body.tags)
    ? body.tags.slice(0, 8).map((tag) => ({ name: cleanText(tag?.name, 40), value: cleanText(tag?.value, 80) })).filter((tag) => tag.name && tag.value)
    : []

  const response = await fetch(`${RESEND_API}/emails`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${brand.name} <${fromAddress}>`,
      to: [to],
      subject,
      ...(html ? { html } : {}),
      ...(text ? { text } : {}),
      reply_to: replyTo,
      ...(tags.length ? { tags } : {}),
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    console.error('[llena-mail] provider send failed', response.status, data?.name || data?.message || 'unknown')
    return NextResponse.json({ ok: false, error: 'provider_error' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, id: data?.id ?? null })
}
