(function(){
'use strict';
var reloading=false;
function css(){if(document.getElementById('clTopRefreshCss'))return;var s=document.createElement('style');s.id='clTopRefreshCss';s.textContent=`
.cl-refresh-btn{width:34px!important;height:34px!important;min-width:34px!important;padding:0!important;border:1px solid #d8e0e9!important;border-radius:50%!important;background:#fff!important;color:#334155!important;display:inline-grid!important;place-items:center!important;font-size:17px!important;font-weight:800!important;cursor:pointer!important;line-height:1!important;transition:.15s!important}
.cl-refresh-btn:hover{background:#f3f6f9!important;transform:rotate(25deg)}
.dark .cl-refresh-btn{background:#111827!important;color:#f8fafc!important;border-color:#334155!important}
`;
document.head.appendChild(s)}
function cajaButton(){return Array.from(document.querySelectorAll('.sidebar button')).find(function(b){var t=(b.textContent||'').trim().toLowerCase();return t.indexOf('caja')>=0&&t.indexOf('diaria')<0})}
function hideHomeSale(){var h=Array.from(document.querySelectorAll('.mainContent h1')).find(function(x){return (x.textContent||'').trim()==='Inicio'});if(!h)return;var head=h.closest('.pagehead');if(!head)return;Array.from(head.querySelectorAll('button')).forEach(function(b){if(/nueva venta/i.test(b.textContent||''))b.style.display='none'})}
function addReload(){var actions=document.querySelector('.headerActions');if(!actions||actions.querySelector('.cl-refresh-btn'))return;var b=document.createElement('button');b.className='cl-refresh-btn';b.type='button';b.title='Actualizar';b.setAttribute('aria-label','Actualizar página');b.textContent='↻';b.onclick=function(){location.reload()};var theme=actions.querySelector('.themeToggle');if(theme)actions.insertBefore(b,theme);else actions.appendChild(b)}
function restoreCaja(){if(sessionStorage.getItem('cl_restore_caja')!=='1')return;sessionStorage.removeItem('cl_restore_caja');sessionStorage.setItem('cl_reload_suppress_until',String(Date.now()+3500));var tries=0;var t=setInterval(function(){tries++;var b=cajaButton();if(b){clearInterval(t);b.click()}else if(tries>30)clearInterval(t)},60)}
function salesSig(raw){try{var a=JSON.parse(raw||'[]');if(!Array.isArray(a)||!a.length)return '0';return String(a.length)+'|'+String(a[0]&&a[0].id||'')+'|'+String(a[0]&&a[0].date||'')}catch(e){return '0'}}
var originalSetItem=localStorage.setItem.bind(localStorage);var lastSales=salesSig(localStorage.getItem('cl_sales'));
localStorage.setItem=function(k,v){originalSetItem(k,v);if(k!=='cl_sales')return;var next=salesSig(v);var changed=next!==lastSales;lastSales=next;if(!changed||reloading)return;if(Date.now()<Number(sessionStorage.getItem('cl_reload_suppress_until')||0))return;if(!document.querySelector('.cl-pos-pro'))return;reloading=true;sessionStorage.setItem('cl_restore_caja','1');setTimeout(function(){location.reload()},1050)};
function run(){css();hideHomeSale();addReload()}
run();restoreCaja();new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
})();