(function(){
  'use strict';
  var SUPABASE_URL='https://wtcntclzcubkbtcsqkzc.supabase.co';
  var SUPABASE_KEY='sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb';
  var path=location.pathname.replace(/\/+$/,'')||'/';
  var protectedLanding=(path==='/'||path==='/login');
  if(!protectedLanding)return;
  var logged=false;try{logged=!!localStorage.getItem('comercio_demo_user')}catch(e){}
  if(logged&&path==='/login'){location.replace('/');return}
  if(logged&&path==='/')return;

  function css(){
    var s=document.createElement('style');s.id='cl-auth-gate-css';s.textContent=`
    html,body{margin:0!important;width:100%!important;height:100%!important;overflow:hidden!important}
    #clAuthGate{position:fixed;inset:0;z-index:2147483647;background:radial-gradient(circle at 50% 18%,#eef4ff 0,#f7f9fc 36%,#eef2f7 100%);display:flex;align-items:center;justify-content:center;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#17202a}
    .clag-wrap{width:min(410px,calc(100vw - 36px));transform:translateY(-2vh)}
    .clag-brand{text-align:center;font-size:36px;font-weight:850;letter-spacing:-1.4px;margin-bottom:28px;color:#17202a}.clag-brand span{font-weight:400}.clag-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#3478f6;margin:0 0 4px 8px}
    .clag-card{background:rgba(255,255,255,.96);border:1px solid #e2e7ec;border-radius:20px;padding:28px;box-shadow:0 20px 55px rgba(24,39,75,.10)}
    .clag-card h1{font-size:22px;margin:0 0 5px;letter-spacing:-.4px}.clag-sub{font-size:13px;color:#7c8794;margin:0 0 20px}
    .clag-field{display:block;font-size:12px;font-weight:750;color:#5e6976;margin:0 0 13px}.clag-field input{width:100%;height:44px;margin-top:6px;border:1px solid #dbe2e9;border-radius:10px;padding:0 12px;outline:0;background:#fff;color:#17202a;font:inherit;box-sizing:border-box}.clag-field input:focus{border-color:#3478f6;box-shadow:0 0 0 3px rgba(52,120,246,.10)}
    .clag-pass{position:relative}.clag-pass input{padding-right:48px}.clag-eye{position:absolute;right:7px;top:12px;width:36px;height:32px;border:0;background:transparent;color:#647180;cursor:pointer;font-size:17px}
    .clag-btn{width:100%;height:44px;border:0;border-radius:10px;background:#17202a;color:#fff;font-weight:750;cursor:pointer;margin-top:3px}.clag-btn:hover{filter:brightness(1.08)}.clag-btn:disabled{opacity:.55;cursor:wait}
    .clag-links{display:flex;justify-content:space-between;gap:12px;margin-top:16px}.clag-link{border:0;background:none;padding:0;color:#3478f6;font-size:12px;font-weight:700;cursor:pointer}.clag-link:hover{text-decoration:underline}
    .clag-msg{display:none;margin:0 0 13px;padding:10px 11px;border-radius:9px;font-size:12px;line-height:1.4}.clag-msg.err{display:block;background:#fff0f0;color:#ad3535}.clag-msg.ok{display:block;background:#edf9f1;color:#257844}
    .clag-back{margin-bottom:16px}.clag-modalTitle{display:flex;align-items:center;justify-content:space-between}.clag-close{border:0;background:none;font-size:19px;color:#6f7b87;cursor:pointer}
    @media(max-height:650px){.clag-wrap{transform:none}.clag-brand{font-size:30px;margin-bottom:14px}.clag-card{padding:20px}.clag-field{margin-bottom:9px}.clag-field input,.clag-btn{height:40px}}
    `;document.head.appendChild(s)
  }
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])})}
  function api(endpoint,body){return fetch(SUPABASE_URL+'/auth/v1/'+endpoint,{method:'POST',headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)}).then(async function(r){var d={};try{d=await r.json()}catch(e){}if(!r.ok)throw new Error(d.msg||d.message||d.error_description||'No se pudo completar la operación.');return d})}
  function mount(){
    css();
    var root=document.createElement('div');root.id='clAuthGate';document.body.appendChild(root);
    function brand(){return '<div class="clag-brand">Comercio <span>Lleno</span><i class="clag-dot"></i></div>'}
    function login(){root.innerHTML='<div class="clag-wrap">'+brand()+'<div class="clag-card"><h1>Ingresar</h1><p class="clag-sub">Accedé a tu cuenta.</p><div class="clag-msg" data-msg></div><form data-login><label class="clag-field">Email<input data-email type="email" autocomplete="email" required></label><label class="clag-field">Contraseña<div class="clag-pass"><input data-pass type="password" autocomplete="current-password" required><button class="clag-eye" type="button" data-eye aria-label="Mostrar u ocultar contraseña">◉</button></div></label><button class="clag-btn" type="submit" data-submit>Ingresar</button></form><div class="clag-links"><button class="clag-link" type="button" data-forgot>Olvidé mi contraseña</button><button class="clag-link" type="button" data-register>Registrarme</button></div></div></div>';
      var form=root.querySelector('[data-login]'),email=root.querySelector('[data-email]'),pass=root.querySelector('[data-pass]'),eye=root.querySelector('[data-eye]'),msg=root.querySelector('[data-msg]'),btn=root.querySelector('[data-submit]');
      eye.onclick=function(){pass.type=pass.type==='password'?'text':'password';eye.textContent=pass.type==='password'?'◉':'◎'};
      root.querySelector('[data-forgot]').onclick=forgot;root.querySelector('[data-register]').onclick=register;
      form.onsubmit=function(e){e.preventDefault();msg.className='clag-msg';msg.textContent='';btn.disabled=true;btn.textContent='Ingresando…';api('token?grant_type=password',{email:email.value.trim(),password:pass.value}).then(function(d){localStorage.setItem('comercio_demo_user',JSON.stringify({email:(d.user&&d.user.email)||email.value.trim(),role:'owner'}));if(d.access_token)localStorage.setItem('cl_access_token',d.access_token);if(d.refresh_token)localStorage.setItem('cl_refresh_token',d.refresh_token);location.replace('/')}).catch(function(err){msg.className='clag-msg err';msg.textContent=err.message==='Invalid login credentials'?'Email o contraseña incorrectos.':err.message;btn.disabled=false;btn.textContent='Ingresar'})}
    }
    function forgot(){root.innerHTML='<div class="clag-wrap">'+brand()+'<div class="clag-card"><div class="clag-modalTitle"><h1>Recuperar contraseña</h1><button class="clag-close" data-back>×</button></div><p class="clag-sub">Te enviamos un enlace para crear una contraseña nueva.</p><div class="clag-msg" data-msg></div><form data-reset><label class="clag-field">Email<input data-email type="email" autocomplete="email" required></label><button class="clag-btn" data-submit type="submit">Enviar enlace</button></form></div></div>';root.querySelector('[data-back]').onclick=login;var f=root.querySelector('[data-reset]'),m=root.querySelector('[data-msg]'),b=root.querySelector('[data-submit]');f.onsubmit=function(e){e.preventDefault();b.disabled=true;api('recover',{email:root.querySelector('[data-email]').value.trim()}).then(function(){m.className='clag-msg ok';m.textContent='Listo. Revisá tu email para recuperar la contraseña.';b.disabled=false;b.textContent='Reenviar enlace'}).catch(function(err){m.className='clag-msg err';m.textContent=err.message;b.disabled=false})}}
    function register(){root.innerHTML='<div class="clag-wrap">'+brand()+'<div class="clag-card"><div class="clag-modalTitle"><h1>Crear cuenta</h1><button class="clag-close" data-back>×</button></div><p class="clag-sub">Registrate con tu email y una contraseña.</p><div class="clag-msg" data-msg></div><form data-registerform><label class="clag-field">Email<input data-email type="email" autocomplete="email" required></label><label class="clag-field">Contraseña<div class="clag-pass"><input data-pass type="password" autocomplete="new-password" minlength="6" required><button class="clag-eye" type="button" data-eye>◉</button></div></label><button class="clag-btn" data-submit type="submit">Registrarme</button></form></div></div>';root.querySelector('[data-back]').onclick=login;var p=root.querySelector('[data-pass]'),eye=root.querySelector('[data-eye]'),f=root.querySelector('[data-registerform]'),m=root.querySelector('[data-msg]'),b=root.querySelector('[data-submit]');eye.onclick=function(){p.type=p.type==='password'?'text':'password';eye.textContent=p.type==='password'?'◉':'◎'};f.onsubmit=function(e){e.preventDefault();b.disabled=true;b.textContent='Creando…';api('signup',{email:root.querySelector('[data-email]').value.trim(),password:p.value}).then(function(){m.className='clag-msg ok';m.textContent='Cuenta creada. Si recibís un email de confirmación, confirmalo y después ingresá.';b.disabled=false;b.textContent='Cuenta creada'}).catch(function(err){m.className='clag-msg err';m.textContent=err.message;b.disabled=false;b.textContent='Registrarme'})}}
    login();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
