(()=>{
'use strict';
const KEY='shooking2_invite_recipients';
const MODAL='gmailSeatInviteModal';
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function saved(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function remember(email){const list=[email,...saved().filter(x=>x!==email)].slice(0,12);localStorage.setItem(KEY,JSON.stringify(list))}
function seat(){const n=Number(localStorage.getItem('shooking2_invite_seat_seq')||0)+1;localStorage.setItem('shooking2_invite_seat_seq',String(n));return `A-${String(n).padStart(2,'0')}`}
function roomUrl(){const u=new URL(location.href);u.searchParams.set('invite','1');return u.href}
function build(){if(document.getElementById(MODAL))return;const list=saved();const modal=document.createElement('div');modal.id=MODAL;modal.innerHTML=`<div class="gsmCard"><h2>📧 席番号つき招待</h2><label>招待先Gmail<input id="gsmEmail" type="email" list="gsmEmails" value="mysk97104@gmail.com" placeholder="example@gmail.com"></label><datalist id="gsmEmails">${list.map(x=>`<option value="${esc(x)}">`).join('')}</datalist><label>席番号<input id="gsmSeat" value="${seat()}"></label><label>名前<input id="gsmName" placeholder="招待する相手の名前（省略可）"></label><label>メッセージ<textarea id="gsmMessage">SHOO KING IIへ招待します。下のリンクから参加してください。</textarea></label><div class="gsmGrid"><button class="gsmSend" id="gsmGmail">Gmailで招待を作成</button><button id="gsmCopy">招待文をコピー</button><button id="gsmNewSeat">新しい席番号</button><button class="gsmClose" id="gsmClose">閉じる</button></div><div class="gsmSmall">Gmailの作成画面が開きます。最後の送信ボタンは自分で押してください。宛先履歴はこの端末内だけに保存されます。</div></div>`;document.body.appendChild(modal);
const $=id=>document.getElementById(id);function body(){const name=$('gsmName').value.trim();const seatNo=$('gsmSeat').value.trim();return `${name?name+'さん\n\n':''}${$('gsmMessage').value.trim()}\n\n席番号：${seatNo}\n参加リンク：${roomUrl()}\n\nこの席番号で参加してください。`}
$('gsmGmail').onclick=()=>{const email=$('gsmEmail').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){alert('Gmailアドレスを正しく入力してください');return}remember(email);const sub=`【SHOO KING II】ゲーム招待・席番号 ${$('gsmSeat').value.trim()}`;window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(sub)}&body=${encodeURIComponent(body())}`,'_blank','noopener')};
$('gsmCopy').onclick=async()=>{try{await navigator.clipboard.writeText(body());alert('招待文をコピーしました')}catch{prompt('この招待文をコピーしてください',body())}};$('gsmNewSeat').onclick=()=>{$('gsmSeat').value=seat()};$('gsmClose').onclick=()=>modal.classList.remove('open');modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')})}
function addButton(){build();if(document.getElementById('gmailSeatInviteButton'))return;const b=document.createElement('button');b.id='gmailSeatInviteButton';b.type='button';b.textContent='📧 席番号つき招待';b.onclick=()=>document.getElementById(MODAL).classList.add('open');document.body.appendChild(b)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addButton);else addButton();window.addEventListener('load',addButton);
})();
