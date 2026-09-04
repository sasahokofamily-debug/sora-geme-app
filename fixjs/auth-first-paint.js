(()=>{
'use strict';
const VERSION='auth-first-paint-v2-session-safe';
const CURRENT_KEY='shooking2_current_account';
const GUEST_KEY='shooking2_guest_session';

document.documentElement.classList.add('shooking-auth-first-paint');
const style=document.createElement('style');
style.id='shookingAuthFirstPaintStyle';
style.textContent=`
html.shooking-auth-first-paint .screen{visibility:hidden!important}
html.shooking-auth-first-paint body:before{
  content:'SHOO KING II  •  ACCOUNT CHECK';
  position:fixed;inset:0;z-index:2147482000;display:grid;place-items:center;
  background:#02030a;color:#67e8f9;font:900 12px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;
  letter-spacing:.14em
}
`;
document.head.appendChild(style);

function guestSession(){
  try{return sessionStorage.getItem(GUEST_KEY)==='1'}catch(e){return false}
}
function account(){
  try{
    const value=JSON.parse(localStorage.getItem(CURRENT_KEY)||'null');
    if(!value||typeof value!=='object')return null;
    if(value.provider==='guest'||value.guest===true){
      return guestSession()?value:null;
    }
    if(typeof value.uid==='string'&&value.uid.trim())return value;
    if(typeof value.email==='string'&&value.email.includes('@'))return value;
  }catch(e){}
  return null;
}
function clearStaleGuest(){
  try{
    const value=JSON.parse(localStorage.getItem(CURRENT_KEY)||'null');
    if(value&&(value.provider==='guest'||value.guest===true)&&!guestSession()){
      localStorage.removeItem(CURRENT_KEY);
      const profile=JSON.parse(localStorage.getItem('shooking2_google_profile')||'null');
      if(profile&&(profile.provider==='guest'||profile.guest===true))localStorage.removeItem('shooking2_google_profile');
    }
  }catch(e){}
}
function reveal(){
  document.documentElement.classList.remove('shooking-auth-first-paint');
  style.remove();
}
function showLogin(){
  const login=document.getElementById('loginScreen');
  if(!login){reveal();return;}
  document.querySelectorAll('.screen').forEach(screen=>screen.classList.add('hidden'));
  login.classList.remove('hidden');
  login.style.removeProperty('display');
  login.style.removeProperty('visibility');
  document.getElementById('home')?.classList.add('hidden');
  document.body.classList.remove('game-playing');
  document.body.classList.add('game-menu');
  reveal();
}
function settle(){
  clearStaleGuest();
  const current=account();
  if(current){reveal();return;}
  if(guestSession()){
    setTimeout(()=>{account()?reveal():showLogin()},260);
    return;
  }
  showLogin();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',settle,{once:true});
else settle();
setTimeout(()=>{if(document.documentElement.classList.contains('shooking-auth-first-paint'))settle()},900);
window.__SHOOKING_AUTH_FIRST_PAINT__=VERSION;
})();
