/* Service Worker für Media Mibaso
   --------------------------------
   • SHELL_CACHE (versioniert): Seiten, CSS/JS, Icons. Wird bei jeder neuen
     Version neu geladen, damit Änderungen sofort durchschlagen.
   • Strategie: Seiten „zuerst Netz, sonst Cache" (immer aktuell, aber offline
     verfügbar). Icons/Bilder „zuerst Cache".

   WICHTIG: Bei inhaltlichen Änderungen die SHELL-Version unten erhöhen
   (z. B. media-shell-v1 → v2). Genau das löst bei den Nutzern das
   „Neue Version verfügbar"-Banner aus.
*/

const SHELL_CACHE = 'media-shell-v1';
const MEDIA_CACHE = 'media-media-v1';

const CORE = [
  './',
  './index.html',
  './kurse/',
  './kurse/index.html',
  './manifest.webmanifest',
  './assets/app.js',
  './assets/icon.svg'
];

function istMedia(url) {
  return /\.(png|jpg|jpeg|svg|webp)$/i.test(url.pathname);
}

// Installation: Kern-Hülle ablegen (einzeln, damit ein Fehler nicht alles kippt)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(CORE.map((u) => cache.add(u)))
    )
  );
});

// Aktivierung: alte Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== SHELL_CACHE && k !== MEDIA_CACHE)
            .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Nachricht von der Seite: sofort aktualisieren
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Abruf-Strategie
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // externe PDFs (mibaso.de) nicht abfangen

  // Icons/Bilder: zuerst Cache
  if (istMedia(url)) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then((cache) =>
        cache.match(req).then((treffer) =>
          treffer || fetch(req).then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          }).catch(() => treffer)
        )
      )
    );
    return;
  }

  // Seiten/Daten: zuerst Netz (frisch), sonst Cache, sonst Startseite
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});
