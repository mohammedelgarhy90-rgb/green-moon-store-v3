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
