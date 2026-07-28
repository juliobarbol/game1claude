// ════════════════════════════════════════════════════════════════════
// SERVICE WORKER — FILO (PWA)
//
// El juego tiene que abrir SIN internet: se juega en el colectivo, en el
// subte y con el celular en modo avión. Todo el shell (un solo index.html
// + manifest + iconos) se precachea al instalar.
//
// El HTML va network-first (así una versión nueva llega sola al abrir con
// conexión) y el resto cache-first. Al desplegar hay que SUBIR CACHE: si no,
// los aparatos que ya tienen la app siguen con la versión vieja.
// ════════════════════════════════════════════════════════════════════

const CACHE = 'filo-v8';

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(PRECACHE.map(u => c.add(u).catch(() => {})))));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate' || req.destination === 'document'){
    e.respondWith(fetch(req)
      .then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)).catch(() => {}); return r; })
      .catch(() => caches.match(req).then(m => m || caches.match('./index.html'))));
    return;
  }

  e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => {
    if (r && r.ok){ const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)).catch(() => {}); }
    return r;
  }).catch(() => m)));
});
