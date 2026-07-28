(()=>{
  'use strict';

  const VERSION='login-cool-v1';
  const style=document.createElement('style');
  style.textContent=`
    #loginScreen{align-items:center!important;justify-content:center!important;padding:24px!important;background:
      radial-gradient(circle at 18% 20%,rgba(56,189,248,.22),transparent 24%),
      radial-gradient(circle at 82% 78%,rgba(139,92,246,.2),transparent 28%),
      linear-gradient(145deg,#020617 0%,#07142b 48%,#02030a 100%)!important;overflow:hidden!important}
    #loginScreen::before{content:"";position:absolute;inset:-20%;pointer-events:none;background-image:
      radial-gradient(circle,#fff 0 1px,transparent 1.5px),
      radial-gradient(circle,#67e8f9 0 1px,transparent 1.5px);background-size:64px 64px,103px 103px;background-position:0 0,30px 24px;opacity:.2;animation:shooLoginStars 18s linear infinite}
    #loginScreen::after{content:"";position:absolute;left:50%;top:50%;width:min(840px,100vw);height:min(840px,100vw);transform:translate(-50%,-50%);border:1px solid rgba(103,232,249,.08);border-radius:50%;box-shadow:0 0 0 80px rgba(56,189,248,.025),0 0 0 160px rgba(139,92,246,.018);pointer-events:none;animation:shooLoginRadar 13s linear infinite}
    #loginScreen .panel{position:relative;z-index:2;width:min(470px,94vw)!important;max-height:calc(100dvh - 36px)!important;padding:24px!important;border:1px solid rgba(103,232,249,.72)!important;border-radius:28px!important;background:
      linear-gradient(160deg,rgba(15,23,42,.93),rgba(2,6,23,.86))!important;box-shadow:
      0 32px 90px rgba(0,0,0,.68),
      0 0 45px rgba(56,189,248,.22),
      inset 0 1px 0 rgba(255,255,255,.08)!important;backdrop-filter:blur(18px);overflow:auto!important}
    #loginScreen .panel::before{content:"SECURE ACCESS TERMINAL";display:block;margin:0 0 13px;color:#67e8f9;font:800 10px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.22em;text-align:left;opacity:.82}
    #loginScreen h1{margin:0!important;font-size:clamp(31px,7vw,44px)!important;line-height:.95!important;letter-spacing:.06em!important;color:#f8fafc!important;text-shadow:0 0 22px rgba(56,189,248,.65)!important}
    #loginScreen h1::after{content:" II";color:#67e8f9}
    #shooLoginHero{position:relative;margin:8px 0 18px;padding:12px 14px 12px 58px;border:1px solid rgba(56,189,248,.22);border-radius:16px;background:linear-gradient(90deg,rgba(56,189,248,.09),rgba(139,92,246,.06));text-align:left;overflow:hidden}
    #shooLoginHero::before{content:"◆";position:absolute;left:17px;top:50%;transform:translateY(-50%) rotate(45deg);color:#67e8f9;font-size:24px;text-shadow:0 0 16px #38bdf8}
    #shooLoginHero::after{content:"";position:absolute;right:-18px;top:-26px;width:90px;height:90px;border:1px solid rgba(103,232,249,.16);border-radius:50%;box-shadow:0 0 0 14px rgba(103,232,249,.025)}
    #shooLoginHero strong{display:block;color:#e0faff;font-size:14px;letter-spacing:.08em}
    #shooLoginHero span{display:block;margin-top:3px;color:#94a3b8;font-size:11px;line-height:1.45}
    #loginScreen .authBox{margin:0!important;padding:0!important;border:0!important;background:transparent!important;text-align:left!important;box-shadow:none!important}
    #loginScreen .authBox label{display:block;margin-top:12px;color:#cbd5e1;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
    #loginScreen input{height:50px!important;margin:6px 0 4px!important;padding:0 15px!important;border:1px solid rgba(103,232,249,.32)!important;border-radius:14px!important;background:rgba(2,6,23,.78)!important;color:#f8fafc!important;font-size:16px!important;outline:none!important;box-shadow:inset 0 0 20px rgba(56,189,248,.04)!important;transition:.2s ease}
    #loginScreen input:focus{border-color:#67e8f9!important;box-shadow:0 0 0 3px rgba(56,189,248,.12),0 0 22px rgba(56,189,248,.16)!important;transform:translateY(-1px)}
    #loginScreen input::placeholder{color:#526178}
    #loginScreen button{min-height:48px!important;border-radius:14px!important;font-size:14px!important;letter-spacing:.04em!important;transition:transform .16s ease,filter .16s ease,box-shadow .16s ease!important}
    #loginScreen button:hover{transform:translateY(-2px);filter:brightness(1.08)}
    #loginScreen button:active{transform:scale(.985)}
    #loginScreen button[onclick*="loginFirebaseEmailAccount"],#loginScreen button[onclick="loginAccount()"]{margin-top:16px!important;background:linear-gradient(100deg,#0891b2,#2563eb 52%,#7c3aed)!important;box-shadow:0 12px 28px rgba(37,99,235,.28),0 0 22px rgba(56,189,248,.16)!important}
    #loginScreen #firebaseLoginExtras{margin-top:8px}
    #loginScreen #firebaseLoginExtras>button:first-child{min-height:38px!important;margin:4px 0!important;padding:7px!important;background:transparent!important;border:1px solid rgba(148,163,184,.2)!important;color:#94a3b8!important;font-size:12px!important;box-shadow:none!important}
    #loginScreen #firebaseLoginExtras>div{margin:15px 0!important;border-color:rgba(103,232,249,.14)!important}
    #loginScreen button[onclick*="startGoogleLogin"]{position:relative;background:#f8fafc!important;color:#0f172a!important;border:1px solid #fff!important;box-shadow:0 10px 24px rgba(0,0,0,.24)!important}
    #loginScreen button[onclick*="startGoogleLogin"]::before{content:"G";display:inline-grid;place-items:center;width:24px;height:24px;margin-right:8px;border-radius:50%;background:conic-gradient(from -40deg,#4285f4 0 25%,#34a853 0 50%,#fbbc05 0 75%,#ea4335 0);color:#fff;font-weight:1000;vertical-align:middle;text-shadow:0 1px 2px #0006}
    #loginScreen #googleLoginMessage,#loginScreen #loginMessage{margin:12px 0 0!important;padding:10px 12px!important;border:1px solid rgba(103,232,249,.16);border-radius:12px;background:rgba(2,6,23,.52);color:#9fb7cf!important;font-size:11px!important;line-height:1.5!important;text-align:left!important;white-space:pre-wrap}
    #shooLoginStatus{display:flex;align-items:center;gap:7px;margin-top:12px;color:#64748b;font:700 10px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.04em}
    #shooLoginStatus::before{content:"";width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 10px #22c55e;animation:shooLoginBlink 1.5s ease-in-out infinite}
    @keyframes shooLoginStars{to{transform:translate3d(64px,64px,0)}}
    @keyframes shooLoginRadar{to{transform:translate(-50%,-50%) rotate(360deg)}}
    @keyframes shooLoginBlink{50%{opacity:.35}}
    @media(max-width:700px),(pointer:coarse){#loginScreen{padding:max(12px,env(safe-area-inset-top)) 10px max(12px,env(safe-area-inset-bottom))!important}#loginScreen .panel{width:100%!important;max-height:calc(100dvh - 24px)!important;padding:18px 15px!important;border-radius:22px!important}#shooLoginHero{margin-bottom:12px;padding:10px 10px 10px 50px}#loginScreen input{height:46px!important}#loginScreen button{min-height:44px!important}}
    @media(prefers-reduced-motion:reduce){#loginScreen::before,#loginScreen::after,#shooLoginStatus::before{animation:none!important}}
  `;
  document.head.appendChild(style);

  function decorate(){
    const screen=document.getElementById('loginScreen');
    const panel=screen?.querySelector('.panel');
    const box=screen?.querySelector('.authBox');
    if(!screen||!panel||!box)return;

    if(!document.getElementById('shooLoginHero')){
      const hero=document.createElement('div');
      hero.id='shooLoginHero';
      hero.innerHTML='<strong>PILOT AUTHENTICATION</strong><span>アカウントを認証して、宇宙ミッションとクラウドセーブへ接続します。</span>';
      box.parentNode.insertBefore(hero,box);
    }

    const email=document.getElementById('loginName');
    const password=document.getElementById('loginPassword');
    if(email){email.autocomplete='email';email.placeholder='pilot@example.com';email.setAttribute('aria-label','メールアドレス')}
    if(password){password.autocomplete='current-password';password.placeholder='••••••••';password.setAttribute('aria-label','パスワード')}

    if(!document.getElementById('shooLoginStatus')){
      const status=document.createElement('div');
      status.id='shooLoginStatus';
      status.textContent='FIREBASE LINK READY / ENCRYPTED SESSION';
      panel.appendChild(status);
    }

    const title=panel.querySelector('h1');
    if(title&&title.textContent.trim().toUpperCase()!=='SHOO KING')title.textContent='SHOO KING';
    window.__shookingLoginCool=VERSION;
  }

  function install(){
    decorate();
    const observer=new MutationObserver(decorate);
    observer.observe(document.documentElement,{subtree:true,childList:true});
    setInterval(decorate,1200);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();