(()=>{
'use strict';
const CONFIG_KEY='shooking2_firebase_config';
const PROFILE_KEY='soraRacingProfile';
const SESSION_KEY='soraRacingSession';
const FIREBASE_VERSION='10.12.5';
const DEFAULT={coins:0,engine:0,accel:0,handling:0,races:0,wins:0};
let auth=null,db=null,user=null,profile={...DEFAULT},mode='none',saveTimer=null;
const $=id=>document.getElementById(id);
function loadScript(src,id){return new Promise((resolve,reject)=>{if(document.getElementById(id))return resolve();const s=document.createElement('script');s.id=id;s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Firebaseを読み込めませんでした'));document.head.appendChild(s)})}
function config(){try{return JSON.parse(localStorage.getItem(CONFIG_KEY)||'null')}catch{return null}}
function valid(c){return !!(c&&c.apiKey&&c.authDomain&&c.projectId&&c.appId)}
async function ensureFirebase(){if(auth&&db)return;const c=config();if(!valid(c))throw new Error('Shooking側のFirebase設定が見つかりません');await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,'racingFirebaseApp');await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth-compat.js`,'racingFirebaseAuth');await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore-compat.js`,'racingFirebaseDb');const app=firebase.apps?.length?firebase.app():firebase.initializeApp(c);auth=app.auth();db=app.firestore();await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)}
function normalize(v){return {...DEFAULT,...(v||{}),coins:Math.max(0,Number(v?.coins)||0),engine:Math.min(5,Math.max(0,Number(v?.engine)||0)),accel:Math.min(5,Math.max(0,Number(v?.accel)||0)),handling:Math.min(5,Math.max(0,Number(v?.handling)||0))}}
function localLoad(){try{return normalize(JSON.parse(localStorage.getItem(PROFILE_KEY)||'null'))}catch{return {...DEFAULT}}}
function localSave(){localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));localStorage.setItem(SESSION_KEY,JSON.stringify({mode,name:getName(),uid:user?.uid||''}));render()}
function getName(){return mode==='google'?(user?.displayName||user?.email?.split('@')[0]||'Google Player'):'Guest'}
async function cloudRef(){return db.collection('users').doc(user.uid).collection('games').doc('soraRacing')}
async function cloudLoad(){const snap=await (await cloudRef()).get();if(snap.exists)profile=normalize(snap.data()?.profile);else await cloudSave();localSave()}
async function cloudSave(){if(mode!=='google'||!user||!db)return;await (await cloudRef()).set({app:'SORA RACING',version:1,profile,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}
function queueSave(){localSave();clearTimeout(saveTimer);if(mode==='google')saveTimer=setTimeout(()=>cloudSave().catch(console.warn),500)}
function setMsg(t,err=false){const e=$('racingLoginMsg');if(e){e.textContent=t;e.style.color=err?'#fca5a5':'#bfdbfe'}}
async function googleLogin(){try{setMsg('Googleログインを開いています…');await ensureFirebase();const provider=new firebase.auth.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});const result=await auth.signInWithPopup(provider);user=result.user;mode='google';await cloudLoad();showGame();setMsg('')}catch(e){console.error(e);setMsg('Googleログインに失敗しました：'+e.message,true)}}
function guestLogin(){mode='guest';user=null;profile=localLoad();localSave();showGame()}
async function logout(){try{if(auth&&auth.currentUser)await auth.signOut()}catch{}mode='none';user=null;$('racingLogin')?.classList.remove('hidden');$('menu')?.classList.add('hidden');render()}
function showGame(){$('racingLogin')?.classList.add('hidden');$('menu')?.classList.remove('hidden');render()}
function price(level){return 80+level*120}
function upgrade(type){if(!['engine','accel','handling'].includes(type))return;const lv=profile[type];if(lv>=5)return;const p=price(lv);if(profile.coins<p){alert('コインが足りません');return}profile.coins-=p;profile[type]++;queueSave();window.dispatchEvent(new CustomEvent('racing-profile-change'))}
function render(){document.querySelectorAll('[data-racing-coins]').forEach(e=>e.textContent=profile.coins);document.querySelectorAll('[data-racing-name]').forEach(e=>e.textContent=getName());['engine','accel','handling'].forEach(type=>{const lv=profile[type];document.querySelectorAll(`[data-upgrade-level="${type}"]`).forEach(e=>e.textContent=`Lv.${lv} / 5`);document.querySelectorAll(`[data-upgrade-button="${type}"]`).forEach(e=>{e.textContent=lv>=5?'MAX':`🪙 ${price(lv)}で強化`;e.disabled=lv>=5})})}
function openGarage(){render();$('racingGarage')?.classList.remove('hidden')}
function closeGarage(){$('racingGarage')?.classList.add('hidden')}
function addCoins(amount,reason=''){amount=Math.max(0,Math.floor(amount));if(!amount)return;profile.coins+=amount;queueSave();const toast=$('coinToast');if(toast){toast.textContent=`🪙 +${amount}${reason?'  '+reason:''}`;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1200)}}
function raceFinished(place,time){profile.races++;if(place===1)profile.wins++;const reward=Math.max(20,120-place*15)+Math.max(0,Math.floor(80-time));addCoins(reward,'レース報酬')}
function addOnlineButton(){const start=$('start');if(!start||$('openOnlineRacing'))return;const b=document.createElement('a');b.id='openOnlineRacing';b.href='./racing-online.html';b.className='button';b.textContent='🌐 オンライン対戦（部屋番号）';start.insertAdjacentElement('afterend',b)}
window.RacingAccount={getProfile:()=>({...profile}),addCoins,raceFinished,openGarage,closeGarage,logout,getMode:()=>mode};
addEventListener('DOMContentLoaded',()=>{
$('googleRacingLogin')?.addEventListener('click',googleLogin);$('guestRacingLogin')?.addEventListener('click',guestLogin);$('openGarage')?.addEventListener('click',openGarage);$('closeGarage')?.addEventListener('click',closeGarage);$('racingLogout')?.addEventListener('click',logout);document.querySelectorAll('[data-upgrade-button]').forEach(b=>b.addEventListener('click',()=>upgrade(b.dataset.upgradeButton)));
addOnlineButton();
const session=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');if(session?.mode==='guest'){mode='guest';profile=localLoad();showGame()}else{$('racingLogin')?.classList.remove('hidden');$('menu')?.classList.add('hidden')}render();
});
})();