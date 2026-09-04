(()=>{
'use strict';
const VERSION='deferred-runtime-v1';
if(window.__SHOOKING_DEFERRED_RUNTIME__)return;
window.__SHOOKING_DEFERRED_RUNTIME__=VERSION;

const BUILD='128-direct-launch';
const queue=[
  'hard-stages.js',
  'fixjs/hangar-fix.js',
  'online-pve.js',
  'multiplayer-sync.js',
  'fixjs/online-team-fix.js',
  'shared-enemy-sync.js',
  'plusjs/gacha-upgrade.js',
  'fixjs/gacha-current-filter.js',
  'plusjs/gacha-11.js',
  'plusjs/current-ui-suite.js',
  'plusjs/current-ui-extra.js',
  'fixjs/home-menu-restore.js',
  'plusjs/error-voice-assist.js',
  'plusjs/bug-report-center.js'
];
let index=0;
function already(path){
  const base=path.split('/').pop();
  return [...document.scripts].some(s=>{try{return new URL(s.src,location.href).pathname.endsWith('/'+base)}catch(e){return false}});
}
function next(){
  if(index>=queue.length)return;
  const path=queue[index++];
  if(already(path)){schedule();return;}
  const script=document.createElement('script');
  script.src=`./${path}?v=${BUILD}`;
  script.async=false;
  script.onload=script.onerror=schedule;
  document.body.appendChild(script);
}
function schedule(){
  if('requestIdleCallback' in window)requestIdleCallback(next,{timeout:650});
  else setTimeout(next,90);
}
function begin(){setTimeout(schedule,650)}
if(document.readyState==='complete')begin();
else window.addEventListener('load',begin,{once:true});
})();
