(function(){
'use strict';
function text(el){return (el&&el.textContent||'').replace(/\s+/g,' ').trim()}
function isProducts(){var h=document.querySelector('.mainContent h1');return !!h&&text(h)==='Productos'}
function fixAdvancedButton(){var b=document.querySelector('[data-advanced-products]');if(!b)return;if(!isProducts())b.remove()}
function fixManager(){
  var modals=Array.from(document.querySelectorAll('.rs-modal'));
  modals.forEach(function(m){
    var h=m.querySelector('.rs-box h2');
    if(!h||text(h)!=='Gestión avanzada de productos')return;
    m.style.zIndex='2147482000';
    var box=m.querySelector('.rs-box');if(box){box.style.position='relative';box.style.maxHeight='82vh';box.style.overflow='hidden';box.style.display='flex';box.style.flexDirection='column'}
    var search=m.querySelector('[data-search]');if(search)search.style.flex='0 0 auto';
    var list=m.querySelector('[data-list]');if(list){list.style.flex='1 1 auto';list.style.minHeight='0';list.style.maxHeight='none';list.style.overflow='auto'}
    var close=m.querySelector('[data-c]');if(close)close.textContent='Cerrar';
  });
}
var queued=false;
function run(){queued=false;fixAdvancedButton();fixManager()}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
setTimeout(run,0);
})();