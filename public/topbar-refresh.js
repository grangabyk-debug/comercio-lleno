(function(){
'use strict';
function css(){if(document.getElementById('clTopRefreshCss'))return;var s=document.createElement('style');s.id='clTopRefreshCss';s.textContent=`
.cl-refresh-btn{width:34px!important;height:34px!important;min-width:34px!important;padding:0!important;border:1px solid #d8e0e9!important;border-radius:50%!important;background:#fff!important;color:#334155!important;display:inline-grid!important;place-items:center!important;font-size:17px!important;font-weight:800!important;cursor:pointer!important;line-height:1!important;transition:.15s!important}
.cl-refresh-btn:hover{background:#f3f6f9!important;transform:rotate(25deg)}
.dark .cl-refresh-btn{background:#111827!important;color:#f8fafc!important;border-color:#334155!important}
`;
document.head.appendChild(s)}
function hideHomeSale(){var h=Array.from(document.querySelectorAll('.mainContent h1')).find(function(x){return (x.textContent||'').trim()==='Inicio'});if(!h)return;var head=h.closest('.pagehead');if(!head)return;Array.from(head.querySelectorAll('button')).forEach(function(b){if(/nueva venta/i.test(b.textContent||''))b.style.display='none'})}
function addReload(){var actions=document.querySelector('.headerActions');if(!actions||actions.querySelector('.cl-refresh-btn'))return;var b=document.createElement('button');b.className='cl-refresh-btn';b.type='button';b.title='Actualizar';b.setAttribute('aria-label','Actualizar página');b.textContent='↻';b.onclick=function(){location.reload()};var theme=actions.querySelector('.themeToggle');if(theme)actions.insertBefore(b,theme);else actions.appendChild(b)}
function run(){css();hideHomeSale();addReload()}
run();new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
})();