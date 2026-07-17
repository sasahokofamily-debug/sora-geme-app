(()=>{
  "use strict";
  const fallbackSkins=[
    {id:"rookie",name:"ROOKIE",level:1,color:"#7df9ff",ability:"標準機体"},
    {id:"blue",name:"BLUE COMET",level:3,color:"#38bdf8",ability:"移動速度アップ"},
    {id:"red",name:"RED FANG",level:5,color:"#fb7185",ability:"攻撃力アップ"},
    {id:"gold",name:"GOLD KING",level:8,color:"#facc15",ability:"コイン獲得アップ"},
    {id:"void",name:"VOID EMPEROR",level:12,color:"#a78bfa",ability:"シールド強化"},
    {id:"nova",name:"SUPERNOVA",level:18,color:"#fff7ad",ability:"全性能アップ"}
  ];
  function number(v,d=0){v=Number(v);return Number.isFinite(v)?v:d;}
  function readProgress(){try{return JSON.parse(localStorage.getItem("shooking2")||"{}")}catch(e){return {}}}
  function getSkinList(){
    for(const key of ["SHIP_SKINS","SKINS","skinCatalog","SHIP_SKIN_CATALOG"]){
      try{const v=window[key];if(Array.isArray(v)&&v.length)return v;}catch(e){}
    }
    return fallbackSkins;
  }
  function normalizeSkin(s,i){return {id:s.id||s.key||`skin${i}`,name:s.name||s.label||`SKIN ${i+1}`,level:number(s.level??s.unlockLevel??s.requiredLevel,1),color:s.color||"#7df9ff",ability:s.ability||s.desc||s.description||"特殊能力"};}
  function renderSafeHangar(){
    const screen=document.getElementById("hangar");if(!screen)return false;
    document.querySelectorAll(".screen").forEach(el=>el.classList.add("hidden"));screen.classList.remove("hidden");
    const p=readProgress(),level=Math.max(1,number(p.level,1)),coins=Math.max(0,number(p.coins,0));
    let evo=Math.max(1,number(localStorage.getItem("shooking2_evolution_level"),1));if(evo>6)evo=6;
    const equipped=localStorage.getItem("shooking2_equipped_skin")||"rookie";
    const skins=getSkinList().map(normalizeSkin);
    const current=skins.find(s=>s.id===equipped)||skins[0];
    const levelNames=["廃棄格納庫","前線整備庫","軌道ドック","王立造船所","超銀河工廠","終極格納庫"];
    const hangarLv=Math.min(6,Math.max(1,Math.floor((level-1)/4)+1));
    const set=(id,value,html=false)=>{const el=document.getElementById(id);if(el)html?el.innerHTML=value:el.textContent=value;};
    set("hangarLevelText",`Lv${hangarLv} ${levelNames[hangarLv-1]}`);
    set("hangarBonusText",`パイロットLv ${level} / コイン ${coins} / 機体進化 ${evo}段階`);
    set("equippedSkinText",`${current.name} — ${current.ability}`);
    const grid=document.getElementById("skinGrid");
    if(grid)grid.innerHTML=skins.map(s=>{const unlocked=level>=s.level,eq=s.id===current.id;return `<div class="skinCard ${unlocked?"unlocked":"locked"} ${eq?"equipped":""}"><div style="font-size:20px;font-weight:900;color:${s.color}">${s.name}</div><div class="small">${s.ability}</div><div class="small">${unlocked?"解除済み":`Lv${s.level}で解除`} ${eq?" / 装備中":""}</div></div>`}).join("");
    const tree=document.getElementById("evolutionTree");
    if(tree)tree.innerHTML=Array.from({length:6},(_,i)=>`<div class="evoNode ${i<evo?"active":""}">第${i+1}形態<br><span class="small">${i<evo?"起動済み":"未起動"}</span></div>`).join("");
    set("evolutionInfo",evo>=6?"最終進化済みです。":`次の進化には ${evo*900} コイン必要です。`);
    const unlocked=skins.filter(s=>level>=s.level).length;
    set("collectionInfo",`スキン ${unlocked}/${skins.length}種解除 / 収集率 ${Math.round(unlocked/skins.length*100)}%`);
    return true;
  }
  function repairSave(){
    try{JSON.parse(localStorage.getItem("shooking2")||"{}")}catch(e){localStorage.setItem("shooking2",JSON.stringify({level:1,coins:0,maxStage:1,maxClearedStage:0,maxHp:120,damage:1,fire:1,engine:1,weapon:"m16",unlockedWeapons:["m16"]}));}
    const evo=number(localStorage.getItem("shooking2_evolution_level"),1);if(evo<1||evo>6)localStorage.setItem("shooking2_evolution_level","1");
  }
  function install(){
    repairSave();
    const original=typeof window.openHangar==="function"?window.openHangar:null;
    window.openHangar=function(){
      let opened=false;
      if(original){try{original.apply(this,arguments);opened=!document.getElementById("hangar")?.classList.contains("hidden");}catch(e){console.warn("Hangar original failed",e);}}
      setTimeout(()=>{try{renderSafeHangar();}catch(e){console.error(e);alert("格納庫の表示を修復できませんでした。ページを再読み込みしてください。");}},opened?30:0);
    };
    window.addEventListener("error",e=>{if(String(e.message||"").toLowerCase().includes("hangar"))setTimeout(renderSafeHangar,0);});
  }
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",install):install();
})();