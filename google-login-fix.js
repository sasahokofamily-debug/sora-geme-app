(()=>{
  "use strict";

  const CONFIG_KEY="shooking2_firebase_config";
  const FIREBASE_VERSION="10.12.5";
  let authPromise=null;
  let running=false;

  function message(text,isError=false){
    const el=document.getElementById("googleLoginMessage")||document.getElementById("loginMessage");
    if(!el)return;
    el.textContent=text;
    el.style.color=isError?"#fca5a5":"#bfdbfe";
  }

  function getConfig(){
    if(window.SHOO_KING_FIREBASE_CONFIG)return window.SHOO_KING_FIREBASE_CONFIG;
    try{return JSON.parse(localStorage.getItem(CONFIG_KEY)||"null");}catch{return null;}
  }

  function waitFor(check,timeout=12000){
    return new Promise((resolve,reject)=>{
      const started=Date.now();
      const timer=setInterval(()=>{
        if(check()){clearInterval(timer);resolve();}
        else if(Date.now()-started>=timeout){clearInterval(timer);reject(new Error("Firebaseの読み込みがタイムアウトしました"));}
      },80);
    });
  }

  function loadScript(src,id,ready){
    return new Promise((resolve,reject)=>{
      if(ready())return resolve();
      const existing=document.getElementById(id);
      if(existing){waitFor(ready).then(resolve,reject);return;}
      const script=document.createElement("script");
      script.id=id;
      script.src=src;
      script.async=false;
      script.onload=()=>waitFor(ready).then(resolve,reject);
      script.onerror=()=>reject(new Error("Firebaseライブラリを読み込めませんでした"));
      document.head.appendChild(script);
    });
  }

  async function getAuth(){
    if(authPromise)return authPromise;
    authPromise=(async()=>{
      const config=getConfig();
      if(!config?.apiKey||!config?.authDomain||!config?.projectId||!config?.appId){
        throw Object.assign(new Error("Firebase設定が見つかりません"),{code:"auth/missing-config"});
      }
      await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,"firebaseAppSdk",()=>!!window.firebase?.initializeApp);
      await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth-compat.js`,"firebaseAuthSdk",()=>!!window.firebase?.auth);
      const app=firebase.apps?.length?firebase.app():firebase.initializeApp(config);
      const auth=app.auth();
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      return auth;
    })();
    try{return await authPromise;}catch(error){authPromise=null;throw error;}
  }

  function readableError(error){
    const code=String(error?.code||"");
    if(code==="auth/popup-blocked")return "ポップアップがブロックされました。画面移動方式で開き直します。";
    if(code==="auth/popup-closed-by-user")return "Googleログイン画面が閉じられました。もう一度押してください。";
    if(code==="auth/cancelled-popup-request")return "ログイン処理が重なりました。数秒待ってからもう一度押してください。";
    if(code==="auth/unauthorized-domain")return `Firebaseの承認済みドメインに「${location.hostname}」を追加してください。`;
    if(code==="auth/network-request-failed")return "通信に失敗しました。インターネット接続を確認してください。";
    if(code==="auth/operation-not-allowed")return "Firebase AuthenticationでGoogleログインが有効になっていません。";
    if(code==="auth/web-storage-unsupported")return "ブラウザのCookieまたはサイトデータが無効です。設定を許可してください。";
    return error?.message||"Googleログインに失敗しました。";
  }

  function shouldUseRedirect(){
    const ua=navigator.userAgent||"";
    const ios=/iPad|iPhone|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
    const standalone=window.matchMedia?.("(display-mode: standalone)")?.matches||navigator.standalone===true;
    return ios||standalone;
  }

  async function fixedGoogleLogin(){
    if(running)return;
    running=true;
    const buttons=[...document.querySelectorAll("button")].filter(button=>(button.textContent||"").includes("Googleでログイン"));
    buttons.forEach(button=>button.disabled=true);
    try{
      message("Googleログインを準備しています...");
      const auth=await getAuth();
      const provider=new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({prompt:"select_account"});

      if(shouldUseRedirect()){
        sessionStorage.setItem("shooking2_google_redirect_pending","1");
        message("Googleログイン画面へ移動します...");
        await auth.signInWithRedirect(provider);
        return;
      }

      try{
        const result=await auth.signInWithPopup(provider);
        if(result?.user)message("Googleでログインしました。ゲームデータを読み込んでいます...");
      }catch(error){
        if(error?.code==="auth/popup-blocked"){
          sessionStorage.setItem("shooking2_google_redirect_pending","1");
          message("ポップアップが使えないため、Googleログイン画面へ移動します...");
          await auth.signInWithRedirect(provider);
          return;
        }
        throw error;
      }
    }catch(error){
      console.error("Google login fix:",error);
      message("Googleログインに失敗しました："+readableError(error),true);
    }finally{
      running=false;
      buttons.forEach(button=>button.disabled=false);
    }
  }

  async function finishRedirect(){
    const pending=sessionStorage.getItem("shooking2_google_redirect_pending")==="1";
    try{
      const auth=await getAuth();
      const result=await auth.getRedirectResult();
      sessionStorage.removeItem("shooking2_google_redirect_pending");
      if(result?.user){
        message("Googleでログインしました。ゲームデータを読み込んでいます...");
      }else if(pending&&auth.currentUser){
        message("Googleログインを確認しました。ゲームデータを読み込んでいます...");
      }else if(pending){
        message("Googleログインを完了できませんでした。もう一度お試しください。",true);
      }
    }catch(error){
      sessionStorage.removeItem("shooking2_google_redirect_pending");
      console.error("Google redirect result:",error);
      message("Googleログインに失敗しました："+readableError(error),true);
    }
  }

  function bindButtons(){
    window.startGoogleLogin=fixedGoogleLogin;
    document.querySelectorAll("button").forEach(button=>{
      const text=(button.textContent||"").trim();
      const onclick=button.getAttribute("onclick")||"";
      if(text.includes("Googleでログイン")||onclick.includes("startGoogleLogin")){
        button.onclick=event=>{event.preventDefault();event.stopPropagation();fixedGoogleLogin();};
        button.disabled=false;
      }
    });
  }

  function install(){
    bindButtons();
    new MutationObserver(bindButtons).observe(document.documentElement,{childList:true,subtree:true});
    finishRedirect();
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
})();