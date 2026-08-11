(()=>{
'use strict';
// Legacy cache-coherence logic is intentionally disabled.
// Older versions treated the current login UI (#shooLoginFrame) as stale,
// cleared caches, updated the service worker, and called location.replace().
// That could trap the app in a reload loop. Current cache/update behavior is
// handled only by sw.js; this file remains as a harmless compatibility stub
// for old HTML that may still reference it.
window.__SHOOKING_CACHE_COHERENCE_DISABLED__='v1-no-reload';
})();
