(function(){
'use strict';
function sync(){
  var root=document.querySelector('.cl-pos-pro');
  if(!root)return;
  var input=root.querySelector('[data-search]');
  var has=!!(input&&String(input.value||'').trim());
  root.classList.toggle('cl-searching',has);
}
function css(){
  if(document.getElementById('cl-pos-search-fix-css'))return;
  var s=document.createElement('style');
  s.id='cl-pos-search-fix-css';
  s.textContent='.cl-pos-pro .cl-pos-results{display:none}.cl-pos-pro.cl-searching .cl-pos-results{display:grid}';
  document.head.appendChild(s);
}
css();
document.addEventListener('input',function(e){if(e.target&&e.target.matches&&e.target.matches('.cl-pos-pro [data-search]'))setTimeout(sync,0)},true);
document.addEventListener('keyup',function(e){if(e.target&&e.target.matches&&e.target.matches('.cl-pos-pro [data-search]'))setTimeout(sync,0)},true);
new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true});
sync();
})();
