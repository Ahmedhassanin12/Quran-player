/* Service Worker for Quran Kareem PWA */
const CACHE_NAME = 'quran-kareem-v2';

const STATIC_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico',
];

// Install Event — precache the application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

// Activate Event — clean up outdated caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
            return null;
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch Event — handle routing and caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Audio stream requests — bypass cache to preserve native HTTP 206 Partial Content range requests
  if (
    request.destination === 'audio' ||
    url.pathname.endsWith('.mp3') ||
    request.headers.get('range')
  ) {
    return;
  }

  // 2. Navigation requests (HTML pages) — Network First with offline fallback to /index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('/index.html');
        }),
    );
    return;
  }

  // 3. Static assets & Authentic Madinah Mushaf Page Scans — Cache First with Network update
  if (
    url.hostname.includes('files.quran.app') ||
    url.hostname.includes('android.quran.com') ||
    (url.origin === self.location.origin &&
      (url.pathname.startsWith('/assets/') ||
        url.pathname.startsWith('/icons/') ||
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'font' ||
        request.destination === 'image'))
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Asynchronously revalidate in background
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      }),
    );
    return;
  }

  // 4. API Calls (Quran API data) — Network first with cache fallback
  if (url.hostname.includes('quran.com')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request)),
    );
  }
});
