const CACHE_NAME = "shooking-pages-v92";
const BUILD = "92";
const RAW_BASE = "https://raw.githubusercontent.com/sasahokofamily-debug/sora-geme-app/main/";
const SCOPE_URL = new URL(self.registration.scope);
const SCOPE_PATH = SCOPE_URL.pathname.replace(/\/+$/, "") + "/";

self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();

    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      try {
        const url = new URL(client.url);
        if (url.origin !== self.location.origin) continue;
        if (url.searchParams.get("_pages") === BUILD) continue;
        const game = new URL("./game", self.registration.scope);
        game.searchParams.set("play", "1");
        game.searchParams.set("v", BUILD);
        game.searchParams.set("_pages", BUILD);
        await client.navigate(game.href);
      } catch {}
    }
  })());
});

function relativePath(url) {
  const path = url.pathname.startsWith(SCOPE_PATH)
    ? url.pathname.slice(SCOPE_PATH.length)
    : url.pathname.replace(/^\/+/, "");
  return decodeURIComponent(path || "index.html");
}

function contentType(path) {
  const ext = (path.split(".").pop() || "").toLowerCase();
  return ({
    html: "text/html; charset=utf-8",
    js: "text/javascript; charset=utf-8",
    css: "text/css; charset=utf-8",
    json: "application/json; charset=utf-8",
    webmanifest: "application/manifest+json; charset=utf-8",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    mp3: "audio/mpeg",
    wav: "audio/wav"
  })[ext] || "application/octet-stream";
}

async function proxyRootFile(path) {
  const clean = String(path || "index.html").replace(/^\/+/, "").replace(/\.\.(?:\/|\\)/g, "");
  const target = `${RAW_BASE}${clean}?build=${BUILD}`;
  const response = await fetch(target, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${clean}`);
  const headers = new Headers(response.headers);
  headers.set("content-type", contentType(clean));
  headers.set("cache-control", "no-store, no-cache, must-revalidate");
  headers.delete("content-disposition");
  headers.delete("x-content-type-options");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function networkFirst(path, cacheKey) {
  try {
    const response = await proxyRootFile(path);
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(cacheKey, copy)).catch(() => {});
    return response;
  } catch (error) {
    const cached = await caches.match(cacheKey);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    const rel = relativePath(url);
    const gameRoute = rel === "game" || rel === "game/" || rel === "index.html" || url.searchParams.get("play") === "1";
    if (!gameRoute) return;
    event.respondWith(networkFirst("index.html", new Request(`${self.registration.scope}__game_v92.html`)));
    return;
  }

  const rel = relativePath(url);
  if (!rel || rel === "sw.js") return;
  event.respondWith(networkFirst(rel, event.request).catch(() => fetch(event.request)));
});
