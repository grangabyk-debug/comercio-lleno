(function(){
  'use strict';
  function css(){if(document.getElementById('clUiPolishCss'))return;var s=document.createElement('style');s.id='clUiPolishCss';s.textContent=`
    .sidebar button{font-weight:700!important;letter-spacing:.01em}
    .sidebar button span{font-size:18px!important;font-weight:800!important}
    .sidebar button:nth-child(2){background:linear-gradient(180deg,#f1fbf5,#e7f8ee)!important;color:#147a4d!important;border:1px solid #c9ebd7!important}
    .sidebar button:nth-child(2):hover,.sidebar button:nth-child(2).active{background:#dff5e8!important;color:#0f6d42!important;border-color:#a9dfc0!important;box-shadow:0 5px 15px rgba(20,122,77,.10)!important}
    .cl-new-sale{border:0!important;background:#1f9d62!important;color:white!important;padding:10px 14px!important;border-radius:10px!important;font-weight:800!important;cursor:pointer!important;box-shadow:0 5px 14px rgba(31,157,98,.18)!important}
    .cl-new-sale:hover{filter:brightness(.96);transform:translateY(-1px)}
    .dark .sidebar button:nth-child(2){background:#123322!important;border-color:#24583d!important;color:#7ee2aa!important}.dark .cl-new-sale{background:#1f9d62!important;color:#fff!important}
  `;document.head.appendChild(s)}
  function cajaButton(){return Array.from(document.querySelectorAll('.sidebar button')).find(function(b){return /caja/i.test((b.textContent||'').trim())&&!/diaria/i.test((b.textContent||'').trim())})}
  function run(){css();var btn=cajaButton();if(btn){var sp=btn.querySelector('span');if(sp&&sp.textContent!=='💵')sp.textContent='💵'}var actions=document.querySelector('.headerActions');if(actions&&!actions.querySelector('.cl-new-sale')){var b=document.createElement('button');b.className='cl-new-sale';b.type='button';b.textContent='+ Nueva venta';b.onclick=function(){var c=cajaButton();if(c)c.click()};actions.insertBefore(b,actions.firstChild)}}
  run();new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
})();