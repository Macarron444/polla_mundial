const CACHE_APP = 'polla-mundial-app-v2'
const CACHE_API = 'polla-mundial-api-v1'

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/sw.js',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE_APP).then((cache) => cache.addAll(ASSETS_TO_CACHE)))
})

self.addEventListener('activate', (event) => {
  const cachesActuales = [CACHE_APP, CACHE_API]
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres.map((nombre) => {
          if (!cachesActuales.includes(nombre)) {
            return caches.delete(nombre)
          }
          return undefined
        })
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  if (url.origin !== self.location.origin) return

    if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstAPI(event.request))
    return
  }

  if (url.pathname.startsWith('/db/')) return

  event.respondWith(cacheFirstApp(event.request))
})

async function networkFirstAPI(request) {
  const cache = await caches.open(CACHE_API)

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone()
      const headers = new Headers(responseToCache.headers)
      headers.append('sw-cached-at', Date.now().toString())

      const body = await responseToCache.arrayBuffer()
      const cachedResponse = new Response(body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers,
      })

      cache.put(request, cachedResponse)
    }

    return networkResponse
  } catch (error) {
    const cached = await cache.match(request)

    if (cached) {
      return cached
    }

    return new Response(
      JSON.stringify({ error: 'Sin conexion y sin datos en cache', offline: true }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

async function cacheFirstApp(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_APP)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const fallback = await caches.match('/index.html')
    return fallback || new Response('Sin conexion', { status: 503 })
  }
}
