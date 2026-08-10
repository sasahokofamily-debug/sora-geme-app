(()=>{
'use strict';

const STYLE_ID='shookingGachaCinematicStyle';
const FX_ID='shookingGachaCinematicFx';
let runToken=0;
let audioCtx=null;
const timers=new Set();

const $=id=>document.getElementById(id);
function later(fn,ms){const id=setTimeout(()=>{timers.delete(id);fn()},ms);timers.add(id);return id}
function clearTimers(){timers.forEach(clearTimeout);timers.clear()}
function lowPower(){return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2)}
function vibrate(pattern){try{if(navigator.vibrate)navigator.vibrate(pattern)}catch(e){}}

function audio(){
  const C=window.AudioContext||window.webkitAudioContext;
  if(!C)return null;
  if(!audioCtx)audioCtx=new C();
  if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
  return audioCtx;
}
function tone(freq,delay,duration,gain=.04,type='sine',endFreq=null){
  const c=audio();if(!c)return;
  const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;
  o.type=type;o.frequency.setValueAtTime(freq,t);
  if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),t+duration);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  o.connect(g).connect(c.destination);o.start(t);o.stop(t+duration+.04);
}
function soundCharge(rare){
  tone(rare?180:130,0,.7,.055,'sawtooth',rare?520:390);
  [0,.16,.32,.48,.64].forEach((t,i)=>tone((rare?420:320)+i*95,t,.11,.026,i%2?'triangle':'square'));
}
function soundWarning(rare){tone(rare?980:720,0,.16,.07,'square');tone(rare?1240:920,.17,.2,.07,'square')}
function soundImpact(rare){tone(rare?120:95,0,.5,.13,'sine',35);tone(rare?1500:1050,.04,.3,.055,'triangle',rare?2600:1800)}
function soundReveal(rare,legend){
  const notes=legend?[523,659,784,1047,1319,1568]:rare?[440,554,659,880,1109]:[330,392,494,659,784];
  notes.forEach((n,i)=>tone(n,i*.085,.28,legend?.075:.052,i%2?'triangle':'sine',n*1.03));
}

function installStyle(){
  if($(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
#realGachaOverlay.gcCinematic{overflow:hidden!important;isolation:isolate;background:radial-gradient(circle at 50% 42%,rgba(34,211,238,.22),transparent 24%),linear-gradient(180deg,#02030b,#07152c 58%,#010207)!important;perspective:1000px}
#realGachaOverlay.gcCinematic.gcRare{background:radial-gradient(circle at 50% 42%,rgba(250,204,21,.28),transparent 25%),linear-gradient(180deg,#080602,#211000 58%,#020100)!important}
.gcCinematicFx{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}
.gcGrid{position:absolute;left:-25%;right:-25%;bottom:-34%;height:76%;background:linear-gradient(rgba(56,189,248,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,.16) 1px,transparent 1px);background-size:40px 40px;transform:perspective(520px) rotateX(67deg);transform-origin:50% 100%;animation:gcGrid 1.6s linear infinite;opacity:.55}
.gcRare .gcGrid{background:linear-gradient(rgba(250,204,21,.17) 1px,transparent 1px),linear-gradient(90deg,rgba(250,204,21,.17) 1px,transparent 1px);background-size:40px 40px}
.gcRing{position:absolute;left:50%;top:49%;width:min(62vw,520px);aspect-ratio:1;border:2px solid rgba(125,211,252,.28);border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 50px rgba(56,189,248,.22),inset 0 0 45px rgba(56,189,248,.11);animation:gcSpin 2.7s linear infinite}
.gcRing:before,.gcRing:after{content:'';position:absolute;inset:10%;border:2px dashed rgba(255,255,255,.2);border-radius:50%;animation:gcSpinBack 3.2s linear infinite}.gcRing:after{inset:25%;border-style:solid;animation-duration:1.8s}
.gcRare .gcRing{border-color:rgba(253,224,71,.48);box-shadow:0 0 58px rgba(250,204,21,.28),inset 0 0 45px rgba(250,204,21,.12)}
.gcHud{position:absolute;top:max(20px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);width:min(700px,92vw);display:flex;justify-content:space-between;gap:12px;color:#c7f5ff;font:900 11px ui-monospace,monospace;letter-spacing:.14em;text-shadow:0 0 14px #38bdf8;z-index:10}.gcRare .gcHud{color:#fff1a8;text-shadow:0 0 14px #facc15}
.gcHud span{padding:8px 10px;border:1px solid currentColor;background:rgba(2,6,23,.62)}
.gcStatus{position:absolute;left:50%;bottom:max(28px,calc(env(safe-area-inset-bottom) + 18px));transform:translateX(-50%);min-width:min(450px,86vw);padding:10px 14px;text-align:center;color:#e0f8ff;font:1000 clamp(12px,2.6vw,16px) ui-monospace,monospace;letter-spacing:.2em;text-shadow:0 0 14px #38bdf8;background:linear-gradient(90deg,transparent,rgba(2,15,34,.8),transparent);z-index:12}.gcRare .gcStatus{color:#fff4bd;text-shadow:0 0 15px #f59e0b}.gcStatus.alert{animation:gcAlert .14s steps(2) 7;color:#fff}
.gcWarning{position:absolute;inset:0;display:grid;place-items:center;opacity:0;color:#e9fbff;font:1000 clamp(32px,8vw,78px) ui-monospace,monospace;letter-spacing:.12em;text-align:center;text-shadow:0 0 16px #fff,0 0 42px #38bdf8;z-index:15}.gcRare .gcWarning{text-shadow:0 0 16px #fff,0 0 45px #facc15,0 0 80px #ea580c}.gcWarning.show{animation:gcWarning .9s ease both}
.gcFlash{position:absolute;inset:0;background:#fff;opacity:0;z-index:30}.gcFlash.fire{animation:gcFlash .55s ease-out both}
.gcShock{position:absolute;left:50%;top:52%;width:44px;height:44px;border:4px solid #dff8ff;border-radius:50%;transform:translate(-50%,-50%) scale(.1);opacity:0;z-index:18}.gcRare .gcShock{border-color:#fff4ae}.gcShock.fire{animation:gcShock .9s cubic-bezier(.1,.75,.2,1) both}
.gcBurst i{position:absolute;left:50%;top:50%;width:6px;height:6px;border-radius:50%;background:#e0f8ff;box-shadow:0 0 12px #38bdf8;opacity:0}.gcRare .gcBurst i{background:#fff1a8;box-shadow:0 0 12px #facc15}.gcBurst.fire i{animation:gcParticle var(--d) cubic-bezier(.05,.75,.15,1) both;animation-delay:var(--delay)}
.gcLegend{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.4);opacity:0;width:min(850px,94vw);padding:26px 8px;text-align:center;color:#fff;font:1000 clamp(38px,10vw,98px)/.9 system-ui;letter-spacing:.06em;text-shadow:0 0 14px #fff,0 0 34px #fde047,0 0 78px #f59e0b;z-index:40}.gcLegend.show{animation:gcLegend .9s cubic-bezier(.15,1.25,.25,1) both}
#realGachaOverlay.gcCinematic.gcCharge #realGachaMachineWrap{animation:gcCharge .18s linear infinite}#realGachaOverlay.gcCinematic.gcImpact{animation:gcImpact .34s ease-out}
#realGachaOverlay.gcCinematic #realGachaResult.gcReveal{animation:gcReveal .62s cubic-bezier(.12,1.25,.25,1) both;filter:drop-shadow(0 0 30px rgba(56,189,248,.55))}#realGachaOverlay.gcCinematic.gcRare #realGachaResult.gcReveal{filter:drop-shadow(0 0 34px rgba(250,204,21,.7))}
@keyframes gcGrid{to{background-position:0 40px,40px 0}}@keyframes gcSpin{to{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes gcSpinBack{to{transform:rotate(-360deg)}}@keyframes gcAlert{50%{opacity:.2}}@keyframes gcWarning{0%,100%{opacity:0;transform:scale(.75)}35%,70%{opacity:1;transform:scale(1)}}@keyframes gcFlash{0%{opacity:0}12%{opacity:1}100%{opacity:0}}@keyframes gcShock{0%{opacity:1;transform:translate(-50%,-50%) scale(.1)}100%{opacity:0;transform:translate(-50%,-50%) scale(18)}}@keyframes gcParticle{0%{opacity:1;transform:translate(-50%,-50%) rotate(var(--a)) translateX(0)}100%{opacity:0;transform:translate(-50%,-50%) rotate(var(--a)) translateX(var(--r)) scale(.2)}}@keyframes gcLegend{0%{opacity:0;transform:translate(-50%,-50%) scale(.4)}55%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}@keyframes gcCharge{25%{transform:translate(2px,-1px)}50%{transform:translate(-2px,1px)}75%{transform:translate(1px,2px)}}@keyframes gcImpact{20%{transform:translate(7px,-4px)}45%{transform:translate(-6px,4px)}70%{transform:translate(4px,2px)}}@keyframes gcReveal{0%{opacity:0;transform:scale(.55) rotateX(20deg)}100%{opacity:1;transform:scale(1) rotateX(0)}}
@media(max-width:700px){.gcHud{font-size:9px}.gcRing{width:min(88vw,440px)}.gcStatus{bottom:max(18px,env(safe-area-inset-bottom));letter-spacing:.12em}}
@media(prefers-reduced-motion:reduce){.gcGrid,.gcRing,.gcRing:before,.gcRing:after{animation:none!important}}
`;
  document.head.appendChild(s);
}

function cleanup(){
  runToken++;clearTimers();
  $(FX_ID)?.remove();
  const o=$('realGachaOverlay');
  if(o)o.classList.remove('gcCinematic','gcRare','gcCharge','gcImpact');
  $('realGachaResult')?.classList.remove('gcReveal');
}
function buildFx(rare){
  $(FX_ID)?.remove();
  const fx=document.createElement('div');fx.id=FX_ID;fx.className='gcCinematicFx';
  const count=lowPower()?18:42;
  const particles=Array.from({length:count},(_,i)=>`<i style="--a:${i*360/count}deg;--r:${130+Math.random()*260}px;--d:${.65+Math.random()*.65}s;--delay:${Math.random()*.13}s"></i>`).join('');
  fx.innerHTML=`<div class="gcGrid"></div><div class="gcRing"></div><div class="gcHud"><span>${rare?'GOLD CAPSULE // RARE CHANNEL':'CAPSULE SYSTEM // STANDARD'}</span><span class="gcSync">SYNC 00%</span></div><div class="gcWarning">${rare?'GOLD SIGNAL':'CAPSULE DROP'}</div><div class="gcFlash"></div><div class="gcShock"></div><div class="gcBurst">${particles}</div><div class="gcLegend">LEGEND JACKPOT</div><div class="gcStatus">SYSTEM START</div>`;
  $('realGachaOverlay')?.prepend(fx);return fx;
}
function setStatus(text,alert=false){const el=document.querySelector(`#${FX_ID} .gcStatus`);if(!el)return;el.textContent=text;el.classList.toggle('alert',alert)}
function setSync(n){const el=document.querySelector(`#${FX_ID} .gcSync`);if(el)el.textContent=`SYNC ${String(n).padStart(2,'0')}%`}
function fire(sel){const el=document.querySelector(`#${FX_ID} ${sel}`);if(!el)return;el.classList.remove('fire');void el.offsetWidth;el.classList.add('fire')}

function beginCinematic(rare){
  cleanup();installStyle();
  const token=++runToken,o=$('realGachaOverlay');if(!o)return;
  o.classList.add('gcCinematic');o.classList.toggle('gcRare',rare);
  const fx=buildFx(rare);soundCharge(rare);setSync(10);setStatus(rare?'AUREUM CORE AUTHORIZATION...':'CAPSULE CORE ONLINE...');
  later(()=>{if(token!==runToken)return;o.classList.add('gcCharge');setSync(38);setStatus('ENERGY CHARGING...')},430);
  later(()=>{if(token!==runToken)return;setSync(67);setStatus(rare?'RARE FREQUENCY DETECTED...':'CAPSULE SYNCHRONIZING...')},1050);
  later(()=>{if(token!==runToken)return;setSync(92);setStatus(rare?'WARNING // GOLD SIGNAL':'LOCK-ON COMPLETE',true);fx.querySelector('.gcWarning')?.classList.add('show');soundWarning(rare);vibrate(rare?[35,30,55]:[30])},1720);
  later(()=>{if(token!==runToken)return;o.classList.remove('gcCharge');o.classList.add('gcImpact');setSync(100);setStatus('CAPSULE LAUNCH',true);fire('.gcFlash');fire('.gcShock');soundImpact(rare);vibrate(rare?[80,35,130]:[65])},2700);
  later(()=>{if(token!==runToken)return;fire('.gcBurst')},3200);
  later(()=>{
    if(token!==runToken)return;o.classList.remove('gcImpact');
    const result=$('realGachaResult');result?.classList.add('gcReveal');
    const text=$('realResultReward')?.textContent||'';const legend=/LEGEND JACKPOT/i.test(text);
    if(legend){fx.querySelector('.gcLegend')?.classList.add('show');fire('.gcFlash');fire('.gcShock');later(()=>fire('.gcBurst'),120);vibrate([120,50,170,50,240])}
    setStatus(legend?'ULTIMATE REWARD UNLOCKED':rare?'GOLD REWARD UNLOCKED':'REWARD UNLOCKED',true);soundReveal(rare,legend);
  },3650);
}

function install(){
  if(window.__shookingGachaCinematicInstalled)return true;
  if(typeof window.startRealGacha!=='function'||typeof window.normalGacha!=='function'||typeof window.rareGacha!=='function')return false;
  window.__shookingGachaCinematicInstalled=true;
  const originalStart=window.startRealGacha,originalClose=typeof window.closeRealGacha==='function'?window.closeRealGacha:null;
  function cinematicStart(rare){
    const cost=rare?250:80;
    const canRun=window.player&&Number(window.player.coins)>=cost&&!!$('realGachaOverlay');
    originalStart.call(window,rare);
    if(canRun&&$('realGachaOverlay')?.style.display!=='none')beginCinematic(!!rare);
  }
  window.startRealGacha=cinematicStart;window.normalGacha=()=>cinematicStart(false);window.rareGacha=()=>cinematicStart(true);
  window.closeRealGacha=function(){cleanup();if(originalClose)return originalClose.apply(this,arguments);const o=$('realGachaOverlay');if(o)o.style.display='none';if(typeof window.updateStats==='function')window.updateStats()};
  return true;
}

installStyle();
if(!install()){let tries=0;const id=setInterval(()=>{tries++;if(install()||tries>80)clearInterval(id)},100)}
})();
