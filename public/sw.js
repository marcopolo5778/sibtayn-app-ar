/**
 * Service Worker برای مؤسسة السبطين
 * این فایل برای PWA Builder و قابلیت نصب روی اندروید لازم است
 */

const CACHE_NAME = 'sibtayn-app-v1.0.0';
const STATIC_CACHE = 'sibtayn-static-v1';
const RUNTIME_CACHE = 'sibtayn-runtime-v1';

// منابع اصلی که کش می‌شوند
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// نصب Service Worker
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW: Pre-caching app shell');
        return cache.addAll(PRECACHE_URLS).catch(err => {
          console.warn('SW: Some precache failed:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// فعال‌سازی
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('SW: Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// مدیریت درخواست‌ها
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // فقط GET را کش کن
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // برای منابع خارجی (مثل سایت sibtayn.com و فونت‌ها): Stale While Revalidate
  if (url.origin !== self.location.origin) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // برای منابع داخلی: Network First، fallback به کش
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // fallback به کش
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // برای navigation، صفحه index را برگردان
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// دریافت پیام از صفحه
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push Notifications (برای PWA)
self.addEventListener('push', (event) => {
  console.log('SW: Push received:', event);
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'مؤسسة السبطين', body: event.data.text() };
    }
  }

  const title = data.title || 'مؤسسة السبطين';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    dir: 'rtl',
    lang: 'ar'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// کلیک روی نوتیفیکیشن
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked:', event);
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // اگر اپ باز است، فوکوس کن
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({ type: 'OPEN_URL', url: targetUrl });
            return client.focus();
          }
        }
        // در غیر این صورت، بازش کن
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
