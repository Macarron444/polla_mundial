const CACHE_VERSION = '__VITE_BUILD_HASH__'
const CACHE_APP     = `polla-mundial-app-${CACHE_VERSION}`
const CACHE_API     = 'polla-mundial-api-v1'
const CACHE_DB      = 'polla-mundial-db-v1'

const ASSETS_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', (event) => {
  self.skipWaiting()   // activar inmediatamente sin esperar a que se cierren pestañas
  event.waitUntil(
    caches.open(CACHE_APP).then((cache) => cache.addAll(ASSETS_PRECACHE))
  )
})

self.addEventListener('activate', (event) => {
  const cachesValidos = [CACHE_APP, CACHE_API, CACHE_DB]
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((n) => !cachesValidos.includes(n))
          .map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/db/')) {
    if (event.request.method === 'GET') {
      event.respondWith(networkFirstDB(event.request))
    } else {
      event.respondWith(mutateDB(event.request))
    }
    return
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstAPI(event.request))
    return
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirstInmutable(event.request))
    return
  }

  event.respondWith(networkFirstApp(event.request))
})

async function networkFirstApp(request) {
  const cache = await caches.open(CACHE_APP)
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    // SPA fallback
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
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch {
    return new Response('Recurso no disponible offline', { status: 503 })
  }
}


async function networkFirstAPI(request) {
  const cache = await caches.open(CACHE_API)
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const headers = new Headers(networkResponse.headers)
      headers.set('sw-cached-at', Date.now().toString())
      const body = await networkResponse.clone().arrayBuffer()
      cache.put(request, new Response(body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers,
      }))
    }
    return networkResponse
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return new Response(
      JSON.stringify({ error: 'Sin conexión y sin datos en caché', offline: true }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

async function networkFirstDB(request) {
  const cache = await caches.open(CACHE_DB)
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch {
    const cached = await cache.match(request)
    if (cached) {
      // Clonar con header que indica que viene del caché
      const body = await cached.clone().arrayBuffer()
      return new Response(body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: { ...Object.fromEntries(cached.headers), 'sw-from-cache': 'true' },
      })
    }
    return new Response(
      JSON.stringify({ error: 'Sin conexión y sin datos en caché', offline: true }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

async function mutateDB(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_DB)
      const keys  = await cache.keys()
      const base  = new URL(request.url).pathname.split('/').slice(0, 3).join('/')
      await Promise.all(
        keys
          .filter((k) => new URL(k.url).pathname.startsWith(base))
          .map((k) => cache.delete(k))
      )
    }
    return networkResponse
  } catch {
    return new Response(
      JSON.stringify({ error: 'Sin conexión — cambio no guardado', offline: true }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}