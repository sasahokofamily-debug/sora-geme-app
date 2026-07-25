(()=>{
  "use strict";

  const STEPS=[
    {title:"ようこそ",text:"こんにちは！ぼくは案内役のNyanD。SHOO KING IIの遊び方を順番に説明するよ。",target:null},
    {title:"ホーム",text:"ここがホーム画面。ゲーム開始、オンライン、格納庫、ガチャなどへ進めるよ。",target:"#homeScreen,#home,.homeScreen"},
    {title:"ゲーム開始",text:"まずはゲーム開始ボタンを押して、ステージ選択へ進んでみよう。",target:"#startButton,[data-action='start'],button[onclick*='startGame']"},
    {title:"移動",text:"ゲーム中は移動キーやスティックで自分の機体を動かすよ。少し動かしてみよう。",target:"#game,.gameCanvas,canvas"},
    {title:"攻撃",text:"攻撃ボタンやクリックで弾を撃てるよ。敵との距離を取りながら攻撃しよう。",target:"#fireButton,[data-action='fire'],button[onclick*='shoot']"},
    {title:"コインと強化",text:"敵を倒すとコインや報酬が手に入るよ。格納庫やショップで装備を強化できる。",target:"#hangarButton,[data-action='hangar'],button[onclick*='Hangar']"},
    {title:"ガチャ",text:"ガチャでは新しい装備や限定アイテムを入手できるよ。季節限定ガチャも確認してね。",target:"#gachaButton,[data-action='gacha'],button[onclick*='Gacha']"},
    {title:"オンライン",text:"オンラインでは部屋に入り、味方と協力してボスや敵と戦えるよ。",target:"#onlineButton,[data-action='online'],button[onclick*='Online']"},
    {title:"自動保存",text:"ログイン中は進行状況をクラウドへ保存できるよ。別の端末でも同じアカウントで続けられる。",target:null},
    {title:"完了",text:"チュートリアル完了！分からなくなったら設定からいつでも見直せるよ。",target:null}
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
    @keyframes nyandPulse{to{box-shadow:0 0 0 12px rgba(88,166,255,.08),0 0 40px rgba(88,166,255,.7)}}
    #tutorialSettingsButton{width:100%;margin-top:10px}
  `;
  document.head.appendChild(css);

  let step=0,timer=null,currentTarget=null;
  const speak=(text)=>{
    try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="ja-JP";u.rate=.95;speechSynthesis.speak(u)}catch(e){}
  };
  const clearTarget=()=>{if(currentTarget){currentTarget.classList.remove("nyand-target");currentTarget=null;}};
  const findTarget=(selector)=>{
    if(!selector)return null;
    for(const s of selector.split(",")){const el=document.querySelector(s.trim());if(el&&el.offsetParent!==null)return el;}
    return null;
  };
  const typeText=(text)=>{
    clearInterval(timer);const box=document.getElementById("nyandText");box.textContent="";let i=0;
    timer=setInterval(()=>{box.textContent=text.slice(0,++i);if(i>=text.length)clearInterval(timer)},22);
  };
  const render=()=>{
    const data=STEPS[step],root=document.getElementById("nyandTutorial");if(!root)return;
    clearTarget();
    document.getElementById("nyandTitle").textContent=data.title;
    document.getElementById("nyandProgress").textContent=`${step+1} / ${STEPS.length}`;
    typeText(data.text);speak(data.text);
    const target=findTarget(data.target);
    const hint=document.getElementById("nyandHint");
    if(target){currentTarget=target;target.classList.add("nyand-target");target.scrollIntoView({behavior:"smooth",block:"center"});hint.textContent="青く光っている場所を確認してね。"}
    else hint.textContent="「次へ」で進めます。";
    document.getElementById("nyandPrev").disabled=step===0;
    document.getElementById("nyandNext").textContent=step===STEPS.length-1?"完了":"次へ";
    localStorage.setItem("shookingTutorialStep",String(step));
  };
  const close=()=>{clearInterval(timer);clearTarget();speechSynthesis?.cancel?.();document.getElementById("nyandTutorial")?.classList.remove("show")};
  const open=(resume=false)=>{step=resume?Math.min(STEPS.length-1,Number(localStorage.getItem("shookingTutorialStep")||0)):0;document.getElementById("nyandTutorial")?.classList.add("show");render()};

  function build(){
    if(document.getElementById("nyandTutorial"))return;
    const root=document.createElement("div");root.id="nyandTutorial";
    root.innerHTML=`<div id="nyandCard" role="dialog" aria-modal="true" aria-labelledby="nyandTitle"><div id="nyandHead"><div id="nyandFace">🐱</div><div id="nyandTitle"></div><div id="nyandProgress"></div></div><div id="nyandText"></div><div id="nyandHint"></div><div id="nyandActions"><button id="nyandSkip">スキップ</button><button id="nyandPrev">戻る</button><button id="nyandNext" class="primary">次へ</button></div></div>`;
    document.body.appendChild(root);
    document.getElementById("nyandSkip").addEventListener("click",close);
    document.getElementById("nyandPrev").addEventListener("click",()=>{if(step>0){step--;render()}});
    document.getElementById("nyandNext").addEventListener("click",()=>{if(step>=STEPS.length-1){localStorage.setItem("shookingTutorialCompleted","1");close();return}step++;render()});
  }

  function addSettingsButton(){
    if(document.getElementById("tutorialSettingsButton"))return;
    const candidates=["#settingsScreen .panel","#settings .panel","#settingsScreen","#settings"];
    let parent=null;for(const s of candidates){const el=document.querySelector(s);if(el){parent=el;break;}}
    if(!parent)return;
    const btn=document.createElement("button");btn.id="tutorialSettingsButton";btn.type="button";btn.textContent="🐱 チュートリアルを見る";btn.addEventListener("click",()=>open(true));parent.appendChild(btn);
  }

  function blockGithubLinks(){
    document.querySelectorAll('a[href*="github.com"],a[href*="github.io"]').forEach(a=>a.remove());
    document.addEventListener("click",e=>{
      const a=e.target.closest("a[href]");if(!a)return;
      try{const u=new URL(a.href,location.href);if(/(^|\.)github\.com$|(^|\.)github\.io$/.test(u.hostname)){e.preventDefault();e.stopImmediatePropagation();}}
      catch(err){}
    },true);
  }

  function init(){build();addSettingsButton();blockGithubLinks();setInterval(addSettingsButton,1200);setInterval(blockGithubLinks,2500);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
  window.startShookingTutorial=()=>open(false);
})();
