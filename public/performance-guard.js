(function(){
'use strict';
var nativeSetInterval=window.setInterval.bind(window);
window.setInterval=function(fn,delay){
  var name='';
  try{name=(fn&&fn.name)||''}catch(e){}
  var d=Number(delay)||0;
  if(name==='push'&&d===900)d=3000;
  else if(name==='render'&&d===700)d=1500;
  else if(name==='stockAudit'&&d===2500)d=12000;
  return nativeSetInterval(fn,d);
};
var nativeSetItem=Storage.prototype.setItem;
var suppressSnapshotEvent=false;
Storage.prototype.setItem=function(k,v){
  if(this===localStorage&&k==='cl_rs_stock_snapshot'){
    var prev='';try{prev=this.getItem(k)||''}catch(e){}
    if(prev===String(v)){suppressSnapshotEvent=true;return}
    suppressSnapshotEvent=true;
  }
  return nativeSetItem.call(this,k,v);
};
var nativeDispatch=window.dispatchEvent.bind(window);
window.dispatchEvent=function(ev){
  if(suppressSnapshotEvent&&ev&&ev.type==='storage'){
    suppressSnapshotEvent=false;
    return true;
  }
  suppressSnapshotEvent=false;
  return nativeDispatch(ev);
};
})();