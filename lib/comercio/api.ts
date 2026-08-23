import type {
  CashMovement,
  CashRegister,
  CommerceSnapshot,
  CompanyProfile,
  Customer,
  FiscalInvoice,
  Product,
  Sale,
  TenantSession,
  UserPermissions,
} from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

export type ArcaHealth = {
  connected: boolean
  checkedAt?: string
  latencyMs?: number
  environment?: string
  service?: string
  pointOfSale?: number | null
  lastAuthorized?: number | null
  readyToIssue?: boolean
  error?: string | null
}

export type Supplier = {
  id: string
  name: string
  tax_id?: string | null
  phone?: string | null
  email?: string | null
  notes?: string | null
  active?: boolean
}

export type Purchase = {
  id: string
  purchased_at: string
  total: number
  invoice_number?: string | null
  supplier_id?: string | null
  suppliers?: { name?: string | null } | null
}

export type CustomerAccount = { customer_id: string; balance: number }
export type Promotion = { id: string; name: string; type: string; product_id?: string | null; active: boolean; created_at?: string }
export type StaffProfile = {
  id: string
  full_name?: string | null
  username?: string | null
  role: string
  permissions?: UserPermissions | null
  active?: boolean
}

async function rest<T>(session: TenantSession, path: string, init: RequestInit = {}): Promise<T> {
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
    const message = typeof data === 'object' && data && 'message' in data
      ? String((data as { message?: unknown }).message)
      : text || `HTTP ${response.status}`
    throw new Error(message)
  }
  return data as T
}

function companyFilter(session: TenantSession) {
  return encodeURIComponent(session.companyId)
}

function mapSale(row: any): Sale {
  const details = row.details || {}
  const receipt = row.receipt_number ?? details.receipt_number
  return {
    id: row.id,
    date: row.sold_at,
    total: Number(row.total || 0),
    payment: row.payment_method || 'Efectivo',
    items: Number(row.items_count || 0),
    customer_id: row.customer_id || null,
    receipt_type: row.receipt_type || 'ticket',
    fiscal_status: row.fiscal_status || null,
    cae: row.cae || details.cae || null,
    receiptNumber: receipt ? Number(receipt) : undefined,
    caeExpiration: details.cae_expiration || null,
    fiscalEnvironment: details.fiscal_environment || null,
    details,
  }
}

export async function loadCommerceSnapshot(session: TenantSession): Promise<CommerceSnapshot> {
  const companyId = companyFilter(session)
  const [companyRows, products, saleRows, customers, cashRows, cashMovements] = await Promise.all([
    rest<CompanyProfile[]>(session, `companies?select=id,name,legal_name,tax_id&id=eq.${companyId}&limit=1`),
    rest<Product[]>(session, `products?select=id,name,barcode,category,price,cost,wholesale_price,stock,min_stock,target_stock,unit,supplier_id,active,created_at&company_id=eq.${companyId}&active=eq.true&order=name.asc&limit=5000`),
    rest<any[]>(session, `sales?select=id,sold_at,total,payment_method,items_count,customer_id,receipt_type,fiscal_status,cae,receipt_number,details&company_id=eq.${companyId}&order=sold_at.desc&limit=1000`),
    rest<Customer[]>(session, `customers?select=id,name,phone,email,tax_id&company_id=eq.${companyId}&order=created_at.desc&limit=1000`),
    rest<CashRegister[]>(session, `cash_registers?select=id,status,opening_amount,opened_at,closed_at&company_id=eq.${companyId}&limit=1`),
    rest<CashMovement[]>(session, `cash_movements?select=id,kind,amount,note,occurred_at&company_id=eq.${companyId}&order=occurred_at.desc&limit=2000`),
  ])

  return {
    company: companyRows[0] || { id: session.companyId, name: session.companyName },
    products: (products || []).map((p) => ({
      ...p,
      price: Number(p.price || 0),
      stock: Number(p.stock || 0),
      cost: p.cost == null ? null : Number(p.cost),
      wholesale_price: p.wholesale_price == null ? null : Number(p.wholesale_price),
      min_stock: p.min_stock == null ? null : Number(p.min_stock),
      target_stock: p.target_stock == null ? null : Number(p.target_stock),
    })),
    sales: (saleRows || []).map(mapSale),
    customers: customers || [],
    cashRegister: cashRows[0]
      ? { ...cashRows[0], opening_amount: Number(cashRows[0].opening_amount || 0) }
      : null,
    cashMovements: (cashMovements || []).map((m) => ({ ...m, amount: Number(m.amount || 0) })),
  }
}

export async function checkArcaHealth(session: TenantSession): Promise<ArcaHealth> {
  try {
    const response = await fetch('/api/redesign/arca-status', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.token}` },
      cache: 'no-store',
    })
    let data: ArcaHealth = { connected: false }
    try { data = await response.json() } catch {}
    return { ...data, connected: Boolean(response.ok && data.connected) }
  } catch (error) {
    return {
      connected: false,
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function authorizeFiscalInvoice(
  session: TenantSession,
  amount: number,
  requestId: string,
): Promise<FiscalInvoice> {
  const response = await fetch('/api/redesign/arca-invoice', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ request_id: requestId, amount }),
    cache: 'no-store',
  })
  let data: any = {}
  try { data = await response.json() } catch {}
  if (!response.ok || !data?.ok || !data?.invoice?.cae) {
    const errors = Array.isArray(data?.invoice?.errors)
      ? data.invoice.errors.map((e: any) => `${e.code}: ${e.msg}`).join(' | ')
      : ''
    const error = new Error(data?.error || errors || `ARCA respondió ${response.status}`)
    ;(error as any).arcaUnavailable = response.status >= 500 || data?.unavailable === true
    throw error
  }
  return data.invoice as FiscalInvoice
}

async function persistSaleAtomic(session: TenantSession, body: Record<string, unknown>) {
  await rest(session, 'rpc/persist_sale_atomic', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ p_sale: body }),
  })
}

export async function persistAuthorizedSale(session: TenantSession, sale: Sale, stockUpdates: Array<{ id: string; stock: number }>) {
  void stockUpdates
  const details = {
    ...(sale.details || {}),
    cae: sale.cae || null,
    receipt_number: sale.receiptNumber || null,
    cae_expiration: sale.caeExpiration || null,
    fiscal_environment: sale.fiscalEnvironment || 'homologacion',
  }
  await persistSaleAtomic(session, {
    id: sale.id,
    company_id: session.companyId,
    customer_id: sale.customer_id || null,
    receipt_type: sale.receipt_type || 'factura_c',
    payment_method: sale.payment,
    subtotal: Number(sale.details?.subtotal_before_discount ?? sale.total),
    total: sale.total,
    fiscal_status: 'authorized',
    cae: sale.cae || null,
    receipt_number: sale.receiptNumber ? String(sale.receiptNumber) : null,
    sold_at: sale.date,
    items_count: sale.items,
    details,
  })
}

export async function persistUninvoicedSale(session: TenantSession, sale: Sale, stockUpdates: Array<{ id: string; stock: number }>, reason: string) {
  void stockUpdates
  const details = {
    ...(sale.details || {}),
    fiscal_pending_reason: reason,
    fiscal_pending_since: new Date().toISOString(),
  }
  await persistSaleAtomic(session, {
    id: sale.id,
    company_id: session.companyId,
    customer_id: sale.customer_id || null,
    receipt_type: 'ticket',
    payment_method: sale.payment,
    subtotal: Number(sale.details?.subtotal_before_discount ?? sale.total),
    total: sale.total,
    fiscal_status: 'pending',
    cae: null,
    receipt_number: null,
    sold_at: sale.date,
    items_count: sale.items,
    details,
  })
}

export async function closeCashRegister(session: TenantSession, registerId: string, closingAmount: number, summary: Record<string,unknown>) {
  return rest<CashRegister[]>(session, `cash_registers?id=eq.${encodeURIComponent(registerId)}&company_id=eq.${companyFilter(session)}`, { method:'PATCH', headers:{Prefer:'return=representation'}, body:JSON.stringify({status:'closed',closing_amount:closingAmount,closed_at:new Date().toISOString(),close_summary:summary}) })
}

export async function openCashRegister(session: TenantSession, openingAmount: number) {
  return rest<CashRegister[]>(session, 'cash_registers', { method:'POST', headers:{Prefer:'return=representation'}, body:JSON.stringify({company_id:session.companyId,status:'open',opening_amount:openingAmount,opened_at:new Date().toISOString()}) })
}

export async function loadSuppliers(session:TenantSession){return rest<Supplier[]>(session,`suppliers?select=id,name,tax_id,phone,email,notes,active&company_id=eq.${companyFilter(session)}&active=eq.true&order=name.asc&limit=1000`)}
export async function createProduct(session:TenantSession,p:Product){return rest<Product[]>(session,'products',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({company_id:session.companyId,name:p.name,barcode:p.barcode||null,category:p.category||'General',price:n(p.price),cost:n(p.cost),wholesale_price:n(p.wholesale_price),stock:n(p.stock),min_stock:n(p.min_stock),target_stock:n(p.target_stock),unit:p.unit||'unidad',supplier_id:p.supplier_id||null,active:true})})}
export async function updateProduct(session:TenantSession,p:Product){return rest<Product[]>(session,`products?id=eq.${encodeURIComponent(p.id)}&company_id=eq.${companyFilter(session)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({name:p.name,barcode:p.barcode||null,category:p.category||'General',price:n(p.price),cost:n(p.cost),wholesale_price:n(p.wholesale_price),stock:n(p.stock),min_stock:n(p.min_stock),target_stock:n(p.target_stock),unit:p.unit||'unidad',supplier_id:p.supplier_id||null})})}
