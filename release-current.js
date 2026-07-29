(()=>{
'use strict';
const VERSION='5.2.9';
const RELEASE_ID='5.2.9-button-fix-r82';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.2.7-mobile-side-scroll-warp-r80';
function show(){let seen='';try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}if(seen===RELEASE_ID)return;try{localStorage.setItem(KEY,RELEASE_ID)}catch{}const message='・11連ガチャのボタン無反応を修正\n・スマホでもタップを確実に検知\n・元ガチャの読み込み後に11連を起動\n・パスワード変更ボタンの無言停止を修正\n・Google／未ログイン時も理由を画面表示';const run=()=>{if(typeof window.showAppNotice==='function'){window.showAppNotice({title:`VERSION ${VERSION} // R82`,message,type:'success',duration:12000})}else setTimeout(run,180)};run();window.__shookingCurrentRelease=RELEASE_ID}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,420),{once:true});else setTimeout(show,420);
})();