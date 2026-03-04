const CACHE_NAME = 'aufgaben-v3';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './supabase.js',
  './styles.css',
  './manifest.json',
  './icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url && c.focus);
      if (existing) return existing.focus();
      return clients.openWindow('/');
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Supabase API calls and CDN scripts must always go to the network
  const url = event.request.url;
  if (url.includes('supabase.co') || url.includes('cdn.jsdelivr.net')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
