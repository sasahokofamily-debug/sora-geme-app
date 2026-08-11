(()=>{
'use strict';
const OVERLAY_ID='pageLoadingOverlay';
const MAX_STUCK_MS=1100;
let safetyTimer=0;

function overlay(){return document.getElementById(OVERLAY_ID)}
function hide(){
  clearTimeout(safetyTimer);
  safetyTimer=0;
  const el=overlay();
  if(el){
    el.classList.remove('visible');
    el.setAttribute('aria-busy','false');
  }
}
function arm(){
  clearTimeout(safetyTimer);
  safetyTimer=setTimeout(hide,MAX_STUCK_MS);
}
function watch(){
  const el=overlay();
  if(!el)return false;
  const sync=()=>{
    if(el.classList.contains('visible')){
      el.setAttribute('aria-busy','true');
      arm();
    }else{
      clearTimeout(safetyTimer);
      safetyTimer=0;
      el.setAttribute('aria-busy','false');
    }
  };
  new MutationObserver(sync).observe(el,{attributes:true,attributeFilter:['class']});
  sync();
  return true;
}

function guardMalformedKeyEvent(event){
  if(typeof event.key==='string')return;
  try{event.preventDefault()}catch(e){}
  try{event.stopImmediatePropagation()}catch(e){}
  try{event.stopPropagation()}catch(e){}
}
window.addEventListener('keydown',guardMalformedKeyEvent,true);
window.addEventListener('keyup',guardMalformedKeyEvent,true);

let tries=0;
const timer=setInterval(()=>{
  if(watch()||++tries>40)clearInterval(timer);
},100);

window.addEventListener('pageshow',()=>setTimeout(hide,0));
window.addEventListener('focus',()=>setTimeout(hide,80));
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible')setTimeout(hide,80);
});
window.addEventListener('popstate',()=>setTimeout(hide,80));
window.addEventListener('load',()=>setTimeout(hide,120),{once:true});
setTimeout(hide,1400);

window.__SHOOKING_LOADING_FAILSAFE__={version:'1.1-key-guard',hide};
})();
