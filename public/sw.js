const CACHE_VERSION = '__VITE_BUILD_HASH__'
const CACHE_APP     = `polla-mundial-app-${CACHE_VERSION}`
const CACHE_API     = 'polla-mundial-api-v1'

const ASSETS_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_APP).then((cache) => cache.addAll(ASSETS_PRECACHE))
  )
})

self.addEventListener('activate', (event) => {
  const cachesValidos = [CACHE_APP, CACHE_API]
  event.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(
        nombres.filter((n) => !cachesValidos.includes(n)).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  // ── NUNCA interceptar peticiones al backend ni a la API de fútbol ──────────
  if (url.pathname.startsWith('/db/') || url.pathname.startsWith('/api/')) return

  // Assets con hash → cache-first (son inmutables)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirstInmutable(event.request))
    return
  }

  // Todo lo demás → network-first
  event.respondWith(networkFirstApp(event.request))
})

async function networkFirstApp(request) {
  const cache = await caches.open(CACHE_APP)
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) cache.put(request, networkResponse.clone())
    return networkResponse
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    const fallback = await cache.match('/index.html')
    return fallback || new Response('Sin conexión', { status: 503 })
  }
}

async function cacheFirstInmutable(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const cache = await caches.open(CACHE_APP)
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) cache.put(request, networkResponse.clone())
    return networkResponse
  } catch {
    return new Response('Recurso no disponible offline', { status: 503 })
  }
}