(function(){
  'use strict';
  var busy=false;
  function paintHeader(data){
    var buttons=Array.from(document.querySelectorAll('button'));
    var b=buttons.find(function(x){return /ARCA (desconectado|conectado|configurado)/i.test(x.textContent||'');});
    if(!b)return;
    var connected=!!data.connected, configured=!!data.configured;
    var label=connected?'ARCA conectado':configured?'ARCA configurado':'ARCA desconectado';
    var color=connected?'#27ae60':configured?'#d99027':'#d04444';
    b.innerHTML='<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+color+';margin-right:7px"></span>'+label;
    b.style.border='1px solid '+(connected?'#36a269':configured?'#d99027':'#d46a6a');
    b.style.background=connected?'#eaf8ef':configured?'#fff7e8':'#fff0f0';
    b.style.color=connected?'#1e8b4d':configured?'#9a6500':'#b63f3f';
    b.title=data.message||'';
  }
  function check(){
    if(busy||document.visibilityState==='hidden')return;
    busy=true;
    fetch('/api/arca/status',{cache:'no-store'})
      .then(function(r){return r.ok?r.json():Promise.reject(new Error('status '+r.status));})
      .then(paintHeader)
      .catch(function(){})
      .finally(function(){busy=false;});
  }
  function addSettingsCard(){
    var h=Array.from(document.querySelectorAll('h1')).find(function(x){return x.textContent.trim()==='Configuración';});
    if(!h)return;
    var settings=h.closest('.mainContent')||document.body;
    if(settings.querySelector('[data-arca-panel]'))return;
    var sections=Array.from(settings.querySelectorAll('.settings section'));
    var target=sections.find(function(s){return /ARCA/i.test(s.textContent||'');});
    if(!target)return;
    target.setAttribute('data-arca-panel','1');
    var button=document.createElement('button');
    button.type='button';
    button.textContent='Ver estado de conexión';
    button.style.cssText='margin-top:10px;border:1px solid #d9e0e8;background:#fff;border-radius:10px;padding:9px 12px;font-weight:700;cursor:pointer';
    button.onclick=function(){
      fetch('/api/arca/status',{cache:'no-store'})
        .then(function(r){return r.json();})
        .then(function(d){alert(d.message+'\nCuenta: La Económica\nAmbiente: '+d.environment+'\nConfigurado: '+(d.configured?'Sí':'No'));})
        .catch(function(){alert('No se pudo consultar el estado de ARCA.');});
    };
    target.appendChild(button);
  }
  function refresh(){check();addSettingsCard();}
  refresh();
  window.setInterval(refresh,30000);
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')refresh();});
})();
