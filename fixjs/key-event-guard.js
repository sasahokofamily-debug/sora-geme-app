(()=>{
'use strict';
function guard(event){
  if(typeof event.key==='string')return;
  event.stopImmediatePropagation();
}
window.addEventListener('keydown',guard,true);
window.addEventListener('keyup',guard,true);

// Recovery path for devices still controlled by an older SHOO KING service worker.
// Older workers already inject this file into the game, so it can pull the current
// worker even when /game was intercepted before the new bootstrap page could run.
async function recoverServiceWorker(){
  if(!('serviceWorker' in navigator))return;
  try{
    const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
    try{reg.waiting?.postMessage({type:'SHOOKING_SKIP_WAITING'});}catch(e){}
    try{reg.installing?.postMessage({type:'SHOOKING_SKIP_WAITING'});}catch(e){}
    reg.update().catch(()=>{});
  }catch(error){
    console.warn('SHOO KING service worker recovery skipped',error);
  }
}
recoverServiceWorker();

window.__SHOOKING_KEY_EVENT_GUARD__='2.0-sw-recovery';
})();
