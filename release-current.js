(()=>{
'use strict';
const VERSION='5.4.2';
const RELEASE_ID='5.4.2-app-store-webstore-r96';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.4.1-webstore-html-game-launcher-r95';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・WebStoreをApp Store風デザインへ刷新\n・WebStoreでは共通上部バーを非表示\n・ローカル認証とアカウント画面を追加\n・おすすめ、人気ゲーム、カテゴリで区切り表示\n・入手ボタンと三点メニューを追加';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R96`,message,type:'success',duration:9000});
  else setTimeout(run,150);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,160),{once:true});else setTimeout(show,160);
})();