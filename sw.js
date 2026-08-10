const CACHE_NAME="shooking-ii-v109-cache-refresh";
const SW_BUILD="109-cache-refresh";

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
function addMeta(html){if(html.includes('name="mobile-web-app-capable"')||html.includes("name='mobile-web-app-capable'"))return html;return html.replace("</head>",'<meta name="mobile-web-app-capable" content="yes">\n</head>')}

function addLoader(html){
  if(html.includes('id="shookingStartupLoader"'))return html;
  const style=`<style id="shookingStartupLoaderStyle">html.shooking-loading,html.shooking-loading body{overflow:hidden!important}#shookingStartupLoader{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#0078d4;color:#fff;font-family:"Segoe UI",system-ui,sans-serif;text-align:center;pointer-events:none;transition:opacity .08s linear,visibility .08s linear}#shookingStartupLoader.is-ready{opacity:0;visibility:hidden;pointer-events:none}.shookingStartupSpinner{width:54px;height:54px;border:5px solid #ffffff45;border-top-color:#fff;border-radius:50%;margin:0 auto 18px;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}</style>`;
  html=html.replace("</head>",style+"\n</head>");
  const markup=`<div id="shookingStartupLoader"><div><div class="shookingStartupSpinner"></div><div>読み込み中...</div><div style="font-size:13px;opacity:.88;margin-top:8px">ホーム画面を準備しています</div></div></div><script>(()=>{let done=false;document.documentElement.classList.add('shooking-loading');function openHome(){document.getElementById('shookingStartupPortal')?.remove();document.documentElement.style.overflow='';document.body?.classList.remove('game-playing');document.body?.classList.add('game-menu');const home=document.getElementById('home');const login=document.getElementById('loginScreen')||document.getElementById('login');const target=home||login;if(target){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));target.classList.remove('hidden');return true}return false}function finish(){if(done)return;done=true;try{openHome()}catch(e){}document.documentElement.classList.remove('shooking-loading');const el=document.getElementById('shookingStartupLoader');if(el){el.classList.add('is-ready');setTimeout(()=>el.remove(),70)}}window.__shookingInlineLoaderFinish=finish;window.__shookingForceHomeReady=finish;window.__shookingForceLoginReady=finish;setTimeout(finish,320);setTimeout(finish,820);window.addEventListener('load',()=>setTimeout(finish,40),{once:true})})();<\/script>`;
  return html.replace(/<body([^>]*)>/i,m=>m+markup)
}

async function patchHtml(response,{game=false,landing=false}={}){
  let html=await response.text();
  html=addMeta(html);
  if(landing){
    html=ensureScript(html,"common-nav.js",6);
  }
  if(game){
    html=addLoader(html);
    html=ensureScript(html,"login-style.js",1);
    html=ensureScript(html,"startup-loading.js",8);
    html=ensureScript(html,"button-actions.js",3);
  }
  const headers=new Headers(response.headers);
  headers.set("content-type","text/html; charset=utf-8");
  headers.set("cache-control","no-store, no-cache, must-revalidate, max-age=0");
  headers.set("x-shooking-sw-build",SW_BUILD);
  headers.delete("content-length");
  return new Response(html,{status:response.status,statusText:response.statusText,headers})
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
      const source=wantsGame?"./index.html":isRoot?"./landing.html":event.request;
      try{
        const req=source instanceof Request?source:new Request(source,{cache:"reload"});
        const res=await fetch(req);
        return patchHtml(res,{game:wantsGame,landing:isRoot&&!wantsGame})
      }catch{
        return fetch(event.request)
      }
    })());
    return
  }

  const fresh=/\/(?:sw|common-nav|startup-loading|login-style|button-actions)\.js$/.test(url.pathname);
  if(fresh){
    event.respondWith(fetch(new Request(event.request,{cache:"reload"})).catch(()=>fetch(event.request)));
  }
});
