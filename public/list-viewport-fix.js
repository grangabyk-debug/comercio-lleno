(function(){
'use strict';
var page=1,perPage=5,queued=false,lastSig='';
function inject(){
 if(document.getElementById('cl-list-viewport-fix'))return;
 var s=document.createElement('style');
 s.id='cl-list-viewport-fix';
 s.textContent=`
html,body{overflow-x:hidden!important}
.mainContent{min-width:0!important;max-width:100%!important;overflow-x:hidden!important}
.mainContent .table{overflow:hidden!important;max-height:none!important}
.mainContent .table .tr.th{position:static!important;background:#f6f8fb}
.dark .mainContent .table .tr.th{background:#111820}
body.cl-products-view .mainContent .table.cl-product-table-advanced{height:auto!important;max-height:none!important;overflow:hidden!important}
body.cl-products-view .mainContent .table.cl-product-table-advanced>.tr{position:relative!important;inset:auto!important;transform:none!important}
body.cl-products-view .mainContent .table.cl-product-table-advanced>.tr.cl-page-hidden{display:none!important}
.cl-product-pager{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 4px 0;font-size:11px;color:#6b7785}
.cl-product-pager .cl-page-info{white-space:nowrap}
.cl-product-pager .cl-page-controls{display:flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:flex-end}
.cl-product-pager button{min-width:31px;height:30px;padding:0 8px;border:1px solid #d7e0e8;background:#fff;color:#526170;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer}
.cl-product-pager button:hover:not(:disabled){border-color:#16834a;color:#16834a;background:#f2fbf6}
.cl-product-pager button.active{background:#16834a;color:#fff;border-color:#16834a}
.cl-product-pager button:disabled{opacity:.4;cursor:default}
.dark .cl-product-pager{color:#94a3b8}.dark .cl-product-pager button{background:#111827;border-color:#334155;color:#cbd5e1}.dark .cl-product-pager button.active{background:#16834a;color:#fff;border-color:#16834a}
body:not(.cl-products-view) .mainContent>.table>.tr:not(.th):nth-of-type(n+8){display:none!important}
.rs-view{overflow:hidden!important}.rs-view .rs-table{width:100%!important;overflow:hidden!important;max-height:none!important}.rs-view .rs-table tr:nth-child(n+8){display:none!important}
.mainContent .table,.rs-view .rs-table{max-width:100%!important}
`;
 document.head.appendChild(s);
}
function isProducts(){var h=document.querySelector('.mainContent h1');return !!h&&/^productos$/i.test((h.textContent||'').trim())}
function rows(table){return Array.from(table.children).filter(function(x){return x.classList&&x.classList.contains('tr')&&!x.classList.contains('th')})}
function pageButtons(totalPages,current){var out=[];if(totalPages<=7){for(var i=1;i<=totalPages;i++)out.push(i)}else{out=[1];var a=Math.max(2,current-1),b=Math.min(totalPages-1,current+1);if(a>2)out.push('…');for(var j=a;j<=b;j++)out.push(j);if(b<totalPages-1)out.push('…');out.push(totalPages)}return out}
function renderPager(table,total){var totalPages=Math.max(1,Math.ceil(total/perPage));if(page>totalPages)page=totalPages;if(page<1)page=1;var old=document.querySelector('.cl-product-pager');if(!old){old=document.createElement('div');old.className='cl-product-pager';table.insertAdjacentElement('afterend',old)}var start=total?((page-1)*perPage+1):0,end=Math.min(page*perPage,total),btns=pageButtons(totalPages,page);old.innerHTML='<span class="cl-page-info">'+start+'–'+end+' de '+total+' productos</span><div class="cl-page-controls"><button type="button" data-prev '+(page===1?'disabled':'')+'>‹</button>'+btns.map(function(n){return n==='…'?'<span style="padding:0 2px">…</span>':'<button type="button" data-page="'+n+'" class="'+(n===page?'active':'')+'">'+n+'</button>'}).join('')+'<button type="button" data-next '+(page===totalPages?'disabled':'')+'>›</button></div>';old.querySelector('[data-prev]').onclick=function(){if(page>1){page--;apply(true)}};old.querySelector('[data-next]').onclick=function(){if(page<totalPages){page++;apply(true)}};old.querySelectorAll('[data-page]').forEach(function(b){b.onclick=function(){page=+b.dataset.page||1;apply(true)}})}
function apply(force){queued=false;inject();var prod=isProducts();document.body.classList.toggle('cl-products-view',prod);if(!prod){var p=document.querySelector('.cl-product-pager');if(p)p.remove();return}var table=document.querySelector('.mainContent .table.cl-product-table-advanced')||document.querySelector('.mainContent .table');if(!table)return;var rr=rows(table),sig=rr.length+'|'+rr.slice(0,8).map(function(r){return (r.textContent||'').slice(0,80)}).join('|');if(sig!==lastSig){page=1;lastSig=sig}var totalPages=Math.max(1,Math.ceil(rr.length/perPage));if(page>totalPages)page=totalPages;var from=(page-1)*perPage,to=from+perPage;rr.forEach(function(r,i){r.classList.toggle('cl-page-hidden',i<from||i>=to)});renderPager(table,rr.length);if(force)table.scrollIntoView({block:'nearest',behavior:'auto'})}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){apply(false)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
var main=document.querySelector('.mainContent');if(main)new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];if(m.type==='childList'&&(m.addedNodes.length||m.removedNodes.length)){schedule();break}}}).observe(main,{childList:true,subtree:true});
document.addEventListener('input',function(e){if(isProducts()&&e.target&&e.target.matches&&e.target.matches('.tableSearch')){page=1;setTimeout(schedule,0)}});
document.addEventListener('click',function(e){if(e.target.closest('.sidebar button')){page=1;setTimeout(schedule,60)}});
setTimeout(schedule,150);setTimeout(schedule,900);
})();