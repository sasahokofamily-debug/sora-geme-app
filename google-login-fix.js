(()=>{
  "use strict";

  const CONFIG_KEY="shooking2_firebase_config";
  const CURRENT_KEY="shooking2_current_account";
  const PROFILE_KEY="shooking2_google_profile";
  const FIREBASE_VERSION="10.12.5";
  let running=false;

  function message(text,isError=false){
    const el=document.getElementById("googleLoginMessage")||document.getElementById("loginMessage");
    if(!el)return;
    el.textContent=text;
    el.style.color=isError?"#fca5a5":"#bfdbfe";
  }

  function getConfig(){
    try{return JSON.parse(localStorage.getItem(CONFIG_KEY)||"null")||window.SHOO_KING_FIREBASE_CONFIG||null;}
    catch{return window.SHOO_KING_FIREBASE_CONFIG||null;}
  }

  function loadScript(src,id){
    return new Promise((resolve,reject)=>{
      if(window.firebase&&id==="firebaseAppSdkFix"){resolve();return;}
      if(document.getElementById(id)){
        const started=Date.now();
        const timer=setInterval(()=>{
          if(window.firebase){clearInterval(timer);resolve();}
          else if(Date.now()-started>10000){clearInterval(timer);reject(new Error("Firebaseの読み込みがタイムアウトしました"));}
        },100);
        return;
      }
      const script=document.createElement("script");
      script.id=id;
      script.src=src;
      script.async=true;
      script.onload=resolve;
      script.onerror=()=>reject(new Error("Firebaseライブラリを読み込めませんでした"));
      document.head.appendChild(script);
    });
  }

  async function getAuth(){
    const config=getConfig();
    if(!config?.apiKey||!config?.authDomain||!config?.projectId||!config?.appId){
      throw Object.assign(new Error("Firebase設定が見つかりません"),{code:"auth/missing-config"});
    }
    if(!window.firebase){
      await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,"firebaseAppSdkFix");
    }
    if(!firebase.auth){
      await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth-compat.js`,"firebaseAuthSdkFix");
    }
    if(!firebase.apps?.length)firebase.initializeApp(config);
    const auth=firebase.auth();
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    return auth;
  }

  function saveAccount(user){
    if(!user)return;
    let old=null;
    try{old=JSON.parse(localStorage.getItem(PROFILE_KEY)||"null");}catch{}
    const account={
      provider:user.providerData?.[0]?.providerId||"google.com",
      uid:user.uid,
      accountName:user.displayName||user.email?.split("@")[0]||"Player",
      email:user.email||"",
      picture:user.photoURL||"",
      age:Number(old?.uid===user.uid?old.age:0)||0,
      birthYear:Number(old?.uid===user.uid?old.birthYear:0)||0,
      lastLoginAt:new Date().toISOString()
    };
    localStorage.setItem(PROFILE_KEY,JSON.stringify(account));
    localStorage.setItem(CURRENT_KEY,JSON.stringify(account));
  }

  function readableError(error){
    const code=error?.code||"";
    if(code==="auth/popup-blocked")return "ポップアップがブロックされました。画面移動方式で再試行します。";
    if(code==="auth/popup-closed-by-user")return "Googleログイン画面が閉じられました。";
    if(code==="auth/cancelled-popup-request")return "別のログイン処理が進行中です。少し待って再試行してください。";
    if(code==="auth/unauthorized-domain")return `この公開URLがFirebaseで許可されていません。許可ドメインに「${location.hostname}」を追加してください。`;
    if(code==="auth/network-request-failed")return "通信に失敗しました。インターネット接続を確認してください。";
    if(code==="auth/operation-not-allowed")return "Firebase AuthenticationでGoogleログインが有効になっていません。";
    if(code==="auth/internal-error")return "Google認証の内部エラーが発生しました。ページを再読み込みしてください。";
    return error?.message||"Googleログインに失敗しました。";
  }

  function shouldUseRedirect(){
    const ua=navigator.userAgent||"";
    const ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
    const standalone=window.matchMedia?.("(display-mode: standalone)")?.matches||navigator.standalone===true;
    return ios||standalone;
  }

  async function fixedGoogleLogin(){
    if(running)return;
    running=true;
    const button=document.querySelector("#firebaseLoginExtras button[onclick*='startGoogleLogin']");
    if(button)button.disabled=true;
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
        saveAccount(result.user||auth.currentUser);
        message("Googleでログインしました。");
        setTimeout(()=>location.reload(),250);
      }catch(error){
        if(["auth/popup-blocked","auth/cancelled-popup-request"].includes(error?.code)){
          sessionStorage.setItem("shooking2_google_redirect_pending","1");
          message("画面移動方式でGoogleログインを開きます...");
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
      if(button)button.disabled=false;
    }
  }

  async function finishRedirect(){
    try{
      const pending=sessionStorage.getItem("shooking2_google_redirect_pending")==="1";
      const auth=await getAuth();
      const result=await auth.getRedirectResult();
      const user=result?.user||auth.currentUser;
      if(user){
        sessionStorage.removeItem("shooking2_google_redirect_pending");
        saveAccount(user);
        message("Googleでログインしました。");
        setTimeout(()=>location.reload(),250);
      }else if(pending){
        message("Googleログインを完了できませんでした。もう一度お試しください。",true);
        sessionStorage.removeItem("shooking2_google_redirect_pending");
      }
    }catch(error){
      sessionStorage.removeItem("shooking2_google_redirect_pending");
      console.error("Google redirect result:",error);
      message("Googleログインに失敗しました："+readableError(error),true);
    }
  }

  function install(){
    window.startGoogleLogin=fixedGoogleLogin;
    document.addEventListener("click",event=>{
      const button=event.target.closest("#firebaseLoginExtras button[onclick*='startGoogleLogin']");
      if(!button)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      fixedGoogleLogin();
    },true);
    finishRedirect();
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
})();