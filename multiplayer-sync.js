(()=>{
'use strict';
if(window.ShooMultiplayerSync)return;
const S={db:null,auth:null,room:'',ref:null,unsub:null,me:null,players:new Map(),canvas:null,ctx:null,lastSend:0,lastShot:0,shotSeq:0,keys:new Set(),px:.5,py:.72,aimX:.5,aimY:.2,raf:0,active:false};
const ROOM_KEY='shooking2_online_room';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const serverTime=()=>window.firebase?.firestore?.FieldValue?.serverTimestamp?.()||new Date();
function gameCanvas(){return document.getElementById('game')||document.querySelector('canvas');}
function ensureOverlay(){
 const base=gameCanvas(); if(!base)return false;
 if(!S.canvas){S.canvas=document.createElement('canvas');S.canvas.id='pveWorldOverlay';S.canvas.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:1;pointer-events:none';document.body.appendChild(S.canvas);S.ctx=S.canvas.getContext('2d')}
 const dpr=Math.min(devicePixelRatio||1,2),w=innerWidth,h=innerHeight;
 if(S.canvas.width!==Math.round(w*dpr)||S.canvas.height!==Math.round(h*dpr)){S.canvas.width=Math.round(w*dpr);S.canvas.height=Math.round(h*dpr);S.ctx.setTransform(dpr,0,0,dpr,0,0)}
 return true;
}
function readLocalPosition(){
 const roots=[window.player,window.gameState,window.state,window.game,window.ship].filter(Boolean);
 for(const r of roots){
  const x=Number(r.x??r.playerX??r.shipX),y=Number(r.y??r.playerY??r.shipY);
  if(Number.isFinite(x)&&Number.isFinite(y)){
   const c=gameCanvas();const w=c?.width||innerWidth,h=c?.height||innerHeight;
   return {x:clamp(x/(w||1)),y:clamp(y/(h||1))};
  }
 }
 let dx=0,dy=0;if(S.keys.has('ArrowLeft')||S.keys.has('a'))dx--;if(S.keys.has('ArrowRight')||S.keys.has('d'))dx++;if(S.keys.has('ArrowUp')||S.keys.has('w'))dy--;if(S.keys.has('ArrowDown')||S.keys.has('s'))dy++;
 S.px=clamp(S.px+dx*.006);S.py=clamp(S.py+dy*.006);return{x:S.px,y:S.py};
}
function readHp(){const roots=[window.player,window.gameState,window.state,window.game,window.ship].filter(Boolean);for(const r of roots){const hp=Number(r.hp??r.health),max=Number(r.maxHp??r.maxHealth);if(Number.isFinite(hp))return{hp,maxHp:Number.isFinite(max)?max:100,down:hp<=0}}return{hp:100,maxHp:100,down:false}}
async function sendState(force=false){if(!S.ref||!S.active)return;const n=performance.now();if(!force&&n-S.lastSend<90)return;S.lastSend=n;const p=readLocalPosition();S.px=p.x;S.py=p.y;const h=readHp();try{await S.ref.set({worldX:p.x,worldY:p.y,aimX:S.aimX,aimY:S.aimY,hp:h.hp,maxHp:h.maxHp,down:h.down,shotSeq:S.shotSeq,shotAt:S.lastShot?serverTime():null,inGame:true,online:true,lastSeen:serverTime()},{merge:true})}catch{}}
function fire(x=S.aimX,y=S.aimY){if(!S.active)return;S.aimX=clamp(x);S.aimY=clamp(y);S.shotSeq++;S.lastShot=Date.now();sendState(true);window.dispatchEvent(new CustomEvent('shoo:local-online-shot',{detail:{x:S.aimX,y:S.aimY,seq:S.shotSeq}}))}
function drawShip(ctx,x,y,name,hp,maxHp,down){
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=down?.35:1;ctx.fillStyle=down?'#64748b':'#22d3ee';ctx.strokeStyle='#e0f2fe';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(13,14);ctx.lineTo(0,8);ctx.lineTo(-13,14);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
 ctx.font='700 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(name,x,y+31);const ratio=clamp((Number(hp)||0)/(Number(maxHp)||100));ctx.fillStyle='rgba(15,23,42,.9)';ctx.fillRect(x-25,y+36,50,5);ctx.fillStyle=down?'#ef4444':'#22c55e';ctx.fillRect(x-25,y+36,50*ratio,5);if(down){ctx.fillStyle='#fca5a5';ctx.fillText('DOWN',x,y-25)}
}
function loop(){S.raf=requestAnimationFrame(loop);if(!S.active||!ensureOverlay()){if(S.ctx)S.ctx.clearRect(0,0,innerWidth,innerHeight);return}const ctx=S.ctx;ctx.clearRect(0,0,innerWidth,innerHeight);const now=Date.now();for(const [uid,p] of S.players){if(uid===S.auth?.currentUser?.uid||p.inGame!==true)continue;const x=clamp(Number(p.worldX)||.5)*innerWidth,y=clamp(Number(p.worldY)||.5)*innerHeight;drawShip(ctx,x,y,String(p.name||'ALLY').slice(0,18),p.hp,p.maxHp,p.down);if(p.shotSeq&&p.shotSeq!==p._drawnShot){p._drawnShot=p.shotSeq;p._beamUntil=now+140;window.dispatchEvent(new CustomEvent('shoo:remote-shot',{detail:{uid,x:p.worldX,y:p.worldY,aimX:p.aimX,aimY:p.aimY,seq:p.shotSeq}}))}if(p._beamUntil>now){ctx.strokeStyle='rgba(125,249,255,.95)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-18);ctx.lineTo(clamp(Number(p.aimX)||.5)*innerWidth,clamp(Number(p.aimY)||.2)*innerHeight);ctx.stroke()}}
 sendState(false);
}
async function connect(){
 const code=localStorage.getItem(ROOM_KEY)||'';if(!code||!window.firebase?.apps?.length)return;
 try{S.auth=firebase.auth();S.db=firebase.firestore();if(!S.auth.currentUser)return;S.room=code;S.ref=S.db.collection('pveRooms').doc(code).collection('players').doc(S.auth.currentUser.uid);S.unsub?.();S.unsub=S.db.collection('pveRooms').doc(code).collection('players').onSnapshot(s=>{S.players.clear();s.forEach(d=>S.players.set(d.id,{id:d.id,...d.data()}));S.active=true});await sendState(true)}catch(e){console.warn('multiplayer sync connect failed',e)}
}
function pointerAim(e){const x=clamp(e.clientX/innerWidth),y=clamp(e.clientY/innerHeight);S.aimX=x;S.aimY=y}
addEventListener('keydown',e=>{S.keys.add(e.key);if((e.code==='Space'||e.key==='Enter')&&!e.repeat)fire()});addEventListener('keyup',e=>S.keys.delete(e.key));addEventListener('pointermove',pointerAim,{passive:true});addEventListener('pointerdown',e=>{const t=e.target;if(t&&['BUTTON','INPUT','TEXTAREA','SELECT'].includes(t.tagName))return;pointerAim(e);fire(S.aimX,S.aimY)},{passive:true});addEventListener('beforeunload',()=>{S.ref?.set({inGame:false,online:false,lastSeen:serverTime()},{merge:true}).catch(()=>{})});
window.ShooMultiplayerSync={connect,fire,get players(){return [...S.players.values()]},get active(){return S.active}};
setInterval(connect,3000);connect();loop();
})();