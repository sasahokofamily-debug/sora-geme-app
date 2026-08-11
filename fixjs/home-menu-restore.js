(()=>{
'use strict';
const VERSION='home-menu-restore-v1';

function menu(){return document.querySelector('#home details.homeMenuDetails')}

function closeMenu(){
  const d=menu();
  if(d)d.open=false;
}

function installStyle(){
  if(document.getElementById('homeMenuRestoreStyle'))return;
  const s=document.createElement('style');
  s.id='homeMenuRestoreStyle';
  s.textContent=`
#home .homeMenuDetails{
  padding:0!important;
  overflow:hidden!important;
  border:1px solid rgba(103,232,249,.3)!important;
  background:linear-gradient(180deg,rgba(15,23,42,.88),rgba(2,6,23,.88))!important;
  box-shadow:0 10px 28px rgba(0,0,0,.18)!important;
}
#home .homeMenuDetails>summary{
  position:relative;
  display:flex!important;
  align-items:center;
  justify-content:center;
  min-height:48px;
  padding:10px 50px 10px 18px!important;
  color:#bff7ff!important;
  background:linear-gradient(90deg,rgba(14,165,233,.10),rgba(99,102,241,.08),rgba(14,165,233,.10));
  font-weight:900!important;
  font-size:14px!important;
  letter-spacing:.05em;
  user-select:none;
  list-style:none!important;
}
#home .homeMenuDetails>summary::before{
  content:'MENU';
  position:absolute;
  left:14px;
  top:50%;
  transform:translateY(-50%);
  color:#5ee7ff;
  font:900 9px/1 ui-monospace,SFMono-Regular,Consolas,monospace;
  letter-spacing:.12em;
  opacity:.78;
}
#home .homeMenuDetails>summary::after{
  content:'▾';
  position:absolute;
  right:17px;
  top:50%;
  transform:translateY(-50%) rotate(0deg);
  color:#67e8f9;
  font-size:20px;
  transition:transform .16s ease;
}
#home .homeMenuDetails[open]>summary::after{transform:translateY(-50%) rotate(180deg)}
#home .homeMenuDetails>summary:hover{background:linear-gradient(90deg,rgba(14,165,233,.18),rgba(99,102,241,.13),rgba(14,165,233,.18))}
#home .homeMenuDetails[open]>.installCard,
#home .homeMenuDetails[open]>.homeUtilityActions{margin-left:10px!important;margin-right:10px!important}
#home .homeMenuDetails[open]>.homeUtilityActions{margin-bottom:10px!important}
#home .homeMenuDetails:not([open])>.installCard,
#home .homeMenuDetails:not([open])>.homeUtilityActions{display:none!important}
@media(max-width:700px),(pointer:coarse){
  #home .homeMenuDetails>summary{min-height:42px;padding-top:8px!important;padding-bottom:8px!important;font-size:12px!important}
  #home .homeMenuDetails>summary::before{font-size:7px;left:10px}
  #home .homeMenuDetails>summary::after{right:12px;font-size:17px}
}
`;
  document.head.appendChild(s);
}

function observeHome(){
  const home=document.getElementById('home');
  if(!home)return;
  let wasHidden=home.classList.contains('hidden');
  new MutationObserver(()=>{
    const hidden=home.classList.contains('hidden');
    if(wasHidden&&!hidden)closeMenu();
    wasHidden=hidden;
  }).observe(home,{attributes:true,attributeFilter:['class']});
}

function install(){
  installStyle();
  closeMenu();
  observeHome();
  window.addEventListener('pageshow',()=>setTimeout(closeMenu,0));
  window.__SHOOKING_HOME_MENU_RESTORE__=VERSION;
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
