(()=>{
'use strict';

const $=id=>document.getElementById(id);
let audioCtx=null;
let revealTimer=null;
let bindTimer=null;

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

function noise(start,duration,gain=.035,frequency=900){
  const ctx=getAudio();
  if(!ctx)return;
  const length=Math.max(1,Math.floor(ctx.sampleRate*duration));
  const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);
  const src=ctx.createBufferSource();
  const filter=ctx.createBiquadFilter();
  const amp=ctx.createGain();
  filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.8;
  amp.gain.value=gain;
  src.buffer=buffer;src.connect(filter).connect(amp).connect(ctx.destination);
  src.start(ctx.currentTime+start);
}

function playMachineSound(rare){
  const base=rare?190:145;
  tone(70,0,.55,'sine',.1,42);
  for(let i=0;i<8;i++){
    const t=.12+i*.18;
    tone(base+i*26,t,.09,i%2?'square':'sawtooth',.035,base+i*36);
    noise(t,.055,.018,rare?1300:1000);
  }
  tone(rare?520:410,1.62,.22,'triangle',.065,rare?1040:820);
  noise(1.82,.22,.08,480);
  tone(rare?105:82,1.84,.48,'sine',.13,38);
}

function playRevealSound(rare,legend){
  noise(0,.22,.09,1400);
  tone(95,0,.5,'sine',.12,42);
  const notes=legend?[523,659,784,1047,1319,1568]:rare?[440,554,659,880,1109]:[330,392,494,659];
  notes.forEach((n,i)=>tone(n,.08+i*.105,.34,i%2?'triangle':'sine',legend?.085:rare?.07:.055,n*1.015));
  if(rare||legend){
    tone(1760,.48,.55,'sine',.05,2500);
    noise(.58,.34,legend?.08:.045,2200);
  }
}

function installStyle(){
  let style=$('gachaUpgradeStyle');
  if(style)style.remove();
  style=document.createElement('style');
  style.id='gachaUpgradeStyle';
  style.textContent=`
  #realGachaOverlay{overflow:hidden}
  #realGachaOverlay .capsuleResultStage{display:flex;flex-direction:column;align-items:center;justify-content:center;width:min(540px,94vw);min-height:440px;position:relative;animation:gachaStageIn .4s ease-out both}
  #realGachaOverlay .capsuleReveal{position:relative;width:min(380px,86vw);height:270px;filter:drop-shadow(0 0 30px rgba(56,189,248,.78));animation:capsuleLand .7s cubic-bezier(.2,1.4,.35,1) both}
  #realGachaOverlay .capsuleReveal.gold{filter:drop-shadow(0 0 42px rgba(250,204,21,.92))}
  #realGachaOverlay .capsuleHalf{position:absolute;left:50%;width:320px;max-width:82vw;height:120px;transform:translateX(-50%);border:4px solid rgba(255,255,255,.82);background:linear-gradient(160deg,#67e8f9,#2563eb 58%,#0f172a);box-shadow:inset 0 0 28px rgba(255,255,255,.34);z-index:2}
  #realGachaOverlay .capsuleReveal.gold .capsuleHalf{background:linear-gradient(160deg,#fffbd1,#facc15 50%,#92400e)}
  #realGachaOverlay .capsuleTop{top:15px;border-radius:160px 160px 24px 24px;animation:capsuleTopOpen .78s .3s ease-out forwards;transform-origin:50% 100%}
  #realGachaOverlay .capsuleBottom{bottom:15px;border-radius:24px 24px 160px 160px;animation:capsuleBottomOpen .78s .3s ease-out forwards;transform-origin:50% 0}
  #realGachaOverlay .capsuleCore{position:absolute;inset:58px 12px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border-radius:30px;background:radial-gradient(circle,#fff 0,#a5f3fc 38%,#3b82f6 72%);color:#06111f;padding:18px;box-sizing:border-box;z-index:5;opacity:0;transform:scale(.45);animation:coreReveal .55s .78s cubic-bezier(.2,1.5,.35,1) forwards;box-shadow:0 0 50px rgba(125,249,255,.98)}
  #realGachaOverlay .capsuleReveal.gold .capsuleCore{background:radial-gradient(circle,#fff 0,#fde68a 42%,#f59e0b 76%);box-shadow:0 0 70px rgba(250,204,21,1)}
  #realGachaOverlay .capsuleRarity{font-size:13px;font-weight:1000;letter-spacing:.18em;margin-bottom:7px}
  #realGachaOverlay .capsuleRewardName{font-size:clamp(22px,6vw,33px);font-weight:1000;line-height:1.1}
  #realGachaOverlay .capsuleRewardDesc{font-size:14px;font-weight:900;margin-top:9px}
  #realGachaOverlay .capsuleClose{width:min(320px,80vw);margin-top:18px}
  #realGachaOverlay .capsuleParticles{position:absolute;inset:0;pointer-events:none;overflow:visible}
  #realGachaOverlay .capsuleParticles i{position:absolute;left:50%;top:50%;width:8px;height:8px;border-radius:50%;background:white;box-shadow:0 0 14px currentColor;animation:particleBurst 1.25s ease-out both}
  @keyframes gachaStageIn{from{opacity:0;transform:scale(.84)}to{opacity:1;transform:scale(1)}}
  @keyframes capsuleLand{0%{opacity:0;transform:translateY(-220px) rotate(-18deg) scale(.58)}68%{opacity:1;transform:translateY(14px) rotate(4deg) scale(1.07)}100%{transform:translateY(0) rotate(0) scale(1)}}
  @keyframes capsuleTopOpen{to{transform:translateX(-50%) translateY(-64px) rotate(-10deg)}}
  @keyframes capsuleBottomOpen{to{transform:translateX(-50%) translateY(56px) rotate(8deg)}}
  @keyframes coreReveal{to{opacity:1;transform:scale(1)}}
  @keyframes particleBurst{from{opacity:1;transform:translate(-50%,-50%) rotate(var(--a)) translateX(0) scale(1)}to{opacity:0;transform:translate(-50%,-50%) rotate(var(--a)) translateX(var(--d)) scale(.05)}}
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
  if(!overlay)return;
  const wrap=$('realGachaMachineWrap');
  const old=$('realGachaResult');
  if(wrap)wrap.style.display='none';
  if(old)old.style.display='none';
  overlay.querySelector('.capsuleResultStage')?.remove();
  const stage=document.createElement('div');
  stage.className='capsuleResultStage';
  const particles=Array.from({length:legend?34:rare?26:20},(_,i)=>`<i style="--a:${i*(360/(legend?34:rare?26:20))}deg;--d:${100+Math.random()*135}px;animation-delay:${.56+Math.random()*.28}s"></i>`).join('');
  stage.innerHTML=`<div class="capsuleReveal ${rare?'gold':''}"><div class="capsuleParticles">${particles}</div><div class="capsuleHalf capsuleTop"></div><div class="capsuleHalf capsuleBottom"></div><div class="capsuleCore"><div class="capsuleRarity">${legend?'LEGENDARY':rare?'GOLD RARE':'ITEM GET'}</div><div class="capsuleRewardName"></div><div class="capsuleRewardDesc"></div></div></div><button type="button" class="capsuleClose">受け取る</button>`;
  stage.querySelector('.capsuleRewardName').textContent=name;
  stage.querySelector('.capsuleRewardDesc').textContent=desc;
  stage.querySelector('.capsuleClose').addEventListener('click',close);
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
  if(label)label.textContent=rare?'GOLD CAPSULE // CHARGE MAX':'CAPSULE DROP // SYSTEM START';
  playMachineSound(rare);
  revealTimer=setTimeout(()=>{
    const [name,desc,legend]=reward(rare);
    if(typeof saveData==='function')saveData();
    if(typeof checkAchievements==='function')checkAchievements();
    const out=$('gachaResult');if(out)out.textContent=`${name}：${desc}`;
    showCapsuleResult(rare,name,desc,legend);
  },2250);
}

function close(){
  clearTimeout(revealTimer);
  const overlay=$('realGachaOverlay');
  overlay?.querySelector('.capsuleResultStage')?.remove();
  if(overlay)overlay.style.display='none';
  if(typeof updateStats==='function')updateStats();
}

function bindButtons(){
  window.startRealGacha=start;
  window.normalGacha=()=>start(false);
  window.rareGacha=()=>start(true);
  window.closeRealGacha=close;
  document.querySelectorAll('button[onclick]').forEach(button=>{
    const code=button.getAttribute('onclick')||'';
    if(/\bnormalGacha\s*\(/.test(code)){
      button.removeAttribute('onclick');
      if(!button.dataset.gachaUpgradeBound){button.addEventListener('click',()=>start(false));button.dataset.gachaUpgradeBound='1'}
    }else if(/\brareGacha\s*\(/.test(code)){
      button.removeAttribute('onclick');
      if(!button.dataset.gachaUpgradeBound){button.addEventListener('click',()=>start(true));button.dataset.gachaUpgradeBound='1'}
    }
  });
}

window.ShooGachaUpgrade={start,close,bindButtons,version:'2'};
installStyle();
bindButtons();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindButtons,{once:true});
clearInterval(bindTimer);
bindTimer=setInterval(bindButtons,1000);
setTimeout(()=>clearInterval(bindTimer),15000);
})();