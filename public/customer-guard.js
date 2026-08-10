(function(){
  'use strict';
  try{
    var raw=localStorage.getItem('cl_customers');
    if(!raw)return;
    var parsed=JSON.parse(raw);
    var changed=false;
    if(!Array.isArray(parsed)){parsed=[];changed=true;}
    var clean=parsed.filter(function(c){return c&&typeof c==='object';}).map(function(c,i){
      var id=typeof c.id==='string'&&c.id?c.id:'cliente-'+Date.now()+'-'+i;
      var name=typeof c.name==='string'?c.name:'';
      var phone=typeof c.phone==='string'?c.phone:'';
      var email=typeof c.email==='string'?c.email:'';
      if(id!==c.id||name!==c.name||phone!==c.phone||email!==c.email)changed=true;
      return {id:id,name:name,phone:phone,email:email};
    });
    if(clean.length!==parsed.length)changed=true;
    if(changed){
      localStorage.setItem('cl_customers',JSON.stringify(clean));
      if(sessionStorage.getItem('cl_customer_guard_reload')!=='1'){
        sessionStorage.setItem('cl_customer_guard_reload','1');
        location.reload();
      }
    } else {
      sessionStorage.removeItem('cl_customer_guard_reload');
    }
  }catch(e){
    localStorage.setItem('cl_customers','[]');
    if(sessionStorage.getItem('cl_customer_guard_reload')!=='1'){
      sessionStorage.setItem('cl_customer_guard_reload','1');
      location.reload();
    }
  }
})();
