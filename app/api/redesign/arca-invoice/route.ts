import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const MAX_ARCA_ATTEMPTS = 3
const RETRY_DELAYS_MS = [350, 900]

function errorText(data: unknown, raw: string) {
  if (data && typeof data === 'object' && 'error' in data) {
    const value = (data as { error?: unknown }).error
    if (value != null) return String(value)
  }
  return raw
}

function isRetryableArcaError(status: number, data: unknown, raw: string) {
  if (status < 500) return false
  const message = errorText(data, raw)
  return /(^|\D)501(\D|$)|error interno de base de datos|FECompUltimoAutorizado|temporar|timeout|service unavailable/i.test(message)
}

export async function POST(req: NextRequest) {
  const authorization = req.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ ok: false, error: 'Sesión no disponible' }, { status: 401 })
  }

  let body: any = {}
  try { body = await req.json() } catch {}

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 22000)
  try {
    for (let attempt = 0; attempt < MAX_ARCA_ATTEMPTS; attempt += 1) {
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

      const retry = attempt < MAX_ARCA_ATTEMPTS - 1 && isRetryableArcaError(response.status, data, text)
      if (!retry) return NextResponse.json(data, { status: response.status })

      await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS_MS[attempt] ?? 900))
    }

    return NextResponse.json({ ok: false, unavailable: true, error: 'ARCA no respondió después de varios intentos' }, { status: 503 })
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'ARCA no respondió dentro del tiempo esperado'
      : error instanceof Error ? error.message : String(error)
    return NextResponse.json({ ok: false, unavailable: true, error: message }, { status: 503 })
  } finally {
    clearTimeout(timeout)
  }
}
