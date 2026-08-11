import type { Metadata } from 'next'
import Script from 'next/script'
import LegacyScripts from './LegacyScripts'
import './globals.css'
import './prepaint.css'

export const metadata: Metadata = { title: 'Comercio Lleno', description: 'Punto de venta y gestión para comercios' }

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
        <LegacyScripts />
      </body>
    </html>
  )
}
