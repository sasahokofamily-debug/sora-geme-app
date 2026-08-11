(()=>{
'use strict';
const VERSION='1.0.0';
const FIREBASE_VERSION='10.12.5';
let loading=null;
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));}
function loadScript(src,id){return new Promise((resolve,reject)=>{if(document.getElementById(id)){resolve();return;}const s=document.createElement('script');s.id=id;s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Firebaseライブラリを読み込めませんでした'));document.head.appendChild(s);});}
function config(){try{return window.SHOO_KING_FIREBASE_CONFIG||JSON.parse(localStorage.getItem('shooking2_firebase_config')||'null');}catch{return null;}}
async function ensureFirebase(){
  if(window.firebase?.firestore)return window.firebase;
  if(loading)return loading;
  loading=(async()=>{
    const cfg=config();if(!cfg)throw new Error('Firebase設定がありません');
    await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,'firebaseAppSdk');
    await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth-compat.js`,'firebaseAuthSdk');
    await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore-compat.js`,'firebaseFirestoreSdk');
    if(!firebase.apps?.length)firebase.initializeApp(cfg);
    return firebase;
  })();
  try{return await loading;}finally{loading=null;}
}
function reportId(){const a=new Uint8Array(4);if(window.crypto?.getRandomValues)crypto.getRandomValues(a);else for(let i=0;i<a.length;i++)a[i]=Math.floor(Math.random()*256);const rand=Array.from(a,x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();const d=new Date(),ymd=String(d.getFullYear()).slice(-2)+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');return `SK2-${ymd}-${rand}`;}
function buildMeta(){
  const account=(()=>{try{return JSON.parse(localStorage.getItem('shooking2_current_account')||'null')}catch{return null}})();
  return {path:location.pathname+location.search,href:location.href,userAgent:navigator.userAgent,language:navigator.language,online:navigator.onLine,build:document.querySelector('meta[name="shooking-build"]')?.content||'',account:{uid:account?.uid||'',name:account?.accountName||'',email:account?.email||''}};
}
function ensureScreen(){
  let s=document.getElementById('bugReportScreen');if(s)return s;
  const style=document.createElement('style');style.textContent=`#bugReportScreen{background:radial-gradient(circle at 80% 10%,rgba(239,68,68,.13),transparent 28%),linear-gradient(135deg,#020617,#07111f)}#bugReportScreen .panel{width:min(860px,94vw);text-align:left}.bugGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.bugCard{padding:12px;border:1px solid #334155;border-radius:12px;background:rgba(15,23,42,.72)}.bugStatus{margin:10px 0;padding:11px;border:1px solid rgba(56,189,248,.35);border-radius:10px;background:rgba(2,6,23,.66);white-space:pre-wrap}.bugLookupResult{margin-top:10px;padding:12px;border:1px solid #38bdf8;border-radius:12px;background:rgba(2,6,23,.7);line-height:1.6;overflow-wrap:anywhere}.bugDevLookup{margin:12px 0;border:1px solid #334155;border-radius:12px;padding:10px}.bugDevLookup summary{cursor:pointer;color:#94a3b8;font-weight:800}@media(max-width:650px){.bugGrid{grid-template-columns:1fr}}`;document.head.appendChild(style);
  s=document.createElement('div');s.id='bugReportScreen';s.className='screen hidden';
  s.innerHTML=`<div class="panel"><h1>BUG REPORT</h1><p class="small">不具合をFirebaseへ保存します。送信後に報告IDが発行されます。</p><div class="bugGrid"><div><label>種類</label><select id="bugCategory"><option>画面/UI</option><option>ログイン</option><option>ガチャ</option><option>オンライン</option><option>ゲームプレイ</option><option>Firebase/保存</option><option>その他</option></select></div><div><label>重要度</label><select id="bugSeverity"><option>普通</option><option>軽い</option><option>重い</option><option>操作不能</option></select></div></div><label>タイトル</label><input id="bugTitle" placeholder="例：ログインを押すと500になる"><label>発生したこと</label><textarea id="bugActual" placeholder="何が起きたか"></textarea><label>発生手順</label><textarea id="bugSteps" placeholder="1. ホームを開く\n2. ログインを押す\n3. ..."></textarea><label>エラー表示（あれば）</label><textarea id="bugError" placeholder="500 / Unexpected token ..."></textarea><button id="bugSubmit">Firebaseへバグ報告を送信</button><div id="bugStatus" class="bugStatus">まだ送信していません。</div><details class="bugDevLookup"><summary>開発者向け：報告IDから表示</summary><p class="small">普通の利用者向けではありません。報告IDを入力してFirebase上の報告を確認します。</p><input id="bugLookupId" placeholder="SK2-260811-XXXXXXXX"><button id="bugLookup">報告を表示</button><div id="bugLookupResult" class="bugLookupResult" style="display:none"></div></details><button id="bugBack" class="back">ホームへ戻る</button></div>`;
  document.body.appendChild(s);
  s.querySelector('#bugSubmit').onclick=submit;
  s.querySelector('#bugLookup').onclick=lookup;
  s.querySelector('#bugBack').onclick=openHome;
  return s;
}
function openHome(){document.querySelectorAll('.screen').forEach(x=>x.classList.add('hidden'));document.getElementById('home')?.classList.remove('hidden');if(typeof window.renderHomeShipPreview==='function')setTimeout(window.renderHomeShipPreview,0);}
function setStatus(t,bad=false){const e=document.getElementById('bugStatus');if(e){e.textContent=t;e.style.color=bad?'#fca5a5':'#bfdbfe';}}
async function submit(){
  const s=ensureScreen(),title=s.querySelector('#bugTitle').value.trim(),actual=s.querySelector('#bugActual').value.trim();
  if(!title||!actual){setStatus('タイトルと「発生したこと」を入力してください。',true);return;}
  try{
    setStatus('Firebaseへ送信中...');const fb=await ensureFirebase();const id=reportId();const user=fb.auth?.().currentUser||null;
    const data={id,app:'SHOO KING II',status:'new',category:s.querySelector('#bugCategory').value,severity:s.querySelector('#bugSeverity').value,title,actual,steps:s.querySelector('#bugSteps').value.trim(),error:s.querySelector('#bugError').value.trim(),meta:buildMeta(),reporter:{uid:user?.uid||'',email:user?.email||'',name:user?.displayName||''},createdAt:fb.firestore.FieldValue.serverTimestamp(),createdAtClient:new Date().toISOString()};
    await fb.firestore().collection('bugReports').doc(id).set(data);
    setStatus(`送信完了！\n報告ID: ${id}\nこのIDで後から報告内容を確認できます。`);
    s.querySelector('#bugLookupId').value=id;
  }catch(e){console.error(e);setStatus(`送信エラー: ${e.message}\nFirebase Rulesで bugReports への書き込みが許可されているか確認してください。`,true);}
}
async function lookup(){
  const s=ensureScreen(),id=s.querySelector('#bugLookupId').value.trim().toUpperCase(),out=s.querySelector('#bugLookupResult');
  if(!id){out.style.display='block';out.textContent='報告IDを入力してください。';return;}
  try{
    out.style.display='block';out.textContent='Firebaseから読み込み中...';const fb=await ensureFirebase();const snap=await fb.firestore().collection('bugReports').doc(id).get();
    if(!snap.exists){out.textContent='その報告IDは見つかりませんでした。';return;}
    const d=snap.data()||{};out.innerHTML=`<b>${esc(d.id||id)} / ${esc(d.status||'')}</b><br><b>${esc(d.title||'')}</b><br>種類: ${esc(d.category||'')} / 重要度: ${esc(d.severity||'')}<br><br><b>発生したこと</b><br>${esc(d.actual||'').replace(/\n/g,'<br>')}<br><br><b>手順</b><br>${esc(d.steps||'').replace(/\n/g,'<br>')}<br><br><b>エラー</b><br>${esc(d.error||'').replace(/\n/g,'<br>')}<br><br><span class="small">${esc(d.createdAtClient||'')} / ${esc(d.meta?.path||'')}</span>`;
  }catch(e){console.error(e);out.style.display='block';out.textContent=`読み込みエラー: ${e.message}`;}
}
function openBugReport(){const s=ensureScreen();document.querySelectorAll('.screen').forEach(x=>x.classList.add('hidden'));s.classList.remove('hidden');}
function installButton(){const box=document.querySelector('#home .homeUtilityActions');if(!box||document.getElementById('openBugReportButton'))return;const b=document.createElement('button');b.id='openBugReportButton';b.type='button';b.textContent='バグ報告';b.onclick=openBugReport;box.appendChild(b);}
window.openBugReport=openBugReport;window.__shookingBugReportVersion=VERSION;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{ensureScreen();installButton();},{once:true});else{ensureScreen();installButton();}
new MutationObserver(installButton).observe(document.documentElement,{subtree:true,childList:true});
})();
