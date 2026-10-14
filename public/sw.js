/* Green Moon web-push service worker */
self.addEventListener('push', event => {
  let data = { title: 'Green Moon Plants & Flowers', body: 'لديك تحديث جديد من جرين مون', url: '/' };
  try { data = { ...data, ...(event.data ? event.data.json() : {}) }; }
  catch (_) { try { if (event.data) data.body = event.data.text(); } catch (_) {} }
  const target = typeof data.url === 'string' && data.url.startsWith('/') ? data.url : '/';
  event.waitUntil(self.registration.showNotification(data.title || 'Green Moon Plants & Flowers', {
    body: data.body || 'لديك تحديث جديد من جرين مون',
    icon: '/assets/logo.jpg',
    badge: '/assets/logo.jpg',
    image: data.image || undefined,
    tag: data.tag || 'green-moon-update',
    data: { url: target },
    dir: 'rtl', lang: 'ar',
    renotify: false
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data && event.notification.data.url || '/';
  const url = new URL(target, self.location.origin).href;
  event.waitUntil(clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
    for (const client of list) {
      if ('focus' in client) { if ('navigate' in client) client.navigate(url); return client.focus(); }
    }
    return clients.openWindow(url);
  }));
});


/* Green Moon PWA: cache the app shell safely while keeping API/order data network-only. */
const GM_PWA_CACHE = 'GM_PWA_CACHE_V1';
const GM_PWA_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/green-moon-192.png', '/icons/green-moon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(GM_PWA_CACHE).then(cache => cache.addAll(GM_PWA_SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('GM_PWA_CACHE_') && key !== GM_PWA_CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response && response.ok) { const copy = response.clone(); caches.open(GM_PWA_CACHE).then(cache => cache.put('/index.html', copy)).catch(() => {}); }
      return response;
    }).catch(async () => (await caches.match('/index.html')) || (await caches.match('/')) || Response.error()));
    return;
  }
  if (/\.(?:png|jpe?g|webp|svg|css|js|woff2?)$/i.test(url.pathname) || url.pathname === '/manifest.webmanifest') {
    event.respondWith(caches.match(request).then(cached => {
      const update = fetch(request).then(response => { if (response && response.ok) { caches.open(GM_PWA_CACHE).then(cache => cache.put(request, response.clone())).catch(() => {}); } return response; });
      return cached || update;
    }));
  }
});
