/* Service worker ya WAKALA.
   - Faili za app (index.html, icons) zinachukuliwa kutoka mtandaoni kwanza, ili ukipakia toleo jipya GitHub
     uliona mara moja; mtandao ukikosekana, nakala iliyohifadhiwa inatumika.
   - Firebase na CDN (nje ya tovuti hii) hazijachukuliwa: zinaenda moja kwa moja mtandaoni.
   Ukibadilisha toleo, ongeza namba ya CACHE (wakala-v2, v3...) ili nakala za zamani zifutwe. */
const CACHE = "wakala-v1";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then(m => m || caches.match("./index.html")))
  );
});
