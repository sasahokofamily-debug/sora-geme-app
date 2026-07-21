const CACHE_NAME = "shooking-ii-v45";
const APP_SHELL = [
  "./landing.html",
  "./index.html",
  "./details.html",
  "./download-builder.html",
  "./permission-maker.html",
  "./common-nav.js",
  "./ui-patch.js",
  "./firebase-config.js",
  "./google-login.js",
  "./online-pve.js",
  "./anti-cheat.js",
  "./admin-mode.js",
  "./online-team-fix.js",
  "./multiplayer-sync.js",
  "./shared-enemy-sync.js",
  "./hard-stages.js",
  "./hangar-fix.js",
  "./gacha-upgrade.js",
  "./seasonal-gacha-fix.js",
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

function appendScript(html, filename, version) {
  if (html.includes(filename)) return html;
  return html.replace("</body>", `<script src="./${filename}?v=${version}"></script></body>`);
}

async function patchHtml(response, routeLooksLikeGame) {
  let html = await response.text();
  const contentIsGame = html.includes("realGachaOverlay") || html.includes("function startRealGacha") || html.includes('id="game"');
  const isGame = routeLooksLikeGame || contentIsGame;

  html = appendScript(html, "common-nav.js", 2);

  if (isGame) {
    html = appendScript(html, "ui-patch.js", 6);
    html = appendScript(html, "firebase-config.js", 2);
    html = appendScript(html, "google-login.js", 10);
    html = appendScript(html, "online-pve.js", 5);
    html = appendScript(html, "anti-cheat.js", 1);
    html = appendScript(html, "admin-mode.js", 1);
    html = appendScript(html, "online-team-fix.js", 2);
    html = appendScript(html, "multiplayer-sync.js", 2);
    html = appendScript(html, "shared-enemy-sync.js", 1);
    html = appendScript(html, "hard-stages.js", 16);
    html = appendScript(html, "hangar-fix.js", 17);

    html = html.replace(/<script[^>]+src=["'][^"']*gacha-upgrade\.js[^"']*["'][^>]*><\/script>/gi, "");
    html = html.replace(/<script[^>]+src=["'][^"']*seasonal-gacha-fix\.js[^"']*["'][^>]*><\/script>/gi, "");
    html = html.replace("</body>", '<script src="./gacha-upgrade.js?v=7"></script><script src="./seasonal-gacha-fix.js?v=1"></script></body>');
  }

  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.delete("content-length");
  headers.set("cache-control", "no-store, no-cache, must-revalidate");
  return new Response(html, {status:response.status,statusText:response.statusText,headers});
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.protocol !== "http:" && requestUrl.protocol !== "https:") return;

  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      const path = requestUrl.pathname.replace(/\/+$/, "") || "/";
      const isRoot = requestUrl.origin === self.location.origin && path === "/";
      const routeLooksLikeGame = path === "/game" || path.endsWith("/index.html") || requestUrl.searchParams.get("play") === "1";
      try {
        const request = isRoot ? new Request("./landing.html", {cache:"no-store"}) : new Request(event.request, {cache:"no-store"});
        return await patchHtml(await fetch(request), routeLooksLikeGame);
      } catch {
        const fallbackPath = requestUrl.pathname.startsWith("/") ? `.${requestUrl.pathname}` : `./${requestUrl.pathname}`;
        const fallback = await caches.match(routeLooksLikeGame ? "./index.html" : isRoot ? "./landing.html" : fallbackPath);
        return fallback ? patchHtml(fallback, routeLooksLikeGame) : (await caches.match("./landing.html")) || Response.error();
      }
    })());
    return;
  }

  if (requestUrl.pathname.endsWith("/gacha-upgrade.js") || requestUrl.pathname.endsWith("/seasonal-gacha-fix.js")) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(new Request(event.request, {cache:"no-store"}));
        if (fresh && fresh.ok) {
          const copy = fresh.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(()=>{}));
        }
        return fresh;
      } catch {
        return (await caches.match(event.request)) || Response.error();
      }
    })());
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (!response || !response.ok) return response;
      const copy = response.clone();
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, copy))
          .catch(error => console.warn("Cache.put skipped", error))
      );
      return response;
    }))
  );
});