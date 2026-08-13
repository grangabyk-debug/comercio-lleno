import type { Customer, TenantSession } from './types'

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
  if (!response.ok) {
    let message = text || `HTTP ${response.status}`
    try { const data = text ? JSON.parse(text) : null; if (data?.message) message = String(data.message) } catch {}
    throw new Error(message)
  }
}

export async function updateCustomer(session: TenantSession, customer: Customer) {
  if (!customer.name.trim()) throw new Error('El cliente necesita un nombre.')
  await rest(session, `customers?id=eq.${encodeURIComponent(customer.id)}&company_id=eq.${encodeURIComponent(session.companyId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      name: customer.name.trim(),
      phone: customer.phone?.trim() || null,
      email: customer.email?.trim() || null,
      tax_id: customer.tax_id?.trim() || null,
    }),
  })
}

export async function deleteCustomer(session: TenantSession, customerId: string) {
  await rest(session, `customers?id=eq.${encodeURIComponent(customerId)}&company_id=eq.${encodeURIComponent(session.companyId)}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  })
}
