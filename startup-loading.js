(()=>{
'use strict';
const VERSION='startup-loading-v4-inline-backed';
const MAX_VISIBLE_MS=460;
let timer=0;

function overlay(){return document.getElementById('shookingStartupLoader')}
function removeLoader(){
 clearTimeout(timer);
 document.documentElement.classList.remove('shooking-loading');
 const el=overlay();
 if(!el)return;
 el.classList.add('is-ready');
 setTimeout(()=>el.remove(),90);
}
function ensureFallback(){
 if(overlay()||!document.body)return;
 const el=document.createElement('div');
 el.id='shookingStartupLoader';
 el.setAttribute('role','status');
 el.innerHTML='<div class="shookingStartupLoadingCenter"><div class="shookingStartupSpinner" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div id="shookingStartupLoadingText">読み込み中...</div><div id="shookingStartupLoadingDetail">画面を準備しています</div></div>';
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
 const inlineFinish=window.__shookingInlineLoaderFinish;
 if(typeof inlineFinish==='function')inlineFinish();
 else removeLoader();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();