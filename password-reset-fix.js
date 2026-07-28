(()=>{
  'use strict';

  const CONFIG_KEY='shooking2_firebase_config';
  const PROFILE_KEYS=['shooking2_current_account','shooking2_google_profile'];
  const FIREBASE_VERSION='10.12.5';
  let sending=false;

  const $=id=>document.getElementById(id);

  function setMessage(text,isError=false){
    const el=$('googleLoginMessage')||$('loginMessage');
    if(!el)return;
    el.textContent=text;
    el.style.color=isError?'#fca5a5':'#bfdbfe';
    el.style.whiteSpace='pre-wrap';
  }

  function getConfig(){
    try{return JSON.parse(localStorage.getItem(CONFIG_KEY)||'null')}
    catch{return null}
  }

  function validConfig(c){
    return !!(c&&c.apiKey&&c.authDomain&&c.projectId&&c.appId);
  }

  function loadScript(src,id){
    return new Promise((resolve,reject)=>{
      if(document.getElementById(id)){
        const wait=()=>window.firebase?resolve():setTimeout(wait,50);
        wait();
        return;
      }
      const s=document.createElement('script');
      s.id=id;
      s.src=src;
      s.onload=resolve;
      s.onerror=()=>reject(new Error('Firebaseライブラリを読み込めませんでした'));
      document.head.appendChild(s);
    });
  }

  async function getAuth(){
    const config=getConfig();
    if(!validConfig(config))throw Object.assign(new Error('Firebase設定が見つかりません'),{code:'app/no-config'});
    if(!window.firebase){
      await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,'passwordResetFirebaseApp');
    }
    if(!window.firebase.auth){
      await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth-compat.js`,'passwordResetFirebaseAuth');
    }
    if(!firebase.apps?.length)firebase.initializeApp(config);
    const auth=firebase.auth();
    auth.languageCode='ja';
    return auth;
  }

  function storedProviderFor(email){
    const normalized=email.toLowerCase();
    for(const key of PROFILE_KEYS){
      try{
        const p=JSON.parse(localStorage.getItem(key)||'null');
        if(String(p?.email||'').toLowerCase()===normalized)return String(p?.provider||'');
      }catch{}
    }
    return '';
  }

  function errorMessage(error){
    const code=String(error?.code||'');
    if(code==='auth/invalid-email')return 'メールアドレスの形式が正しくありません。';
    if(code==='auth/too-many-requests')return '短時間に何度も送信されました。しばらくしてからもう一度試してください。';
    if(code==='auth/network-request-failed')return '通信に失敗しました。インターネット接続を確認してください。';
    if(code==='auth/operation-not-allowed')return 'Firebaseでメール／パスワード認証が有効になっていません。管理者設定が必要です。';
    if(code==='auth/unauthorized-continue-uri')return 'このサイトがFirebaseの承認済みドメインに登録されていません。';
    if(code==='app/no-config')return error.message;
    return `再設定メールを送れませんでした：${error?.message||'不明なエラー'}`;
  }

  function setButtonBusy(busy){
    const button=document.querySelector('#firebaseLoginExtras button[onclick*="resetFirebasePassword"]');
    if(!button)return;
    button.disabled=busy;
    button.textContent=busy?'送信中…':'パスワードを忘れた';
  }

  async function resetPasswordFixed(){
    if(sending)return;
    const input=$('loginName');
    const email=String(input?.value||prompt('登録したメールアドレスを入力してください')||'').trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setMessage('正しいメールアドレスを入力してください。',true);
      input?.focus();
      return;
    }

    const storedProvider=storedProviderFor(email);
    if(storedProvider.includes('google')){
      setMessage('このメールアドレスはGoogleログインで使われています。パスワード再設定ではなく「Googleでログイン」を押してください。',true);
      return;
    }

    sending=true;
    setButtonBusy(true);
    setMessage('Firebaseへ再設定メールを要求しています…');

    try{
      const auth=await getAuth();
      let methods=[];
      try{methods=await auth.fetchSignInMethodsForEmail(email)}catch{}
      if(methods.includes('google.com')&&!methods.includes('password')){
        setMessage('このアドレスはGoogleログイン専用です。「Googleでログイン」を押してください。',true);
        return;
      }

      await auth.sendPasswordResetEmail(email);
      setMessage(
        `再設定メールの送信要求を受け付けました。\n送信先：${email}\n\n届かない場合：\n・迷惑メール／プロモーションを確認\n・入力したアドレスが登録時と同じか確認\n・Googleで登録した場合は「Googleでログイン」を使用\n\n安全対策により、未登録アドレスでも同じ表示になる場合があります。`
      );
    }catch(error){
      console.error('Password reset error',error);
      setMessage(errorMessage(error),true);
    }finally{
      sending=false;
      setButtonBusy(false);
    }
  }

  function install(){
    window.resetFirebasePassword=resetPasswordFixed;
    window.__shookingPasswordResetFix='v1';
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
