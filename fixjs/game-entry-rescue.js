(()=>{
'use strict';
const VERSION='game-entry-rescue-v1';

function logFailure(area,error){
  console.error(`[SHOO KING ${area}]`,error);
  try{
    const entry={area,time:new Date().toISOString(),message:String(error?.message||error||'unknown').slice(0,300)};
    const list=JSON.parse(sessionStorage.getItem('shooking2_entry_errors')||'[]');
    list.push(entry);
    sessionStorage.setItem('shooking2_entry_errors',JSON.stringify(list.slice(-8)));
  }catch(e){}
}
function notice(text){
  try{if(typeof window.showAppNotice==='function')window.showAppNotice({title:'GAME ENTRY RECOVERY',message:text,type:'warning',duration:3500});}
  catch(e){}
}
function directStageSelect(){
  try{if(typeof hideAllScreens==='function')hideAllScreens();else document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));}catch(e){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));}
  const el=document.getElementById('stageSelect');
  if(el){el.classList.remove('hidden');el.style.removeProperty('display');el.style.removeProperty('visibility');}
  try{state='home'}catch(e){}
  try{syncGameChromeState()}catch(e){}
  try{renderMapTabs()}catch(e){}
  try{renderGalaxyMap()}catch(e){}
  return !!el;
}
function isPlaying(){
  try{if(state==='play')return true}catch(e){}
  return document.body.classList.contains('game-playing')&&!document.querySelector('.screen:not(.hidden)');
}
function minimalPlayStart(stageId,error){
  logFailure('START FALLBACK',error);
  try{state='play'}catch(e){}
  try{if(typeof hideAllScreens==='function')hideAllScreens();else document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));}catch(e){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));}
  document.body.classList.remove('game-menu');
  document.body.classList.add('game-playing');
  try{
    player.stage=Number(stageId||1);
    player.worldX=0;player.worldY=0;player.vx=0;player.vy=0;
    if(Number.isFinite(player.maxHp))player.hp=Math.max(1,Math.floor(player.maxHp));
    player.shield=0;player.magnetTimer=0;player.rapidTimer=0;
  }catch(e){}
  const resets=[['bullets',[]],['enemyBullets',[]],['enemies',[]],['particles',[]],['combatTexts',[]],['items',[]]];
  for(const [name,value] of resets){try{globalThis[name]=value}catch(e){}}
  try{score=0;stageTimer=0;lastSpawn=0;boss=null}catch(e){}
  try{syncGameChromeState()}catch(e){}
  try{resize()}catch(e){}
  notice('通常の開始処理でエラーが出たため、ゲーム画面を復旧して開始しました。');
}
function guardHelper(name){
  const original=window[name];
  if(typeof original!=='function'||original.__shookingEntryGuard)return;
  const wrapped=function(...args){
    try{return original.apply(this,args)}catch(error){logFailure(name,error);return undefined}
  };
  wrapped.__shookingEntryGuard=true;
  wrapped.__original=original;
  window[name]=wrapped;
}

function install(){
  // Storage/quest helpers must never be allowed to prevent the canvas from starting.
  ['startQuestRunSnapshot','ensureAutoQuests'].forEach(guardHelper);

  const originalOpen=window.openStageSelect;
  if(typeof originalOpen==='function'&&!originalOpen.__shookingEntryRescue){
    const wrapped=function(...args){
      try{originalOpen.apply(this,args)}catch(error){logFailure('openStageSelect',error)}
      const stage=document.getElementById('stageSelect');
      if(!stage||stage.classList.contains('hidden'))directStageSelect();
    };
    wrapped.__shookingEntryRescue=true;
    window.openStageSelect=wrapped;
  }

  const originalStart=window.startGame;
  if(typeof originalStart==='function'&&!originalStart.__shookingEntryRescue){
    const wrapped=function(stageId=1,...rest){
      let failed=null;
      try{
        const result=originalStart.call(this,stageId,...rest);
        setTimeout(()=>{if(!isPlaying())minimalPlayStart(stageId,new Error('startGame returned without entering play state'))},120);
        return result;
      }catch(error){failed=error;minimalPlayStart(stageId,error);return undefined}
      finally{if(failed)logFailure('startGame',failed)}
    };
    wrapped.__shookingEntryRescue=true;
    wrapped.__original=originalStart;
    window.startGame=wrapped;
  }

  const originalSelected=window.startSelectedStage;
  if(typeof originalSelected==='function'&&!originalSelected.__shookingEntryRescue){
    const wrapped=function(...args){
      let stageId=1;
      try{stageId=Number(selectedStageId||1)}catch(e){}
      try{originalSelected.apply(this,args)}catch(error){logFailure('startSelectedStage',error);window.startGame?.(stageId)}
      setTimeout(()=>{if(!isPlaying()&&!document.getElementById('stageSelect')?.classList.contains('hidden'))window.startGame?.(stageId)},160);
    };
    wrapped.__shookingEntryRescue=true;
    window.startSelectedStage=wrapped;
  }

  window.__SHOOKING_GAME_ENTRY_RESCUE__=VERSION;
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});
else setTimeout(install,0);
setTimeout(install,500);
})();
