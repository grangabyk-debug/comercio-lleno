'use client'

import { useEffect, useRef } from 'react'
import { trackCvEvent } from './cvAuth'

function sizeBucket(size:number){if(size<250_000)return'<250kb';if(size<1_000_000)return'250kb-1mb';if(size<3_000_000)return'1-3mb';return'3-6mb'}

export default function FunnelBridge(){
 const awaitingResult=useRef(false)
 const lastResultFingerprint=useRef('')
 useEffect(()=>{
  void trackCvEvent('page_view',{source:'landing'},'/')
  const form=document.getElementById('analisis') as HTMLFormElement|null
  if(!form)return
  const file=form.querySelector<HTMLInputElement>('input[type="file"]')
  const onFile=()=>{const f=file?.files?.[0];if(!f)return;void trackCvEvent('cv_selected',{file_type:(f.type||f.name.split('.').pop()||'unknown').slice(0,40),size_bucket:sizeBucket(f.size)},'/')}
  const onSubmit=()=>{const target=form.querySelector<HTMLInputElement>('input:not([type="file"])')?.value||'';awaitingResult.current=true;void trackCvEvent('analysis_started',{mode:target==='Orientación laboral'?'orientation':'target',has_job_offer:Boolean((form.querySelector('textarea') as HTMLTextAreaElement|null)?.value?.trim())},'/')}
  const onClick=(e:Event)=>{const el=(e.target as HTMLElement|null)?.closest('button,a') as HTMLElement|null;if(!el)return;const text=(el.textContent||'').toLowerCase();if(text.includes('cv pro'))void trackCvEvent('plan_clicked',{plan:'pro'},'/');else if(text.includes('búsqueda activa')||text.includes('busqueda activa'))void trackCvEvent('plan_clicked',{plan:'active'},'/')}
  file?.addEventListener('change',onFile);form.addEventListener('submit',onSubmit,true);document.addEventListener('click',onClick,true)
  const observer=new MutationObserver(()=>{if(!awaitingResult.current)return;const result=document.getElementById('resultado');if(!result||getComputedStyle(result).display==='none'||result.textContent!.trim().length<80)return;const fingerprint=result.textContent!.trim().slice(0,180);if(fingerprint===lastResultFingerprint.current)return;lastResultFingerprint.current=fingerprint;awaitingResult.current=false;const match=result.textContent?.match(/(\d{1,3})\s*\/\s*100/);void trackCvEvent('analysis_completed',{mode:'target',score:match?Number(match[1]):0},'/')})
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true})
  return()=>{file?.removeEventListener('change',onFile);form.removeEventListener('submit',onSubmit,true);document.removeEventListener('click',onClick,true);observer.disconnect()}
 },[])
 return null
}
