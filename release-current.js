(()=>{
'use strict';
const VERSION='5.3.5';
const RELEASE_ID='5.3.5-fast-startup-loader-r89';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.3.4-logout-reentry-fix-r88';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・読み込み画面の最低表示を約0.12秒へ短縮\n・最大表示時間を約0.9秒へ短縮\n・ログイン画面の基本部分ができた時点で即終了\n・長い準備完了表示を廃止\n・フェード時間も短縮';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R89`,message,type:'success',duration:10000});
  else setTimeout(run,180);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,260),{once:true});else setTimeout(show,260);
})();