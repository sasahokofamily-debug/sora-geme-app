(()=>{
'use strict';
const VERSION='5.3.1';
const RELEASE_ID='5.3.1-light-buttons-login-restore-r84';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.3.0-all-buttons-event-listeners-r83';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・重かった全画面の定期走査を完全に停止\n・1つの共通イベント監視だけで全ボタンを処理\n・追加されたボタンだけを軽量変換\n・未ログイン時はログイン画面を即表示\n・onclick属性は実行前に削除してイベント方式へ移行';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R84`,message,type:'success',duration:12000});
  else setTimeout(run,180);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,420),{once:true});else setTimeout(show,420);
})();