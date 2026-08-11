(function(){
  'use strict';
  function company(){try{return localStorage.getItem('cl_company_name')||'Mi comercio'}catch(e){return'Mi comercio'}}
  function role(){try{return localStorage.getItem('cl_user_role')==='cashier'?'Cajero':'Propietario'}catch(e){return'Propietario'}}
  function dashboardWelcome(name){
    var main=document.querySelector('.mainContent');if(!main)return;
    var h=Array.from(main.querySelectorAll('.pagehead h1')).find(function(x){return (x.textContent||'').trim()==='Inicio'||x.dataset.clWelcome==='1'});if(!h)return;
    var head=h.closest('.pagehead');if(!head)return;
    h.dataset.clWelcome='1';h.textContent='Bienvenido '+name;
    var wrap=h.parentElement;if(!wrap)return;
    var eye=wrap.querySelector('.eyebrow');if(eye)eye.style.display='none';
    var p=wrap.querySelector('p.muted');if(p){p.textContent='Buenas ventas';p.style.display='block'}
  }
  function run(){
    var name=company();
    document.querySelectorAll('.companyPill').forEach(function(el){el.innerHTML='<i></i>'+name+' · '+role()});
    document.querySelectorAll('.eyebrow').forEach(function(el){if((el.textContent||'').trim().toUpperCase()==='LA ECONÓMICA')el.textContent=name.toUpperCase()});
    dashboardWelcome(name);
    document.querySelectorAll('button.logout').forEach(function(btn){if(btn.dataset.tenantLogout)return;btn.dataset.tenantLogout='1';btn.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();if(window.ComercioLlenoAuth&&window.ComercioLlenoAuth.logout)window.ComercioLlenoAuth.logout()},true)});
  }
  run();setInterval(run,600);
})();
