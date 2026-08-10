const CACHE_NAME="shooking-ii-v114-light-runtime";
const SW_BUILD="114-light-runtime";
const LEGACY_SCRIPTS=[
  "seasonal-gacha-fix.js",
  "gacha-upgrade.js",
  "gacha-11.js",
  "login-cool.js",
  "login-failure-effect.js",
  "login-success-warp.js",
  "cache-coherence.js"
];

self.addEventListener("install",event=>event.waitUntil(self.skipWaiting()));

self.addEventListener("activate",event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.map(k=>caches.delete(k)));
  await self.clients.claim();
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
function removeScript(html,file){return html.replace(new RegExp(`<script[^>]+src=["'][^"']*${esc(file)}[^"']*["'][^>]*><\\/script>`,"gi"),"")}
function ensureScript(html,file,version){
  html=removeScript(html,file);
  return html.replace("</body>",`<script src="./${file}?v=${version}-${SW_BUILD}"></script>\n</body>`);
}
function stripLegacyScripts(html){
  LEGACY_SCRIPTS.forEach(file=>{html=removeScript(html,file)});
  return html;
}
function addMeta(html){
  html=html.replace(/<meta[^>]+name=["']shooking-build["'][^>]*>/gi,"");
  return html.replace("</head>",`<meta name="shooking-build" content="${SW_BUILD}">\n</head>`);
}

async function patchHtml(response,{game=false,landing=false}={}){
  let html=await response.text();
  html=stripLegacyScripts(html);
  html=addMeta(html);
  if(landing)html=ensureScript(html,"common-nav.js",8);
  if(game){
    html=ensureScript(html,"login-style.js",3);
    html=ensureScript(html,"loading-overlay-fix.js",2);
    html=ensureScript(html,"startup-loading.js",10);
    html=ensureScript(html,"button-actions.js",5);
    html=ensureScript(html,"gacha-runtime-bridge.js",3);
    html=ensureScript(html,"gacha-cinematic.js",4);
    html=ensureScript(html,"runtime-light-fix.js",1);
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
    const wantsGame=path.endsWith("/game")||path.endsWith("/index.html")||url.searchParams.get("play")==="1";
    const source=wantsGame?"./index.html":isRoot?"./landing.html":event.request;
    try{
      const req=source instanceof Request?source:new Request(source,{cache:"reload"});
      const res=await fetch(req);
      return patchHtml(res,{game:wantsGame,landing:isRoot&&!wantsGame});
    }catch(e){
      return fetch(event.request);
    }
  })());
});
