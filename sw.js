/* Asena — servis çalışanı: açılış sayfası önbelleği + telefon bildirimleri */
importScripts('config.js');
const C = 'asena-v2';
const FILES = ['./', './index.html', './config.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;                // Asena ve Firebase her zaman canlı
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request, { ignoreSearch: true })));
});

/* Bildirime dokununca Asena'yı aç */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) if ('focus' in w) return w.focus();
    return clients.openWindow('./?app=1');
  }));
});

/* Firebase: arka planda gelen bildirimleri göster */
if (self.FB_CONFIG && self.FB_CONFIG.apiKey !== 'BURAYA') {
  importScripts('https://www.gstatic.com/firebasejs/' + self.FB_VER + '/firebase-app-compat.js',
                'https://www.gstatic.com/firebasejs/' + self.FB_VER + '/firebase-messaging-compat.js');
  firebase.initializeApp(self.FB_CONFIG);
  firebase.messaging();   // "notification" içeren mesajları kendisi gösterir
}
