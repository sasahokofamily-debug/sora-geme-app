(()=>{
  "use strict";
  const names=[
    ["赤色警戒宙域","高速包囲"],["黒雷回廊","極大弾幕"],["処刑艦隊","精鋭連戦"],["虚無の門","一撃危険"],["双皇要塞","連続ボス"],["終焉チャレンジ","最高難度"],
    ["灼熱星雲","視界妨害"],["断罪航路","狙撃地獄"],["機雷墓場","接近禁止"],["紅蓮要塞","重装甲ボス"],["零度監獄","低速戦"],["狂乱リング","全周包囲"],
    ["紫電峡谷","高速弾幕"],["滅亡前線","補給なし"],["三皇決戦","三連ボス"],["死線突破","90秒耐久"],["亡霊艦隊","透明奇襲"],["黒翼回廊","高速精鋭"],
    ["星喰いの巣","巨大敵群"],["天罰砲台群","固定砲撃"],["無限追撃戦","逃走不能"],["崩壊銀河","全性能強化"],["絶望中枢","精鋭率最大"],["神殺し戦線","超大型ボス"],
    ["時空断層","速度変動"],["終末機雷原","弾幕迷路"],["覇王連合","五連戦"],["虚空の王座","最終要塞"],["深淵無限戦","150秒耐久"],["SHOO KING 終極戦","究極難度"]
  ];
  const stages=names.map((n,i)=>{
    const id=201+i, tier=Math.floor(i/6), pos=i%6;
    const boost=2.4+i*.13, bullets=2.2+i*.12, spawn=1.8+i*.06;
    const survive=[1,5,10,15,20,24,28,29].includes(i);
    return {
      id,name:n[0],theme:n[1],x:10+pos*16,y:pos%2?38+tier*4:70-tier*5,
      mission:survive?`${90+Math.floor(i/5)*15}秒生き残る`:`敵を${55+i*6}体倒す`,
      ...(survive?{targetSurvive:90+Math.floor(i/5)*15}:{targetKills:55+i*6}),
      targetElites:i>=2?Math.min(30,8+Math.floor(i/2)):undefined,
      reward:1000+i*450,enemyBoost:Number(boost.toFixed(2)),bulletBoost:Number(bullets.toFixed(2)),spawnBoost:Number(spawn.toFixed(2)),
      eliteBoost:Math.min(1,.42+i*.025),hardMode:true,doubleBoss:[4,8,14,23,26,27,29].includes(i),
      desc:`敵性能${boost.toFixed(1)}倍、弾幕${bullets.toFixed(1)}倍。${n[1]}を突破せよ。`
    };
  });
  const HARD_MAP={id:"abyss",name:"深淵戦線・全30区画",desc:"クリア後向けの超高難度星域。高速敵・弾幕・連続ボス・長時間耐久が出現する。",stages};
  function installMap(){if(!Array.isArray(window.MAPS))return false;const old=window.MAPS.findIndex(m=>m.id===HARD_MAP.id);if(old>=0)window.MAPS[old]=HARD_MAP;else window.MAPS.push(HARD_MAP);return true;}
  function installDifficultyPatch(){
    if(typeof window.spawnEnemy!=="function"||window.__hardStagePatched)return !!window.__hardStagePatched;
    window.__hardStagePatched=true;const originalSpawnEnemy=window.spawnEnemy;
    window.spawnEnemy=function(){
      const before=Array.isArray(window.enemies)?window.enemies.length:0;originalSpawnEnemy.apply(this,arguments);
      const stage=typeof window.getStageData==="function"?window.getStageData(window.player?.stage):null;
      if(!stage?.hardMode||!Array.isArray(window.enemies))return;
      const tune=e=>{e.hp*=stage.enemyBoost||2;e.maxHp=e.hp;e.speed*=Math.min(2.65,1+(stage.enemyBoost||2)*.18);e.shotCooldown=Math.max(18,(e.shotCooldown||180)/(stage.bulletBoost||2));e.elite=Math.random()<(stage.eliteBoost||.5);if(e.elite){e.hp*=1.9;e.maxHp=e.hp;e.r*=1.2;}};
      window.enemies.slice(before).forEach(tune);
      const extra=Math.max(0,Math.floor((stage.spawnBoost||1)-1));for(let i=0;i<extra;i++){const b=window.enemies.length;originalSpawnEnemy.apply(this,arguments);window.enemies.slice(b).forEach(tune);}
    };
    return true;
  }
  function installUi(){const panel=document.querySelector("#stageSelect .panel");if(!panel)return;let notice=document.getElementById("hardStageNotice");if(!notice){notice=document.createElement("div");notice.id="hardStageNotice";notice.className="onlineCard";notice.style.cssText="border-color:#ef4444;background:rgba(127,29,29,.24);margin:12px 0";const map=document.getElementById("galaxyMap");panel.insertBefore(notice,map||panel.children[2]);}notice.innerHTML="<b>⚠ 超高難度マップ：全30ステージ</b><br><span class='small'>高速包囲、弾幕、精鋭、長時間耐久、五連ボス、終極戦まで追加済み。</span>";}
  function install(){let tries=0;const timer=setInterval(()=>{tries++;const a=installMap(),b=installDifficultyPatch();installUi();if(a&&b&&tries>2){try{window.renderMapTabs?.();}catch(e){}clearInterval(timer);}if(tries>40)clearInterval(timer);},300);}
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",install):install();
})();