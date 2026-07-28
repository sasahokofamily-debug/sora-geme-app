(()=>{
'use strict';
const VERSION='login-failure-effect-v3-rocket';
let audioContext=null;
let lastFailureText='';
let lastFailureAt=0;
let effectRunning=false;

const style=document.createElement('style');
style.textContent=`
#shooCoreMark{overflow:visible}
#shooCoreMark.shooShipDestroyed .shooCoreShip{opacity:0!important;transform:scale(.5)!important;filter:brightness(4) drop-shadow(0 0 24px #fff)!important}
#shooCoreMark.shooShipDestroyed .shooCoreOuter{animation:shooCoreDamageRing .42s ease-out 2!important;border-color:#fb7185!important;box-shadow:0 0 34px rgba(239,68,68,.6)!important}
#shooLoginFrame.shooLoginDamage{animation:shooLoginDamageShake .48s cubic-bezier(.36,.07,.19,.97)}
#shooShipBreakLayer,#shooHostileAttackLayer{position:absolute;inset:0;z-index:8;pointer-events:none;overflow:visible}
.shooHostileCraft{position:absolute;right:-138px;top:50%;width:92px;height:55px;opacity:0;transform:translate(95px,-50%) scale(.82);transition:opacity .25s ease,transform .55s cubic-bezier(.2,.85,.2,1);filter:drop-shadow(0 0 13px rgba(248,113,113,.8))}
#shooHostileAttackLayer.approach .shooHostileCraft{opacity:1;transform:translate(0,-50%) scale(1)}
.shooHostileBody{position:absolute;inset:7px 7px 8px 9px;clip-path:polygon(0 48%,24% 14%,67% 0,100% 27%,84% 55%,100% 80%,62% 100%,22% 86%);background:linear-gradient(145deg,#fecaca,#ef4444 42%,#7f1d1d 72%,#210609);border:1px solid rgba(255,255,255,.46);box-shadow:inset 0 0 13px rgba(255,255,255,.18)}
.shooHostileEye{position:absolute;left:33px;top:20px;width:17px;height:9px;border-radius:50%;background:#fff7ad;box-shadow:0 0 11px #facc15,0 0 22px #ef4444}
.shooRocketLauncher{position:absolute;left:-13px;top:22px;width:35px;height:12px;border:2px solid #fca5a5;border-radius:8px 2px 2px 8px;background:linear-gradient(#64748b,#111827);box-shadow:0 0 10px rgba(239,68,68,.6)}
.shooRocketLauncher::after{content:"";position:absolute;left:-8px;top:2px;width:9px;height:4px;background:#fb7185;box-shadow:0 0 8px #ef4444}
.shooHostileLabel{position:absolute;left:3px;right:0;top:-17px;color:#fb7185;font:1000 8px/1 ui-monospace,monospace;letter-spacing:.13em;text-align:center;text-shadow:0 0 7px #7f1d1d}
.shooTargetLock{position:absolute;left:50%;top:50%;width:72px;height:72px;margin:-36px;border:1px solid rgba(248,113,113,.7);border-radius:50%;opacity:0;transform:scale(1.35);transition:.28s ease;box-shadow:0 0 20px rgba(239,68,68,.22)}
.shooTargetLock::before,.shooTargetLock::after{content:"";position:absolute;left:50%;top:50%;background:#fb7185;box-shadow:0 0 8px #ef4444;transform:translate(-50%,-50%)}
.shooTargetLock::before{width:108%;height:1px}.shooTargetLock::after{width:1px;height:108%}
#shooHostileAttackLayer.lock .shooTargetLock{opacity:1;transform:scale(1);animation:shooLockPulse .48s ease-in-out infinite alternate}
.shooLoginRocket{position:absolute;right:-49px;top:50%;width:43px;height:13px;margin-top:-7px;opacity:0;z-index:11;filter:drop-shadow(0 0 8px #f97316)}
.shooLoginRocket::before{content:"";position:absolute;left:0;top:1px;width:32px;height:11px;clip-path:polygon(0 18%,72% 18%,100% 50%,72% 82%,0 82%,18% 50%);background:linear-gradient(90deg,#475569,#f8fafc 54%,#fb7185);border-radius:5px}
.shooLoginRocket::after{content:"";position:absolute;right:31px;top:2px;width:34px;height:9px;background:linear-gradient(90deg,transparent,#f97316,#fff7ad);clip-path:polygon(0 50%,100% 0,78% 50%,100% 100%);filter:blur(.4px)}
#shooHostileAttackLayer.fire .shooLoginRocket{opacity:1;animation:shooRocketFlight .68s cubic-bezier(.22,.72,.28,1) forwards}
.shooShipFragment{position:absolute;left:50%;top:50%;width:34px;height:42px;margin:-21px 0 0 -17px;background:linear-gradient(145deg,#f8fafc 0 22%,#67e8f9 23% 58%,#2563eb 59% 100%);border:1px solid rgba(255,255,255,.55);box-shadow:0 0 12px rgba(56,189,248,.75);clip-path:var(--clip);animation:shooShipFragmentFly var(--dur) cubic-bezier(.16,.72,.24,1) forwards;animation-delay:var(--delay)}
.shooShipSpark{position:absolute;left:50%;top:50%;width:6px;height:22px;margin:-11px 0 0 -3px;border-radius:999px;background:linear-gradient(#fff,#fde047,#f97316,transparent);box-shadow:0 0 10px #fb923c;transform-origin:center bottom;animation:shooShipSparkFly .72s ease-out forwards;animation-delay:var(--delay)}
.shooShipSmoke{position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px;border-radius:50%;background:radial-gradient(circle,rgba(148,163,184,.72),rgba(71,85,105,.34) 52%,transparent 72%);filter:blur(2px);animation:shooShipSmokeRise 1.25s ease-out forwards}
.shooShipFlash{position:absolute;left:50%;top:50%;width:28px;height:28px;margin:-14px;border-radius:50%;background:#fff;box-shadow:0 0 12px #fff,0 0 34px #facc15,0 0 62px #ef4444;animation:shooShipFlash .34s ease-out forwards}
.shooFailureStamp{position:absolute;left:50%;top:50%;z-index:12;transform:translate(-50%,-50%) rotate(-7deg) scale(.7);padding:8px 12px;border:2px solid #fb7185;border-radius:8px;background:rgba(69,10,10,.92);color:#fecaca;font:1000 10px/1 ui-monospace,monospace;letter-spacing:.14em;box-shadow:0 0 24px rgba(239,68,68,.65);opacity:0;animation:shooFailureStampIn 1.55s ease forwards}
@keyframes shooRocketFlight{0%{transform:translateX(0) rotate(0);opacity:1}70%{opacity:1}100%{transform:translateX(-145px) rotate(-4deg);opacity:0}}
@keyframes shooLockPulse{from{filter:brightness(.8);transform:scale(.94)}to{filter:brightness(1.45);transform:scale(1.04)}}
@keyframes shooShipFragmentFly{0%{opacity:1;transform:translate(0,0) rotate(0) scale(1)}65%{opacity:1;transform:translate(var(--dx),var(--dy)) rotate(var(--rot)) scale(.92)}100%{opacity:0;transform:translate(var(--dx),calc(var(--dy) + 28px)) rotate(var(--rot)) scale(.55)}}
@keyframes shooShipSparkFly{0%{opacity:1;transform:rotate(var(--rot)) translateY(-8px) scaleY(1)}100%{opacity:0;transform:rotate(var(--rot)) translateY(-86px) scaleY(.2)}}
@keyframes shooShipSmokeRise{0%{opacity:.9;transform:scale(.55)}100%{opacity:0;transform:translateY(-72px) scale(2.4)}}
@keyframes shooShipFlash{0%{opacity:1;transform:scale(.35)}100%{opacity:0;transform:scale(3.2)}}
@keyframes shooFailureStampIn{0%{opacity:0;transform:translate(-50%,-50%) rotate(-7deg) scale(.6)}18%,70%{opacity:1;transform:translate(-50%,-50%) rotate(-7deg) scale(1)}100%{opacity:0;transform:translate(-50%,-62%) rotate(-7deg) scale(.94)}}
@keyframes shooLoginDamageShake{0%,100%{transform:none}12%{transform:translate(-7px,2px)}25%{transform:translate(6px,-3px)}38%{transform:translate(-5px,1px)}52%{transform:translate(4px,2px)}70%{transform:translate(-2px,-1px)}}
@keyframes shooCoreDamageRing{0%{transform:scale(1);opacity:1}100%{transform:scale(1.18);opacity:.3}}
@media(max-width:780px),(pointer:coarse){.shooHostileCraft{right:-90px;transform:translate(70px,-50%) scale(.7)}#shooHostileAttackLayer.approach .shooHostileCraft{transform:translate(0,-50%) scale(.76)}.shooLoginRocket{right:-25px}#shooHostileAttackLayer.fire .shooLoginRocket{animation-name:shooRocketFlightMobile}@keyframes shooRocketFlightMobile{to{transform:translateX(-104px);opacity:0}}}
@media(prefers-reduced-motion:reduce){#shooLoginFrame.shooLoginDamage{animation:none!important}.shooShipFragment,.shooShipSpark,.shooShipSmoke{animation-duration:.25s!important}.shooFailureStamp{animation-duration:.7s!important}.shooHostileCraft{transition-duration:.1s!important}.shooLoginRocket{animation-duration:.2s!important}}
`;
document.head.appendChild(style);

function getAudio(){
 try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;if(!audioContext)audioContext=new Ctx();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});return audioContext}catch{return null}
}
function primeAudio(){getAudio()}
function playLaunchSound(){
 const ctx=getAudio();if(!ctx)return;const now=ctx.currentTime;
 try{
  const gain=ctx.createGain();gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.18,now+.01);gain.gain.exponentialRampToValueAtTime(.0001,now+.55);gain.connect(ctx.destination);
  const osc=ctx.createOscillator();osc.type='sawtooth';osc.frequency.setValueAtTime(240,now);osc.frequency.exponentialRampToValueAtTime(720,now+.42);osc.connect(gain);osc.start(now);osc.stop(now+.48);
 }catch{}
}
function playCrashSound(){
 const ctx=getAudio();if(!ctx)return;const now=ctx.currentTime;
 try{
  const master=ctx.createGain();master.gain.setValueAtTime(.0001,now);master.gain.exponentialRampToValueAtTime(.34,now+.012);master.gain.exponentialRampToValueAtTime(.0001,now+.82);master.connect(ctx.destination);
  const boom=ctx.createOscillator(),boomGain=ctx.createGain();boom.type='sawtooth';boom.frequency.setValueAtTime(145,now);boom.frequency.exponentialRampToValueAtTime(42,now+.55);boomGain.gain.setValueAtTime(.7,now);boomGain.gain.exponentialRampToValueAtTime(.0001,now+.62);boom.connect(boomGain).connect(master);boom.start(now);boom.stop(now+.68);
  const crack=ctx.createOscillator(),crackGain=ctx.createGain();crack.type='square';crack.frequency.setValueAtTime(980,now);crack.frequency.exponentialRampToValueAtTime(180,now+.19);crackGain.gain.setValueAtTime(.22,now);crackGain.gain.exponentialRampToValueAtTime(.0001,now+.22);crack.connect(crackGain).connect(master);crack.start(now);crack.stop(now+.24);
  const length=Math.max(1,Math.floor(ctx.sampleRate*.48)),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);
  const noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),noiseGain=ctx.createGain();noise.buffer=buffer;filter.type='bandpass';filter.frequency.value=1100;filter.Q.value=.7;noiseGain.gain.setValueAtTime(.48,now);noiseGain.gain.exponentialRampToValueAtTime(.0001,now+.48);noise.connect(filter).connect(noiseGain).connect(master);noise.start(now);
 }catch{}
}

const fragmentClips=['polygon(0 0,100% 0,72% 42%,18% 55%)','polygon(18% 50%,72% 40%,100% 100%,12% 88%)','polygon(0 0,42% 12%,33% 100%,0 72%)','polygon(48% 0,100% 0,100% 72%,58% 100%)','polygon(0 34%,48% 0,65% 58%,20% 100%)','polygon(42% 8%,100% 40%,74% 100%,18% 76%)','polygon(0 0,100% 18%,62% 70%,8% 100%)','polygon(16% 6%,88% 0,100% 88%,46% 100%)'];
function createBreakLayer(core){
 core.querySelector('#shooShipBreakLayer')?.remove();const layer=document.createElement('div');layer.id='shooShipBreakLayer';
 fragmentClips.forEach((clip,i)=>{const f=document.createElement('i');f.className='shooShipFragment';const angle=Math.PI*2*i/fragmentClips.length+(i%2)*.24,distance=68+(i%3)*18;f.style.setProperty('--clip',clip);f.style.setProperty('--dx',`${Math.cos(angle)*distance}px`);f.style.setProperty('--dy',`${Math.sin(angle)*distance-14}px`);f.style.setProperty('--rot',`${(i%2?-1:1)*(110+i*37)}deg`);f.style.setProperty('--dur',`${.88+(i%3)*.12}s`);f.style.setProperty('--delay',`${i*.018}s`);layer.appendChild(f)});
 for(let i=0;i<12;i++){const spark=document.createElement('i');spark.className='shooShipSpark';spark.style.setProperty('--rot',`${i*30+Math.random()*18}deg`);spark.style.setProperty('--delay',`${Math.random()*.1}s`);layer.appendChild(spark)}
 const smoke=document.createElement('i');smoke.className='shooShipSmoke';layer.appendChild(smoke);const flash=document.createElement('i');flash.className='shooShipFlash';layer.appendChild(flash);const stamp=document.createElement('div');stamp.className='shooFailureStamp';stamp.textContent='AUTH LINK DESTROYED';layer.appendChild(stamp);core.appendChild(layer);return layer;
}
function createAttackLayer(core){
 core.querySelector('#shooHostileAttackLayer')?.remove();const layer=document.createElement('div');layer.id='shooHostileAttackLayer';layer.innerHTML='<div class="shooTargetLock"></div><div class="shooHostileCraft"><div class="shooHostileLabel">HOSTILE INTERCEPTOR</div><i class="shooHostileBody"></i><i class="shooHostileEye"></i><i class="shooRocketLauncher"></i></div><div class="shooLoginRocket"></div>';core.appendChild(layer);requestAnimationFrame(()=>layer.classList.add('approach'));return layer;
}
function triggerFailureEffect(message='ログインに失敗しました'){
 if(effectRunning)return;const screen=document.getElementById('loginScreen'),core=document.getElementById('shooCoreMark'),frame=document.getElementById('shooLoginFrame');if(!screen||screen.classList.contains('hidden')||!core)return;
 effectRunning=true;const attack=createAttackLayer(core);let breakLayer=null;
 setTimeout(()=>attack.classList.add('lock'),360);
 setTimeout(()=>{playLaunchSound();attack.classList.add('fire')},720);
 setTimeout(()=>{playCrashSound();breakLayer=createBreakLayer(core);core.classList.add('shooShipDestroyed');frame?.classList.add('shooLoginDamage');try{window.showAppNotice?.({title:'ROCKET IMPACT / LOGIN FAILED',message:String(message),type:'error',duration:5600})}catch{}},1370);
 setTimeout(()=>frame?.classList.remove('shooLoginDamage'),2050);
 setTimeout(()=>{core.classList.remove('shooShipDestroyed');breakLayer?.remove();attack.remove();effectRunning=false},3550);
}
function isLoginFailure(text){const t=String(text||'').trim();if(!t||/再設定|リセット|reset/i.test(t))return false;return /ログイン|認証|credential|user|account|auth/i.test(t)&&/失敗|エラー|正しくありません|違います|見つかりません|無効|拒否|できません|wrong-password|invalid-credential|user-not-found|too-many-requests/i.test(t)}
function inspectMessage(el){const text=el?.textContent?.trim()||'';if(!isLoginFailure(text))return;const now=Date.now();if(text===lastFailureText&&now-lastFailureAt<3800)return;lastFailureText=text;lastFailureAt=now;triggerFailureEffect(text)}
function watchMessage(el){if(!el||el.dataset.shooFailureWatched==='1')return;el.dataset.shooFailureWatched='1';const observer=new MutationObserver(()=>inspectMessage(el));observer.observe(el,{childList:true,characterData:true,subtree:true});inspectMessage(el)}
function bind(){watchMessage(document.getElementById('googleLoginMessage'));watchMessage(document.getElementById('loginMessage'));document.querySelectorAll('#loginScreen button').forEach(button=>{if(button.dataset.shooAudioPrimed==='1')return;button.dataset.shooAudioPrimed='1';button.addEventListener('pointerdown',primeAudio,{passive:true})})}
function install(){bind();const observer=new MutationObserver(bind);observer.observe(document.body,{childList:true,subtree:true});window.showLoginFailureEffect=triggerFailureEffect;window.__shookingLoginFailureEffect=VERSION}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();