// Increment this version whenever any file in APP_SHELL changes.
const CACHE_PREFIX = `sorteador-${self.registration.scope}-`;
const CACHE_NAME = `${CACHE_PREFIX}v5`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./pwa.js",
  "./favicon.svg",
  "./manifest.webmanifest",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
].map((path) => new URL(path, self.registration.scope).href);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(
      APP_SHELL.map((url) => new Request(url, { cache: "reload" }))
    ))
  );
  // Let existing windows close before replacing their cached app version.
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  url.search = "";
  url.hash = "";
  if (!APP_SHELL.includes(url.href)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url.href);
    return cached || fetch(event.request);
  })());
});
