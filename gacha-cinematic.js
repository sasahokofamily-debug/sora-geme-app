(()=>{
'use strict';

const STYLE_ID='shookingGachaCinematicStyle';
const FX_ID='shookingGachaCinematicFx';
const timers=new Set();
let audioCtx=null;
let runToken=0;

function later(fn,ms){
  const id=setTimeout(()=>{timers.delete(id);fn()},ms);
  timers.add(id);
  return id;
}
function clearTimers(){
  timers.forEach(clearTimeout);
  timers.clear();
}
function $(id){return document.getElementById(id)}
function lowPower(){
  return matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=2);
}

function installStyle(){
  if($(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
#realGachaOverlay.gcCinematic{
  overflow:hidden!important;
  isolation:isolate;
  background:
    radial-gradient(circle at 50% 46%,rgba(17,76,118,.48),transparent 24%),
    radial-gradient(circle at 50% 120%,rgba(20,36,78,.7),transparent 52%),
    linear-gradient(180deg,#02030b 0%,#050b1d 50%,#010207 100%)!important;
  perspective:1100px;
}
#realGachaOverlay.gcCinematic.gcRare{
  background:
    radial-gradient(circle at 50% 43%,rgba(250,204,21,.24),transparent 23%),
    radial-gradient(circle at 50% 110%,rgba(180,83,9,.42),transparent 48%),
    linear-gradient(180deg,#080602 0%,#170d02 52%,#030201 100%)!important;
}
#realGachaOverlay.gcCinematic.gcLegend{
  background:
    radial-gradient(circle at 50% 42%,rgba(255,255,255,.38),transparent 18%),
    radial-gradient(circle at 50% 50%,rgba(250,204,21,.36),transparent 37%),
    linear-gradient(180deg,#090602,#271500 54%,#030201)!important;
}
.gcCinematicFx{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden;isolation:isolate}
.gcCinematicFx .gcVignette{position:absolute;inset:-8%;box-shadow:inset 0 0 150px 65px rgba(0,0,0,.8);z-index:20}
.gcCinematicFx .gcGrid{position:absolute;left:-30%;right:-30%;bottom:-36%;height:78%;background:linear-gradient(rgba(56,189,248,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,.18) 1px,transparent 1px);background-size:42px 42px;transform:perspective(540px) rotateX(67deg);transform-origin:50% 100%;animation:gcGridMove 1.8s linear infinite;mask-image:linear-gradient(to top,#000,transparent 83%);opacity:.48}
.gcRare .gcCinematicFx .gcGrid{background:linear-gradient(rgba(250,204,21,.17) 1px,transparent 1px),linear-gradient(90deg,rgba(250,204,21,.17) 1px,transparent 1px);background-size:42px 42px}
.gcCinematicFx .gcNebula{position:absolute;left:50%;top:50%;width:min(72vw,650px);aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%) scale(.72);background:conic-gradient(from 0deg,transparent,rgba(34,211,238,.25),transparent 23%,rgba(99,102,241,.3),transparent 51%,rgba(56,189,248,.25),transparent 76%);filter:blur(22px);animation:gcNebulaSpin 5s linear infinite,gcNebulaPulse 1.1s ease-in-out infinite alternate;opacity:.72}
.gcRare .gcCinematicFx .gcNebula{background:conic-gradient(from 0deg,transparent,rgba(250,204,21,.32),transparent 22%,rgba(249,115,22,.23),transparent 51%,rgba(255,255,255,.25),transparent 76%)}
.gcCinematicFx .gcRing{position:absolute;left:50%;top:49%;width:min(61vw,520px);aspect-ratio:1;border-radius:50%;border:1px solid rgba(125,211,252,.32);transform:translate(-50%,-50%);box-shadow:0 0 35px rgba(56,189,248,.2),inset 0 0 35px rgba(56,189,248,.12);animation:gcRing 2.5s linear infinite}
.gcCinematicFx .gcRing:before,.gcCinematicFx .gcRing:after{content:'';position:absolute;border-radius:50%;inset:9%;border:2px dashed rgba(125,211,252,.22);animation:gcRingReverse 3.2s linear infinite}.gcCinematicFx .gcRing:after{inset:22%;border-style:solid;border-color:rgba(255,255,255,.12);animation-duration:1.9s}
.gcRare .gcCinematicFx .gcRing{border-color:rgba(253,224,71,.48);box-shadow:0 0 44px rgba(250,204,21,.24),inset 0 0 40px rgba(250,204,21,.16)}.gcRare .gcCinematicFx .gcRing:before{border-color:rgba(253,224,71,.34)}
.gcCinematicFx .gcHud{position:absolute;left:50%;top:max(22px,env(safe-area-inset-top));transform:translateX(-50%);width:min(720px,92vw);display:flex;justify-content:space-between;align-items:flex-start;gap:12px;color:#b9efff;font:900 11px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.14em;text-shadow:0 0 14px #38bdf8;z-index:25}
.gcRare .gcCinematicFx .gcHud{color:#fff3a3;text-shadow:0 0 15px #facc15}
.gcHudBlock{padding:8px 10px;border:1px solid rgba(125,211,252,.34);background:rgba(2,6,23,.52);clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));backdrop-filter:blur(6px)}
.gcRare .gcHudBlock{border-color:rgba(253,224,71,.42);background:rgba(30,18,2,.58)}
.gcCinematicFx .gcStatus{position:absolute;left:50%;bottom:max(34px,calc(env(safe-area-inset-bottom) + 24px));transform:translateX(-50%);min-width:min(420px,82vw);padding:10px 18px;border-top:1px solid rgba(125,211,252,.55);border-bottom:1px solid rgba(125,211,252,.24);background:linear-gradient(90deg,transparent,rgba(3,15,33,.78),transparent);text-align:center;color:#d9f7ff;font:1000 clamp(12px,2.3vw,16px)/1 ui-monospace,monospace;letter-spacing:.24em;text-shadow:0 0 14px #38bdf8;z-index:26;transition:color .16s,transform .16s,filter .16s}
.gcRare .gcCinematicFx .gcStatus{color:#fff4bd;border-color:rgba(253,224,71,.42);text-shadow:0 0 14px #f59e0b}
.gcStatus.gcAlert{color:#fff!important;transform:translateX(-50%) scale(1.08);filter:brightness(1.8);animation:gcStatusAlert .15s steps(2) 6}
.gcCinematicFx .gcScan{position:absolute;left:0;right:0;top:-12%;height:12%;background:linear-gradient(180deg,transparent,rgba(125,211,252,.03),rgba(125,211,252,.55),rgba(255,255,255,.75),transparent);mix-blend-mode:screen;filter:blur(.5px);animation:gcScan 1.7s linear infinite;opacity:.65}
.gcRare .gcCinematicFx .gcScan{background:linear-gradient(180deg,transparent,rgba(250,204,21,.03),rgba(250,204,21,.5),rgba(255,255,255,.82),transparent)}
.gcCinematicFx .gcFlash{position:absolute;inset:0;background:#fff;opacity:0;z-index:40;mix-blend-mode:screen}
.gcCinematicFx .gcFlash.fire{animation:gcFlash .56s ease-out both}
.gcCinematicFx .gcShock{position:absolute;left:50%;top:52%;width:40px;height:40px;border:4px solid #d8f7ff;border-radius:50%;transform:translate(-50%,-50%) scale(.1);opacity:0;box-shadow:0 0 30px #38bdf8;z-index:18}.gcCinematicFx .gcShock.fire{animation:gcShock .85s cubic-bezier(.1,.72,.2,1) both}
.gcRare .gcCinematicFx .gcShock{border-color:#fff5b8;box-shadow:0 0 36px #facc15}
.gcCinematicFx .gcWarning{position:absolute;inset:0;display:grid;place-items:center;opacity:0;z-index:30;color:#e7fbff;font:1000 clamp(26px,7vw,72px)/1 ui-monospace,monospace;letter-spacing:.16em;text-align:center;text-shadow:0 0 12px #fff,0 0 35px #38bdf8,0 0 65px #2563eb}.gcCinematicFx .gcWarning.show{animation:gcWarning .95s ease both}
.gcRare .gcCinematicFx .gcWarning{color:#fff9c7;text-shadow:0 0 12px #fff,0 0 35px #facc15,0 0 70px #ea580c}
.gcCinematicFx .gcLightning{position:absolute;inset:0;opacity:0;z-index:16}.gcCinematicFx .gcLightning.show{opacity:1}
.gcLightning i{position:absolute;left:50%;top:48%;width:2px;height:55vh;transform-origin:50% 0;background:linear-gradient(#fff,#7dd3fc 25%,transparent 86%);box-shadow:0 0 7px #fff,0 0 18px #38bdf8;clip-path:polygon(0 0,100% 0,62% 16%,100% 28%,42% 45%,86% 57%,30% 77%,50% 100%,0 100%,18% 76%,0 60%,54% 44%,10% 27%,46% 13%);animation:gcLightning .16s steps(2) infinite alternate}.gcRare .gcLightning i{background:linear-gradient(#fff,#fde047 30%,transparent 86%);box-shadow:0 0 8px #fff,0 0 20px #facc15}
.gcCinematicFx .gcStreaks{position:absolute;inset:0;z-index:6}.gcStreaks i{position:absolute;left:50%;top:50%;width:var(--w);height:2px;background:linear-gradient(90deg,transparent,#e0f2fe);transform-origin:0 50%;transform:rotate(var(--a)) translateX(var(--r));opacity:0;box-shadow:0 0 8px #38bdf8}.gcRare .gcStreaks i{background:linear-gradient(90deg,transparent,#fff7ae);box-shadow:0 0 8px #facc15}.gcStreaks.run i{animation:gcStreak var(--t) ease-in infinite;animation-delay:var(--delay)}
.gcCinematicFx .gcBurst{position:absolute;inset:0;z-index:35}.gcBurst i{position:absolute;left:50%;top:50%;width:6px;height:6px;border-radius:1px;background:#dff9ff;box-shadow:0 0 10px #38bdf8;opacity:0}.gcRare .gcBurst i{background:#fff5a8;box-shadow:0 0 12px #facc15}.gcBurst.fire i{animation:gcParticle var(--dur) cubic-bezier(.06,.72,.15,1) both;animation-delay:var(--delay)}
.gcCinematicFx .gcLegendBanner{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.45);opacity:0;z-index:45;width:min(820px,94vw);padding:26px 12px;text-align:center;color:#fff;font:1000 clamp(38px,10vw,96px)/.9 ui-sans-serif,system-ui;letter-spacing:.08em;text-shadow:0 2px 0 #a16207,0 0 12px #fff,0 0 30px #fde047,0 0 70px #f59e0b;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);border-top:2px solid rgba(255,255,255,.7);border-bottom:2px solid rgba(253,224,71,.8)}
.gcCinematicFx .gcLegendBanner.show{animation:gcLegend .95s cubic-bezier(.14,1.2,.22,1) both}
#realGachaOverlay.gcCinematic #realGachaMachineWrap{z-index:12!important;filter:drop-shadow(0 24px 30px rgba(0,0,0,.65));transition:transform .2s ease,filter .2s ease}
#realGachaOverlay.gcCinematic.gcCharge #realGachaMachineWrap{animation:gcMachineCharge .18s linear infinite}
#realGachaOverlay.gcCinematic.gcLaunch #realGachaMachineWrap{animation:gcMachineLaunch .62s cubic-bezier(.2,.8,.2,1) both}
#realGachaOverlay.gcCinematic #realMachineBody{box-shadow:0 0 22px rgba(56,189,248,.58),0 0 72px rgba(56,189,248,.24),inset 0 0 42px rgba(255,255,255,.08)!important}
#realGachaOverlay.gcCinematic.gcRare #realMachineBody{box-shadow:0 0 24px rgba(250,204,21,.72),0 0 78px rgba(245,158,11,.42),inset 0 0 42px rgba(255,255,255,.11)!important}
#realGachaOverlay.gcCinematic #realGachaResult{z-index:22!important;animation:gcResultBase .5s cubic-bezier(.12,1.08,.25,1) both}
#realGachaOverlay.gcCinematic #realGachaResult.gcReveal{animation:gcResultReveal .62s cubic-bezier(.12,1.28,.26,1) both;filter:drop-shadow(0 0 28px rgba(56,189,248,.48))}
#realGachaOverlay.gcCinematic.gcRare #realGachaResult.gcReveal{filter:drop-shadow(0 0 34px rgba(250,204,21,.62))}
#realGachaOverlay.gcCinematic.gcLegend #realGachaResult{filter:drop-shadow(0 0 46px rgba(250,204,21,.85)) brightness(1.12)}
#realGachaOverlay.gcCinematic.gcImpact{animation:gcScreenImpact .38s cubic-bezier(.2,.9,.2,1)}
@keyframes gcGridMove{to{background-position:0 42px,42px 0}}
@keyframes gcNebulaSpin{to{transform:translate(-50%,-50%) scale(.72) rotate(360deg)}}
@keyframes gcNebulaPulse{to{opacity:1;filter:blur(17px) brightness(1.25)}}
@keyframes gcRing{to{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes gcRingReverse{to{transform:rotate(-360deg)}}
@keyframes gcScan{to{top:112%}}
@keyframes gcStatusAlert{50%{opacity:.2}}
@keyframes gcFlash{0%{opacity:0}10%{opacity:1}35%{opacity:.7}100%{opacity:0}}
@keyframes gcShock{0%{opacity:1;transform:translate(-50%,-50%) scale(.1)}80%{opacity:.65}100%{opacity:0;transform:translate(-50%,-50%) scale(19)}}
@keyframes gcWarning{0%{opacity:0;transform:scale(1.7);filter:blur(8px)}18%,64%{opacity:1;transform:scale(1);filter:blur(0)}74%{opacity:.15}84%{opacity:1}100%{opacity:0;transform:scale(.94)}}
@keyframes gcLightning{from{opacity:.2;filter:brightness(1)}to{opacity:1;filter:brightness(2.5)}}
@keyframes gcStreak{0%{opacity:0;transform:rotate(var(--a)) translateX(var(--r)) scaleX(.1)}15%{opacity:.8}100%{opacity:0;transform:rotate(var(--a)) translateX(calc(var(--r) + 45vw)) scaleX(2.4)}}
@keyframes gcParticle{0%{opacity:1;transform:translate(-50%,-50%) rotate(0) translateX(10px) scale(1.5)}100%{opacity:0;transform:translate(-50%,-50%) rotate(var(--a)) translateX(var(--d)) rotate(220deg) scale(.25)}}
@keyframes gcLegend{0%{opacity:0;transform:translate(-50%,-50%) scale(2.1);filter:blur(12px)}22%{opacity:1;transform:translate(-50%,-50%) scale(.9);filter:blur(0)}46%{transform:translate(-50%,-50%) scale(1.05)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.16)}}
@keyframes gcMachineCharge{0%{transform:translate(0,0) rotate(0)}25%{transform:translate(-2px,1px) rotate(-.25deg)}50%{transform:translate(1px,-1px) rotate(.22deg)}75%{transform:translate(2px,1px) rotate(.15deg)}}
@keyframes gcMachineLaunch{0%{transform:translateY(0) scale(1)}20%{transform:translateY(7px) scale(.98)}42%{transform:translateY(-13px) scale(1.03)}100%{transform:translateY(0) scale(1)}}
@keyframes gcScreenImpact{0%{transform:translate(0,0)}18%{transform:translate(-7px,2px)}34%{transform:translate(7px,-3px)}52%{transform:translate(-4px,-2px)}70%{transform:translate(3px,2px)}100%{transform:translate(0,0)}}
@keyframes gcResultBase{from{opacity:0;transform:scale(.84)}to{opacity:1;transform:scale(1)}}
@keyframes gcResultReveal{0%{opacity:0;transform:scale(.45) rotateX(16deg);filter:brightness(3)}55%{opacity:1;transform:scale(1.08) rotateX(0);filter:brightness(1.65)}100%{opacity:1;transform:scale(1);filter:brightness(1)}}
@media(max-width:700px){.gcCinematicFx .gcHud{font-size:9px;top:max(12px,env(safe-area-inset-top))}.gcHudBlock{padding:6px 7px}.gcCinematicFx .gcStatus{bottom:max(18px,calc(env(safe-area-inset-bottom) + 12px));letter-spacing:.14em}.gcCinematicFx .gcRing{width:min(108vw,520px)}.gcCinematicFx .gcNebula{width:min(116vw,650px)}}
@media(prefers-reduced-motion:reduce){.gcCinematicFx .gcGrid,.gcCinematicFx .gcNebula,.gcCinematicFx .gcRing,.gcCinematicFx .gcScan{animation-duration:5s!important}.gcLightning{display:none!important}#realGachaOverlay.gcCinematic.gcCharge #realGachaMachineWrap{animation:none!important}}
`;
  document.head.appendChild(s);
}

function getAudio(){
  const C=window.AudioContext||window.webkitAudioContext;
  if(!C)return null;
  try{
    if(!audioCtx)audioCtx=new C();
    if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
    return audioCtx;
  }catch{return null}
}
function tone(freq,when,dur,type='sine',gain=.025,endFreq){
  const c=getAudio();if(!c)return;
  const o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,c.currentTime+when);
  if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),c.currentTime+when+dur);
  g.gain.setValueAtTime(.0001,c.currentTime+when);
  g.gain.exponentialRampToValueAtTime(gain,c.currentTime+when+.015);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+when+dur);
  o.connect(g).connect(c.destination);o.start(c.currentTime+when);o.stop(c.currentTime+when+dur+.04);
}
function noise(when,dur,gain=.02,center=1300){
  const c=getAudio();if(!c)return;
  const n=Math.max(1,(c.sampleRate*dur)|0),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
  f.type='bandpass';f.frequency.value=center;f.Q.value=.7;g.gain.value=gain;
  src.buffer=b;src.connect(f).connect(g).connect(c.destination);src.start(c.currentTime+when);
}
function soundCharge(rare){
  tone(rare?72:58,0,1.8,'sine',.055,rare?42:32);
  [0,.24,.48,.72,1.0,1.3].forEach((t,i)=>tone((rare?300:220)+i*(rare?82:64),t,.13,i%2?'triangle':'sawtooth',.018,(rare?430:320)+i*100));
}
function soundWarning(rare){noise(0,.16,.035,rare?1900:1350);tone(rare?760:560,0,.42,'square',.022,rare?1450:980)}
function soundImpact(rare){noise(0,.38,.06,rare?800:560);tone(rare?110:82,0,.6,'sine',.075,32);tone(rare?1320:960,.03,.34,'triangle',.028,rare?2200:1600)}
function soundReveal(rare,legend){
  const notes=legend?[523,659,784,1047,1319,1568]:rare?[392,494,659,784,988]:[330,440,554,659];
  notes.forEach((n,i)=>tone(n,i*.08,.28,i%2?'triangle':'sine',legend?.034:.022,n*1.03));
  if(legend){noise(.04,.7,.035,2600);tone(1760,.18,.8,'sine',.025,3400)}
}

function particleMarkup(count){
  return Array.from({length:count},(_,i)=>{
    const a=(360/count*i)+(Math.random()*14-7);
    const d=90+Math.random()*Math.min(innerWidth*.45,310);
    const dur=.52+Math.random()*.52;
    const delay=Math.random()*.12;
    return `<i style="--a:${a}deg;--d:${d}px;--dur:${dur}s;--delay:${delay}s"></i>`;
  }).join('');
}
function streakMarkup(count){
  return Array.from({length:count},()=>{
    const a=Math.random()*360;
    const r=18+Math.random()*95;
    const w=30+Math.random()*90;
    const t=.45+Math.random()*.5;
    const delay=-Math.random()*t;
    return `<i style="--a:${a}deg;--r:${r}px;--w:${w}px;--t:${t}s;--delay:${delay}s"></i>`;
  }).join('');
}
function lightningMarkup(count){
  return Array.from({length:count},(_,i)=>`<i style="transform:rotate(${i*(360/count)+Math.random()*24}deg);height:${34+Math.random()*31}vh"></i>`).join('');
}

function buildFx(rare){
  $(FX_ID)?.remove();
  const root=document.createElement('div');
  root.id=FX_ID;root.className='gcCinematicFx';
  const lite=lowPower();
  root.innerHTML=`
    <div class="gcGrid"></div><div class="gcNebula"></div><div class="gcRing"></div><div class="gcScan"></div>
    <div class="gcStreaks">${streakMarkup(lite?12:24)}</div>
    <div class="gcLightning">${lightningMarkup(lite?4:7)}</div>
    <div class="gcShock"></div><div class="gcFlash"></div>
    <div class="gcBurst">${particleMarkup(lite?24:(rare?58:42))}</div>
    <div class="gcWarning">${rare?'GOLD SIGNAL<br>DETECTED':'ENERGY LOCK'}</div>
    <div class="gcLegendBanner">LEGEND<br>JACKPOT</div>
    <div class="gcHud"><div class="gcHudBlock">SHOO KING II<br>${rare?'GOLD SUMMON PROTOCOL':'CAPSULE SUMMON SYSTEM'}</div><div class="gcHudBlock">SYNC <span class="gcSync">12%</span><br>CORE ${rare?'AUREUM':'CYAN'}</div></div>
    <div class="gcStatus">SYSTEM INITIALIZING...</div><div class="gcVignette"></div>`;
  $('realGachaOverlay')?.prepend(root);
  return root;
}
function setStatus(text,alert=false){
  const el=document.querySelector(`#${FX_ID} .gcStatus`);if(!el)return;
  el.textContent=text;el.classList.toggle('gcAlert',alert);
  if(alert)later(()=>el.classList.remove('gcAlert'),1000);
}
function setSync(value){const el=document.querySelector(`#${FX_ID} .gcSync`);if(el)el.textContent=`${value}%`}
function fire(selector,cls='fire'){
  const el=document.querySelector(`#${FX_ID} ${selector}`);if(!el)return;
  el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);
}
function vibrate(pattern){try{navigator.vibrate?.(pattern)}catch{}}
function cleanupFx(){
  runToken++;clearTimers();
  const overlay=$('realGachaOverlay');
  overlay?.classList.remove('gcCinematic','gcRare','gcLegend','gcCharge','gcLaunch','gcImpact');
  $('realGachaResult')?.classList.remove('gcReveal');
  $(FX_ID)?.remove();
}

function beginCinematic(rare){
  const overlay=$('realGachaOverlay');
  if(!overlay)return;
  const token=++runToken;
  clearTimers();installStyle();
  overlay.classList.add('gcCinematic');
  overlay.classList.toggle('gcRare',rare);
  overlay.classList.remove('gcLegend','gcLaunch','gcImpact');
  const fx=buildFx(rare);
  requestAnimationFrame(()=>fx.querySelector('.gcStreaks')?.classList.add('run'));
  soundCharge(rare);
  setStatus(rare?'AUREUM CORE AUTHORIZATION...':'CAPSULE CORE ONLINE...');setSync(12);

  later(()=>{if(token!==runToken)return;overlay.classList.add('gcCharge');setStatus('ENERGY CHARGING...');setSync(37)},430);
  later(()=>{if(token!==runToken)return;setSync(64);setStatus(rare?'RARE FREQUENCY DETECTED...':'CAPSULE SYNCHRONIZING...')},1050);
  later(()=>{
    if(token!==runToken)return;
    setSync(91);setStatus(rare?'WARNING // GOLD SIGNAL','LOCK-ON COMPLETE',true);
    fx.querySelector('.gcWarning')?.classList.add('show');
    fx.querySelector('.gcLightning')?.classList.add('show');
    soundWarning(rare);vibrate(rare?[35,30,55]:[30]);
  },1720);
  later(()=>{
    if(token!==runToken)return;
    overlay.classList.remove('gcCharge');overlay.classList.add('gcLaunch');setSync(100);setStatus('CAPSULE LAUNCH',true);
    fire('.gcFlash');fire('.gcShock');soundImpact(rare);vibrate(rare?[80,35,130]:[65]);
  },2700);
  later(()=>{
    if(token!==runToken)return;
    overlay.classList.add('gcImpact');fire('.gcBurst');
  },3230);
  later(()=>{
    if(token!==runToken)return;
    overlay.classList.remove('gcLaunch','gcImpact');
    const result=$('realGachaResult');
    result?.classList.add('gcReveal');
    const text=$('realResultReward')?.textContent||'';
    const legend=/LEGEND JACKPOT/i.test(text);
    if(legend){
      overlay.classList.add('gcLegend');
      fx.querySelector('.gcLegendBanner')?.classList.add('show');
      fire('.gcFlash');fire('.gcShock');
      later(()=>fire('.gcBurst'),120);
      vibrate([120,50,170,50,240]);
    }
    setStatus(legend?'ULTIMATE REWARD UNLOCKED':rare?'GOLD REWARD UNLOCKED':'REWARD UNLOCKED',true);
    soundReveal(rare,legend);
  },3650);
}

function install(){
  if(window.__shookingGachaCinematicInstalled)return true;
  if(typeof window.startRealGacha!=='function'||typeof window.normalGacha!=='function'||typeof window.rareGacha!=='function')return false;
  window.__shookingGachaCinematicInstalled=true;
  const originalStart=window.startRealGacha;
  const originalClose=typeof window.closeRealGacha==='function'?window.closeRealGacha:null;

  function cinematicStart(rare){
    const cost=rare?250:80;
    const canRun=typeof window.player!=='undefined'&&Number(window.player.coins)>=cost&&!!$('realGachaOverlay');
    originalStart.call(window,rare);
    if(canRun&&$('realGachaOverlay')?.style.display!=='none')beginCinematic(!!rare);
  }

  window.startRealGacha=cinematicStart;
  window.normalGacha=()=>cinematicStart(false);
  window.rareGacha=()=>cinematicStart(true);
  window.closeRealGacha=function(){
    cleanupFx();
    if(originalClose)return originalClose.apply(this,arguments);
    const overlay=$('realGachaOverlay');if(overlay)overlay.style.display='none';
    if(typeof window.updateStats==='function')window.updateStats();
  };
  return true;
}

installStyle();
if(!install()){
  let tries=0;
  const id=setInterval(()=>{
    tries++;
    if(install()||tries>80)clearInterval(id);
  },100);
}
})();
