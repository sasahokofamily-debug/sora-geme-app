(()=>{
'use strict';
const VERSION='1.0.0';
const RULES=[
  {k:['unexpected token',"unexpected token ','",'syntaxerror'],title:'JavaScript 構文エラー',cause:'JavaScriptの記号、カンマ、コロン、かっこなどの書き方が崩れている可能性があります。',fix:'直前に編集したJSを確認し、ブラウザのエラーに出ている行付近を見ます。三項演算子の ? と :、かっこの閉じ忘れ、余分なカンマを確認してください。'},
  {k:['cannot read properties of undefined','cannot read property','undefined (reading'],title:'undefined 参照エラー',cause:'まだ存在しない値や要素に対してプロパティや関数を使っています。',fix:'対象が存在するか確認してから処理します。DOMなら getElementById の結果、イベントなら event.key などが undefined ではないか確認してください。'},
  {k:['permission-denied','missing or insufficient permissions'],title:'Firebase 権限エラー',cause:'Firestore Security Rules が現在のログイン状態や保存先を許可していません。',fix:'Firebaseログイン状態を確認し、Firestore Rulesで対象コレクションの read / write 条件を確認してください。'},
  {k:['failed to fetch','networkerror','network request failed'],title:'通信エラー',cause:'ネットワーク切断、URL誤り、CORS、サーバー停止などで通信できていません。',fix:'通信状態、URL、Vercel/Firebaseの稼働状態を確認します。少し待ってから再試行するのも有効です。'},
  {k:['service worker','serviceworker','controllerchange'],title:'Service Worker エラー',cause:'古いService Worker、更新途中のWorker、キャッシュ戦略の競合が考えられます。',fix:'自動リロード処理がないか確認し、必要ならService WorkerとCache Storageを一度だけ解除してから再登録します。'},
  {k:['reload loop','再読み込み','reload'],title:'再読み込みループ',cause:'location.reload / location.replace / Service Worker の navigate が連鎖している可能性があります。',fix:'自動再読み込みを止め、更新は裏で切り替える方式にします。reload用のlocalStorage/sessionStorageフラグも確認してください。'},
  {k:['quota','storage','localstorage','indexeddb'],title:'保存容量エラー',cause:'ブラウザの保存容量不足、プライベートモード、ストレージ制限などが考えられます。',fix:'不要なサイトデータを減らし、通常モードで試します。localStorageへ巨大なデータを保存していないかも確認してください。'},
  {k:['popup-blocked','popup blocked'],title:'ポップアップブロック',cause:'Googleログインなどのポップアップをブラウザが止めています。',fix:'このサイトのポップアップを許可してから、もう一度Googleログインを押してください。'},
  {k:['webgl','renderer','canvas'],title:'描画エラー',cause:'WebGLやCanvasの初期化、GPU、メモリ不足などの可能性があります。',fix:'他の重いタブを閉じ、ブラウザを再起動します。描画オブジェクト数やパーティクル数も減らしてください。'},
  {k:['500','internal application error','internal server error'],title:'500 エラー',cause:'アプリ内のJavaScript例外、サーバー側エラー、読み込み失敗などがまとめて500として表示されている可能性があります。',fix:'Detail欄の最初のエラーメッセージを確認し、その内容をこのAI解説へ貼り付けてください。'}
];
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function analyse(text){
  const src=String(text||'').trim();
  const low=src.toLowerCase();
  const hit=RULES.find(r=>r.k.some(k=>low.includes(k)));
  if(hit)return {...hit,confidence:'高',raw:src};
  return {title:'未登録のエラー',cause:'このエラーは内蔵のよくあるエラーパターンに完全一致しませんでした。',fix:'エラー全文、発生した画面、押したボタン、直前にした操作をバグ報告へ送ると原因を追いやすくなります。',confidence:'低',raw:src};
}
function speakResult(result){
  if(!('speechSynthesis' in window))return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(`${result.title}。原因。${result.cause}。対処。${result.fix}`);
  u.lang='ja-JP';u.rate=.98;u.pitch=1;
  const voices=speechSynthesis.getVoices();
  const ja=voices.find(v=>String(v.lang).toLowerCase().startsWith('ja'));
  if(ja)u.voice=ja;
  speechSynthesis.speak(u);
}
function ensureScreen(){
  let screen=document.getElementById('errorAssistScreen');
  if(screen)return screen;
  const style=document.createElement('style');
  style.textContent=`
  #errorAssistScreen{background:radial-gradient(circle at 20% 10%,rgba(56,189,248,.18),transparent 30%),linear-gradient(135deg,#020617,#07111f)}
  #errorAssistScreen .panel{width:min(820px,94vw);text-align:left}
  .aiErrHero{padding:14px;border:1px solid rgba(125,249,255,.35);border-radius:14px;background:rgba(2,6,23,.66);margin:10px 0 14px}.aiErrHero b{color:#7df9ff}.aiErrPresets{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0 12px}.aiErrPresets button{width:auto;margin:0;padding:8px 10px;font-size:11px;background:#0f172a;border:1px solid #334155}.aiErrResult{margin:12px 0;padding:14px;border:1px solid #38bdf8;border-left:4px solid #38bdf8;border-radius:12px;background:rgba(15,23,42,.78);line-height:1.65}.aiErrResult h2{margin:0 0 8px;color:#7df9ff}.aiErrActions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.aiErrActions button{margin:0}@media(max-width:600px){.aiErrActions{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
  screen=document.createElement('div');
  screen.id='errorAssistScreen';screen.className='screen hidden';
  screen.innerHTML=`<div class="panel"><h1>AI ERROR ASSIST</h1><div class="aiErrHero"><b>よくあるエラーを音声で解説</b><div class="small">エラー全文を貼るか、よくある例を選んでください。解析後は日本語音声で原因と対処を読み上げます。</div></div><div class="aiErrPresets" id="aiErrPresets"></div><textarea id="aiErrInput" placeholder="例: Cannot read properties of undefined (reading 'toLowerCase')"></textarea><button id="aiErrAnalyse">AI解析して音声解説</button><div id="aiErrResult" class="aiErrResult" style="display:none"></div><div class="aiErrActions"><button id="aiErrSpeak" style="display:none">もう一度読み上げ</button><button id="aiErrStop" class="back">音声停止</button></div><button class="back" id="aiErrBack">ホームへ戻る</button></div>`;
  document.body.appendChild(screen);
  const examples=['500','Unexpected token',"Cannot read properties of undefined",'Firebase permission-denied','Failed to fetch','Service Worker','再読み込みループ'];
  const presets=screen.querySelector('#aiErrPresets');
  examples.forEach(t=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>{screen.querySelector('#aiErrInput').value=t;};presets.appendChild(b);});
  let last=null;
  screen.querySelector('#aiErrAnalyse').onclick=()=>{
    last=analyse(screen.querySelector('#aiErrInput').value);
    const out=screen.querySelector('#aiErrResult');
    out.style.display='block';
    out.innerHTML=`<h2>${esc(last.title)}</h2><div><b>判定:</b> ${esc(last.confidence)}</div><div><b>原因:</b> ${esc(last.cause)}</div><div><b>対処:</b> ${esc(last.fix)}</div>`;
    screen.querySelector('#aiErrSpeak').style.display='block';
    speakResult(last);
  };
  screen.querySelector('#aiErrSpeak').onclick=()=>last&&speakResult(last);
  screen.querySelector('#aiErrStop').onclick=()=>{try{speechSynthesis.cancel();}catch{}};
  screen.querySelector('#aiErrBack').onclick=()=>openHome();
  return screen;
}
function openHome(){
  document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
  document.getElementById('home')?.classList.remove('hidden');
  if(typeof window.renderHomeShipPreview==='function')setTimeout(window.renderHomeShipPreview,0);
}
function openErrorAssist(){
  const s=ensureScreen();document.querySelectorAll('.screen').forEach(x=>x.classList.add('hidden'));s.classList.remove('hidden');
}
function installButton(){
  const box=document.querySelector('#home .homeUtilityActions');
  if(!box||document.getElementById('openErrorAssistButton'))return;
  const b=document.createElement('button');b.id='openErrorAssistButton';b.type='button';b.textContent='AI エラー解説';b.onclick=openErrorAssist;box.appendChild(b);
}
window.openErrorAssist=openErrorAssist;
window.__shookingErrorAssistVersion=VERSION;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{ensureScreen();installButton();},{once:true});else{ensureScreen();installButton();}
new MutationObserver(installButton).observe(document.documentElement,{subtree:true,childList:true});
})();
