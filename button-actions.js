(()=>{
'use strict';
const VERSION='button-actions-v2-light-delegation';
const CURRENT_KEY='shooking2_current_account';
const ATTRS={onclick:'click',onchange:'change',oninput:'input'};
const DATA={click:'shooClickCode',change:'shooChangeCode',input:'shooInputCode'};
const propertyHandlers=new WeakMap();

function notify(message){
 try{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:'BUTTON ACTION ERROR',message,type:'error',duration:6200});
  else console.error(message);
 }catch{}
}

function splitArguments(source){
 const text=String(source||'').trim();
 if(!text)return [];
 const result=[];let quote='',depth=0,start=0,escaped=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(escaped){escaped=false;continue}
  if(quote){if(ch==='\\'){escaped=true;continue}if(ch===quote)quote='';continue}
  if(ch==='"'||ch==="'"){quote=ch;continue}
  if(ch==='('||ch==='['||ch==='{')depth++;
  else if(ch===')'||ch===']'||ch==='}')depth--;
  else if(ch===','&&depth===0){result.push(text.slice(start,i).trim());start=i+1}
 }
 result.push(text.slice(start).trim());return result;
}

function parseArgument(token,event,element){
 const value=String(token||'').trim();
 if(value==='event')return event;
 if(value==='this')return element;
 if(value==='true')return true;
 if(value==='false')return false;
 if(value==='null')return null;
 if(value==='undefined')return undefined;
 if(/^[-+]?\d+(?:\.\d+)?$/.test(value))return Number(value);
 if((value.startsWith("'")&&value.endsWith("'"))||(value.startsWith('"')&&value.endsWith('"'))){
  return value.slice(1,-1).replace(/\\(['"\\nrt])/g,(_,ch)=>({n:'\n',r:'\r',t:'\t'}[ch]??ch));
 }
 throw new Error(`未対応の引数: ${value}`);
}

function resolvePath(path){
 const names=String(path||'').replace(/^window\./,'').split('.').filter(Boolean);
 let owner=window,value=window;
 for(const name of names){owner=value;value=value?.[name]}
 return {owner,value};
}

function executeStatement(statement,event,element){
 const code=String(statement||'').trim().replace(/^return\s+/,'').replace(/;$/,'').trim();
 if(!code||code==='true'||code==='false')return;
 let match=code.match(/^document\.getElementById\((['"])(.*?)\1\)\.remove\(\)$/);
 if(match){document.getElementById(match[2])?.remove();return}
 match=code.match(/^(?:window\.)?location\.href\s*=\s*(['"])(.*?)\1$/);
 if(match){location.href=match[2];return}
 match=code.match(/^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\((.*)\)$/s);
 if(!match)throw new Error(`未対応の処理: ${code}`);
 const {owner,value}=resolvePath(match[1]);
 if(typeof value!=='function')throw new Error(`${match[1]} が読み込まれていません`);
 const args=splitArguments(match[2]).map(token=>parseArgument(token,event,element));
 return value.apply(owner===window?window:owner,args);
}

function runCode(source,event,element){
 const statements=[];const text=String(source||'');let quote='',depth=0,start=0,escaped=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(escaped){escaped=false;continue}
  if(quote){if(ch==='\\'){escaped=true;continue}if(ch===quote)quote='';continue}
  if(ch==='"'||ch==="'"){quote=ch;continue}
  if(ch==='('||ch==='['||ch==='{')depth++;
  else if(ch===')'||ch===']'||ch==='}')depth--;
  else if(ch===';'&&depth===0){statements.push(text.slice(start,i));start=i+1}
 }
 statements.push(text.slice(start));let result;
 for(const statement of statements)result=executeStatement(statement,event,element);
 return result;
}

function storePropertyHandler(element,eventName,handler){
 let map=propertyHandlers.get(element);
 if(!map){map={};propertyHandlers.set(element,map)}
 map[eventName]=handler;
}

function migrateElement(element){
 if(!(element instanceof Element))return;
 for(const [attribute,eventName] of Object.entries(ATTRS)){
  const code=element.getAttribute(attribute);
  if(code){element.dataset[DATA[eventName]]=code;element.removeAttribute(attribute)}
 }
 for(const [eventName,propertyName] of [['click','onclick'],['change','onchange'],['input','oninput']]){
  const handler=element[propertyName];
  if(typeof handler==='function'){
   try{element[propertyName]=null}catch{}
   storePropertyHandler(element,eventName,handler);
  }
 }
}

function migrateTree(root){
 if(root instanceof Element)migrateElement(root);
 root.querySelectorAll?.('[onclick],[onchange],[oninput],button,input,select,textarea,.stageNode,.choiceCard').forEach(migrateElement);
}

function findActionElement(target,eventName){
 if(!(target instanceof Element))return null;
 const dataName=DATA[eventName];
 let node=eventName==='click'?target.closest('[data-shoo-click-code],button,[role="button"],.stageNode,.choiceCard'):target;
 while(node&&node!==document.documentElement){
  if(node.dataset?.[dataName]||propertyHandlers.get(node)?.[eventName])return node;
  if(eventName!=='click')break;
  node=node.parentElement;
 }
 return null;
}

function dispatch(eventName,event){
 const element=findActionElement(event.target,eventName);
 if(!element)return;
 const code=element.dataset?.[DATA[eventName]];
 const handler=propertyHandlers.get(element)?.[eventName];
 try{
  let result;
  if(code)result=runCode(code,event,element);
  if(typeof handler==='function')result=handler.call(element,event);
  if(result===false){event.preventDefault();event.stopPropagation()}
 }catch(error){
  console.error('Action failed',error);
  notify(`「${(element.textContent||element.id||'操作').trim().slice(0,28)}」を実行できません。\n${error.message}`);
 }
}

function showLoginImmediately(){
 let account=null;
 try{account=JSON.parse(localStorage.getItem(CURRENT_KEY)||'null')}catch{}
 if(account)return;
 const login=document.getElementById('loginScreen');
 if(!login)return;
 document.querySelectorAll('.screen').forEach(screen=>screen.classList.add('hidden'));
 login.classList.remove('hidden');
 login.style.removeProperty('display');
 document.body.classList.remove('game-playing');
 document.body.classList.add('game-menu');
}

function install(){
 migrateTree(document);
 document.addEventListener('click',event=>dispatch('click',event),false);
 document.addEventListener('change',event=>dispatch('change',event),false);
 document.addEventListener('input',event=>dispatch('input',event),false);
 const observer=new MutationObserver(records=>{
  for(const record of records){
   if(record.type==='attributes')migrateElement(record.target);
   else record.addedNodes.forEach(node=>{if(node instanceof Element)migrateTree(node)});
  }
 });
 observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['onclick','onchange','oninput']});
 showLoginImmediately();
 window.__shookingButtonActions=VERSION;
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();