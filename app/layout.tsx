import type { Metadata } from 'next'
import Script from 'next/script'
import LegacyScripts from './LegacyScripts'
import FloatingWhatsApp from './FloatingWhatsApp'
import './globals.css'
import './prepaint.css'
import './landing-final-trust.css'
import './mobile-viewport-boost.css'
import './landing-mobile-entry.css'
import './landing-readable.css'

export const metadata: Metadata = {
  metadataBase:new URL('https://comerciolleno.com'),
  title:{default:'Comercio Lleno',template:'%s | Comercio Lleno'},
  description:'Sistema POS online para comercios con ventas, stock, caja, ARCA, modo offline e inteligencia artificial.',
  applicationName:'Comercio Lleno',
  icons:{
    icon:[{url:'/icon.svg',type:'image/svg+xml',sizes:'any'}],
    shortcut:'/icon.svg',
    apple:'/icon.svg',
  },
  openGraph:{siteName:'Comercio Lleno'},
}

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

const googleAdsTag = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-18388928228');`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="private-route-guard" strategy="beforeInteractive">{privateRouteGuard}</Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18388928228"
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">{googleAdsTag}</Script>
        {children}
        <FloatingWhatsApp />
        <LegacyScripts />
      </body>
    </html>
  )
}
