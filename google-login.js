(()=>{
  "use strict";

  const CONFIG_KEY="shooking2_firebase_config";
  const CURRENT_KEY="shooking2_current_account";
  const PROFILE_KEY="shooking2_google_profile";
  const CLOUD_COLLECTION="users";
  const CLOUD_GAME_DOC="shooking2";
  const FIREBASE_VERSION="10.12.5";
  let firebaseApp=null;
  let auth=null;
  let db=null;
  let currentUser=null;
  let loadingPromise=null;
  let renderTimer=null;
  let syncTimer=null;
  let lastSnapshot="";
  let syncing=false;

  function escapeHtml(value){
    return String(value??"").replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
  }

  function getFirebaseConfig(){
    try{return JSON.parse(localStorage.getItem(CONFIG_KEY)||"null");}
    catch{return null;}
  }

  function isValidConfig(config){
    return !!(config&&config.apiKey&&config.authDomain&&config.projectId&&config.appId);
  }

  function setMessage(text,isError=false){
    const el=document.getElementById("googleLoginMessage")||document.getElementById("loginMessage");
    if(!el)return;
    el.textContent=text;
    el.style.color=isError?"#fca5a5":"#bfdbfe";
  }

  function setRegisterMessage(text,isError=false){
    const el=document.getElementById("registerMessage");
    if(!el)return;
    el.textContent=text;
    el.style.color=isError?"#fca5a5":"#bfdbfe";
  }

  function setCloudStatus(text,isError=false){
    const el=document.getElementById("firebaseCloudStatus");
    if(el){
      el.textContent=text;
      el.style.color=isError?"#fca5a5":"#bfdbfe";
    }
  }

  function loadScript(src,id){
    return new Promise((resolve,reject)=>{
      if(document.getElementById(id)){resolve();return;}
      const script=document.createElement("script");
      script.id=id;
      script.src=src;
      script.defer=true;
      script.onload=resolve;
      script.onerror=()=>reject(new Error("Firebaseライブラリを読み込めませんでした"));
      document.head.appendChild(script);
    });
  }

  async function ensureFirebase(){
    if(auth&&db)return;
    if(loadingPromise)return loadingPromise;
    loadingPromise=(async()=>{
      const config=getFirebaseConfig();
      if(!isValidConfig(config))throw new Error("Firebase設定が見つかりません");
      await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,"firebaseAppSdk");
      await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth-compat.js`,"firebaseAuthSdk");
      await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore-compat.js`,"firebaseFirestoreSdk");
      firebaseApp=firebase.apps?.length?firebase.app():firebase.initializeApp(config);
      auth=firebase.auth();
      db=firebase.firestore();
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      auth.onAuthStateChanged(handleAuthState);
    })();
    try{await loadingPromise;}finally{loadingPromise=null;}
  }

  function getGameStorage(){
    const data={};
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key||!key.startsWith("shooking2"))continue;
      if([CONFIG_KEY,CURRENT_KEY,PROFILE_KEY].includes(key))continue;
      data[key]=localStorage.getItem(key);
    }
    return data;
  }

  function snapshotString(){return JSON.stringify(getGameStorage());}

  function applyGameStorage(data){
    if(!data||typeof data!=="object")return;
    Object.keys(data).forEach(key=>{
      if(key.startsWith("shooking2")&&![CONFIG_KEY,CURRENT_KEY,PROFILE_KEY].includes(key)){
        localStorage.setItem(key,String(data[key]));
      }
    });
  }

  function cloudDoc(){
    if(!db||!currentUser)throw new Error("Firebaseログインが必要です");
    return db.collection(CLOUD_COLLECTION).doc(currentUser.uid).collection("games").doc(CLOUD_GAME_DOC);
  }

  async function ensureUserProfile(){
    if(!db||!currentUser)return;
    await db.collection(CLOUD_COLLECTION).doc(currentUser.uid).set({
      uid:currentUser.uid,
      name:currentUser.displayName||currentUser.email?.split("@")[0]||"Player",
      email:currentUser.email||"",
      provider:currentUser.providerData?.[0]?.providerId||"password",
      lastLoginAt:firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
  }

  async function saveCloudData(showResult=true){
    if(syncing)return;
    try{
      syncing=true;
      await ensureFirebase();
      if(!auth.currentUser)throw new Error("Firebaseログインが必要です");
      currentUser=auth.currentUser;
      const data=getGameStorage();
      await cloudDoc().set({
        app:"SHOO KING II",
        version:1,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAtClient:new Date().toISOString(),
        profile:{uid:currentUser.uid,name:currentUser.displayName||currentUser.email?.split("@")[0]||"Player",email:currentUser.email||""},
        data
      },{merge:true});
      lastSnapshot=JSON.stringify(data);
      if(showResult)setCloudStatus("クラウドへ保存しました。");
    }catch(error){
      console.error(error);
      if(showResult)setCloudStatus("クラウド保存エラー："+error.message,true);
    }finally{syncing=false;}
  }

  async function loadCloudData(reload=true){
    try{
      await ensureFirebase();
      if(!auth.currentUser)throw new Error("Firebaseログインが必要です");
      currentUser=auth.currentUser;
      const snap=await cloudDoc().get();
      if(!snap.exists){
        await saveCloudData(false);
        setCloudStatus("クラウドデータを新規作成しました。");
        return;
      }
      const cloud=snap.data();
      applyGameStorage(cloud.data||{});
      lastSnapshot=snapshotString();
      setCloudStatus("クラウドデータを読み込みました。");
      if(reload)setTimeout(()=>location.reload(),350);
    }catch(error){
      console.error(error);
      setCloudStatus("クラウド読込エラー："+error.message,true);
    }
  }

  function accountFromUser(user){
    const old=JSON.parse(localStorage.getItem(PROFILE_KEY)||"null");
    return {
      provider:user.providerData?.[0]?.providerId||"firebase-password",
      uid:user.uid,
      accountName:user.displayName||user.email?.split("@")[0]||"Player",
      email:user.email||"",
      picture:user.photoURL||"",
      age:Number(old?.uid===user.uid?old.age:0)||0,
      birthYear:Number(old?.uid===user.uid?old.birthYear:0)||0,
      lastLoginAt:new Date().toISOString()
    };
  }

  function showOnlyLogin(){
    document.querySelectorAll(".screen").forEach(screen=>screen.classList.add("hidden"));
    const login=document.getElementById("loginScreen");
    if(login)login.classList.remove("hidden");
  }

  function showHomeAfterLogin(){
    if(typeof window.openScreen==="function")window.openScreen("home");
    else{
      document.querySelectorAll(".screen").forEach(screen=>screen.classList.add("hidden"));
      document.getElementById("home")?.classList.remove("hidden");
    }
  }

  async function handleAuthState(user){
    currentUser=user||null;
    if(!user){
      localStorage.removeItem(CURRENT_KEY);
      patchAccountStatus();
      stopAutoSync();
      showOnlyLogin();
      return;
    }
    const account=accountFromUser(user);
    localStorage.setItem(PROFILE_KEY,JSON.stringify(account));
    localStorage.setItem(CURRENT_KEY,JSON.stringify(account));
    await ensureUserProfile().catch(console.warn);
    patchAccountStatus();
    if(typeof window.updateAccountStatus==="function")window.updateAccountStatus();
    startAutoSync();
    showHomeAfterLogin();
  }

  async function startGoogleLogin(){
    try{
      setMessage("Googleログインを開いています...");
      await ensureFirebase();
      const provider=new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({prompt:"select_account"});
      const result=await auth.signInWithPopup(provider);
      await handleAuthState(result.user);
      const snap=await cloudDoc().get();
      if(snap.exists)await loadCloudData(false);
      else await saveCloudData(false);
      setMessage("Googleでログインしました。");
    }catch(error){
      console.error(error);
      const message=error.code==="auth/popup-blocked"?"ポップアップがブロックされました。ブラウザで許可してください。":error.message;
      setMessage("Googleログインに失敗しました："+message,true);
    }
  }

  async function loginEmailAccount(){
    try{
      const email=document.getElementById("loginName")?.value.trim()||"";
      const password=document.getElementById("loginPassword")?.value||"";
      if(!email||!password)throw new Error("メールアドレスとパスワードを入力してください");
      setMessage("ログイン中...");
      await ensureFirebase();
      const result=await auth.signInWithEmailAndPassword(email,password);
      await handleAuthState(result.user);
      const snap=await cloudDoc().get();
      if(snap.exists)await loadCloudData(false);
      else await saveCloudData(false);
      setMessage("ログインしました。");
    }catch(error){
      console.error(error);
      setMessage("ログインに失敗しました："+error.message,true);
    }
  }

  async function registerEmailAccount(){
    try{
      const email=document.getElementById("registerName")?.value.trim()||"";
      const password=document.getElementById("registerPassword")?.value||"";
      const age=Number(document.getElementById("registerAge")?.value||0);
      const birthYear=Number(document.getElementById("registerBirthYear")?.value||0);
      if(!email||!email.includes("@"))throw new Error("登録にはメールアドレスを入力してください");
      if(password.length<6)throw new Error("パスワードは6文字以上にしてください");
      setRegisterMessage("登録中...");
      await ensureFirebase();
      const result=await auth.createUserWithEmailAndPassword(email,password);
      const account=accountFromUser(result.user);
      account.age=Number.isFinite(age)?age:0;
      account.birthYear=Number.isFinite(birthYear)?birthYear:0;
      localStorage.setItem(PROFILE_KEY,JSON.stringify(account));
      localStorage.setItem(CURRENT_KEY,JSON.stringify(account));
      await ensureUserProfile();
      await saveCloudData(false);
      await handleAuthState(result.user);
      setRegisterMessage("Firebaseアカウントを登録しました。");
    }catch(error){
      console.error(error);
      setRegisterMessage("登録に失敗しました："+error.message,true);
    }
  }

  async function resetPassword(){
    try{
      const email=document.getElementById("loginName")?.value.trim()||prompt("登録したメールアドレスを入力してください")||"";
      if(!email)throw new Error("メールアドレスを入力してください");
      await ensureFirebase();
      await auth.sendPasswordResetEmail(email);
      setMessage("パスワード再設定メールを送りました。");
    }catch(error){setMessage("再設定メールを送れませんでした："+error.message,true);}
  }

  async function logoutFirebaseAccount(){
    try{
      if(auth)await auth.signOut();
      localStorage.removeItem(CURRENT_KEY);
      currentUser=null;
      stopAutoSync();
      patchAccountStatus();
      showOnlyLogin();
    }catch(error){setCloudStatus("ログアウトエラー："+error.message,true);}
  }

  function startAutoSync(){
    stopAutoSync();
    lastSnapshot=snapshotString();
    syncTimer=setInterval(()=>{
      if(!currentUser||syncing)return;
      const now=snapshotString();
      if(now!==lastSnapshot)saveCloudData(false);
    },5000);
  }

  function stopAutoSync(){if(syncTimer)clearInterval(syncTimer);syncTimer=null;}

  function saveFirebaseSettings(){
    const input=document.getElementById("firebaseConfigInput");
    const status=document.getElementById("firebaseConfigStatus");
    try{
      const config=JSON.parse((input?.value||"").trim());
      if(!isValidConfig(config))throw new Error("apiKey・authDomain・projectId・appIdが必要です");
      localStorage.setItem(CONFIG_KEY,JSON.stringify(config));
      firebaseApp=null;auth=null;db=null;currentUser=null;
      if(status)status.textContent="Firebase設定を保存しました。";
    }catch(error){if(status)status.textContent="設定エラー："+error.message;}
  }

  function clearFirebaseSettings(){
    localStorage.removeItem(CONFIG_KEY);
    const input=document.getElementById("firebaseConfigInput");
    if(input)input.value="";
    const status=document.getElementById("firebaseConfigStatus");
    if(status)status.textContent="Firebase設定を削除しました。";
  }

  function saveGoogleAge(){
    const input=document.getElementById("googleAgeInput");
    const status=document.getElementById("googleAgeStatus");
    const age=Number(input?.value||0);
    if(!Number.isInteger(age)||age<1||age>120){if(status)status.textContent="年齢を1〜120で入力してください。";return;}
    const account=JSON.parse(localStorage.getItem(CURRENT_KEY)||"null");
    if(!account){if(status)status.textContent="ログインしてから設定してください。";return;}
    account.age=age;
    account.birthYear=new Date().getFullYear()-age;
    localStorage.setItem(CURRENT_KEY,JSON.stringify(account));
    localStorage.setItem(PROFILE_KEY,JSON.stringify(account));
    patchAccountStatus();
    if(status)status.textContent="年齢を保存しました。";
  }

  function patchLoginUi(){
    const loginBox=document.querySelector("#loginScreen .authBox");
    if(loginBox&&!document.getElementById("firebaseLoginExtras")){
      const labels=loginBox.querySelectorAll("label");
      if(labels[0])labels[0].textContent="メールアドレス";
      const name=document.getElementById("loginName");
      if(name){name.type="email";name.placeholder="you@example.com";}
      const oldButton=loginBox.querySelector("button[onclick='loginAccount()']");
      if(oldButton)oldButton.setAttribute("onclick","loginFirebaseEmailAccount()");
      const extra=document.createElement("div");
      extra.id="firebaseLoginExtras";
      extra.innerHTML=`<button type="button" onclick="resetFirebasePassword()">パスワードを忘れた</button><div style="margin:14px 0;border-top:1px solid #334155"></div><button type="button" onclick="startGoogleLogin()">Googleでログイン</button><p class="small" id="googleLoginMessage">ログインしないとゲームはプレイできません。</p>`;
      loginBox.appendChild(extra);
    }
    document.querySelector("#loginScreen .back")?.remove();

    const reg=document.querySelector("#registerScreen .authDanger");
    if(reg)reg.innerHTML="Firebase Authenticationに本物のアカウントを登録します。<br>登録後は別端末でも同じアカウントでログインできます。";
    const regName=document.getElementById("registerName");
    if(regName){regName.type="email";regName.placeholder="you@example.com";}
    const regLabel=regName?.previousElementSibling;
    if(regLabel)regLabel.textContent="メールアドレス";
    const regButton=document.querySelector("#registerScreen button[onclick='registerAccount()']");
    if(regButton)regButton.setAttribute("onclick","registerFirebaseEmailAccount()");
    document.querySelector("#registerScreen .back")?.setAttribute("onclick","openLogin()");
  }

  function injectSettingsUi(){
    const panel=document.querySelector("#settings .panel");
    if(!panel||document.getElementById("googleLoginSettings"))return;
    const danger=panel.querySelector(".dangerBox");
    const area=document.createElement("div");
    area.id="googleLoginSettings";
    area.className="authBox";
    const config=getFirebaseConfig();
    area.innerHTML=`<h2>Firebaseログイン・クラウドセーブ</h2><p class="small">ログイン中は5秒ごとに変更を自動保存します。</p><textarea id="firebaseConfigInput" style="min-height:170px">${escapeHtml(config?JSON.stringify(config,null,2):"")}</textarea><button type="button" onclick="saveFirebaseLoginSettings()">Firebase設定を保存</button><button type="button" onclick="saveFirebaseCloudNow()">今すぐクラウド保存</button><button type="button" onclick="loadFirebaseCloudNow()">クラウドから読み込む</button><button type="button" class="back" onclick="logoutFirebaseAccount()">ログアウト</button><p class="small" id="firebaseCloudStatus">ログイン後に利用できます。</p><input id="googleAgeInput" type="number" min="1" max="120" placeholder="年齢"><button type="button" onclick="saveGoogleLoginAge()">年齢を保存</button><p class="small" id="googleAgeStatus"></p>`;
    if(danger)panel.insertBefore(area,danger);else panel.appendChild(area);
  }

  function patchAccountStatus(){
    const box=document.getElementById("accountStatusHome");
    const acc=JSON.parse(localStorage.getItem(CURRENT_KEY)||"null");
    if(!box)return;
    if(!acc){box.textContent="未ログイン";return;}
    const avatar=acc.picture?`<img src="${escapeHtml(acc.picture)}" alt="" referrerpolicy="no-referrer" style="width:34px;height:34px;border-radius:50%;vertical-align:middle;margin-right:8px">`:"";
    box.innerHTML=`${avatar}Firebaseログイン中：<b>${escapeHtml(acc.accountName)}</b><br><span class="small">${escapeHtml(acc.email)}<br>クラウド自動保存 ON</span><button onclick="logoutFirebaseAccount()">ログアウト</button>`;
  }

  function install(){
    patchLoginUi();
    injectSettingsUi();
    patchAccountStatus();
    clearInterval(renderTimer);
    renderTimer=setInterval(()=>{patchLoginUi();injectSettingsUi();patchAccountStatus();},1000);
    if(isValidConfig(getFirebaseConfig()))ensureFirebase().catch(error=>{console.warn(error);showOnlyLogin();});
    else showOnlyLogin();
  }

  window.startGoogleLogin=startGoogleLogin;
  window.loginFirebaseEmailAccount=loginEmailAccount;
  window.registerFirebaseEmailAccount=registerEmailAccount;
  window.resetFirebasePassword=resetPassword;
  window.logoutFirebaseAccount=logoutFirebaseAccount;
  window.logoutGoogleAccount=logoutFirebaseAccount;
  window.saveFirebaseLoginSettings=saveFirebaseSettings;
  window.clearFirebaseLoginSettings=clearFirebaseSettings;
  window.saveFirebaseCloudNow=()=>saveCloudData(true);
  window.loadFirebaseCloudNow=()=>loadCloudData(true);
  window.saveGoogleLoginAge=saveGoogleAge;
  window.isFirebaseAuthenticated=()=>!!currentUser;

  window.addEventListener("beforeunload",()=>{if(currentUser&&snapshotString()!==lastSnapshot)saveCloudData(false);});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);
  else install();
})();