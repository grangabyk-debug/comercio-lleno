'use client'

import { useEffect } from 'react'

const CV_KEY='postula_first_cv_text_v1'
const TARGET_KEY='postula_first_cv_target_v1'
const NO_OFFER='No se proporcionó una oferta específica. Analizar este CV según el puesto objetivo y la experiencia real de la persona.'

function nativeSet(el:HTMLInputElement|HTMLTextAreaElement,value:string){const proto=el instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value')?.set?.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}

export default function FirstCvBridge(){
 useEffect(()=>{
  if(new URLSearchParams(location.search).get('primer_cv')!=='1')return
  const text=localStorage.getItem(CV_KEY)||''
  if(!text)return
  let attempts=0
  const timer=window.setInterval(()=>{
    attempts++
    const form=document.getElementById('analisis') as HTMLFormElement|null
    const fileInput=form?.querySelector<HTMLInputElement>('input[type="file"]')
    const target=form?.querySelector<HTMLInputElement>('input:not([type="file"])')
    const job=form?.querySelector<HTMLTextAreaElement>('textarea')
    if(!form||!fileInput||!target||!job){if(attempts>50)window.clearInterval(timer);return}
    try{
      const dt=new DataTransfer();dt.items.add(new File([text],'mi-primer-cv.txt',{type:'text/plain'}));fileInput.files=dt.files;fileInput.dispatchEvent(new Event('change',{bubbles:true}))
      const role=localStorage.getItem(TARGET_KEY)||'';if(role)nativeSet(target,role);nativeSet(job,NO_OFFER)
      const params=new URLSearchParams(location.search);params.delete('primer_cv');history.replaceState({},'',location.pathname+(params.toString()?`?${params}`:'')+'#analisis')
      localStorage.removeItem(CV_KEY)
      window.setTimeout(()=>form.scrollIntoView({behavior:'smooth',block:'start'}),180)
      window.clearInterval(timer)
    }catch{if(attempts>50)window.clearInterval(timer)}
  },180)
  return()=>window.clearInterval(timer)
 },[])
 return null
}
