import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

function secure(response:NextResponse,request:NextRequest){
 response.headers.set('X-Content-Type-Options','nosniff')
 response.headers.set('X-Frame-Options','SAMEORIGIN')
 response.headers.set('Referrer-Policy','strict-origin-when-cross-origin')
 const cameraAllowed=request.nextUrl.pathname.startsWith('/movil')||request.nextUrl.pathname.startsWith('/redesign')
 response.headers.set('Permissions-Policy',cameraAllowed?'camera=(self), microphone=(self), geolocation=()':'camera=(), microphone=(self), geolocation=()')
 response.headers.set('X-Permitted-Cross-Domain-Policies','none')
 response.headers.set('X-DNS-Prefetch-Control','off')
 response.headers.set('Strict-Transport-Security','max-age=63072000; includeSubDomains; preload')
 const authPopupAllowed=request.nextUrl.pathname==='/login'||request.nextUrl.pathname==='/registro'
 response.headers.set('Cross-Origin-Opener-Policy',authPopupAllowed?'same-origin-allow-popups':'same-origin')
 response.headers.set('Origin-Agent-Cluster','?1')
 response.headers.set('Cross-Origin-Resource-Policy','same-site')
 response.headers.set('Content-Security-Policy',"base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests")
 return response
}

export function middleware(request:NextRequest){
 const url=request.nextUrl.clone()
 if(url.pathname.startsWith('/app/')){
  url.pathname='/redesign'
  url.search=''
  return secure(NextResponse.redirect(url),request)
 }
 return secure(NextResponse.next(),request)
}

export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)']}
