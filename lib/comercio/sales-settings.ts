import type { TenantSession } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''

export type CashMode = 'ask' | 'manual' | 'automatic'

export type SalesSettings = {
  allowNegativeStock: boolean
  timeFormat: '24' | '12'
  maxDiscount: number
  wholesalePricingEnabled: boolean
  whatsappAutoTicket: boolean
  cashMode: CashMode
}

export const DEFAULT_SALES_SETTINGS: SalesSettings = {
  allowNegativeStock: false,
  timeFormat: '24',
  maxDiscount: 100,
  wholesalePricingEnabled: true,
  whatsappAutoTicket: false,
  cashMode: 'ask',
}

function key(companyId: string) {
  return `cl_sales_settings_${companyId}`
}

function normalize(value: Partial<SalesSettings> | null | undefined): SalesSettings {
  const rawCashMode = value?.cashMode
  const cashMode: CashMode = rawCashMode === 'manual' || rawCashMode === 'automatic' ? rawCashMode : 'ask'
  return {
    allowNegativeStock: value?.allowNegativeStock === true,
    timeFormat: value?.timeFormat === '12' ? '12' : '24',
    maxDiscount: Math.max(0, Math.min(100, Number(value?.maxDiscount ?? 100) || 0)),
    wholesalePricingEnabled: value?.wholesalePricingEnabled !== false,
    whatsappAutoTicket: value?.whatsappAutoTicket === true,
    cashMode,
  }
}

function legacySettings(): Partial<SalesSettings> | null {
  if (typeof window === 'undefined') return null
  try {
    const all = JSON.parse(localStorage.getItem('cl_settings') || '{}')
    const sales = all?.sales
    if (!sales || typeof sales !== 'object') return null
    return {
      allowNegativeStock: Boolean(sales.allowNegative),
      timeFormat: sales.timeFormat === false ? '12' : '24',
      maxDiscount: Number(sales.maxDiscount ?? 100),
      wholesalePricingEnabled: sales.wholesalePricingEnabled !== false,
      whatsappAutoTicket: Boolean(sales.whatsappAutoTicket),
      cashMode: sales.cashMode === 'manual' || sales.cashMode === 'automatic' ? sales.cashMode : 'ask',
    }
  } catch {
    return null
  }
}

export function readCachedSalesSettings(companyId: string): SalesSettings {
  if (typeof window === 'undefined') return DEFAULT_SALES_SETTINGS
  try {
    const cached = JSON.parse(localStorage.getItem(key(companyId)) || 'null')
    if (cached) return normalize(cached)
    const legacy = legacySettings()
    const next = normalize(legacy || DEFAULT_SALES_SETTINGS)
    localStorage.setItem(key(companyId), JSON.stringify(next))
    return next
  } catch {
    return DEFAULT_SALES_SETTINGS
  }
}

export function cacheSalesSettings(companyId: string, value: SalesSettings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key(companyId), JSON.stringify(normalize(value)))
}

export async function loadSalesSettings(session: TenantSession): Promise<SalesSettings> {
  if (!SUPABASE_URL || !PUBLISHABLE_KEY) throw new Error('Supabase no está configurado.')
  const response = await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(session.companyId)}&select=sales_settings&limit=1`, {
    headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${session.token}` },
    cache: 'no-store',
  })
  const rows = await response.json().catch(() => [])
  if (!response.ok) throw new Error(rows?.message || 'No se pudieron cargar los ajustes de ventas.')
  const next = normalize(Array.isArray(rows) ? rows[0]?.sales_settings : null)
  cacheSalesSettings(session.companyId, next)
  return next
}

export async function saveSalesSettings(session: TenantSession, value: SalesSettings): Promise<SalesSettings> {
  if (!SUPABASE_URL || !PUBLISHABLE_KEY) throw new Error('Supabase no está configurado.')
  const next = normalize(value)
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/save_sales_settings`, {
    method: 'POST',
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_settings: next }),
    cache: 'no-store',
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || data?.error || 'No se pudieron guardar los ajustes de ventas.')
  const saved = normalize(data || next)
  cacheSalesSettings(session.companyId, saved)
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('comercio:sales-settings', { detail: saved }))
  return saved
}
