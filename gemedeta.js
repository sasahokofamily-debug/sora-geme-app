(()=>{
'use strict';

const data={
  version:'1.0.0',
  game:{
    title:'SHOO KING II',
    language:'ja',
    maxLevel:100,
    autosave:true,
    saveKey:'shooking2_save'
  },
  player:{
    startHp:100,
    maxHp:100,
    startCoins:500,
    startLevel:1,
    moveSpeed:1,
    damageMultiplier:1,
    fireRateMultiplier:1,
    knockbackMultiplier:1,
    engineMultiplier:1
  },
  gacha:{
    normal:{cost:100,label:'通常ガチャ'},
    rare:{cost:300,label:'レアガチャ'},
    summer:{cost:180,label:'すずしーガチャ',months:[6,7,8]},
    winter:{cost:180,label:'暖房ガチャ',months:[12,1,2]},
    pity:{rareAfter:10,legendAfter:50}
  },
  weapons:{
    assault:{name:'アサルトライフル',damage:18,fireRate:0.09,reload:1.8,magazine:30},
    sniper:{name:'スナイパーライフル',damage:150,fireRate:1.2,reload:2.5,magazine:5},
    shotgun:{name:'ショットガン',damage:22,pellets:7,fireRate:0.8,reload:2.2,magazine:8}
  },
  enemies:{
    normal:{hp:50,attack:8,speed:1,rewardCoins:10},
    fast:{hp:35,attack:6,speed:1.7,rewardCoins:15},
    heavy:{hp:180,attack:20,speed:0.55,rewardCoins:35},
    boss:{hp:2000,attack:80,speed:0.7,rewardCoins:500}
  },
  rewards:{
    enemyDefeat:10,
    bossDefeat:500,
    dailyBonus:300,
    firstClear:250
  },
  seats:{
    prefix:'A',
    startNumber:1,
    digits:2,
    defaultInviteEmail:'mysk97104@gmail.com'
  },
  ui:{
    showGmailInvite:true,
    showSeasonalGacha:true,
    mobileBreakpoint:560
  }
};

function get(path,fallback){
  if(!path)return data;
  const value=String(path).split('.').reduce((obj,key)=>obj&&Object.prototype.hasOwnProperty.call(obj,key)?obj[key]:undefined,data);
  return value===undefined?fallback:value;
}

function isSeasonActive(kind,date=new Date()){
  const months=get(`gacha.${kind}.months`,[]);
  return Array.isArray(months)&&months.includes(date.getMonth()+1);
}

window.GameData=data;
window.getGameData=get;
window.isGameSeasonActive=isSeasonActive;
window.dispatchEvent(new CustomEvent('gamedataready',{detail:data}));
})();
