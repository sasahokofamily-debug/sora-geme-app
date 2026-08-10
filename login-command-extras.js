(()=>{
'use strict';
const STYLE_ID='shooLoginCommandExtrasStyle';
function addStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
#shooLoginQuickActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
#shooLoginQuickActions button{min-height:40px!important;margin:0!important;padding:9px 10px!important;border:1px solid rgba(103,232,249,.22)!important;border-radius:10px!important;background:rgba(2,6,23,.72)!important;color:#bfefff!important;font:800 10px/1.2 ui-monospace,monospace!important;letter-spacing:.08em!important;box-shadow:none!important}
#shooLoginQuickActions button:hover{background:rgba(14,116,144,.22)!important;border-color:rgba(103,232,249,.5)!important}
#shooLoginQuickActions .homeAction{color:#94a3b8!important;border-color:rgba(148,163,184,.18)!important}
@media(max-width:780px),(pointer:coarse){#shooLoginQuickActions{grid-template-columns:1fr}#shooLoginQuickActions button{min-height:38px!important;font-size:9px!important}}
`;
  document.head.appendChild(s);
}
function install(){
  addStyle();
  const consoleBox=document.getElementById('shooLoginConsole');
  if(!consoleBox)return false;
  if(document.getElementById('shooLoginQuickActions'))return true;
  const wrap=document.createElement('div');
  wrap.id='shooLoginQuickActions';
  wrap.innerHTML='<button type="button" onclick="openSettings()">⚙ AUTH / CLOUD SETTINGS</button><button type="button" class="homeAction" onclick="openScreen(\'home\')">← HOME</button>';
  consoleBox.appendChild(wrap);
  return true;
}
let tries=0;
const timer=setInterval(()=>{if(install()||++tries>80)clearInterval(timer)},100);
new MutationObserver(()=>install()).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',()=>setTimeout(install,0),{once:true});
})();
