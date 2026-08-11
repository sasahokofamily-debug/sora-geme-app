(()=>{
  'use strict';

  const CONFIG_KEY='shooking2_firebase_config';
  const PROFILE_KEYS=['shooking2_current_account','shooking2_google_profile'];
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

  function setButtonBusy(busy){
    const button=document.querySelector('#firebaseLoginExtras button[onclick*="resetFirebasePassword"]');
    if(!button)return;
    button.disabled=busy;
    button.textContent=busy?'送信中…':'パスワードを忘れた';
  }

  function explainFirebaseError(code){
    const c=String(code||'').replace(/^auth\//,'').toUpperCase();
    const messages={
      INVALID_EMAIL:'メールアドレスの形式が正しくありません。',
      EMAIL_NOT_FOUND:'このメールアドレスはFirebaseのメール／パスワードアカウントに登録されていません。Googleログイン、または以前の端末内アカウントの可能性があります。',
      OPERATION_NOT_ALLOWED:'Firebaseで「メール／パスワード」ログインが無効です。Firebase ConsoleのAuthentication→ログイン方法で有効化が必要です。',
      TOO_MANY_ATTEMPTS_TRY_LATER:'短時間に何度も要求されたため一時停止されています。しばらくしてから試してください。',
      QUOTA_EXCEEDED:'Firebaseのメール送信上限に達しています。時間をおいて試してください。',
      API_KEY_INVALID:'FirebaseのAPIキーが正しくありません。',
      PROJECT_NUMBER_MISMATCH:'Firebaseプロジェクトの設定が一致していません。',
      CONFIGURATION_NOT_FOUND:'Firebase Authenticationの設定が見つかりません。',
      NETWORK_REQUEST_FAILED:'通信に失敗しました。インターネット接続を確認してください。'
    };
    return messages[c]||`Firebaseエラー：${c||'UNKNOWN'}`;
  }

  async function sendResetByRest(email){
    const config=getConfig();
    if(!validConfig(config)){
      const error=new Error('Firebase設定が見つかりません');
      error.code='CONFIGURATION_NOT_FOUND';
      throw error;
    }

    const endpoint=`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(config.apiKey)}`;
    let response;
    try{
      response=await fetch(endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({requestType:'PASSWORD_RESET',email})
      });
    }catch(error){
      error.code='NETWORK_REQUEST_FAILED';
      throw error;
    }

    let payload={};
    try{payload=await response.json()}catch{}
    window.__shookingPasswordResetLastResult={
      time:new Date().toISOString(),
      email,
      status:response.status,
      ok:response.ok,
      response:payload
    };

    if(!response.ok){
      const error=new Error(payload?.error?.message||`HTTP ${response.status}`);
      error.code=payload?.error?.message||`HTTP_${response.status}`;
      throw error;
    }
    return payload;
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
      setMessage('このメールアドレスはGoogleログインで使われています。再設定メールではなく「Googleでログイン」を押してください。',true);
      return;
    }

    sending=true;
    setButtonBusy(true);
    setMessage(`Firebaseへ再設定メールを要求しています…\n送信先：${email}`);

    try{
      const result=await sendResetByRest(email);
      setMessage(
        `Firebaseが再設定メールの送信要求を受け付けました。\n送信先：${result.email||email}\n\n数分待っても届かない場合：\n・迷惑メール／プロモーションを確認\n・登録時と完全に同じアドレスか確認\n・Google登録なら「Googleでログイン」を使用\n・以前の端末内アカウントはFirebaseメールを送れません\n\n送信元はFirebase Authenticationです。`
      );
    }catch(error){
      console.error('Password reset error',error);
      window.__shookingPasswordResetLastError={code:error?.code,message:error?.message,time:new Date().toISOString()};
      setMessage(explainFirebaseError(error?.code||error?.message),true);
    }finally{
      sending=false;
      setButtonBusy(false);
    }
  }

  function install(){
    window.resetFirebasePassword=resetPasswordFixed;
    window.__shookingPasswordResetFix='v3-rest';

    document.addEventListener('click',event=>{
      const button=event.target.closest?.('#firebaseLoginExtras button[onclick*="resetFirebasePassword"]');
      if(!button)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      resetPasswordFixed();
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
