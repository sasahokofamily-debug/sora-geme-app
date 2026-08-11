const CACHE_NAME="shooking-ii-v124-support-center-refresh";
const SW_BUILD="124-support-center-refresh";
const FIX="fixjs/";
const PLUS="plusjs/";
const LEGACY_SCRIPTS=[
  "seasonal-gacha-fix.js",
  "cache-coherence.js",
  "login-style.js",
  "login-failure-effect.js",
  "login-success-warp.js"
];

self.addEventListener("install",event=>event.waitUntil(self.skipWaiting()));

self.addEventListener("activate",event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.map(k=>caches.delete(k)));
  await self.clients.claim();
  // Important: never navigate or reload open tabs here.
})()));

self.addEventListener("message",event=>{
  const data=event.data||{};
  if(data.type!=="SHOOKING_CLEAR_CACHE")return;
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.map(k=>caches.delete(k)));
  })());
});

function esc(v){return v.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function removeScript(html,file){
  const base=String(file).split("/").pop();
  return html.replace(new RegExp(`<script[^>]+src=["'][^"']*${esc(base)}[^"']*["'][^>]*><\\/script>`,"gi"),"");
}
function ensureScript(html,file,version){
  html=removeScript(html,file);
  return html.replace("</body>",`<script src="./${file}?v=${version}-${SW_BUILD}"></script>\n</body>`);
}
function stripLegacyScripts(html){LEGACY_SCRIPTS.forEach(file=>{html=removeScript(html,file)});return html}
function addMeta(html){
  html=html.replace(/<meta[^>]+name=["']shooking-build["'][^>]*>/gi,"");
  return html.replace("</head>",`<meta name="shooking-build" content="${SW_BUILD}">\n</head>`);
}

async function patchHtml(response,{game=false,landing=false}={}){
  let html=await response.text();
  html=stripLegacyScripts(html);
  html=addMeta(html);
  if(landing)html=ensureScript(html,"common-nav.js",9);
  if(game){
    // Normalize the old inline SW registration so it cannot switch back to an old script URL.
    html=html.replace(
      'navigator.serviceWorker.register("./sw.js?v=109-cache-refresh",{updateViaCache:"none"})',
      `navigator.serviceWorker.register("./sw.js?v=${SW_BUILD}",{updateViaCache:"none"})`
    );

    html=ensureScript(html,"button-actions.js",6);
    html=ensureScript(html,FIX+"key-event-guard.js",2);

    html=ensureScript(html,"firebase-config.js",2);
    html=ensureScript(html,"google-login.js",6);
    html=ensureScript(html,FIX+"google-login-fix.js",2);
    html=ensureScript(html,FIX+"firebase-error-patch.js",2);
    html=ensureScript(html,FIX+"firebase-login-fallback.js",2);
    html=ensureScript(html,FIX+"firebase-login-rescue.js",2);
    html=ensureScript(html,FIX+"auth-session-fix.js",2);
    html=ensureScript(html,"guest-login.js",2);
    html=ensureScript(html,"password-change.js",2);
    html=ensureScript(html,FIX+"password-reset-fix.js",2);

    // Current official login UI.
    html=ensureScript(html,"login-cool.js",6);
    html=ensureScript(html,PLUS+"login-command-extras.js",3);

    html=ensureScript(html,"hard-stages.js",17);
    html=ensureScript(html,FIX+"hangar-fix.js",18);
    html=ensureScript(html,"online-pve.js",3);
    html=ensureScript(html,"multiplayer-sync.js",3);
    html=ensureScript(html,FIX+"online-team-fix.js",3);
    html=ensureScript(html,"shared-enemy-sync.js",3);

    html=ensureScript(html,PLUS+"gacha-upgrade.js",6);
    html=ensureScript(html,FIX+"gacha-current-filter.js",2);
    html=ensureScript(html,PLUS+"gacha-11.js",3);

    html=ensureScript(html,PLUS+"current-ui-suite.js",1);
    html=ensureScript(html,PLUS+"current-ui-extra.js",1);
    html=ensureScript(html,FIX+"home-menu-restore.js",2);
    html=ensureScript(html,FIX+"runtime-light-fix.js",2);

    // Home > その他メニュー support center.
    html=ensureScript(html,PLUS+"error-voice-assist.js",1);
    html=ensureScript(html,PLUS+"bug-report-center.js",1);
  }
  const headers=new Headers(response.headers);
  headers.set("content-type","text/html; charset=utf-8");
  headers.set("cache-control","no-cache, max-age=0, must-revalidate");
  headers.set("x-shooking-sw-build",SW_BUILD);
  headers.delete("content-length");
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET"||event.request.mode!=="navigate")return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const path=url.pathname.replace(/\/+$/,"")||"/";
    const scopePath=new URL(self.registration.scope).pathname.replace(/\/+$/,"")||"/";
    const isRoot=path===scopePath;
    const wantsGame=path.endsWith("/game")||path.endsWith("/game-core.html")||url.searchParams.get("play")==="1";
    const source=wantsGame?"./game-core.html":isRoot?"./landing.html":event.request;
    try{
      const req=source instanceof Request?source:new Request(source,{cache:"reload"});
      const res=await fetch(req);
      return patchHtml(res,{game:wantsGame,landing:isRoot&&!wantsGame});
    }catch(e){
      return fetch(event.request);
    }
  })());
});
