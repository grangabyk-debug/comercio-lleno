(function(){
'use strict';
function norm(s){return String(s||'').replace(/\s+/g,' ').trim().toLowerCase()}
function removeStockButtons(){
  document.querySelectorAll('.sidebar button').forEach(function(b){
    var t=norm(b.textContent);
    if(t==='stock'||t.endsWith(' stock')) b.remove();
  });
}
function closeStockView(){
  document.querySelectorAll('.cl-inv-view').forEach(function(v){
    var h=v.querySelector('h1');
    if(h&&norm(h.textContent)==='stock') v.remove();
  });
}
function goProducts(){
  var btn=Array.from(document.querySelectorAll('.sidebar button')).find(function(b){var t=norm(b.textContent);return t==='productos'||t.endsWith(' productos')});
  if(btn) btn.click();
}
function cleanup(){removeStockButtons();closeStockView()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup);else cleanup();
new MutationObserver(function(){requestAnimationFrame(cleanup)}).observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',function(e){
  var a=e.target.closest('.alertCard');
  if(a&&norm(a.textContent).includes('stock bajo')){e.preventDefault();e.stopImmediatePropagation();goProducts()}
},true);
})();
