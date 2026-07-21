(()=>{
'use strict';
if(document.getElementById('shookingCommonNav')||document.getElementById('shookingGameExit')) return;

const path=location.pathname;
const isGame=path==='/game'||path.endsWith('/index.html');
const isDetails=path.endsWith('/details.html');
const isDownload=path.endsWith('/download-builder.html');
const isPermission=path.endsWith('/permission-maker.html');
const pageName=isGame?'ゲーム':isDetails?'詳細':isDownload?'ダウンロード':isPermission?'権限発行':'ホーム';

const style=document.createElement('style');
style.textContent=`
#shookingCommonNav{position:sticky;top:0;z-index:99999;background:rgba(1,4,9,.96);border-bottom:1px solid #30363d;backdrop-filter:blur(12px);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#e6edf3}
#shookingCommonNav .sn-inner{width:min(1080px,calc(100% - 20px));min-height:58px;margin:auto;display:flex;align-items:center;gap:10px}
#shookingCommonNav .sn-brand{font-weight:900;white-space:nowrap;margin-right:auto}
#shookingCommonNav a{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:7px 11px;border:1px solid #30363d;border-radius:9px;background:#161b22;color:#e6edf3;text-decoration:none;font-size:13px;font-weight:800}
#shookingCommonNav a[aria-current="page"]{border-color:#58a6ff;background:#1f6feb;color:white}
#shookingBreadcrumb{width:min(1080px,calc(100% - 20px));margin:10px auto 0;color:#8b949e;font:700 12px system-ui,-apple-system,"Segoe UI",sans-serif}
#shookingBreadcrumb a{color:#58a6ff;text-decoration:none}
#shookingGameExit{position:fixed;left:12px;bottom:12px;z-index:99998;display:inline-flex;padding:11px 14px;border:1px solid #58a6ff;border-radius:12px;background:#0d1117;color:#fff;text-decoration:none;font:900 13px system-ui;box-shadow:0 8px 28px rgba(0,0,0,.4)}
@media(max-width:720px){#shookingCommonNav .sn-inner{overflow-x:auto}.sn-brand{display:none!important}#shookingCommonNav a{white-space:nowrap;flex:0 0 auto}}
`;
document.head.appendChild(style);

if(isGame){
 const exit=document.createElement('a');
 exit.id='shookingGameExit';
 exit.href='/details.html';
 exit.textContent='← 詳細に戻る';
 document.body.appendChild(exit);
 return;
}

const nav=document.createElement('nav');
nav.id='shookingCommonNav';
nav.setAttribute('aria-label','共通メニュー');
nav.innerHTML=`<div class="sn-inner"><div class="sn-brand">◉ SHOO KING II</div>
<a href="/" ${pageName==='ホーム'?'aria-current="page"':''}>🏠 ホーム</a>
<a href="/details.html" ${pageName==='詳細'?'aria-current="page"':''}>📄 詳細</a>
<a href="/download-builder.html" ${pageName==='ダウンロード'?'aria-current="page"':''}>📥 ダウンロード</a>
<a href="/permission-maker.html" ${pageName==='権限発行'?'aria-current="page"':''}>🔑 権限発行</a></div>`;
document.body.prepend(nav);

const crumb=document.createElement('div');
crumb.id='shookingBreadcrumb';
crumb.innerHTML=pageName==='ホーム'?'ホーム':`<a href="/">ホーム</a> ＞ ${pageName}`;
nav.insertAdjacentElement('afterend',crumb);

if(isDetails){
 document.querySelectorAll('a').forEach(a=>{
  const text=(a.textContent||'').trim();
  if(text.includes('ゲームをプレイ')){a.href='/game?play=1';a.textContent='▶ ゲームを始める';}
  if(text.includes('GitHub Pages版を開く')){a.href='/';a.textContent='🏠 ホームへ戻る';}
  if(text==='ゲームへ戻る'){a.href='/';a.textContent='ホームへ戻る';}
 });
}
if(isDownload){
 document.querySelectorAll('a').forEach(a=>{
  const text=(a.textContent||'').trim();
  if(text.includes('ゲームを開く')){a.href='/details.html';a.textContent='詳細ページへ戻る';}
  if(text.includes('Vercel版を開く')){a.href='/';a.textContent='ホームへ戻る';}
 });
}
if(isPermission){
 document.querySelectorAll('a').forEach(a=>{
  const text=(a.textContent||'').trim();
  if(text.includes('Vercel版ゲームへ移動')){a.href='/details.html';a.textContent='詳細・ゲーム開始ページへ戻る';}
 });
}
})();