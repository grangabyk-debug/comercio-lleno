(function(){
  'use strict';
  var SUPABASE_URL='https://wtcntclzcubkbtcsqkzc.supabase.co';
  var SUPABASE_KEY='sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb';
  var COMPANY='f6b2992b-2fe8-47d6-be29-620468c059dd';
  var targetKey='cl_products';
  fetch(SUPABASE_URL+'/rest/v1/rpc/get_demo_products',{headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY}})
    .then(function(r){if(!r.ok)throw new Error('catalog');return r.json();})
    .then(function(rows){
      if(!Array.isArray(rows)||!rows.length)return;
      var local=[];try{local=JSON.parse(localStorage.getItem(targetKey)||'[]');}catch(e){}
      localStorage.setItem(targetKey,JSON.stringify(rows));
      localStorage.setItem('cl_products_updated_at',new Date().toISOString());
      if(local.length!==rows.length){location.reload();}
    })
    .catch(function(){/* La app puede seguir funcionando con la copia local. */});
})();
