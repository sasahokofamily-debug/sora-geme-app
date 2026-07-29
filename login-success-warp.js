(()=>{
'use strict';
const VERSION='login-success-warp-v6-scroll-anchored';
const CURRENT_KEY='shooking2_current_account';
const PENDING_KEY='shooking2_login_warp_pending';
let audioContext=null;
let armedUntil=0;
let running=false;
let wrappedOpen=null;
let wrappedShow=null;

const style=document.createElement('style');
style.textContent=`
#shooLoginWarpOverlay{
 --target-x:50%;--target-y:45%;--ally-x:18px;--ally-start-x:-190px;--muzzle-x:140px;--shot-dx:120px;--shot-dy:0px;--face:1;--craft-scale:1;
 position:absolute;left:0;top:0;z-index:2147483650;pointer-events:none;overflow:hidden;background:transparent;color:#e8fbff;isolation:isolate;transform:translateZ(0)
}
#shooLoginWarpOverlay::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at var(--target-x) var(--target-y),rgba(56,189,248,.11),transparent 34%),repeating-linear-gradient(90deg,transparent 0 90px,rgba(103,232,249,.035) 90px 91px);opacity:0;transition:opacity .35s ease}
#shooLoginWarpOverlay.portal::before{opacity:1}
.shooAllyCraft{position:absolute;left:var(--ally-start-x);top:var(--target-y);width:126px;height:76px;transform:translate3d(0,-50%,0) scale(var(--craft-scale)) scaleX(var(--face));transform-origin:center;opacity:0;filter:drop-shadow(0 0 18px rgba(56,189,248,.85));transition:left .62s cubic-bezier(.18,.82,.2,1),opacity .2s ease,transform .62s cubic-bezier(.18,.82,.2,1);will-change:left,transform,opacity}
#shooLoginWarpOverlay.approach .shooAllyCraft{left:var(--ally-x);opacity:1}
.shooAllyBody{position:absolute;inset:9px 12px 10px;clip-path:polygon(0 42%,24% 12%,64% 0,100% 34%,82% 55%,100% 79%,62% 100%,20% 86%);background:linear-gradient(145deg,#ecfeff,#22d3ee 42%,#2563eb 72%,#082f49);border:1px solid rgba(255,255,255,.72);box-shadow:inset 0 0 18px rgba(255,255,255,.24)}
.shooAllyEye{position:absolute;left:48px;top:28px;width:20px;height:10px;border-radius:50%;background:#fff7ad;box-shadow:0 0 12px #fde047,0 0 24px #22d3ee}
.shooWarpLauncher{position:absolute;right:-22px;top:31px;width:44px;height:15px;border:2px solid #67e8f9;border-radius:3px 10px 10px 3px;background:linear-gradient(#94a3b8,#0f172a);box-shadow:0 0 13px rgba(34,211,238,.85)}
.shooWarpLauncher::after{content:"";position:absolute;right:-9px;top:2px;width:9px;height:7px;border-radius:50%;background:#e0f2fe;box-shadow:0 0 12px #67e8f9}
.shooAllyLabel{position:absolute;left:-12px;right:-12px;top:-18px;color:#67e8f9;font:1000 8px/1 ui-monospace,monospace;letter-spacing:.15em;text-align:center;text-shadow:0 0 8px #0369a1;white-space:nowrap;transform:scaleX(var(--face))}
.shooWarpCharge{position:absolute;left:var(--muzzle-x);top:var(--target-y);width:32px;height:32px;margin:-16px;border-radius:50%;background:radial-gradient(circle,#fff 0 18%,#67e8f9 30%,#2563eb 62%,transparent 70%);box-shadow:0 0 18px #fff,0 0 42px #38bdf8;opacity:0;transform:scale(.25);will-change:transform,opacity}
#shooLoginWarpOverlay.charge .shooWarpCharge{opacity:1;animation:shooWarpChargePulse .45s ease-in-out infinite alternate}
.shooWarpShot{position:absolute;left:var(--muzzle-x);top:var(--target-y);width:40px;height:40px;margin:-20px;border-radius:50%;opacity:0;background:radial-gradient(circle,#fff 0 16%,#a5f3fc 27%,#38bdf8 48%,#4f46e5 68%,transparent 72%);box-shadow:0 0 20px #fff,0 0 54px #38bdf8;will-change:transform,opacity}
.shooWarpShot::after{content:"";position:absolute;right:24px;top:13px;width:90px;height:14px;background:linear-gradient(90deg,transparent,#38bdf8,#fff);filter:blur(2px);transform-origin:right center}
#shooLoginWarpOverlay.fromRight .shooWarpShot::after{right:auto;left:24px;transform:scaleX(-1)}
#shooLoginWarpOverlay.fire .shooWarpShot{opacity:1;animation:shooWarpShotFlight .72s cubic-bezier(.16,.74,.26,1) forwards}
.shooWarpPortal{position:absolute;left:var(--target-x);top:var(--target-y);width:80px;height:80px;margin:-40px;border-radius:50%;opacity:0;border:3px solid #a5f3fc;background:radial-gradient(circle,#fff 0 5%,#67e8f9 16%,rgba(37,99,235,.8) 34%,rgba(15,23,42,.3) 52%,transparent 68%);box-shadow:0 0 24px #fff,0 0 70px #38bdf8,0 0 130px rgba(79,70,229,.75);transform:scale(.2);will-change:transform,opacity}
.shooWarpPortal::before,.shooWarpPortal::after{content:"";position:absolute;inset:-18px;border:2px solid rgba(103,232,249,.7);border-radius:50%;animation:shooWarpRing 1s linear infinite}
.shooWarpPortal::after{inset:-36px;border-color:rgba(129,140,248,.45);animation-direction:reverse;animation-duration:1.45s}
#shooLoginWarpOverlay.portal .shooWarpPortal{opacity:1;animation:shooWarpPortalOpen .72s cubic-bezier(.14,.8,.2,1) forwards}
.shooWarpCover{position:absolute;left:var(--target-x);top:var(--target-y);width:20px;height:20px;margin:-10px;border-radius:50%;background:#e0fbff;box-shadow:0 0 60px #67e8f9,0 0 150px #2563eb;opacity:0;transform:scale(0);will-change:transform,opacity}
#shooLoginWarpOverlay.cover .shooWarpCover{opacity:1;animation:shooWarpCover .62s cubic-bezier(.18,.75,.15,1) forwards}
.shooWarpStatus{position:absolute;left:var(--target-x);top:calc(var(--target-y) + 102px);transform:translateX(-50%);width:min(360px,calc(100% - 24px));box-sizing:border-box;padding:9px 14px;border:1px solid rgba(103,232,249,.38);border-radius:999px;background:rgba(2,6,23,.86);color:#dffbff;font:900 10px/1.2 ui-monospace,monospace;letter-spacing:.14em;text-align:center;white-space:nowrap;opacity:0;transition:opacity .25s ease;box-shadow:0 0 22px rgba(56,189,248,.25)}
#shooLoginWarpOverlay.approach .shooWarpStatus{opacity:1}
#shooLoginWarpOverlay.exit{animation:shooWarpExit .42s ease forwards}
@keyframes shooWarpChargePulse{from{transform:scale(.5);filter:brightness(.8)}to{transform:scale(1.25);filter:brightness(1.5)}}
@keyframes shooWarpShotFlight{0%{transform:translate3d(0,0,0) scale(.65);opacity:1}100%{transform:translate3d(var(--shot-dx),var(--shot-dy),0) scale(1.15);opacity:1}}
@keyframes shooWarpPortalOpen{0%{transform:scale(.2) rotate(0)}70%{transform:scale(2.1) rotate(220deg)}100%{transform:scale(2.8) rotate(300deg)}}
@keyframes shooWarpRing{to{transform:rotate(360deg)}}
@keyframes shooWarpCover{0%{transform:scale(0)}100%{transform:scale(180)}}
@keyframes shooWarpExit{to{opacity:0}}
@media(max-width:780px),(pointer:coarse){
 #shooLoginWarpOverlay{--craft-scale:.8}
 .shooWarpPortal{width:72px;height:72px;margin:-36px}
 .shooWarpStatus{top:calc(var(--target-y) + 82px);width:min(250px,calc(100% - 16px));padding:8px 9px;font-size:8px;letter-spacing:.07em;white-space:normal}
 .shooWarpShot::after{width:64px}
}
@media(prefers-reduced-motion:reduce){.shooAllyCraft{transition-duration:.12s!important}.shooWarpShot,.shooWarpPortal,.shooWarpCover{animation-duration:.18s!important}}
`;
document.head.appendChild(style);

function getAudio(){
 try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;if(!audioContext)audioContext=new Ctx();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});return audioContext}catch{return null}
}
function primeAudio(){getAudio()}
function tone(type,start,end,duration,volume,delay=0){
 const ctx=getAudio();if(!ctx)return;const time=ctx.currentTime+delay;
 try{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(start,time);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),time+duration);gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(volume,time+.015);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);osc.connect(gain).connect(ctx.destination);osc.start(time);osc.stop(time+duration+.03)}catch{}
}
function playArrival(){tone('sine',180,520,.5,.12);tone('triangle',320,760,.42,.08,.08)}
function playWarpFire(){tone('sawtooth',260,1400,.62,.14);tone('sine',520,1880,.72,.1,.04)}
function playWarpOpen(){tone('sine',220,920,.85,.13);tone('triangle',440,120,.95,.1,.06);tone('sine',760,1260,.55,.07,.2)}
function now(){return Date.now()}
function savePending(until){try{sessionStorage.setItem(PENDING_KEY,String(until))}catch{try{localStorage.setItem(PENDING_KEY,String(until))}catch{}}}
function readPending(){let value='';try{value=sessionStorage.getItem(PENDING_KEY)||''}catch{}if(!value)try{value=localStorage.getItem(PENDING_KEY)||''}catch{}return Number(value)||0}
function clearPending(){try{sessionStorage.removeItem(PENDING_KEY)}catch{}try{localStorage.removeItem(PENDING_KEY)}catch{}}
function readAccount(){try{return JSON.parse(localStorage.getItem(CURRENT_KEY)||'null')}catch{return null}}
function validAccount(){const account=readAccount();return !!(account&&account.provider&&!/guest/i.test(String(account.provider)))}
function isArmed(){const persisted=readPending();if(persisted>armedUntil)armedUntil=persisted;return now()<=armedUntil}
function isEligibleHome(target){return String(target)==='home'&&!running&&isArmed()&&validAccount()}
function ensureLoginVisible(){
 const login=document.getElementById('loginScreen');
 if(!login)return;
 const core=document.getElementById('shooCoreMark');
 if(core&&core.getClientRects().length)return;
 document.querySelectorAll('.screen').forEach(screen=>screen.classList.add('hidden'));
 login.classList.remove('hidden');
}
function setPx(el,name,value){el.style.setProperty(name,`${Math.round(value)}px`)}
function createOverlay(){
 document.getElementById('shooLoginWarpOverlay')?.remove();
 ensureLoginVisible();
 const panel=document.querySelector('#loginScreen .panel')||document.getElementById('loginScreen')||document.body;
 const core=document.getElementById('shooCoreMark');
 const panelRect=panel.getBoundingClientRect();
 const coreRect=core?.getBoundingClientRect();
 const width=Math.max(panel.scrollWidth,panel.clientWidth,1);
 const height=Math.max(panel.scrollHeight,panel.clientHeight,1);
 const targetX=coreRect?.width?coreRect.left-panelRect.left+panel.scrollLeft+coreRect.width/2:Math.min(150,width*.28);
 const targetY=coreRect?.height?coreRect.top-panelRect.top+panel.scrollTop+coreRect.height/2:Math.min(240,height*.34);
 const mobile=matchMedia('(max-width:780px),(pointer:coarse)').matches;
 const craftWidth=mobile?101:126;
 const spaceLeft=targetX-craftWidth-24;
 const fromRight=spaceLeft<8;
 let allyX,startX,muzzleX;
 if(fromRight){
  allyX=Math.min(width-craftWidth-8,targetX+48);
  startX=width+40;
  muzzleX=allyX-10;
 }else{
  allyX=Math.max(8,targetX-craftWidth-30);
  startX=-craftWidth-70;
  muzzleX=allyX+craftWidth+10;
 }
 const overlay=document.createElement('div');
 overlay.id='shooLoginWarpOverlay';
 if(fromRight)overlay.classList.add('fromRight');
 overlay.style.width=`${width}px`;
 overlay.style.height=`${height}px`;
 overlay.style.setProperty('--face',fromRight?'-1':'1');
 setPx(overlay,'--target-x',targetX);
 setPx(overlay,'--target-y',targetY);
 setPx(overlay,'--ally-x',allyX);
 setPx(overlay,'--ally-start-x',startX);
 setPx(overlay,'--muzzle-x',muzzleX);
 setPx(overlay,'--shot-dx',targetX-muzzleX);
 setPx(overlay,'--shot-dy',0);
 overlay.innerHTML='<div class="shooAllyCraft"><div class="shooAllyLabel">ALLY WARP ESCORT</div><i class="shooAllyBody"></i><i class="shooAllyEye"></i><i class="shooWarpLauncher"></i></div><i class="shooWarpCharge"></i><i class="shooWarpShot"></i><div class="shooWarpPortal"></div><div class="shooWarpCover"></div><div class="shooWarpStatus">LOGIN VERIFIED // WARP TO HOME</div>';
 panel.appendChild(overlay);
 return overlay;
}
function ensureHomeDom(){
 const home=document.getElementById('home');
 document.querySelectorAll('.screen').forEach(screen=>screen.classList.add('hidden'));
 if(home){home.classList.remove('hidden');home.scrollTop=0}
 document.body.classList.remove('game-playing');
 document.body.classList.add('game-menu');
}
function forceHome(){
 const open=window.openScreen,show=window.showScreen;
 const nav=(typeof open==='function'?(open.__shooWarpOriginal||open):null)||(typeof show==='function'?(show.__shooWarpOriginal||show):null);
 try{nav?.call(window,'home')}catch(error){console.warn('Home navigation fallback',error)}
 ensureHomeDom();
 try{window.updateUI?.();window.updateAccountStatus?.()}catch{}
}
function beginWarp(goHome){
 const overlay=createOverlay();playArrival();
 try{window.showAppNotice?.({title:'ALLY LINK ESTABLISHED',message:'ログイン認証に成功しました。味方機が自機へワープ弾を発射します。',type:'success',duration:4200})}catch{}
 requestAnimationFrame(()=>overlay.classList.add('approach'));
 setTimeout(()=>overlay.classList.add('charge'),430);
 setTimeout(()=>{playWarpFire();overlay.classList.add('fire')},820);
 setTimeout(()=>{playWarpOpen();overlay.classList.add('portal')},1380);
 setTimeout(()=>overlay.classList.add('cover'),1720);
 setTimeout(()=>{try{goHome()}finally{ensureHomeDom()}},2020);
 setTimeout(()=>overlay.classList.add('exit'),2360);
 setTimeout(()=>{overlay.remove();running=false},2860);
}
function runWarp(goHome=forceHome){
 if(running)return;running=true;armedUntil=0;clearPending();
 try{document.activeElement?.blur?.()}catch{}
 setTimeout(()=>beginWarp(goHome),90);
}
function wrapFunction(name){
 const fn=window[name];if(typeof fn!=='function'||fn.__shooWarpWrapped)return;
 const wrapped=function(target,...args){
  if(isEligibleHome(target)){runWarp(()=>{try{fn.call(this,target,...args)}finally{ensureHomeDom()}});return}
  if(running&&String(target)==='home')return;
  return fn.call(this,target,...args);
 };
 wrapped.__shooWarpWrapped=true;wrapped.__shooWarpOriginal=fn;window[name]=wrapped;
 if(name==='openScreen')wrappedOpen=wrapped;else wrappedShow=wrapped;
}
function arm(){armedUntil=now()+45000;savePending(armedUntil);primeAudio()}
function armFromButton(button){
 const action=((button.getAttribute('onclick')||'')+' '+(button.textContent||'')).toLowerCase();
 if(/ゲスト|guest|忘れ|再設定|reset|登録|register/.test(action))return;
 if(/loginfirebaseemailaccount|loginaccount|startgooglelogin|google.*ログイン|ログイン/.test(action))arm();
}
function isSuccessText(text){const value=String(text||'').trim();return /^(Googleでログインしました。?|ログインしました。?)$/.test(value)}
function inspectSuccess(el){if(!isSuccessText(el?.textContent)||running||!validAccount())return;arm();runWarp(forceHome)}
function watchSuccess(el){if(!el||el.dataset.shooWarpSuccessWatched==='1')return;el.dataset.shooWarpSuccessWatched='1';const observer=new MutationObserver(()=>inspectSuccess(el));observer.observe(el,{childList:true,characterData:true,subtree:true});inspectSuccess(el)}
function bind(){
 wrapFunction('openScreen');wrapFunction('showScreen');
 watchSuccess(document.getElementById('googleLoginMessage'));watchSuccess(document.getElementById('loginMessage'));
 document.querySelectorAll('#loginScreen button').forEach(button=>{if(button.dataset.shooWarpBound==='1')return;button.dataset.shooWarpBound='1';button.addEventListener('pointerdown',()=>armFromButton(button),{passive:true});button.addEventListener('touchstart',()=>armFromButton(button),{passive:true})});
 document.querySelectorAll('#loginScreen input').forEach(input=>{if(input.dataset.shooWarpEnterBound==='1')return;input.dataset.shooWarpEnterBound='1';input.addEventListener('keydown',event=>{if(event.key==='Enter')arm()})});
}
function resumePendingLogin(){if(!running&&isArmed()&&validAccount())setTimeout(()=>runWarp(forceHome),80)}
function install(){
 bind();const observer=new MutationObserver(bind);observer.observe(document.body,{childList:true,subtree:true});
 setInterval(()=>{if(window.openScreen!==wrappedOpen)wrapFunction('openScreen');if(window.showScreen!==wrappedShow)wrapFunction('showScreen')},900);
 window.addEventListener('pageshow',resumePendingLogin);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)resumePendingLogin()});
 resumePendingLogin();
 window.showLoginSuccessWarp=()=>{arm();runWarp(forceHome)};
 window.__shookingLoginSuccessWarp=VERSION;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();