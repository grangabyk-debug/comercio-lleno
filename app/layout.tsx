import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import './prepaint.css'

export const metadata: Metadata = { title: 'Comercio Lleno', description: 'Punto de venta y gestión para comercios' }

const legacyScripts = [
  '/products-limit-fix.js','/time-format.js','/session-refresh.js','/auth-gate.js','/role-self-sync.js','/role-manager.js','/customer-rescue.js','/performance-guard.js','/cloud-sync.js','/product-meta-sync.js','/state-refresh-guard.js','/tenant-ui.js','/ui-polish.js','/cash-customer-tools.js','/cash-daily-safe.js','/product-inline-editor.js','/new-product-enhancer.js','/label-selector.js','/sales-audit.js','/sales-discount-badge.js','/pos-pro.js','/pos-search-fix.js','/topbar-refresh.js','/dashboard-trends.js','/comercio-assistant.js','/settings-center.js','/sales-reset-control.js','/first-run-guide.js','/inventory-nav-fix.js','/retail-suite.js','/advanced-products-fix.js','/excel-tools.js','/arca-tools.js','/ui-stability-v2.js','/list-viewport-fix.js','/accounts-promos-fix.js','/overlay-navigation-cleanup.js','/remove-stock-section.js','/final-ui-guard.js','/flatten-functions-menu.js'
]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        {legacyScripts.map((src) => (
          <Script key={src} src={src} strategy="afterInteractive" />
        ))}
      </body>
    </html>
  )
}
