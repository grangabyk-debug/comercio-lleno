(function(){
  'use strict';
  var XLSX_URL='https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
  var loading=null;

  function loadXLSX(){
    if(window.XLSX) return Promise.resolve(window.XLSX);
    if(loading) return loading;
    loading=new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src=XLSX_URL;
      s.onload=function(){ resolve(window.XLSX); };
      s.onerror=function(){ reject(new Error('No se pudo cargar el motor de Excel.')); };
      document.head.appendChild(s);
    });
    return loading;
  }

  function normalize(v){
    return String(v==null?'':v).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
  }
  function value(row,names){
    var keys=Object.keys(row);
    for(var i=0;i<keys.length;i++){
      var nk=normalize(keys[i]);
      if(names.indexOf(nk)>=0) return row[keys[i]];
    }
    return '';
  }
  function number(v){
    if(typeof v==='number') return v;
    var s=String(v==null?'':v).replace(/\$/g,'').trim();
    if(s.indexOf(',')>=0 && s.indexOf('.')>=0) s=s.replace(/\./g,'').replace(',','.');
    else if(s.indexOf(',')>=0) s=s.replace(',','.');
    s=s.replace(/[^0-9.-]/g,'');
    var n=Number(s);
    return Number.isFinite(n)?n:0;
  }
  function uuid(){ return (crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(16).slice(2); }
  function getProducts(){
    try{
      var raw=localStorage.getItem('cl_products');
      if(raw){ var p=JSON.parse(raw); if(Array.isArray(p)) return p; }
    }catch(e){}
    return [];
  }
  function downloadWorkbook(products){
    loadXLSX().then(function(XLSX){
      var rows=products.map(function(p){return {Nombre:p.name||'',Codigo:p.barcode||'',Precio:Number(p.price)||0,Stock:Number(p.stock)||0,Categoria:p.category||''};});
      var ws=XLSX.utils.json_to_sheet(rows);
      var wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,'Productos');
      XLSX.writeFile(wb,'productos-comercio-lleno.xlsx');
    }).catch(function(e){alert(e.message||'No se pudo exportar el Excel.');});
  }
  function exportProducts(){
    var products=getProducts();
    if(!products.length){
      var rows=[];
      document.querySelectorAll('table tbody tr').forEach(function(tr){
        var c=Array.from(tr.querySelectorAll('td')).map(function(td){return td.innerText.trim();});
        if(c.length>=4) rows.push({Nombre:c[0],Codigo:c[1],Precio:c[2],Stock:c[3],Categoria:c[4]||''});
      });
      products=rows;
    }
    if(!products.length){alert('No hay productos cargados para exportar.');return;}
    downloadWorkbook(products);
  }
  function importProducts(file){
    loadXLSX().then(function(XLSX){
      return file.arrayBuffer().then(function(buffer){
        var wb=XLSX.read(buffer,{type:'array',cellDates:false});
        var sheet=wb.Sheets[wb.SheetNames[0]];
        var rows=XLSX.utils.sheet_to_json(sheet,{defval:''});
        if(!rows.length) throw new Error('El archivo no contiene filas de productos.');
        var products=rows.map(function(row,i){
          var name=String(value(row,['nombre','name','producto','descripcion','descripcionproducto'])).trim();
          if(!name) return null;
          return {
            id:uuid(),
            name:name,
            barcode:String(value(row,['codigo','codigodebarras','barcode','ean','ean13','codigoarticulo'])).trim(),
            price:number(value(row,['precio','price','precioventa','ventapublico','precioventa'])),
            stock:number(value(row,['stock','existencia','cantidad','cantidadstock'])),
            category:String(value(row,['categoria','category','rubro','familia'])).trim()
          };
        }).filter(Boolean);
        if(!products.length) throw new Error('No encontré productos. La columna obligatoria debe llamarse Nombre o Producto.');
        localStorage.setItem('cl_products',JSON.stringify(products));
        localStorage.setItem('cl_products_imported_at',new Date().toISOString());
        alert('Se importaron '+products.length+' productos. El listado se actualizará ahora.');
        location.reload();
      });
    }).catch(function(e){alert(e.message||'No se pudo importar el Excel.');});
  }
  function addButtons(){
    var headings=document.querySelectorAll('h1');
    var productHeading=null;
    headings.forEach(function(h){if(h.textContent.trim()==='Productos') productHeading=h;});
    if(!productHeading) return;
    var head=productHeading.closest('.pagehead');
    if(!head || head.querySelector('[data-excel-tools]')) return;
    var wrap=document.createElement('div');
    wrap.setAttribute('data-excel-tools','1');
    wrap.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end';
    function button(text,kind){
      var b=document.createElement('button');
      b.type='button'; b.textContent=text;
      b.style.cssText='border:1px solid '+(kind==='primary'?'#cfd8e3':'#d9e0e8')+';background:'+(kind==='primary'?'#111827':'#fff')+';color:'+(kind==='primary'?'#fff':'#273444')+';border-radius:10px;padding:10px 13px;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.04)';
      b.onmouseenter=function(){b.style.transform='translateY(-1px)';}; b.onmouseleave=function(){b.style.transform='';};
      return b;
    }
    var input=document.createElement('input'); input.type='file'; input.accept='.xlsx,.xls,.csv'; input.style.display='none';
    var imp=button('↑ Importar Excel','primary'); var exp=button('↓ Exportar Excel','normal');
    imp.title='Importar productos desde Excel'; exp.title='Exportar todos los productos a Excel';
    imp.onclick=function(){input.value='';input.click();};
    input.onchange=function(){if(input.files&&input.files[0]) importProducts(input.files[0]);};
    exp.onclick=exportProducts;
    wrap.appendChild(input);wrap.appendChild(imp);wrap.appendChild(exp);
    var actions=head.querySelector('.pagehead > div:last-child');
    if(actions) actions.parentNode.insertBefore(wrap,actions); else head.appendChild(wrap);
  }
  var observer=new MutationObserver(addButtons);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  addButtons();
})();
