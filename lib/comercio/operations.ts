import type { Sale, TenantSession } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

async function rest(session: TenantSession, path: string, init: RequestInit = {}) {
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
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`)
}

export async function createCashMovement(
  session: TenantSession,
  kind: 'expense' | 'income' | 'egress',
  amount: number,
  note: string,
) {
  const value = Math.max(0, Number(amount || 0))
  if (!value) throw new Error('Ingresá un importe mayor a cero.')
  await rest(session, 'cash_movements', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      company_id: session.companyId,
      kind,
      amount: value,
      note: note.trim() || null,
      occurred_at: new Date().toISOString(),
    }),
  })
}

export async function updateSaleNote(session: TenantSession, sale: Sale, note: string) {
  const details = { ...(sale.details || {}), note: note.trim() || null }
  await rest(session, `sales?id=eq.${encodeURIComponent(sale.id)}&company_id=eq.${encodeURIComponent(session.companyId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ details }),
  })
}
