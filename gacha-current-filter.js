(()=>{
'use strict';
const VERSION='gacha-current-no-season-v1';
function removeSeason(){
  document.querySelectorAll('.seasonGachaPanel,#seasonalGachaPermanentPanel,[id*="seasonalGacha"],.seasonal-gacha-panel').forEach(el=>el.remove());
}
const style=document.createElement('style');
style.id='gachaCurrentFilterStyle';
style.textContent='.seasonGachaPanel,#seasonalGachaPermanentPanel,[id*="seasonalGacha"],.seasonal-gacha-panel{display:none!important}';
document.head.appendChild(style);
removeSeason();
if(document.body)new MutationObserver(removeSeason).observe(document.body,{childList:true,subtree:true});
else document.addEventListener('DOMContentLoaded',()=>{removeSeason();new MutationObserver(removeSeason).observe(document.body,{childList:true,subtree:true})},{once:true});
window.summerGacha=undefined;
window.winterGacha=undefined;
window.__SHOOKING_GACHA_CURRENT_FILTER__=VERSION;
})();
