const CACHE_NAME = 'scrybyx-notes-v2';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // A heartbeat must always use the actual network, never a cached response.
  if (request.headers.get('x-network-heartbeat') === '1') return;
  if (request.method !== 'GET') return;

  event.respondWith((async () => {
    try {
      // Prefer a fresh version while online, and retain every successful same-origin
      // document, script, stylesheet, and lazy route chunk for future offline reloads.
      const response = await fetch(request);
      if (response.ok && new URL(request.url).origin === self.location.origin) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') return caches.match('/index.html');
      return Response.error();
    }
  })());
});
