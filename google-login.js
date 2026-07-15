(()=>{
  "use strict";

  const CLIENT_ID_KEY="shooking2_google_client_id";
  const GOOGLE_PROFILE_KEY="shooking2_google_profile";
  let gisReady=false;
  let renderTimer=null;

  function escapeHtml(value){
    return String(value??"").replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
  }

  function decodeJwtPayload(token){
    const part=String(token||"").split(".")[1];
    if(!part)throw new Error("Google認証情報を読み取れませんでした");
    const normalized=part.replace(/-/g,"+").replace(/_/g,"/");
    const padded=normalized+"=".repeat((4-normalized.length%4)%4);
    const binary=atob(padded);
    const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function clientId(){
    return localStorage.getItem(CLIENT_ID_KEY)||"";
  }

  function setMessage(text,isError=false){
    const el=document.getElementById("googleLoginMessage");
    if(!el)return;
    el.textContent=text;
    el.style.color=isError?"#fca5a5":"#bfdbfe";
  }

  function ensureGoogleScript(){
    return new Promise((resolve,reject)=>{
      if(window.google?.accounts?.id){gisReady=true;resolve();return;}
      const old=document.getElementById("googleIdentityServicesScript");
      if(old){
        old.addEventListener("load",()=>{gisReady=true;resolve();},{once:true});
        old.addEventListener("error",()=>reject(new Error("Google認証ライブラリを読み込めませんでした")),{once:true});
        return;
      }
      const script=document.createElement("script");
      script.id="googleIdentityServicesScript";
      script.src="https://accounts.google.com/gsi/client";
      script.async=true;
      script.defer=true;
      script.onload=()=>{gisReady=true;resolve();};
      script.onerror=()=>reject(new Error("Google認証ライブラリを読み込めませんでした"));
      document.head.appendChild(script);
    });
  }

  function accountNameFromProfile(profile){
    const base=(profile.name||profile.given_name||profile.email?.split("@")[0]||"Google Player").trim();
    return base.slice(0,40)||"Google Player";
  }

  function completeGoogleLogin(response){
    try{
      const profile=decodeJwtPayload(response.credential);
      if(!profile.sub||!profile.email)throw new Error("Googleアカウント情報が不足しています");
      const now=new Date().toISOString();
      const currentYear=new Date().getFullYear();
      const existingProfile=JSON.parse(localStorage.getItem(GOOGLE_PROFILE_KEY)||"null");
      const age=Number(existingProfile?.sub===profile.sub?existingProfile.age:0)||0;
      const birthYear=age?currentYear-age:0;
      const account={
        provider:"google",
        googleSub:profile.sub,
        accountName:accountNameFromProfile(profile),
        email:profile.email,
        picture:profile.picture||"",
        age,
        birthYear,
        lastLoginAt:now
      };
      localStorage.setItem(GOOGLE_PROFILE_KEY,JSON.stringify(account));
      localStorage.setItem("shooking2_current_account",JSON.stringify(account));
      if(typeof window.updateAccountStatus==="function")window.updateAccountStatus();
      patchAccountStatus();
      setMessage("Googleでログインしました。年齢が必要な機能は設定から年齢を登録してください。");
      if(typeof window.showToast==="function")window.showToast("Googleログイン成功");
      setTimeout(()=>{if(typeof window.openScreen==="function")window.openScreen("home");},500);
    }catch(error){
      console.error(error);
      setMessage("Googleログインに失敗しました："+error.message,true);
    }
  }

  async function startGoogleLogin(){
    const id=clientId();
    if(!id){
      setMessage("先に 設定 → Googleログイン設定 でクライアントIDを保存してください。",true);
      return;
    }
    try{
      await ensureGoogleScript();
      google.accounts.id.initialize({
        client_id:id,
        callback:completeGoogleLogin,
        auto_select:false,
        cancel_on_tap_outside:true
      });
      const target=document.getElementById("googleSignInButton");
      if(!target)return;
      target.innerHTML="";
      google.accounts.id.renderButton(target,{theme:"filled_blue",size:"large",shape:"rectangular",text:"signin_with",width:320});
      setMessage("下のGoogleボタンを押してください。");
    }catch(error){
      setMessage(error.message,true);
    }
  }

  function saveGoogleSettings(){
    const input=document.getElementById("googleClientIdInput");
    const status=document.getElementById("googleClientIdStatus");
    const value=(input?.value||"").trim();
    if(!value.endsWith(".apps.googleusercontent.com")){
      if(status)status.textContent="正しいウェブアプリ用クライアントIDを入力してください。";
      return;
    }
    localStorage.setItem(CLIENT_ID_KEY,value);
    if(status)status.textContent="保存しました。Google Cloudの承認済みJavaScript生成元に https://sasahokofamily-debug.github.io を追加してください。";
    const holder=document.getElementById("googleSignInButton");
    if(holder)holder.innerHTML="";
  }

  function clearGoogleSettings(){
    localStorage.removeItem(CLIENT_ID_KEY);
    const input=document.getElementById("googleClientIdInput");
    if(input)input.value="";
    const status=document.getElementById("googleClientIdStatus");
    if(status)status.textContent="GoogleクライアントIDを削除しました。";
  }

  function saveGoogleAge(){
    const input=document.getElementById("googleAgeInput");
    const status=document.getElementById("googleAgeStatus");
    const age=Number(input?.value||0);
    if(!Number.isInteger(age)||age<1||age>120){
      if(status)status.textContent="年齢を1〜120で入力してください。";
      return;
    }
    const current=JSON.parse(localStorage.getItem("shooking2_current_account")||"null");
    if(!current||current.provider!=="google"){
      if(status)status.textContent="Googleでログインしてから設定してください。";
      return;
    }
    current.age=age;
    current.birthYear=new Date().getFullYear()-age;
    localStorage.setItem("shooking2_current_account",JSON.stringify(current));
    localStorage.setItem(GOOGLE_PROFILE_KEY,JSON.stringify(current));
    if(typeof window.updateAccountStatus==="function")window.updateAccountStatus();
    patchAccountStatus();
    if(status)status.textContent="年齢を保存しました。";
  }

  function injectLoginUi(){
    const loginBox=document.querySelector("#loginScreen .authBox");
    if(loginBox&&!document.getElementById("googleLoginArea")){
      const area=document.createElement("div");
      area.id="googleLoginArea";
      area.style.cssText="margin-top:18px;padding-top:16px;border-top:1px solid #334155";
      area.innerHTML=`<h2 style="margin:0 0 8px">Googleでログイン</h2>
        <p class="small">Googleアカウントの名前とメールを使ってログインします。</p>
        <button type="button" onclick="startGoogleLogin()">Googleログインを準備</button>
        <div id="googleSignInButton" style="display:flex;justify-content:center;margin:10px 0"></div>
        <p class="small" id="googleLoginMessage"></p>`;
      loginBox.appendChild(area);
    }
  }

  function injectSettingsUi(){
    const panel=document.querySelector("#settings .panel");
    if(!panel||document.getElementById("googleLoginSettings"))return;
    const danger=panel.querySelector(".dangerBox");
    const area=document.createElement("div");
    area.id="googleLoginSettings";
    area.className="authBox";
    area.innerHTML=`<h2>Googleログイン設定</h2>
      <p class="small">Google Cloud Consoleで「ウェブ アプリケーション」のOAuthクライアントIDを作り、承認済みJavaScript生成元に <b>https://sasahokofamily-debug.github.io</b> を登録してください。</p>
      <input id="googleClientIdInput" placeholder="123456789-xxxx.apps.googleusercontent.com" value="${escapeHtml(clientId())}">
      <button type="button" onclick="saveGoogleLoginSettings()">GoogleクライアントIDを保存</button>
      <button type="button" class="back" onclick="clearGoogleLoginSettings()">Google設定を削除</button>
      <p class="small" id="googleClientIdStatus"></p>
      <h3>Googleログイン中の年齢</h3>
      <p class="small">母の日・父の日など年齢制限付き機能に使います。Googleから年齢は取得しません。</p>
      <input id="googleAgeInput" type="number" min="1" max="120" placeholder="例：10">
      <button type="button" onclick="saveGoogleLoginAge()">年齢を保存</button>
      <p class="small" id="googleAgeStatus"></p>`;
    panel.insertBefore(area,danger||panel.querySelector(".back"));
  }

  function patchAccountStatus(){
    const box=document.getElementById("accountStatusHome");
    const acc=JSON.parse(localStorage.getItem("shooking2_current_account")||"null");
    if(!box||!acc||acc.provider!=="google")return;
    const avatar=acc.picture?`<img src="${escapeHtml(acc.picture)}" alt="" referrerpolicy="no-referrer" style="width:34px;height:34px;border-radius:50%;vertical-align:middle;margin-right:8px">`:"";
    box.innerHTML=`${avatar}Googleログイン中：<b>${escapeHtml(acc.accountName)}</b><br><span class="small">${escapeHtml(acc.email)}${acc.age?` / 年齢 ${acc.age}`:" / 年齢未設定"}</span><button onclick="logoutGoogleAccount()">ログアウト</button>`;
  }

  function logoutGoogleAccount(){
    try{window.google?.accounts?.id?.disableAutoSelect();}catch(e){}
    localStorage.removeItem("shooking2_current_account");
    if(typeof window.updateAccountStatus==="function")window.updateAccountStatus();
    if(typeof window.showToast==="function")window.showToast("ログアウトしました");
  }

  function install(){
    injectLoginUi();
    injectSettingsUi();
    patchAccountStatus();
    clearInterval(renderTimer);
    renderTimer=setInterval(()=>{
      injectLoginUi();
      injectSettingsUi();
      patchAccountStatus();
    },1200);
  }

  window.startGoogleLogin=startGoogleLogin;
  window.saveGoogleLoginSettings=saveGoogleSettings;
  window.clearGoogleLoginSettings=clearGoogleSettings;
  window.saveGoogleLoginAge=saveGoogleAge;
  window.logoutGoogleAccount=logoutGoogleAccount;

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);
  else install();
})();
