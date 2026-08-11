import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

export async function POST(req: NextRequest) {
  const authorization = req.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ ok: false, error: 'Sesión no disponible' }, { status: 401 })
  }

  let body: any = {}
  try { body = await req.json() } catch {}

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 18000)
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
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'ARCA no respondió dentro del tiempo esperado'
      : error instanceof Error ? error.message : String(error)
    return NextResponse.json({ ok: false, unavailable: true, error: message }, { status: 503 })
  } finally {
    clearTimeout(timeout)
  }
}
