(()=>{
'use strict';
const VERSION='startup-loading-v1';
const MIN_VISIBLE_MS=1150;
const MAX_WAIT_MS=9000;
let finished=false;
let timer=0;

function overlay(){return document.getElementById('shookingStartupLoader')}
function message(text){const el=document.getElementById('shookingStartupLoadingText');if(el)el.textContent=text}
function detail(text){const el=document.getElementById('shookingStartupLoadingDetail');if(el)el.textContent=text}
function startedAt(){return Number(window.__shookingStartupLoadingStarted)||performance.now()}
function appReady(){
 return document.readyState==='complete'&&
  !!document.getElementById('loginScreen')&&
  !!document.getElementById('home')&&
  (typeof window.openScreen==='function'||typeof window.showScreen==='function')&&
  !!window.__shookingButtonActions;
}
function hide(){
 if(finished)return;
 finished=true;
 clearTimeout(timer);
 const el=overlay();
 document.documentElement.classList.remove('shooking-loading');
 if(!el)return;
 message('準備完了');
 detail('SHOO KING IIを起動します');
 el.classList.add('is-ready');
 setTimeout(()=>el.remove(),480);
}
function check(){
 if(finished)return;
 const elapsed=performance.now()-startedAt();
 if(elapsed>420&&elapsed<980){message('ゲームデータを読み込み中...');detail('画面と操作機能を準備しています')}
 else if(elapsed>=980&&elapsed<1900){message('ログイン画面を準備中...');detail('セーブデータと認証機能を確認しています')}
 else if(elapsed>=1900){message('読み込み中...');detail('もうすぐ開始します')}
 if((appReady()&&elapsed>=MIN_VISIBLE_MS)||elapsed>=MAX_WAIT_MS){hide();return}
 timer=setTimeout(check,90);
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