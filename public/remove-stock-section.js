(function(){
'use strict';
function norm(s){return String(s||'').replace(/\s+/g,' ').trim().toLowerCase()}
function removeStockEntry(){
  var sidebar=document.querySelector('.sidebar');if(!sidebar)return;
  Array.from(sidebar.querySelectorAll('button,a,[role="button"],li,div')).forEach(function(el){
    var t=norm(el.textContent);
    if(t!=='stock')return;
    var target=el.closest('button,a,[role="button"],li')||el;
    if(target&&sidebar.contains(target))target.remove();
  });
  var walker=document.createTreeWalker(sidebar,NodeFilter.SHOW_TEXT);var nodes=[],n;
  while(n=walker.nextNode()){if(norm(n.nodeValue)==='stock')nodes.push(n)}
  nodes.forEach(function(txt){var el=txt.parentElement;if(!el)return;var target=el.closest('button,a,[role="button"],li')||el;if(target&&sidebar.contains(target))target.remove()});
}
function closeStockView(){
  document.querySelectorAll('.cl-inv-view,.mainContent').forEach(function(v){
    var h=v.querySelector&&v.querySelector('h1');
    if(h&&norm(h.textContent)==='stock'&&v.classList.contains('cl-inv-view'))v.remove();
  });
}
function goProducts(){var sidebar=document.querySelector('.sidebar');if(!sidebar)return;var btn=Array.from(sidebar.querySelectorAll('button,a,[role="button"]')).find(function(b){var t=norm(b.textContent);return t==='productos'||t.endsWith(' productos')});if(btn)btn.click()}
function cleanup(){removeStockEntry();closeStockView()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup);else cleanup();
var scheduled=false;new MutationObserver(function(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;cleanup()})}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.alertCard');if(a&&norm(a.textContent).includes('stock bajo')){e.preventDefault();e.stopImmediatePropagation();goProducts()}},true);
setTimeout(cleanup,250);setTimeout(cleanup,1000);setTimeout(cleanup,2500);
})();