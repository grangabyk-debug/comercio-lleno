import type { TenantSession } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

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
  // Comercio Lleno prioriza vender: el control estricto de stock es opt-in.
  allowNegativeStock: true,
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
    allowNegativeStock: value?.allowNegativeStock !== false,
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
      allowNegativeStock: sales.allowNegative === undefined ? true : Boolean(sales.allowNegative),
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

function publishSalesSettings(companyId: string, value: SalesSettings) {
  const next = normalize(value)
  cacheSalesSettings(companyId, next)
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('comercio:sales-settings', { detail: next }))
  return next
}

export async function loadSalesSettings(session: TenantSession): Promise<SalesSettings> {
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

async function saveByCompanyPatch(session: TenantSession, next: SalesSettings) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(session.companyId)}`, {
    method: 'PATCH',
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ sales_settings: next }),
    cache: 'no-store',
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw Object.assign(new Error(data?.message || data?.error || 'No se pudieron guardar los ajustes de ventas.'), { status: response.status })
  const row = Array.isArray(data) ? data[0] : data
  return normalize(row?.sales_settings || next)
}

async function saveByRpc(session: TenantSession, next: SalesSettings) {
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
  return normalize(data || next)
}

async function persistSettings(session: TenantSession, next: SalesSettings) {
  try {
    return await saveByCompanyPatch(session, next)
  } catch (patchError) {
    try {
      return await saveByRpc(session, next)
    } catch (rpcError) {
      const message = rpcError instanceof Error ? rpcError.message : patchError instanceof Error ? patchError.message : 'No se pudieron guardar los ajustes de ventas.'
      throw new Error(message)
    }
  }
}

export async function saveSalesSettings(session: TenantSession, value: SalesSettings): Promise<SalesSettings> {
  // Los formularios secundarios no deben volver a pisar el modo de stock con un estado viejo.
  const cached = readCachedSalesSettings(session.companyId)
  const next = normalize({ ...value, allowNegativeStock: cached.allowNegativeStock })
  const saved = await persistSettings(session, next)
  return publishSalesSettings(session.companyId, saved)
}

export async function saveStockControlSetting(session: TenantSession, controlStock: boolean): Promise<SalesSettings> {
  const current = await loadSalesSettings(session).catch(() => readCachedSalesSettings(session.companyId))
  const next = normalize({ ...current, allowNegativeStock: !controlStock })
  const saved = await persistSettings(session, next)
  return publishSalesSettings(session.companyId, saved)
}
