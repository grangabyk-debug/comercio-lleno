import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const EVOLUTION_URL = (process.env.EVOLUTION_API_URL || '').replace(/\/+$/, '')
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || ''

function instanceName(companyId: string) {
  return `cl-${companyId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 40).toLowerCase()}`
}

function decodeJwtSub(token: string) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return ''
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return String(parsed?.sub || '')
  } catch {
    return ''
  }
}

async function authorize(req: NextRequest) {
  const authorization = req.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) throw new Error('UNAUTHORIZED')
  const token = authorization.slice(7).trim()
  const userId = decodeJwtSub(token)
  if (!userId) throw new Error('UNAUTHORIZED')

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=company_id,role,active&limit=1`,
    { headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${token}` }, cache: 'no-store' },
  )
  const rows = await response.json().catch(() => [])
  const profile = Array.isArray(rows) ? rows[0] : null
  if (!response.ok || !profile?.company_id || profile.active === false) throw new Error('UNAUTHORIZED')
  if (profile.role !== 'owner') throw new Error('OWNER_ONLY')
  return String(profile.company_id)
}

export async function POST(req: NextRequest) {
  let companyId = ''
  try {
    companyId = await authorize(req)
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNAUTHORIZED'
    return NextResponse.json(
      { ok: false, error: code === 'OWNER_ONLY' ? 'Sólo el propietario puede desvincular WhatsApp.' : 'Sesión no disponible.' },
      { status: code === 'OWNER_ONLY' ? 403 : 401 },
    )
  }

  if (!EVOLUTION_URL || !EVOLUTION_KEY) {
    return NextResponse.json({ ok: false, error: 'Evolution no está configurado.' }, { status: 503 })
  }

  const instance = instanceName(companyId)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)

  try {
    const response = await fetch(`${EVOLUTION_URL}/instance/logout/${encodeURIComponent(instance)}`, {
      method: 'DELETE',
      headers: { apikey: EVOLUTION_KEY, 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    })
    const text = await response.text()
    let data: any = null
    try { data = text ? JSON.parse(text) : null } catch { data = text }

    if (!response.ok) {
      const message = String(data?.response?.message?.[0] || data?.message || data?.error || '')
      if (response.status === 404 || /not connected|does not exist|no está conectada/i.test(message)) {
        return NextResponse.json({ ok: true, disconnected: true, instance, alreadyDisconnected: true })
      }
      return NextResponse.json({ ok: false, error: message || `Evolution respondió ${response.status}` }, { status: 502 })
    }

    return NextResponse.json({ ok: true, disconnected: true, instance })
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'El servidor de WhatsApp no respondió a tiempo.'
      : error instanceof Error ? error.message : String(error)
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  } finally {
    clearTimeout(timeout)
  }
}
