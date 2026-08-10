(()=>{
'use strict';
const BUILD='113-loading-failsafe';
const BUILD_PARAM='__shoo_build';
const STORE_KEY='shooking2_runtime_build';
const RELOAD_KEY='shooking2_build_reload_'+BUILD;

window.__SHOOKING_BUILD__=BUILD;

function withBuild(url=location.href){
  const u=new URL(url,location.href);
  u.searchParams.set(BUILD_PARAM,BUILD);
  return u.href;
}

async function clearRuntimeCaches(){
  if(!('caches' in window))return;
  try{
    const keys=await caches.keys();
    await Promise.all(keys.map(key=>caches.delete(key)));
  }catch(e){
    console.warn('Cache clear skipped',e);
  }
}

async function ensureLatestWorker(){
  if(!('serviceWorker' in navigator))return;
  try{
    const reg=await navigator.serviceWorker.register('./sw.js?v='+BUILD,{updateViaCache:'none'});
    await reg.update().catch(()=>{});
  }catch(e){
    console.warn('Service worker refresh failed',e);
  }
}

async function verifyBuild(){
  let previous='';
  try{previous=localStorage.getItem(STORE_KEY)||''}catch(e){}
  const staleDom=!!(
    document.getElementById('seasonalGachaPermanentPanel') ||
    document.querySelector('.seasonGachaPanel') ||
    document.getElementById('shooLoginFrame')
  );

  if(previous!==BUILD || staleDom){
    await clearRuntimeCaches();
    await ensureLatestWorker();
    try{localStorage.setItem(STORE_KEY,BUILD)}catch(e){}

    if(!sessionStorage.getItem(RELOAD_KEY)){
      sessionStorage.setItem(RELOAD_KEY,'1');
      location.replace(withBuild());
      return;
    }
  }
  await ensureLatestWorker();
}

if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(sessionStorage.getItem(RELOAD_KEY))return;
    sessionStorage.setItem(RELOAD_KEY,'1');
    location.replace(withBuild());
  });
}

window.addEventListener('pageshow',event=>{
  if(event.persisted){
    clearRuntimeCaches().finally(()=>location.replace(withBuild()));
  }
});

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',verifyBuild,{once:true});
}else{
  verifyBuild();
}
})();
