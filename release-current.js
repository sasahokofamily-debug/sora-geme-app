(()=>{
'use strict';
const VERSION='5.4.5';
const RELEASE_ID='5.4.5-webstore-windows-trust-confirm-r99';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.4.4-webstore-sora-guild-study-r98';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・WebStoreの認証移動前にWindows風確認画面を追加\n・「このWebページを信頼して開きますか？」を表示\n・発行元と接続先URLを確認可能\n・信頼して開く／キャンセルに対応\n・スマホでは下部から見やすく表示';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R99`,message,type:'success',duration:9000});
  else setTimeout(run,150);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,160),{once:true});else setTimeout(show,160);
})();