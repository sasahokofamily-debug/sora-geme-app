(()=>{
  "use strict";

  const GUIDE_VERSION="control-real-v3";
  const STEPS=[
    {title:"ようこそ",text:"こんにちは！ぼくは案内役のNyanD。SHOO KING IIの遊び方を最初から順番に説明するよ。",target:null},
    {title:"ホーム",text:"ここがホーム画面。ゲーム開始、オンライン、格納庫、ガチャなどへ進めるよ。",target:"#homeScreen,#home,.homeScreen",screen:"home"},
    {title:"ゲーム開始",text:"ゲーム開始ボタンからステージ選択へ進めるよ。チュートリアル中は説明だけなので、押さなくても次へ進めるよ。",target:"#startButton,[data-action='start'],button[onclick*='startGame']",screen:"home"},
    {title:"スマホで移動",text:"スマホでは画面左下の丸いスティックを指で動かして移動するよ。実際のスティックが出るまで見本を消さずに待つよ。",target:"#joystick",control:"move"},
    {title:"スマホで攻撃",text:"画面右下の攻撃ボタンを押すと弾を撃てるよ。実際のボタンが出るまで見本を消さずに待つよ。",target:"#fireButton",control:"fire"},
    {title:"パソコン操作",text:"パソコンではキーボードやマウスで移動・照準・攻撃ができるよ。",target:"#game,.gameCanvas,canvas"},
    {title:"コインと強化",text:"敵を倒すとコインや報酬が手に入るよ。格納庫やショップで装備を強化できる。",target:"#hangarButton,[data-action='hangar'],button[onclick*='Hangar']",screen:"home"},
    {title:"ガチャ",text:"ガチャでは新しい装備や限定アイテムを入手できるよ。季節限定ガチャも確認してね。",target:"#gachaButton,[data-action='gacha'],button[onclick*='Gacha']",screen:"home"},
    {title:"オンライン",text:"オンラインでは部屋に入り、味方と協力してボスや敵と戦えるよ。",target:"#onlineButton,[data-action='online'],button[onclick*='Online']",screen:"home"},
    {title:"保存について",text:"Googleログイン中はクラウド保存できるよ。ゲストで遊ぶ場合は保存されず、ページを閉じるとデータが消えるよ。",target:null},
    {title:"完了",text:"チュートリアル完了！設定から開くたびに、必ず最初のページから始まるよ。",target:null}
  ];

  const css=document.createElement("style");
  css.textContent=`
    #nyandTutorial{position:fixed;inset:0;z-index:2147482500;display:none;background:rgba(1,4,9,.72);backdrop-filter:blur(4px);font-family:system-ui,sans-serif}
    #nyandTutorial.show{display:block}
    #nyandCard{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);width:min(680px,calc(100vw - 24px));padding:18px;border:1px solid #30363d;border-radius:18px;background:#0d1117;color:#e6edf3;box-shadow:0 24px 80px rgba(0,0,0,.55)}
    #nyandHead{display:flex;gap:12px;align-items:center;margin-bottom:12px}
    #nyandFace{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;background:#161b22;border:1px solid #30363d;font-size:28px}
    #nyandTitle{font-size:18px;font-weight:900}
    #nyandProgress{margin-left:auto;color:#8b949e;font-size:12px;font-weight:800}
    #nyandText{min-height:72px;line-height:1.7;color:#c9d1d9;white-space:pre-wrap}
    #nyandHint{margin-top:8px;color:#79c0ff;font-size:12px;min-height:18px}
    #nyandActions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:14px}
    #nyandActions button{min-height:40px;padding:0 14px;border:1px solid #30363d;border-radius:9px;background:#21262d;color:#e6edf3;font-weight:800;cursor:pointer}
    #nyandActions .primary{background:#238636;color:#fff}
    .nyand-target{position:relative!important;z-index:2147482600!important;outline:4px solid #58a6ff!important;box-shadow:0 0 0 8px rgba(88,166,255,.22),0 0 30px rgba(88,166,255,.55)!important;animation:nyandPulse 1s ease-in-out infinite alternate}
    .nyand-control-target{outline:4px solid #58a6ff!important;box-shadow:0 0 0 8px rgba(88,166,255,.22),0 0 30px rgba(88,166,255,.55)!important;animation:nyandPulse 1s ease-in-out infinite alternate}
    body.nyand-real-controls #mobileControls{z-index:2147482550}
    @keyframes nyandPulse{to{box-shadow:0 0 0 12px rgba(88,166,255,.08),0 0 40px rgba(88,166,255,.7)}}
    #tutorialSettingsButton{width:100%;margin-top:10px}
    #nyandMobileDemo{position:fixed;inset:0;pointer-events:none;z-index:2147482540;display:none}
    #nyandMobileDemo.show{display:block}
    .nyand-stick{position:absolute;left:24px;bottom:190px;width:112px;height:112px;border-radius:50%;border:3px solid rgba(125,249,255,.8);background:rgba(15,23,42,.68);box-shadow:0 0 24px rgba(56,189,248,.45)}
    .nyand-stick::after{content:"";position:absolute;width:48px;height:48px;left:32px;top:32px;border-radius:50%;background:#38bdf8;box-shadow:0 0 18px #38bdf8}
    .nyand-fire{position:absolute;right:28px;bottom:205px;width:82px;height:82px;border-radius:50%;display:grid;place-items:center;border:3px solid #f97316;background:rgba(124,45,18,.82);color:white;font-size:30px;font-weight:900;box-shadow:0 0 24px rgba(249,115,22,.6)}
    @media(max-width:700px),(pointer:coarse){
      #nyandCard{top:max(68px,calc(env(safe-area-inset-top) + 68px));bottom:auto;width:calc(100vw - 20px);max-height:44dvh;overflow:auto;padding:12px;border-radius:14px}
      #nyandHead{gap:8px;margin-bottom:8px}
      #nyandFace{width:40px;height:40px;border-radius:12px;font-size:22px}
      #nyandTitle{font-size:15px}
      #nyandText{min-height:44px;font-size:13px;line-height:1.55}
      #nyandHint{font-size:11px}
      #nyandActions{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-top:10px}
      #nyandActions button{min-height:38px;padding:0 8px;font-size:12px}
    }
  `;
  document.head.appendChild(css);

  let step=0,timer=null,currentTarget=null,currentTargetClass="",controlDemo=null,controlWatch=null,renderToken=0;
  window.__shookingTutorialGuideVersion=GUIDE_VERSION;

  const speak=text=>{try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="ja-JP";u.rate=.95;speechSynthesis.speak(u)}catch(e){}};
  const clearTarget=()=>{if(currentTarget){currentTarget.classList.remove(currentTargetClass||"nyand-target");currentTarget=null;currentTargetClass="";}};
  const clearControlWatch=()=>{if(controlWatch){clearInterval(controlWatch);controlWatch=null;}};
  const typeText=text=>{clearInterval(timer);const box=document.getElementById("nyandText");box.textContent="";let i=0;timer=setInterval(()=>{box.textContent=text.slice(0,++i);if(i>=text.length)clearInterval(timer)},22);};

  function openScreenSafe(name){
    if(!name)return;
    try{if(typeof window.openScreen==="function")window.openScreen(name);else if(typeof window.showScreen==="function")window.showScreen(name);}catch(error){console.warn("Tutorial screen open failed",error);}
  }

  function showMobileDemo(mode){
    const demo=document.getElementById("nyandMobileDemo");if(!demo)return;
    demo.classList.toggle("show",!!mode);
    demo.querySelector(".nyand-stick").style.display=mode==="move"?"block":"none";
    demo.querySelector(".nyand-fire").style.display=mode==="fire"?"grid":"none";
  }

  function hasGameControlGlobals(){
    try{return typeof mobileControlsEnabled!=="undefined"&&typeof mobileSimpleControlsEnabled!=="undefined"&&typeof largeButtonsEnabled!=="undefined"&&typeof applyMobileControlsVisibility==="function"}catch(e){return false}
  }

  function getVisibilityInfo(el){
    const result={ok:false,reason:"missing",rect:null,zIndex:null,parentHidden:false};
    if(!el)return result;
    let node=el;
    while(node&&node.nodeType===1){
      const cs=getComputedStyle(node);
      if(cs.display==="none"||cs.visibility==="hidden"||cs.visibility==="collapse"||Number(cs.opacity)===0){
        result.reason=`hidden:${node.id||node.className||node.tagName}`;
        result.parentHidden=node!==el;
        return result;
      }
      node=node.parentElement;
    }
    const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
    result.rect={left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
    result.zIndex=cs.zIndex;
    if(r.width<8||r.height<8){result.reason="zero-size";return result}
    if(r.right<=0||r.bottom<=0||r.left>=innerWidth||r.top>=innerHeight){result.reason="outside-viewport";return result}
    result.ok=true;
    result.reason="visible";
    return result;
  }

  function setTarget(target,isControl=false){
    clearTarget();
    if(!target)return;
    currentTarget=target;
    currentTargetClass=isControl?"nyand-control-target":"nyand-target";
    currentTarget.classList.add(currentTargetClass);
    if(!isControl)target.scrollIntoView({behavior:"smooth",block:"center"});
  }

  function findTarget(selector){
    if(!selector)return null;
    for(const s of selector.split(",")){const el=document.querySelector(s.trim());if(getVisibilityInfo(el).ok)return el;}
    return null;
  }

  function restoreMobileControlDemo(){
    clearControlWatch();
    showMobileDemo(null);
    if(!controlDemo)return;
    try{
      mobileControlsEnabled=controlDemo.mobileControlsEnabled;
      mobileSimpleControlsEnabled=controlDemo.mobileSimpleControlsEnabled;
      largeButtonsEnabled=controlDemo.largeButtonsEnabled;
      applyMobileControlsVisibility();
    }catch(e){}
    document.body.classList.remove("nyand-real-controls");
    controlDemo=null;
  }

  function applyRealMobileControls(kind){
    if(!hasGameControlGlobals())return false;
    if(!controlDemo){
      controlDemo={mobileControlsEnabled,mobileSimpleControlsEnabled,largeButtonsEnabled};
    }
    mobileControlsEnabled=true;
    if(kind==="move")mobileSimpleControlsEnabled=controlDemo.mobileSimpleControlsEnabled;
    if(kind==="fire")mobileSimpleControlsEnabled=false;
    applyMobileControlsVisibility();
    document.body.classList.add("nyand-real-controls");
    return true;
  }

  function activateControlStep(kind,hint){
    const selector=kind==="fire"?"#fireButton":"#joystick";
    const label=kind==="fire"?"攻撃ボタン":"移動スティック";
    showMobileDemo(kind);
    const tryShow=()=>{
      applyRealMobileControls(kind);
      const target=document.querySelector(selector);
      const info=getVisibilityInfo(target);
      window.__shookingTutorialLastControlCheck={kind,selector,info};
      if(info.ok){
        clearControlWatch();
        showMobileDemo(null);
        setTarget(target,true);
        hint.textContent=`本物の${label}が表示されています。`;
        return true;
      }
      hint.textContent=`本物の${label}を準備中です。表示されるまで見本は残ります。`;
      return false;
    };
    if(!tryShow())controlWatch=setInterval(tryShow,250);
  }

  function render(){
    const data=STEPS[step],root=document.getElementById("nyandTutorial");if(!root)return;
    const token=++renderToken;
    clearControlWatch();
    clearTarget();
    if(!data.control)restoreMobileControlDemo();
    if(data.screen&&!data.control)openScreenSafe(data.screen);
    document.getElementById("nyandTitle").textContent=data.title;
    document.getElementById("nyandProgress").textContent=`${step+1} / ${STEPS.length}`;
    typeText(data.text);speak(data.text);
    const hint=document.getElementById("nyandHint");
    if(data.control)activateControlStep(data.control,hint);
    else{
      setTimeout(()=>{
        if(token!==renderToken)return;
        const target=findTarget(data.target);
        if(target){setTarget(target);hint.textContent="青く光っている場所を確認してね。"}
        else hint.textContent="「次へ」で進めます。";
      },180);
    }
    document.getElementById("nyandPrev").disabled=step===0;
    document.getElementById("nyandNext").textContent=step===STEPS.length-1?"完了":"次へ";
  }

  const close=()=>{renderToken++;clearInterval(timer);clearTarget();restoreMobileControlDemo();speechSynthesis?.cancel?.();document.getElementById("nyandTutorial")?.classList.remove("show");};
  const open=()=>{step=0;localStorage.removeItem("shookingTutorialStep");document.getElementById("nyandTutorial")?.classList.add("show");render();};

  function build(){
    if(document.getElementById("nyandTutorial"))return;
    const demo=document.createElement("div");demo.id="nyandMobileDemo";demo.innerHTML='<div class="nyand-stick"></div><div class="nyand-fire">●</div>';document.body.appendChild(demo);
    const root=document.createElement("div");root.id="nyandTutorial";
    root.innerHTML=`<div id="nyandCard" role="dialog" aria-modal="true" aria-labelledby="nyandTitle"><div id="nyandHead"><div id="nyandFace">🐱</div><div id="nyandTitle"></div><div id="nyandProgress"></div></div><div id="nyandText"></div><div id="nyandHint"></div><div id="nyandActions"><button id="nyandSkip">スキップ</button><button id="nyandPrev">戻る</button><button id="nyandNext" class="primary">次へ</button></div></div>`;
    document.body.appendChild(root);
    document.getElementById("nyandSkip").addEventListener("click",close);
    document.getElementById("nyandPrev").addEventListener("click",()=>{if(step>0){step--;render();}});
    document.getElementById("nyandNext").addEventListener("click",()=>{if(step>=STEPS.length-1){localStorage.setItem("shookingTutorialCompleted","1");close();return;}step++;render();});
  }

  function addSettingsButton(){
    if(document.getElementById("tutorialSettingsButton"))return;
    const candidates=["#settingsScreen .panel","#settings .panel","#settingsScreen","#settings"];
    let parent=null;for(const s of candidates){const el=document.querySelector(s);if(el){parent=el;break;}}
    if(!parent)return;
    const btn=document.createElement("button");btn.id="tutorialSettingsButton";btn.type="button";btn.textContent="🐱 チュートリアルを最初から見る";btn.addEventListener("click",open);parent.appendChild(btn);
  }

  function blockGithubLinks(){
    document.querySelectorAll('a[href*="github.com"],a[href*="github.io"]').forEach(a=>a.remove());
    document.addEventListener("click",e=>{const a=e.target.closest("a[href]");if(!a)return;try{const u=new URL(a.href,location.href);if(/(^|\.)github\.com$|(^|\.)github\.io$/.test(u.hostname)){e.preventDefault();e.stopImmediatePropagation();}}catch(err){}},true);
  }

  function init(){build();addSettingsButton();blockGithubLinks();setInterval(addSettingsButton,1200);setInterval(blockGithubLinks,2500);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
  window.startShookingTutorial=open;
})();
