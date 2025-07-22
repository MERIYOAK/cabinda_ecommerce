const CACHE_NAME = 'africabinda-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/shop-logo.jpg',
  '/offline.html', // Add an offline fallback page to your public folder
  // Add more static assets as needed
];

// Install: Precache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
  console.log('Service Worker installed and static assets cached!');
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
  console.log('Service Worker activated!');
});

// Fetch: Stale-while-revalidate for all GET requests, dynamic caching, and offline fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Only cache successful, basic (same-origin) responses
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === 'basic'
            ) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // If fetch fails (offline), show offline fallback for navigation
            if (event.request.mode === 'navigate') {
              return cache.match('/offline.html');
            }
          });
        // Stale-while-revalidate: return cached response immediately, update in background
        return cachedResponse || fetchPromise;
      });
    })
  );
}); 