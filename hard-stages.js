(()=>{
  "use strict";

  const HARD_MAP={
    id:"abyss",
    name:"深淵戦線",
    desc:"クリア後向けの超高難度星域。高速敵・弾幕・連続ボスが出現する。",
    stages:[
      {id:201,name:"赤色警戒宙域",x:12,y:70,theme:"高速包囲",mission:"敵を55体倒す",targetKills:55,reward:1000,enemyBoost:2.4,bulletBoost:2.2,hardMode:true,spawnBoost:1.8,eliteBoost:.45,desc:"高速小型敵と狙撃機が同時に押し寄せる。"},
      {id:202,name:"黒雷回廊",x:28,y:42,theme:"極大弾幕",mission:"100秒生き残る",targetSurvive:100,reward:1400,enemyBoost:2.7,bulletBoost:2.8,hardMode:true,spawnBoost:2.1,eliteBoost:.55,desc:"敵弾速度と発射頻度が大幅上昇。停止すると即座に包囲される。"},
      {id:203,name:"処刑艦隊",x:46,y:66,theme:"精鋭連戦",mission:"強敵を12体倒す",targetKills:70,targetElites:12,reward:1900,enemyBoost:3.0,bulletBoost:2.6,hardMode:true,spawnBoost:2.25,eliteBoost:.75,desc:"重装甲・拡散弾・狙撃型の精鋭だけで構成された艦隊。"},
      {id:204,name:"虚無の門",x:64,y:34,theme:"一撃危険",mission:"敵を85体倒す",targetKills:85,reward:2600,enemyBoost:3.5,bulletBoost:3.2,hardMode:true,spawnBoost:2.6,eliteBoost:.85,desc:"敵の耐久と火力が極端に高い。最大強化前提。"},
      {id:205,name:"双皇要塞",x:82,y:58,theme:"連続ボス",mission:"双皇要塞を撃破",targetKills:95,targetElites:14,reward:3800,enemyBoost:4.0,bulletBoost:3.5,hardMode:true,doubleBoss:true,spawnBoost:2.8,eliteBoost:.9,desc:"ボス級戦艦が連続出現する最終決戦。"},
      {id:206,name:"終焉チャレンジ",x:92,y:24,theme:"最高難度",mission:"120秒生き残る",targetSurvive:120,reward:6000,enemyBoost:4.8,bulletBoost:4.2,hardMode:true,spawnBoost:3.2,eliteBoost:1,desc:"回復ほぼなし。全敵種・最大弾幕・最高速度。"}
    ]
  };

  function installMap(){
    if(!Array.isArray(window.MAPS))return false;
    if(!window.MAPS.some(map=>map.id===HARD_MAP.id))window.MAPS.push(HARD_MAP);
    return true;
  }

  function installDifficultyPatch(){
    if(typeof window.spawnEnemy!=="function"||window.__hardStagePatched)return false;
    window.__hardStagePatched=true;
    const originalSpawnEnemy=window.spawnEnemy;
    window.spawnEnemy=function(){
      const before=Array.isArray(window.enemies)?window.enemies.length:0;
      originalSpawnEnemy.apply(this,arguments);
      const stage=typeof window.getStageData==="function"?window.getStageData(window.player?.stage):null;
      if(!stage?.hardMode||!Array.isArray(window.enemies))return;
      const created=window.enemies.slice(before);
      created.forEach(enemy=>{
        enemy.hp*=stage.enemyBoost||2;
        enemy.maxHp=enemy.hp;
        enemy.speed*=Math.min(2.2,1+(stage.enemyBoost||2)*.18);
        enemy.shotCooldown=Math.max(25,(enemy.shotCooldown||180)/(stage.bulletBoost||2));
        enemy.elite=Math.random()<(stage.eliteBoost||.5);
        if(enemy.elite){enemy.hp*=1.8;enemy.maxHp=enemy.hp;enemy.r*=1.18;}
      });
      const extra=Math.max(0,Math.floor((stage.spawnBoost||1)-1));
      for(let i=0;i<extra;i++)originalSpawnEnemy.apply(this,arguments);
    };

    const originalStartGame=window.startGame;
    if(typeof originalStartGame==="function"){
      window.startGame=function(stageId){
        originalStartGame.apply(this,arguments);
        const stage=typeof window.getStageData==="function"?window.getStageData(Number(stageId||1)):null;
        if(stage?.hardMode&&typeof window.showToast==="function"){
          window.showToast(`DANGER ZONE<br>${stage.name}<br>敵性能 ${stage.enemyBoost}倍 / 弾幕 ${stage.bulletBoost}倍`);
        }
      };
    }
    return true;
  }

  function installUi(){
    const panel=document.querySelector("#stageSelect .panel");
    if(!panel||document.getElementById("hardStageNotice"))return;
    const notice=document.createElement("div");
    notice.id="hardStageNotice";
    notice.className="onlineCard";
    notice.style.cssText="border-color:#ef4444;background:rgba(127,29,29,.24);margin:12px 0";
    notice.innerHTML="<b>⚠ 超高難度マップ追加</b><br><span class='small'>深淵戦線は後半強化済みプレイヤー向け。敵HP・速度・弾幕・出現数が大幅上昇します。</span>";
    const map=document.getElementById("galaxyMap");
    panel.insertBefore(notice,map||panel.children[2]);
  }

  function install(){
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const mapReady=installMap();
      const patchReady=installDifficultyPatch();
      installUi();
      if(mapReady&&patchReady&&tries>2){
        if(typeof window.renderMapTabs==="function")try{window.renderMapTabs();}catch(e){}
        clearInterval(timer);
      }
      if(tries>30)clearInterval(timer);
    },300);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);
  else install();
})();