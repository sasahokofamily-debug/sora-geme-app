(()=>{
  "use strict";
  const fallbackSkins=[
    {id:"rookie",name:"ROOKIE",kills:0,color:"#7df9ff",ability:"標準機体"},
    {id:"blue",name:"BLUE COMET",kills:100,color:"#38bdf8",ability:"移動速度アップ"},
    {id:"red",name:"RED FANG",kills:500,color:"#fb7185",ability:"攻撃力アップ"},
    {id:"gold",name:"GOLD KING",kills:2000,color:"#facc15",ability:"コイン獲得アップ"},
    {id:"void",name:"VOID EMPEROR",kills:10000,color:"#a78bfa",ability:"シールド強化"},
    {id:"nova",name:"SUPERNOVA",kills:50000,color:"#fff7ad",ability:"全性能アップ"},
    {id:"abyss",name:"ABYSS LORD",kills:100000,color:"#ef4444",ability:"敵撃破時に追加コイン"},
    {id:"galaxy",name:"GALAXY TYRANT",kills:250000,color:"#22d3ee",ability:"攻撃・速度・耐久を大強化"},
    {id:"eternal",name:"ETERNAL KING",kills:500000,color:"#f0abfc",ability:"究極機体・全性能特大アップ"},
    {id:"million",name:"MILLION DESTROYER",kills:1000000,color:"#ffffff",ability:"100万撃破者専用の最終機体"}
  ];
  const milestones=[
    {kills:100,name:"前線整備庫",coins:500},
    {kills:500,name:"戦闘格納庫",coins:1500},
    {kills:2000,name:"軌道ドック",coins:4000},
    {kills:10000,name:"王立造船所",coins:12000},
    {kills:50000,name:"超銀河工廠",coins:30000},
    {kills:100000,name:"深淵兵器廠",coins:60000},
    {kills:250000,name:"覇王級格納庫",coins:120000},
    {kills:500000,name:"終極格納庫",coins:250000},
    {kills:1000000,name:"百万撃破神殿",coins:500000}
  ];
  function number(v,d=0){v=Number(v);return Number.isFinite(v)?v:d;}
  function parseJson(raw){try{return JSON.parse(raw||"null")}catch(e){return null}}
  function readProgress(){return parseJson(localStorage.getItem("shooking2"))||{}}
  function scanKills(value,depth=0){
    if(depth>5||value==null)return 0;
    if(typeof value==="number")return Number.isFinite(value)&&value>=0?value:0;
    if(typeof value!=="object")return 0;
    let best=0;
    for(const [k,v] of Object.entries(value)){
      const key=String(k).toLowerCase();
      if(/kill|撃破|defeat|destroy/.test(key)&&typeof v!=="object")best=Math.max(best,number(v,0));
      if(typeof v==="object")best=Math.max(best,scanKills(v,depth+1));
    }
    return best;
  }
  function getTotalKills(){
    let best=number(localStorage.getItem("shooking2_total_kills"),0);
    const progress=readProgress();
    best=Math.max(best,scanKills(progress));
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i)||"";
      if(!/shooking|kill|撃破|achievement|stats/i.test(key))continue;
      const raw=localStorage.getItem(key);
      best=Math.max(best,number(raw,0));
      const parsed=parseJson(raw);
      if(parsed)best=Math.max(best,scanKills(parsed));
    }
    best=Math.floor(Math.max(0,best));
    localStorage.setItem("shooking2_total_kills",String(best));
    return best;
  }
  function getSkinList(){
    for(const key of ["SHIP_SKINS","SKINS","skinCatalog","SHIP_SKIN_CATALOG"]){
      try{const v=window[key];if(Array.isArray(v)&&v.length)return v.map((s,i)=>({...s,kills:number(s.kills??s.unlockKills??fallbackSkins[i]?.kills,0)}));}catch(e){}
    }
    return fallbackSkins;
  }
  function normalizeSkin(s,i){return {id:s.id||s.key||`skin${i}`,name:s.name||s.label||`SKIN ${i+1}`,kills:number(s.kills??s.unlockKills??s.requiredKills??fallbackSkins[i]?.kills,0),color:s.color||"#7df9ff",ability:s.ability||s.desc||s.description||"特殊能力"};}
  function grantMilestoneRewards(kills,p){
    let changed=false;
    milestones.forEach((m,i)=>{
      const key=`shooking2_kill_reward_${m.kills}`;
      if(kills>=m.kills&&localStorage.getItem(key)!=="1"){
        p.coins=Math.max(0,number(p.coins,0))+m.coins;
        localStorage.setItem(key,"1");
        changed=true;
      }
    });
    if(changed)localStorage.setItem("shooking2",JSON.stringify(p));
    return changed;
  }
  function renderSafeHangar(){
    const screen=document.getElementById("hangar");if(!screen)return false;
    document.querySelectorAll(".screen").forEach(el=>el.classList.add("hidden"));screen.classList.remove("hidden");
    const p=readProgress(),kills=getTotalKills();grantMilestoneRewards(kills,p);
    const level=Math.max(1,number(p.level,1)),coins=Math.max(0,number(p.coins,0));
    let evo=Math.max(1,number(localStorage.getItem("shooking2_evolution_level"),1));if(evo>10)evo=10;
    const equipped=localStorage.getItem("shooking2_equipped_skin")||"rookie";
    const skins=getSkinList().map(normalizeSkin);
    const current=skins.find(s=>s.id===equipped)||skins[0];
    const reached=milestones.filter(m=>kills>=m.kills);
    const hangarLv=Math.min(10,reached.length+1);
    const hangarName=reached.length?reached[reached.length-1].name:"廃棄格納庫";
    const next=milestones.find(m=>kills<m.kills);
    const set=(id,value,html=false)=>{const el=document.getElementById(id);if(el)html?el.innerHTML=value:el.textContent=value;};
    set("hangarLevelText",`Lv${hangarLv} ${hangarName}`);
    set("hangarBonusText",`総撃破数 ${kills.toLocaleString()}体 / パイロットLv ${level} / コイン ${coins.toLocaleString()} / 機体進化 ${evo}段階${next?` / 次の格納庫まであと ${(next.kills-kills).toLocaleString()}体`:" / 全格納庫制覇"}`);
    set("equippedSkinText",`${current.name} — ${current.ability}`);
    const grid=document.getElementById("skinGrid");
    if(grid)grid.innerHTML=skins.map(s=>{const unlocked=kills>=s.kills,eq=s.id===current.id;return `<div class="skinCard ${unlocked?"unlocked":"locked"} ${eq?"equipped":""}"><div style="font-size:20px;font-weight:900;color:${s.color}">${s.name}</div><div class="small">${s.ability}</div><div class="small">${unlocked?"撃破解除済み":`${s.kills.toLocaleString()}体撃破で解除`} ${eq?" / 装備中":""}</div></div>`}).join("");
    const tree=document.getElementById("evolutionTree");
    if(tree)tree.innerHTML=milestones.map((m,i)=>`<div class="evoNode ${kills>=m.kills?"active":""}">第${i+2}形態<br><span class="small">${kills>=m.kills?`${m.kills.toLocaleString()}撃破 達成`:`${m.kills.toLocaleString()}撃破で起動`}</span></div>`).join("");
    set("evolutionInfo",next?`次の格納庫「${next.name}」まであと ${(next.kills-kills).toLocaleString()}体。到達時に ${next.coins.toLocaleString()} コイン獲得。`:"全撃破マイルストーン達成。最終格納庫が起動しています。");
    const unlocked=skins.filter(s=>kills>=s.kills).length;
    set("collectionInfo",`総撃破数 ${kills.toLocaleString()}体 / スキン ${unlocked}/${skins.length}種解除 / 収集率 ${Math.round(unlocked/skins.length*100)}%`);
    return true;
  }
  function repairSave(){
    try{JSON.parse(localStorage.getItem("shooking2")||"{}")}catch(e){localStorage.setItem("shooking2",JSON.stringify({level:1,coins:0,maxStage:1,maxClearedStage:0,maxHp:120,damage:1,fire:1,engine:1,weapon:"m16",unlockedWeapons:["m16"]}));}
    const evo=number(localStorage.getItem("shooking2_evolution_level"),1);if(evo<1||evo>10)localStorage.setItem("shooking2_evolution_level","1");
  }
  function install(){
    repairSave();
    const original=typeof window.openHangar==="function"?window.openHangar:null;
    window.openHangar=function(){
      if(original)try{original.apply(this,arguments);}catch(e){console.warn("Hangar original failed",e);}
      setTimeout(()=>{try{renderSafeHangar();}catch(e){console.error(e);alert("格納庫の表示を修復できませんでした。ページを再読み込みしてください。");}},0);
    };
    window.addEventListener("error",e=>{if(String(e.message||"").toLowerCase().includes("hangar"))setTimeout(renderSafeHangar,0);});
  }
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",install):install();
})();