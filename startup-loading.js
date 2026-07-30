(()=>{
'use strict';
const VERSION='startup-loading-v2-auth-ready';
const CURRENT_KEY='shooking2_current_account';
const MIN_VISIBLE_MS=650;
const MAX_WAIT_MS=4200;
let finished=false;
let timer=0;

function overlay(){return document.getElementById('shookingStartupLoader')}
function message(text){const el=document.getElementById('shookingStartupLoadingText');if(el)el.textContent=text}
function detail(text){const el=document.getElementById('shookingStartupLoadingDetail');if(el)el.textContent=text}
function startedAt(){return Number(window.__shookingStartupLoadingStarted)||performance.now()}
function hasAccount(){try{return !!JSON.parse(localStorage.getItem(CURRENT_KEY)||'null')}catch{return false}}
function loginReady(){
 const login=document.getElementById('loginScreen');
 return !!(login&&document.getElementById('loginName')&&document.getElementById('loginPassword')&&!login.classList.contains('hidden'));
}
function appReady(){
 const base=!!document.body&&!!document.getElementById('home')&&!!document.getElementById('loginScreen')&&!!window.__shookingButtonActions;
 if(!base)return false;
 if(!hasAccount())return loginReady();
 return typeof window.openScreen==='function'||typeof window.showScreen==='function';
}
function hide(){
 if(finished)return;
 finished=true;
 clearTimeout(timer);
 const el=overlay();
 document.documentElement.classList.remove('shooking-loading');
 if(!el)return;
 message('準備完了');
 detail(hasAccount()?'SHOO KING IIを起動します':'ログインできます');
 el.classList.add('is-ready');
 setTimeout(()=>el.remove(),360);
}
function check(){
 if(finished)return;
 const elapsed=performance.now()-startedAt();
 if(elapsed>300&&elapsed<850){message('ゲームデータを読み込み中...');detail('画面と操作機能を準備しています')}
 else if(elapsed>=850&&elapsed<1600){message('ログイン画面を準備中...');detail('認証機能を確認しています')}
 else if(elapsed>=1600){message('読み込み中...');detail('もうすぐ開始します')}
 if((appReady()&&elapsed>=MIN_VISIBLE_MS)||elapsed>=MAX_WAIT_MS){hide();return}
 timer=setTimeout(check,70);
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
 window.showGameLoading=(text='読み込み中...')=>{finished=false;ensureFallback();message(text);document.documentElement.classList.add('shooking-loading');check()};
 window.hideGameLoading=hide;
 check();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('load',()=>setTimeout(check,0),{once:true});
})();