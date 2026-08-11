(()=>{
  "use strict";
  const CONFIG_KEY="shooking2_firebase_config";
  const VERSION="10.12.5";

  function message(text,error=false){
    const el=document.getElementById("googleLoginMessage");
    if(!el)return;
    el.textContent=text;
    el.style.color=error?"#fca5a5":"#bfdbfe";
  }

  function friendly(error){
    const code=String(error?.code||"");
    if(code.includes("unauthorized-domain"))return "Firebaseでこのサイトが許可されていません。Authentication → Settings → Authorized domains に sasahokofamily-debug.github.io を追加してください。";
    if(code.includes("operation-not-allowed"))return "Authentication → Sign-in method で Google を有効にしてください。";
    if(code.includes("invalid-api-key"))return "Firebase設定のapiKeyが違います。Webアプリ設定を貼り直してください。";
    if(code.includes("popup-closed"))return "Googleログイン画面が閉じられました。もう一度押してください。";
    if(code.includes("network-request-failed"))return "ポップアップ通信に失敗したため、画面移動方式でGoogleログインを試します。";
    return `Googleログインに失敗しました（${code||"原因不明"}）。Firebase設定と承認済みドメインを確認してください。`;
  }

  function load(src,id){
    return new Promise((resolve,reject)=>{
      if(document.getElementById(id)){resolve();return;}
      const s=document.createElement("script");
      s.id=id;s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
    });
  }

  async function getAuth(){
    const config=JSON.parse(localStorage.getItem(CONFIG_KEY)||"null");
    if(!config?.apiKey||!config?.authDomain||!config?.projectId||!config?.appId)throw new Error("Firebase設定が保存されていません");
    await load(`https://www.gstatic.com/firebasejs/${VERSION}/firebase-app-compat.js`,"firebaseAppSdk");
    await load(`https://www.gstatic.com/firebasejs/${VERSION}/firebase-auth-compat.js`,"firebaseAuthSdk");
    if(!firebase.apps.length)firebase.initializeApp(config);
    const auth=firebase.auth();
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    return auth;
  }

  async function login(){
    try{
      message("Googleログインを開いています...");
      const auth=await getAuth();
      const provider=new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({prompt:"select_account"});
      try{
        await auth.signInWithPopup(provider);
        message("Googleログインに成功しました。クラウド保存を準備しています。");
        setTimeout(()=>location.reload(),500);
      }catch(error){
        const code=String(error?.code||"");
        if(code.includes("popup-blocked")||code.includes("network-request-failed")||code.includes("web-storage-unsupported")){
          message("ポップアップ方式が使えないため、画面移動方式へ切り替えます。");
          await auth.signInWithRedirect(provider);
          return;
        }
        throw error;
      }
    }catch(error){
      console.error("firebase login",error);
      message(friendly(error),true);
    }
  }

  async function checkRedirect(){
    try{
      const config=JSON.parse(localStorage.getItem(CONFIG_KEY)||"null");
      if(!config)return;
      const auth=await getAuth();
      const result=await auth.getRedirectResult();
      if(result?.user){
        message("Googleログインに成功しました。クラウド保存を準備しています。");
        setTimeout(()=>location.reload(),500);
      }
    }catch(error){
      const code=String(error?.code||"");
      if(code)message(friendly(error),true);
    }
  }

  function install(){
    window.startGoogleLogin=login;
    checkRedirect();
    setInterval(()=>{window.startGoogleLogin=login;},1000);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);
  else install();
})();