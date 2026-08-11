(function(){
'use strict';
function safe(k,d){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(_){return d}}
function saveSales(a){try{localStorage.setItem('cl_sales',JSON.stringify(a));window.dispatchEvent(new Event('storage'))}catch(_){}}
function reconcileLatest(){
  var last=safe('cl_last_fiscal_invoice',null),sales=safe('cl_sales',[]);
  if(!last||!last.invoice||!Array.isArray(sales)||!sales.length)return;
  var inv=last.invoice,amount=Number(inv.amount||0),created=Date.parse(last.created_at||'')||Date.now();
  var already=sales.find(function(s){return Number(s.receiptNumber||0)===Number(inv.receipt_number||0)&&String(s.cae||'')===String(inv.cae||'')});
  if(already)return;
  var candidate=null;
  for(var i=0;i<sales.length;i++){
    var s=sales[i],dt=Math.abs((Date.parse(s.date||'')||0)-created),sameAmount=!amount||Math.abs(Number(s.total||0)-amount)<0.01;
    if(sameAmount&&dt<15*60*1000){candidate=s;break}
  }
  if(!candidate&&sales[0]&&!sales[0].cae)candidate=sales[0];
  if(!candidate)return;
  candidate.receiptNumber=inv.receipt_number;
  candidate.cae=inv.cae;
  candidate.caeExpiration=inv.cae_expiration||'';
  candidate.fiscalEnvironment='homologacion';
  candidate.fiscalType='Factura C';
  candidate.fiscalPointOfSale=1;
  saveSales(sales);
}
function patchRows(){
  var h=Array.from(document.querySelectorAll('.mainContent h1')).find(function(x){return x.textContent.trim()==='Ventas'});if(!h)return;
  var sales=safe('cl_sales',[]);if(!Array.isArray(sales))return;
  document.querySelectorAll('.mainContent .table .tr:not(.th)').forEach(function(row){
    var cell=row.children[1];if(!cell)return;
    var op=(cell.textContent||'').trim();
    var s=sales.find(function(x){return String(x.id||'').slice(0,8)===op||('FC 0001-'+String(x.receiptNumber||'').padStart(8,'0'))===op});
    if(s&&s.receiptNumber){cell.textContent='FC 0001-'+String(s.receiptNumber).padStart(8,'0');cell.title='Factura C autorizada por ARCA';row.dataset.fiscalReceipt=String(s.receiptNumber)}
  })
}
function run(){reconcileLatest();patchRows()}
new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('storage',run);setTimeout(run,50);setTimeout(run,700);run();
})();
