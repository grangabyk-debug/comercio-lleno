import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const EVOLUTION_URL = (process.env.EVOLUTION_API_URL || '').replace(/\/+$/, '')
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || ''

type PreviewAction = 'status' | 'connect' | 'send'

type AuthContext = {
  companyId: string
  companyName: string
  role: string
}

function instanceName(companyId: string) {
  return `cl-${companyId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 40).toLowerCase()}`
}

function evolutionConfigured() {
  return Boolean(EVOLUTION_URL && EVOLUTION_KEY)
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

async function authorize(req: NextRequest): Promise<AuthContext> {
  const authorization = req.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) throw new Error('UNAUTHORIZED')
  const token = authorization.slice(7).trim()
  const userId = decodeJwtSub(token)
  if (!userId) throw new Error('UNAUTHORIZED')

  const profileResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=company_id,role,active&limit=1`,
    {
      headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
  )
  const profiles = await profileResponse.json().catch(() => [])
  const profile = Array.isArray(profiles) ? profiles[0] : null
  if (!profileResponse.ok || !profile?.company_id || profile.active === false) throw new Error('UNAUTHORIZED')
  if (profile.role !== 'owner') throw new Error('OWNER_ONLY')

  const companyResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(profile.company_id)}&select=id,name&limit=1`,
    {
      headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
  )
  const companies = await companyResponse.json().catch(() => [])
  const company = Array.isArray(companies) ? companies[0] : null
  if (!companyResponse.ok || !company?.id) throw new Error('UNAUTHORIZED')

  return {
    companyId: String(company.id),
    companyName: String(company.name || 'Mi comercio'),
    role: String(profile.role),
  }
}

async function evo(path: string, init: RequestInit = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)
  try {
    const response = await fetch(`${EVOLUTION_URL}${path}`, {
      ...init,
      headers: {
        apikey: EVOLUTION_KEY,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
      cache: 'no-store',
      signal: controller.signal,
    })
    const text = await response.text()
    let data: any = null
    try { data = text ? JSON.parse(text) : null } catch { data = text }
    return { response, data, text }
  } finally {
    clearTimeout(timeout)
  }
}

function stateFrom(data: any) {
  return String(data?.instance?.state || data?.state || data?.connectionStatus || '').toLowerCase()
}

async function readConnection(instance: string) {
  const { response, data } = await evo(`/instance/connectionState/${encodeURIComponent(instance)}`)
  if (response.status === 404) return { connected: false, state: 'close', missing: true, raw: data }
  if (response.status === 503 && (data?.code === 'LICENSE_REQUIRED' || /not activated/i.test(String(data?.error || data?.message || '')))) {
    return { connected: false, state: 'license_required', licenseRequired: true, registerUrl: data?.register_url || null, raw: data }
  }
  if (!response.ok) return { connected: false, state: 'error', raw: data }
  const state = stateFrom(data)
  return { connected: state === 'open' || state === 'connected', state: state || 'unknown', raw: data }
}

function pickQr(data: any) {
  const sources = [data, data?.qrcode, data?.instance?.qrcode]
  for (const source of sources) {
    if (!source) continue
    const base64 = typeof source.base64 === 'string' ? source.base64 : ''
    const code = typeof source.code === 'string' ? source.code : ''
    const pairingCode = typeof source.pairingCode === 'string' ? source.pairingCode : ''
    const count = Number(source.count || 0)
    if (base64 || code || pairingCode || count) return { base64, code, pairingCode, count }
  }
  return { base64: '', code: '', pairingCode: '', count: 0 }
}

async function createOrConnect(instance: string) {
  const current = await readConnection(instance)
  if (current.connected) return { connected: true, state: current.state, qr: null }
  if (current.licenseRequired) return { connected: false, state: current.state, licenseRequired: true, registerUrl: current.registerUrl, qr: null }

  let createData: any = null
  if (current.missing) {
    const created = await evo('/instance/create', {
      method: 'POST',
      body: JSON.stringify({ instanceName: instance, integration: 'WHATSAPP-BAILEYS', qrcode: true }),
    })
    createData = created.data
    if (created.response.status === 503 && (createData?.code === 'LICENSE_REQUIRED' || /not activated/i.test(String(createData?.error || createData?.message || '')))) {
      return { connected: false, state: 'license_required', licenseRequired: true, registerUrl: createData?.register_url || null, qr: null }
    }
    const message = JSON.stringify(createData || '')
    if (!created.response.ok && !/already|exists|existente|já existe/i.test(message)) {
      throw new Error(createData?.response?.message?.[0] || createData?.message || createData?.error || `Evolution respondió ${created.response.status}`)
    }
  }

  const fromCreate = pickQr(createData)
  if (fromCreate.base64 || fromCreate.code || fromCreate.pairingCode) {
    return { connected: false, state: 'connecting', qr: fromCreate }
  }

  const connected = await evo(`/instance/connect/${encodeURIComponent(instance)}`)
  if (connected.response.status === 503 && (connected.data?.code === 'LICENSE_REQUIRED' || /not activated/i.test(String(connected.data?.error || connected.data?.message || '')))) {
    return { connected: false, state: 'license_required', licenseRequired: true, registerUrl: connected.data?.register_url || null, qr: null }
  }
  if (!connected.response.ok) {
    throw new Error(connected.data?.response?.message?.[0] || connected.data?.message || connected.data?.error || `No se pudo generar el QR (${connected.response.status})`)
  }
  return { connected: false, state: 'connecting', qr: pickQr(connected.data) }
}

function normalizeNumber(value: unknown) {
  return String(value || '').replace(/\D/g, '').slice(0, 18)
}

function money(value: unknown) {
  const n = Number(value || 0)
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(Number.isFinite(n) ? n : 0)
}

function presetText(companyName: string, preset: string, body: any) {
  if (preset === 'ticket') {
    const ticket = String(body?.ticketNumber || '102').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 20) || '102'
    return `🧾 ${companyName}\nGracias por tu compra.\nTicket #${ticket}\nTotal: ${money(body?.total || 5500)}`
  }
  if (preset === 'ready') return `✅ ${companyName}\nTu pedido ya está listo para retirar.`
  return `✅ Mensaje de prueba de ${companyName}\nWhatsApp quedó conectado correctamente con Comercio Lleno.`
}

async function sendText(instance: string, number: string, text: string) {
  const first = await evo(`/message/sendText/${encodeURIComponent(instance)}`, {
    method: 'POST',
    body: JSON.stringify({ number, text, delay: 600 }),
  })
  if (first.response.ok) return first.data

  const firstMessage = JSON.stringify(first.data || '')
  if (/textMessage|undefined|schema|validation/i.test(firstMessage)) {
    const legacy = await evo(`/message/sendText/${encodeURIComponent(instance)}`, {
      method: 'POST',
      body: JSON.stringify({ number, options: { delay: 600, presence: 'composing' }, textMessage: { text } }),
    })
    if (legacy.response.ok) return legacy.data
    throw new Error(legacy.data?.response?.message?.[0] || legacy.data?.message || legacy.data?.error || `Evolution respondió ${legacy.response.status}`)
  }
  throw new Error(first.data?.response?.message?.[0] || first.data?.message || first.data?.error || `Evolution respondió ${first.response.status}`)
}

export async function POST(req: NextRequest) {
  let auth: AuthContext
  try {
    auth = await authorize(req)
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNAUTHORIZED'
    return NextResponse.json(
      { ok: false, error: code === 'OWNER_ONLY' ? 'Sólo el propietario puede configurar WhatsApp.' : 'Sesión no disponible.' },
      { status: code === 'OWNER_ONLY' ? 403 : 401 },
    )
  }

  const body = await req.json().catch(() => ({}))
  const action = String(body?.action || 'status') as PreviewAction
  const instance = instanceName(auth.companyId)

  if (!evolutionConfigured()) {
    return NextResponse.json({
      ok: true,
      configured: false,
      connected: false,
      state: 'unconfigured',
      instance,
      message: 'La Preview está lista. Falta configurar EVOLUTION_API_URL y EVOLUTION_API_KEY para generar un QR real.',
    })
  }

  try {
    if (action === 'status') {
      const status = await readConnection(instance)
      return NextResponse.json({ ok: true, configured: true, instance, ...status, raw: undefined })
    }

    if (action === 'connect') {
      const result = await createOrConnect(instance)
      return NextResponse.json({ ok: true, configured: true, instance, ...result })
    }

    if (action === 'send') {
      const status = await readConnection(instance)
      if (!status.connected) return NextResponse.json({ ok: false, error: 'WhatsApp todavía no está conectado.', state: status.state }, { status: 409 })
      const number = normalizeNumber(body?.number)
      if (number.length < 10) return NextResponse.json({ ok: false, error: 'Ingresá el número con código de país y área.' }, { status: 400 })
      const preset = ['test', 'ticket', 'ready'].includes(String(body?.preset)) ? String(body.preset) : 'test'
      const text = presetText(auth.companyName, preset, body)
      const result = await sendText(instance, number, text)
      return NextResponse.json({ ok: true, configured: true, sent: true, preset, preview: text, result })
    }

    return NextResponse.json({ ok: false, error: 'Acción no válida.' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'El servidor de WhatsApp no respondió a tiempo.'
      : error instanceof Error ? error.message : String(error)
    return NextResponse.json({ ok: false, configured: true, instance, error: message }, { status: 502 })
  }
}
