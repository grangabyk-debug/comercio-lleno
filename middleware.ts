import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function secure(response: NextResponse, request: NextRequest) {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  const cameraAllowed = request.nextUrl.pathname.startsWith('/movil') || request.nextUrl.pathname.startsWith('/redesign')
  response.headers.set(
    'Permissions-Policy',
    cameraAllowed
      ? 'camera=(self), microphone=(self), geolocation=()'
      : 'camera=(), microphone=(self), geolocation=()',
  )
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Origin-Agent-Cluster', '?1')
  response.headers.set('Content-Security-Policy', "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests")
  return response
}

function redirectPostula(request: NextRequest, pathname: string) {
  const destination = new URL(`https://postulamejor.com${pathname}${request.nextUrl.search}`)
  return secure(NextResponse.redirect(destination, 308), request)
}

function rewritePostula(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  return secure(NextResponse.rewrite(url), request)
}

function postulaMejorRoute(request: NextRequest) {
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase()
  const isApex = host === 'postulamejor.com'
  const isWww = host === 'www.postulamejor.com'
  if (!isApex && !isWww) return null

  const pathname = request.nextUrl.pathname

  if (isWww) return redirectPostula(request, pathname)

  // Implementation URLs never become public canonicals.
  if (pathname === '/postula-preview') return redirectPostula(request, '/')
  if (pathname.startsWith('/empleos-preview/')) return redirectPostula(request, `/empleos/${pathname.slice('/empleos-preview/'.length)}`)
  if (pathname === '/empleos-preview') return redirectPostula(request, '/empleos')
  if (pathname === '/changas-preview') return redirectPostula(request, '/trabajos-flex')
  if (pathname === '/mi-postula-preview/chat') return redirectPostula(request, '/mensajes')
  if (pathname === '/mi-postula-preview') return redirectPostula(request, '/mi-cuenta')
  if (pathname === '/plantillas-preview') return redirectPostula(request, '/plantillas')
  if (pathname === '/postula-acceso-preview') return redirectPostula(request, '/acceso')
  if (pathname.startsWith('/postulacion-preview/')) return redirectPostula(request, `/postular/${pathname.slice('/postulacion-preview/'.length)}`)
  if (pathname === '/empresas-preview') return redirectPostula(request, '/empresas')
  if (pathname.startsWith('/empresas-preview/')) return redirectPostula(request, `/empresas/${pathname.slice('/empresas-preview/'.length)}`)
  if (pathname === '/cv-ia') return redirectPostula(request, '/mejorar-cv')

  // Public product routes. The implementation remains isolated so Comercio Lleno is untouched.
  if (pathname === '/') return rewritePostula(request, '/postula-preview')
  if (pathname === '/empleos') return rewritePostula(request, '/empleos-preview')
  if (pathname.startsWith('/empleos/')) return rewritePostula(request, `/empleos-preview/${pathname.slice('/empleos/'.length)}`)
  if (pathname === '/trabajos-flex') return rewritePostula(request, '/changas-preview')
  if (pathname === '/mi-cuenta') return rewritePostula(request, '/mi-postula-preview')
  if (pathname === '/mensajes') return rewritePostula(request, '/mi-postula-preview/chat')
  if (pathname === '/plantillas') return rewritePostula(request, '/plantillas-preview')
  if (pathname === '/acceso') return rewritePostula(request, '/postula-acceso-preview')
  if (pathname.startsWith('/postular/')) return rewritePostula(request, `/postulacion-preview/${pathname.slice('/postular/'.length)}`)
  if (pathname === '/empresas') return rewritePostula(request, '/empresas-preview')
  if (pathname.startsWith('/empresas/')) return rewritePostula(request, `/empresas-preview/${pathname.slice('/empresas/'.length)}`)
  if (pathname === '/mejorar-cv') return rewritePostula(request, '/cv-ia')

  if (pathname === '/privacidad') return rewritePostula(request, '/cv-ia/privacidad')
  if (pathname === '/terminos') return rewritePostula(request, '/cv-ia/terminos')

  return secure(NextResponse.next(), request)
}

export function middleware(request: NextRequest) {
  const postulaResponse = postulaMejorRoute(request)
  if (postulaResponse) return postulaResponse

  const url = request.nextUrl.clone()

  // Legacy friendly private URLs now resolve to the isolated redesign app.
  if (url.pathname.startsWith('/app/')) {
    url.pathname = '/redesign'
    url.search = ''
    return secure(NextResponse.redirect(url), request)
  }

  return secure(NextResponse.next(), request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
}
