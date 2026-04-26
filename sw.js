// ── NOMBRES DE CACHÉ ──────────────────────────────────────────────────────────
const CACHE_APP   = 'polla-mundial-app-v1';   // HTML, JS, CSS (estáticos)
const CACHE_API   = 'polla-mundial-api-v1';   // Respuestas del proxy /api/*

// ── ARCHIVOS ESTÁTICOS A PRE-CACHEAR ──────────────────────────────────────────
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/sw.js',
];

// ── INSTALL: pre-cachea los archivos estáticos ────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_APP).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// ── ACTIVATE: limpia cachés viejas ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const cachesActuales = [CACHE_APP, CACHE_API];
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres.map((nombre) => {
          if (!cachesActuales.includes(nombre)) {
            console.log('[SW] 🗑️ Eliminando caché vieja:', nombre);
            return caches.delete(nombre);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: estrategia por tipo de petición ────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Solo interceptar peticiones del mismo origen
  if (url.origin !== self.location.origin) return;

  // ── /api/* → Network First con caché de respaldo ──────────────────────────
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstAPI(event.request));
    return;
  }

  // ── Archivos estáticos → Cache First ──────────────────────────────────────
  event.respondWith(cacheFirstApp(event.request));
});

// ── ESTRATEGIA: Network First para la API ────────────────────────────────────
async function networkFirstAPI(request) {
  const cache = await caches.open(CACHE_API);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.append('sw-cached-at', Date.now().toString());

      const body = await responseToCache.arrayBuffer();
      const cachedResponse = new Response(body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers,
      });

      cache.put(request, cachedResponse);
      console.log('[SW] ✅ API cacheada:', request.url);
    }

    return networkResponse;

  } catch (error) {
    console.log('[SW] 📦 Sin red, usando caché para:', request.url);
    const cached = await cache.match(request);

    if (cached) {
      const cachedAt = cached.headers.get('sw-cached-at');
      const age = cachedAt ? Math.round((Date.now() - parseInt(cachedAt)) / 60000) : '?';
      console.log(`[SW] ⏱️ Datos del caché (hace ${age} min)`);
      return cached;
    }

    return new Response(
      JSON.stringify({ error: 'Sin conexión y sin datos en caché', offline: true }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ── ESTRATEGIA: Cache First para archivos estáticos ──────────────────────────
async function cacheFirstApp(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_APP);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const fallback = await caches.match('/index.html');
    return fallback || new Response('Sin conexión', { status: 503 });
  }
}