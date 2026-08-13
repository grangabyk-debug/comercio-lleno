import type { TenantSession } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

export type MobileSettings = {
  scannerEnabled: boolean
}

export const DEFAULT_MOBILE_SETTINGS: MobileSettings = {
  scannerEnabled: true,
}

function key(companyId: string) {
  return `cl_mobile_settings_${companyId}`
}

function normalize(value: Record<string, unknown> | null | undefined): MobileSettings {
  return {
    scannerEnabled: value?.scanner_enabled !== false && value?.scannerEnabled !== false,
  }
}

export function readCachedMobileSettings(companyId: string): MobileSettings {
  if (typeof window === 'undefined') return DEFAULT_MOBILE_SETTINGS
  try {
    const cached = JSON.parse(localStorage.getItem(key(companyId)) || 'null')
    return cached ? normalize(cached) : DEFAULT_MOBILE_SETTINGS
  } catch {
    return DEFAULT_MOBILE_SETTINGS
  }
}

export function cacheMobileSettings(companyId: string, value: MobileSettings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key(companyId), JSON.stringify(value))
}

export async function loadMobileSettings(session: TenantSession): Promise<MobileSettings> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(session.companyId)}&select=mobile_settings&limit=1`, {
    headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${session.token}` },
    cache: 'no-store',
  })
  const rows = await response.json().catch(() => [])
  if (!response.ok) throw new Error(rows?.message || 'No se pudieron cargar los ajustes móviles.')
  const next = normalize(Array.isArray(rows) ? rows[0]?.mobile_settings : null)
  cacheMobileSettings(session.companyId, next)
  return next
}

export async function saveMobileSettings(session: TenantSession, value: MobileSettings): Promise<MobileSettings> {
  const next: MobileSettings = { scannerEnabled: Boolean(value.scannerEnabled) }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/save_mobile_settings`, {
    method: 'POST',
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ p_scanner_enabled: next.scannerEnabled }),
    cache: 'no-store',
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudieron guardar los ajustes móviles.')
  const saved = normalize(data && !Array.isArray(data) ? data : next as unknown as Record<string, unknown>)
  cacheMobileSettings(session.companyId, saved)
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('comercio:mobile-settings', { detail: saved }))
  return saved
}
