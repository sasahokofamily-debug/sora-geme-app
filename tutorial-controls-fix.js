(()=>{
'use strict';
const V='practice-v2-lite';
const STEPS=[
['ようこそ','こんにちは！ぼくは案内役のNyanD。SHOO KING IIの遊び方を最初から説明するよ。'],
['ホーム','ここがホーム画面。出撃、ショップ、格納庫、ガチャなどへ進めるよ。','home','#home'],
['ゲーム開始','出撃ボタンからステージを選べるよ。NyanDのマウスが出撃ボタンを案内するよ。今は押さずに次へ進んで大丈夫。','home','button[onclick*="openStageSelect"],button[onclick*="startGame"]'],
['スマホで移動','左下のスティックを実際に動かしてみよう。これは軽量な操作練習なのでセーブには影響しないよ。',null,null,'move'],
['スマホで攻撃','右下のFIREを押して標的を撃ってみよう。ここでは標的は止まっているけど、本番では敵が動き回り、こちらへ攻撃もしてくるよ。',null,null,'fire'],
['パソコン操作','WASDか矢印キーで移動。マウスで狙い、クリックかSpaceで攻撃できるよ。本番では敵も移動しながら攻撃してくるよ。',null,null,'pc'],
['コインと強化','敵を倒すとコインや報酬が手に入るよ。格納庫やショップで強化できる。','home','button[onclick*="openHangar"],button[onclick*="Hangar"]'],
['ガチャ','ガチャでは新しい装備や限定アイテムを入手できるよ。','home','button[onclick*="gacha" i]'],
['オンライン','オンラインでは部屋に入り、味方と協力して戦えるよ。','home','button[onclick*="Online"],button[onclick*="online"]'],
['保存について','Googleログイン中はクラウド保存できるよ。ゲストでは保存されないよ。'],
['完了','チュートリアル完了！設定から開くと毎回最初から始まるよ。']
];
const css=document.createElement('style');
css.textContent=`
#nyandTutorialV2{position:fixed;inset:0;z-index:2147483000;display:none;background:rgba(1,4,9,.82);color:#e6edf3;font-family:system-ui,sans-serif}#nyandTutorialV2.show{display:block}#nyandTutorialV2 *{box-sizing:border-box}
#nyandPracticeV2{position:absolute;inset:0;display:none;background:radial-gradient(circle at 50% 42%,#12345b 0,#061329 42%,#020617 78%);overflow:hidden}#nyandPracticeV2::before{content:"";position:absolute;inset:0;opacity:.18;background-image:linear-gradient(rgba(56,189,248,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,.35) 1px,transparent 1px),radial-gradient(circle,#fff 0 1px,transparent 1.5px);background-size:80px 80px,80px 80px,96px 96px;pointer-events:none}#nyandPracticeV2.show{display:block}#nyandCanvasV2{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}
#nyandHudV2{position:absolute;left:12px;top:12px;z-index:2;padding:9px 12px;border:1px solid rgba(56,189,248,.75);border-radius:12px;background:rgba(2,6,23,.9);font-size:12px;font-weight:800;line-height:1.55;pointer-events:none;box-shadow:0 8px 24px rgba(0,0,0,.28)}#nyandHudV2 b{color:#67e8f9}
#nyandJoyV2,#nyandFireV2{position:absolute;z-index:4;bottom:28px;pointer-events:auto;touch-action:none;user-select:none}#nyandJoyV2{left:22px;width:126px;height:126px;border-radius:50%;border:2px solid #7df9ff;background:rgba(15,23,42,.78);box-shadow:0 0 18px rgba(56,189,248,.35)}#nyandStickV2{position:absolute;left:39px;top:39px;width:44px;height:44px;border-radius:50%;background:#38bdf8;box-shadow:0 0 12px rgba(56,189,248,.8)}
#nyandFireV2{right:26px;width:92px;height:92px;border-radius:50%;border:2px solid #fb923c;background:rgba(124,45,18,.92);color:#fff;font-size:19px;font-weight:1000;box-shadow:0 0 18px rgba(249,115,22,.45)}#nyandJoyV2.focus,#nyandFireV2.focus{outline:3px solid #facc15;box-shadow:0 0 0 7px rgba(250,204,21,.18),0 0 22px rgba(250,204,21,.58)}
#nyandCardV2{position:absolute;z-index:6;left:50%;bottom:24px;transform:translateX(-50%);width:min(680px,calc(100vw - 24px));padding:18px;border:1px solid #30363d;border-radius:18px;background:rgba(13,17,23,.97);box-shadow:0 20px 58px rgba(0,0,0,.66)}#nyandHeadV2{display:flex;gap:12px;align-items:center;margin-bottom:12px}#nyandFaceV2{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;background:#161b22;border:1px solid #30363d;font-size:28px}#nyandTitleV2{font-size:18px;font-weight:900}#nyandProgressV2{margin-left:auto;color:#8b949e;font-size:12px;font-weight:800}#nyandTextV2{min-height:66px;line-height:1.65;color:#c9d1d9}#nyandHintV2{min-height:20px;margin-top:8px;color:#79c0ff;font-size:12px;font-weight:800}#nyandActionsV2{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}#nyandActionsV2 button{min-height:40px;padding:0 14px;border:1px solid #30363d;border-radius:9px;background:#21262d;color:#fff;font-weight:800}#nyandNextV2{background:#238636!important}.nyand-v2-target{position:relative!important;z-index:2147483100!important;outline:3px solid #58a6ff!important;box-shadow:0 0 0 6px rgba(88,166,255,.18)!important}
@media(max-width:700px),(pointer:coarse){#nyandCardV2{top:58px;bottom:auto;width:calc(100vw - 16px);max-height:39dvh;overflow:auto;padding:12px}#nyandFaceV2{width:40px;height:40px;font-size:22px}#nyandTitleV2{font-size:15px}#nyandTextV2{min-height:42px;font-size:13px}#nyandActionsV2{display:grid;grid-template-columns:1fr 1fr 1fr}#nyandHudV2{top:auto;bottom:158px}#nyandJoyV2{width:112px;height:112px}#nyandStickV2{left:34px;top:34px}}
@media(prefers-reduced-motion:reduce){#nyandTutorialV2 *{animation:none!important}}
`;
document.head.appendChild(css);
let root,practice,canvas,ctx,hud,joy,stick,fire,step=0,target=null,returnScreen='home',raf=0,last=0,lastDraw=0,active=false,mode='',W=0,H=0,D=1;
let ship={x:0,y:0,a:0},aim={x:0,y:0},keys={},j={x:0,y:0,id:null},bullets=[],targets=[],moved=false,fired=false,hits=0,sx=0,sy=0,lastShot=0;
const goScreen=n=>{try{if(typeof window.openScreen==='function')window.openScreen(n);else if(typeof window.showScreen==='function')window.showScreen(n);else{document.querySelectorAll('.screen').forEach(e=>e.classList.add('hidden'));document.getElementById(n)?.classList.remove('hidden')}}catch{}};
function build(){
  if(root)return;
  root=document.createElement('div');root.id='nyandTutorialV2';
  root.innerHTML=`<div id="nyandPracticeV2"><canvas id="nyandCanvasV2"></canvas><div id="nyandHudV2"></div><div id="nyandJoyV2"><div id="nyandStickV2"></div></div><button id="nyandFireV2">FIRE</button></div><div id="nyandCardV2"><div id="nyandHeadV2"><div id="nyandFaceV2">🐱</div><div id="nyandTitleV2"></div><div id="nyandProgressV2"></div></div><div id="nyandTextV2"></div><div id="nyandHintV2"></div><div id="nyandActionsV2"><button id="nyandSkipV2">スキップ</button><button id="nyandPrevV2">戻る</button><button id="nyandNextV2">次へ</button></div></div>`;
  document.body.appendChild(root);
  practice=root.querySelector('#nyandPracticeV2');canvas=root.querySelector('#nyandCanvasV2');ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});hud=root.querySelector('#nyandHudV2');joy=root.querySelector('#nyandJoyV2');stick=root.querySelector('#nyandStickV2');fire=root.querySelector('#nyandFireV2');
  root.querySelector('#nyandSkipV2').onclick=close;root.querySelector('#nyandPrevV2').onclick=()=>{if(step){step--;render()}};root.querySelector('#nyandNextV2').onclick=()=>{if(step===STEPS.length-1){localStorage.setItem('shookingTutorialCompleted','1');close()}else{step++;render()}};
  setupInput();resize();
}
function setupInput(){
  addEventListener('resize',resize,{passive:true});
  addEventListener('keydown',e=>{if(!active)return;keys[e.key.toLowerCase()]=1;if(e.code==='Space'||e.key===' '){e.preventDefault();shoot()}},true);
  addEventListener('keyup',e=>{delete keys[e.key.toLowerCase()]},true);
  canvas.addEventListener('pointermove',e=>{aim.x=e.clientX;aim.y=e.clientY},{passive:true});
  canvas.addEventListener('pointerdown',e=>{aim.x=e.clientX;aim.y=e.clientY;shoot()});
  fire.addEventListener('pointerdown',e=>{e.preventDefault();shoot()});
  joy.addEventListener('pointerdown',e=>{e.preventDefault();j.id=e.pointerId;joy.setPointerCapture?.(e.pointerId);joyMove(e)});
  joy.addEventListener('pointermove',e=>{if(e.pointerId===j.id)joyMove(e)});
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>joy.addEventListener(n,joyReset));
}
function joyMove(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,max=r.width*.29;let dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy)||1;if(d>max){dx=dx/d*max;dy=dy/d*max}j.x=dx/max;j.y=dy/max;stick.style.transform=`translate(${dx}px,${dy}px)`}
function joyReset(){j={x:0,y:0,id:null};if(stick)stick.style.transform='translate(0,0)'}
function resize(){W=innerWidth;H=innerHeight;if(!canvas)return;D=Math.min(matchMedia('(pointer:coarse)').matches?1.15:1.4,devicePixelRatio||1);canvas.width=Math.max(1,Math.floor(W*D));canvas.height=Math.max(1,Math.floor(H*D));ctx.setTransform(D,0,0,D,0,0);makeTargets()}
function makeTargets(){targets=[{x:W*.35,y:H*.27,r:27},{x:W*.68,y:H*.29,r:24}]}
function shoot(){if(!active||performance.now()-lastShot<150)return;lastShot=performance.now();const a=Math.atan2(aim.y-ship.y,aim.x-ship.x);if(bullets.length>22)bullets.shift();bullets.push({x:ship.x,y:ship.y,vx:Math.cos(a)*660,vy:Math.sin(a)*660,l:1.35});fired=true;try{window.sound?.(760,.035,'square',.02)}catch{}}
function startPractice(m){mode=m;active=true;practice.classList.add('show');joy.classList.toggle('focus',m==='move');fire.classList.toggle('focus',m==='fire');ship.x=W*.5;ship.y=H*.65;sx=ship.x;sy=ship.y;aim.x=W*.5;aim.y=H*.25;last=performance.now();lastDraw=0;cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function stopPractice(){active=false;cancelAnimationFrame(raf);practice?.classList.remove('show');joy?.classList.remove('focus');fire?.classList.remove('focus');joyReset();keys={};bullets=[]}
function loop(t){
  if(!active)return;
  if(t-lastDraw<33){raf=requestAnimationFrame(loop);return}
  const dt=Math.min(.05,(t-last)/1000||0);last=t;lastDraw=t;
  let mx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),my=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
  if(Math.abs(j.x)+Math.abs(j.y)>.05){mx=j.x;my=j.y}
  const q=Math.hypot(mx,my)||1;if(Math.abs(mx)+Math.abs(my)>.02){ship.x+=mx/q*270*dt;ship.y+=my/q*270*dt}
  ship.x=Math.max(42,Math.min(W-42,ship.x));ship.y=Math.max(70,Math.min(H-54,ship.y));if(Math.hypot(ship.x-sx,ship.y-sy)>34)moved=true;
  ship.a=Math.atan2(aim.y-ship.y,aim.x-ship.x)+Math.PI/2;
  for(const b of bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;for(const o of targets){if(b.l>0&&Math.hypot(b.x-o.x,b.y-o.y)<o.r+5){b.l=0;hits++;o.x=70+Math.random()*Math.max(80,W-140);o.y=96+Math.random()*Math.max(90,H*.34)}}}
  bullets=bullets.filter(b=>b.l>0);
  draw(t);
  hud.innerHTML=`<b>操作練習</b><br>${mode==='move'?'左下スティックをドラッグ':mode==='fire'?'FIREで標的を撃つ':'WASD / 矢印 + クリック / Space'}<br>${moved?'✅':'⬜'} 移動　${fired?'✅':'⬜'} 発射　${hits?'✅':'⬜'} 命中(${hits})`;
  const h=root.querySelector('#nyandHintV2');h.textContent=mode==='move'?(moved?'移動できました！':'スティックを動かしてみてね。'):mode==='fire'?(hits?'命中！本番では敵も動いて反撃するよ。':'FIREで丸い標的を狙ってね。'):(moved&&fired?'PCの移動と攻撃を確認できました。本番では敵も動くよ。':'キーボードとマウスで操作してみてね。');
  raf=requestAnimationFrame(loop);
}
function draw(t){
  ctx.clearRect(0,0,W,H);
  for(let i=0;i<targets.length;i++){const o=targets[i],pulse=1+Math.sin(t*.005+i)*.08;ctx.strokeStyle=i?'#fb7185':'#facc15';ctx.lineWidth=3;ctx.beginPath();ctx.arc(o.x,o.y,o.r*pulse,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(o.x-o.r-8,o.y);ctx.lineTo(o.x+o.r+8,o.y);ctx.moveTo(o.x,o.y-o.r-8);ctx.lineTo(o.x,o.y+o.r+8);ctx.stroke()}
  ctx.strokeStyle='rgba(125,249,255,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ship.x,ship.y);ctx.lineTo(aim.x,aim.y);ctx.stroke();
  ctx.fillStyle='#7df9ff';for(const b of bullets){ctx.beginPath();ctx.arc(b.x,b.y,4.5,0,Math.PI*2);ctx.fill()}
  ctx.save();ctx.translate(ship.x,ship.y);ctx.rotate(ship.a);ctx.fillStyle='#e2e8f0';ctx.strokeStyle='#67e8f9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-27);ctx.lineTo(19,19);ctx.lineTo(0,11);ctx.lineTo(-19,19);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#fb923c';ctx.beginPath();ctx.moveTo(-6,19);ctx.lineTo(0,34+Math.sin(t*.018)*3);ctx.lineTo(6,19);ctx.fill();ctx.restore();
}
function clearTarget(){target?.classList.remove('nyand-v2-target');target=null}
function render(){
  build();clearTarget();const s=STEPS[step];
  root.querySelector('#nyandTitleV2').textContent=s[0];root.querySelector('#nyandTextV2').textContent=s[1];root.querySelector('#nyandProgressV2').textContent=`${step+1} / ${STEPS.length}`;root.querySelector('#nyandPrevV2').disabled=!step;root.querySelector('#nyandNextV2').textContent=step===STEPS.length-1?'完了':'次へ';root.querySelector('#nyandHintV2').textContent='';
  if(s[4])startPractice(s[4]);else{stopPractice();if(s[2])goScreen(s[2]);setTimeout(()=>{if(!s[3])return;for(const q of s[3].split(',')){const e=document.querySelector(q.trim());if(e&&e.offsetParent!==null){target=e;e.classList.add('nyand-v2-target');root.querySelector('#nyandHintV2').textContent=s[0]==='ゲーム開始'?'NyanDのマウスが出撃ボタンを案内するよ。':'案内されている場所を確認してね。';break}}},100)}
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(s[1]);u.lang='ja-JP';u.rate=.96;speechSynthesis.speak(u)}catch{}
  root.dispatchEvent(new CustomEvent('nyand-step-change',{detail:{title:s[0],step}}));
}
function open(){build();document.getElementById('nyandTutorial')?.classList.remove('show');const v=[...document.querySelectorAll('.screen')].find(e=>!e.classList.contains('hidden'));returnScreen=v?.id||'home';step=0;moved=fired=false;hits=0;root.classList.add('show');render()}
function close(){clearTarget();stopPractice();root?.classList.remove('show');root?.dispatchEvent(new Event('nyand-close'));try{speechSynthesis.cancel()}catch{}goScreen(returnScreen)}
function hook(){build();window.startShookingTutorial=open;document.addEventListener('click',e=>{const b=e.target.closest?.('#tutorialSettingsButton');if(!b)return;e.preventDefault();e.stopImmediatePropagation();open()},true);window.__shookingTutorialControlsFix=V}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook,{once:true});else hook();
})();