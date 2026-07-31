(()=>{
'use strict';
const VERSION='5.3.8';
const RELEASE_ID='5.3.8-public-streaming-loader-r92';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.3.7-immediate-loader-delivery-r91';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・公開ページ側の本当の長時間読み込みを修正\n・巨大HTML取得後のdocument.writeを完全廃止\n・ゲーム本体とJSをService Workerでストリーミング配信\n・古い公開キャッシュを削除して新版へ自動切替\n・起動ページからゲーム画面へ直接移動';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R92`,message,type:'success',duration:9000});
  else setTimeout(run,150);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,160),{once:true});else setTimeout(show,160);
})();