import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const HEALTH_TTL_MS = 5 * 60 * 1000
const healthCache = new Map<string,{expires:number;body:Record<string,unknown>}>()

function cacheKey(authorization:string){return createHash('sha256').update(authorization).digest('hex').slice(0,32)}
function remember(key:string,body:Record<string,unknown>){
  if(healthCache.size>200){const first=healthCache.keys().next().value;if(first)healthCache.delete(first)}
  healthCache.set(key,{expires:Date.now()+HEALTH_TTL_MS,body})
}

export async function POST(req: NextRequest) {
  const authorization = req.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ connected: false, configured: false, error: 'Sesión no disponible' }, { status: 401 })
  }

  const key=cacheKey(authorization)
  const cached=healthCache.get(key)
  if(cached&&cached.expires>Date.now())return NextResponse.json({...cached.body,cached:true},{status:200})
  if(cached)healthCache.delete(key)

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
    const configured = data?.configured !== false
    const connected = Boolean(
      configured &&
      response.ok &&
      data?.ok &&
      Array.isArray(data?.points_of_sale) &&
      data?.last_authorized !== undefined &&
      data?.receiver_vat_conditions,
    )

    const body={
      connected,
      configured,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - started,
      environment: configured ? (data?.environment || 'homologacion') : null,
      service: configured ? (data?.service || 'wsfev1') : null,
      pointOfSale: configured ? (data?.test_point_of_sale ?? null) : null,
      lastAuthorized: configured ? (data?.last_authorized ?? null) : null,
      readyToIssue: configured ? Boolean(data?.ready_to_issue) : false,
      error: connected ? null : (data?.error || (configured ? 'ARCA no respondió correctamente' : 'ARCA no está configurado para este comercio.')),
    }
    if(connected)remember(key,body)
    return NextResponse.json(body, { status: connected ? 200 : configured ? 503 : 200 })
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'ARCA no respondió dentro del tiempo esperado'
      : error instanceof Error ? error.message : String(error)
    return NextResponse.json({
      connected: false,
      configured: true,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - started,
      error: message,
    }, { status: 503 })
  } finally {
    clearTimeout(timeout)
  }
}
