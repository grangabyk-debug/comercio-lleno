import type { SVGProps } from 'react'

export type UiIconName =
  | 'home' | 'sale' | 'products' | 'cash' | 'settings' | 'sparkles' | 'management'
  | 'sales' | 'reports' | 'customers' | 'profit' | 'accounts' | 'returns' | 'promotions'
  | 'purchases' | 'suppliers' | 'banknote' | 'plus' | 'minus' | 'withdraw' | 'receipt'
  | 'check' | 'alert' | 'user' | 'discount' | 'search' | 'trash' | 'printer'

const paths: Record<UiIconName, React.ReactNode> = {
  home: <><path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></>,
  sale: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 9h10M7 13h4"/><circle cx="16.5" cy="14.5" r="1.5"/></>,
  products: <><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7 8 4 8-4M4 7v10l8 4 8-4V7M12 11v10"/></>,
  cash: <><rect x="3" y="6" width="18" height="12" rx="3"/><path d="M7 10h5M7 14h3"/><circle cx="17" cy="12" r="1.5"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3h4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  sparkles: <><path d="m12 3 1.2 3.1L16 7.5l-2.8 1.4L12 12l-1.2-3.1L8 7.5l2.8-1.4L12 3Z"/><path d="m18.5 13 .8 2.1 1.7.9-1.7.9-.8 2.1-.8-2.1L16 16l1.7-.9.8-2.1ZM5.5 13l.8 2.1L8 16l-1.7.9L5.5 19l-.8-2.1L3 16l1.7-.9.8-2.1Z"/></>,
  management: <><rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="4" width="7" height="7" rx="1.5"/><rect x="3" y="15" width="7" height="5" rx="1.5"/><rect x="14" y="15" width="7" height="5" rx="1.5"/></>,
  sales: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
  reports: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  customers: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15 15.5c3.2-.8 5.5 1 5.5 4.5"/></>,
  profit: <><path d="M4 18 9 13l4 3 7-9"/><path d="M15 7h5v5"/></>,
  accounts: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h3"/></>,
  returns: <><path d="M9 7 4 12l5 5"/><path d="M4 12h9a6 6 0 0 1 6 6"/></>,
  promotions: <><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/><path d="m18.5 5.5-13 13"/></>,
  purchases: <><path d="M4 7h16l-1.5 8h-13L4 4H2"/><circle cx="8" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></>,
  suppliers: <><path d="M3 20h18M5 20V8l7-4 7 4v12"/><path d="M9 20v-5h6v5M8 10h2M14 10h2"/></>,
  banknote: <><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="3"/><path d="M6 9.5a2.5 2.5 0 0 1-2.5 2.5M18 9.5a2.5 2.5 0 0 0 2.5 2.5M6 14.5A2.5 2.5 0 0 0 3.5 12M18 14.5a2.5 2.5 0 0 1 2.5-2.5"/></>,
  plus: <path d="M12 5v14M5 12h14"/>, minus: <path d="M5 12h14"/>,
  withdraw: <><path d="M5 12h12"/><path d="m13 8 4 4-4 4"/><path d="M4 5h8M4 19h8"/></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></>,
  check: <path d="m5 12 4 4L19 6"/>, alert: <><path d="M12 4 3 20h18L12 4Z"/><path d="M12 9v5M12 17h.01"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  discount: <><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/><path d="m18.5 5.5-13 13"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/></>,
  printer: <><path d="M7 8V4h10v4M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="7" rx="1"/></>,
}

export default function UiIcon({ name, size = 18, ...props }: { name: UiIconName; size?: number } & SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>
}
