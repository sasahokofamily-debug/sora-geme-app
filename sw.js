const CACHE_NAME = "shooking-ii-v87";
const APP_SHELL = [
  "./landing.html",
  "./index.html",
  "./details.html",
  "./download-builder.html",
  "./permission-maker.html",
  "./gemedeta.js",
  "./game-system.js",
  "./common-nav.js",
  "./ui-patch.js",
  "./app-notice.js?v=8",
  "./release-current.js?v=6",
  "./firebase-config.js",
  "./google-login.js",
  "./google-login-fix.js",
  "./password-reset-fix.js?v=4",
  "./password-change.js?v=2",
  "./login-cool.js?v=3",
  "./login-success-warp.js?v=6",
  "./login-failure-effect.js?v=3",
  "./guest-login.js",
  "./online-pve.js",
  "./anti-cheat.js",
  "./admin-mode.js",
  "./online-team-fix.js",
  "./multiplayer-sync.js",
  "./shared-enemy-sync.js",
  "./hard-stages.js",
  "./hangar-fix.js",
  "./gacha-upgrade.js",
  "./gacha-11.js?v=2",
  "./seasonal-gacha-fix.js",
  "./gmail-seat-invite.js",
  "./tutorial-guide.js",
  "./tutorial-controls-fix.js?v=3",
  "./tutorial-polish-fix.js?v=2",
  "./button-actions.js?v=3",
  "./startup-loading.js?v=1",
  "./css/seasonal-gacha.css",
  "./css/gmail-seat-invite.css",
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
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

function appendScript(html, filename, version) {
  if (html.includes(filename)) return html;
  return html.replace("</body>", `<script src="./${filename}?v=${version}"></script></body>`);
}

function prependGameScript(html, filename, version) {
  html = html.replace(new RegExp(`<script[^>]+src=["'][^"']*${filename.replace('.', '\\.') }[^"']*["'][^>]*><\\/script>`, "gi"), "");
  return html.replace("<body", `<script src="./${filename}?v=${version}"></script>\n<body`);
}

function appendStyle(html, filename, version) {
  if (html.includes(filename)) return html;
  return html.replace("</head>", `<link rel="stylesheet" href="./${filename}?v=${version}">\n</head>`);
}

function addModernMobileMeta(html) {
  if (html.includes('name="mobile-web-app-capable"') || html.includes("name='mobile-web-app-capable'")) return html;
  return html.replace("</head>", '<meta name="mobile-web-app-capable" content="yes">\n</head>');
}

function addStartupLoader(html) {
  if (html.includes('id="shookingStartupLoader"')) return html;
  const style = `<style id="shookingStartupLoaderStyle">
html.shooking-loading,html.shooking-loading body{overflow:hidden!important}
#shookingStartupLoader{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;box-sizing:border-box;padding:24px;background:linear-gradient(145deg,#005a9e 0%,#0078d4 54%,#0067b8 100%);color:#fff;font-family:"Segoe UI",system-ui,sans-serif;text-align:center;opacity:1;visibility:visible;pointer-events:auto;transition:opacity .42s ease,visibility .42s ease}
#shookingStartupLoader.is-ready{opacity:0;visibility:hidden;pointer-events:none}
.shookingStartupLoadingCenter{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:220px;transform:translateY(-2vh)}
.shookingStartupSpinner{position:relative;width:76px;height:76px;margin-bottom:30px;animation:shookingStartupSpin 1.22s linear infinite}
.shookingStartupSpinner i{position:absolute;left:34px;top:3px;width:8px;height:8px;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.42);transform-origin:4px 35px}
.shookingStartupSpinner i:nth-child(1){transform:rotate(0deg);opacity:1}.shookingStartupSpinner i:nth-child(2){transform:rotate(36deg);opacity:.92}.shookingStartupSpinner i:nth-child(3){transform:rotate(72deg);opacity:.84}.shookingStartupSpinner i:nth-child(4){transform:rotate(108deg);opacity:.76}.shookingStartupSpinner i:nth-child(5){transform:rotate(144deg);opacity:.66}.shookingStartupSpinner i:nth-child(6){transform:rotate(180deg);opacity:.56}.shookingStartupSpinner i:nth-child(7){transform:rotate(216deg);opacity:.46}.shookingStartupSpinner i:nth-child(8){transform:rotate(252deg);opacity:.36}.shookingStartupSpinner i:nth-child(9){transform:rotate(288deg);opacity:.26}.shookingStartupSpinner i:nth-child(10){transform:rotate(324deg);opacity:.16}
#shookingStartupLoadingText{font-size:clamp(20px,5vw,28px);font-weight:400;letter-spacing:.02em;line-height:1.35}
#shookingStartupLoadingDetail{margin-top:13px;color:rgba(255,255,255,.78);font-size:clamp(11px,3vw,14px);line-height:1.5}
@keyframes shookingStartupSpin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.shookingStartupSpinner{animation-duration:2.4s}}
</style>`;
  html = html.replace("</head>", `${style}\n</head>`);
  const markup = `<div id="shookingStartupLoader" role="status" aria-live="polite"><div class="shookingStartupLoadingCenter"><div class="shookingStartupSpinner" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div id="shookingStartupLoadingText">読み込み中...</div><div id="shookingStartupLoadingDetail">SHOO KING IIを準備しています</div></div></div><script>window.__shookingStartupLoadingStarted=performance.now();document.documentElement.classList.add('shooking-loading');</script>`;
  return html.replace(/<body([^>]*)>/i, match => `${match}${markup}`);
}

async function patchHtml(response, routeLooksLikeGame) {
  let html = await response.text();
  html = addModernMobileMeta(html);
  const contentIsGame = html.includes("realGachaOverlay") || html.includes("function startRealGacha") || html.includes('id="game"');
  const isGame = routeLooksLikeGame || contentIsGame;
  html = appendScript(html, "common-nav.js", 2);

  if (isGame) {
    html = addStartupLoader(html);
    html = prependGameScript(html, "game-system.js", 1);
    html = prependGameScript(html, "gemedeta.js", 1);
    html = appendStyle(html, "css/seasonal-gacha.css", 1);
    html = appendStyle(html, "css/gmail-seat-invite.css", 1);
    html = appendScript(html, "ui-patch.js", 6);
    html = appendScript(html, "app-notice.js", 8);
    html = appendScript(html, "release-current.js", 6);
    html = appendScript(html, "firebase-config.js", 2);
    html = appendScript(html, "google-login.js", 11);
    html = appendScript(html, "google-login-fix.js", 3);
    html = appendScript(html, "password-reset-fix.js", 4);
    html = appendScript(html, "password-change.js", 2);
    html = appendScript(html, "login-cool.js", 3);
    html = appendScript(html, "login-success-warp.js", 6);
    html = appendScript(html, "login-failure-effect.js", 3);
    html = appendScript(html, "guest-login.js", 2);
    html = appendScript(html, "online-pve.js", 5);
    html = appendScript(html, "anti-cheat.js", 1);
    html = appendScript(html, "admin-mode.js", 1);
    html = appendScript(html, "online-team-fix.js", 2);
    html = appendScript(html, "multiplayer-sync.js", 2);
    html = appendScript(html, "shared-enemy-sync.js", 1);
    html = appendScript(html, "hard-stages.js", 16);
    html = appendScript(html, "hangar-fix.js", 17);
    html = html.replace(/<script[^>]+src=["'][^"']*gacha-upgrade\.js[^"']*["'][^>]*><\/script>/gi, "");
    html = html.replace(/<script[^>]+src=["'][^"']*gacha-11\.js[^"']*["'][^>]*><\/script>/gi, "");
    html = html.replace(/<script[^>]+src=["'][^"']*seasonal-gacha-fix\.js[^"']*["'][^>]*><\/script>/gi, "");
    html = html.replace(/<script[^>]+src=["'][^"']*gmail-seat-invite\.js[^"']*["'][^>]*><\/script>/gi, "");
    html = html.replace(/<script[^>]+src=["'][^"']*tutorial-guide\.js[^"']*["'][^>]*><\/script>/gi, "");
    html = html.replace(/<script[^>]+src=["'][^"']*tutorial-controls-fix\.js[^"']*["'][^>]*><\/script>/gi, "");
    html = html.replace(/<script[^>]+src=["'][^"']*tutorial-polish-fix\.js[^"']*["'][^>]*><\/script>/gi, "");
    html = html.replace(/<script[^>]+src=["'][^"']*button-actions\.js[^"']*["'][^>]*><\/script>/gi, "");
    html = html.replace(/<script[^>]+src=["'][^"']*startup-loading\.js[^"']*["'][^>]*><\/script>/gi, "");
    html = html.replace("</body>", '<script src="./gacha-upgrade.js?v=7"></script>\n<script src="./seasonal-gacha-fix.js?v=3"></script>\n<script src="./gacha-11.js?v=2"></script>\n<script src="./gmail-seat-invite.js?v=2"></script>\n<script src="./tutorial-guide.js?v=4"></script>\n<script src="./tutorial-controls-fix.js?v=3"></script>\n<script src="./tutorial-polish-fix.js?v=2"></script>\n<script src="./button-actions.js?v=3"></script>\n<script src="./startup-loading.js?v=1"></script>\n</body>');
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

  if (
    requestUrl.pathname.endsWith("/gemedeta.js") ||
    requestUrl.pathname.endsWith("/game-system.js") ||
    requestUrl.pathname.endsWith("/google-login-fix.js") ||
    requestUrl.pathname.endsWith("/password-reset-fix.js") ||
    requestUrl.pathname.endsWith("/password-change.js") ||
    requestUrl.pathname.endsWith("/login-cool.js") ||
    requestUrl.pathname.endsWith("/login-success-warp.js") ||
    requestUrl.pathname.endsWith("/login-failure-effect.js") ||
    requestUrl.pathname.endsWith("/app-notice.js") ||
    requestUrl.pathname.endsWith("/release-current.js") ||
    requestUrl.pathname.endsWith("/button-actions.js") ||
    requestUrl.pathname.endsWith("/startup-loading.js") ||
    requestUrl.pathname.endsWith("/guest-login.js") ||
    requestUrl.pathname.endsWith("/gacha-upgrade.js") ||
    requestUrl.pathname.endsWith("/gacha-11.js") ||
    requestUrl.pathname.endsWith("/seasonal-gacha-fix.js") ||
    requestUrl.pathname.endsWith("/gmail-seat-invite.js") ||
    requestUrl.pathname.endsWith("/tutorial-guide.js") ||
    requestUrl.pathname.endsWith("/tutorial-controls-fix.js") ||
    requestUrl.pathname.endsWith("/tutorial-polish-fix.js") ||
    requestUrl.pathname.endsWith("/css/seasonal-gacha.css") ||
    requestUrl.pathname.endsWith("/css/gmail-seat-invite.css")
  ) {
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

  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (!response || !response.ok) return response;
    const copy = response.clone();
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(error => console.warn("Cache.put skipped", error)));
    return response;
  })));
});