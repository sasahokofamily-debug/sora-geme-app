const CACHE_NAME="shooking-ii-v128-direct-launch";
const SW_BUILD="128-direct-launch";

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
      event.source?.postMessage({
        type:"SHOOKING_BUILD",
        build:SW_BUILD,
        cache:CACHE_NAME,
        requestId:data.requestId||""
      });
    }catch(e){}
    return;
  }
  if(data.type!=="SHOOKING_CLEAR_CACHE")return;
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith("shooking-ii-")).map(k=>caches.delete(k)));
  })());
});

function addLandingNav(html){
  html=html.replace(/<script[^>]+src=["'][^"']*common-nav\.js[^"']*["'][^>]*><\/script>/gi,"");
  return html.replace("</body>",`<script src="./common-nav.js?v=11-${SW_BUILD}"></script>\n</body>`);
}

async function networkHtml(path){
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
  const isLauncher=path.endsWith("/game")||path.endsWith("/launch")||path.endsWith("/launch.html");
  const isRawGame=path.endsWith("/game-core.html")||url.searchParams.get("play")==="1";

  // Critical rule: /game and /launch are NEVER rewritten by the service worker.
  // Vercel (or GitHub Pages) must deliver launch.html directly so old/new SW state
  // can no longer decide whether the game boots correctly.
  if(isLauncher)return;

  // A user/bookmark that opens the raw historical game page is moved to the
  // direct launcher. launch.html fetches game-core as a non-navigation request,
  // so that fetch is not intercepted here and cannot loop.
  if(isRawGame){
    event.respondWith(Response.redirect(new URL("./launch.html",self.registration.scope).href,302));
    return;
  }

  if(!isRoot)return;

  event.respondWith((async()=>{
    try{
      const response=await networkHtml("./landing.html");
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const html=addLandingNav(await response.text());
      return new Response(html,{
        status:response.status,
        statusText:response.statusText,
        headers:{
          "content-type":"text/html; charset=utf-8",
          "cache-control":"no-store",
          "x-shooking-sw-build":SW_BUILD
        }
      });
    }catch(error){
      console.warn("SHOO KING landing fetch failed",error);
      return fetch(event.request,{cache:"no-store"});
    }
  })());
});
