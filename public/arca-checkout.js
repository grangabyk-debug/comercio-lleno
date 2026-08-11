(function(){
  'use strict';
  var ENDPOINT='https://wtcntclzcubkbtcsqkzc.supabase.co/functions/v1/arca-invoice';
  var locking=false;

  function token(){try{return localStorage.getItem('cl_access_token')||''}catch(e){return''}}
  function parseMoney(text){
    var s=String(text||'').replace(/\s/g,'').replace(/\$/g,'').replace(/\./g,'').replace(',','.').replace(/[^0-9.-]/g,'');
    var n=Number(s);return Number.isFinite(n)?n:0;
  }
  function totalFromButton(btn){
    var checkout=btn.closest('.checkout');
    var el=checkout&&checkout.querySelector('.total strong');
    return parseMoney(el&&el.textContent);
  }
  function isChargeButton(btn){return !!btn && btn.tagName==='BUTTON' && /Cobrar y registrar/i.test(btn.textContent||'')}
  function fiscalAlert(inv){
    var n=String(inv.receipt_number||'').padStart(8,'0');
    alert('Factura C autorizada por ARCA (homologación).\nPunto de venta: 0001\nComprobante: '+n+'\nCAE: '+(inv.cae||'')+'\nVencimiento CAE: '+(inv.cae_expiration||''));
  }
  async function onClick(e){
    var btn=e.target&&e.target.closest?e.target.closest('button'):null;
    if(!isChargeButton(btn))return;
    if(btn.dataset.arcaBypass==='1'){delete btn.dataset.arcaBypass;return;}
    if(locking||btn.disabled)return;

    var amount=totalFromButton(btn);
    if(!(amount>0))return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    var t=token();
    if(!t){alert('Tu sesión venció. Volvé a ingresar antes de facturar.');return;}

    locking=true;
    var oldText=btn.textContent;
    btn.disabled=true;
    btn.textContent='Facturando en ARCA…';
    var requestId=(crypto&&crypto.randomUUID)?crypto.randomUUID():(Date.now()+'-'+Math.random());

    try{
      var r=await fetch(ENDPOINT,{method:'POST',headers:{'Authorization':'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({request_id:requestId,amount:amount})});
      var d={};try{d=await r.json()}catch(_){ }
      if(!r.ok||!d.ok||!d.invoice||!d.invoice.cae){
        var msg=(d&&d.error)||((d&&d.invoice&&d.invoice.errors||[]).map(function(x){return x.code+': '+x.msg}).join('\n'))||('Error '+r.status);
        throw new Error(msg);
      }
      try{localStorage.setItem('cl_last_fiscal_invoice',JSON.stringify({request_id:requestId,invoice:d.invoice,created_at:new Date().toISOString()}));}catch(_){ }
      btn.disabled=false;
      btn.textContent=oldText;
      btn.dataset.arcaBypass='1';
      btn.click();
      setTimeout(function(){fiscalAlert(d.invoice)},50);
    }catch(err){
      btn.disabled=false;
      btn.textContent=oldText;
      alert('No se pudo autorizar la factura en ARCA.\n\n'+(err&&err.message?err.message:String(err))+'\n\nLa venta no fue registrada.');
    }finally{
      locking=false;
    }
  }

  document.addEventListener('click',onClick,true);
})();
