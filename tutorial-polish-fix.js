(()=>{
'use strict';
const VERSION='tutorial-polish-v2-lite';
let fakeMouse=null,followFrame=0,root=null;
const style=document.createElement('style');
style.textContent=`
#nyandFakeMouseV3{position:fixed;left:0;top:0;z-index:2147483646;display:none;align-items:center;gap:5px;pointer-events:none;transform:translate(-8px,-8px);filter:drop-shadow(0 4px 8px rgba(0,0,0,.68))}#nyandFakeMouseV3.show{display:flex}.nyandFakePointer{display:block;font-size:32px;line-height:1;color:#fff;transform:rotate(42deg);text-shadow:0 0 8px #38bdf8}.nyandFakeLabel{padding:5px 9px;border:1px solid #67e8f9;border-radius:999px;background:rgba(2,6,23,.95);color:#e0faff;font-size:11px;font-weight:900;white-space:nowrap}.nyandFakeClick{position:absolute;left:4px;top:3px;width:22px;height:22px;border:2px solid #facc15;border-radius:50%;animation:nyandMouseClick 1.2s ease-out infinite}#nyandTutorialV2.nyand-start-pointer .nyand-v2-target{outline:none!important;box-shadow:none!important}@keyframes nyandMouseClick{0%{opacity:0;transform:scale(.3)}25%{opacity:1}100%{opacity:0;transform:scale(1.35)}}@media(prefers-reduced-motion:reduce){.nyandFakeClick{animation:none}}
`;
document.head.appendChild(style);
function ensureMouse(){if(fakeMouse)return fakeMouse;fakeMouse=document.createElement('div');fakeMouse.id='nyandFakeMouseV3';fakeMouse.innerHTML='<span class="nyandFakePointer">➤</span><span class="nyandFakeLabel">🐱 NyanD</span><span class="nyandFakeClick"></span>';document.body.appendChild(fakeMouse);return fakeMouse}
function visibleStartButton(){for(const selector of ['button[onclick*="openStageSelect"]','button[onclick*="startGame"]','button[data-action="start"]','#startButton']){const el=document.querySelector(selector);if(el&&el.offsetParent!==null)return el}return null}
function stop(){cancelAnimationFrame(followFrame);followFrame=0;fakeMouse?.classList.remove('show');root?.classList.remove('nyand-start-pointer')}
function follow(){if(!root?.classList.contains('show')||document.getElementById('nyandTitleV2')?.textContent!=='ゲーム開始'){stop();return}const target=visibleStartButton(),mouse=ensureMouse();if(target){target.classList.remove('nyand-v2-target');root.classList.add('nyand-start-pointer');const r=target.getBoundingClientRect();mouse.style.left=`${Math.max(8,Math.min(innerWidth-116,r.left+r.width*.58))}px`;mouse.style.top=`${Math.max(8,Math.min(innerHeight-54,r.top+r.height*.48))}px`;mouse.classList.add('show')}else mouse.classList.remove('show');followFrame=requestAnimationFrame(follow)}
function onStep(e){if(e.detail?.title==='ゲーム開始'){stop();follow()}else stop()}
function install(){ensureMouse();root=document.getElementById('nyandTutorialV2');if(!root){requestAnimationFrame(install);return}root.addEventListener('nyand-step-change',onStep);root.addEventListener('nyand-close',stop);window.__shookingTutorialPolishFix=VERSION}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();