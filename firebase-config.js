(()=>{
'use strict';
const KEY='shooking2_firebase_config';
const firebaseConfig={
  apiKey:'AIzaSyBYZV0hLoXXVCP72LgAaiuSVARDIrH8R58',
  authDomain:'shookinggeme.firebaseapp.com',
  projectId:'shookinggeme',
  storageBucket:'shookinggeme.firebasestorage.app',
  messagingSenderId:'771430139655',
  appId:'1:771430139655:web:0264de90b456e79a9ce7a2'
};
try{
  localStorage.setItem(KEY,JSON.stringify(firebaseConfig));
  window.SHOO_KING_FIREBASE_CONFIG=Object.freeze({...firebaseConfig});
}catch(error){
  console.error('Firebase設定の保存に失敗しました',error);
}
})();
