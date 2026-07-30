(()=>{
'use strict';
const VERSION='auth-session-fix-v1';
const CURRENT_KEY='shooking2_current_account';
const PENDING_WARP_KEY='shooking2_login_warp_pending';
const nativeSetInterval=window.setInterval.bind(window);

function hasAccount(){
 try{return !!JSON.parse(localStorage.getItem(CURRENT_KEY)||'null')}catch{return false}
}

/* google-login.js used to rebuild the authentication UI every second.
   Suppress only that exact render loop; all other intervals keep working. */
window.setInterval=function(callback,delay,...args){
 const source=typeof callback==='function'?Function.prototype.toString.call(callback):String(callback||'');
 if(Number(delay)===1000&&source.includes('patchLoginUi')&&source.includes('injectSettingsUi')&&source.includes('patchAccountStatus')){
  window.__shookingAuthRenderLoopSuppressed=true;
  return 0;
 }
 return nativeSetInterval(callback,delay,...args);
};

function clearTransientLoginState(){
 try{sessionStorage.removeItem('shooking2_guest_session')}catch{}
 try{sessionStorage.removeItem('shooking2_google_redirect_pending')}catch{}
 try{sessionStorage.removeItem(PENDING_WARP_KEY)}catch{}
 try{localStorage.removeItem(PENDING_WARP_KEY)}catch{}
 document.getElementById('shooLoginWarpOverlay')?.remove();
}

function showLoginNow(){
 if(hasAccount())return false;
 const login=document.getElementById('loginScreen');
 if(!login)return false;
 document.querySelectorAll('.screen').forEach(screen=>screen.classList.add('hidden'));
 login.classList.remove('hidden');
 login.style.removeProperty('display');
 login.removeAttribute('aria-hidden');
 document.body.classList.remove('game-playing');
 document.body.classList.add('game-menu');
 const status=document.getElementById('accountStatusHome');
 if(status&&status.textContent.trim()!=='未ログイン')status.textContent='未ログイン';
 requestAnimationFrame(()=>{
  const first=document.getElementById('loginName');
  if(first&&matchMedia('(pointer:fine)').matches)first.focus({preventScroll:true});
 });
 return true;
}

function finishLoggedOutUi(){
 clearTransientLoginState();
 try{localStorage.removeItem(CURRENT_KEY)}catch{}
 showLoginNow();
 try{window.hideGameLoading?.()}catch{}
}

function wrapLogout(){
 const original=window.logoutFirebaseAccount;
 if(typeof original!=='function'||original.__shookingLogoutFixed)return false;
 const fixed=async function(...args){
  clearTransientLoginState();
  try{return await original.apply(this,args)}finally{finishLoggedOutUi()}
 };
 fixed.__shookingLogoutFixed=true;
 fixed.__shookingLogoutOriginal=original;
 window.logoutFirebaseAccount=fixed;
 window.logoutGoogleAccount=fixed;
 return true;
}

function settle(){
 wrapLogout();
 if(!hasAccount())showLoginNow();
 window.__shookingAuthSessionFix=VERSION;
}

function install(){
 settle();
 let attempts=0;
 const retry=()=>{
  settle();
  attempts++;
  if(attempts<16)setTimeout(retry,160);
 };
 setTimeout(retry,0);
 window.addEventListener('pageshow',()=>{if(!hasAccount()){showLoginNow();setTimeout(showLoginNow,80)}});
 window.addEventListener('storage',event=>{if(event.key===CURRENT_KEY&&!event.newValue)finishLoggedOutUi()});
 document.addEventListener('shooking:logout',finishLoggedOutUi);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();