// sw.js - Service Worker for Street Grammar Driving School PWA
const CACHE_NAME = 'street-grammar-v1';
const urlsToCache = [
  '/',
  '/index.html',        // main html (assuming this file name)
  '/offline.html',       // offline fallback
  '/manifest.json',
  'https://i.ibb.co/qF4MrGf5/drive-schoollogo.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&family=Playfair+Display:ital,wght@0,500;1,500&display=swap',
  'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1974&auto=format&fit=crop'
];

// Install event: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serve from cache, fallback to network, then offline page
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit – return response
        if (response) {
          return response;
        }
        // Clone request because it's a stream
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // Clone response to cache and return
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                // Optionally cache new resources (avoid over-caching)
                if (event.request.method === 'GET') {
                  cache.put(event.request, responseToCache);
                }
              });
            return response;
          })
          .catch(() => {
            // If both fail and it's a navigation request, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
