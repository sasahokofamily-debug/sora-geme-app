(()=>{
  "use strict";

  const ERROR_MAP=[
    [/auth\/unauthorized-domain|unauthorized-domain/i,"このサイトがFirebaseで許可されていません。Firebase Console → Authentication → Settings → Authorized domains に sasahokofamily-debug.github.io を追加してください。"],
    [/auth\/operation-not-allowed|operation-not-allowed/i,"Firebase Console → Authentication → Sign-in method で Google を有効にしてください。"],
    [/auth\/popup-blocked|popup.*blocked/i,"Googleログインのポップアップがブロックされました。ブラウザでポップアップを許可してください。"],
    [/auth\/popup-closed-by-user|popup.*closed/i,"Googleログイン画面が閉じられました。もう一度Googleログインを押してください。"],
    [/auth\/cancelled-popup-request/i,"別のGoogleログイン画面が開いています。閉じてからもう一度押してください。"],
    [/auth\/network-request-failed|network request failed/i,"通信に失敗しました。インターネット接続を確認して、もう一度試してください。"],
    [/auth\/invalid-api-key|invalid api key/i,"Firebase設定の apiKey が違います。Firebase ConsoleのWebアプリ設定をそのまま貼り直してください。"],
    [/permission-denied|insufficient permissions/i,"Firestoreの権限がありません。Firestoreのセキュリティルールを確認してください。"],
    [/failed-precondition|database.*not.*exist/i,"Firestore Databaseがまだ作成されていない可能性があります。Firebase ConsoleでFirestore Databaseを作成してください。"],
    [/auth\/invalid-app-credential/i,"Firebase設定が正しくありません。Webアプリ用のfirebaseConfigを貼り直してください。"],
    [/auth\/internal-error/i,"Firebase内部エラーです。Firebase設定を保存し直して、ページを再読み込みしてください。"]
  ];

  function translate(text){
    const value=String(text||"").trim();
    if(!value)return value;
    for(const [pattern,message] of ERROR_MAP){
      if(pattern.test(value))return message;
    }
    if(/firebase|auth\/|firestore|error/i.test(value)&&/[A-Za-z]{4,}/.test(value)){
      return "Firebaseの設定でエラーが発生しました。下の確認項目を順番に確認してください。";
    }
    return value;
  }

  function translateNode(node){
    if(!node||node.nodeType!==1)return;
    const targets=[];
    if(node.matches?.("#googleLoginMessage,#firebaseCloudStatus,#firebaseConfigStatus"))targets.push(node);
    node.querySelectorAll?.("#googleLoginMessage,#firebaseCloudStatus,#firebaseConfigStatus").forEach(el=>targets.push(el));
    targets.forEach(el=>{
      const translated=translate(el.textContent);
      if(translated&&translated!==el.textContent)el.textContent=translated;
    });
  }

  function addGuide(){
    const area=document.getElementById("googleLoginSettings");
    if(!area||document.getElementById("firebaseJapaneseGuide"))return;
    const guide=document.createElement("div");
    guide.id="firebaseJapaneseGuide";
    guide.style.cssText="margin:12px 0;padding:12px;border:1px solid #facc15;border-radius:12px;background:rgba(250,204,21,.08);text-align:left";
    guide.innerHTML=`<b style="color:#fde68a">Googleログインが動かないとき</b>
      <ol class="small" style="padding-left:20px;line-height:1.8">
        <li>Authentication → Sign-in method → Google を有効にする</li>
        <li>Authentication → Settings → Authorized domains に <b>sasahokofamily-debug.github.io</b> を追加する</li>
        <li>Firestore Databaseを作成する</li>
        <li>Webアプリ用firebaseConfigを、波かっこ { } ごと貼り付ける</li>
      </ol>`;
    const status=document.getElementById("firebaseConfigStatus");
    area.insertBefore(guide,status||area.children[area.children.length-1]);
  }

  function install(){
    addGuide();
    document.querySelectorAll("#googleLoginMessage,#firebaseCloudStatus,#firebaseConfigStatus").forEach(translateNode);
    const observer=new MutationObserver(records=>records.forEach(record=>{
      translateNode(record.target.parentElement||record.target);
      record.addedNodes.forEach(translateNode);
      addGuide();
    }));
    observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
    setInterval(addGuide,1000);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);
  else install();
})();