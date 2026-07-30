(()=>{
'use strict';
const VERSION='5.3.3';
const RELEASE_ID='5.3.3-startup-loading-r87';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.3.2-direct-button-listeners-r86';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・ゲーム起動時に最前面の読み込み画面を追加\n・Windowsの再起動中のような円形スピナー\n・裏ではログイン画面とゲーム機能を先に読み込み\n・準備完了までゲーム画面を完全に隠す\n・読み込み完了後に自動でフェードアウト';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R87`,message,type:'success',duration:12000});
  else setTimeout(run,180);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,420),{once:true});else setTimeout(show,420);
})();