import type { Metadata } from 'next'
import {headers} from 'next/headers'
import Script from 'next/script'
import LegacyScripts from './LegacyScripts'
import MarketingScripts from './MarketingScripts'
import LegalServiceActions from './LegalServiceActions'
import FloatingWhatsApp from './FloatingWhatsApp'
import PaidBranchPurchaseRuntime from './redesign/PaidBranchPurchaseRuntime'
import PostulaClarity from './PostulaClarity'
import PostulaProLabel from './PostulaProLabel'
import './globals.css'
import './prepaint.css'
import './design-readability.css'
import './requested-polish.css'
import './dashboard-image-polish.css'
import './brand-global.css'
import './mobile-targeted-fixes.css'
import './landing-price-offer-boost.css'
import './redesign/branch-contrast-fix.css'

const faviconUrl='/comercio-lleno-favicon-v3.svg?v=20260815'

const commerceMetadata:Metadata={
  metadataBase:new URL('https://comerciolleno.com'),
  title:{default:'Comercio Lleno',template:'%s | Comercio Lleno'},
  description:'Sistema POS online para comercios con ventas, stock, caja, ARCA, modo offline e inteligencia artificial.',
  applicationName:'Comercio Lleno',
  icons:{
    icon:[{url:faviconUrl,type:'image/svg+xml',sizes:'any'}],
    shortcut:faviconUrl,
    apple:faviconUrl,
  },
  openGraph:{siteName:'Comercio Lleno'},
  other:{
    'facebook-domain-verification':'q5v3fcz0ukr2pub2khpoyipx28fmtc',
  },
}

const postulaMetadata:Metadata={
  metadataBase:new URL('https://postulamejor.com'),
  title:{default:'Postulá Mejor',template:'%s | Postulá Mejor'},
  description:'Empleos, perfil laboral, CV y herramientas para buscar trabajo mejor, en un solo lugar.',
  applicationName:'Postulá Mejor',
  openGraph:{
    siteName:'Postulá Mejor',
    type:'website',
    locale:'es_AR',
    title:'Postulá Mejor',
    description:'Empleos, perfil laboral, CV y herramientas para buscar trabajo mejor, en un solo lugar.',
    url:'https://postulamejor.com',
  },
  alternates:{canonical:'https://postulamejor.com'},
  robots:{index:true,follow:true},
}

export async function generateMetadata():Promise<Metadata>{
  const h=await headers()
  const host=(h.get('x-forwarded-host')||h.get('host')||'').split(':')[0].toLowerCase()
  if(host==='postulamejor.com'||host==='www.postulamejor.com')return postulaMetadata
  return commerceMetadata
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="private-route-guard" strategy="beforeInteractive">{privateRouteGuard}</Script>
        <PostulaClarity />
        <PostulaProLabel />
        <MarketingScripts />
        {children}
        <FloatingWhatsApp />
        <PaidBranchPurchaseRuntime />
        <LegalServiceActions />
        <LegacyScripts />
      </body>
    </html>
  )
}
