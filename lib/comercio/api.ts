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

export async function openCashRegister(session: TenantSession, current: CashRegister | null, amount: number): Promise<CashRegister> {
  const now = new Date().toISOString()
  if (current) {
    await rest(session, `cash_registers?id=eq.${encodeURIComponent(current.id)}&company_id=eq.${companyFilter(session)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status: 'open', opening_amount: amount, opened_at: now, closed_at: null }),
    })
    return { ...current, status: 'open', opening_amount: amount, opened_at: now, closed_at: null }
  }
  const rows = await rest<CashRegister[]>(session, 'cash_registers', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ company_id: session.companyId, name: 'Caja principal', status: 'open', opening_amount: amount, opened_at: now }),
  })
  return rows[0]
}

export async function closeCashRegister(session: TenantSession, current: CashRegister): Promise<CashRegister> {
  const now = new Date().toISOString()
  await rest(session, `cash_registers?id=eq.${encodeURIComponent(current.id)}&company_id=eq.${companyFilter(session)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'closed', closed_at: now }),
  })
  return { ...current, status: 'closed', closed_at: now }
}

export async function createCashMovement(session: TenantSession, kind: 'expense' | 'income' | 'egress', amount: number, note: string): Promise<void> {
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

export async function updateSaleNote(session: TenantSession, sale: Sale, note: string): Promise<void> {
  const details = { ...(sale.details || {}), note: note.trim() || null }
  await rest(session, `sales?id=eq.${encodeURIComponent(sale.id)}&company_id=eq.${companyFilter(session)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ details }),
  })
}

export async function createCustomer(session: TenantSession, input: Pick<Customer, 'name' | 'phone' | 'email' | 'tax_id'>): Promise<Customer> {
  const rows = await rest<Customer[]>(session, 'customers', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ company_id: session.companyId, name: input.name, phone: input.phone || null, email: input.email || null, tax_id: input.tax_id || null }),
  })
  return rows[0]
}

export async function createProduct(session: TenantSession, input: Partial<Product> & Pick<Product, 'name' | 'price' | 'stock'>): Promise<Product> {
  const rows = await rest<Product[]>(session, 'products', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      company_id: session.companyId,
      name: input.name.trim(),
      barcode: input.barcode || '',
      category: input.category || 'General',
      unit: input.unit || 'unidad',
      cost: Number(input.cost || 0),
      price: Number(input.price || 0),
      wholesale_price: Number(input.wholesale_price || 0),
      stock: Number(input.stock || 0),
      min_stock: Number(input.min_stock || 0),
      target_stock: Number(input.target_stock || 0),
      supplier_id: input.supplier_id || null,
      active: true,
      updated_at: new Date().toISOString(),
    }),
  })
  return rows[0]
}

export async function updateProduct(session: TenantSession, product: Product): Promise<void> {
  await rest(session, `products?id=eq.${encodeURIComponent(product.id)}&company_id=eq.${companyFilter(session)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      name: product.name.trim(),
      barcode: product.barcode || '',
      category: product.category || 'General',
      unit: product.unit || 'unidad',
      cost: Number(product.cost || 0),
      price: Number(product.price || 0),
      wholesale_price: Number(product.wholesale_price || 0),
      stock: Number(product.stock || 0),
      min_stock: Number(product.min_stock || 0),
      target_stock: Number(product.target_stock || 0),
      supplier_id: product.supplier_id || null,
      updated_at: new Date().toISOString(),
    }),
  })
}

export async function loadSuppliers(session: TenantSession): Promise<Supplier[]> {
  return rest<Supplier[]>(session, `suppliers?select=id,name,tax_id,phone,email,notes,active&company_id=eq.${companyFilter(session)}&active=eq.true&order=name.asc`)
}

export async function saveSupplier(session: TenantSession, input: Partial<Supplier> & Pick<Supplier, 'name'>): Promise<void> {
  const body = { name: input.name.trim(), tax_id: input.tax_id || null, phone: input.phone || null, email: input.email || null, notes: input.notes || null }
  if (input.id) {
    await rest(session, `suppliers?id=eq.${encodeURIComponent(input.id)}&company_id=eq.${companyFilter(session)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(body) })
  } else {
    await rest(session, 'suppliers', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ ...body, company_id: session.companyId, active: true }) })
  }
}

export async function loadPurchases(session: TenantSession): Promise<Purchase[]> {
  const rows = await rest<Purchase[]>(session, `purchases?select=id,purchased_at,total,invoice_number,supplier_id,suppliers(name)&company_id=eq.${companyFilter(session)}&order=purchased_at.desc&limit=300`)
  return (rows || []).map((x) => ({ ...x, total: Number(x.total || 0) }))
}

export async function registerPurchase(session: TenantSession, input: { supplier_id: string; invoice_number?: string; product: Product; quantity: number; unit_cost: number }): Promise<void> {
  const quantity = Number(input.quantity)
  const unitCost = Number(input.unit_cost)
  const total = quantity * unitCost
  const before = Number(input.product.stock || 0)
  const after = before + quantity
  const rows = await rest<Array<{ id: string }>>(session, 'purchases', {
    method: 'POST', headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ company_id: session.companyId, supplier_id: input.supplier_id, invoice_number: input.invoice_number || null, total, status: 'received' }),
  })
  const purchaseId = rows[0]?.id
  if (!purchaseId) throw new Error('No se pudo crear la compra.')
  await rest(session, 'purchase_items', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ purchase_id: purchaseId, product_id: input.product.id, quantity, unit_cost: unitCost, total }) })
  await rest(session, `products?id=eq.${encodeURIComponent(input.product.id)}&company_id=eq.${companyFilter(session)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ stock: after, cost: unitCost, supplier_id: input.supplier_id, updated_at: new Date().toISOString() }) })
  await rest(session, 'stock_movements', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ company_id: session.companyId, product_id: input.product.id, kind: 'purchase', quantity, stock_before: before, stock_after: after, reason: `Compra ${input.invoice_number || ''}`.trim(), reference_type: 'purchase', reference_id: purchaseId }) })
  if (Number(input.product.cost || 0) !== unitCost) {
    await rest(session, 'price_history', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ company_id: session.companyId, product_id: input.product.id, field: 'cost', old_value: Number(input.product.cost || 0), new_value: unitCost }) })
  }
}

export async function loadCustomerAccounts(session: TenantSession): Promise<CustomerAccount[]> {
  const rows = await rest<CustomerAccount[]>(session, `customer_accounts?select=customer_id,balance&company_id=eq.${companyFilter(session)}`)
  return (rows || []).map((x) => ({ ...x, balance: Number(x.balance || 0) }))
}

export async function addAccountMovement(session: TenantSession, customerId: string, kind: 'charge' | 'payment', amount: number, note: string, currentBalance: number): Promise<void> {
  const next = kind === 'charge' ? currentBalance + amount : Math.max(0, currentBalance - amount)
  await rest(session, 'account_movements', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ company_id: session.companyId, customer_id: customerId, kind, amount, note: note || null }) })
  await rest(session, 'customer_accounts?on_conflict=company_id,customer_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ company_id: session.companyId, customer_id: customerId, balance: next, updated_at: new Date().toISOString() }) })
}

export async function loadPromotions(session: TenantSession): Promise<Promotion[]> {
  return rest<Promotion[]>(session, `promotions?select=id,name,type,product_id,active,created_at&company_id=eq.${companyFilter(session)}&order=created_at.desc`)
}

export async function createTwoForOnePromotion(session: TenantSession, name: string, productId: string): Promise<void> {
  await rest(session, 'promotions', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ company_id: session.companyId, name: name || '2x1', type: '2x1', product_id: productId, active: true }) })
}

export async function registerReturn(session: TenantSession, sale: Sale, selected: Array<{ product_id: string; name: string; qty: number; unit_price: number }>, products: Product[], reason: string): Promise<void> {
  if (!selected.length) throw new Error('Elegí al menos un producto.')
  let total = 0
  for (const item of selected) {
    const product = products.find((p) => p.id === item.product_id)
    if (!product) continue
    const before = Number(product.stock || 0)
    const after = before + Number(item.qty || 0)
    total += Number(item.unit_price || 0) * Number(item.qty || 0)
    await rest(session, `products?id=eq.${encodeURIComponent(product.id)}&company_id=eq.${companyFilter(session)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ stock: after, updated_at: new Date().toISOString() }) })
    await rest(session, 'stock_movements', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ company_id: session.companyId, product_id: product.id, kind: 'return', quantity: Number(item.qty || 0), stock_before: before, stock_after: after, reason: `Devolución venta ${sale.id}`, reference_type: 'sale', reference_id: sale.id }) })
  }
  await rest(session, 'returns', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ company_id: session.companyId, sale_id: sale.id, total, reason: reason || null, credit_note_status: 'pending', details: { items: selected } }) })
}

export async function loadStaff(session: TenantSession): Promise<StaffProfile[]> {
  return rest<StaffProfile[]>(session, `profiles?select=id,full_name,username,role,permissions,active&company_id=eq.${companyFilter(session)}&order=created_at.asc`)
}

export async function updateStaff(session: TenantSession, staffId: string, role: string, permissions: UserPermissions): Promise<void> {
  await rest(session, `profiles?id=eq.${encodeURIComponent(staffId)}&company_id=eq.${companyFilter(session)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ role, permissions }) })
}

export async function createStaff(session: TenantSession, input: { username: string; password: string; full_name: string; role: 'cashier' | 'supervisor'; permissions: UserPermissions }): Promise<void> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-staff-user`, {
    method: 'POST',
    headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error || 'No se pudo crear el usuario.')
}

export async function resetSalesData(session: TenantSession, password: string): Promise<void> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/reset-sales-data`, {
    method: 'POST',
    headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error || 'No se pudieron restablecer las ventas.')
}

export async function updateCompanyIdentity(session: TenantSession, name: string, taxId: string): Promise<void> {
  await rest(session, `companies?id=eq.${companyFilter(session)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ name: name.trim() || session.companyName, tax_id: taxId || null }) })
  if (typeof window !== 'undefined') localStorage.setItem('cl_company_name', name.trim() || session.companyName)
}
