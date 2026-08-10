(function(){
  'use strict';
  var URL='https://wtcntclzcubkbtcsqkzc.supabase.co';
  var KEY='sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb';
  function sync(){var token='';try{token=localStorage.getItem('cl_access_token')||''}catch(e){}if(!token)return;fetch(URL+'/rest/v1/products?select=id,barcode,name,category,price,cost,stock&active=eq.true&order=name.asc',{headers:{apikey:KEY,Authorization:'Bearer '+token}}).then(function(r){if(!r.ok)throw new Error('catalog');return r.json()}).then(function(rows){if(!Array.isArray(rows))return;var old='';try{old=localStorage.getItem('cl_products')||''}catch(e){}var next=JSON.stringify(rows);localStorage.setItem('cl_products',next);localStorage.setItem('cl_products_updated_at',new Date().toISOString());if(old!==next)location.reload()}).catch(function(){})}
  sync();
})();
