(function(){
  'use strict';
  function company(){try{return localStorage.getItem('cl_company_name')||'Mi comercio'}catch(e){return'Mi comercio'}}
  function role(){try{return localStorage.getItem('cl_user_role')==='cashier'?'Cajero':'Propietario'}catch(e){return'Propietario'}}
  function run(){
    var name=company();
    document.querySelectorAll('.companyPill').forEach(function(el){el.innerHTML='<i></i>'+name+' · '+role()});
    document.querySelectorAll('.eyebrow').forEach(function(el){if((el.textContent||'').trim().toUpperCase()==='LA ECONÓMICA')el.textContent=name.toUpperCase()});
    document.querySelectorAll('button.logout').forEach(function(btn){if(btn.dataset.tenantLogout)return;btn.dataset.tenantLogout='1';btn.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();if(window.ComercioLlenoAuth&&window.ComercioLlenoAuth.logout)window.ComercioLlenoAuth.logout()},true)});
  }
  run();setInterval(run,600);
})();
