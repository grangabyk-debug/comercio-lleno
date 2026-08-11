(function(){
'use strict';
var U='https://wtcntclzcubkbtcsqkzc.supabase.co',K='sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb';
var nativeFetch=window.fetch.bind(window),refreshing=null;
function get(k){try{return localStorage.getItem(k)||''}catch(e){return''}}
function set(k,v){try{localStorage.setItem(k,v||'')}catch(e){}}
async function refresh(){
  if(refreshing)return refreshing;
  var rt=get('cl_refresh_token');
  if(!rt)throw new Error('NO_REFRESH_TOKEN');
  refreshing=nativeFetch(U+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:rt})}).then(async function(r){
    var d={};try{d=await r.json()}catch(e){}
    if(!r.ok||!d.access_token)throw new Error('REFRESH_FAILED');
    set('cl_access_token',d.access_token);if(d.refresh_token)set('cl_refresh_token',d.refresh_token);
    window.dispatchEvent(new CustomEvent('cl-session-refreshed'));
    return d.access_token;
  }).finally(function(){refreshing=null});
  return refreshing;
}
window.ComercioLlenoSession={refresh:refresh};
window.fetch=async function(input,init){
  var url=typeof input==='string'?input:(input&&input.url)||'';
  var isSupabaseRest=url.indexOf(U+'/rest/v1/')===0;
  if(!isSupabaseRest)return nativeFetch(input,init);
  var opts=Object.assign({},init||{}),headers=new Headers(opts.headers||(input&&input.headers)||{}),token=get('cl_access_token');
  if(token)headers.set('Authorization','Bearer '+token);if(!headers.has('apikey'))headers.set('apikey',K);opts.headers=headers;
  var res=await nativeFetch(input,opts);
  if(res.status!==401)return res;
  try{var nt=await refresh();headers.set('Authorization','Bearer '+nt);opts.headers=headers;return await nativeFetch(input,opts)}catch(e){return res}
};
if(get('cl_refresh_token'))setTimeout(function(){refresh().catch(function(){})},50);
})();