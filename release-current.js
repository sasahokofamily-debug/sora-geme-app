(()=>{
'use strict';
const VERSION='5.3.9';
const RELEASE_ID='5.3.9-login-screen-before-reveal-r93';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.3.8-public-streaming-loader-r92';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・読み込み後にホームの「未ログイン」が出る問題を修正\n・未ログイン時は画面表示前にログイン画面へ固定\n・ホーム画面を一瞬表示する状態を防止\n・公開版にも同じログイン優先処理を追加\n・ログアウト後の再表示にも対応';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R93`,message,type:'success',duration:8500});
  else setTimeout(run,150);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,160),{once:true});else setTimeout(show,160);
})();