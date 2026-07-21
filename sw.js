const CACHE_NAME = "shooking-ii-v34";
const APP_SHELL = [
  "./landing.html",
  "./index.html",
  "./details.html",
  "./download-builder.html",
  "./permission-maker.html",
  "./common-nav.js",
  "./ui-patch.js",
  "./google-login.js",
  "./firebase-error-patch.js",
  "./firebase-login-fallback.js",
  "./firebase-login-rescue.js",
  "./firebase-config.js",
  "./online-pve.js",
  "./anti-cheat.js",
  "./online-team-fix.js",
  "./multiplayer-sync.js",
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

async function patchHtml(response, isGame) {
  let html = await response.text();
  if (!html.includes("common-nav.js")) html = html.replace("</body>", '<script src="./common-nav.js?v=2"></script></body>');
  if (isGame) {
    if (!html.includes("ui-patch.js")) html = html.replace("</body>", '<script src="./ui-patch.js?v=6"></script></body>');
    if (!html.includes("firebase-config.js")) html = html.replace("</body>", '<script src="./firebase-config.js?v=1"></script></body>');
    if (!html.includes("google-login.js")) html = html.replace("</body>", '<script src="./google-login.js?v=9"></script></body>');
    if (!html.includes("firebase-error-patch.js")) html = html.replace("</body>", '<script src="./firebase-error-patch.js?v=9"></script></body>');
    if (!html.includes("firebase-login-fallback.js")) html = html.replace("</body>", '<script src="./firebase-login-fallback.js?v=9"></script></body>');
    if (!html.includes("firebase-login-rescue.js")) html = html.replace("</body>", '<script src="./firebase-login-rescue.js?v=9"></script></body>');
    if (!html.includes("online-pve.js")) html = html.replace("</body>", '<script src="./online-pve.js?v=3"></script></body>');
    if (!html.includes("anti-cheat.js")) html = html.replace("</body>", '<script src="./anti-cheat.js?v=1"></script></body>');
    if (!html.includes("online-team-fix.js")) html = html.replace("</body>", '<script src="./online-team-fix.js?v=1"></script></body>');
    if (!html.includes("multiplayer-sync.js")) html = html.replace("</body>", '<script src="./multiplayer-sync.js?v=1"></script></body>');
    if (!html.includes("hard-stages.js")) html = html.replace("</body>", '<script src="./hard-stages.js?v=16"></script></body>');
    if (!html.includes("hangar-fix.js")) html = html.replace("</body>", '<script src="./hangar-fix.js?v=17"></script></body>');
  }
  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.delete("content-length");
  headers.set("cache-control", "no-cache");
  return new Response(html, {status:response.status,statusText:response.statusText,headers});
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    const url = new URL(event.request.url);
    event.respondWith((async () => {
      const isRoot = url.origin === self.location.origin && url.pathname === "/";
      const isGame = url.pathname === "/game" || url.pathname.endsWith("/index.html");
      try {
        const request = isRoot ? new Request("./landing.html", {cache:"no-store"}) : event.request;
        return await patchHtml(await fetch(request), isGame);
      } catch {
        const fallback = await caches.match(isGame ? "./index.html" : isRoot ? "./landing.html" : url.pathname.replace(/^\//,"./"));
        return fallback ? patchHtml(fallback, isGame) : (await caches.match("./landing.html")) || Response.error();
      }
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response;
  })));
});