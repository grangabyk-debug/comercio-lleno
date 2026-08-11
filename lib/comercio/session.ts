import type { DeviceSettings, TenantSession } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

const DEFAULT_DEVICE: DeviceSettings = {
  paper: '80',
  autoPrint: false,
  printerMode: 'browser',
  printerName: '',
  receiptCopies: 1,
}

function persistTenantSession(session: TenantSession) {
  if (typeof window === 'undefined') return
  localStorage.setItem('cl_access_token', session.token)
  localStorage.setItem('cl_company_id', session.companyId)
  localStorage.setItem('cl_company_name', session.companyName)
  localStorage.setItem('cl_user_role', session.role)
}

export function readTenantSession(): TenantSession | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('cl_access_token') || ''
  const companyId = localStorage.getItem('cl_company_id') || ''
  if (!token || !companyId) return null
  return {
    token,
    companyId,
    companyName: localStorage.getItem('cl_company_name') || 'Mi comercio',
    role: localStorage.getItem('cl_user_role') || 'owner',
  }
}

export async function signInTenant(email: string, password: string): Promise<TenantSession> {
  const auth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email.trim(), password }),
  })
  const authData = await auth.json().catch(() => ({}))
  if (!auth.ok || !authData?.access_token || !authData?.user?.id) {
    throw new Error(authData?.error_description || authData?.msg || authData?.error || 'No se pudo iniciar sesión.')
  }

  const token = String(authData.access_token)
  const userId = String(authData.user.id)
  const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=company_id,role,active&limit=1`, {
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
  }
  persistTenantSession(session)
  return session
}

function deviceKey(companyId: string) {
  return `cl_device_settings_${companyId}`
}

export function readDeviceSettings(companyId: string): DeviceSettings {
  if (typeof window === 'undefined') return DEFAULT_DEVICE
  try {
    const parsed = JSON.parse(localStorage.getItem(deviceKey(companyId)) || 'null')
    return { ...DEFAULT_DEVICE, ...(parsed || {}) }
  } catch {
    return DEFAULT_DEVICE
  }
}

export function writeDeviceSettings(companyId: string, settings: DeviceSettings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(deviceKey(companyId), JSON.stringify(settings))
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
