const CACHE_VERSION = 2;
const CACHE_NAME = `mwa-v${CACHE_VERSION}`;
const IMAGE_CACHE = `mwa-images-v${CACHE_VERSION}`;
const MAX_IMAGE_CACHE_SIZE = 100;

const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install — cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== IMAGE_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Trim image cache to max size
async function trimImageCache() {
  const cache = await caches.open(IMAGE_CACHE);
  const keys = await cache.keys();
  if (keys.length > MAX_IMAGE_CACHE_SIZE) {
    const toDelete = keys.slice(0, keys.length - MAX_IMAGE_CACHE_SIZE);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

// Fetch — network-first for API, cache-first for images with size limit
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // API calls — network only
  if (url.pathname.startsWith('/api/')) return;

  // Images — cache-first with size limit
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, clone);
              trimImageCache();
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else — network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  );
});
