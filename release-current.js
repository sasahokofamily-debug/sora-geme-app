(()=>{
'use strict';
const VERSION='5.3.7';
const RELEASE_ID='5.3.7-immediate-loader-delivery-r91';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.3.6-inline-loader-service-worker-r90';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・青い読み込み画面を280msで強制解除\n・解除タイマーをHTML表示直後に開始\n・Service Workerをキャッシュ待ちなしで即時有効化\n・新版有効化後に一度だけ自動再読込\n・古い読み込み処理が残る問題を修正';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R91`,message,type:'success',duration:8500});
  else setTimeout(run,150);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,160),{once:true});else setTimeout(show,160);
})();