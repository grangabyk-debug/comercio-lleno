import { NextRequest, NextResponse } from 'next/server'

type Terminal = {
  id: string
  pos_id?: string | number | null
  store_id?: string | number | null
  external_pos_id?: string | null
  operating_mode?: string | null
}

const MP_BASE = 'https://api.mercadopago.com'

function accessToken() {
  return process.env.MERCADOPAGO_POINT_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || ''
}

async function mpFetch(path: string, init?: RequestInit) {
  const token = accessToken()
  if (!token) {
    throw new Error('Falta configurar MERCADOPAGO_POINT_ACCESS_TOKEN en el servidor.')
  }

  const response = await fetch(`${MP_BASE}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  })

  const raw = await response.text()
  let data: any = null
  try { data = raw ? JSON.parse(raw) : null } catch { data = { message: raw } }

  if (!response.ok) {
    const message = data?.message || data?.error || data?.cause?.[0]?.description || `Mercado Pago respondió ${response.status}`
    const error = new Error(message) as Error & { status?: number; payload?: unknown }
    error.status = response.status
    error.payload = data
    throw error
  }

  return data
}

export async function GET() {
  try {
    const data = await mpFetch('/terminals/v1/list?limit=50&offset=0')
    const terminals: Terminal[] = Array.isArray(data?.data?.terminals) ? data.data.terminals : []
    return NextResponse.json({
      connected: true,
      terminals,
      count: terminals.length,
      source: process.env.MERCADOPAGO_POINT_ACCESS_TOKEN ? 'point-token' : 'mercadopago-token',
    })
  } catch (error) {
    const err = error as Error & { status?: number }
    return NextResponse.json({ connected: false, terminals: [], error: err.message }, { status: err.status || 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const terminalId = String(body?.terminal_id || '').trim()
    if (!terminalId) return NextResponse.json({ error: 'terminal_id es obligatorio' }, { status: 400 })

    const data = await mpFetch('/terminals/v1/setup', {
      method: 'PATCH',
      body: JSON.stringify({ terminals: [{ id: terminalId, operating_mode: 'PDV' }] }),
    })
    return NextResponse.json({ ok: true, data })
  } catch (error) {
    const err = error as Error & { status?: number }
    return NextResponse.json({ error: err.message }, { status: err.status || 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const terminalId = String(body?.terminal_id || '').trim()
    const amount = Number(body?.amount || 0)
    const reference = String(body?.external_reference || `preview-${Date.now()}`).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64)

    if (!terminalId) return NextResponse.json({ error: 'Elegí una terminal Point.' }, { status: 400 })
    if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: 'El importe debe ser mayor a cero.' }, { status: 400 })

    const idempotencyKey = crypto.randomUUID()
    const data = await mpFetch('/v1/orders', {
      method: 'POST',
      headers: { 'X-Idempotency-Key': idempotencyKey },
      body: JSON.stringify({
        type: 'point',
        external_reference: reference,
        expiration_time: 'PT5M',
        transactions: { payments: [{ amount: amount.toFixed(2) }] },
        config: {
          point: {
            terminal_id: terminalId,
            print_on_terminal: 'no_ticket',
          },
        },
        description: 'Cobro Comercio Lleno',
      }),
    })

    return NextResponse.json({ ok: true, order: data })
  } catch (error) {
    const err = error as Error & { status?: number }
    return NextResponse.json({ error: err.message }, { status: err.status || 500 })
  }
}
