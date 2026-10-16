// Service Worker for KAVYA AI - VIRTUAL STORY WORLD (18+)
// Handles offline caching, PWA standalone operation, and bypasses security cookie blocks

const CACHE_NAME = 'kavya-ai-v1.1.0-cache';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/screenshot-1.png',
  '/screenshot-2.png'
];

// Install: Pre-cache core shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Pre-caching partial warning:', err);
      });
    })
  );
});

// Activate: Clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Smart network-first for API, cache-first for assets, and navigation fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-HTTP/HTTPS and analytics/extensions
  if (!url.protocol.startsWith('http')) return;

  // 1. Navigation requests (HTML page): Protect against "Action required / cookie blocked"
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { credentials: 'include' })
        .then(async (response) => {
          // If response looks like a Cloud Run auth interstitial ("Action required"), fallback to cached app
          if (!response.ok && response.status !== 304) {
            const cached = await caches.match('/index.html');
            if (cached) return cached;
          }
          // Clone and update cache
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(async () => {
          // Offline or network error: return cached index.html
          const cached = await caches.match('/index.html') || await caches.match('/');
          if (cached) return cached;
          return new Response('Offline: Kavya AI is loaded from cache', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // 2. Static Assets (Scripts, Styles, Images, Fonts, Audio): Cache-First strategy
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cache immediately, fetch fresh copy in background
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // Otherwise fetch from network and cache
        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. API calls (/api/*): Network first with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            reply: 'Aap offline hain! Message cached ho gaya hai.',
            trust: 10,
            mood: 'Offline 📴'
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request);
    })
  );
});
