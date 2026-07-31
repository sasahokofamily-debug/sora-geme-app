const CACHE_NAME = "shooking-ii-v90";
const SW_BUILD = "90";

const GAME_SCRIPTS = [
  ["ui-patch.js",6],
  ["app-notice.js",8],
  ["release-current.js",9],
  ["firebase-config.js",2],
  ["auth-session-fix.js",1],
  ["google-login.js",11],
  ["google-login-fix.js",3],
  ["password-reset-fix.js",4],
  ["password-change.js",2],
  ["login-cool.js",3],
  ["login-success-warp.js",6],
  ["login-failure-effect.js",3],
  ["guest-login.js",2],
  ["online-pve.js",5],
  ["anti-cheat.js",1],
  ["admin-mode.js",1],
  ["online-team-fix.js",2],
  ["multiplayer-sync.js",2],
  ["shared-enemy-sync.js",1],
  ["hard-stages.js",16],
  ["hangar-fix.js",17],
  ["gacha-upgrade.js",7],
  ["seasonal-gacha-fix.js",3],
  ["gacha-11.js",2],
  ["gmail-seat-invite.js",2],
  ["tutorial-guide.js",4],
  ["tutorial-controls-fix.js",3],
  ["tutorial-polish-fix.js",2],
  ["button-actions.js",3],
  ["startup-loading.js",4]
];

self.addEventListener("install", () => {
  // Do not wait for dozens of files to cache before activating the fix.
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();

    // Reload each open game page once so it is rendered by this new worker.
    const windows=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    for(const client of windows){
      try{
        const url=new URL(client.url);
        if(url.origin!==self.location.origin)continue;
        if(url.searchParams.get("_swv")===SW_BUILD)continue;
        url.searchParams.set("_swv",SW_BUILD);
        await client.navigate(url.href);
      }catch{}
    }
  })());
});

function removeScript(html,filename){
  const escaped=filename.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  return html.replace(new RegExp(`<script[^>]+src=["'][^"']*${escaped}[^"']*["'][^>]*><\\/script>`,"gi"),"");
}

function ensureScript(html,filename,version){
  html=removeScript(html,filename);
  return html.replace("</body>",`<script src="./${filename}?v=${version}"></script>\n</body>`);
}

function prependScript(html,filename,version){
  html=removeScript(html,filename);
  return html.replace("<body",`<script src="./${filename}?v=${version}"></script>\n<body`);
}

function appendStyle(html,filename,version){
  const escaped=filename.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  html=html.replace(new RegExp(`<link[^>]+href=["'][^"']*${escaped}[^"']*["'][^>]*>`,"gi"),"");
  return html.replace("</head>",`<link rel="stylesheet" href="./${filename}?v=${version}">\n</head>`);
}

function addMobileMeta(html){
  if(html.includes('name="mobile-web-app-capable"')||html.includes("name='mobile-web-app-capable'"))return html;
  return html.replace("</head>",'<meta name="mobile-web-app-capable" content="yes">\n</head>');
}

function addStartupLoader(html){
  if(html.includes('id="shookingStartupLoader"'))return html;
  const style=`<style id="shookingStartupLoaderStyle">
html.shooking-loading,html.shooking-loading body{overflow:hidden!important}
#shookingStartupLoader{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;box-sizing:border-box;background:linear-gradient(145deg,#005a9e,#0078d4 55%,#0067b8);color:#fff;font-family:"Segoe UI",system-ui,sans-serif;text-align:center;opacity:1;visibility:visible;pointer-events:auto;transition:opacity .09s linear,visibility .09s linear}
#shookingStartupLoader.is-ready{opacity:0;visibility:hidden;pointer-events:none}
.shookingStartupLoadingCenter{display:flex;flex-direction:column;align-items:center;transform:translateY(-2vh)}
.shookingStartupSpinner{position:relative;width:66px;height:66px;margin-bottom:24px;animation:shookingStartupSpin 1.05s linear infinite}
.shookingStartupSpinner i{position:absolute;left:29px;top:2px;width:8px;height:8px;border-radius:50%;background:#fff;transform-origin:4px 31px}
.shookingStartupSpinner i:nth-child(1){transform:rotate(0deg);opacity:1}.shookingStartupSpinner i:nth-child(2){transform:rotate(36deg);opacity:.9}.shookingStartupSpinner i:nth-child(3){transform:rotate(72deg);opacity:.8}.shookingStartupSpinner i:nth-child(4){transform:rotate(108deg);opacity:.7}.shookingStartupSpinner i:nth-child(5){transform:rotate(144deg);opacity:.6}.shookingStartupSpinner i:nth-child(6){transform:rotate(180deg);opacity:.5}.shookingStartupSpinner i:nth-child(7){transform:rotate(216deg);opacity:.4}.shookingStartupSpinner i:nth-child(8){transform:rotate(252deg);opacity:.3}.shookingStartupSpinner i:nth-child(9){transform:rotate(288deg);opacity:.2}.shookingStartupSpinner i:nth-child(10){transform:rotate(324deg);opacity:.12}
#shookingStartupLoadingText{font-size:clamp(19px,5vw,27px);font-weight:400}
#shookingStartupLoadingDetail{margin-top:10px;color:rgba(255,255,255,.76);font-size:12px}
@keyframes shookingStartupSpin{to{transform:rotate(360deg)}}
</style>`;
  html=html.replace("</head>",`${style}\n</head>`);
  const markup=`<div id="shookingStartupLoader" role="status" aria-live="polite"><div class="shookingStartupLoadingCenter"><div class="shookingStartupSpinner" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div id="shookingStartupLoadingText">読み込み中...</div><div id="shookingStartupLoadingDetail">画面を準備しています</div></div></div><script>(()=>{window.__shookingStartupLoadingStarted=performance.now();document.documentElement.classList.add('shooking-loading');let done=false;const finish=()=>{if(done)return;done=true;document.documentElement.classList.remove('shooking-loading');const el=document.getElementById('shookingStartupLoader');if(!el)return;el.classList.add('is-ready');setTimeout(()=>el.remove(),100)};window.__shookingInlineLoaderFinish=finish;setTimeout(finish,420);if('serviceWorker'in navigator)navigator.serviceWorker.getRegistration().then(reg=>reg&&reg.update()).catch(()=>{})})();</script>`;
  return html.replace(/<body([^>]*)>/i,match=>`${match}${markup}`);
}

async function patchHtml(response,routeLooksLikeGame){
  let html=await response.text();
  html=addMobileMeta(html);
  const contentIsGame=html.includes("realGachaOverlay")||html.includes("function startRealGacha")||html.includes('id="game"');
  const isGame=routeLooksLikeGame||contentIsGame;
  html=ensureScript(html,"common-nav.js",2);

  if(isGame){
    html=addStartupLoader(html);
    html=prependScript(html,"game-system.js",1);
    html=prependScript(html,"gemedeta.js",1);
    html=appendStyle(html,"css/seasonal-gacha.css",1);
    html=appendStyle(html,"css/gmail-seat-invite.css",1);
    for(const [filename,version] of GAME_SCRIPTS)html=ensureScript(html,filename,version);
  }

  const headers=new Headers(response.headers);
  headers.set("content-type","text/html; charset=utf-8");
  headers.set("cache-control","no-store, no-cache, must-revalidate");
  headers.delete("content-length");
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}

function cachePut(key,response,event){
  if(!response||!response.ok)return;
  const copy=response.clone();
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(key,copy)).catch(()=>{}));
}

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const requestUrl=new URL(event.request.url);
  if(!/^https?:$/.test(requestUrl.protocol))return;

  if(event.request.mode==="navigate"){
    event.respondWith((async()=>{
      const path=requestUrl.pathname.replace(/\/+$/,"")||"/";
      const scopePath=new URL(self.registration.scope).pathname.replace(/\/+$/,"")||"/";
      const isRoot=requestUrl.origin===self.location.origin&&path===scopePath;
      const routeLooksLikeGame=path.endsWith("/game")||path.endsWith("/index.html")||requestUrl.searchParams.get("play")==="1";
      const sourcePath=routeLooksLikeGame?"./index.html":isRoot?"./landing.html":event.request;
      const fallbackKey=routeLooksLikeGame?"./index.html":isRoot?"./landing.html":event.request;
      try{
        const request=sourcePath instanceof Request?sourcePath:new Request(sourcePath,{cache:"no-store"});
        const response=await fetch(request);
        cachePut(fallbackKey,response,event);
        return patchHtml(response,routeLooksLikeGame);
      }catch{
        const fallback=await caches.match(fallbackKey);
        return fallback?patchHtml(fallback,routeLooksLikeGame):Response.error();
      }
    })());
    return;
  }

  const freshAsset=/\/(?:gemedeta|game-system|google-login-fix|password-reset-fix|password-change|login-cool|login-success-warp|login-failure-effect|app-notice|release-current|auth-session-fix|button-actions|startup-loading|guest-login|gacha-upgrade|gacha-11|seasonal-gacha-fix|gmail-seat-invite|tutorial-guide|tutorial-controls-fix|tutorial-polish-fix)\.js$/.test(requestUrl.pathname)||/\/css\/(?:seasonal-gacha|gmail-seat-invite)\.css$/.test(requestUrl.pathname);

  if(freshAsset){
    event.respondWith((async()=>{
      try{
        const response=await fetch(new Request(event.request,{cache:"no-store"}));
        cachePut(event.request,response,event);
        return response;
      }catch{
        return (await caches.match(event.request))||Response.error();
      }
    })());
    return;
  }

  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    cachePut(event.request,response,event);
    return response;
  })));
});