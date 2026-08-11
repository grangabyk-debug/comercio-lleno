(function(){
'use strict';
function isApp(){return location.pathname.indexOf('/app/')===0||(location.pathname==='/'&&new URLSearchParams(location.search).get('app')==='1')}
if(!isApp())return;
var timer=null;
function read(k,d){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(e){return d}}
function dayKey(v){var d=new Date(v);if(isNaN(d.getTime()))return'';return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function check(){
 var sales=read('cl_sales',[]);if(!Array.isArray(sales)||!sales.length)return;
 var today=dayKey(new Date()),todaySales=sales.filter(function(s){return dayKey(s.date)===today}),todayTotal=todaySales.reduce(function(a,s){return a+(+s.total||0)},0);
 var h=document.querySelector('.mainContent h1');if(!h)return;
 var isHome=/^bienvenido\b/i.test((h.textContent||'').trim())||/^inicio$/i.test((h.textContent||'').trim());
 var isSales=/^ventas$/i.test((h.textContent||'').trim());
 var stale=false;
 if(isHome&&todayTotal>0){var cards=document.querySelectorAll('.cards .card');if(cards[0]){var strong=cards[0].querySelector('strong');var tx=(strong&&strong.textContent||'').replace(/[^0-9]/g,'');if(!tx||Number(tx)===0)stale=true}}
 if(isSales){var empty=document.querySelector('.emptyPage');if(empty&&/todav[ií]a no hay ventas/i.test(empty.textContent||''))stale=true}
 if(!stale)return;
 var raw=localStorage.getItem('cl_sales')||'[]',key='cl_state_refresh_'+raw.length+'_'+todayTotal+'_'+sales.length;
 if(sessionStorage.getItem(key)==='1')return;
 sessionStorage.setItem(key,'1');location.reload();
}
function schedule(){clearTimeout(timer);timer=setTimeout(check,350)}
setTimeout(check,1200);window.addEventListener('storage',schedule);document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule()});setInterval(function(){if(!document.hidden)check()},10000);
})();