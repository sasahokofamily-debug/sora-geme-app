(()=>{
'use strict';
const VERSION='startup-loading-v3-fast';
const CURRENT_KEY='shooking2_current_account';
const MIN_VISIBLE_MS=120;
const MAX_WAIT_MS=900;
let finished=false;
let timer=0;
let hardTimer=0;

function overlay(){return document.getElementById('shookingStartupLoader')}
function message(text){const el=document.getElementById('shookingStartupLoadingText');if(el)el.textContent=text}
function detail(text){const el=document.getElementById('shookingStartupLoadingDetail');if(el)el.textContent=text}
function startedAt(){return Number(window.__shookingStartupLoadingStarted)||performance.now()}
function hasAccount(){try{return !!JSON.parse(localStorage.getItem(CURRENT_KEY)||'null')}catch{return false}}
function appReady(){
 const login=document.getElementById('loginScreen');
 const home=document.getElementById('home');
 if(!document.body||!login||!home)return false;
 if(!hasAccount())return !!(document.getElementById('loginName')&&document.getElementById('loginPassword'));
 return true;
}
function hide(){
 if(finished)return;
 finished=true;
 clearTimeout(timer);
 clearTimeout(hardTimer);
 const el=overlay();
 document.documentElement.classList.remove('shooking-loading');
 if(!el)return;
 el.classList.add('is-ready');
 setTimeout(()=>el.remove(),140);
}
function check(){
 if(finished)return;
 const elapsed=performance.now()-startedAt();
 if(elapsed>220){message('読み込み中...');detail('画面を準備しています')}
 if((appReady()&&elapsed>=MIN_VISIBLE_MS)||elapsed>=MAX_WAIT_MS){hide();return}
 timer=setTimeout(check,35);
}
function ensureFallback(){
 if(overlay())return;
 const el=document.createElement('div');
 el.id='shookingStartupLoader';
 el.setAttribute('role','status');
 el.setAttribute('aria-live','polite');
 el.innerHTML='<div class="shookingStartupLoadingCenter"><div class="shookingStartupSpinner" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div id="shookingStartupLoadingText">読み込み中...</div><div id="shookingStartupLoadingDetail">SHOO KING IIを準備しています</div></div>';
 document.body.prepend(el);
}
function install(){
 ensureFallback();
 window.__shookingStartupLoading=VERSION;
 window.showGameLoading=(text='読み込み中...')=>{
  finished=false;
  ensureFallback();
  message(text);
  document.documentElement.classList.add('shooking-loading');
  hardTimer=setTimeout(hide,MAX_WAIT_MS);
  check();
 };
 window.hideGameLoading=hide;
 hardTimer=setTimeout(hide,MAX_WAIT_MS);
 check();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('load',()=>setTimeout(check,0),{once:true});
})();