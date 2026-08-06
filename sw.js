const CACHE_NAME="shooking-ii-v103-cache-reset";
const SW_BUILD="103-cache-reset";
const GAME_SCRIPTS=[
["app-notice.js",9],["release-current.js",21],["firebase-config.js",3],
["auth-session-fix.js",3],["google-login.js",12],["google-login-fix.js",4],
["password-reset-fix.js",5],["password-change.js",3],["login-cool.js",4],
["login-success-warp.js",7],["login-failure-effect.js",4],["guest-login.js",3],
["online-pve.js",6],["anti-cheat.js",2],["admin-mode.js",2],["online-team-fix.js",3],
["multiplayer-sync.js",3],["shared-enemy-sync.js",2],["hard-stages.js",17],["hangar-fix.js",18],
["gacha-upgrade.js",8],["seasonal-gacha-fix.js",4],["gacha-11.js",3],["gmail-seat-invite.js",3],
["tutorial-guide.js",5],["tutorial-controls-fix.js",4],["tutorial-polish-fix.js",3],
["button-actions.js",4],["startup-loading.js",6]
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
    await self.registration.unregister();
  })());
});

function esc(v){return v.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function removeScript(html,file){return html.replace(new RegExp(`<script[^>]+src=["'][^"']*${esc(file)}[^"']*["'][^>]*><\\/script>`,"gi"),"")}
function ensureScript(html,file,version){html=removeScript(html,file);return html.replace("</body>",`<script src="./${file}?v=${version}-${SW_BUILD}"></script>\n</body>`)}
function prependScript(html,file,version){html=removeScript(html,file);return html.replace("<body",`<script src="./${file}?v=${version}-${SW_BUILD}"></script>\n<body`)}
function appendStyle(html,file,version){html=html.replace(new RegExp(`<link[^>]+href=["'][^"']*${esc(file)}[^"']*["'][^>]*>`,"gi"),"");return html.replace("</head>",`<link rel="stylesheet" href="./${file}?v=${version}-${SW_BUILD}">\n</head>`)}
function addMeta(html){if(html.includes('name="mobile-web-app-capable"')||html.includes("name='mobile-web-app-capable'"))return html;return html.replace("</head>",'<meta name="mobile-web-app-capable" content="yes">\n</head>')}

function addLoader(html){
  if(html.includes('id="shookingStartupLoader"'))return html;
  const style=`<style id="shookingStartupLoaderStyle">html.shooking-loading,html.shooking-loading body{overflow:hidden!important}#shookingStartupLoader{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#0078d4;color:#fff;font-family:"Segoe UI",system-ui,sans-serif;text-align:center;transition:opacity .08s linear,visibility .08s linear}#shookingStartupLoader.is-ready{opacity:0;visibility:hidden;pointer-events:none}.shookingStartupSpinner{width:54px;height:54px;border:5px solid #ffffff45;border-top-color:#fff;border-radius:50%;margin:0 auto 18px;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}</style>`;
  html=html.replace("</head>",style+"\n</head>");
  const markup=`<div id="shookingStartupLoader"><div><div class="shookingStartupSpinner"></div><div>読み込み中...</div><div style="font-size:13px;opacity:.88;margin-top:8px">ログイン画面を準備しています</div></div></div><script>(()=>{let done=false;document.documentElement.classList.add('shooking-loading');function openLoginOrHome(){document.getElementById('shookingStartupPortal')?.remove();document.documentElement.style.overflow='';document.body?.classList.remove('game-playing');document.body?.classList.add('game-menu');const login=document.getElementById('loginScreen')||document.getElementById('login');const home=document.getElementById('home');const target=login||home;if(target){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));target.classList.remove('hidden');return true}return false}function finish(){if(done)return;done=true;try{openLoginOrHome()}catch(e){}document.documentElement.classList.remove('shooking-loading');const el=document.getElementById('shookingStartupLoader');if(el){el.classList.add('is-ready');setTimeout(()=>el.remove(),80)}}window.__shookingInlineLoaderFinish=finish;window.__shookingForceLoginReady=finish;setTimeout(finish,360);setTimeout(finish,900);window.addEventListener('load',()=>setTimeout(finish,60),{once:true})})();<\/script>`;
  return html.replace(/<body([^>]*)>/i,m=>m+markup)
}

async function patchHtml(response,routeLooksLikeGame){
  let html=await response.text();
  html=addMeta(html);
  const isGame=routeLooksLikeGame||html.includes('id="game"')||html.includes("realGachaOverlay");
  html=ensureScript(html,"common-nav.js",4);
  if(isGame){
    html=addLoader(html);
    html=prependScript(html,"game-system.js",2);
    html=prependScript(html,"gemedeta.js",2);
    html=appendStyle(html,"css/seasonal-gacha.css",2);
    html=appendStyle(html,"css/gmail-seat-invite.css",2);
    for(const [f,v] of GAME_SCRIPTS)html=ensureScript(html,f,v)
  }
  const headers=new Headers(response.headers);
  headers.set("content-type","text/html; charset=utf-8");
  headers.set("cache-control","no-store, no-cache, must-revalidate, max-age=0");
  headers.set("x-shooking-sw-build",SW_BUILD);
  headers.delete("content-length");
  return new Response(html,{status:response.status,statusText:response.statusText,headers})
}

function cachePut(key,response){
  if(!response||!response.ok)return;
  const copy=response.clone();
  caches.open(CACHE_NAME).then(c=>c.put(key,copy)).catch(()=>{})
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
      const isGame=isRoot||path.endsWith("/game")||path.endsWith("/index.html")||url.searchParams.get("play")==="1";
      const source=isGame?"./index.html":event.request;
      const fallback=isGame?"./index.html":event.request;
      try{
        const req=source instanceof Request?source:new Request(source,{cache:"reload"});
        const res=await fetch(req);
        return patchHtml(res,isGame)
      }catch{
        const cached=await caches.match(fallback);
        return cached?patchHtml(cached,isGame):Response.error()
      }
    })());
    return
  }

  const fresh=/\/(?:sw|common-nav|webstore|gemedeta|game-system|google-login-fix|password-reset-fix|password-change|login-cool|login-success-warp|login-failure-effect|app-notice|release-current|auth-session-fix|button-actions|startup-loading|guest-login|gacha-upgrade|gacha-11|seasonal-gacha-fix|gmail-seat-invite|tutorial-guide|tutorial-controls-fix|tutorial-polish-fix)\.js$/.test(url.pathname)||/\/css\/(?:seasonal-gacha|gmail-seat-invite)\.css$/.test(url.pathname)||/\/webstore\.css$/.test(url.pathname);
  if(fresh){
    event.respondWith((async()=>{
      try{
        const res=await fetch(new Request(event.request,{cache:"reload"}));
        cachePut(event.request,res);
        return res
      }catch{
        return(await caches.match(event.request))||Response.error()
      }
    })());
    return
  }

  event.respondWith(caches.match(event.request).then(c=>c||fetch(event.request).then(r=>{cachePut(event.request,r);return r})))
});
