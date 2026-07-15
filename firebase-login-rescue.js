(()=>{
  "use strict";
  const CONFIG_KEY="shooking2_firebase_config";
  const VERSION="10.12.5";

  function setMessage(text,isError=false){
    const el=document.getElementById("googleLoginMessage");
    if(!el)return;
    el.textContent=text;
    el.style.color=isError?"#fca5a5":"#bfdbfe";
  }

  function load(src,id){
    return new Promise((resolve,reject)=>{
      if(window.firebase&&((id==="firebaseAppSdk")||document.getElementById(id))){resolve();return;}
      const existing=document.getElementById(id);
      if(existing){
        existing.addEventListener("load",resolve,{once:true});
        existing.addEventListener("error",()=>reject(new Error("SDK読込失敗")),{once:true});
        return;
      }
      const s=document.createElement("script");
      s.id=id;s.src=src;s.async=true;s.defer=true;
      s.onload=resolve;
      s.onerror=()=>reject(new Error("Firebase SDKを読み込めませんでした"));
      document.head.appendChild(s);
    });
  }

  async function withTimeout(promise,ms,message){
    let timer;
    try{
      return await Promise.race([
        promise,
        new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),ms);})
      ]);
    }finally{clearTimeout(timer);}
  }

  function getConfig(){
    try{return JSON.parse(localStorage.getItem(CONFIG_KEY)||"null");}
    catch{return null;}
  }

  function translate(error){
    const code=String(error?.code||"");
    if(code.includes("unauthorized-domain"))return "Firebaseの承認済みドメインに sasahokofamily-debug.github.io を追加してください。";
    if(code.includes("operation-not-allowed"))return "Firebase AuthenticationでGoogleログインを有効にしてください。";
    if(code.includes("invalid-api-key"))return "Firebase設定のapiKeyが違います。shooking WebアプリのfirebaseConfigを貼り直してください。";
    if(code.includes("network-request-failed"))return "Google認証サーバーへ接続できませんでした。広告ブロッカーや追跡防止機能を一時的にOFFにして再試行してください。";
    return `Googleログインに失敗しました。${code||error?.message||"原因不明"}`;
  }

  async function ensureAuth(){
    const config=getConfig();
    if(!config?.apiKey||!config?.authDomain||!config?.projectId||!config?.appId){
      throw new Error("設定画面にshooking用firebaseConfigを保存してください。");
    }
    await withTimeout(load(`https://www.gstatic.com/firebasejs/${VERSION}/firebase-app-compat.js`,`firebaseAppSdkRescue`),10000,"Firebase本体の読み込みが10秒で完了しませんでした。");
    await withTimeout(load(`https://www.gstatic.com/firebasejs/${VERSION}/firebase-auth-compat.js`,`firebaseAuthSdkRescue`),10000,"Firebase認証の読み込みが10秒で完了しませんでした。");
    const app=firebase.apps?.length?firebase.app():firebase.initializeApp(config);
    const auth=firebase.auth(app);
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    return auth;
  }

  async function rescueLogin(){
    setMessage("Googleログイン画面へ移動する準備中です…");
    try{
      const auth=await ensureAuth();
      const provider=new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({prompt:"select_account"});
      await withTimeout(auth.signInWithRedirect(provider),10000,"Googleログイン画面への移動が10秒で完了しませんでした。");
    }catch(error){
      console.error("firebase rescue login",error);
      setMessage(translate(error),true);
    }
  }

  async function checkRedirectResult(){
    try{
      const config=getConfig();
      if(!config)return;
      const auth=await ensureAuth();
      const result=await auth.getRedirectResult();
      if(result?.user){
        setMessage("Googleログイン成功。クラウドセーブを準備しています。");
        setTimeout(()=>location.reload(),700);
      }
    }catch(error){
      if(error?.code)setMessage(translate(error),true);
    }
  }

  function install(){
    window.startGoogleLogin=rescueLogin;
    checkRedirectResult();
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);
  else install();
})();