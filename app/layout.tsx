import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Comercio Lleno', description: 'Punto de venta y gestión para comercios' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}<script src="/auth-gate.js" defer /><script src="/customer-rescue.js" defer /><script src="/cloud-sync.js" defer /><script src="/tenant-ui.js" defer /><script src="/ui-polish.js" defer /><script src="/cash-customer-tools.js" defer /><script src="/cash-daily-safe.js" defer /><script src="/product-inline-editor.js" defer /><script src="/new-product-enhancer.js" defer /><script src="/label-selector.js" defer /><script src="/sales-audit.js" defer /><script src="/sales-discount-badge.js" defer /><script src="/pos-pro.js" defer /><script src="/pos-search-fix.js" defer /><script src="/pos-layout-fix.js" defer /><script src="/topbar-refresh.js" defer /><script src="/dashboard-trends.js" defer /><script src="/comercio-assistant.js" defer /><script src="/excel-tools.js" defer /><script src="/arca-tools.js" defer /></body></html>
}