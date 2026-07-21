(()=>{
'use strict';

const CONFIG_KEY='shooking2_firebase_config';
const ROOM_KEY='shooking2_online_room';
const VERSION='10.12.5';
const MAX_PLAYERS=4;
let app=null,auth=null,db=null;
let roomCode='',roomRef=null,playerRef=null,currentRoom=null;
let roomUnsub=null,playersUnsub=null,chatUnsub=null;
let heartbeat=null,currentPlayers=[];

const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const now=()=>firebase.firestore.FieldValue.serverTimestamp();
function status(text,error=false){const el=$('onlineStatus');if(!el)return;el.innerHTML=text;el.style.borderColor=error?'#ef4444':'#38bdf8'}
function config(){try{return JSON.parse(localStorage.getItem(CONFIG_KEY)||'null')}catch{return null}}
function valid(c){return !!(c?.apiKey&&c?.authDomain&&c?.projectId&&c?.appId)}
function load(src,id){return new Promise((res,rej)=>{if($(id))return res();const s=document.createElement('script');s.id=id;s.src=src;s.onload=res;s.onerror=()=>rej(new Error('Firebase SDKを読み込めません'));document.head.appendChild(s)})}

async function ensureFirebase(){
 if(db&&auth)return;
 const c=config();if(!valid(c))throw new Error('設定画面でFirebase設定を保存してください');
 await load(`https://www.gstatic.com/firebasejs/${VERSION}/firebase-app-compat.js`,'firebaseAppSdk');
 await load(`https://www.gstatic.com/firebasejs/${VERSION}/firebase-auth-compat.js`,'firebaseAuthSdk');
 await load(`https://www.gstatic.com/firebasejs/${VERSION}/firebase-firestore-compat.js`,'firebaseFirestoreSdk');
 app=firebase.apps.length?firebase.app():firebase.initializeApp(c);auth=firebase.auth();db=firebase.firestore();
 await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
 if(!auth.currentUser){
  try{await auth.signInAnonymously()}catch(e){throw new Error('Googleログインするか、Firebase Authenticationで匿名ログインを有効にしてください')}
 }
}
function playerName(){const typed=($('onlineName')?.value||'').trim();if(typed)return typed.slice(0,18);let saved=null;try{saved=JSON.parse(localStorage.getItem('shooking2_current_account')||'null')}catch{}return String(saved?.accountName||auth?.currentUser?.displayName||'PLAYER').slice(0,18)}
function makeCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<6;i++)s+=chars[Math.floor(Math.random()*chars.length)];return s}

function installUi(){
 const screen=$('onlinePlay');if(!screen)return;const panel=screen.querySelector('.panel');if(!panel||$('pveRoomControls'))return;
 panel.innerHTML=`<h1>オンラインPvE協力</h1><p class="small">最大4人。部屋コードで参加し、全員準備後にホストが開始します。</p><div id="pveRoomControls"><input id="onlineName" maxlength="18" placeholder="プレイヤー名"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button onclick="createPveRoom()">部屋を作る</button><button onclick="quickJoinPveRoom()">クイック参加</button></div><input id="roomName" maxlength="6" placeholder="6文字の部屋コード" style="text-transform:uppercase"><button onclick="joinOnlineRoom()">コードで参加</button></div><div class="onlineCard" id="onlineStatus">未接続</div><div id="pvePlayerList" class="onlineCard" style="text-align:left;margin-top:10px">参加者はいません</div><button id="pveReadyButton" onclick="togglePveReady()" disabled>準備OK</button><button id="pveStartButton" onclick="startGameFromOnline()" disabled>協力ミッション開始</button><div class="chatbox" id="chatBox" style="margin-top:10px"></div><input id="chatInput" maxlength="100" placeholder="メッセージ（100文字まで）"><button onclick="sendChat()">送信</button><button onclick="leavePveRoom()" class="back">ルームから退出</button><button class="back" onclick="openScreen('home')">ホームへ戻る</button>`;
 $('chatInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();sendChat()}});restoreRoom();
}

async function createRoom(){try{await ensureFirebase();await leaveRoom(false);const code=makeCode();const ref=db.collection('pveRooms').doc(code);await ref.set({code,hostUid:auth.currentUser.uid,status:'lobby',stage:1,maxPlayers:MAX_PLAYERS,createdAt:now(),updatedAt:now()});await enterRoom(code,true)}catch(e){console.error(e);status('作成エラー：'+e.message,true)}}
async function quickJoin(){try{await ensureFirebase();const snap=await db.collection('pveRooms').where('status','==','lobby').limit(12).get();for(const d of snap.docs){const ps=await d.ref.collection('players').get();if(ps.size<MAX_PLAYERS){await enterRoom(d.id,false);return}}await createRoom()}catch(e){console.error(e);status('クイック参加エラー：'+e.message,true)}}
async function joinByCode(){const code=($('roomName')?.value||'').trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(code)){status('6文字の部屋コードを入力してください。',true);return}try{await ensureFirebase();await enterRoom(code,false)}catch(e){console.error(e);status('参加エラー：'+e.message,true)}}

async function enterRoom(code,created){
 await leaveRoom(false);const ref=db.collection('pveRooms').doc(code);const rs=await ref.get();if(!rs.exists)throw new Error('部屋が見つかりません');if(rs.data().status!=='lobby')throw new Error('この部屋はすでに開始しています');
 const ps=await ref.collection('players').get();if(ps.size>=MAX_PLAYERS&&!ps.docs.some(d=>d.id===auth.currentUser.uid))throw new Error('この部屋は満員です');
 roomCode=code;roomRef=ref;currentRoom=rs.data();playerRef=ref.collection('players').doc(auth.currentUser.uid);
 await playerRef.set({uid:auth.currentUser.uid,name:playerName(),ready:false,online:true,joinedAt:now(),lastSeen:now()},{merge:true});localStorage.setItem(ROOM_KEY,code);subscribeRoom();heartbeat=setInterval(()=>playerRef?.set({online:true,lastSeen:now()},{merge:true}).catch(()=>{}),10000);status(`接続中：<b>${esc(code)}</b>　${created?'あなたがホストです':'参加しました'}`);if($('roomName'))$('roomName').value=code;
}
function subscribeRoom(){
 roomUnsub=roomRef.onSnapshot(s=>{if(!s.exists){status('部屋が終了しました。',true);leaveRoom(false);return}currentRoom=s.data();renderPlayers();if(currentRoom.status==='playing'&&currentRoom.startedAt){status(`ミッション開始！ 部屋 <b>${esc(roomCode)}</b>`);showTeamHud();if(typeof window.openStageSelect==='function')window.openStageSelect()}});
 playersUnsub=roomRef.collection('players').orderBy('joinedAt').onSnapshot(s=>{currentPlayers=s.docs.map(d=>({id:d.id,...d.data()}));renderPlayers();showTeamHud()});
 chatUnsub=roomRef.collection('messages').orderBy('createdAt','asc').limitToLast(40).onSnapshot(s=>{const box=$('chatBox');if(!box)return;box.innerHTML=s.docs.map(d=>{const m=d.data();return `<div class="chatmsg"><b>${esc(m.name)}</b>：${esc(m.text)}</div>`}).join('');box.scrollTop=box.scrollHeight});
}
function renderPlayers(){
 const box=$('pvePlayerList');if(!box)return;const host=currentRoom?.hostUid||'';let html=`<b>ROOM ${esc(roomCode||'------')}</b><br>`;
 for(let i=0;i<MAX_PLAYERS;i++){const p=currentPlayers[i];html+=p?`<div style="padding:7px 0;border-bottom:1px solid #334155">${p.id===host?'👑':'👤'} ${esc(p.name)}　${p.ready?'✅ 準備OK':'⌛ 待機中'}</div>`:`<div style="padding:7px 0;opacity:.55">□ 空き</div>`}
 box.innerHTML=html;const me=currentPlayers.find(p=>p.id===auth?.currentUser?.uid);const ready=$('pveReadyButton');if(ready){ready.disabled=!me;ready.textContent=me?.ready?'準備を取り消す':'準備OK'}const allReady=currentPlayers.length>0&&currentPlayers.every(p=>p.ready);const start=$('pveStartButton');if(start){start.disabled=!(host===auth?.currentUser?.uid&&allReady);start.textContent=allReady?'協力ミッション開始':'全員の準備待ち'}
}
async function toggleReady(){if(!playerRef)return status('先に部屋へ参加してください。',true);const s=await playerRef.get();await playerRef.set({ready:!s.data()?.ready,lastSeen:now()},{merge:true})}
async function send(){const input=$('chatInput');const text=(input?.value||'').trim();if(!text||!roomRef)return;await roomRef.collection('messages').add({uid:auth.currentUser.uid,name:playerName(),text:text.slice(0,100),createdAt:now()});input.value=''}
async function start(){if(!roomRef)return status('部屋へ参加してください。',true);const rs=await roomRef.get();if(rs.data()?.hostUid!==auth.currentUser.uid)return status('開始できるのはホストだけです。',true);const ps=await roomRef.collection('players').get();if(!ps.size||ps.docs.some(d=>!d.data().ready))return status('全員が準備OKになるまで開始できません。',true);await roomRef.update({status:'playing',startedAt:now(),updatedAt:now()})}
function showTeamHud(){let hud=$('pveTeamHud');if(!roomCode){hud?.remove();return}if(!hud){hud=document.createElement('div');hud.id='pveTeamHud';hud.style.cssText='position:fixed;right:10px;top:70px;z-index:4;background:rgba(2,6,23,.78);border:1px solid #38bdf8;border-radius:12px;padding:9px;font:12px system-ui;max-width:190px';document.body.appendChild(hud)}hud.innerHTML='<b>ONLINE TEAM</b>'+currentPlayers.map(p=>`<div>🟢 ${esc(p.name)}</div>`).join('')}
async function leaveRoom(remove=true){clearInterval(heartbeat);heartbeat=null;roomUnsub?.();playersUnsub?.();chatUnsub?.();roomUnsub=playersUnsub=chatUnsub=null;if(remove&&playerRef){try{await playerRef.delete()}catch{}}roomCode='';roomRef=playerRef=null;currentRoom=null;currentPlayers=[];localStorage.removeItem(ROOM_KEY);$('pveTeamHud')?.remove();if($('pvePlayerList'))$('pvePlayerList').textContent='参加者はいません';status('未接続')}
async function restoreRoom(){const saved=localStorage.getItem(ROOM_KEY);if(!saved)return;try{await ensureFirebase();await enterRoom(saved,false)}catch{localStorage.removeItem(ROOM_KEY)}}

window.createPveRoom=createRoom;window.quickJoinPveRoom=quickJoin;window.joinOnlineRoom=joinByCode;window.togglePveReady=toggleReady;window.sendChat=send;window.startGameFromOnline=start;window.leavePveRoom=()=>leaveRoom(true);
window.addEventListener('beforeunload',()=>{if(playerRef)playerRef.set({online:false,lastSeen:now()},{merge:true}).catch(()=>{})});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installUi);else installUi();
})();