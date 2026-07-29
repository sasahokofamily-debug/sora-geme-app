(()=>{
'use strict';
const VERSION='button-actions-v1-no-inline-handlers';
const ATTR_EVENTS={onclick:'click',onchange:'change',oninput:'input'};
const migratedPropertyHandlers=new WeakMap();
let scanQueued=false;

function notify(message,type='error'){
 try{
  if(typeof window.showAppNotice==='function')window.showAppNotice({title:type==='error'?'BUTTON ACTION ERROR':'BUTTON ACTION',message,type,duration:6500});
  else console[type==='error'?'error':'log'](message);
 }catch{}
}

function splitArguments(source){
 const text=String(source||'').trim();
 if(!text)return [];
 const parts=[];
 let quote='',depth=0,start=0,escaped=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(escaped){escaped=false;continue}
  if(quote){if(ch==='\\'){escaped=true;continue}if(ch===quote)quote='';continue}
  if(ch==='"'||ch==="'"){quote=ch;continue}
  if(ch==='('||ch==='['||ch==='{')depth++;
  else if(ch===')'||ch===']'||ch==='}')depth--;
  else if(ch===','&&depth===0){parts.push(text.slice(start,i).trim());start=i+1}
 }
 parts.push(text.slice(start).trim());
 return parts;
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
  const body=value.slice(1,-1);
  return body.replace(/\\(['"\\nrt])/g,(_,ch)=>({n:'\n',r:'\r',t:'\t'}[ch]??ch));
 }
 throw new Error(`未対応の引数: ${value}`);
}

function resolvePath(path){
 const names=String(path||'').split('.').filter(Boolean);
 let owner=window;
 let value=window;
 for(const name of names){owner=value;value=value?.[name]}
 return {owner,value};
}

function executeStatement(statement,event,element){
 const code=String(statement||'').trim().replace(/^return\s+/,'').replace(/;$/,'').trim();
 if(!code||code==='false'||code==='true')return;
 let match=code.match(/^document\.getElementById\((['"])(.*?)\1\)\.remove\(\)$/);
 if(match){document.getElementById(match[2])?.remove();return}
 match=code.match(/^(?:window\.)?location\.href\s*=\s*(['"])(.*?)\1$/);
 if(match){window.location.href=match[2];return}
 match=code.match(/^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\((.*)\)$/s);
 if(!match)throw new Error(`未対応の処理: ${code}`);
 const {owner,value}=resolvePath(match[1]);
 if(typeof value!=='function')throw new Error(`${match[1]} がまだ読み込まれていません`);
 const args=splitArguments(match[2]).map(token=>parseArgument(token,event,element));
 return value.apply(owner===window?window:owner,args);
}

function runCode(code,event,element){
 const statements=[];
 let quote='',depth=0,start=0,escaped=false;
 const source=String(code||'');
 for(let i=0;i<source.length;i++){
  const ch=source[i];
  if(escaped){escaped=false;continue}
  if(quote){if(ch==='\\'){escaped=true;continue}if(ch===quote)quote='';continue}
  if(ch==='"'||ch==="'"){quote=ch;continue}
  if(ch==='('||ch==='['||ch==='{')depth++;
  else if(ch===')'||ch===']'||ch==='}')depth--;
  else if(ch===';'&&depth===0){statements.push(source.slice(start,i));start=i+1}
 }
 statements.push(source.slice(start));
 let result;
 for(const statement of statements)result=executeStatement(statement,event,element);
 return result;
}

function migrateAttribute(element,attribute,eventName){
 const code=element.getAttribute(attribute);
 if(!code)return;
 element.removeAttribute(attribute);
 element.dataset[`shoo${attribute.slice(2,3).toUpperCase()}${attribute.slice(3)}Migrated`]='1';
 element.addEventListener(eventName,event=>{
  try{
   const result=runCode(code,event,element);
   if(result===false){event.preventDefault();event.stopPropagation()}
  }catch(error){
   console.error('Button action failed:',code,error);
   notify(`「${(element.textContent||element.id||'ボタン').trim().slice(0,32)}」を実行できません。\n${error.message}`);
  }
 });
}

function migrateProperty(element,eventName,propertyName){
 const handler=element[propertyName];
 if(typeof handler!=='function')return;
 const known=migratedPropertyHandlers.get(element);
 if(known===handler)return;
 try{element[propertyName]=null}catch{return}
 const listener=function(event){
  try{return handler.call(element,event)}catch(error){console.error(`${propertyName} listener failed`,error);notify(`操作を実行できません。\n${error.message}`)}
 };
 element.addEventListener(eventName,listener);
 migratedPropertyHandlers.set(element,handler);
}

function migrateElement(element){
 if(!(element instanceof Element))return;
 for(const [attribute,eventName] of Object.entries(ATTR_EVENTS))if(element.hasAttribute(attribute))migrateAttribute(element,attribute,eventName);
 migrateProperty(element,'click','onclick');
 migrateProperty(element,'change','onchange');
 migrateProperty(element,'input','oninput');
}

function scan(root=document){
 if(root instanceof Element)migrateElement(root);
 root.querySelectorAll?.('[onclick],[onchange],[oninput],button,input,select,textarea,.stageNode,.choiceCard').forEach(migrateElement);
 window.__shookingButtonActions=VERSION;
}

function queueScan(root=document){
 if(scanQueued)return;scanQueued=true;
 requestAnimationFrame(()=>{scanQueued=false;scan(root)});
}

function install(){
 scan(document);
 const observer=new MutationObserver(records=>{
  for(const record of records){
   if(record.type==='attributes')migrateElement(record.target);
   record.addedNodes?.forEach(node=>{if(node instanceof Element)queueScan(node)});
  }
 });
 observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['onclick','onchange','oninput']});
 setInterval(()=>scan(document),1800);
 document.addEventListener('pointerup',event=>{
  const target=event.target.closest?.('button,[role="button"]');
  if(target&&!target.disabled)queueScan(target);
 },{passive:true,capture:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
