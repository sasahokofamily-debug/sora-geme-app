const CACHE_NAME = "shooking-ii-v19";
const APP_SHELL = [
  "./",
  "./index.html",
  "./details.html",
  "./ui-patch.js",
  "./google-login.js",
  "./firebase-error-patch.js",
  "./firebase-login-fallback.js",
  "./firebase-login-rescue.js",
  "./hard-stages.js",
  "./hangar-fix.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

async function addAppPatches(response) {
  let html = await response.text();
  if (!html.includes("ui-patch.js")) html = html.replace("</body>", '<script src="./ui-patch.js?v=3"></script></body>');
  if (!html.includes("google-login.js")) html = html.replace("</body>", '<script src="./google-login.js?v=9"></script></body>');
  if (!html.includes("firebase-error-patch.js")) html = html.replace("</body>", '<script src="./firebase-error-patch.js?v=9"></script></body>');
  if (!html.includes("firebase-login-fallback.js")) html = html.replace("</body>", '<script src="./firebase-login-fallback.js?v=9"></script></body>');
  if (!html.includes("firebase-login-rescue.js")) html = html.replace("</body>", '<script src="./firebase-login-rescue.js?v=9"></script></body>');
  if (!html.includes("hard-stages.js")) html = html.replace("</body>", '<script src="./hard-stages.js?v=16"></script></body>');
  if (!html.includes("hangar-fix.js")) html = html.replace("</body>", '<script src="./hangar-fix.js?v=17"></script></body>');

  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.delete("content-length");
  headers.set("cache-control", "no-cache");
  return new Response(html, {status:response.status,statusText:response.statusText,headers});
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try { return await addAppPatches(await fetch(event.request)); }
      catch { const cachedResponse = await caches.match("./index.html"); return cachedResponse ? addAppPatches(cachedResponse) : Response.error(); }
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response;
  }).catch(()=>caches.match("./index.html"))));
});