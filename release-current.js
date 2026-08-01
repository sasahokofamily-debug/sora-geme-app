(()=>{
'use strict';
const VERSION='5.4.1';
const RELEASE_ID='5.4.1-webstore-html-game-launcher-r95';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.4.0-stop-auth-reload-loop-r94';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・新しいWebStoreページを追加\n・HTMLゲームURLを登録して直接起動可能\n・ゲーム名、ジャンル、URLの検索に対応\n・登録したゲームをブラウザ内へ保存\n・SHOO KING IIを公式ゲームとして掲載';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R95`,message,type:'success',duration:9000});
  else setTimeout(run,150);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,160),{once:true});else setTimeout(show,160);
})();