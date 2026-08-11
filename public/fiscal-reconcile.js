(function(){
'use strict';
var running=false;
function safe(k,d){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(_){return d}}
function saveSales(a){try{localStorage.setItem('cl_sales',JSON.stringify(a));window.dispatchEvent(new CustomEvent('cl:sales-updated'))}catch(_){}}
function reconcileLatest(){
  var last=safe('cl_last_fiscal_invoice',null),sales=safe('cl_sales',[]);
  if(!last||!last.invoice||!Array.isArray(sales)||!sales.length)return false;
  var inv=last.invoice,amount=Number(inv.amount||0),created=Date.parse(last.created_at||'')||Date.now();
  var already=sales.find(function(s){return Number(s.receiptNumber||0)===Number(inv.receipt_number||0)&&String(s.cae||'')===String(inv.cae||'')});
  if(already)return false;
  var candidate=null;
  for(var i=0;i<sales.length;i++){
    var s=sales[i],dt=Math.abs((Date.parse(s.date||'')||0)-created),sameAmount=!amount||Math.abs(Number(s.total||0)-amount)<0.01;
    if(sameAmount&&dt<15*60*1000){candidate=s;break}
  }
  if(!candidate&&sales[0]&&!sales[0].cae)candidate=sales[0];
  if(!candidate)return false;
  candidate.receiptNumber=inv.receipt_number;
  candidate.cae=inv.cae;
  candidate.caeExpiration=inv.cae_expiration||'';
  candidate.fiscalEnvironment=inv.environment||'homologacion';
  candidate.fiscalType='Factura C';
  candidate.fiscalPointOfSale=Number(inv.point_of_sale||1);
  candidate.fiscal_status='authorized';
  saveSales(sales);
  return true;
}
function run(){if(running)return;running=true;try{reconcileLatest()}finally{running=false}}
window.addEventListener('storage',function(e){if(!e||!e.key||e.key==='cl_sales'||e.key==='cl_last_fiscal_invoice')run()});
window.addEventListener('cl:fiscal-authorized',run);
setTimeout(run,50);
setTimeout(run,700);
})();
