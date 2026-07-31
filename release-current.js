(()=>{
'use strict';
const VERSION='5.3.4';
const RELEASE_ID='5.3.4-logout-reentry-fix-r88';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.3.3-startup-loading-r87';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・ログアウト後に未ログイン表示で固まる問題を修正\n・認証画面を毎秒作り直す重い処理を停止\n・ログアウト後はログイン画面を即表示\n・一時的なワープ状態をログアウト時に消去\n・未ログイン時の読み込み画面を早く終了';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R88`,message,type:'success',duration:12000});
  else setTimeout(run,180);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,420),{once:true});else setTimeout(show,420);
})();