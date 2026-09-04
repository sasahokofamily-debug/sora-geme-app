const CACHE_NAME="shooking-ii-v127-resilient-boot";
const SW_BUILD="127-resilient-boot";
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
  await Promise.all(keys
    .filter(k=>k.startsWith("shooking-ii-")&&k!==CACHE_NAME)
    .map(k=>caches.delete(k)));
  await self.clients.claim();
})()));

self.addEventListener("message",event=>{
  const data=event.data||{};
  if(data.type==="SHOOKING_SKIP_WAITING"){
    event.waitUntil(self.skipWaiting());
    return;
  }
  if(data.type==="SHOOKING_GET_BUILD"){
    try{
      event.source?.postMessage({type:"SHOOKING_BUILD",build:SW_BUILD,cache:CACHE_NAME,requestId:data.requestId||""});
    }catch(e){}
    return;
  }
  if(data.type!=="SHOOKING_CLEAR_CACHE")return;
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith("shooking-ii-")).map(k=>caches.delete(k)));
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
function normalizeSwRegistration(html){
  return html.replace(/\.\/sw\.js\?[^"'`\s)]+/g,"./sw.js");
}

async function patchHtml(response,{game=false,landing=false}={}){
  let html=await response.text();
  html=stripLegacyScripts(html);
  html=addMeta(html);
  if(landing)html=ensureScript(html,"common-nav.js",10);
  if(game){
    html=normalizeSwRegistration(html);

    // Runs before window.load and neutralizes stale SW URLs / stuck overlays.
    html=ensureScript(html,FIX+"boot-resilience.js",1);
    html=ensureScript(html,"button-actions.js",7);
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

    html=ensureScript(html,"login-style.js",2);
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
    html=ensureScript(html,FIX+"runtime-light-fix.js",3);

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

async function fetchHtml(path){
  const url=new URL(path,self.registration.scope);
  return fetch(url.href,{cache:"no-store"});
}

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET"||event.request.mode!=="navigate")return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  const path=url.pathname.replace(/\/+$/,"")||"/";
  const scopePath=new URL(self.registration.scope).pathname.replace(/\/+$/,"")||"/";
  const isRoot=path===scopePath;
  const wantsGame=path.endsWith("/game")||path.endsWith("/game-core.html")||url.searchParams.get("play")==="1";

  // Do not proxy every navigation. Only the public landing and the actual game need patching.
  if(!isRoot&&!wantsGame)return;

  event.respondWith((async()=>{
    const source=wantsGame?"./game-core.html":"./landing.html";
    try{
      const res=await fetchHtml(source);
      if(!res.ok)throw new Error(`HTTP ${res.status} while loading ${source}`);
      return patchHtml(res,{game:wantsGame,landing:isRoot&&!wantsGame});
    }catch(error){
      console.warn("SHOO KING navigation patch failed; using direct network response.",error);
      try{return await fetch(event.request,{cache:"no-store"});}
      catch(e){
        return new Response("SHOO KING II の読み込みに失敗しました。通信を確認して再読み込みしてください。",{
          status:503,
          headers:{"content-type":"text/plain; charset=utf-8","cache-control":"no-store"}
        });
      }
    }
  })());
});
