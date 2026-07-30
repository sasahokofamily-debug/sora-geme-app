(()=>{
'use strict';
const VERSION='5.3.2';
const RELEASE_ID='5.3.2-direct-button-listeners-r86';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.3.1-light-buttons-login-restore-r84';
function show(){
 let seen='';
 try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}
 if(seen===RELEASE_ID)return;
 try{localStorage.setItem(KEY,RELEASE_ID)}catch{}
 const message='・documentへのクリック伝播依存を廃止\n・各ボタンへaddEventListenerを直接登録\n・途中でイベントが止まってもボタンを実行\n・動的に追加されるマップやショップのボタンにも対応\n・重い定期走査は使用しない';
 const run=()=>{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:`VERSION ${VERSION} // R86`,message,type:'success',duration:12000});
  else setTimeout(run,180);
 };
 run();
 window.__shookingCurrentRelease=RELEASE_ID;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,420),{once:true});else setTimeout(show,420);
})();