(function(){
'use strict';
function label(b){return ((b&&b.textContent)||'').replace(/\s+/g,' ').trim().toLowerCase()}
function closeCustom(){document.querySelectorAll('.cl-ap-view,.cl-ap-modal').forEach(function(x){x.remove()})}
document.addEventListener('click',function(e){var b=e.target.closest('.sidebar button');if(!b)return;var t=label(b);if(t.endsWith('cuentas corrientes')||t.endsWith('promociones'))return;closeCustom()},true);
})();