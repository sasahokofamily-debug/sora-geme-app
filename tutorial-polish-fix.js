(()=>{
  'use strict';

  const VERSION='tutorial-polish-v1';
  let fakeMouse=null;
  let lastSpokenTitle='';
  let followFrame=0;

  const ENHANCED_TEXT={
    'スマホで攻撃':'右下のFIREを押して標的を撃ってみよう。移動スティックも消えずに残るよ。ここは操作練習だから標的は止まっているけど、本番では敵が動き回り、こちらへ攻撃もしてくるよ。',
    'パソコン操作':'WASDか矢印キーで移動。マウスで狙い、クリックかSpaceで攻撃できるよ。今この画面で本当に操作できるよ。ここでは標的は止まっているけど、本番では敵が動きながら攻撃してくるよ。'
  };

  function ensureMouse(){
    if(fakeMouse)return fakeMouse;
    fakeMouse=document.createElement('div');
    fakeMouse.id='nyandFakeMouseV3';
    fakeMouse.innerHTML='<span class="nyandFakePointer">➤</span><span class="nyandFakeLabel">🐱 NyanD</span><span class="nyandFakeClick"></span>';
    document.body.appendChild(fakeMouse);
    return fakeMouse;
  }

  const style=document.createElement('style');
  style.textContent=`
    #nyandFakeMouseV3{position:fixed;left:0;top:0;z-index:2147483646;display:none;align-items:center;gap:5px;pointer-events:none;transform:translate(-8px,-8px);filter:drop-shadow(0 5px 10px rgba(0,0,0,.75))}
    #nyandFakeMouseV3.show{display:flex;animation:nyandMouseFloat .8s ease-in-out infinite alternate}
    .nyandFakePointer{display:block;font-size:34px;line-height:1;color:#fff;transform:rotate(42deg);text-shadow:0 0 3px #000,0 0 10px #38bdf8}
    .nyandFakeLabel{padding:5px 9px;border:1px solid #67e8f9;border-radius:999px;background:rgba(2,6,23,.94);color:#e0faff;font-size:11px;font-weight:900;white-space:nowrap;box-shadow:0 0 16px rgba(56,189,248,.55)}
    .nyandFakeClick{position:absolute;left:5px;top:4px;width:24px;height:24px;border:3px solid #facc15;border-radius:50%;animation:nyandMouseClick 1.15s ease-out infinite}
    #nyandTutorialV2.nyand-start-pointer .nyand-v2-target{outline:none!important;box-shadow:none!important}
    @keyframes nyandMouseFloat{from{margin-top:-3px}to{margin-top:3px}}
    @keyframes nyandMouseClick{0%{opacity:0;transform:scale(.25)}25%{opacity:1}100%{opacity:0;transform:scale(1.45)}}
    @media(max-width:700px),(pointer:coarse){.nyandFakePointer{font-size:29px}.nyandFakeLabel{font-size:10px;padding:4px 7px}}
  `;
  document.head.appendChild(style);

  function visibleStartButton(){
    const selectors=['button[onclick*="openStageSelect"]','button[onclick*="startGame"]','button[data-action="start"]','#startButton'];
    for(const selector of selectors){
      const el=document.querySelector(selector);
      if(el&&el.offsetParent!==null)return el;
    }
    return null;
  }

  function stopFollowing(){
    cancelAnimationFrame(followFrame);
    followFrame=0;
    fakeMouse?.classList.remove('show');
    document.getElementById('nyandTutorialV2')?.classList.remove('nyand-start-pointer');
  }

  function followStartButton(){
    const root=document.getElementById('nyandTutorialV2');
    const title=document.getElementById('nyandTitleV2');
    if(!root?.classList.contains('show')||title?.textContent!=='ゲーム開始'){
      stopFollowing();
      return;
    }
    const target=visibleStartButton();
    const mouse=ensureMouse();
    if(target){
      target.classList.remove('nyand-v2-target');
      root.classList.add('nyand-start-pointer');
      const r=target.getBoundingClientRect();
      mouse.style.left=`${Math.max(8,Math.min(innerWidth-120,r.left+r.width*.58))}px`;
      mouse.style.top=`${Math.max(8,Math.min(innerHeight-60,r.top+r.height*.48))}px`;
      mouse.classList.add('show');
      const hint=document.getElementById('nyandHintV2');
      if(hint)hint.textContent='NyanDのマウスが指している出撃ボタンを見てね。今はクリックしなくて大丈夫。';
    }else{
      mouse.classList.remove('show');
    }
    followFrame=requestAnimationFrame(followStartButton);
  }

  function speakEnhanced(title,text){
    if(lastSpokenTitle===title)return;
    lastSpokenTitle=title;
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.lang='ja-JP';
      u.rate=.95;
      speechSynthesis.speak(u);
    }catch{}
  }

  function refresh(){
    const root=document.getElementById('nyandTutorialV2');
    const titleEl=document.getElementById('nyandTitleV2');
    const textEl=document.getElementById('nyandTextV2');
    if(!root||!titleEl||!textEl)return;

    if(!root.classList.contains('show')){
      lastSpokenTitle='';
      stopFollowing();
      return;
    }

    const title=titleEl.textContent.trim();
    const replacement=ENHANCED_TEXT[title];
    if(replacement&&textEl.textContent!==replacement)textEl.textContent=replacement;
    if(replacement)speakEnhanced(title,replacement);

    if(title==='ゲーム開始'){
      if(!followFrame)followStartButton();
    }else{
      stopFollowing();
    }
  }

  function install(){
    ensureMouse();
    const observer=new MutationObserver(refresh);
    observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
    setInterval(refresh,180);
    refresh();
    window.__shookingTutorialPolishFix=VERSION;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();