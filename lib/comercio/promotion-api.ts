import type { TenantSession } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

export type PromotionRecord = {
  id: string
  name: string
  type: string
  product_id?: string | null
  active: boolean
  created_at?: string | null
  discount_percent?: number | null
  original_price?: number | null
}

export type PromotionPriceUpdate = {
  product_id: string
  original_price: number
  new_price: number
  promotion_id: string
}

async function request<T>(session: TenantSession, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  })
  const text = await response.text()
  let data: unknown = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!response.ok) {
    const message = typeof data === 'object' && data && 'message' in data ? String((data as {message?:unknown}).message) : text || `HTTP ${response.status}`
    throw new Error(message)
  }
  return data as T
}

export async function loadPromotionsEnhanced(session: TenantSession) {
  const rows = await request<PromotionRecord[]>(session, `promotions?select=id,name,type,product_id,active,created_at,discount_percent,original_price&company_id=eq.${encodeURIComponent(session.companyId)}&order=created_at.desc&limit=1000`)
  return (rows || []).map(row => ({ ...row, discount_percent: row.discount_percent == null ? null : Number(row.discount_percent), original_price: row.original_price == null ? null : Number(row.original_price) }))
}

export async function applyPercentagePromotion(session: TenantSession, productIds: string[], percent: number, name?: string) {
  return request<PromotionPriceUpdate[]>(session, 'rpc/apply_percentage_promotion', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ p_product_ids: productIds, p_discount_percent: percent, p_name: name || null }),
  })
}

export async function removePercentagePromotion(session: TenantSession, promotionId: string) {
  return request<{ok:boolean;product_id:string;restored_price:number}>(session, 'rpc/remove_percentage_promotion', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ p_promotion_id: promotionId }),
  })
}
