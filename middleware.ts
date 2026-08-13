import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function secure(response: NextResponse, request: NextRequest) {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', request.nextUrl.pathname.startsWith('/movil') ? 'camera=(self), microphone=(), geolocation=()' : 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('Content-Security-Policy', "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests")
  return response
}

export function middleware(request: NextRequest) {
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
