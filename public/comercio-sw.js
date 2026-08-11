const STATIC_CACHE = 'comercio-lleno-static-v1'
const PAGE_CACHE = 'comercio-lleno-pages-v1'

self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(caches.open(PAGE_CACHE).then(cache => cache.add('/redesign').catch(() => undefined)))
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => ![STATIC_CACHE, PAGE_CACHE].includes(k)).map(k => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('message', event => {
  if (event.data?.type !== 'CACHE_REDESIGN') return
  event.waitUntil(caches.open(PAGE_CACHE).then(cache => cache.add('/redesign').catch(() => undefined)))
})

self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/') || /\.(?:css|js|woff2?|png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE)
      const cached = await cache.match(request)
      if (cached) return cached
      const response = await fetch(request)
      if (response.ok) cache.put(request, response.clone())
      return response
    })())
    return
  }

  if (request.mode === 'navigate' && url.pathname.startsWith('/redesign')) {
    event.respondWith((async () => {
      const cache = await caches.open(PAGE_CACHE)
      try {
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      } catch {
        return (await cache.match(request)) || (await cache.match('/redesign')) || new Response(
          '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Comercio Lleno</title><body style="font-family:system-ui;padding:32px;background:#f4f7f6;color:#14231c"><h1>Comercio Lleno</h1><p>No hay conexión y todavía no existe una copia offline de este dispositivo. Conectate una vez, abrí el sistema y luego quedará preparado para trabajar sin Internet.</p></body>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
        )
      }
    })())
  }
})
