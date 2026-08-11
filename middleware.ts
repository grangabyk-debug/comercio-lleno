import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  // Legacy friendly private URLs now resolve to the isolated redesign app.
  if (url.pathname.startsWith('/app/')) {
    url.pathname = '/redesign'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*'],
}
