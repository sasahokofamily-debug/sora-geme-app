const CACHE_NAME="shooking-ii-v112-cache-coherence";
const SW_BUILD="112-cache-coherence";
const LEGACY_SCRIPTS=[
  "seasonal-gacha-fix.js",
  "gacha-upgrade.js",
  "gacha-11.js",
  "login-cool.js",
  "login-failure-effect.js",
  "login-success-warp.js"
];

self.addEventListener("install",event=>event.waitUntil(self.skipWaiting()));

self.addEventListener("activate",event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.map(k=>caches.delete(k)));
  await self.clients.claim();

  const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
  await Promise.all(clients.map(async client=>{
    try{
      const url=new URL(client.url);
      if(url.origin!==self.location.origin)return;
      const scope=new URL(self.registration.scope);
      if(!url.pathname.startsWith(scope.pathname))return;
      if(url.searchParams.get("__shoo_build")===SW_BUILD)return;
      url.searchParams.set("__shoo_build",SW_BUILD);
      await client.navigate(url.href);
    }catch(e){}
  }));
})()));

self.addEventListener("message",event=>{
  const data=event.data||{};
  if(data.type!=="SHOOKING_CLEAR_CACHE")return;
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.map(k=>caches.delete(k)));
    const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    clients.forEach(client=>client.postMessage({type:"SHOOKING_CACHE_CLEARED",build:SW_BUILD}));
  })());
});

function esc(v){return v.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function removeScript(html,file){return html.replace(new RegExp(`<script[^>]+src=["'][^"']*${esc(file)}[^"']*["'][^>]*><\\/script>`,"gi"),"")}
function ensureScript(html,file,version){html=removeScript(html,file);return html.replace("</body>",`<script src="./${file}?v=${version}-${SW_BUILD}"></script>\n</body>`)}
function addMeta(html){
  if(!html.includes('name="mobile-web-app-capable"')&&!html.includes("name='mobile-web-app-capable'")){
    html=html.replace("</head>",'<meta name="mobile-web-app-capable" content="yes">\n</head>');
  }
  html=html.replace(/<meta[^>]+name=["']shooking-build["'][^>]*>/gi,"");
  return html.replace("</head>",`<meta name="shooking-build" content="${SW_BUILD}">\n</head>`);
}
function stripLegacyScripts(html){
  LEGACY_SCRIPTS.forEach(file=>{html=removeScript(html,file)});
  return html;
}

function addLoader(html){
  if(html.includes('id="shookingStartupLoader"'))return html;
  const style=`<style id="shookingStartupLoaderStyle">html.shooking-loading,html.shooking-loading body{overflow:hidden!important}#shookingStartupLoader{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#0078d4;color:#fff;font-family:"Segoe UI",system-ui,sans-serif;text-align:center;pointer-events:none;transition:opacity .08s linear,visibility .08s linear}#shookingStartupLoader.is-ready{opacity:0;visibility:hidden;pointer-events:none}.shookingStartupSpinner{width:54px;height:54px;border:5px solid #ffffff45;border-top-color:#fff;border-radius:50%;margin:0 auto 18px;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}</style>`;
  html=html.replace("</head>",style+"\n</head>");
  const markup=`<div id="shookingStartupLoader"><div><div class="shookingStartupSpinner"></div><div>読み込み中...</div><div style="font-size:13px;opacity:.88;margin-top:8px">最新版を準備しています</div></div></div><script>(()=>{let done=false;document.documentElement.classList.add('shooking-loading');function openHome(){document.getElementById('shookingStartupPortal')?.remove();document.documentElement.style.overflow='';document.body?.classList.remove('game-playing');document.body?.classList.add('game-menu');const home=document.getElementById('home');const login=document.getElementById('loginScreen')||document.getElementById('login');const target=home||login;if(target){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));target.classList.remove('hidden');return true}return false}function finish(){if(done)return;done=true;try{openHome()}catch(e){}document.documentElement.classList.remove('shooking-loading');const el=document.getElementById('shookingStartupLoader');if(el){el.classList.add('is-ready');setTimeout(()=>el.remove(),70)}}window.__shookingInlineLoaderFinish=finish;window.__shookingForceHomeReady=finish;window.__shookingForceLoginReady=finish;setTimeout(finish,320);setTimeout(finish,820);window.addEventListener('load',()=>setTimeout(finish,40),{once:true})})();<\/script>`;
  return html.replace(/<body([^>]*)>/i,m=>m+markup)
}

async function patchHtml(response,{game=false,landing=false}={}){
  let html=await response.text();
  html=stripLegacyScripts(html);
  html=addMeta(html);
  html=ensureScript(html,"cache-coherence.js",1);
  if(landing){
    html=ensureScript(html,"common-nav.js",7);
  }
  if(game){
    html=addLoader(html);
    html=ensureScript(html,"login-style.js",2);
    html=ensureScript(html,"startup-loading.js",9);
    html=ensureScript(html,"button-actions.js",4);
    html=ensureScript(html,"gacha-runtime-bridge.js",2);
    html=ensureScript(html,"gacha-cinematic.js",2);
  }
  const headers=new Headers(response.headers);
  headers.set("content-type","text/html; charset=utf-8");
  headers.set("cache-control","no-store, no-cache, must-revalidate, max-age=0");
  headers.set("pragma","no-cache");
  headers.set("expires","0");
  headers.set("x-shooking-sw-build",SW_BUILD);
  headers.delete("content-length");
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}

async function freshFetch(input){
  const req=input instanceof Request?input:new Request(input);
  return fetch(new Request(req,{cache:"no-store"}));
}

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(!/^https?:$/.test(url.protocol))return;

  if(event.request.mode==="navigate"){
    event.respondWith((async()=>{
      const path=url.pathname.replace(/\/+$/,"")||"/";
      const scopePath=new URL(self.registration.scope).pathname.replace(/\/+$/,"")||"/";
      const isRoot=url.origin===self.location.origin&&path===scopePath;
      const wantsGame=path.endsWith("/game")||path.endsWith("/index.html")||url.searchParams.get("play")==="1";
      let source;
      if(wantsGame)source=`./index.html?__source_build=${encodeURIComponent(SW_BUILD)}`;
      else if(isRoot)source=`./landing.html?__source_build=${encodeURIComponent(SW_BUILD)}`;
      else source=event.request;
      try{
        const res=await freshFetch(source);
        return patchHtml(res,{game:wantsGame,landing:isRoot&&!wantsGame});
      }catch(e){
        try{return await freshFetch(event.request)}catch(_){return new Response("最新版の読み込みに失敗しました。ネットワーク接続を確認して再読み込みしてください。",{status:503,headers:{"content-type":"text/plain; charset=utf-8","cache-control":"no-store"}})}
      }
    })());
    return;
  }

  if(url.origin===self.location.origin&&/\.(?:js|html|json|webmanifest)$/i.test(url.pathname)){
    event.respondWith(freshFetch(event.request));
  }
});
