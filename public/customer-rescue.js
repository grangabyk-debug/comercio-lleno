(function(){
  'use strict';
  function parse(v){try{var x=JSON.parse(v||'null');return Array.isArray(x)?x:null}catch(e){return null}}
  function valid(a){return Array.isArray(a)&&a.some(function(x){return x&&typeof x==='object'&&x.name})}
  function backup(){var a=parse(localStorage.getItem('cl_customers'));if(valid(a))localStorage.setItem('cl_customers_backup',JSON.stringify(a))}
  var current=parse(localStorage.getItem('cl_customers'));
  if(!valid(current)){
    var b=parse(localStorage.getItem('cl_customers_backup'));
    if(valid(b)){localStorage.setItem('cl_customers',JSON.stringify(b));current=b}
    else{
      for(var i=0;i<localStorage.length;i++){
        var k=localStorage.key(i)||'';
        if(k==='cl_customers'||k==='cl_customers_backup')continue;
        if(/customer|cliente/i.test(k)){var a=parse(localStorage.getItem(k));if(valid(a)){localStorage.setItem('cl_customers',JSON.stringify(a));localStorage.setItem('cl_customers_backup',JSON.stringify(a));break}}
      }
    }
  }else backup();
  window.addEventListener('storage',function(e){if(e.key==='cl_customers')backup()});
  setInterval(backup,1500);
})();