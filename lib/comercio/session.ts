import type { DeviceSettings, TenantSession, UserPermissions } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const REFRESH_MARGIN_MS = 10 * 60 * 1000
const DEVELOPER_CREDIT = 'Sistema desarrollado por ComercioLleno.com'

let activeSession: TenantSession | null = null
let refreshTimer: number | null = null
let refreshInFlight: Promise<TenantSession> | null = null
let resumeListenersInstalled = false

const DEFAULT_DEVICE: DeviceSettings = {
  paper: '58',
  autoPrint: true,
  printerMode: 'browser',
  printerName: '',
  receiptCopies: 1,
  receiptAddress: '',
  receiptPhone: '',
  receiptHeader: '',
  receiptFooter: `Gracias por su compra · ${DEVELOPER_CREDIT}`,
  showBusinessName: true,
  showTaxId: true,
  showPaymentMethod: true,
  showCustomer: true,
  showSeller: true,
  showBarcode: false,
  showFiscalData: true,
  compactTicket: false,
}

function withDeveloperCredit(settings: DeviceSettings): DeviceSettings {
  const footer = String(settings.receiptFooter || '').trim()
  if (/Sistema desarrollado por ComercioLleno\.com/i.test(footer)) return settings
  return {
    ...settings,
    receiptFooter: footer ? `${footer} · ${DEVELOPER_CREDIT}` : DEVELOPER_CREDIT,
  }
}

function parsePermissions(value: string | null): UserPermissions {
  try {
    const parsed = JSON.parse(value || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function jwtExpiresAt(token: string) {
  if (typeof window === 'undefined') return 0
  try {
    const payload = token.split('.')[1]
    if (!payload) return 0
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const decoded = JSON.parse(window.atob(padded))
    return Number(decoded?.exp || 0) * 1000
  } catch {
    return 0
  }
}

function tokenExpired(token: string) {
  const expiresAt = jwtExpiresAt(token)
  return Boolean(expiresAt && expiresAt <= Date.now())
}

function shouldRefresh(token: string) {
  const expiresAt = jwtExpiresAt(token)
  return !expiresAt || expiresAt - Date.now() <= REFRESH_MARGIN_MS
}

function clearStoredSession() {
  if (typeof window === 'undefined') return
  ;['cl_access_token','cl_refresh_token','cl_company_id','cl_company_name','cl_user_role','cl_user_permissions'].forEach((key) => localStorage.removeItem(key))
  activeSession = null
  if (refreshTimer != null) window.clearTimeout(refreshTimer)
  refreshTimer = null
}

function sessionExpiredError() {
  const error = new Error('Tu sesión venció. Volvé a ingresar para continuar.') as Error & { code?: string }
  error.code = 'SESSION_EXPIRED'
  return error
}

export function isSessionExpiredError(error: unknown) {
  return Boolean(
    error &&
    typeof error === 'object' &&
    ('code' in error && (error as { code?: unknown }).code === 'SESSION_EXPIRED' ||
      'message' in error && /jwt expired|sesión venció|session expired/i.test(String((error as { message?: unknown }).message || ''))),
  )
}

function persistTenantSession(session: TenantSession, refreshToken?: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('cl_access_token', session.token)
  if (refreshToken) localStorage.setItem('cl_refresh_token', refreshToken)
  localStorage.setItem('cl_company_id', session.companyId)
  localStorage.setItem('cl_company_name', session.companyName)
  localStorage.setItem('cl_user_role', session.role)
  localStorage.setItem('cl_user_permissions', JSON.stringify(session.permissions || {}))
}

function scheduleRefresh(session: TenantSession) {
  if (typeof window === 'undefined') return
  activeSession = session
  if (refreshTimer != null) window.clearTimeout(refreshTimer)
  const refreshToken = localStorage.getItem('cl_refresh_token') || ''
  if (!refreshToken) return
  const expiresAt = jwtExpiresAt(session.token)
  const delay = expiresAt
    ? Math.max(30_000, expiresAt - Date.now() - REFRESH_MARGIN_MS)
    : 45 * 60 * 1000
  refreshTimer = window.setTimeout(() => {
    if (!activeSession) return
    void refreshTenantSession(activeSession, true).catch((error) => {
      if (isSessionExpiredError(error)) {
        clearStoredSession()
        if (typeof location !== 'undefined') location.replace('/redesign/access?expired=1')
        return
      }
      if (!activeSession) return
      refreshTimer = window.setTimeout(() => {
        if (activeSession) void refreshTenantSession(activeSession, true).catch(() => {})
      }, 60_000)
    })
  }, delay)

  if (!resumeListenersInstalled) {
    resumeListenersInstalled = true
    const resume = () => {
      if (!activeSession || !shouldRefresh(activeSession.token)) return
      void refreshTenantSession(activeSession, true).catch((error) => {
        if (isSessionExpiredError(error)) {
          clearStoredSession()
          location.replace('/redesign/access?expired=1')
        }
      })
    }
    window.addEventListener('focus', resume)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') resume()
    })
    window.addEventListener('online', resume)
  }
}

export async function refreshTenantSession(session: TenantSession, force = false): Promise<TenantSession> {
  if (typeof window === 'undefined') return session

  const storedAccessToken = localStorage.getItem('cl_access_token') || ''
  if (storedAccessToken && storedAccessToken !== session.token && !shouldRefresh(storedAccessToken)) {
    session.token = storedAccessToken
    scheduleRefresh(session)
    return session
  }

  if (!force && !shouldRefresh(session.token)) {
    scheduleRefresh(session)
    return session
  }

  const refreshToken = localStorage.getItem('cl_refresh_token') || ''
  if (!refreshToken) {
    if (tokenExpired(session.token)) {
      clearStoredSession()
      throw sessionExpiredError()
    }
    return session
  }
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        apikey: PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: 'no-store',
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data?.access_token) {
      if (response.status === 400 || response.status === 401 || /refresh token|jwt|expired/i.test(String(data?.error_description || data?.msg || data?.error || ''))) {
        clearStoredSession()
        throw sessionExpiredError()
      }
      throw new Error(data?.error_description || data?.msg || data?.error || 'No se pudo renovar la sesión.')
    }

    session.token = String(data.access_token)
    persistTenantSession(session, String(data.refresh_token || refreshToken))
    scheduleRefresh(session)
    return session
  })()

  try {
    return await refreshInFlight
  } finally {
    refreshInFlight = null
  }
}

export function readTenantSession(): TenantSession | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('cl_access_token') || ''
  const companyId = localStorage.getItem('cl_company_id') || ''
  if (!token || !companyId) return null
  const refreshToken = localStorage.getItem('cl_refresh_token') || ''
  if (!refreshToken && tokenExpired(token)) {
    clearStoredSession()
    return null
  }
  const session: TenantSession = {
    token,
    companyId,
    companyName: localStorage.getItem('cl_company_name') || 'Mi comercio',
    role: localStorage.getItem('cl_user_role') || 'owner',
    permissions: parsePermissions(localStorage.getItem('cl_user_permissions')),
  }
  scheduleRefresh(session)
  if (refreshToken && shouldRefresh(session.token)) {
    void refreshTenantSession(session, true).catch((error) => {
      if (isSessionExpiredError(error)) location.replace('/redesign/access?expired=1')
    })
  }
  return session
}

export async function signInTenant(email: string, password: string): Promise<TenantSession> {
  const loginValue = email.trim()
  const loginEmail = loginValue.includes('@') ? loginValue : `${loginValue.toLowerCase()}@staff.comerciolleno.local`
  const auth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: loginEmail, password }),
  })
  const authData = await auth.json().catch(() => ({}))
  if (!auth.ok || !authData?.access_token || !authData?.user?.id) {
    throw new Error(authData?.error_description || authData?.msg || authData?.error || 'No se pudo iniciar sesión.')
  }

  const token = String(authData.access_token)
  const refreshToken = String(authData.refresh_token || '')
  const userId = String(authData.user.id)
  const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=company_id,role,permissions,active&limit=1`, {
    headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const profiles = await profileResponse.json().catch(() => [])
  const profile = Array.isArray(profiles) ? profiles[0] : null
  if (!profileResponse.ok || !profile?.company_id) throw new Error('La cuenta no tiene un comercio asociado.')
  if (profile.active === false) throw new Error('Este usuario está desactivado.')

  const companyResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(profile.company_id)}&select=id,name&limit=1`, {
    headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const companies = await companyResponse.json().catch(() => [])
  const company = Array.isArray(companies) ? companies[0] : null
  if (!companyResponse.ok || !company?.id) throw new Error('No se pudo cargar el comercio asociado.')

  const session: TenantSession = {
    token,
    companyId: String(company.id),
    companyName: String(company.name || 'Mi comercio'),
    role: String(profile.role || 'cashier'),
    permissions: profile.permissions || {},
  }
  persistTenantSession(session, refreshToken)
  scheduleRefresh(session)
  return session
}

function deviceKey(companyId: string) {
  return `cl_device_settings_${companyId}`
}

export function readDeviceSettings(companyId: string): DeviceSettings {
  if (typeof window === 'undefined') return DEFAULT_DEVICE
  try {
    const parsed = JSON.parse(localStorage.getItem(deviceKey(companyId)) || 'null')
    return withDeveloperCredit({ ...DEFAULT_DEVICE, ...(parsed || {}) })
  } catch {
    return DEFAULT_DEVICE
  }
}

export function writeDeviceSettings(companyId: string, settings: DeviceSettings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(deviceKey(companyId), JSON.stringify(withDeveloperCredit(settings)))
}

export function cacheSnapshot(companyId: string, key: string, value: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`cl_v2_${companyId}_${key}`, JSON.stringify(value))
}

export function readCachedSnapshot<T>(companyId: string, key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const parsed = JSON.parse(localStorage.getItem(`cl_v2_${companyId}_${key}`) || 'null')
    return parsed == null ? fallback : parsed as T
  } catch {
    return fallback
  }
}
