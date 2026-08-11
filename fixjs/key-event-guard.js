(()=>{
'use strict';
function guard(event){
  if(typeof event.key==='string')return;
  event.stopImmediatePropagation();
}
window.addEventListener('keydown',guard,true);
window.addEventListener('keyup',guard,true);
window.__SHOOKING_KEY_EVENT_GUARD__='1.0';
})();
