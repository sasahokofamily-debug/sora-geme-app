(()=>{
  "use strict";
  const VERSION="boot-resilience-v1";
  const MAX_BLOCK_MS=3200;
  window.__shookingBootResilience=VERSION;

  // Canonicalize stale query-string SW registrations before window.load.
  try{
    const container=navigator.serviceWorker;
    if(container&&typeof container.register==="function"&&!container.register.__shookingCanonical){
      const original=container.register.bind(container);
      const wrapped=function(scriptURL,options={}){
        try{
          const url=new URL(String(scriptURL),location.href);
          if(url.origin===location.origin&&/\/sw\.js$/.test(url.pathname)){
            url.search="";
            return original(url.href,{...options,updateViaCache:"none"});
          }
        }catch(e){}
        return original(scriptURL,options);
      };
      wrapped.__shookingCanonical=true;
      try{container.register=wrapped;}catch(e){}
    }
  }catch(e){}

  const timers=new WeakMap();
  function disarm(el){
    const timer=timers.get(el);
    if(timer)clearTimeout(timer);
    timers.delete(el);
  }
  function unblock(el){
    if(!el)return;
    disarm(el);
    if(el.id==="pageLoadingOverlay"){
      el.classList.remove("visible");
      el.setAttribute("aria-busy","false");
    }else if(el.id==="shookingStartupLoader"){
      el.classList.add("is-ready");
      setTimeout(()=>el.remove(),80);
    }
    document.documentElement.classList.remove("shooking-loading");
  }
  function arm(el){
    if(!el)return;
    disarm(el);
    timers.set(el,setTimeout(()=>unblock(el),MAX_BLOCK_MS));
  }
  function scan(){
    const page=document.getElementById("pageLoadingOverlay");
    if(page?.classList.contains("visible"))arm(page);
    const startup=document.getElementById("shookingStartupLoader");
    if(startup)arm(startup);
  }

  const observer=new MutationObserver(mutations=>{
    for(const mutation of mutations){
      if(mutation.type==="attributes"){
        const el=mutation.target;
        if(el?.id==="pageLoadingOverlay"&&el.classList.contains("visible"))arm(el);
      }
    }
    scan();
  });

  function install(){
    if(document.body)observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
    scan();
    setTimeout(scan,250);
    setTimeout(()=>{
      unblock(document.getElementById("pageLoadingOverlay"));
      unblock(document.getElementById("shookingStartupLoader"));
    },5000);
  }

  window.addEventListener("pageshow",()=>{
    unblock(document.getElementById("pageLoadingOverlay"));
    scan();
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
})();
