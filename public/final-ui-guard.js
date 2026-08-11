(function(){
'use strict';
var scheduled=false;
function norm(x){return (x&&x.textContent||'').replace(/\s+/g,' ').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function isLabel(el,label){var t=norm(el),l=norm({textContent:label});return t===l||t.endsWith(' '+l)}
function cleanSidebar(){
  var sb=document.querySelector('.sidebar');if(!sb)return;
  sb.querySelectorAll('.clv2-group[data-group="functions"],.cl-menu-group').forEach(function(x){
    ['Productos','Compras','Proveedores'].forEach(function(name){var b=Array.from(x.querySelectorAll('button')).find(function(el){return isLabel(el,name)});if(b)sb.insertBefore(b,x)});
    x.remove();
  });
  sb.querySelectorAll('button,a,div').forEach(function(el){
    var t=norm(el);
    if(t==='stock'||t==='reposicion'||t==='funciones'){
      if(el.matches('button,a')||el.classList.contains('clv2-group'))el.remove();
    }
  });
  ['Productos','Compras','Proveedores'].forEach(function(name){
    var all=Array.from(sb.querySelectorAll('button')).filter(function(el){return isLabel(el,name)});
    if(!all.length)return;
    var keep=all[0];
    if(keep.parentElement!==sb)sb.appendChild(keep);
    for(var i=1;i<all.length;i++)all[i].remove();
  });
}
function cleanOverlays(){
  document.querySelectorAll('.cl-inv-view').forEach(function(v){var h=v.querySelector('h1');if(h&&(norm(h)==='stock'||norm(h)==='reposicion'))v.remove()});
  var overlays=Array.from(document.querySelectorAll('.cl-ap-view,.cl-inv-view,.rs-view')).filter(function(el){return el.isConnected});
  if(overlays.length>1){for(var i=0;i<overlays.length-1;i++)overlays[i].remove()}
}
function constrain(){
  var main=document.querySelector('.mainContent');
  if(main){main.style.minWidth='0';main.style.maxWidth='100%';main.style.overflowX='hidden'}
  document.documentElement.style.overflowX='hidden';document.body.style.overflowX='hidden';
}
function run(){scheduled=false;cleanSidebar();cleanOverlays();constrain()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(run)}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('resize',schedule,{passive:true});
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.sidebar button');if(!b)return;setTimeout(schedule,0)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
setTimeout(run,100);setTimeout(run,500);setTimeout(run,1500);
})();