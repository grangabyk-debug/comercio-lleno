(function(){
'use strict';
try{if(!localStorage.getItem('cl_time_format'))localStorage.setItem('cl_time_format','24')}catch(e){}
var origTime=Date.prototype.toLocaleTimeString,origString=Date.prototype.toLocaleString;
function hour12(){try{return localStorage.getItem('cl_time_format')==='12'}catch(e){return false}}
Date.prototype.toLocaleTimeString=function(locales,options){var o=Object.assign({},options||{}, {hour12:hour12()});return origTime.call(this,locales,o)};
Date.prototype.toLocaleString=function(locales,options){var o=Object.assign({},options||{}, {hour12:hour12()});return origString.call(this,locales,o)};
})();