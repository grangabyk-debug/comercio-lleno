import type { TenantSession } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

export type DesignSettings = {
  colorTheme: 'emerald' | 'ocean' | 'graphite'
  fontSize: 'compact' | 'standard' | 'large'
  fontWeight: 'soft' | 'balanced' | 'strong'
  fontFamily: 'modern' | 'classic' | 'rounded'
}

export const DEFAULT_DESIGN_SETTINGS: DesignSettings = {
  colorTheme: 'emerald',
  fontSize: 'standard',
  fontWeight: 'balanced',
  fontFamily: 'modern',
}

function key(companyId: string) {
  return `cl_design_settings_${companyId}`
}

function normalize(value: Partial<DesignSettings> | null | undefined): DesignSettings {
  return {
    // El color de marca de Comercio Lleno queda fijo en verde.
    // Se conserva la propiedad por compatibilidad con configuraciones ya guardadas,
    // pero no se permite que una preferencia visual cambie el logo o la identidad.
    colorTheme: 'emerald',
    fontSize: value?.fontSize === 'compact' || value?.fontSize === 'large' ? value.fontSize : 'standard',
    fontWeight: value?.fontWeight === 'soft' || value?.fontWeight === 'strong' ? value.fontWeight : 'balanced',
    fontFamily: value?.fontFamily === 'classic' || value?.fontFamily === 'rounded' ? value.fontFamily : 'modern',
  }
}

export function readCachedDesignSettings(companyId: string): DesignSettings {
  if (typeof window === 'undefined') return DEFAULT_DESIGN_SETTINGS
  try {
    const cached = JSON.parse(localStorage.getItem(key(companyId)) || 'null')
    return normalize(cached || DEFAULT_DESIGN_SETTINGS)
  } catch {
    return DEFAULT_DESIGN_SETTINGS
  }
}

export function cacheDesignSettings(companyId: string, value: DesignSettings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key(companyId), JSON.stringify(normalize(value)))
}

export async function loadDesignSettings(session: TenantSession): Promise<DesignSettings> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(session.companyId)}&select=design_settings&limit=1`, {
    headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${session.token}` },
    cache: 'no-store',
  })
  const rows = await response.json().catch(() => [])
  if (!response.ok) throw new Error(rows?.message || 'No se pudo cargar el diseño del comercio.')
  const next = normalize(Array.isArray(rows) ? rows[0]?.design_settings : null)
  cacheDesignSettings(session.companyId, next)
  return next
}

export async function saveDesignSettings(session: TenantSession, value: DesignSettings): Promise<DesignSettings> {
  const next = normalize(value)
  const response = await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(session.companyId)}`, {
    method: 'PATCH',
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ design_settings: next }),
    cache: 'no-store',
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data?.message || 'No se pudo guardar el diseño del comercio.')
  }
  cacheDesignSettings(session.companyId, next)
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('comercio:design-settings', { detail: next }))
  return next
}
