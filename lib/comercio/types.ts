export type ViewKey =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'cash'
  | 'settings'
  | 'assistant'
  | 'help'
  | 'sales'
  | 'reports'
  | 'customers'
  | 'profitability'
  | 'accounts'
  | 'returns'
  | 'promotions'
  | 'purchases'
  | 'suppliers'
  | 'stock'

export type UserPermissions = {
  can_sell?: boolean
  can_view_reports?: boolean
  can_manage_stock?: boolean
  can_manage_customers?: boolean
  [key: string]: boolean | undefined
}

export type TenantSession = {
  token: string
  companyId: string
  companyName: string
  role: 'owner' | 'supervisor' | 'cashier' | string
  permissions?: UserPermissions
}

export type CompanyProfile = {
  id: string
  name: string
  legal_name?: string | null
  tax_id?: string | null
}

export type Product = {
  id: string
  name: string
  barcode?: string | null
  category?: string | null
  price: number
  cost?: number | null
  wholesale_price?: number | null
  stock: number
  min_stock?: number | null
  target_stock?: number | null
  unit?: string | null
  supplier_id?: string | null
  active?: boolean
}

export type SaleItem = {
  product_id: string
  name: string
  barcode?: string | null
  qty: number
  unit_price: number
  line_total: number
}

export type SaleDetails = {
  items?: SaleItem[]
  subtotal_before_discount?: number
  discount_amount?: number
  discount?: { kind: 'percent' | 'amount' | string; value: number } | null
  note?: string | null
  captured_at?: string
  cae?: string | null
  receipt_number?: string | number | null
  cae_expiration?: string | null
  fiscal_environment?: string | null
  fiscal_pending_reason?: string | null
  fiscal_pending_since?: string | null
  offline_created_at?: string | null
  offline_device_id?: string | null
  offline_sync_error?: string | null
  offline_stock_conflict?: string[] | null
  [key: string]: unknown
}

export type Sale = {
  id: string
  date: string
  total: number
  payment: string
  items: number
  customer_id?: string | null
  receipt_type?: string | null
  fiscal_status?: string | null
  cae?: string | null
  receiptNumber?: number
  caeExpiration?: string | null
  fiscalEnvironment?: string | null
  details?: SaleDetails | null
}

export type Customer = {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  tax_id?: string | null
}

export type CashRegister = {
  id: string
  status: 'open' | 'closed' | string
  opening_amount: number
  opened_at?: string | null
  closed_at?: string | null
}

export type CashMovement = {
  id: string
  kind: 'expense' | 'income' | 'egress' | string
  amount: number
  note?: string | null
  occurred_at: string
}

export type CommerceSnapshot = {
  company: CompanyProfile
  products: Product[]
  sales: Sale[]
  customers: Customer[]
  cashRegister: CashRegister | null
  cashMovements: CashMovement[]
}

export type FiscalInvoice = {
  approved?: boolean
  result?: string | null
  cae: string
  cae_expiration?: string | null
  receipt_number: number
  date?: string
  amount?: number
  errors?: Array<{ code: string | number; msg: string }>
  observations?: Array<{ code: string | number; msg: string }>
}

export type DeviceSettings = {
  paper: '80' | '58'
  autoPrint: boolean
  printerMode: 'browser' | 'bridge'
  printerName: string
  receiptCopies: number
}

export type CartLine = Product & { qty: number }
