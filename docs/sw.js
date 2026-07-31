const CACHE_NAME = "shooking-pages-v93";
const BUILD = "93";
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

const PUBLIC_AUTH_GUARD = `<script id="shookingPublicAuthGuard">(()=>{const KEY='shooking2_current_account';const hasAccount=()=>{try{return !!JSON.parse(localStorage.getItem(KEY)||'null')}catch{return false}};if(hasAccount())return;const style=document.createElement('style');style.id='shookingPublicAuthGuardStyle';style.textContent='html.shooking-auth-pending .screen{visibility:hidden!important;pointer-events:none!important}';document.head.appendChild(style);document.documentElement.classList.add('shooking-auth-pending');const cleanup=()=>{document.documentElement.classList.remove('shooking-auth-pending');style.remove()};const forceLogin=()=>{if(hasAccount()){cleanup();return true}const login=document.getElementById('loginScreen');if(!login)return false;document.querySelectorAll('.screen').forEach(screen=>screen.classList.add('hidden'));login.classList.remove('hidden');login.style.removeProperty('display');login.style.removeProperty('visibility');login.removeAttribute('aria-hidden');document.getElementById('home')?.classList.add('hidden');document.body.classList.remove('game-playing');document.body.classList.add('game-menu');cleanup();return true};const settle=()=>{forceLogin();[0,40,120,300,700].forEach(delay=>setTimeout(()=>{if(!hasAccount())forceLogin()},delay))};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',settle,{once:true});else settle();window.addEventListener('pageshow',()=>{if(!hasAccount())forceLogin()})})();<\/script>`;

function injectPublicAuthGuard(response) {
  if (!response.body) return response;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let injected = false;

  const stream = new ReadableStream({
    async pull(controller) {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            buffer += decoder.decode();
            if (!injected) {
              const match = /<body[^>]*>/i.exec(buffer);
              if (match) {
                const end = match.index + match[0].length;
                buffer = buffer.slice(0, end) + PUBLIC_AUTH_GUARD + buffer.slice(end);
                injected = true;
              }
            }
            if (buffer) controller.enqueue(encoder.encode(buffer));
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          if (!injected) {
            const match = /<body[^>]*>/i.exec(buffer);
            if (!match) continue;
            const end = match.index + match[0].length;
            controller.enqueue(encoder.encode(buffer.slice(0, end) + PUBLIC_AUTH_GUARD + buffer.slice(end)));
            buffer = "";
            injected = true;
            return;
          }

          controller.enqueue(encoder.encode(buffer));
          buffer = "";
          return;
        }
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    }
  });

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("content-type", "text/html; charset=utf-8");
  headers.set("cache-control", "no-store, no-cache, must-revalidate");
  return new Response(stream, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    const rel = relativePath(url);
    const gameRoute = rel === "game" || rel === "game/" || rel === "index.html" || url.searchParams.get("play") === "1";
    if (!gameRoute) return;
    event.respondWith((async () => {
      const response = await networkFirst("index.html", new Request(`${self.registration.scope}__game_v93.html`));
      return injectPublicAuthGuard(response);
    })());
    return;
  }

  const rel = relativePath(url);
  if (!rel || rel === "sw.js") return;
  event.respondWith(networkFirst(rel, event.request).catch(() => fetch(event.request)));
});