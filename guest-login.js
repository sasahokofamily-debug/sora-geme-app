(()=>{
  "use strict";

  const GUEST_KEY="shooking2_guest_session";
  const CURRENT_KEY="shooking2_current_account";
  const PROFILE_KEY="shooking2_google_profile";

  function guestAccount(){
    return {
      provider:"guest",
      uid:"guest",
      accountName:"ゲスト",
      email:"",
      picture:"",
      guest:true,
      lastLoginAt:new Date().toISOString()
    };
  }

  function showHomeOnce(){
    if(typeof window.openScreen==="function"){
      try{
        window.openScreen("home");
        return;
      }catch(error){
        console.warn("Guest home open failed",error);
      }
    }
    document.querySelectorAll(".screen").forEach(screen=>screen.classList.add("hidden"));
    const home=document.getElementById("home")||document.getElementById("homeScreen");
    if(home)home.classList.remove("hidden");
  }

  function clearGuestData(){
    const protectedKeys=new Set(["shooking2_firebase_config"]);
    Object.keys(localStorage).forEach(key=>{
      if(key.startsWith("shooking2")&&!protectedKeys.has(key))localStorage.removeItem(key);
    });
    localStorage.removeItem(CURRENT_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }

  function activateGuestAccount(){
    const account=guestAccount();
    localStorage.setItem(CURRENT_KEY,JSON.stringify(account));
    localStorage.setItem(PROFILE_KEY,JSON.stringify(account));
    return account;
  }

  function startGuest(){
    try{
      clearGuestData();
      sessionStorage.setItem(GUEST_KEY,"1");
      sessionStorage.removeItem("shooking2_google_redirect_pending");
      activateGuestAccount();
      const msg=document.getElementById("googleLoginMessage")||document.getElementById("loginMessage");
      if(msg){
        msg.textContent="ゲストとして開始します。終了するとデータは消えます。";
        msg.style.color="#fde68a";
      }
      showHomeOnce();
    }catch(error){
      console.error("Guest login failed",error);
      alert("ゲストログインを開始できませんでした。");
    }
  }

  function addButton(){
    const loginBox=document.querySelector("#loginScreen .authBox");
    if(!loginBox||document.getElementById("guestLoginButton"))return;
    const button=document.createElement("button");
    button.id="guestLoginButton";
    button.type="button";
    button.textContent="ゲストでプレイ（保存なし）";
    button.style.cssText="width:100%;margin-top:10px;background:#374151;color:#fff;border:1px solid #6b7280";
    button.addEventListener("click",startGuest);
    const note=document.createElement("p");
    note.className="small";
    note.textContent="ゲストデータはクラウドにも端末にも保存されず、ページを閉じると消えます。";
    note.style.color="#fcd34d";
    loginBox.append(button,note);
  }

  function restoreGuestAfterReload(){
    if(sessionStorage.getItem(GUEST_KEY)!=="1")return;
    clearGuestData();
    activateGuestAccount();
    showHomeOnce();
  }

  function endGuestSession(){
    if(sessionStorage.getItem(GUEST_KEY)!=="1")return;
    clearGuestData();
  }

  function install(){
    addButton();
    restoreGuestAfterReload();

    // ログイン画面が後から組み立てられる場合だけ、ボタン追加を再確認する。
    // 画面をホームへ戻す処理は繰り返さないため、他ページへ自由に移動できる。
    setInterval(addButton,1000);

    window.addEventListener("pagehide",endGuestSession);
  }

  window.startShookingGuest=startGuest;
  window.isShookingGuest=()=>sessionStorage.getItem(GUEST_KEY)==="1";
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
})();
