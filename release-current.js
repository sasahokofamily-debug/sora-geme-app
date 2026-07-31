(()=>{
'use strict';
const VERSION='5.3.6';
const RELEASE_ID='5.3.6-inline-loader-service-worker-r90';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.3.5-fast-startup-loader-r89';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・読み込み画面の解除タイマーをHTML先頭で開始\n・後続スクリプトの読み込み完了を待たず解除\n・Service Worker更新時の全ファイル待機を廃止\n・新しいService Workerへ自動切替\n・古い読み込み画面が残る問題を修正';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R90`,message,type:'success',duration:9000});
  else setTimeout(run,160);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,180),{once:true});else setTimeout(show,180);
})();