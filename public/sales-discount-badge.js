(function(){
'use strict';
function safe(){try{var v=JSON.parse(localStorage.getItem('cl_sales')||'[]');return Array.isArray(v)?v:[]}catch(e){return[]}}
function money(n){try{return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(+n||0)}catch(e){return '$ '+(+n||0)}}
function discountInfo(s){
  if(!s)return null;
  if(s.discount&&(+s.discount.amount>0))return {amount:+s.discount.amount||0,kind:s.discount.kind||'',value:+s.discount.value||0,subtotal:+s.discount.subtotal_before_discount||0};
  var d=s.details||{},amt=+d.discount_amount||0;
  if(amt<=0)return null;
  var meta=d.discount||{};
  return {amount:amt,kind:meta.kind||'',value:+meta.value||0,subtotal:+d.subtotal_before_discount||((+s.total||0)+amt)};
}
function css(){if(document.getElementById('salesDiscountCss'))return;var s=document.createElement('style');s.id='salesDiscountCss';s.textContent='.cl-discount-badge{display:inline-flex;align-items:center;gap:3px;margin-left:7px;padding:3px 7px;border-radius:999px;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;font-size:9px;font-weight:900;vertical-align:middle;white-space:nowrap}.sales-audit-discount{margin-top:12px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:10px;padding:10px 12px;display:flex;justify-content:space-between;gap:12px;font-size:12px}.dark .cl-discount-badge,.dark .sales-audit-discount{background:#3a2413;border-color:#7c4a21;color:#fdba74}';document.head.appendChild(s)}
function patchRows(){var h=Array.from(document.querySelectorAll('.mainContent h1')).find(function(x){return x.textContent.trim()==='Ventas'});if(!h)return;var sales=safe();document.querySelectorAll('.mainContent .table .tr:not(.th)').forEach(function(row){var op=(row.children[1]&&row.children[1].textContent||'').trim();var sale=sales.find(function(s){return String(s.id||'').slice(0,8)===op});var d=discountInfo(sale);var old=row.querySelector('.cl-discount-badge');if(!d){if(old)old.remove();return}if(old)return;var target=row.children[4]||row;var b=document.createElement('span');b.className='cl-discount-badge';b.textContent='% Descuento';b.title='Esta venta tuvo un descuento de '+money(d.amount);target.appendChild(b)})}
function patchModal(){var card=document.querySelector('.sales-audit-card');if(!card||card.querySelector('.sales-audit-discount'))return;var title=card.querySelector('.sales-audit-head h3');if(!title)return;var id=(title.textContent||'').replace(/[^a-f0-9]/gi,'').slice(-8);var sale=safe().find(function(s){return String(s.id||'').slice(0,8).toLowerCase()===id.toLowerCase()});var d=discountInfo(sale);if(!d)return;var box=document.createElement('div');box.className='sales-audit-discount';var detail=d.kind==='percent'?(d.value+'%'):(d.kind==='amount'?'Monto fijo':'Descuento');box.innerHTML='<span><b>Descuento aplicado</b><br><small>'+detail+' · Subtotal original '+money(d.subtotal)+'</small></span><b>− '+money(d.amount)+'</b>';var total=card.querySelector('.sales-audit-total');if(total)card.insertBefore(box,total);else card.appendChild(box)}
function run(){css();patchRows();patchModal()}
new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});setInterval(run,500);run();
})();