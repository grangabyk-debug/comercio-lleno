(function(){
'use strict';
if(window.__clProductsLimitFix)return;
window.__clProductsLimitFix=true;
var nativeFetch=window.fetch.bind(window);
window.fetch=function(input,init){
  try{
    var url=typeof input==='string'?input:(input&&input.url)||'';
    if(url&&url.indexOf('/rest/v1/products?')!==-1&&url.indexOf('limit=100')!==-1){
      var fixed=url.replace(/([?&])limit=100(?:&|$)/,function(_,sep){return sep+'limit=5000&'}).replace(/&$/,'');
      if(typeof input==='string') input=fixed;
      else input=new Request(fixed,input);
    }
  }catch(e){}
  return nativeFetch(input,init);
};
})();