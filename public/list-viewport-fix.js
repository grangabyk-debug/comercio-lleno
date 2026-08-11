(function(){
'use strict';
function inject(){
 if(document.getElementById('cl-list-viewport-fix'))return;
 var s=document.createElement('style');
 s.id='cl-list-viewport-fix';
 s.textContent=`
html,body{overflow-x:hidden!important}
.mainContent{min-width:0!important;max-width:100%!important;overflow-x:hidden!important}
.mainContent .table{max-height:360px!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain;scrollbar-width:thin}
.mainContent .table .tr.th{position:sticky;top:0;z-index:4;background:#f6f8fb}
.dark .mainContent .table .tr.th{background:#111820}
.mainContent .table.cl-product-table-advanced{max-height:205px!important;overflow-y:auto!important;overflow-x:hidden!important}
.mainContent .table.cl-product-table-advanced .tr{width:100%!important;min-width:0!important}
.mainContent .table.cl-product-table-advanced .tr:not(.th){min-height:52px!important}
.mainContent .table.cl-product-table-advanced .tr.th{min-height:40px!important}
.rs-view .rs-table{display:block;max-height:360px;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin}
.rs-view .rs-table tbody,.rs-view .rs-table thead{width:100%}
@media(max-height:820px){.mainContent .table{max-height:300px!important}.mainContent .table.cl-product-table-advanced{max-height:190px!important}}
`;
 document.head.appendChild(s);
}
function mark(){
 inject();
 var h=document.querySelector('.mainContent h1');
 var isProducts=!!h&&/^productos$/i.test((h.textContent||'').trim());
 document.body.classList.toggle('cl-products-view',isProducts);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mark);else mark();
var main=document.querySelector('.mainContent');
if(main)new MutationObserver(function(){requestAnimationFrame(mark)}).observe(main,{childList:true,subtree:false});
document.addEventListener('click',function(e){if(e.target.closest('.sidebar button'))setTimeout(mark,80)});
})();