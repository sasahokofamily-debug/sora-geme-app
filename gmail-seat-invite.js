(()=>{
'use strict';
const KEY='shooking2_invite_recipients';
const STYLE='gmailSeatInviteStyle';
const MODAL='gmailSeatInviteModal';
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function saved(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function remember(email){const list=[email,...saved().filter(x=>x!==email)].slice(0,12);localStorage.setItem(KEY,JSON.stringify(list))}
function seat(){const n=Number(localStorage.getItem('shooking2_invite_seat_seq')||0)+1;localStorage.setItem('shooking2_invite_seat_seq',String(n));return `A-${String(n).padStart(2,'0')}`}
function roomUrl(){const u=new URL(location.href);u.searchParams.set('invite','1');return u.href}
function installStyle(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`
#gmailSeatInviteButton{position:fixed;right:14px;bottom:14px;z-index:99990;width:auto!important;padding:12px 16px!important;margin:0!important;border-radius:999px!important;background:linear-gradient(135deg,#ef4444,#b91c1c)!important;box-shadow:0 0 22px rgba(239,68,68,.55)!important}
#${MODAL}{position:fixed;inset:0;z-index:99999;background:rgba(2,6,23,.86);display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}
#${MODAL}.open{display:flex}#${MODAL} .gsmCard{width:min(520px,96vw);max-height:92vh;overflow:auto;background:#07111f;border:2px solid #60a5fa;border-radius:20px;padding:20px;box-sizing:border-box;box-shadow:0 0 40px rgba(59,130,246,.5);color:#fff}
#${MODAL} h2{margin:0 0 12px;color:#93c5fd}#${MODAL} label{display:block;text-align:left;font-weight:800;margin-top:10px}#${MODAL} input,#${MODAL} textarea{width:100%;box-sizing:border-box;margin-top:6px;padding:11px;border-radius:10px;border:1px solid #60a5fa;background:#020617;color:#fff}#${MODAL} textarea{height:105px;resize:vertical}
#${MODAL} .gsmGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}#${MODAL} button{margin:0!important}#${MODAL} .gsmSend{background:#dc2626!important}#${MODAL} .gsmClose{background:#475569!important}#${MODAL} .gsmSmall{font-size:12px;opacity:.8;line-height:1.5;margin-top:8px}
@media(max-width:520px){#${MODAL} .gsmGrid{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function build(){if(document.getElementById(MODAL))return;installStyle();const list=saved();const modal=document.createElement('div');modal.id=MODAL;modal.innerHTML=`<div class="gsmCard"><h2>📧 席番号つき招待</h2><label>招待先Gmail<input id="gsmEmail" type="email" list="gsmEmails" value="mysk97104@gmail.com" placeholder="example@gmail.com"></label><datalist id="gsmEmails">${list.map(x=>`<option value="${esc(x)}">`).join('')}</datalist><label>席番号<input id="gsmSeat" value="${seat()}"></label><label>名前<input id="gsmName" placeholder="招待する相手の名前（省略可）"></label><label>メッセージ<textarea id="gsmMessage">SHOO KING IIへ招待します。下のリンクから参加してください。</textarea></label><div class="gsmGrid"><button class="gsmSend" id="gsmGmail">Gmailで招待を作成</button><button id="gsmCopy">招待文をコピー</button><button id="gsmNewSeat">新しい席番号</button><button class="gsmClose" id="gsmClose">閉じる</button></div><div class="gsmSmall">Gmailの作成画面が開きます。最後の送信ボタンは自分で押してください。宛先履歴はこの端末内だけに保存されます。</div></div>`;document.body.appendChild(modal);
const $=id=>document.getElementById(id);function body(){const name=$('gsmName').value.trim();const seatNo=$('gsmSeat').value.trim();return `${name?name+'さん\n\n':''}${$('gsmMessage').value.trim()}\n\n席番号：${seatNo}\n参加リンク：${roomUrl()}\n\nこの席番号で参加してください。`}
$('gsmGmail').onclick=()=>{const email=$('gsmEmail').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){alert('Gmailアドレスを正しく入力してください');return}remember(email);const sub=`【SHOO KING II】ゲーム招待・席番号 ${$('gsmSeat').value.trim()}`;window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(sub)}&body=${encodeURIComponent(body())}`,'_blank','noopener')};
$('gsmCopy').onclick=async()=>{try{await navigator.clipboard.writeText(body());alert('招待文をコピーしました')}catch{prompt('この招待文をコピーしてください',body())}};$('gsmNewSeat').onclick=()=>{$('gsmSeat').value=seat()};$('gsmClose').onclick=()=>modal.classList.remove('open');modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')})}
function addButton(){build();if(document.getElementById('gmailSeatInviteButton'))return;const b=document.createElement('button');b.id='gmailSeatInviteButton';b.type='button';b.textContent='📧 席番号つき招待';b.onclick=()=>document.getElementById(MODAL).classList.add('open');document.body.appendChild(b)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addButton);else addButton();window.addEventListener('load',addButton);
})();