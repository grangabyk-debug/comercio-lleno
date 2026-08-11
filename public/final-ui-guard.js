(function(){
'use strict';
var scheduled=false;
function norm(x){return (x&&x.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
function removeStock(){
  document.querySelectorAll('.sidebar button').forEach(function(b){
    var t=norm(b);
    if(t==='stock'||t.endsWith(' stock')) b.remove();
  });
  document.querySelectorAll('.cl-inv-view').forEach(function(v){
    var h=v.querySelector('h1');
    if(h&&norm(h)==='stock') v.remove();
  });
}
function cleanOverlays(){
  var overlays=Array.from(document.querySelectorAll('.cl-ap-view,.cl-inv-view,.rs-view')).filter(function(el){return el.isConnected});
  if(overlays.length>1){for(var i=0;i<overlays.length-1;i++)overlays[i].remove()}
}
function constrain(){
  var main=document.querySelector('.mainContent');
  if(main){main.style.minWidth='0';main.style.maxWidth='100%';main.style.overflowX='hidden'}
  document.documentElement.style.overflowX='hidden';
  document.body.style.overflowX='hidden';
}
function run(){scheduled=false;removeStock();cleanOverlays();constrain()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(run)}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('resize',schedule,{passive:true});
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.sidebar button');if(!b)return;setTimeout(schedule,0)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
setTimeout(run,300);setTimeout(run,1200);
})();