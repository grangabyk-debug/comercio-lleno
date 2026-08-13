import type { Customer, TenantSession } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

async function rpc(session: TenantSession, name: string, body: Record<string, unknown>) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
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
  const allowed = session.role === 'owner' || session.permissions?.can_edit_customers === true || (session.permissions?.can_edit_customers == null && session.permissions?.can_manage_customers !== false)
  if (!allowed) throw new Error('Tu usuario no tiene permiso para editar clientes.')
  await rpc(session, 'update_customer_authorized', {
    p_customer_id: customer.id,
    p_name: customer.name.trim(),
    p_phone: customer.phone?.trim() || null,
    p_email: customer.email?.trim() || null,
    p_tax_id: customer.tax_id?.trim() || null,
  })
}

export async function deleteCustomer(session: TenantSession, customerId: string) {
  const allowed = session.role === 'owner' || session.permissions?.can_delete_customers === true
  if (!allowed) throw new Error('Tu usuario no tiene permiso para eliminar clientes.')
  await rpc(session, 'delete_customer_authorized', { p_customer_id: customerId })
}
