(function(){
'use strict';
var U='https://wtcntclzcubkbtcsqkzc.supabase.co',K='sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb';
function token(){return localStorage.getItem('cl_access_token')||''}
function uid(){try{var t=token().split('.')[1];if(!t)return'';var j=JSON.parse(atob(t.replace(/-/g,'+').replace(/_/g,'/')));return j.sub||''}catch(e){return''}}
async function sync(){var id=uid(),t=token();if(!id||!t)return;try{var r=await fetch(U+'/rest/v1/profiles?select=id,role,permissions,active,full_name,username&id=eq.'+encodeURIComponent(id),{headers:{apikey:K,Authorization:'Bearer '+t}}),rows=await r.json(),p=rows&&rows[0];if(!p)return;localStorage.setItem('cl_user_id',p.id);localStorage.setItem('cl_user_role',p.role||'cashier');localStorage.setItem('cl_user_permissions',JSON.stringify(p.permissions||{}));localStorage.setItem('cl_user_active',p.active===false?'0':'1')}catch(e){}}
sync();setInterval(sync,15000);
})();