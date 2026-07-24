(()=>{
  "use strict";

  const style=document.createElement("style");
  style.textContent=`
    #loginScreen,#registerScreen{
      background:
        radial-gradient(circle at 15% 15%,rgba(47,129,247,.18),transparent 32%),
        radial-gradient(circle at 85% 78%,rgba(59,130,246,.10),transparent 34%),
        linear-gradient(135deg,#010409,#08111f 55%,#0d1117);
      align-items:flex-start;
      padding:24px 0;
    }
    #loginScreen .panel,#registerScreen .panel{
      width:min(460px,94vw);max-height:none;margin:auto;padding:24px;border:1px solid #30363d;
      border-radius:18px;background:rgba(13,17,23,.95);box-shadow:0 24px 80px rgba(0,0,0,.48);
      text-align:left;overflow:visible;
    }
    #loginScreen h1,#registerScreen h1{color:#e6edf3;font-size:28px;margin:0 0 8px;letter-spacing:-.02em}
    #loginScreen .panel::before,#registerScreen .panel::before{
      content:"SK";display:grid;place-items:center;width:54px;height:54px;margin-bottom:14px;
      border:1px solid #30363d;border-radius:16px;color:#fff;font-size:20px;font-weight:900;
      background:#000;box-shadow:inset 0 0 0 1px rgba(255,255,255,.03)
    }
    #loginScreen .authBox,#registerScreen .authBox{margin:14px 0 0;padding:0;border:0;border-radius:0;background:transparent}
    #loginScreen label,#registerScreen label{display:block;margin-top:12px;color:#8b949e;font-size:12px;font-weight:800}
    #loginScreen input,#registerScreen input{margin:7px 0 0;padding:13px 14px;border:1px solid #30363d;border-radius:10px;background:#010409;color:#e6edf3;font-size:15px}
    #loginScreen input:focus,#registerScreen input:focus{outline:none;border-color:#2f81f7;box-shadow:0 0 0 3px rgba(47,129,247,.22)}
    #loginScreen button,#registerScreen button{min-height:44px;border:1px solid #30363d;border-radius:9px;background:linear-gradient(180deg,#21262d,#161b22);color:#e6edf3;font-size:14px}
    #loginScreen .authBox>button:first-of-type,#registerScreen .authBox>button:first-of-type{background:#238636;border-color:rgba(240,246,252,.1);color:#fff}
    #loginScreen .authBox>button:first-of-type:hover,#registerScreen .authBox>button:first-of-type:hover{background:#2ea043}
    #loginScreen .back,#registerScreen .back{background:transparent;color:#8b949e;border-color:#30363d}
    #loginScreen .small,#registerScreen .small{color:#8b949e;opacity:1}
    #loginScreen .authDanger,#registerScreen .authDanger{border:1px solid rgba(210,153,34,.38);background:rgba(210,153,34,.08);color:#f2cc60;border-radius:10px;font-size:12px;line-height:1.55}
    #googleLoginArea{margin-top:16px!important;padding-top:16px!important;border-top:1px solid #30363d!important}
    #googleLoginArea h2{font-size:14px;color:#e6edf3;text-align:center}
    #googleLoginArea button{background:#fff!important;color:#24292f!important;border:1px solid #d0d7de!important;font-weight:900}
    #googleLoginMessage,#loginMessage,#registerMessage{min-height:20px;margin:8px 0 0;line-height:1.45}
    #runtimeErrorScreen{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:24px;background:#fff;color:#18181b;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;box-sizing:border-box}
    #runtimeErrorScreen.visible{display:flex}
    #runtimeErrorCard{width:min(680px,100%);border:1px solid #e4e4e7;border-radius:16px;padding:28px;background:#fff;box-shadow:0 20px 70px rgba(0,0,0,.12)}
    #runtimeErrorCode{font-size:clamp(38px,8vw,72px);font-weight:900;line-height:1;margin:0 0 12px}
    #runtimeErrorTitle{font-size:20px;font-weight:800;margin-bottom:10px}
    #runtimeErrorMessage{color:#52525b;line-height:1.6;overflow-wrap:anywhere}
    #runtimeErrorMeta{margin:20px 0;padding:12px;border-radius:10px;background:#f4f4f5;color:#52525b;font-size:12px;line-height:1.7;overflow-wrap:anywhere;white-space:pre-wrap}
    #runtimeErrorActions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    #runtimeErrorActions button{margin:0;min-height:44px;border:1px solid #d4d4d8;border-radius:9px;background:#fff;color:#18181b;font:700 14px system-ui;cursor:pointer}
    #runtimeErrorActions button:first-child{background:#18181b;color:#fff;border-color:#18181b}
    #pageLoadingOverlay{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:rgba(2,6,23,.76);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);pointer-events:auto}
    #pageLoadingOverlay.visible{display:flex}
    #pageLoadingBox{display:flex;flex-direction:column;align-items:center;gap:14px;padding:22px 26px;border:1px solid rgba(125,249,255,.4);border-radius:18px;background:rgba(2,6,23,.92);box-shadow:0 0 34px rgba(56,189,248,.3);color:#e0f2fe;font:800 14px system-ui;letter-spacing:.05em}
    #pageLoadingSpinner{width:48px;height:48px;border:4px solid rgba(125,249,255,.2);border-top-color:#7df9ff;border-right-color:#38bdf8;border-radius:50%;animation:pageLoadingSpin .8s linear infinite;box-shadow:0 0 18px rgba(125,249,255,.35)}
    @keyframes pageLoadingSpin{to{transform:rotate(360deg)}}
    @media(max-width:700px){
      #loginScreen,#registerScreen{padding:12px 0}
      #loginScreen .panel,#registerScreen .panel{width:min(460px,calc(100vw - 20px));padding:18px;border-radius:16px}
      #loginScreen h1,#registerScreen h1{font-size:24px}
      #runtimeErrorCard{padding:20px}#runtimeErrorActions{grid-template-columns:1fr}
    }
  `;
  document.head.appendChild(style);

  function upgradeCopy(){
    const loginTitle=document.querySelector("#loginScreen h1");
    const registerTitle=document.querySelector("#registerScreen h1");
    if(loginTitle)loginTitle.textContent="SHOO KING II Login";
    if(registerTitle)registerTitle.textContent="SHOO KING II 新規登録";
    const loginBox=document.querySelector("#loginScreen .authBox");
    const registerBox=document.querySelector("#registerScreen .authBox");
    if(loginBox&&!loginBox.querySelector(".authIntro")){
      const p=document.createElement("p");p.className="small authIntro";
      p.textContent="ログインすると、クラウドセーブとオンライン機能を使えます。";loginBox.prepend(p);
    }
    if(registerBox&&!registerBox.querySelector(".authIntro")){
      const p=document.createElement("p");p.className="small authIntro";
      p.textContent="アカウントを作成して、SHOO KING IIを始めましょう。";registerBox.prepend(p);
    }
  }

  function ensureLoadingOverlay(){
    let overlay=document.getElementById("pageLoadingOverlay");
    if(!overlay){
      overlay=document.createElement("div");
      overlay.id="pageLoadingOverlay";
      overlay.setAttribute("aria-live","polite");
      overlay.setAttribute("aria-busy","true");
      overlay.innerHTML='<div id="pageLoadingBox"><div id="pageLoadingSpinner"></div><div id="pageLoadingText">読み込み中...</div></div>';
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  let loadingTimer=null;
  function showPageLoading(text="読み込み中..."){
    const overlay=ensureLoadingOverlay();
    const label=overlay.querySelector("#pageLoadingText");
    if(label)label.textContent=text;
    clearTimeout(loadingTimer);
    overlay.classList.add("visible");
  }
  function hidePageLoading(delay=180){
    clearTimeout(loadingTimer);
    loadingTimer=setTimeout(()=>{
      const overlay=document.getElementById("pageLoadingOverlay");
      if(overlay)overlay.classList.remove("visible");
    },Math.max(0,delay));
  }

  function installScreenTransitionLoader(){
    const wrapFunction=(name)=>{
      const original=window[name];
      if(typeof original!=="function"||original.__loadingWrapped)return;
      const wrapped=function(...args){
        showPageLoading("画面を読み込み中...");
        try{
          const result=original.apply(this,args);
          if(result&&typeof result.then==="function"){
            return result.finally(()=>hidePageLoading(220));
          }
          requestAnimationFrame(()=>requestAnimationFrame(()=>hidePageLoading(180)));
          return result;
        }catch(error){
          hidePageLoading(0);
          throw error;
        }
      };
      wrapped.__loadingWrapped=true;
      window[name]=wrapped;
    };
    ["openScreen","showScreen","openLogin","openRegister","openSettings","openStageSelect","openOnlinePlay","openModEditor","openRequestLog","openHangar","openAchievements","openSavedReports","openSaveManager","openFamilyMessageSettings","openQuestScreen","openMissionReport"].forEach(wrapFunction);

    document.addEventListener("click",event=>{
      const link=event.target.closest("a[href]");
      if(!link)return;
      const href=link.getAttribute("href")||"";
      if(!href||href.startsWith("#")||href.startsWith("javascript:")||link.target==="_blank"||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      try{
        const target=new URL(link.href,location.href);
        if(target.origin===location.origin&&target.href!==location.href)showPageLoading("ページを読み込み中...");
      }catch(e){}
    },true);

    window.addEventListener("beforeunload",()=>showPageLoading("ページを読み込み中..."));
    window.addEventListener("pageshow",()=>hidePageLoading(0));
  }

  function referenceId(){
    const bytes=new Uint8Array(8);
    if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(bytes);
    else for(let i=0;i<bytes.length;i++)bytes[i]=Math.floor(Math.random()*256);
    return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("").toUpperCase();
  }

  function classifyError(error,context={}){
    const text=String(error&&error.message||error||"");
    if(!navigator.onLine)return {code:"ERR_NETWORK_DISCONNECTED",title:"Network Disconnected",message:"インターネット接続が切断されました。接続を確認して再試行してください。"};
    if(context.status===401)return {code:"401",title:"Unauthorized",message:"ログイン情報が無効または期限切れです。再ログインしてください。"};
    if(context.status===403)return {code:"403",title:"Forbidden",message:"この操作を行う権限がありません。"};
    if(context.status===404)return {code:"404",title:"Not Found",message:"要求されたデータまたはページが見つかりませんでした。"};
    if(context.status===408||/timeout|timed out/i.test(text))return {code:"408",title:"Request Timeout",message:"処理が時間内に完了しませんでした。再試行してください。"};
    if(context.status===429)return {code:"429",title:"Too Many Requests",message:"短時間にリクエストが集中しました。少し待ってから再試行してください。"};
    if(context.status>=500)return {code:String(context.status),title:"Server Error",message:"サーバー側で問題が発生しました。しばらくしてから再試行してください。"};
    if(/quota|storage|localstorage|indexeddb/i.test(text))return {code:"STORAGE_ERROR",title:"Storage Error",message:"保存領域の読み書きに失敗しました。空き容量やブラウザ設定を確認してください。"};
    if(/firebase|firestore|auth/i.test(text))return {code:"CLOUD_SYNC_FAILED",title:"Cloud Sync Failed",message:"クラウドとの同期に失敗しました。接続状態を確認してください。"};
    if(/webgl|canvas|renderer/i.test(text))return {code:"RENDERER_ERROR",title:"Renderer Initialization Failed",message:"描画機能の初期化に失敗しました。ブラウザを再起動してください。"};
    return {code:"500",title:"Internal Application Error",message:"アプリ内で予期しないエラーが発生しました。"};
  }

  let shown=false;
  function showRealError(error,context={}){
    if(shown)return;
    if(error&&error.name==="AbortError")return;
    hidePageLoading(0);
    shown=true;
    const info=classifyError(error,context);
    let screen=document.getElementById("runtimeErrorScreen");
    if(!screen){
      screen=document.createElement("div");screen.id="runtimeErrorScreen";
      screen.innerHTML=`<div id="runtimeErrorCard"><div id="runtimeErrorCode"></div><div id="runtimeErrorTitle"></div><div id="runtimeErrorMessage"></div><div id="runtimeErrorMeta"></div><div id="runtimeErrorActions"><button id="runtimeRetry">再試行</button><button id="runtimeHome">ホームへ戻る</button></div></div>`;
      document.body.appendChild(screen);
    }
    const detail=String(error&&error.message||error||"詳細情報なし").slice(0,500);
    screen.querySelector("#runtimeErrorCode").textContent=info.code;
    screen.querySelector("#runtimeErrorTitle").textContent=info.title;
    screen.querySelector("#runtimeErrorMessage").textContent=info.message;
    screen.querySelector("#runtimeErrorMeta").textContent=`Path: ${location.pathname}${location.search}\nTime: ${new Date().toLocaleString()}\nReference: ${referenceId()}\nDetail: ${detail}`;
    screen.querySelector("#runtimeRetry").onclick=()=>location.reload();
    screen.querySelector("#runtimeHome").onclick=()=>{location.href="/"};
    screen.classList.add("visible");
  }

  window.addEventListener("error",event=>{
    if(event.target&&event.target!==window){
      const tag=event.target.tagName;
      if(["SCRIPT","LINK","IMG","AUDIO","VIDEO"].includes(tag)){
        showRealError(new Error(`${tag} resource failed: ${event.target.src||event.target.href||"unknown"}`),{status:0});
      }
      return;
    }
    showRealError(event.error||new Error(event.message||"Unknown JavaScript error"));
  },true);

  window.addEventListener("unhandledrejection",event=>{
    showRealError(event.reason instanceof Error?event.reason:new Error(String(event.reason||"Unhandled promise rejection")));
  });

  window.addEventListener("offline",()=>showRealError(new Error("Browser went offline")));

  const originalFetch=window.fetch;
  if(typeof originalFetch==="function"){
    window.fetch=async function(...args){
      try{
        const response=await originalFetch.apply(this,args);
        if(!response.ok&&[401,403,404,408,429,500,502,503,504].includes(response.status)){
          showRealError(new Error(`HTTP ${response.status} ${response.statusText}`),{status:response.status});
        }
        return response;
      }catch(error){
        showRealError(error);
        throw error;
      }
    };
  }

  window.SHOO_KING_ERROR_SCREEN={show:showRealError};
  window.SHOO_KING_LOADING={show:showPageLoading,hide:hidePageLoading};

  function init(){
    upgradeCopy();
    ensureLoadingOverlay();
    setTimeout(installScreenTransitionLoader,0);
    hidePageLoading(0);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
})();