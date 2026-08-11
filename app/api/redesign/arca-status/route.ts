import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

export async function POST(req: NextRequest) {
  const authorization = req.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ connected: false, error: 'Sesión no disponible' }, { status: 401 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 9000)
  const started = Date.now()

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/arca-test`, {
      method: 'POST',
      headers: {
        apikey: PUBLISHABLE_KEY,
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'status' }),
      cache: 'no-store',
      signal: controller.signal,
    })

    let data: any = {}
    try { data = await response.json() } catch {}
    const connected = Boolean(
      response.ok &&
      data?.ok &&
      Array.isArray(data?.points_of_sale) &&
      data?.last_authorized !== undefined &&
      data?.receiver_vat_conditions,
    )

    return NextResponse.json({
      connected,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - started,
      environment: data?.environment || 'homologacion',
      service: data?.service || 'wsfev1',
      pointOfSale: data?.test_point_of_sale ?? null,
      lastAuthorized: data?.last_authorized ?? null,
      readyToIssue: Boolean(data?.ready_to_issue),
      error: connected ? null : (data?.error || 'ARCA no respondió correctamente'),
    }, { status: connected ? 200 : 503 })
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'ARCA no respondió dentro del tiempo esperado'
      : error instanceof Error ? error.message : String(error)
    return NextResponse.json({
      connected: false,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - started,
      error: message,
    }, { status: 503 })
  } finally {
    clearTimeout(timeout)
  }
}
