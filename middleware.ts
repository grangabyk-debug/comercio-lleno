import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  // Public domain root always shows the commercial landing page.
  if (url.pathname === '/' && url.searchParams.get('app') !== '1') {
    url.pathname = '/landing'
    return NextResponse.rewrite(url)
  }

  // Friendly private URL, e.g. /app/la-economica, internally serves the POS app.
  if (url.pathname.startsWith('/app/')) {
    url.pathname = '/'
    url.searchParams.set('app', '1')
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/app/:path*'],
}
