(function(){
'use strict';
var U='https://wtcntclzcubkbtcsqkzc.supabase.co',K='sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb',busy=false,lastCompany='';
function value(k){try{return localStorage.getItem(k)||''}catch(_){return''}}
function save(k,v){try{if(v==null||v==='')localStorage.removeItem(k);else localStorage.setItem(k,String(v))}catch(_){}}
async function load(){
  var companyId=value('cl_company_id'),token=value('cl_access_token');
  if(!companyId||!token||busy||(companyId===lastCompany&&value('cl_company_tax_id')))return;
  busy=true;
  try{
    var r=await fetch(U+'/rest/v1/companies?select=id,name,legal_name,tax_id&id=eq.'+encodeURIComponent(companyId)+'&limit=1',{headers:{apikey:K,Authorization:'Bearer '+token},cache:'no-store'});
    if(!r.ok)return;
    var rows=await r.json(),c=rows&&rows[0];if(!c)return;
    save('cl_company_name',c.name||'Mi comercio');
    save('cl_company_legal_name',c.legal_name||'');
    save('cl_company_tax_id',c.tax_id||'');
    lastCompany=companyId;
    window.dispatchEvent(new CustomEvent('cl:company-profile',{detail:{id:c.id,name:c.name,legal_name:c.legal_name,tax_id:c.tax_id}}));
  }catch(_){
  }finally{busy=false}
}
load();setInterval(load,15000);window.addEventListener('storage',load);window.addEventListener('focus',load);
})();
