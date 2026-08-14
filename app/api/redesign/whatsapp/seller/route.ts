import { NextRequest, NextResponse } from 'next/server'
import { getSellerFeatureState, normalizePhone, resetSellerConversation, sellerState } from './engine'
import { getTrainingState, processSellerMessageStyled, saveTrainingFeedback, saveTrainingProfile } from './training'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const CENTRAL_ENTITLEMENTS = 'https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/commerce-entitlements'

type Auth = { token: string; companyId: string; companyName: string }
type CentralState = {
  ok?: boolean
  accessPaused?: boolean
  planCode?: string | null
  tenantId?: string | null
  features?: { whatsapp_ai_seller?: boolean; whatsapp_automations?: boolean }
  error?: string
}

function decodeSub(token: string) {
  try {
    const p = token.split('.')[1]
    if (!p) return ''
    return String(JSON.parse(Buffer.from(p, 'base64url').toString('utf8'))?.sub || '')
  } catch { return '' }
}

async function authorize(req: NextRequest): Promise<Auth> {
  const authorization = req.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) throw new Error('UNAUTHORIZED')
  const token = authorization.slice(7).trim()
  const userId = decodeSub(token)
  if (!userId) throw new Error('UNAUTHORIZED')
  const h = { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${token}` }
  const pr = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=company_id,role,active&limit=1`, { headers: h, cache: 'no-store' })
  const profiles = await pr.json().catch(() => [])
  const profile = Array.isArray(profiles) ? profiles[0] : null
  if (!pr.ok || !profile?.company_id || profile.active === false) throw new Error('UNAUTHORIZED')
  if (profile.role !== 'owner') throw new Error('OWNER_ONLY')
  const cr = await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(profile.company_id)}&select=id,name&limit=1`, { headers: h, cache: 'no-store' })
  const companies = await cr.json().catch(() => [])
  const company = Array.isArray(companies) ? companies[0] : null
  if (!cr.ok || !company?.id) throw new Error('UNAUTHORIZED')
  return { token, companyId: String(company.id), companyName: String(company.name || 'Mi comercio') }
}

async function centralState(token: string): Promise<CentralState> {
  const r = await fetch(CENTRAL_ENTITLEMENTS, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}',
    cache: 'no-store',
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d?.error || 'No se pudo consultar Central Llena.')
  return d
}

function mergeFeature(local: any, central: CentralState) {
  return {
    ...(local || {}),
    aiSellerEntitled: central.features?.whatsapp_ai_seller === true,
    automationsEntitled: central.features?.whatsapp_automations === true,
    accessPaused: central.accessPaused === true,
    planCode: central.planCode || null,
    tenantId: central.tenantId || null,
  }
}

export async function POST(req: NextRequest) {
  let auth: Auth
  try {
    auth = await authorize(req)
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNAUTHORIZED'
    return NextResponse.json(
      { ok: false, error: code === 'OWNER_ONLY' ? 'Sólo el propietario puede configurar y probar Vendedor IA WhatsApp.' : 'Sesión no disponible.' },
      { status: code === 'OWNER_ONLY' ? 403 : 401 },
    )
  }

  const body = await req.json().catch(() => ({}))
  const action = String(body?.action || 'state')

  try {
    const central = await centralState(auth.token)

    if (action === 'feature_state') {
      const local = await getSellerFeatureState(auth.token, auth.companyId)
      return NextResponse.json({ ok: true, feature: mergeFeature(local, central) })
    }

    if (action === 'state') {
      const local = await sellerState(auth.token, auth.companyId, String(body?.phone || ''))
      return NextResponse.json({ ok: true, ...local, feature: mergeFeature(local.feature, central) })
    }

    if (action === 'training_state') {
      if (central.features?.whatsapp_ai_seller !== true) return NextResponse.json({ ok: false, error: 'Vendedor IA WhatsApp · S Plus no está habilitado para este cliente.' }, { status: 409 })
      return NextResponse.json({ ok: true, ...(await getTrainingState(auth.token, auth.companyId)) })
    }

    if (action === 'training_profile') {
      if (central.features?.whatsapp_ai_seller !== true) return NextResponse.json({ ok: false, error: 'Vendedor IA WhatsApp · S Plus no está habilitado para este cliente.' }, { status: 409 })
      const persona = await saveTrainingProfile(auth.token, auth.companyId, body?.persona)
      return NextResponse.json({ ok: true, persona })
    }

    if (action === 'training_feedback') {
      if (central.features?.whatsapp_ai_seller !== true) return NextResponse.json({ ok: false, error: 'Vendedor IA WhatsApp · S Plus no está habilitado para este cliente.' }, { status: 409 })
      const rating = Number(body?.rating) === -1 ? -1 : 1
      const row = await saveTrainingFeedback(
        auth.token,
        auth.companyId,
        String(body?.sourceMessageId || ''),
        rating,
        String(body?.correctedResponse || ''),
      )
      return NextResponse.json({ ok: true, feedback: row })
    }

    if (action === 'reset') {
      await resetSellerConversation(auth.token, auth.companyId, String(body?.phone || ''))
      return NextResponse.json({ ok: true })
    }

    if (action === 'message') {
      if (central.accessPaused === true) return NextResponse.json({ ok: false, error: 'La cuenta está pausada desde Central Llena.' }, { status: 409 })
      if (central.features?.whatsapp_ai_seller !== true) return NextResponse.json({ ok: false, error: 'Vendedor IA WhatsApp · S Plus no está habilitado para este cliente.' }, { status: 409 })
      const phone = normalizePhone(body?.phone)
      const text = String(body?.text || '').trim().slice(0, 1500)
      if (phone.length < 10) return NextResponse.json({ ok: false, error: 'Ingresá un número de prueba con código de país y área.' }, { status: 400 })
      if (!text) return NextResponse.json({ ok: false, error: 'Escribí un mensaje para probar al vendedor.' }, { status: 400 })
      return NextResponse.json({
        ok: true,
        ...(await processSellerMessageStyled({
          token: auth.token,
          companyId: auth.companyId,
          companyName: auth.companyName,
          phone,
          text,
          externalMessageId: String(body?.externalMessageId || '') || null,
          commitSale: body?.commitSale === true,
        })),
      })
    }

    return NextResponse.json({ ok: false, error: 'Acción no válida.' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const status = /habilitado|activó|pausada|Central Llena/i.test(message) ? 409 : 500
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}
