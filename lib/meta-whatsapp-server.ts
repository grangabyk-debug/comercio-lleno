export const META_WHATSAPP_APP_ID = '1564921658645712'
export const META_WHATSAPP_CONFIG_ID = '1817251942977665'
export const META_WHATSAPP_GRAPH_VERSION = 'v26.0'

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

type Profile = { id: string; company_id: string; role: string; active?: boolean | null }
export type MetaTenantSession = { token: string; userId: string; companyId: string; role: string }

export class MetaWhatsAppError extends Error {
  status: number
  details?: unknown
  constructor(message: string, status = 500, details?: unknown) {
    super(message)
    this.name = 'MetaWhatsAppError'
    this.status = status
    this.details = details
  }
}

function bearerToken(request: Request) {
  return (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
}

export async function requireMetaTenantSession(request: Request, ownerOnly = false): Promise<MetaTenantSession> {
  const token = bearerToken(request)
  if (!token) throw new MetaWhatsAppError('Sesión no disponible.', 401)

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const user = await userResponse.json().catch(() => null)
  if (!userResponse.ok || !user?.id) throw new MetaWhatsAppError('La sesión venció. Volvé a iniciar sesión.', 401)

  const profileResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(String(user.id))}&select=id,company_id,role,active&limit=1`,
    { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` }, cache: 'no-store' },
  )
  const profiles = await profileResponse.json().catch(() => [])
  const profile = (Array.isArray(profiles) ? profiles[0] : null) as Profile | null
  if (!profileResponse.ok || !profile?.company_id || profile.active === false) {
    throw new MetaWhatsAppError('Tu usuario no tiene un comercio activo.', 403)
  }
  if (ownerOnly && profile.role !== 'owner') {
    throw new MetaWhatsAppError('Sólo el propietario puede administrar la conexión oficial de WhatsApp.', 403)
  }

  return { token, userId: String(user.id), companyId: String(profile.company_id), role: String(profile.role || '') }
}

export async function supabaseUserRest(session: MetaTenantSession, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('apikey', SUPABASE_PUBLISHABLE_KEY)
  headers.set('Authorization', `Bearer ${session.token}`)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return fetch(`${SUPABASE_URL}/rest/v1/${path.replace(/^\/+/, '')}`, { ...init, headers, cache: 'no-store' })
}

export function supabaseServiceRoleKey() {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
}

export async function supabaseAdminRest(path: string, init: RequestInit = {}) {
  const serviceRole = supabaseServiceRoleKey()
  if (!serviceRole) throw new MetaWhatsAppError('Falta configurar la credencial segura del servidor para persistir WhatsApp.', 503)
  const headers = new Headers(init.headers)
  headers.set('apikey', serviceRole)
  headers.set('Authorization', `Bearer ${serviceRole}`)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return fetch(`${SUPABASE_URL}/rest/v1/${path.replace(/^\/+/, '')}`, { ...init, headers, cache: 'no-store' })
}

export function metaSystemUserToken() {
  return (process.env.META_WHATSAPP_SYSTEM_USER_ACCESS_TOKEN || '').trim()
}

export function metaAdminSystemUserToken() {
  return (process.env.META_WHATSAPP_ADMIN_SYSTEM_USER_ACCESS_TOKEN || metaSystemUserToken()).trim()
}

export function metaProviderBusinessId() {
  return (process.env.META_WHATSAPP_BUSINESS_ID || '').trim()
}

export function metaProviderSystemUserId() {
  return (process.env.META_WHATSAPP_SYSTEM_USER_ID || '').trim()
}

export function requireMetaSystemUserToken() {
  const token = metaSystemUserToken()
  if (!token) throw new MetaWhatsAppError('La credencial segura de Meta todavía no está cargada en el servidor.', 503)
  return token
}

export async function metaGraphRequest(path: string, init: RequestInit = {}, token = requireMetaSystemUserToken()) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  try {
    const response = await fetch(
      `https://graph.facebook.com/${META_WHATSAPP_GRAPH_VERSION}/${path.replace(/^\/+/, '')}`,
      { ...init, headers, cache: 'no-store', signal: controller.signal },
    )
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = data?.error?.message || data?.message || `Meta respondió ${response.status}`
      throw new MetaWhatsAppError(String(message), response.status, data?.error || data)
    }
    return data
  } catch (error) {
    if (error instanceof MetaWhatsAppError) throw error
    if (error instanceof Error && error.name === 'AbortError') throw new MetaWhatsAppError('Meta no respondió dentro del tiempo esperado.', 504)
    throw new MetaWhatsAppError(error instanceof Error ? error.message : String(error), 502)
  } finally {
    clearTimeout(timer)
  }
}

export function apiError(error: unknown) {
  if (error instanceof MetaWhatsAppError) {
    return Response.json({ ok: false, error: error.message }, { status: error.status })
  }
  console.error('[meta-whatsapp]', error instanceof Error ? error.message : String(error))
  return Response.json({ ok: false, error: 'No se pudo completar la operación con WhatsApp.' }, { status: 500 })
}
