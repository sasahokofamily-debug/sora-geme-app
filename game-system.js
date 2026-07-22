(()=>{
'use strict';
const root=window;
const data=()=>root.GameData||{};

// page.js
root.Pages={history:[],current:'home',open(name){this.history.push(this.current);this.current=name;document.querySelectorAll('[data-page]').forEach(el=>el.hidden=el.dataset.page!==name);window.dispatchEvent(new CustomEvent('game:page',{detail:{name}}));return name},back(){return this.open(this.history.pop()||'home')},reload(){location.reload()}};

// save.js
root.SaveSystem={key:'shooking2_save',load(){try{return JSON.parse(localStorage.getItem(this.key)||'{}')}catch{return{}}},save(value){localStorage.setItem(this.key,JSON.stringify(value));return value},patch(part){return this.save({...this.load(),...part})},clear(){localStorage.removeItem(this.key)}};

// player.js
root.PlayerSystem={get(){const s=SaveSystem.load();return s.player||{hp:data().player?.startHp||100,coins:data().player?.startCoins||500,level:1,xp:0,inventory:[]}},set(player){SaveSystem.patch({player});return player},addCoins(n){const p=this.get();p.coins=Math.max(0,p.coins+n);return this.set(p)},damage(n){const p=this.get();p.hp=Math.max(0,p.hp-n);return this.set(p)},heal(n){const p=this.get();p.hp=Math.min(data().player?.maxHp||100,p.hp+n);return this.set(p)}};

// enemy.js
root.EnemySystem={create(type='slime'){const base=data().enemies?.[type]||{hp:30,attack:5,coin:8};return{type,hp:base.hp,maxHp:base.hp,attack:base.attack,coin:base.coin}},hit(enemy,damage){enemy.hp=Math.max(0,enemy.hp-damage);if(enemy.hp===0)PlayerSystem.addCoins(enemy.coin||0);return enemy}};

// weapon.js
root.WeaponSystem={get(id='assault'){return data().weapons?.[id]||{damage:10,fireRate:.2}},attack(id,target){return EnemySystem.hit(target,this.get(id).damage||10)}};

// gacha.js
root.GachaSystem={cost(kind='normal'){return data().gacha?.[kind]?.cost||data().gacha?.[kind]||100},canDraw(kind='normal'){return PlayerSystem.get().coins>=this.cost(kind)},draw(kind='normal'){if(!this.canDraw(kind))throw new Error('コインが足りません');PlayerSystem.addCoins(-this.cost(kind));if(typeof root.startRealGacha==='function')return root.startRealGacha(kind);window.dispatchEvent(new CustomEvent('game:gacha',{detail:{kind}}));return kind}};

// invite.js
root.InviteSystem={open(){const modal=document.getElementById('gmailSeatInviteModal');if(modal)modal.classList.add('open');else document.getElementById('gmailSeatInviteButton')?.click()},seat(){const n=Number(localStorage.getItem('shooking2_invite_seat_seq')||0)+1;localStorage.setItem('shooking2_invite_seat_seq',n);return `A-${String(n).padStart(2,'0')}`}};

// sound.js
root.SoundSystem={enabled:true,volume:1,play(src){if(!this.enabled||!src)return;const a=new Audio(src);a.volume=this.volume;a.play().catch(()=>{});return a},toggle(){this.enabled=!this.enabled;return this.enabled}};

// effect.js
root.EffectSystem={flash(text=''){const el=document.createElement('div');el.textContent=text;Object.assign(el.style,{position:'fixed',inset:'0',display:'grid',placeItems:'center',zIndex:'999999',fontSize:'clamp(28px,8vw,80px)',fontWeight:'900',pointerEvents:'none',background:'rgba(255,255,255,.18)'});document.body.appendChild(el);setTimeout(()=>el.remove(),600)},shake(){document.body.animate([{transform:'translateX(0)'},{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateX(0)'}],{duration:260})}};

// ui.js
root.UISystem={toast(message,ms=1800){const el=document.createElement('div');el.textContent=message;Object.assign(el.style,{position:'fixed',left:'50%',bottom:'24px',transform:'translateX(-50%)',zIndex:'999999',padding:'10px 16px',borderRadius:'999px',background:'#111827',color:'#fff',fontWeight:'800'});document.body.appendChild(el);setTimeout(()=>el.remove(),ms)},confirm(message){return window.confirm(message)}};

// network.js
root.NetworkSystem={online:navigator.onLine,onChange(fn){window.addEventListener('online',()=>fn(true));window.addEventListener('offline',()=>fn(false))},async json(url,options){const r=await fetch(url,options);if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}};

// achievement.js
root.AchievementSystem={key:'shooking2_achievements',all(){try{return JSON.parse(localStorage.getItem(this.key)||'[]')}catch{return[]}},unlock(id){const list=this.all();if(!list.includes(id)){list.push(id);localStorage.setItem(this.key,JSON.stringify(list));window.dispatchEvent(new CustomEvent('game:achievement',{detail:{id}}));UISystem.toast(`実績解除: ${id}`)}return list},has(id){return this.all().includes(id)}};

// mission.js
root.MissionSystem={key:'shooking2_missions',all(){try{return JSON.parse(localStorage.getItem(this.key)||'{}')}catch{return{}}},set(id,value){const all=this.all();all[id]=value;localStorage.setItem(this.key,JSON.stringify(all));return all[id]},progress(id,amount=1){const now=this.all()[id]||0;return this.set(id,now+amount)},complete(id){this.set(id,'complete');window.dispatchEvent(new CustomEvent('game:mission',{detail:{id}}));return true}};

root.GameSystems={Pages,SaveSystem,PlayerSystem,EnemySystem,WeaponSystem,GachaSystem,InviteSystem,SoundSystem,EffectSystem,UISystem,NetworkSystem,AchievementSystem,MissionSystem};
window.dispatchEvent(new CustomEvent('game:systems-ready',{detail:root.GameSystems}));
})();
