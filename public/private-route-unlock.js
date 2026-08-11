(function(){
'use strict';
var path=location.pathname.replace(/\/+$/,'')||'/',params=new URLSearchParams(location.search);
if(!(path==='/'&&params.get('app')==='1'))return;
var URL='https://wtcntclzcubkbtcsqkzc.supabase.co';
var KEY='sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb';
function unlock(){document.documentElement.classList.remove('cl-private-locked');var s=document.getElementById('cl-private-lock-style');if(s)s.remove()}
function fail(){try{localStorage.removeItem('cl_access_token');localStorage.removeItem('cl_refresh_token')}catch(e){}location.replace('/login')}
var token='';try{token=localStorage.getItem('cl_access_token')||''}catch(e){}
if(!token){fail();return}
fetch(URL+'/rest/v1/profiles?select=id,company_id,role&limit=1',{headers:{apikey:KEY,Authorization:'Bearer '+token}})
.then(async function(r){if(!r.ok)throw new Error('unauthorized');var rows=await r.json();if(!Array.isArray(rows)||!rows.length)throw new Error('no-profile');unlock()})
.catch(fail);
})();
