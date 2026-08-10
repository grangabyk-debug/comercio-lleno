(function(){
  'use strict';
  var PAGE_SIZE=8;
  function inject(){
    if(document.getElementById('fixedWindowCss'))return;
    var s=document.createElement('style');s.id='fixedWindowCss';s.textContent=`
      html,body{height:100%;overflow:hidden!important}
      .app{height:100vh!important;min-height:0!important;overflow:hidden!important}
      .appbar{height:62px!important;min-height:62px!important;position:relative!important;padding:0 22px!important}
      .appLayout{height:calc(100vh - 62px)!important;min-height:0!important;overflow:hidden!important}
      .sidebar{height:100%!important;overflow:hidden!important;padding:10px 9px 58px!important;width:205px!important;gap:2px!important}
      .sidebar button{padding:9px 12px!important;font-size:13px!important}
      .mainContent{height:100%!important;min-height:0!important;overflow:hidden!important;padding:18px 24px 58px!important;max-width:none!important}
      .pagehead{margin-bottom:12px!important;align-items:center!important}.pagehead h1{font-size:25px!important}.pagehead .muted{margin:3px 0 0!important}.eyebrow{margin-bottom:2px!important}
      .cards{margin:12px 0!important;gap:10px!important}.card{padding:13px 15px!important;gap:4px!important}.card strong{font-size:22px!important}.card span,.card small{font-size:11px!important}
      .dashboardGrid,.reportGrid{margin-top:10px!important;gap:10px!important}.recentPanel,.insight,.reportPanel{padding:13px!important}.recentRow{padding:8px 0!important}.insight>button{padding:9px 11px!important}.alertCard{padding:10px 13px!important;margin:2px 0 10px!important}
      .posGrid{height:calc(100% - 66px)!important;grid-template-columns:minmax(0,1fr) 440px!important;gap:12px!important}.posLeft{padding:14px!important;min-height:0!important}.ticket{height:100%!important;min-height:0!important}.ticketHead{padding:12px 16px!important}.items{padding:5px 16px!important;overflow:hidden!important}.empty{min-height:150px!important}.item{padding:8px 0!important}.checkout{padding:11px 16px!important}.total{margin-bottom:8px!important}.total strong{font-size:25px!important}.payments{gap:6px!important}.payments button{padding:8px!important}.charge,.primary{padding:10px!important}
      .search{height:48px!important}.scanHint,.hint{margin:8px 0!important}.results button{padding:8px 11px!important}
      .formCard{padding:11px!important;margin-bottom:9px!important;gap:7px!important}.formCard input,.reportFilters input{padding:9px!important}.tableSearch{padding:9px 11px!important;margin-bottom:9px!important}
      .table{overflow:hidden!important}.tr{padding:9px 12px!important;min-height:38px!important;font-size:12px!important}.th{font-size:11px!important}
      .cashBox{padding:14px!important;gap:18px!important;margin-top:10px!important}.cashBox strong{font-size:17px!important}.settings{gap:8px!important;margin-top:10px!important}.settings section{padding:13px!important}
      .reportFilters{padding:10px!important;margin-bottom:10px!important}.reportCards{margin:0!important}.barRow{padding:7px 0!important}.paymentRow{padding:9px 0!important}
      .clcash-wrap{height:100%!important;max-height:100%!important;border-radius:14px!important}.clcash-body{min-height:0!important;height:calc(100% - 34px)!important}.clcash-left{padding:10px 12px!important;overflow:hidden!important}.clcash-right{padding:9px 12px!important;overflow:hidden!important}.clcash-top{margin-bottom:6px!important}.clcash-money{font-size:34px!important}.clcash-panel{min-height:0!important;height:calc(100% - 150px)!important;padding:12px!important;overflow:hidden!important}.clcash-denom{margin:3px 0!important}.clcash-denom input,.clcash-denom output{height:23px!important}.clcash-count-total{margin-top:10px!important}.clcash-actions{margin-top:7px!important}.clcash-btn{padding:6px 12px!important}
      .cl-fixed-pager{height:34px;display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:7px;font-size:12px;color:#718096}.cl-fixed-pager button{border:1px solid #dce2e8;background:#fff;color:#526170;border-radius:8px;padding:5px 9px;cursor:pointer}.cl-fixed-pager button:disabled{opacity:.35;cursor:default}.dark .cl-fixed-pager button{background:#1b232d;border-color:#354150;color:#cbd5e1}
      @media(max-height:720px){.appbar{height:56px!important;min-height:56px!important}.appLayout{height:calc(100vh - 56px)!important}.mainContent{padding-top:12px!important}.sidebar button{padding:7px 11px!important}.pagehead h1{font-size:22px!important}.cards{margin:8px 0!important}.card{padding:10px 12px!important}.recentRow{padding:6px 0!important}.clcash-money{font-size:30px!important}}
      @media(max-width:1100px){.sidebar{width:175px!important}.mainContent{padding-left:16px!important;padding-right:16px!important}.posGrid{grid-template-columns:minmax(0,1fr) 390px!important}.companyPill{display:none!important}}
    `;document.head.appendChild(s);
  }
  function paginate(table){
    if(table.dataset.fixedPaged==='1')return;
    var rows=Array.from(table.querySelectorAll(':scope > .tr:not(.th)'));
    if(rows.length<=PAGE_SIZE)return;
    table.dataset.fixedPaged='1';
    var page=0,pages=Math.ceil(rows.length/PAGE_SIZE),pager=document.createElement('div');pager.className='cl-fixed-pager';
    var prev=document.createElement('button'),info=document.createElement('span'),next=document.createElement('button');prev.textContent='‹ Anterior';next.textContent='Siguiente ›';pager.append(prev,info,next);table.insertAdjacentElement('afterend',pager);
    function draw(){rows.forEach(function(r,i){r.style.display=(i>=page*PAGE_SIZE&&i<(page+1)*PAGE_SIZE)?'grid':'none'});info.textContent='Página '+(page+1)+' de '+pages;prev.disabled=page===0;next.disabled=page===pages-1}
    prev.onclick=function(){if(page>0){page--;draw()}};next.onclick=function(){if(page<pages-1){page++;draw()}};draw();
  }
  function run(){inject();document.querySelectorAll('.mainContent .table').forEach(paginate)}
  run();window.setInterval(run,900);
})();
