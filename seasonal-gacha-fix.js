(()=>{
'use strict';

const PANEL_ID='seasonalGachaPermanentPanel';
const STYLE_ID='seasonalGachaPermanentStyle';

function month(){return new Date().getMonth()+1}
function isActive(kind){const m=month();return kind==='summer'?(m>=6&&m<=8):(m===12||m<=2)}

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
  #${PANEL_ID}{margin:16px 0;padding:16px;border:2px solid #67e8f9;border-radius:18px;background:linear-gradient(145deg,rgba(8,47,73,.95),rgba(15,23,42,.96));box-shadow:0 0 26px rgba(34,211,238,.28);position:relative;z-index:30}
  #${PANEL_ID} .sgTitle{font-size:20px;font-weight:1000;letter-spacing:.08em;color:#fff;margin-bottom:6px;text-shadow:0 0 14px #22d3ee}
  #${PANEL_ID} .sgSub{font-size:12px;opacity:.86;margin-bottom:12px}
  #${PANEL_ID} .sgGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  #${PANEL_ID} button{min-height:82px;margin:0!important;border:2px solid rgba(255,255,255,.7)!important;font-size:16px!important;font-weight:1000!important;line-height:1.35!important;box-shadow:inset 0 0 22px rgba(255,255,255,.15),0 0 18px rgba(0,0,0,.35)!important}
  #${PANEL_ID} .sgSummer{background:linear-gradient(135deg,#22d3ee,#0369a1 58%,#1d4ed8)!important;color:white!important;text-shadow:0 0 10px #083344}
  #${PANEL_ID} .sgWinter{background:linear-gradient(135deg,#fdba74,#ea580c 55%,#991b1b)!important;color:white!important;text-shadow:0 0 10px #431407}
  #${PANEL_ID} button.sgLocked{filter:grayscale(.45);opacity:.72}
  #${PANEL_ID} .sgBadge{display:inline-block;margin-top:5px;padding:2px 8px;border-radius:999px;background:rgba(2,6,23,.72);font-size:11px;letter-spacing:.08em}
  @media(max-width:560px){#${PANEL_ID} .sgGrid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function findHost(){
  const ids=['gachaScreen','gachaPanel','gachaMenu','shopScreen'];
  for(const id of ids){
    const el=document.getElementById(id);
    if(el){
      const panel=el.querySelector('.panel');
      return panel||el;
    }
  }
  const normal=[...document.querySelectorAll('button')].find(b=>/通常ガチャ|ノーマルガチャ|normal gacha/i.test(b.textContent||''));
  return normal?.closest('.panel')||normal?.parentElement||null;
}

function runSeason(kind){
  if(!isActive(kind)){
    const text=kind==='summer'?'夏限定ガチャは6〜8月開催です。':'冬限定ガチャは12〜2月開催です。';
    if(typeof window.showToast==='function')window.showToast(text);else alert(text);
    return;
  }
  if(typeof window.startSeasonGacha==='function')return window.startSeasonGacha(kind);
  if(kind==='summer'&&typeof window.summerGacha==='function')return window.summerGacha();
  if(kind==='winter'&&typeof window.winterGacha==='function')return window.winterGacha();
  if(typeof window.startRealGacha==='function')return window.startRealGacha(kind);
  if(typeof window.showToast==='function')window.showToast('限定ガチャの読み込みを待っています');
}

function buildPanel(){
  const panel=document.createElement('div');
  panel.id=PANEL_ID;
  const summer=isActive('summer'),winter=isActive('winter');
  panel.innerHTML=`
    <div class="sgTitle">🌟 季節限定ガチャ</div>
    <div class="sgSub">限定装備と限定演出が出る特別ガチャ</div>
    <div class="sgGrid">
      <button type="button" class="sgSummer ${summer?'':'sgLocked'}" data-season="summer">🌊 すずしーガチャ<br><span class="sgBadge">${summer?'開催中・180コイン':'6〜8月限定'}</span></button>
      <button type="button" class="sgWinter ${winter?'':'sgLocked'}" data-season="winter">🔥 暖房ガチャ<br><span class="sgBadge">${winter?'開催中・180コイン':'12〜2月限定'}</span></button>
    </div>`;
  panel.addEventListener('click',e=>{
    const button=e.target.closest('[data-season]');
    if(button)runSeason(button.dataset.season);
  });
  return panel;
}

function installPanel(){
  installStyle();
  const host=findHost();
  if(!host)return false;
  const existing=document.getElementById(PANEL_ID);
  if(existing){
    if(!host.contains(existing))host.appendChild(existing);
    return true;
  }
  const panel=buildPanel();
  const back=[...host.querySelectorAll('button')].find(b=>/戻る|back/i.test(b.textContent||''));
  if(back)host.insertBefore(panel,back);else host.appendChild(panel);
  return true;
}

function protectOverrides(){
  const oldOpen=window.openScreen;
  if(typeof oldOpen==='function'&&!oldOpen.__seasonPatched){
    const wrapped=function(){const r=oldOpen.apply(this,arguments);setTimeout(installPanel,0);setTimeout(installPanel,250);return r};
    wrapped.__seasonPatched=true;
    window.openScreen=wrapped;
  }
}

installPanel();
protectOverrides();
let tries=0;
const timer=setInterval(()=>{installPanel();protectOverrides();if(++tries>120)clearInterval(timer)},250);
new MutationObserver(()=>installPanel()).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',()=>{installPanel();setTimeout(installPanel,500)});
})();