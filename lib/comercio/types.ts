export type ViewKey =
  | 'dashboard' | 'pos' | 'products' | 'cash' | 'settings' | 'assistant' | 'help' | 'sales' | 'reports' | 'customers' | 'profitability' | 'accounts' | 'returns' | 'promotions' | 'purchases' | 'suppliers' | 'stock'

export type UserPermissions = {
  can_sell?: boolean
  can_view_reports?: boolean
  can_manage_stock?: boolean
  can_manage_customers?: boolean
  can_edit_products?: boolean
  can_import_export_products?: boolean
  can_edit_customers?: boolean
  can_delete_customers?: boolean
  can_delete_sales?: boolean
  can_manage_promotions?: boolean
  can_manage_finances?: boolean
  can_open_close_cash?: boolean
  can_manage_suppliers?: boolean
  can_manage_purchases?: boolean
  [key: string]: boolean | undefined
}

export type TenantSession = { token:string; companyId:string; companyName:string; role:'owner'|'supervisor'|'cashier'|'seller'|'manager'|string; permissions?:UserPermissions }
export type CompanyProfile = { id:string;name:string;legal_name?:string|null;tax_id?:string|null;owner_phone?:string|null;country?:string|null;province?:string|null;address?:string|null;onboarding_complete?:boolean }
export type Product = { id:string;name:string;barcode?:string|null;category?:string|null;price:number;cost?:number|null;wholesale_price?:number|null;stock:number;min_stock?:number|null;target_stock?:number|null;unit?:string|null;supplier_id?:string|null;active?:boolean;created_at?:string|null;sell_by_fraction?:boolean;fraction_unit?:'kg'|'g'|'litro'|'ml'|null;scale_plu?:string|null;parent_product_id?:string|null;apparel_size?:string|null;apparel_color?:string|null;inventory_location?:string|null }
export type SaleItem = { product_id:string;name:string;barcode?:string|null;qty:number;unit_price:number;line_total:number;original_unit_price?:number|null;promotion_discount_percent?:number|null;promotion_savings?:number|null }
export type PaymentPart = { method:string;amount:number;provider?:string|null;reference?:string|null;status?:string|null }
export type SaleDetails = { items?:SaleItem[];subtotal_before_discount?:number;discount_amount?:number;discount?:{kind:'percent'|'amount'|string;value:number}|null;promotion_savings?:number;payment_parts?:PaymentPart[];note?:string|null;captured_at?:string;cae?:string|null;receipt_number?:string|number|null;cae_expiration?:string|null;fiscal_environment?:string|null;fiscal_pending_reason?:string|null;fiscal_pending_since?:string|null;offline_created_at?:string|null;offline_device_id?:string|null;offline_sync_error?:string|null;offline_stock_conflict?:string[]|null;[key:string]:unknown }
export type Sale = { id:string;date:string;total:number;payment:string;items:number;customer_id?:string|null;receipt_type?:string|null;fiscal_status?:string|null;cae?:string|null;receiptNumber?:number;caeExpiration?:string|null;fiscalEnvironment?:string|null;details?:SaleDetails|null }
export type Customer = { id:string;name:string;phone?:string|null;email?:string|null;tax_id?:string|null }
export type CashRegister = { id:string;status:'open'|'closed'|string;opening_amount:number;closing_amount?:number|null;opened_at?:string|null;closed_at?:string|null;close_summary?:Record<string,unknown>|null }
export type CashMovement = { id:string;kind:'expense'|'income'|'egress'|string;amount:number;note?:string|null;occurred_at:string }
export type CommerceSnapshot = { company:CompanyProfile;products:Product[];sales:Sale[];customers:Customer[];cashRegister:CashRegister|null;cashMovements:CashMovement[] }
export type FiscalInvoice = { approved?:boolean;result?:string|null;cae:string;cae_expiration?:string|null;receipt_number:number;date?:string;amount?:number;errors?:Array<{code:string|number;msg:string}>;observations?:Array<{code:string|number;msg:string}> }
export type DeviceSettings = { paper:'80'|'58';autoPrint:boolean;printerMode:'browser'|'bridge';printerName:string;receiptCopies:number;receiptAddress?:string;receiptPhone?:string;receiptHeader?:string;receiptFooter?:string;showBusinessName?:boolean;showTaxId?:boolean;showPaymentMethod?:boolean;showCustomer?:boolean;showSeller?:boolean;showBarcode?:boolean;showFiscalData?:boolean;compactTicket?:boolean }
export type CartLine = Product & { qty:number }