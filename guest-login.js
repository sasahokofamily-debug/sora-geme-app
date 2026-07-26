(()=>{
  "use strict";

  const GUEST_KEY="shooking2_guest_session";
  const CURRENT_KEY="shooking2_current_account";
  const PROFILE_KEY="shooking2_google_profile";

  function showHome(){
    document.querySelectorAll(".screen").forEach(screen=>screen.classList.add("hidden"));
    const home=document.getElementById("home")||document.getElementById("homeScreen");
    if(home)home.classList.remove("hidden");
    if(typeof window.openScreen==="function"){
      try{window.openScreen("home");}catch(error){console.warn("Guest home open failed",error);}
    }
  }

  function clearGuestData(){
    const protectedKeys=new Set([GUEST_KEY,"shooking2_firebase_config"]);
    Object.keys(localStorage).forEach(key=>{
      if(key.startsWith("shooking2")&&!protectedKeys.has(key))localStorage.removeItem(key);
    });
    localStorage.removeItem(CURRENT_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }

  function startGuest(){
    try{
      clearGuestData();
      sessionStorage.setItem(GUEST_KEY,"1");
      sessionStorage.removeItem("shooking2_google_redirect_pending");
      const account={provider:"guest",uid:"guest",accountName:"ゲスト",email:"",picture:"",guest:true,lastLoginAt:new Date().toISOString()};
      localStorage.setItem(CURRENT_KEY,JSON.stringify(account));
      const msg=document.getElementById("googleLoginMessage")||document.getElementById("loginMessage");
      if(msg){msg.textContent="ゲストとして開始します。終了するとデータは消えます。";msg.style.color="#fde68a";}
      showHome();
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

  function keepGuestOpen(){
    if(sessionStorage.getItem(GUEST_KEY)!=="1")return;
    showHome();
  }

  function install(){
    addButton();
    if(sessionStorage.getItem(GUEST_KEY)==="1"){
      clearGuestData();
      sessionStorage.setItem(GUEST_KEY,"1");
      showHome();
    }
    setInterval(()=>{addButton();keepGuestOpen();},700);
    window.addEventListener("pagehide",()=>{
      if(sessionStorage.getItem(GUEST_KEY)==="1")clearGuestData();
    });
  }

  window.startShookingGuest=startGuest;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
})();