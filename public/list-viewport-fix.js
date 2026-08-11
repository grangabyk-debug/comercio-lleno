(function(){
'use strict';
function inject(){
 if(document.getElementById('cl-list-viewport-fix'))return;
 var s=document.createElement('style');
 s.id='cl-list-viewport-fix';
 s.textContent=`
html,body{overflow-x:hidden!important}
.mainContent{min-width:0!important;max-width:100%!important;overflow-x:hidden!important}

/* Nunca dejamos que una tabla larga agrande toda la página */
.mainContent .table{overflow:hidden!important;max-height:none!important}
.mainContent .table .tr.th{position:static!important;background:#f6f8fb}
.dark .mainContent .table .tr.th{background:#111820}

/* Productos: encabezado + sólo 3 productos visibles. El buscador sigue filtrando
   y muestra hasta los primeros 3 resultados encontrados. */
body.cl-products-view .mainContent .table.cl-product-table-advanced>.tr:not(.th):nth-of-type(n+5){display:none!important}
body.cl-products-view .mainContent .table.cl-product-table-advanced{height:auto!important;max-height:none!important;overflow:hidden!important}
body.cl-products-view .mainContent .table.cl-product-table-advanced>.tr{position:relative!important;inset:auto!important;transform:none!important}

/* Otras tablas principales: vista compacta para evitar páginas interminables. */
body:not(.cl-products-view) .mainContent>.table>.tr:not(.th):nth-of-type(n+8){display:none!important}

/* Módulos agregados por la suite: encabezado + hasta 6 filas. */
.rs-view{overflow:hidden!important}
.rs-view .rs-table{width:100%!important;overflow:hidden!important;max-height:none!important}
.rs-view .rs-table tr:nth-child(n+8){display:none!important}

/* Ningún listado puede desbordar horizontalmente su área. */
.mainContent .table,.rs-view .rs-table{max-width:100%!important}
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
if(main)new MutationObserver(function(){requestAnimationFrame(mark)}).observe(main,{childList:true,subtree:true});
document.addEventListener('click',function(e){if(e.target.closest('.sidebar button'))setTimeout(mark,60)});
setTimeout(mark,150);
setTimeout(mark,900);
})();