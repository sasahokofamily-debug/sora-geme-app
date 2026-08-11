(()=>{
'use strict';
const VERSION='runtime-light-fix-v1';

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
  document.documentElement.classList.remove('shooking-loading');
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

window.__SHOOKING_RUNTIME_LIGHT__=VERSION;
})();
