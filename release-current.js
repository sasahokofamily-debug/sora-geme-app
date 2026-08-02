(()=>{
'use strict';
const VERSION='5.4.7';
const RELEASE_ID='5.4.7-webstore-confirm-all-launches-r101';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.4.6-native-auth-confirm-r100';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・確認が認証時だけだった問題を修正\n・すべてのWebアプリを開く直前に信頼確認を表示\n・おすすめ、開く、三点メニュー、直接URL入力に対応\n・HTML、CSS、JavaScriptを分離して動作処理を明確化\n・キャンセル時はリンク先を開かない';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R101`,message,type:'success',duration:9000});
  else setTimeout(run,150);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,160),{once:true});else setTimeout(show,160);
})();