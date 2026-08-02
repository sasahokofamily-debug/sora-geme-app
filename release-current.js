(()=>{
'use strict';
const VERSION='5.4.6';
const RELEASE_ID='5.4.6-native-auth-confirm-r100';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.4.5-webstore-windows-trust-confirm-r99';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・CSSだけの疑似確認画面を削除\n・認証ボタンへブラウザ標準confirmを直接接続\n・OKの時だけSHOO KING II認証ページへ移動\n・キャンセル時はWebStoreに残る\n・WebStore HTMLを軽量化';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R100`,message,type:'success',duration:9000});
  else setTimeout(run,150);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,160),{once:true});else setTimeout(show,160);
})();