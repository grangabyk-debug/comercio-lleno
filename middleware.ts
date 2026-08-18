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

function postulaMejorRoute(request: NextRequest) {
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase()
  const isApex = host === 'postulamejor.com'
  const isWww = host === 'www.postulamejor.com'
  if (!isApex && !isWww) return null

  const url = request.nextUrl.clone()

  // Keep a single canonical host for ads, analytics and SEO.
  if (isWww) {
    const destination = new URL(`https://postulamejor.com${url.pathname}${url.search}`)
    return secure(NextResponse.redirect(destination, 308), request)
  }

  // Public URLs stay clean while the implementation remains isolated under /cv-ia.
  if (url.pathname === '/') {
    url.pathname = '/cv-ia'
    return secure(NextResponse.rewrite(url), request)
  }
  if (url.pathname === '/cv-ia') {
    const destination = new URL(`https://postulamejor.com/${url.search}`)
    return secure(NextResponse.redirect(destination, 308), request)
  }
  if (url.pathname === '/privacidad') {
    url.pathname = '/cv-ia/privacidad'
    return secure(NextResponse.rewrite(url), request)
  }
  if (url.pathname === '/terminos') {
    url.pathname = '/cv-ia/terminos'
    return secure(NextResponse.rewrite(url), request)
  }

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
