(()=>{
'use strict';
const VERSION='gacha-current-no-season-v2';

const style=document.createElement('style');
style.id='gachaCurrentFilterStyle';
style.textContent=`
.seasonGachaPanel,#seasonalGachaPermanentPanel,[id*="seasonalGacha"],.seasonal-gacha-panel{display:none!important}
.gacha11Button[data-g11-kind="summer"],.gacha11Button[data-g11-kind="winter"]{display:none!important}
#gacha11Panel .gacha11Grid{grid-template-columns:1fr 1fr!important}
`;
document.head.appendChild(style);

function sanitize(){
  /* Keep gacha-upgrade's seasonal panel node hidden instead of constantly
     deleting it; this prevents its periodic ensureSeasonPanel() from
     repeatedly rebuilding DOM in the background. */
  document.querySelectorAll('.seasonGachaPanel,#seasonalGachaPermanentPanel,[id*="seasonalGacha"],.seasonal-gacha-panel').forEach(el=>{
    el.hidden=true;
    el.setAttribute('aria-hidden','true');
  });
  document.querySelectorAll('.gacha11Button[data-g11-kind="summer"],.gacha11Button[data-g11-kind="winter"]').forEach(el=>el.remove());
}

function disableSeasonFunctions(){
  if(typeof window.summerGacha==='function')window.summerGacha=()=>{};
  if(typeof window.winterGacha==='function')window.winterGacha=()=>{};
}

function run(){sanitize();disableSeasonFunctions()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
if(document.body)new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
else document.addEventListener('DOMContentLoaded',()=>new MutationObserver(run).observe(document.body,{childList:true,subtree:true}),{once:true});
let tries=0;const timer=setInterval(()=>{run();if(++tries>22)clearInterval(timer)},500);
window.__SHOOKING_GACHA_CURRENT_FILTER__=VERSION;
})();
