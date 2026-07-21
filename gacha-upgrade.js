(()=>{
'use strict';
if(window.ShooGachaUpgrade)return;

const $=id=>document.getElementById(id);
let audioCtx=null;
let revealTimer=null;

function getAudio(){
  const Ctx=window.AudioContext||window.webkitAudioContext;
  if(!Ctx)return null;
  if(!audioCtx)audioCtx=new Ctx();
  if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
  return audioCtx;
}

function tone(freq,start,duration,type='sine',gain=.06,endFreq=null){
  const ctx=getAudio();
  if(!ctx)return;
  const osc=ctx.createOscillator();
  const amp=ctx.createGain();
  osc.type=type;
  osc.frequency.setValueAtTime(freq,ctx.currentTime+start);
  if(endFreq)osc.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),ctx.currentTime+start+duration);
  amp.gain.setValueAtTime(.0001,ctx.currentTime+start);
  amp.gain.exponentialRampToValueAtTime(gain,ctx.currentTime+start+.015);
  amp.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+start+duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(ctx.currentTime+start);
  osc.stop(ctx.currentTime+start+duration+.03);
}

function noise(start,duration,gain=.035){
  const ctx=getAudio();
  if(!ctx)return;
  const length=Math.max(1,Math.floor(ctx.sampleRate*duration));
  const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);
  const src=ctx.createBufferSource();
  const filter=ctx.createBiquadFilter();
  const amp=ctx.createGain();
  filter.type='bandpass';filter.frequency.value=900;filter.Q.value=.8;
  amp.gain.value=gain;
  src.buffer=buffer;src.connect(filter).connect(amp).connect(ctx.destination);
  src.start(ctx.currentTime+start);
}

function playMachineSound(rare){
  const base=rare?180:140;
  tone(base,0,.24,'sawtooth',.045,base*1.5);
  tone(base*1.35,.42,.20,'square',.035,base*1.9);
  tone(base*1.7,.82,.20,'square',.04,base*2.4);
  tone(base*2.1,1.20,.24,'sawtooth',.045,base*3.2);
  noise(1.45,.35,.025);
  tone(rare?110:85,1.78,.42,'sine',.11,45);
}

function playRevealSound(rare,legend){
  noise(0,.18,.07);
  tone(rare?440:330,0,.18,'sawtooth',.07,rare?880:660);
  const notes=legend?[523,659,784,1047,1319]:rare?[440,554,659,880]:[392,494,587,784];
  notes.forEach((n,i)=>tone(n,.12+i*.11,.32,'triangle',rare?.07:.055,n*1.01));
  if(rare){tone(110,.08,.75,'sine',.09,55);tone(1760,.5,.45,'sine',.045,2200)}
}

function installStyle(){
  if($('gachaUpgradeStyle'))return;
  const style=document.createElement('style');
  style.id='gachaUpgradeStyle';
  style.textContent=`
  #realGachaOverlay .capsuleResultStage{display:flex;flex-direction:column;align-items:center;justify-content:center;width:min(520px,92vw);min-height:430px;position:relative;animation:gachaStageIn .4s ease-out both}
  #realGachaOverlay .capsuleReveal{position:relative;width:min(360px,82vw);height:250px;filter:drop-shadow(0 0 26px rgba(56,189,248,.65));animation:capsuleLand .65s cubic-bezier(.2,1.4,.35,1) both}
  #realGachaOverlay .capsuleReveal.gold{filter:drop-shadow(0 0 34px rgba(250,204,21,.82))}
  #realGachaOverlay .capsuleHalf{position:absolute;left:50%;width:300px;max-width:78vw;height:112px;transform:translateX(-50%);border:4px solid rgba(255,255,255,.72);background:linear-gradient(160deg,#38bdf8,#1d4ed8 62%,#0f172a);box-shadow:inset 0 0 22px rgba(255,255,255,.28);z-index:2}
  #realGachaOverlay .capsuleReveal.gold .capsuleHalf{background:linear-gradient(160deg,#fff7ae,#f59e0b 58%,#78350f)}
  #realGachaOverlay .capsuleTop{top:15px;border-radius:150px 150px 22px 22px;animation:capsuleTopOpen .72s .28s ease-out forwards;transform-origin:50% 100%}
  #realGachaOverlay .capsuleBottom{bottom:15px;border-radius:22px 22px 150px 150px;animation:capsuleBottomOpen .72s .28s ease-out forwards;transform-origin:50% 0}
  #realGachaOverlay .capsuleCore{position:absolute;inset:55px 14px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border-radius:28px;background:radial-gradient(circle,rgba(255,255,255,.98),rgba(125,249,255,.9) 42%,rgba(37,99,235,.78));color:#06111f;padding:18px;box-sizing:border-box;z-index:5;opacity:0;transform:scale(.5);animation:coreReveal .5s .72s cubic-bezier(.2,1.5,.35,1) forwards;box-shadow:0 0 42px rgba(125,249,255,.95)}
  #realGachaOverlay .capsuleReveal.gold .capsuleCore{background:radial-gradient(circle,#fff,#fde68a 42%,#f59e0b);box-shadow:0 0 55px rgba(250,204,21,.95)}
  #realGachaOverlay .capsuleRarity{font-size:13px;font-weight:1000;letter-spacing:.16em;margin-bottom:6px}
  #realGachaOverlay .capsuleRewardName{font-size:clamp(21px,6vw,31px);font-weight:1000;line-height:1.15}
  #realGachaOverlay .capsuleRewardDesc{font-size:14px;font-weight:800;margin-top:8px}
  #realGachaOverlay .capsuleClose{width:min(300px,76vw);margin-top:14px}
  #realGachaOverlay .capsuleParticles{position:absolute;inset:0;pointer-events:none;overflow:hidden}
  #realGachaOverlay .capsuleParticles i{position:absolute;left:50%;top:50%;width:7px;height:7px;border-radius:50%;background:white;box-shadow:0 0 12px currentColor;animation:particleBurst 1.2s ease-out both}
  @keyframes gachaStageIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
  @keyframes capsuleLand{0%{opacity:0;transform:translateY(-180px) rotate(-16deg) scale(.65)}70%{opacity:1;transform:translateY(12px) rotate(3deg) scale(1.05)}100%{transform:translateY(0) rotate(0) scale(1)}}
  @keyframes capsuleTopOpen{to{transform:translateX(-50%) translateY(-55px) rotate(-8deg)}}
  @keyframes capsuleBottomOpen{to{transform:translateX(-50%) translateY(48px) rotate(7deg)}}
  @keyframes coreReveal{to{opacity:1;transform:scale(1)}}
  @keyframes particleBurst{from{opacity:1;transform:translate(-50%,-50%) rotate(var(--a)) translateX(0) scale(1)}to{opacity:0;transform:translate(-50%,-50%) rotate(var(--a)) translateX(var(--d)) scale(.1)}}
  `;
  document.head.appendChild(style);
}

function reward(rare){
  const r=Math.random();
  if(rare){
    if(r<.28){player.damage+=.35;return ['レア攻撃コア','攻撃力 大アップ +35%',false]}
    if(r<.52){player.maxHp+=50;player.hp=player.maxHp;return ['黄金装甲','最大HP +50',false]}
    if(r<.76){player.fire+=.35;return ['高速連射機構','連射力 大アップ +35%',false]}
    if(r<.94){player.engine+=.4;return ['金色エンジン','エンジン 大強化 +40%',false]}
    player.coins+=1000;return ['LEGEND JACKPOT','超大当たり！1000コイン獲得',true];
  }
  if(r<.35){player.damage+=.12;return ['攻撃チップ','攻撃力 +12%',false]}
  if(r<.65){player.maxHp+=15;player.hp=player.maxHp;return ['装甲プレート','最大HP +15',false]}
  if(r<.88){player.fire+=.12;return ['連射モジュール','連射力 +12%',false]}
  player.engine+=.12;return ['小型エンジン','エンジン +12%',false];
}

function showCapsuleResult(rare,name,desc,legend){
  const overlay=$('realGachaOverlay');
  const wrap=$('realGachaMachineWrap');
  const old=$('realGachaResult');
  if(wrap)wrap.style.display='none';
  if(old)old.style.display='none';
  overlay.querySelector('.capsuleResultStage')?.remove();
  const stage=document.createElement('div');
  stage.className='capsuleResultStage';
  const particles=Array.from({length:18},(_,i)=>`<i style="--a:${i*20}deg;--d:${90+Math.random()*100}px;animation-delay:${.55+Math.random()*.25}s"></i>`).join('');
  stage.innerHTML=`<div class="capsuleReveal ${rare?'gold':''}"><div class="capsuleParticles">${particles}</div><div class="capsuleHalf capsuleTop"></div><div class="capsuleHalf capsuleBottom"></div><div class="capsuleCore"><div class="capsuleRarity">${legend?'LEGENDARY':rare?'GOLD RARE':'ITEM GET'}</div><div class="capsuleRewardName"></div><div class="capsuleRewardDesc"></div></div></div><button type="button" class="capsuleClose">受け取る</button>`;
  stage.querySelector('.capsuleRewardName').textContent=name;
  stage.querySelector('.capsuleRewardDesc').textContent=desc;
  stage.querySelector('.capsuleClose').addEventListener('click',()=>window.closeRealGacha?.());
  overlay.appendChild(stage);
  playRevealSound(rare,legend);
}

function start(rareFlag){
  installStyle();
  const rare=!!rareFlag;
  const cost=rare?250:80;
  if(typeof player==='undefined'||player.coins<cost){
    if(typeof showToast==='function')showToast('コインが足りません');
    const out=$('gachaResult');if(out)out.textContent='コインが足りません。';
    return;
  }
  player.coins-=cost;
  if(typeof saveData==='function')saveData();
  const overlay=$('realGachaOverlay'),machine=$('realMachineBody'),capsule=$('realFallingCapsule'),label=$('realGachaLabel'),wrap=$('realGachaMachineWrap'),old=$('realGachaResult');
  if(!overlay||!wrap)return;
  clearTimeout(revealTimer);
  overlay.querySelector('.capsuleResultStage')?.remove();
  overlay.style.display='flex';wrap.style.display='block';if(old)old.style.display='none';
  if(machine)machine.className=rare?'realMachineBody gold':'realMachineBody';
  if(capsule)capsule.className=rare?'realFallingCapsule gold':'realFallingCapsule';
  if(label)label.textContent=rare?'GOLD CAPSULE // SYSTEM READY':'CAPSULE DROP // SYSTEM READY';
  playMachineSound(rare);
  revealTimer=setTimeout(()=>{
    const [name,desc,legend]=reward(rare);
    if(typeof saveData==='function')saveData();
    if(typeof checkAchievements==='function')checkAchievements();
    const out=$('gachaResult');if(out)out.textContent=`${name}：${desc}`;
    showCapsuleResult(rare,name,desc,legend);
  },2350);
}

const oldClose=window.closeRealGacha;
window.startRealGacha=start;
window.normalGacha=()=>start(false);
window.rareGacha=()=>start(true);
window.closeRealGacha=()=>{
  clearTimeout(revealTimer);
  $('realGachaOverlay')?.querySelector('.capsuleResultStage')?.remove();
  if(typeof oldClose==='function')oldClose();
  else if($('realGachaOverlay'))$('realGachaOverlay').style.display='none';
  if(typeof updateStats==='function')updateStats();
};
window.ShooGachaUpgrade={start};
installStyle();
})();