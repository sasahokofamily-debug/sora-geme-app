(()=>{
'use strict';

const PANEL_ID='seasonalGachaPermanentPanel';

function month(){return new Date().getMonth()+1}
function isActive(kind){const m=month();return kind==='summer'?(m>=6&&m<=8):(m===12||m<=2)}

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
