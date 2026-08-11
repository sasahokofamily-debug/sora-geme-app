(()=>{
'use strict';
const VERSION='current-ui-suite-v1';
if(window.__SHOOKING_CURRENT_UI_SUITE__===VERSION)return;
window.__SHOOKING_CURRENT_UI_SUITE__=VERSION;

const style=document.createElement('style');
style.id='shookingCurrentUiSuiteStyle';
style.textContent=`
:root{--cmd-bg:#030711;--cmd-panel:#07101f;--cmd-panel2:#0a1528;--cmd-line:#23405b;--cmd-cyan:#67e8f9;--cmd-blue:#3b82f6;--cmd-text:#eaf8ff;--cmd-muted:#8da6bb;--cmd-gold:#facc15}
#registerScreen,#settings,#onlinePlay,#hangar,#gacha{
  background:radial-gradient(circle at 50% -10%,#112b4d 0,#071224 34%,#02050c 76%)!important;
  color:var(--cmd-text)!important;
}
#settings>.panel,#onlinePlay>.panel,#hangar>.panel,#gacha>.panel{
  width:min(1040px,94vw)!important;max-height:calc(100dvh - 34px)!important;
  padding:clamp(18px,2.5vw,34px)!important;border:1px solid #2d607e!important;border-radius:24px!important;
  background:linear-gradient(160deg,#07101f 0%,#030711 62%,#07101d 100%)!important;
  box-shadow:0 24px 70px #0009,0 0 30px #0ea5e933!important;text-align:left!important;
}
#settings h1,#onlinePlay h1,#hangar h1,#gacha h1{color:#effcff!important;font-size:clamp(30px,4vw,48px)!important;letter-spacing:.015em!important;text-shadow:0 0 22px #38bdf844!important;text-align:left!important;margin-bottom:22px!important}
#settings h1::before,#onlinePlay h1::before,#hangar h1::before,#gacha h1::before{
  display:block;margin-bottom:8px;color:var(--cmd-cyan);font:900 10px/1 ui-monospace,Consolas,monospace;letter-spacing:.22em;text-shadow:none
}
#settings h1::before{content:'SYSTEM / CONFIGURATION'}
#onlinePlay h1::before{content:'NETWORK / CO-OP COMMAND'}
#hangar h1::before{content:'AIRFRAME / HANGAR DATABASE'}
#gacha h1::before{content:'CAPSULE / REWARD TERMINAL'}
#settings h2,#onlinePlay h2,#hangar h2,#gacha h2{color:#dffaff!important;letter-spacing:.02em}
#settings input,#settings textarea,#settings select,#onlinePlay input,#onlinePlay textarea,#onlinePlay select,#registerScreen input,#registerScreen textarea,#registerScreen select{
  border:1px solid #285875!important;border-radius:12px!important;background:#020913!important;color:#f4fbff!important;box-shadow:inset 0 0 18px #0ea5e908!important
}
#settings input:focus,#settings textarea:focus,#onlinePlay input:focus,#onlinePlay textarea:focus,#registerScreen input:focus{
  outline:none!important;border-color:#67e8f9!important;box-shadow:0 0 0 3px #22d3ee17!important
}
#settings button,#onlinePlay button,#hangar button,#gacha button,#registerScreen button{
  border:1px solid #2d5d79!important;border-radius:12px!important;background:linear-gradient(180deg,#12365a,#09223d)!important;color:#eefcff!important;
  box-shadow:inset 0 1px #ffffff12,0 8px 20px #0004!important;transition:transform .12s ease,filter .12s ease,border-color .12s ease!important
}
#settings button:hover,#onlinePlay button:hover,#hangar button:hover,#gacha button:hover,#registerScreen button:hover{transform:translateY(-1px);filter:brightness(1.12);border-color:#67e8f9!important}
#settings button:active,#onlinePlay button:active,#hangar button:active,#gacha button:active,#registerScreen button:active{transform:translateY(0) scale(.99)}
#settings .back,#onlinePlay .back,#hangar .back,#gacha .back,#registerScreen .back{background:#0b1422!important;color:#9db3c5!important;border-color:#26384b!important}

/* register: same command-grade family as PILOT LOGIN */
#registerScreen{align-items:center!important;justify-content:center!important;padding:16px!important}
#registerScreen>.panel{width:min(980px,96vw)!important;max-height:calc(100dvh - 30px)!important;padding:0!important;border:0!important;border-radius:28px!important;background:transparent!important;box-shadow:0 30px 90px #000b!important;overflow:auto!important}
#shooRegisterFrame{display:grid;grid-template-columns:minmax(280px,.86fr) minmax(420px,1.14fr);min-height:610px;border:1px solid #2a6684;border-radius:28px;overflow:hidden;background:#020713}
#shooRegisterBrand{position:relative;padding:34px 28px;display:flex;flex-direction:column;justify-content:space-between;background:radial-gradient(circle at 50% 37%,#164c6f88,transparent 27%),linear-gradient(160deg,#0a2b4a,#041326 58%,#020713);border-right:1px solid #173a52;overflow:hidden}
#shooRegisterBrand::before{content:'';position:absolute;left:50%;top:46%;width:200px;height:200px;transform:translate(-50%,-50%);border-radius:50%;border:1px solid #67e8f955;box-shadow:0 0 0 32px #38bdf80b,0 0 0 64px #8b5cf608}
.srBrandKicker{position:relative;color:#67e8f9;font:900 10px ui-monospace,monospace;letter-spacing:.2em}.srCore{position:relative;width:130px;height:130px;margin:auto;border:1px solid #67e8f966;border-radius:50%;display:grid;place-items:center;box-shadow:0 0 32px #38bdf824}.srCore::before,.srCore::after{content:'';position:absolute;background:#67e8f944}.srCore::before{width:1px;height:150%}.srCore::after{height:1px;width:150%}.srShip{width:48px;height:67px;background:linear-gradient(#fff,#67e8f9 44%,#2563eb);clip-path:polygon(50% 0,76% 43%,100% 78%,63% 67%,50% 100%,37% 67%,0 78%,24% 43%);filter:drop-shadow(0 0 12px #38bdf8)}
.srBrandBottom{position:relative}.srBrandTitle{font-size:36px;font-weight:1000;line-height:.94;letter-spacing:.03em}.srBrandTitle span{display:block;margin-top:10px;color:#67e8f9;font-size:12px;letter-spacing:.25em}.srBrandText{margin-top:16px;color:#8fa9bc;font-size:12px;line-height:1.7}
#shooRegisterConsole{padding:34px 38px 30px;background:linear-gradient(155deg,#0d1728,#030712 72%);min-width:0}
#shooRegisterConsole::before{content:'NEW PILOT / IDENTITY ENROLLMENT';display:block;padding-bottom:12px;border-bottom:1px solid #1e415a;color:#67e8f9;font:900 10px ui-monospace,monospace;letter-spacing:.18em}
#shooRegisterConsole>h1{margin:23px 0 12px!important;color:#f3fbff!important;text-align:left!important;font-size:clamp(29px,5vw,44px)!important;text-shadow:0 0 22px #38bdf840!important}
#shooRegisterConsole .authBox{padding:0!important;margin:0!important;border:0!important;background:transparent!important;text-align:left!important}
#shooRegisterConsole .authDanger{border:1px solid #8a651d!important;background:#2a210a88!important;color:#fde68a!important;border-radius:12px!important}
#shooRegisterConsole label{color:#9db3c5!important;font-size:11px!important;font-weight:900!important;letter-spacing:.08em!important}
#shooRegisterConsole button[onclick*='registerFirebaseEmailAccount'],#shooRegisterConsole button[onclick='registerAccount()']{background:linear-gradient(100deg,#0891b2,#2563eb 52%,#6d28d9)!important;border-color:#4cc9f0!important}

/* settings */
#settings .settingsCommandHeader{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:end;margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid #1c3b51}
#settings .settingsCommandBadge{padding:7px 10px;border:1px solid #285875;border-radius:999px;color:#67e8f9;font:900 10px ui-monospace,monospace;letter-spacing:.1em}
#settings .authBox,#settings .dangerBox,#settings .settingsSection{border:1px solid #213d53!important;border-radius:16px!important;background:#0a1426!important;padding:18px!important;margin:14px 0!important;box-shadow:none!important}
#settings #googleLoginSettings{border-color:#255b75!important;background:linear-gradient(145deg,#0b1c30,#091222)!important}
#settings #googleLoginSettings h2{margin-top:0!important}
#settings #firebaseAdvancedSettings{margin:12px 0;border:1px solid #294157;border-radius:12px;background:#040b14;padding:8px 11px}
#settings #firebaseAdvancedSettings summary{cursor:pointer;color:#91a9bc;font-weight:900;font-size:12px;letter-spacing:.05em;padding:6px 2px}
#settings #firebaseAdvancedSettings textarea{min-height:145px!important;font:11px/1.45 ui-monospace,monospace!important}

/* online PvE */
#onlinePlay #pveRoomControls{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:16px;border:1px solid #20465f;border-radius:16px;background:#071426;margin:12px 0}
#onlinePlay #pveRoomControls #onlineName,#onlinePlay #pveRoomControls #roomName{grid-column:1/-1}
#onlinePlay #pveRoomControls>button:last-child{grid-column:1/-1}
#onlinePlay .onlineCard{border:1px solid #24506b!important;border-radius:14px!important;background:#07111e!important;padding:14px!important;color:#dff7ff!important}
#onlinePlay #pvePlayerList{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#onlinePlay #pveReadyButton,#onlinePlay #pveStartButton{font-weight:1000!important;letter-spacing:.04em!important}
#onlinePlay #pveStartButton:not(:disabled){background:linear-gradient(90deg,#0e7490,#2563eb)!important;border-color:#67e8f9!important}
#onlinePlay .chatbox{border-color:#213d53!important;background:#020812!important;min-height:150px}

/* hangar */
#hangar #skinGrid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important}
#hangar .skinCard{border:1px solid #243f54!important;border-radius:16px!important;background:linear-gradient(145deg,#0a1729,#050b15)!important;padding:16px!important;min-height:100px!important}
#hangar .skinCard.unlocked{border-color:#2888a8!important;box-shadow:inset 3px 0 #22d3ee!important}.skinCard.equipped{border-color:#d6a914!important;box-shadow:inset 3px 0 #facc15!important}
#hangar #evolutionTree,.evoTree{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}
#hangar .evoNode{border:1px solid #244158!important;border-radius:13px!important;background:#07111e!important;padding:13px!important}.evoNode.active{border-color:#d8ac18!important;color:#fde68a!important;background:#211a08!important}
#hangar .hangarLevel{display:inline-flex;padding:8px 12px;border:1px solid #d5a914;border-radius:999px;background:#241c06;color:#fde047!important}

/* gacha terminal menu; animation itself is supplied by gacha-upgrade.js */
#gacha>.panel{max-width:880px!important}
#gacha>.panel>button:not(.back){min-height:72px!important;margin:12px 0!important;font-size:17px!important;text-align:left!important;padding:15px 20px!important;position:relative!important;overflow:hidden!important}
#gacha>.panel>button:not(.back)::after{content:'AUTHORIZED';position:absolute;right:16px;top:50%;transform:translateY(-50%);font:900 9px ui-monospace,monospace;letter-spacing:.13em;opacity:.55}
#gacha>.panel>button.gacha,#gacha>.panel>button[onclick*='Gacha']{background:linear-gradient(100deg,#4c1d95,#6d28d9 54%,#9d4edd)!important;border-color:#a78bfa!important}
#gacha #gachaResult{padding:12px;border:1px solid #1e4058;border-radius:12px;background:#06101e;color:#b9d6e8}

@media(max-width:780px){
 #settings>.panel,#onlinePlay>.panel,#hangar>.panel,#gacha>.panel{width:100%!important;max-height:none!important;border-radius:0!important;border-left:0!important;border-right:0!important;padding:16px!important}
 #shooRegisterFrame{grid-template-columns:112px minmax(0,1fr);min-height:620px;border-radius:20px}#shooRegisterBrand{padding:14px 8px}.srBrandKicker{font-size:7px;text-align:center}.srCore{width:84px;height:84px;margin-top:120px}.srShip{width:31px;height:46px}.srBrandTitle{font-size:16px;text-align:center}.srBrandTitle span{font-size:7px;letter-spacing:.08em}.srBrandText{display:none}#shooRegisterConsole{padding:18px 10px}#shooRegisterConsole::before{font-size:7px;letter-spacing:.08em}#shooRegisterConsole>h1{font-size:25px!important}
 #onlinePlay #pveRoomControls{grid-template-columns:1fr}#onlinePlay #pveRoomControls>*{grid-column:1!important}#onlinePlay #pvePlayerList{grid-template-columns:1fr}
 #hangar #skinGrid,#hangar #evolutionTree,.evoTree{grid-template-columns:1fr!important}
}
`;
document.head.appendChild(style);

function upgradeRegister(){
 const screen=document.getElementById('registerScreen'),panel=screen?.querySelector('.panel');
 if(!panel||document.getElementById('shooRegisterFrame'))return;
 const children=[...panel.childNodes];
 const frame=document.createElement('div');frame.id='shooRegisterFrame';
 const brand=document.createElement('aside');brand.id='shooRegisterBrand';brand.innerHTML='<div class="srBrandKicker">SHOO KING II / SECURE ACCESS</div><div class="srCore"><div class="srShip"></div></div><div class="srBrandBottom"><div class="srBrandTitle">NEW PILOT<span>IDENTITY ENROLLMENT</span></div><div class="srBrandText">新しいパイロットIDを発行し、クラウドセーブとオンライン協力を有効化します。</div></div>';
 const main=document.createElement('main');main.id='shooRegisterConsole';children.forEach(n=>main.appendChild(n));
 const h=main.querySelector('h1');if(h)h.textContent='PILOT REGISTRATION';
 frame.append(brand,main);panel.replaceChildren(frame);
}
function upgradeSettings(){
 const panel=document.querySelector('#settings .panel');if(!panel)return;
 panel.classList.add('currentSettingsPanel');
 const title=panel.querySelector(':scope>h1');
 if(title&&!panel.querySelector('.settingsCommandHeader')){
  const head=document.createElement('div');head.className='settingsCommandHeader';
  title.parentNode.insertBefore(head,title);head.appendChild(title);
  const badge=document.createElement('div');badge.className='settingsCommandBadge';badge.textContent='LOCAL + CLOUD';head.appendChild(badge);
 }
 const area=document.getElementById('googleLoginSettings');
 if(area&&!document.getElementById('firebaseAdvancedSettings')){
  const ta=document.getElementById('firebaseConfigInput');
  const save=area.querySelector('button[onclick*="saveFirebaseLoginSettings"]');
  if(ta&&save){
   const details=document.createElement('details');details.id='firebaseAdvancedSettings';
   const summary=document.createElement('summary');summary.textContent='Firebase 詳細設定（通常は変更不要）';details.appendChild(summary);
   ta.parentNode.insertBefore(details,ta);details.append(ta,save);
  }
 }
}
function markScreens(){
 document.getElementById('onlinePlay')?.classList.add('currentOnlineUi');
 document.getElementById('hangar')?.classList.add('currentHangarUi');
 document.getElementById('gacha')?.classList.add('currentGachaUi');
}
function apply(){upgradeRegister();upgradeSettings();markScreens()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
let queued=false;
const obs=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})});
if(document.body)obs.observe(document.body,{childList:true,subtree:true});else document.addEventListener('DOMContentLoaded',()=>obs.observe(document.body,{childList:true,subtree:true}),{once:true});
})();
