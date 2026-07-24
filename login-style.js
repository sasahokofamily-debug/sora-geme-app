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
      width:min(460px,94vw);
      max-height:none;
      margin:auto;
      padding:24px;
      border:1px solid #30363d;
      border-radius:18px;
      background:rgba(13,17,23,.95);
      box-shadow:0 24px 80px rgba(0,0,0,.48);
      text-align:left;
      overflow:visible;
    }
    #loginScreen h1,#registerScreen h1{
      color:#e6edf3;
      font-size:28px;
      margin:0 0 8px;
      letter-spacing:-.02em;
    }
    #loginScreen .panel::before,#registerScreen .panel::before{
      content:"SK";
      display:grid;
      place-items:center;
      width:54px;
      height:54px;
      margin-bottom:14px;
      border:1px solid #30363d;
      border-radius:16px;
      color:#fff;
      font-size:20px;
      font-weight:900;
      background:#000;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.03);
    }
    #loginScreen .authBox,#registerScreen .authBox{
      margin:14px 0 0;
      padding:0;
      border:0;
      border-radius:0;
      background:transparent;
    }
    #loginScreen label,#registerScreen label{
      display:block;
      margin-top:12px;
      color:#8b949e;
      font-size:12px;
      font-weight:800;
    }
    #loginScreen input,#registerScreen input{
      margin:7px 0 0;
      padding:13px 14px;
      border:1px solid #30363d;
      border-radius:10px;
      background:#010409;
      color:#e6edf3;
      font-size:15px;
    }
    #loginScreen input:focus,#registerScreen input:focus{
      outline:none;
      border-color:#2f81f7;
      box-shadow:0 0 0 3px rgba(47,129,247,.22);
    }
    #loginScreen button,#registerScreen button{
      min-height:44px;
      border:1px solid #30363d;
      border-radius:9px;
      background:linear-gradient(180deg,#21262d,#161b22);
      color:#e6edf3;
      font-size:14px;
    }
    #loginScreen .authBox>button:first-of-type,#registerScreen .authBox>button:first-of-type{
      background:#238636;
      border-color:rgba(240,246,252,.1);
      color:#fff;
    }
    #loginScreen .authBox>button:first-of-type:hover,#registerScreen .authBox>button:first-of-type:hover{
      background:#2ea043;
    }
    #loginScreen .back,#registerScreen .back{
      background:transparent;
      color:#8b949e;
      border-color:#30363d;
    }
    #loginScreen .small,#registerScreen .small{
      color:#8b949e;
      opacity:1;
    }
    #loginScreen .authDanger,#registerScreen .authDanger{
      border:1px solid rgba(210,153,34,.38);
      background:rgba(210,153,34,.08);
      color:#f2cc60;
      border-radius:10px;
      font-size:12px;
      line-height:1.55;
    }
    #googleLoginArea{
      margin-top:16px!important;
      padding-top:16px!important;
      border-top:1px solid #30363d!important;
    }
    #googleLoginArea h2{
      font-size:14px;
      color:#e6edf3;
      text-align:center;
    }
    #googleLoginArea button{
      background:#fff!important;
      color:#24292f!important;
      border:1px solid #d0d7de!important;
      font-weight:900;
    }
    #googleLoginMessage,#loginMessage,#registerMessage{
      min-height:20px;
      margin:8px 0 0;
      line-height:1.45;
    }
    @media(max-width:700px){
      #loginScreen,#registerScreen{padding:12px 0}
      #loginScreen .panel,#registerScreen .panel{
        width:min(460px,calc(100vw - 20px));
        padding:18px;
        border-radius:16px;
      }
      #loginScreen h1,#registerScreen h1{font-size:24px}
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
      const p=document.createElement("p");
      p.className="small authIntro";
      p.textContent="ログインすると、クラウドセーブとオンライン機能を使えます。";
      loginBox.prepend(p);
    }
    if(registerBox&&!registerBox.querySelector(".authIntro")){
      const p=document.createElement("p");
      p.className="small authIntro";
      p.textContent="アカウントを作成して、SHOO KING IIを始めましょう。";
      registerBox.prepend(p);
    }
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",upgradeCopy);
  else upgradeCopy();
})();