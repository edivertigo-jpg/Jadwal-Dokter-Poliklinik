/* Service worker — Jadwal Praktek Dokter RSU SHND
 *
 * Strategi:
 *  - Halaman (index.html): network-first, jatuh ke cache kalau offline / sinyal lemot.
 *    Jadi kalau jadwal di index.html diperbarui, HP langsung dapat versi terbaru saat online.
 *  - Icon & manifest: cache-first (jarang berubah).
 *  - Google Fonts: stale-while-revalidate, supaya tampilan tetap sama saat offline.
 *
 * Ubah VERSION hanya kalau icon / manifest / sw.js berubah. Update jadwal (index.html)
 * tidak perlu mengubah VERSION.
 */
const VERSION = 'v1';
const CORE_CACHE = `jadwal-core-${VERSION}`;
const FONT_CACHE = `jadwal-fonts-${VERSION}`;

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-128.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-128.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CORE_CACHE && k !== FONT_CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Google Fonts
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(req, FONT_CACHE));
    return;
  }

  // Selain itu hanya urus file dari domain sendiri
  if (url.origin !== self.location.origin) return;

  // Halaman utama
  if (req.mode === 'navigate') {
    event.respondWith(networkFirstPage(req));
    return;
  }

  // Icon, manifest, dll
  event.respondWith(cacheFirst(req));
});

function fetchWithTimeout(req, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(req).then(
      res => { clearTimeout(timer); resolve(res); },
      err => { clearTimeout(timer); reject(err); }
    );
  });
}

async function networkFirstPage(req) {
  const cache = await caches.open(CORE_CACHE);
  try {
    const fresh = await fetchWithTimeout(req, NETWORK_TIMEOUT_MS);
    if (fresh && fresh.ok) cache.put('./index.html', fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match('./index.html') || await cache.match('./');
    if (cached) return cached;
    return new Response('Offline dan belum ada data tersimpan.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CORE_CACHE);
  const cached = await cache.match(req, { ignoreSearch: true });
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch (err) {
    return new Response('', { status: 504 });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || (await network) || new Response('', { status: 504 });
}
