(()=>{
'use strict';
const VERSION='5.3.0';
const RELEASE_ID='5.3.0-all-buttons-event-listeners-r83';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.2.7-mobile-side-scroll-warp-r80';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・全ボタンをonclick依存から変更\n・addEventListener方式へ自動移行\n・後から生成されるボタンにも対応\n・スマホのタップ、設定変更、入力操作に対応\n・実行できない処理は理由を画面に表示';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R83`,message,type:'success',duration:12000});
  else setTimeout(run,180);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,420),{once:true});else setTimeout(show,420);
})();
