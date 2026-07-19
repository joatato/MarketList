/* Service worker: guarda la app en caché para que funcione sin internet */
const CACHE = "listas-v1";
const ARCHIVOS = ["./", "./index.html", "./manifest.json", "./icono-192.png", "./icono-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(claves =>
      Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // primero red (para recibir actualizaciones), si falla usa la caché
  e.respondWith(
    fetch(e.request)
      .then(respuesta => {
        const copia = respuesta.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia)).catch(() => {});
        return respuesta;
      })
      .catch(() => caches.match(e.request))
  );
});
