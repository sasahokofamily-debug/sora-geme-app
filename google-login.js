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
    const el=document.getElementById("googleLoginMessage");
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
      if(!isValidConfig(config))throw new Error("先に設定画面でFirebase設定を保存してください");
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

  function snapshotString(){
    return JSON.stringify(getGameStorage());
  }

  function applyGameStorage(data){
    if(!data||typeof data!=="object")return;
    Object.keys(data).forEach(key=>{
      if(key.startsWith("shooking2")&&![CONFIG_KEY,CURRENT_KEY,PROFILE_KEY].includes(key)){
        localStorage.setItem(key,String(data[key]));
      }
    });
  }

  function cloudDoc(){
    if(!db||!currentUser)throw new Error("Googleログインが必要です");
    return db.collection(CLOUD_COLLECTION).doc(currentUser.uid).collection("games").doc(CLOUD_GAME_DOC);
  }

  async function saveCloudData(showResult=true){
    if(syncing)return;
    try{
      syncing=true;
      await ensureFirebase();
      if(!auth.currentUser)throw new Error("Googleログインが必要です");
      currentUser=auth.currentUser;
      const data=getGameStorage();
      await cloudDoc().set({
        app:"SHOO KING II",
        version:1,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAtClient:new Date().toISOString(),
        profile:{
          uid:currentUser.uid,
          name:currentUser.displayName||"Google Player",
          email:currentUser.email||""
        },
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
      if(!auth.currentUser)throw new Error("Googleログインが必要です");
      currentUser=auth.currentUser;
      const snap=await cloudDoc().get();
      if(!snap.exists){
        setCloudStatus("クラウドデータはまだありません。現在の端末データを保存します。");
        await saveCloudData(false);
        return;
      }
      const cloud=snap.data();
      applyGameStorage(cloud.data||{});
      lastSnapshot=snapshotString();
      setCloudStatus("クラウドデータを読み込みました。");
      if(reload)setTimeout(()=>location.reload(),500);
    }catch(error){
      console.error(error);
      setCloudStatus("クラウド読込エラー："+error.message,true);
    }
  }

  async function handleAuthState(user){
    currentUser=user||null;
    if(!user){
      patchAccountStatus();
      stopAutoSync();
      return;
    }
    const old=JSON.parse(localStorage.getItem(PROFILE_KEY)||"null");
    const account={
      provider:"firebase-google",
      uid:user.uid,
      accountName:user.displayName||user.email?.split("@")[0]||"Google Player",
      email:user.email||"",
      picture:user.photoURL||"",
      age:Number(old?.uid===user.uid?old.age:0)||0,
      birthYear:Number(old?.uid===user.uid?old.birthYear:0)||0,
      lastLoginAt:new Date().toISOString()
    };
    localStorage.setItem(PROFILE_KEY,JSON.stringify(account));
    localStorage.setItem(CURRENT_KEY,JSON.stringify(account));
    patchAccountStatus();
    if(typeof window.updateAccountStatus==="function")window.updateAccountStatus();
    startAutoSync();
  }

  async function startGoogleLogin(){
    try{
      setMessage("Googleログインを開いています...");
      await ensureFirebase();
      const provider=new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({prompt:"select_account"});
      const result=await auth.signInWithPopup(provider);
      currentUser=result.user;
      await handleAuthState(result.user);
      setMessage("Googleでログインしました。クラウドデータを確認しています。");
      const snap=await cloudDoc().get();
      if(snap.exists){
        const useCloud=confirm("このGoogleアカウントのクラウドセーブが見つかりました。\nクラウドデータをこの端末へ読み込みますか？\nキャンセルすると、この端末のデータをクラウドへ保存します。");
        if(useCloud)await loadCloudData(true);
        else await saveCloudData(true);
      }else{
        await saveCloudData(true);
        setMessage("Googleログイン成功。現在のセーブをクラウドへ保存しました。");
        if(typeof window.openScreen==="function")setTimeout(()=>window.openScreen("home"),400);
      }
    }catch(error){
      console.error(error);
      const message=error.code==="auth/popup-blocked"?"ポップアップがブロックされました。ブラウザで許可してください。":error.message;
      setMessage("Googleログインに失敗しました："+message,true);
    }
  }

  async function logoutGoogleAccount(){
    try{
      if(auth)await auth.signOut();
      localStorage.removeItem(CURRENT_KEY);
      currentUser=null;
      stopAutoSync();
      if(typeof window.updateAccountStatus==="function")window.updateAccountStatus();
      patchAccountStatus();
      if(typeof window.showToast==="function")window.showToast("ログアウトしました");
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

  function stopAutoSync(){
    if(syncTimer)clearInterval(syncTimer);
    syncTimer=null;
  }

  function saveFirebaseSettings(){
    const input=document.getElementById("firebaseConfigInput");
    const status=document.getElementById("firebaseConfigStatus");
    try{
      const config=JSON.parse((input?.value||"").trim());
      if(!isValidConfig(config))throw new Error("apiKey・authDomain・projectId・appIdが必要です");
      localStorage.setItem(CONFIG_KEY,JSON.stringify(config));
      firebaseApp=null;auth=null;db=null;currentUser=null;
      if(status)status.textContent="Firebase設定を保存しました。次にFirebase ConsoleでGoogleログインとFirestoreを有効にしてください。";
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
    if(!account||!String(account.provider).includes("google")){if(status)status.textContent="Googleでログインしてから設定してください。";return;}
    account.age=age;
    account.birthYear=new Date().getFullYear()-age;
    localStorage.setItem(CURRENT_KEY,JSON.stringify(account));
    localStorage.setItem(PROFILE_KEY,JSON.stringify(account));
    patchAccountStatus();
    if(status)status.textContent="年齢を保存しました。";
  }

  function injectLoginUi(){
    const loginBox=document.querySelector("#loginScreen .authBox");
    if(!loginBox||document.getElementById("googleLoginArea"))return;
    const area=document.createElement("div");
    area.id="googleLoginArea";
    area.style.cssText="margin-top:18px;padding-top:16px;border-top:1px solid #334155";
    area.innerHTML=`<h2 style="margin:0 0 8px">Googleでログイン</h2>
      <p class="small">Firebase Authenticationで本人確認し、Firestoreへセーブします。</p>
      <button type="button" onclick="startGoogleLogin()">Googleでログイン</button>
      <p class="small" id="googleLoginMessage"></p>`;
    loginBox.appendChild(area);
  }

  function injectSettingsUi(){
    const panel=document.querySelector("#settings .panel");
    if(!panel||document.getElementById("googleLoginSettings"))return;
    const danger=panel.querySelector(".dangerBox");
    const area=document.createElement("div");
    area.id="googleLoginSettings";
    area.className="authBox";
    const config=getFirebaseConfig();
    area.innerHTML=`<h2>Firebase・Googleログイン設定</h2>
      <p class="small">Firebase Consoleの「プロジェクトの設定 → マイアプリ → SDKの設定と構成」に表示される firebaseConfig の中身をJSON形式で貼り付けます。</p>
      <textarea id="firebaseConfigInput" style="min-height:170px" placeholder='{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}'>${escapeHtml(config?JSON.stringify(config,null,2):"")}</textarea>
      <button type="button" onclick="saveFirebaseLoginSettings()">Firebase設定を保存</button>
      <button type="button" class="back" onclick="clearFirebaseLoginSettings()">Firebase設定を削除</button>
      <p class="small" id="firebaseConfigStatus"></p>
      <h3>クラウドセーブ</h3>
      <button type="button" onclick="saveFirebaseCloudNow()">この端末のセーブをクラウドへ保存</button>
      <button type="button" onclick="loadFirebaseCloudNow()">クラウドから読み込む</button>
      <p class="small" id="firebaseCloudStatus">Googleログイン後に利用できます。</p>
      <h3>Googleログイン中の年齢</h3>
      <p class="small">母の日・父の日など年齢制限付き機能に使います。</p>
      <input id="googleAgeInput" type="number" min="1" max="120" placeholder="例：10">
      <button type="button" onclick="saveGoogleLoginAge()">年齢を保存</button>
      <p class="small" id="googleAgeStatus"></p>`;
    panel.insertBefore(area,danger||panel.querySelector(".back"));
  }

  function patchAccountStatus(){
    const box=document.getElementById("accountStatusHome");
    const acc=JSON.parse(localStorage.getItem(CURRENT_KEY)||"null");
    if(!box)return;
    if(!acc||!String(acc.provider||"").includes("google"))return;
    const avatar=acc.picture?`<img src="${escapeHtml(acc.picture)}" alt="" referrerpolicy="no-referrer" style="width:34px;height:34px;border-radius:50%;vertical-align:middle;margin-right:8px">`:"";
    box.innerHTML=`${avatar}Firebaseログイン中：<b>${escapeHtml(acc.accountName)}</b><br><span class="small">${escapeHtml(acc.email)}${acc.age?` / 年齢 ${acc.age}`:" / 年齢未設定"}<br>クラウド自動保存 ON</span><button onclick="logoutGoogleAccount()">ログアウト</button>`;
  }

  function install(){
    injectLoginUi();
    injectSettingsUi();
    patchAccountStatus();
    clearInterval(renderTimer);
    renderTimer=setInterval(()=>{injectLoginUi();injectSettingsUi();patchAccountStatus();},1200);
    if(isValidConfig(getFirebaseConfig()))ensureFirebase().catch(error=>console.warn(error));
  }

  window.startGoogleLogin=startGoogleLogin;
  window.logoutGoogleAccount=logoutGoogleAccount;
  window.saveFirebaseLoginSettings=saveFirebaseSettings;
  window.clearFirebaseLoginSettings=clearFirebaseSettings;
  window.saveFirebaseCloudNow=()=>saveCloudData(true);
  window.loadFirebaseCloudNow=()=>loadCloudData(true);
  window.saveGoogleLoginAge=saveGoogleAge;

  window.addEventListener("beforeunload",()=>{if(currentUser)snapshotString()!==lastSnapshot&&saveCloudData(false);});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);
  else install();
})();