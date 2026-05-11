// Service Worker for AURA Market
const CACHE_NAME = 'aura-market-v1';
const ASSETS = [
  'index.html',
  'style.css',
  'app.js',
  'marketplace.js',
  'sellers.js',
  'store.js',
  'contact.js',
  'about.html',
  'contact.html'
  // Add other assets you want offline (like icon images)
];

// Install event: cache all core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch event: serve from cache, then network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response immediately if available,
      // otherwise fetch from network
      return cachedResponse || fetch(event.request);
    })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});