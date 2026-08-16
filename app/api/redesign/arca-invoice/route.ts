import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const MAX_ARCA_ATTEMPTS = 2
const ATTEMPT_TIMEOUT_MS = 15000
const RETRY_DELAY_MS = 600

function errorText(data: unknown, raw: string) {
  if (data && typeof data === 'object' && 'error' in data) {
    const value = (data as { error?: unknown }).error
    if (value != null) return String(value)
  }
  return raw
}

function invoiceErrorText(data: unknown) {
  if (!data || typeof data !== 'object' || !('invoice' in data)) return ''
  const invoice = (data as { invoice?: { errors?: Array<{ code?: unknown; msg?: unknown }> } }).invoice
  if (!Array.isArray(invoice?.errors)) return ''
  return invoice.errors.map(error => `${String(error?.code ?? '')}: ${String(error?.msg ?? '')}`).join(' | ')
}

function isPendingResponse(status: number, data: unknown) {
  return status === 409 && Boolean(data && typeof data === 'object' && 'pending' in data && (data as { pending?: unknown }).pending)
}

function isTransientArcaFailure(status: number, data: unknown, raw: string) {
  const message = `${errorText(data, raw)} ${invoiceErrorText(data)}`
  if (isPendingResponse(status, data)) return true
  return /(^|\D)(500|501)(\D|$)|error interno de aplicaci[oó]n|error interno de base de datos|FECAESolicitar|FECompUltimoAutorizado|connection request timed out|temporar|timeout|service unavailable/i.test(message)
}

function isRetryableArcaError(status: number, data: unknown, raw: string) {
  if (isPendingResponse(status, data)) return true
  if (status < 500) return false
  const message = errorText(data, raw)
  return /(^|\D)501(\D|$)|error interno de base de datos|FECompUltimoAutorizado|temporar|timeout|service unavailable/i.test(message)
}

function transientResponse(data: unknown) {
  const detail = invoiceErrorText(data) || (data && typeof data === 'object' && 'error' in data ? String((data as { error?: unknown }).error ?? '') : '')
  const payload = data && typeof data === 'object' ? data as Record<string, unknown> : {}
  return {
    ...payload,
    ok: false,
    unavailable: true,
    transient: true,
    error: detail
      ? `ARCA está temporalmente inestable. La venta puede guardarse como Pendiente ARCA. ${detail}`
      : 'ARCA está temporalmente inestable. La venta puede guardarse como Pendiente ARCA.',
  }
}

async function wait(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(req: NextRequest) {
  const authorization = req.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ ok: false, error: 'Sesión no disponible' }, { status: 401 })
  }

  let body: any = {}
  try { body = await req.json() } catch {}

  let lastResponse: { status: number; data: unknown } | null = null
  let lastTimeout = false

  for (let attempt = 0; attempt < MAX_ARCA_ATTEMPTS; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS)
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/arca-invoice`, {
        method: 'POST',
        headers: {
          apikey: PUBLISHABLE_KEY,
          Authorization: authorization,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
        signal: controller.signal,
      })
      const text = await response.text()
      let data: unknown = null
      try { data = text ? JSON.parse(text) : null } catch { data = { ok: false, error: text || 'Respuesta inválida de ARCA' } }
      lastResponse = { status: response.status, data }
      lastTimeout = false

      const retry = attempt < MAX_ARCA_ATTEMPTS - 1 && isRetryableArcaError(response.status, data, text)
      if (retry) {
        // Reintentamos sólo fallos previos a la emisión (por ejemplo FECompUltimoAutorizado).
        // Un error de FECAESolicitar se deriva a contingencia para evitar una posible doble emisión.
      } else if (isTransientArcaFailure(response.status, data, text)) {
        return NextResponse.json(transientResponse(data), { status: 503 })
      } else {
        return NextResponse.json(data, { status: response.status })
      }
    } catch (error) {
      const aborted = error instanceof Error && error.name === 'AbortError'
      lastTimeout = aborted
      if (!aborted || attempt >= MAX_ARCA_ATTEMPTS - 1) {
        const message = aborted
          ? 'ARCA no completó la operación fiscal dentro del tiempo esperado'
          : error instanceof Error ? error.message : String(error)
        return NextResponse.json({ ok: false, unavailable: true, error: message }, { status: 503 })
      }
    } finally {
      clearTimeout(timeout)
    }

    await wait(RETRY_DELAY_MS)
  }

  if (lastResponse) {
    if (isTransientArcaFailure(lastResponse.status, lastResponse.data, JSON.stringify(lastResponse.data))) {
      return NextResponse.json(transientResponse(lastResponse.data), { status: 503 })
    }
    return NextResponse.json(lastResponse.data, { status: lastResponse.status })
  }
  return NextResponse.json({
    ok: false,
    unavailable: true,
    error: lastTimeout ? 'ARCA no completó la operación fiscal dentro del tiempo esperado' : 'ARCA no respondió correctamente',
  }, { status: 503 })
}
