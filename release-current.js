(()=>{
'use strict';
const VERSION='5.4.0';
const RELEASE_ID='5.4.0-stop-auth-reload-loop-r94';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.3.9-login-screen-before-reveal-r93';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・読み込み→未ログインを繰り返す再読み込みループを停止\n・公開版と通常版のService Worker自動移動を整理\n・Service Worker登録URLをsw.jsへ統一\n・公開版でも重い認証画面の毎秒再生成を停止\n・JS取得失敗時にHTMLを返さないよう修正';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R94`,message,type:'success',duration:9000});
  else setTimeout(run,150);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,160),{once:true});else setTimeout(show,160);
})();