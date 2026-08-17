import { createHmac, timingSafeEqual } from 'node:crypto'

export const runtime = 'nodejs'

const VERIFY_TOKEN = 'ComercioLlenoMeta2026'

function validSignature(rawBody: string, signature: string | null, appSecret: string) {
  if (!signature?.startsWith('sha256=')) return false
  const expected = createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex')
  const received = signature.slice('sha256='.length)
  if (received.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected))
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
  const appSecret = process.env.META_WHATSAPP_APP_SECRET || ''

  // Hasta que el App Secret se cargue como variable segura, aceptamos la entrega
  // pero no procesamos eventos. Así Meta puede completar la suscripción sin que
  // datos no verificados entren al sistema.
  if (!appSecret) {
    console.warn('[meta-whatsapp-webhook] META_WHATSAPP_APP_SECRET no configurado; evento descartado')
    return Response.json({ received: true, processed: false }, { status: 200 })
  }

  const signature = request.headers.get('x-hub-signature-256')
  if (!validSignature(rawBody, signature, appSecret)) {
    return Response.json({ received: false, error: 'invalid_signature' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return Response.json({ received: false, error: 'invalid_json' }, { status: 400 })
  }

  // El procesamiento/almacenamiento por tenant se conecta en el siguiente paso.
  console.info('[meta-whatsapp-webhook] evento verificado recibido')
  void payload

  return Response.json({ received: true, processed: false }, { status: 200 })
}
