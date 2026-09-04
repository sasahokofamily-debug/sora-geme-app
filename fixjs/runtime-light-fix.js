(()=>{
'use strict';
const VERSION='runtime-light-fix-v2-resilient';

function killHeavyOverlay(){
  const el=document.getElementById('pageLoadingOverlay');
  if(el){
    el.classList.remove('visible');
    el.style.setProperty('display','none','important');
    el.style.setProperty('backdrop-filter','none','important');
    el.style.setProperty('-webkit-backdrop-filter','none','important');
    el.style.pointerEvents='none';
    el.setAttribute('aria-busy','false');
  }
  const startup=document.getElementById('shookingStartupLoader');
  if(startup){
    startup.classList.add('is-ready');
    startup.style.pointerEvents='none';
    setTimeout(()=>startup.remove(),80);
  }
  document.documentElement.classList.remove('shooking-loading');
}

async function recoverServiceWorker(){
  if(!('serviceWorker' in navigator))return;
  try{
    const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
    try{reg.waiting?.postMessage({type:'SHOOKING_SKIP_WAITING'});}catch(e){}
    try{reg.installing?.postMessage({type:'SHOOKING_SKIP_WAITING'});}catch(e){}
    reg.update().catch(()=>{});
  }catch(error){
    console.warn('SHOO KING runtime service worker recovery skipped',error);
  }
}

const style=document.createElement('style');
style.id='runtimeLightFixStyle';
style.textContent=`
#pageLoadingOverlay{display:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;pointer-events:none!important}
.screen{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
`;
document.head.appendChild(style);

let tries=0;
const timer=setInterval(()=>{
  killHeavyOverlay();
  if(++tries>30)clearInterval(timer);
},100);

window.addEventListener('pageshow',killHeavyOverlay);
window.addEventListener('load',()=>setTimeout(killHeavyOverlay,0),{once:true});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')killHeavyOverlay()});
setTimeout(killHeavyOverlay,0);
setTimeout(killHeavyOverlay,500);
setTimeout(killHeavyOverlay,1200);
setTimeout(killHeavyOverlay,3200);
recoverServiceWorker();

window.__SHOOKING_RUNTIME_LIGHT__=VERSION;
})();
