(()=>{
'use strict';
const VERSION='startup-loading-v5-fast-login-ready';
const MAX_VISIBLE_MS=620;
let timer=0;
let finished=false;

function overlay(){return document.getElementById('shookingStartupLoader')}
function forceMenuScreen(){
  document.getElementById('shookingStartupPortal')?.remove();
  document.documentElement.style.overflow='';
  document.body?.classList.remove('game-playing');
  document.body?.classList.add('game-menu');
  const login=document.getElementById('loginScreen')||document.getElementById('login');
  const home=document.getElementById('home');
  const target=login||home;
  if(target){
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
    target.classList.remove('hidden');
  }
}
function removeLoader(){
  if(finished)return;
  finished=true;
  clearTimeout(timer);
  try{forceMenuScreen()}catch(e){}
  document.documentElement.classList.remove('shooking-loading');
  const el=overlay();
  if(!el)return;
  el.classList.add('is-ready');
  setTimeout(()=>el.remove(),80);
}
function ensureFallback(){
  if(overlay()||!document.body)return;
  const el=document.createElement('div');
  el.id='shookingStartupLoader';
  el.setAttribute('role','status');
  el.innerHTML='<div class="shookingStartupLoadingCenter"><div class="shookingStartupSpinner" aria-hidden="true"></div><div id="shookingStartupLoadingText">読み込み中...</div><div id="shookingStartupLoadingDetail">ログイン画面を準備しています</div></div>';
  document.body.prepend(el);
}
function show(text='読み込み中...'){
  ensureFallback();
  const el=document.getElementById('shookingStartupLoadingText');
  if(el)el.textContent=text;
  document.documentElement.classList.add('shooking-loading');
  clearTimeout(timer);
  timer=setTimeout(removeLoader,MAX_VISIBLE_MS);
}
function install(){
  window.__shookingStartupLoading=VERSION;
  window.showGameLoading=show;
  window.hideGameLoading=removeLoader;
  window.__shookingForceLoginReady=removeLoader;
  const inlineFinish=window.__shookingInlineLoaderFinish;
  if(typeof inlineFinish==='function')inlineFinish();
  timer=setTimeout(removeLoader,MAX_VISIBLE_MS);
  setTimeout(removeLoader,1100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
