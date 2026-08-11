(function(){
'use strict';
function norm(s){return String(s||'').replace(/\s+/g,' ').trim().toLowerCase()}
function label(el){return norm(el&&el.textContent)}
function findSidebar(){return document.querySelector('.sidebar')}
function byText(sidebar,txt){return Array.from(sidebar.querySelectorAll('button,a')).filter(function(el){var t=label(el);return t===txt||t.endsWith(' '+txt)})}
function cleanup(){
  var s=findSidebar(); if(!s)return;
  var wanted=['productos','compras','proveedores'];
  var first={};
  wanted.forEach(function(name){
    byText(s,name).forEach(function(el){
      if(!first[name]) first[name]=el; else el.remove();
    });
  });
  // Remove Funciones header and Reposición everywhere in the sidebar.
  Array.from(s.querySelectorAll('button,a')).forEach(function(el){
    var t=label(el);
    if(t==='funciones'||t.endsWith(' funciones')||t==='reposición'||t==='reposicion'||t.endsWith(' reposición')||t.endsWith(' reposicion')) el.remove();
  });
  // Find Gestión so the three fixed entries stay immediately above it.
  var gestion=Array.from(s.querySelectorAll('button,a')).find(function(el){var t=label(el);return t==='gestión'||t==='gestion'||t.endsWith(' gestión')||t.endsWith(' gestion')});
  var anchor=gestion;
  wanted.slice().reverse().forEach(function(name){
    var el=first[name]; if(!el)return;
    // Move the actual existing control, preserving its click handlers.
    if(anchor&&anchor.parentNode===s){s.insertBefore(el,anchor);anchor=el}
    else if(el.parentNode!==s){s.appendChild(el)}
  });
  // Remove empty wrappers left by the old collapsible Funciones group.
  Array.from(s.children).forEach(function(ch){
    if(ch.matches&&ch.matches('button,a'))return;
    if(!ch.querySelector('button,a') && !norm(ch.textContent)) ch.remove();
  });
}
var raf=0;function schedule(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;cleanup()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
var obs=new MutationObserver(schedule);var start=function(){var s=findSidebar();if(s)obs.observe(s,{childList:true,subtree:true})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
