(()=>{
'use strict';
const VERSION='5.4.3';
const RELEASE_ID='5.4.3-webstore-shared-auth-r97';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.4.2-app-store-webstore-r96';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・WebStoreの共通上部バーを完全非表示\n・SHOO KING IIと同じアカウント認証へ統一\n・おすすめ、ゲーム、ライブラリ、検索の4タブ化\n・カテゴリ区切り、最近使った項目、検索を追加\n・各ゲームへ三点メニューとアカウント別保存を追加';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R97`,message,type:'success',duration:9000});
  else setTimeout(run,150);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,160),{once:true});else setTimeout(show,160);
})();