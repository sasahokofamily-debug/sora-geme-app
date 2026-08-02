(()=>{
'use strict';
const VERSION='5.4.4';
const RELEASE_ID='5.4.4-webstore-sora-guild-study-r98';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.4.3-webstore-shared-auth-r97';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・WebStoreへSora Guildを公式アプリとして追加\n・Vercel版URLから直接起動可能\n・新しい「勉強」カテゴリを追加\n・おすすめ、ゲーム一覧、検索へSora Guildを反映\n・画像を使わず文字アイコンで表示';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R98`,message,type:'success',duration:9000});
  else setTimeout(run,150);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,160),{once:true});else setTimeout(show,160);
})();