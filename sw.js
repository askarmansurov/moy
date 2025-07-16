const CACHE_NAME = 'site-cache-v99'; // увеличивай версию для ещё более принудительных обновлений
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/catalog.html',
  '/cart.html',
  '/about.html',
  '/contacts.html',
  '/product-computer.html',
  '/product-videocard.html',
  '/product-processor.html',
  '/product-flash.html',
  '/style.css',
  '/script.js',
  '/111.png',
  '/offline.html'
];

self.addEventListener('install', event => {
  console.log('[SW] Установка: жёсткий кеш');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Активация: удаляем все старые кэши');
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(cacheNames.map(name => caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => caches.match('/offline.html'));
    })
  );
});
