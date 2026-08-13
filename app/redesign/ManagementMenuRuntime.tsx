'use client'

import { useEffect } from 'react'
export default function ManagementMenuRuntime(){useEffect(()=>{let done=false;const closeInitial=()=>{if(done)return;const group=Array.from(document.querySelectorAll('button')).find(b=>(b.textContent||'').trim().startsWith('Gestión')) as HTMLButtonElement|undefined;if(!group)return;const open=Boolean(group.nextElementSibling);if(open)group.click();done=true};closeInitial();const observer=new MutationObserver(closeInitial);observer.observe(document.body,{childList:true,subtree:true});const timer=setTimeout(()=>{closeInitial();observer.disconnect()},2500);return()=>{clearTimeout(timer);observer.disconnect()}},[]);return null}
