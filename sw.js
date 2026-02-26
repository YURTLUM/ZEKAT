const CACHE_NAME = 'zekat-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Debug log (görmek için DevTools -> Console)
  // Belli istekleri doğrudan ağdan çek (ör. manifest), diğerlerini cache-first yap
  const req = event.request;
  if (req.url.endsWith('manifest.json') || req.destination === 'manifest') {
    event.respondWith(
      fetch(req).then(networkRes => {
        // isteği cache'e kaydet
        caches.open(CACHE_NAME).then(cache => cache.put(req, networkRes.clone()));
        return networkRes;
      }).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req)
      .then((response) => response || fetch(req))
  );
});
