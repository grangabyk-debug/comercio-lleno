'use client'

import { useEffect, useState } from 'react'

const SESSION_KEY='cv_ai_session_token_v1'
const OWNER_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/cv-ai-owner-test'

async function post(body:Record<string,unknown>){
  const response=await fetch(OWNER_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  const data=await response.json().catch(()=>({ok:false,error:'Respuesta inválida'}))
  if(!response.ok||!data?.ok)throw new Error(data?.error||'No pudimos activar el modo de prueba.')
  return data
}
function waitForSessionToken(timeoutMs=12000){return new Promise<string>((resolve,reject)=>{const started=Date.now();const tick=()=>{const token=localStorage.getItem(SESSION_KEY)||'';if(token)return resolve(token);if(Date.now()-started>timeoutMs)return reject(new Error('No encontramos la sesión de CV IA. Recargá la página.'));window.setTimeout(tick,180)};tick()})}

export default function OwnerTestBridge(){
 const [enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
 useEffect(()=>{let alive=true;(async()=>{try{const sessionToken=await waitForSessionToken();const params=new URLSearchParams(window.location.search),ownerToken=params.get('owner_test')||'';let active=false;if(ownerToken){const result=await post({action:'activate',session_token:sessionToken,owner_token:ownerToken});active=!!result.owner_test_mode;params.delete('owner_test');const qs=params.toString();history.replaceState({},'',window.location.pathname+(qs?`?${qs}`:'')+window.location.hash)}else{const status=await post({action:'status',session_token:sessionToken});active=!!status.owner_test_mode}if(active)localStorage.setItem('cv_owner_test_mode','1');if(alive)setEnabled(active)}catch(error){if(alive&&new URLSearchParams(window.location.search).has('owner_test'))setMessage(error instanceof Error?error.message:'No pudimos activar el modo de prueba.')}})();return()=>{alive=false}},[])
 useEffect(()=>{if(!enabled)return;const update=()=>{for(const button of Array.from(document.querySelectorAll('button'))){const text=(button.textContent||'').trim();if(text==='Quiero mi CV Pro'||text==='Crear mi CV Pro')button.textContent='Probar CV Pro sin pagar';if(text==='Activar Búsqueda Activa')button.textContent='Probar Búsqueda Activa sin pagar'}};update();const observer=new MutationObserver(update);observer.observe(document.body,{subtree:true,childList:true,characterData:true});return()=>observer.disconnect()},[enabled])
 useEffect(()=>{if(!enabled)return;const handler=async(event:MouseEvent)=>{const target=event.target instanceof Element?event.target.closest('button'):null;if(!(target instanceof HTMLButtonElement))return;const text=(target.textContent||'').trim();let plan:'pro'|'active'|null=null;if(text==='Probar CV Pro sin pagar')plan='pro';if(text==='Probar Búsqueda Activa sin pagar')plan='active';if(!plan)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();if(busy)return;const destination=plan==='pro'?'/mi-cv':'/busqueda-activa';const popup=window.open('about:blank','_blank');setBusy(true);setMessage(plan==='pro'?'Activando CV Pro de prueba…':'Activando Búsqueda Activa de prueba…');try{const sessionToken=await waitForSessionToken();await post({action:'set_plan',session_token:sessionToken,plan});localStorage.setItem('cv_owner_test_mode','1');setMessage(plan==='pro'?'CV Pro habilitado. Abriendo tu espacio…':'Búsqueda Activa habilitada. Abriendo el tablero…');if(popup)popup.location.href=destination;else location.assign(destination);window.setTimeout(()=>setBusy(false),600)}catch(error){if(popup)popup.close();setMessage(error instanceof Error?error.message:'No pudimos cambiar el plan de prueba.');setBusy(false)}};document.addEventListener('click',handler,true);return()=>document.removeEventListener('click',handler,true)},[enabled,busy])
 if(!enabled&&!message)return null
 return <div style={{position:'fixed',zIndex:120,left:16,right:16,bottom:16,maxWidth:620,margin:'0 auto',background:enabled?'#17191d':'#4b2024',color:'#fff',border:'1px solid rgba(255,255,255,.16)',borderRadius:16,padding:'12px 16px',boxShadow:'0 18px 55px rgba(0,0,0,.28)',fontFamily:'Inter,system-ui,sans-serif',fontSize:13,lineHeight:1.4,textAlign:'center'}}><b>{enabled?'Modo prueba propietario activo':'No se pudo activar el modo de prueba'}</b><span style={{display:'block',opacity:.78,marginTop:3}}>{message||'CV Pro y Búsqueda Activa se habilitan sin Mercado Pago sólo en esta sesión.'}</span></div>
}
