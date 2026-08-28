import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

const POSTULA_MAINTENANCE=false

function isPostulaHost(request:NextRequest){
 const host=(request.headers.get('host')||'').split(':')[0].toLowerCase()
 return host==='postulamejor.com'||host==='www.postulamejor.com'
}
function isSensitivePostulaPath(pathname:string){
 return pathname==='/login'||pathname==='/registro'||pathname==='/mensajes'||pathname==='/calendario'||pathname.startsWith('/mi-cuenta')||pathname.startsWith('/postular/')||pathname==='/empresas/login'||pathname==='/empresas/registro'||pathname.startsWith('/empresas/calendario')||pathname.startsWith('/mi-postula-preview')||pathname.startsWith('/postulacion-preview/')||pathname==='/postula-login-preview'||pathname==='/postula-registro-preview'||pathname==='/postula-calendar-preview'
}
function secure(response:NextResponse,request:NextRequest){
 response.headers.set('X-Content-Type-Options','nosniff')
 response.headers.set('X-Frame-Options','SAMEORIGIN')
 response.headers.set('Referrer-Policy','strict-origin-when-cross-origin')
 const cameraAllowed=request.nextUrl.pathname.startsWith('/movil')||request.nextUrl.pathname.startsWith('/redesign')
 response.headers.set('Permissions-Policy',cameraAllowed?'camera=(self), microphone=(self), geolocation=()':'camera=(), microphone=(self), geolocation=()')
 response.headers.set('X-Permitted-Cross-Domain-Policies','none')
 response.headers.set('X-DNS-Prefetch-Control','off')
 response.headers.set('Strict-Transport-Security','max-age=63072000; includeSubDomains; preload')
 const authPopupAllowed=request.nextUrl.pathname==='/login'||request.nextUrl.pathname==='/registro'||request.nextUrl.pathname==='/empresas/login'||request.nextUrl.pathname==='/empresas/registro'
 response.headers.set('Cross-Origin-Opener-Policy',authPopupAllowed?'same-origin-allow-popups':'same-origin')
 response.headers.set('Origin-Agent-Cluster','?1')
 response.headers.set('Cross-Origin-Resource-Policy','same-site')
 response.headers.set('Content-Security-Policy',"base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests")
 if(isPostulaHost(request)){
  response.headers.set('X-Frame-Options','DENY')
  response.headers.set('Content-Security-Policy',"base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests")
  const pathname=request.nextUrl.pathname
  if(isSensitivePostulaPath(pathname)){
   response.headers.set('Cache-Control','private, no-store, max-age=0, must-revalidate')
   response.headers.set('Pragma','no-cache')
   response.headers.set('X-Robots-Tag','noindex, nofollow, noarchive, nosnippet')
  }
  if(pathname.startsWith('/api/postula/')){
   response.headers.set('Cache-Control','private, no-store, max-age=0, must-revalidate')
   response.headers.set('Pragma','no-cache')
  }
 }
 return response
}

function redirectPostula(request:NextRequest,pathname:string){
 const destination=new URL(`https://postulamejor.com${pathname}${request.nextUrl.search}`)
 return secure(NextResponse.redirect(destination,308),request)
}
function redirectPostulaClean(request:NextRequest,pathname:string,search=''){
 const destination=new URL(`https://postulamejor.com${pathname}${search}`)
 return secure(NextResponse.redirect(destination,307),request)
}
function rewritePostula(request:NextRequest,pathname:string){
 const url=request.nextUrl.clone();url.pathname=pathname
 return secure(NextResponse.rewrite(url),request)
}

function postulaMaintenance(request:NextRequest){
 const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Postulá Mejor | Estamos trabajando</title><style>*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#0d0b12;color:#fff;font-family:Inter,system-ui,sans-serif}body{min-height:100vh;display:grid;place-items:center;padding:24px}.card{width:min(640px,100%);text-align:center;padding:54px 34px;border-radius:30px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.055)}h1{font-size:clamp(38px,8vw,68px);line-height:.96;letter-spacing:-.055em}p{font-size:18px;line-height:1.55;color:rgba(255,255,255,.66)}</style></head><body><main class="card"><h1>Estamos trabajando<br>en algo nuevo.</h1><p>Estamos mejorando la plataforma. Volvemos pronto.</p></main></body></html>'
 return secure(new NextResponse(html,{status:200,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store, max-age=0'}}),request)
}

function postulaMejorRoute(request:NextRequest){
 const host=(request.headers.get('host')||'').split(':')[0].toLowerCase()
 const isApex=host==='postulamejor.com',isWww=host==='www.postulamejor.com'
 if(!isApex&&!isWww)return null
 if(POSTULA_MAINTENANCE)return postulaMaintenance(request)
 const pathname=request.nextUrl.pathname,params=request.nextUrl.searchParams
 if(isWww)return redirectPostula(request,pathname)

 if(pathname==='/acceso')return redirectPostulaClean(request,params.get('rol')==='empresa'?'/empresas/registro':'/login')
 if(pathname==='/cuenta'){
  const employer=params.get('role')==='employer'||params.get('rol')==='empresa'
  const signup=params.get('modo')==='crear'
  const reset=params.get('reset')==='1'
  if(employer)return redirectPostulaClean(request,signup?'/empresas/registro':'/empresas/login',reset?'?reset=1':'')
  return redirectPostulaClean(request,signup?'/registro':'/login',reset?'?reset=1':'')
 }

 if(pathname==='/postula-preview')return redirectPostula(request,'/')
 if(pathname==='/postula-login-preview')return redirectPostulaClean(request,'/login')
 if(pathname==='/postula-registro-preview')return redirectPostulaClean(request,'/registro')
 if(pathname==='/postula-calendar-preview')return redirectPostula(request,'/calendario')
 if(pathname.startsWith('/empleos-preview/'))return redirectPostula(request,`/empleos/${pathname.slice('/empleos-preview/'.length)}`)
 if(pathname==='/empleos-preview')return redirectPostula(request,'/empleos')
 if(pathname==='/changas-preview')return redirectPostula(request,'/servicios-flex')
 if(pathname==='/trabajos-flex')return redirectPostula(request,'/servicios-flex')
 if(pathname==='/mi-postula-preview/chat')return redirectPostula(request,'/mensajes')
 if(pathname==='/mi-postula-preview/preferences')return redirectPostula(request,'/mi-cuenta/preferencias')
 if(pathname==='/mi-postula-preview')return redirectPostula(request,'/mi-cuenta')
 if(pathname==='/plantillas-preview')return redirectPostula(request,'/plantillas')
 if(pathname==='/postula-acceso-preview')return redirectPostulaClean(request,'/login')
 if(pathname.startsWith('/postulacion-preview/'))return redirectPostula(request,`/postular/${pathname.slice('/postulacion-preview/'.length)}`)
 if(pathname==='/empresas-preview')return redirectPostula(request,'/empresas')
 if(pathname.startsWith('/empresas-preview/'))return redirectPostula(request,`/empresas/${pathname.slice('/empresas-preview/'.length)}`)
 if(pathname==='/cv-ia')return redirectPostula(request,'/mejorar-cv')

 if(pathname==='/')return rewritePostula(request,'/postula-preview')
 if(pathname==='/registro')return rewritePostula(request,'/postula-registro-preview')
 if(pathname==='/login')return rewritePostula(request,'/postula-login-preview')
 if(pathname==='/calendario')return rewritePostula(request,'/postula-calendar-preview')
 if(pathname==='/empleos')return rewritePostula(request,'/empleos-preview')
 if(pathname.startsWith('/empleos/'))return rewritePostula(request,`/empleos-preview/${pathname.slice('/empleos/'.length)}`)
 if(pathname==='/servicios-flex')return rewritePostula(request,'/changas-preview')
 if(pathname==='/mi-cuenta/preferencias')return rewritePostula(request,'/mi-postula-preview/preferences')
 if(pathname==='/mi-cuenta')return rewritePostula(request,'/mi-postula-preview')
 if(pathname==='/mensajes')return rewritePostula(request,'/mi-postula-preview/chat')
 if(pathname==='/plantillas')return rewritePostula(request,'/plantillas-preview')
 if(pathname.startsWith('/postular/'))return rewritePostula(request,`/postulacion-preview/${pathname.slice('/postular/'.length)}`)
 if(pathname==='/empresas')return rewritePostula(request,'/empresas-preview')
 if(pathname.startsWith('/empresas/'))return rewritePostula(request,`/empresas-preview/${pathname.slice('/empresas/'.length)}`)
 if(pathname==='/mejorar-cv')return rewritePostula(request,'/cv-ia')
 if(pathname==='/privacidad')return rewritePostula(request,'/cv-ia/privacidad')
 if(pathname==='/terminos')return rewritePostula(request,'/cv-ia/terminos')
 if(pathname==='/terminos/servicios-flex')return rewritePostula(request,'/cv-ia/terminos/servicios-flex')
 return secure(NextResponse.next(),request)
}

export function middleware(request:NextRequest){
 const postulaResponse=postulaMejorRoute(request);if(postulaResponse)return postulaResponse
 const url=request.nextUrl.clone()
 if(url.pathname.startsWith('/app/')){url.pathname='/redesign';url.search='';return secure(NextResponse.redirect(url),request)}
 return secure(NextResponse.next(),request)
}

export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)']}
