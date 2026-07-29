(()=>{
'use strict';
const VERSION='5.2.8';
const RELEASE_ID='5.2.8-password-gacha11-r81';
const KEY='shooking2_seen_current_release';
const LEGACY_KEY='shooking2_last_seen_update';
const PREVIOUS_ID='5.2.7-mobile-side-scroll-warp-r80';
function show(){let seen='';try{seen=localStorage.getItem(KEY)||'';localStorage.setItem(LEGACY_KEY,PREVIOUS_ID)}catch{}if(seen===RELEASE_ID)return;try{localStorage.setItem(KEY,RELEASE_ID)}catch{}const message='・設定からパスワードを安全に変更可能\n・現在のパスワードで本人確認して更新\n・通常／ゴールド／季節ガチャに11連を追加\n・カプセル11個が一気に同時排出\n・10回分のコインで11個獲得';const run=()=>{if(typeof window.showAppNotice==='function'){window.showAppNotice({title:`VERSION ${VERSION} // R81`,message,type:'success',duration:12000})}else setTimeout(run,180)};run();window.__shookingCurrentRelease=RELEASE_ID}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(show,420),{once:true});else setTimeout(show,420);
})();