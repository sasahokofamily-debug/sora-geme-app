(()=>{
'use strict';
if(window.ShooAdminMode)return;
const S={auth:null,db:null,uid:'',role:'player',admin:false,profile:null,panel:null};
const ROLES={developer:3,admin:2,moderator:1,player:0};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ts=()=>firebase.firestore.FieldValue.serverTimestamp();
const can=role=>(ROLES[S.role]||0)>=(ROLES[role]||99);
function deny(){throw new Error('管理者権限がありません');}
async function refreshPermission(){
 if(!S.db||!S.auth?.currentUser){S.admin=false;S.role='player';return false}
 S.uid=S.auth.currentUser.uid;
 const d=await S.db.collection('admins').doc(S.uid).get();
 const x=d.exists?d.data():null;
 S.admin=!!(x&&x.active===true&&ROLES[x.role||'admin']>0);
 S.role=S.admin?(x.role||'admin'):'player';S.profile=x;
 if(S.admin)installEntry();else removeAdminUi();
 return S.admin;
}
async function requireAdmin(min='moderator'){
 await refreshPermission();
 if(!S.admin||!can(min))deny();
 return true;
}
function removeAdminUi(){document.getElementById('shooAdminEntry')?.remove();document.getElementById('shooAdminBadge')?.remove();document.getElementById('shooAdminPanel')?.remove()}
function installEntry(){
 if(document.getElementById('shooAdminEntry'))return;
 const badge=document.createElement('div');badge.id='shooAdminBadge';badge.textContent=`👑 ${S.role.toUpperCase()} MODE`;badge.style.cssText='position:fixed;right:12px;bottom:12px;z-index:999991;background:#3b0764;color:#fff;border:1px solid #c084fc;border-radius:999px;padding:7px 11px;font:700 12px system-ui;pointer-events:none';document.body.appendChild(badge);
 const b=document.createElement('button');b.id='shooAdminEntry';b.textContent='👑 管理者モード';b.style.cssText='position:fixed;right:12px;bottom:52px;z-index:999992;padding:10px 14px;border-radius:12px;background:#581c87;color:white;border:1px solid #c084fc;font-weight:800';b.onclick=openPanel;document.body.appendChild(b);
}
function field(id,placeholder,type='text'){return `<input id="${id}" type="${type}" placeholder="${esc(placeholder)}" style="width:100%;margin:5px 0;padding:9px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#fff">`}
function btn(id,text){return `<button id="${id}" style="padding:9px 12px;margin:4px;border-radius:9px">${esc(text)}</button>`}
async function openPanel(){
 try{await requireAdmin('moderator')}catch{return}
 removeAdminUi();installEntry();
 const e=document.createElement('div');e.id='shooAdminPanel';e.style.cssText='position:fixed;inset:0;z-index:999999;background:rgba(2,6,23,.97);overflow:auto;color:#e2e8f0;font-family:system-ui;padding:18px';
 e.innerHTML=`<div style="max-width:860px;margin:auto;background:#111827;border:1px solid #7e22ce;border-radius:18px;padding:18px"><h1>👑 管理者モード</h1><p>UID: ${esc(S.uid)} / 権限: <b>${esc(S.role)}</b></p><div id="admResult" style="min-height:24px;color:#93c5fd"></div>
 <section><h2>📢 全体お知らせ</h2>${field('admNews','表示する文章')}${btn('admSendNews','送信')}</section>
 <section><h2>👥 プレイヤー管理</h2>${field('admUid','対象UID')}${field('admReason','理由')}${btn('admBan','BAN')}${btn('admUnban','BAN解除')}${btn('admPlayer','プレイヤー情報')}</section>
 <section><h2>🎁 配布</h2>${field('admCoin','コイン数','number')}${field('admItem','アイテムID')}${btn('admGrant','配布')}</section>
 <section><h2>👾 運営コマンド</h2>${field('admBoss','ボスID')}${btn('admSpawnBoss','ボス出現')}${field('admEvent','イベント名')}${btn('admStartEvent','イベント開始')}${btn('admStopEvent','イベント終了')}</section>
 <section><h2>📋 ログ</h2>${btn('admLoadLogs','チートログ更新')}<div id="admLogs" style="max-height:260px;overflow:auto;background:#020617;padding:10px;border-radius:10px"></div></section>
 ${btn('admClose','閉じる')}</div>`;
 document.body.appendChild(e);bindPanel();loadLogs();
}
function result(t,bad=false){const e=document.getElementById('admResult');if(e){e.textContent=t;e.style.color=bad?'#fca5a5':'#93c5fd'}}
async function audit(action,target='',detail={}){await S.db.collection('adminLogs').add({action,target,detail,adminUid:S.uid,role:S.role,createdAt:ts()})}
async function act(min,fn){try{await requireAdmin(min);await fn()}catch(e){result(e.message||String(e),true)}}
function bindPanel(){
 document.getElementById('admClose').onclick=()=>document.getElementById('shooAdminPanel')?.remove();
 document.getElementById('admSendNews').onclick=()=>act('admin',async()=>{const message=document.getElementById('admNews').value.trim();if(!message)return;await S.db.collection('globalAnnouncements').add({message:message.slice(0,180),active:true,createdAt:ts(),createdBy:S.uid});await audit('announcement','global',{message});result('全体お知らせを送信しました')});
 document.getElementById('admBan').onclick=()=>setBan(true);
 document.getElementById('admUnban').onclick=()=>setBan(false);
 document.getElementById('admPlayer').onclick=()=>act('moderator',async()=>{const uid=document.getElementById('admUid').value.trim();if(!uid)return;const [ban,player]=await Promise.all([S.db.collection('bans').doc(uid).get(),S.db.collection('players').doc(uid).get()]);result(`UID ${uid} / BAN ${ban.exists&&ban.data().active?'有効':'なし'} / PLAYER ${player.exists?JSON.stringify(player.data()).slice(0,500):'未登録'}`)});
 document.getElementById('admGrant').onclick=()=>act('developer',async()=>{const uid=document.getElementById('admUid').value.trim(),coins=Number(document.getElementById('admCoin').value||0),item=document.getElementById('admItem').value.trim();if(!uid)return;await S.db.collection('adminRewards').add({uid,coins:Number.isFinite(coins)?coins:0,item:item||null,status:'pending',createdAt:ts(),createdBy:S.uid});await audit('grant_reward',uid,{coins,item});result('配布リクエストを登録しました')});
 document.getElementById('admSpawnBoss').onclick=()=>act('admin',async()=>{const bossId=document.getElementById('admBoss').value.trim()||'boss';await S.db.collection('serverCommands').add({type:'spawnBoss',bossId,active:true,createdAt:ts(),createdBy:S.uid});await audit('spawn_boss',bossId);result('ボス出現コマンドを送信しました')});
 document.getElementById('admStartEvent').onclick=()=>eventAction(true);
 document.getElementById('admStopEvent').onclick=()=>eventAction(false);
 document.getElementById('admLoadLogs').onclick=loadLogs;
}
function setBan(active){return act('moderator',async()=>{const uid=document.getElementById('admUid').value.trim(),reason=document.getElementById('admReason').value.trim()||'管理者操作';if(!uid)return;if(uid===S.uid&&active)throw new Error('自分自身はBANできません');await S.db.collection('bans').doc(uid).set({uid,active,reason,updatedAt:ts(),by:S.uid},{merge:true});await audit(active?'ban':'unban',uid,{reason});result(active?'BANしました':'BANを解除しました')})}
function eventAction(active){return act('admin',async()=>{const name=document.getElementById('admEvent').value.trim()||'イベント';await S.db.collection('serverState').doc('event').set({name,active,updatedAt:ts(),updatedBy:S.uid},{merge:true});await audit(active?'event_start':'event_stop','event',{name});result(active?'イベントを開始しました':'イベントを終了しました')})}
async function loadLogs(){return act('moderator',async()=>{const box=document.getElementById('admLogs');if(!box)return;box.textContent='読み込み中...';const s=await S.db.collection('cheatLogs').orderBy('createdAt','desc').limit(80).get();box.innerHTML=s.docs.map(d=>{const x=d.data();return `<div style="padding:7px;border-bottom:1px solid #334155"><b>${esc(x.type)}</b>　${esc(x.uid)}<br><small>${esc(x.detail)}</small></div>`}).join('')||'ログなし'})}
async function init(){
 for(let i=0;i<100;i++){if(window.firebase?.apps?.length&&firebase.auth().currentUser){S.auth=firebase.auth();S.db=firebase.firestore();break}await new Promise(r=>setTimeout(r,250))}
 if(!S.db)return;
 S.auth.onAuthStateChanged(()=>refreshPermission().catch(removeAdminUi));
 await refreshPermission();
 setInterval(()=>refreshPermission().catch(removeAdminUi),30000);
}
window.ShooAdminMode={open:openPanel,refresh:refreshPermission,get role(){return S.role},get active(){return S.admin}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();