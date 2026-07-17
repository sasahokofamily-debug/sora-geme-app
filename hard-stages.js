(()=>{
  "use strict";

  const names=[
    ["赤色警戒宙域","高速包囲"],["黒雷回廊","極大弾幕"],["処刑艦隊","精鋭連戦"],["虚無の門","一撃危険"],["双皇要塞","連続ボス"],["終焉チャレンジ","最高難度"],
    ["灼熱星雲","視界妨害"],["断罪航路","狙撃地獄"],["機雷墓場","接近禁止"],["紅蓮要塞","重装甲ボス"],["零度監獄","低速戦"],["狂乱リング","全周包囲"],
    ["紫電峡谷","高速弾幕"],["滅亡前線","補給なし"],["三皇決戦","三連ボス"],["死線突破","長時間耐久"],["亡霊艦隊","透明奇襲"],["黒翼回廊","高速精鋭"],
    ["星喰いの巣","巨大敵群"],["天罰砲台群","固定砲撃"],["無限追撃戦","逃走不能"],["崩壊銀河","全性能強化"],["絶望中枢","精鋭率最大"],["神殺し戦線","超大型ボス"],
    ["時空断層","速度変動"],["終末機雷原","弾幕迷路"],["覇王連合","五連戦"],["虚空の王座","最終要塞"],["深淵無限戦","180秒耐久"],["SHOO KING 終極戦","究極難度"]
  ];

  const surviveIndexes=new Set([1,5,10,15,20,24,28]);
  const killTargets=[
    100,0,125,140,155,0,
    170,185,200,215,0,230,
    245,260,275,0,290,305,
    320,335,0,350,365,380,
    0,395,420,450,0,500
  ];
  const surviveTargets={1:120,5:135,10:150,15:165,20:180,24:195,28:210};

  const stages=names.map((n,i)=>{
    const id=201+i;
    const tier=Math.floor(i/6);
    const pos=i%6;
    const boost=2.8+i*.16;
    const bullets=2.5+i*.14;
    const spawn=2.1+i*.075;
    const survive=surviveIndexes.has(i);
    const target=survive?surviveTargets[i]:killTargets[i];
    return {
      id,
      name:n[0],
      theme:n[1],
      x:10+pos*16,
      y:pos%2?38+tier*4:70-tier*5,
      mission:survive?`${target}秒生き残る`:`敵を${target}体倒す`,
      ...(survive?{targetSurvive:target}:{targetKills:target}),
      targetElites:i>=2?Math.min(60,12+Math.floor(i*1.5)):undefined,
      reward:1800+i*650,
      enemyBoost:Number(boost.toFixed(2)),
      bulletBoost:Number(bullets.toFixed(2)),
      spawnBoost:Number(spawn.toFixed(2)),
      eliteBoost:Math.min(1,.52+i*.022),
      hardMode:true,
      doubleBoss:[4,8,14,23,26,27,29].includes(i),
      desc:`敵性能${boost.toFixed(1)}倍、弾幕${bullets.toFixed(1)}倍。${n[1]}を突破せよ。`
    };
  });

  const HARD_MAP={
    id:"abyss",
    name:"深淵戦線・全30区画",
    desc:"撃破数100〜500体、長時間耐久、連続ボスを含む超高難度星域。",
    stages
  };

  function installMap(){
    try{
      if(typeof MAPS==="undefined"||!Array.isArray(MAPS))return false;
      const old=MAPS.findIndex(m=>m.id===HARD_MAP.id);
      if(old>=0)MAPS.splice(old,1,HARD_MAP);
      else MAPS.push(HARD_MAP);
      return MAPS.some(m=>m.id===HARD_MAP.id&&m.stages.length===30);
    }catch(e){
      console.error("hard map install failed",e);
      return false;
    }
  }

  function installDifficultyPatch(){
    try{
      if(typeof spawnEnemy!=="function")return false;
      if(window.__hardStagePatchedV2)return true;
      window.__hardStagePatchedV2=true;
      const originalSpawnEnemy=spawnEnemy;
      spawnEnemy=function(){
        const before=Array.isArray(enemies)?enemies.length:0;
        originalSpawnEnemy.apply(this,arguments);
        const stage=typeof getStageData==="function"?getStageData(player.stage):null;
        if(!stage||!stage.hardMode||!Array.isArray(enemies))return;
        const tune=e=>{
          e.hp*=stage.enemyBoost||2;
          e.maxHp=e.hp;
          e.speed*=Math.min(3.0,1+(stage.enemyBoost||2)*.2);
          e.shotCooldown=Math.max(14,(e.shotCooldown||180)/(stage.bulletBoost||2));
          e.elite=Math.random()<(stage.eliteBoost||.5);
          if(e.elite){e.hp*=2.1;e.maxHp=e.hp;e.r*=1.22;}
        };
        enemies.slice(before).forEach(tune);
        const extra=Math.max(0,Math.floor((stage.spawnBoost||1)-1));
        for(let i=0;i<extra;i++){
          const b=enemies.length;
          originalSpawnEnemy.apply(this,arguments);
          enemies.slice(b).forEach(tune);
        }
      };
      return true;
    }catch(e){
      console.error("hard difficulty patch failed",e);
      return false;
    }
  }

  function installUi(){
    const panel=document.querySelector("#stageSelect .panel");
    if(!panel)return;
    let notice=document.getElementById("hardStageNotice");
    if(!notice){
      notice=document.createElement("div");
      notice.id="hardStageNotice";
      notice.className="onlineCard";
      notice.style.cssText="border-color:#ef4444;background:rgba(127,29,29,.24);margin:12px 0";
      const map=document.getElementById("galaxyMap");
      panel.insertBefore(notice,map||panel.children[2]);
    }
    notice.innerHTML="<b>⚠ 超高難度マップ：全30ステージ</b><br><span class='small'>撃破数100〜500体。長時間耐久・精鋭大量出現・連続ボス・終極戦まで追加。</span>";
  }

  function install(){
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const mapReady=installMap();
      const patchReady=installDifficultyPatch();
      installUi();
      if(mapReady){
        try{
          if(typeof renderMapTabs==="function")renderMapTabs();
          if(typeof renderGalaxyMap==="function"&&typeof currentMapId!=="undefined"&&currentMapId==="abyss")renderGalaxyMap();
        }catch(e){}
      }
      if(mapReady&&patchReady&&tries>2)clearInterval(timer);
      if(tries>60)clearInterval(timer);
    },250);
  }

  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",install):install();
})();