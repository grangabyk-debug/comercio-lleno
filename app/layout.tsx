import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import './prepaint.css'

export const metadata: Metadata = { title: 'Comercio Lleno', description: 'Punto de venta y gestión para comercios' }

const legacyScripts = [
  '/products-limit-fix.js','/time-format.js','/session-refresh.js','/auth-gate.js','/private-route-unlock.js','/role-self-sync.js','/role-manager.js','/customer-rescue.js','/performance-guard.js','/cloud-sync.js','/product-meta-sync.js','/state-refresh-guard.js','/tenant-ui.js','/ui-polish.js','/cash-customer-tools.js','/cash-daily-safe.js','/product-inline-editor.js','/new-product-enhancer.js','/label-selector.js','/sales-audit.js','/sales-discount-badge.js','/pos-pro.js','/pos-arca-guard.js','/pos-search-fix.js','/topbar-refresh.js','/dashboard-trends.js','/comercio-assistant.js','/settings-center.js','/sales-reset-control.js','/first-run-guide.js','/inventory-nav-fix.js','/retail-suite.js','/advanced-products-fix.js','/excel-tools.js','/arca-tools.js','/ui-stability-v2.js','/list-viewport-fix.js','/accounts-promos-fix.js','/overlay-navigation-cleanup.js','/remove-stock-section.js','/final-ui-guard.js','/flatten-functions-menu.js'
]

const privateRouteGuard = `
(function(){
  try {
    var path = location.pathname.replace(/\\/+$/, '') || '/';
    var params = new URLSearchParams(location.search);
    var isLegacyTenantPath = path.indexOf('/app/') === 0;
    var isPrivateRoot = path === '/' && params.get('app') === '1';
    if (!isLegacyTenantPath && !isPrivateRoot) return;

    var style = document.createElement('style');
    style.id = 'cl-private-lock-style';
    style.textContent = 'html.cl-private-locked body{visibility:hidden!important}';
    document.head.appendChild(style);
    document.documentElement.classList.add('cl-private-locked');

    var token = localStorage.getItem('cl_access_token') || '';
    var valid = false;
    if (token) {
      try {
        var p = token.split('.')[1];
        var json = JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(p.length/4)*4,'=')));
        valid = !json.exp || json.exp * 1000 > Date.now();
      } catch (_) { valid = false; }
    }
    if (!valid) {
      localStorage.removeItem('cl_access_token');
      localStorage.removeItem('cl_refresh_token');
      location.replace('/login');
      return;
    }

    if (isLegacyTenantPath) {
      location.replace('/?app=1');
    }
  } catch (_) {
    location.replace('/login');
  }
})();`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="private-route-guard" strategy="beforeInteractive">{privateRouteGuard}</Script>
        {children}
        {legacyScripts.map((src) => (
          <Script key={src} src={src} strategy="afterInteractive" />
        ))}
      </body>
    </html>
  )
}
