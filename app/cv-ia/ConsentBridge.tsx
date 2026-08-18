'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CV_CONSENT_API, SESSION_KEY, postCv } from './cvAuth'

export default function ConsentBridge(){
  const [mount,setMount]=useState<HTMLElement|null>(null)
  const [checked,setChecked]=useState(false)
  const [accepted,setAccepted]=useState(false)
  const [message,setMessage]=useState('')
  const submitting=useRef(false)

  useEffect(()=>{
    let alive=true
    const find=()=>{
      const form=document.getElementById('analisis') as HTMLFormElement|null
      if(!form)return false
      let host=form.querySelector<HTMLElement>('[data-cv-consent-host]')
      if(!host){
        host=document.createElement('div');host.dataset.cvConsentHost='1'
        const submit=form.querySelector<HTMLButtonElement>('button[type="submit"]')
        if(submit)submit.insertAdjacentElement('afterend',host);else form.appendChild(host)
      }
      if(alive)setMount(host)
      return true
    }
    if(!find()){const timer=window.setInterval(()=>{if(find())window.clearInterval(timer)},250);return()=>{alive=false;window.clearInterval(timer)}}
    return()=>{alive=false}
  },[])

  useEffect(()=>{
    const token=localStorage.getItem(SESSION_KEY)||''
    if(!token)return
    postCv(CV_CONSENT_API,{action:'status',token}).then(r=>{if(r.accepted){setAccepted(true);setChecked(true)}}).catch(()=>{})
  },[mount])

  useEffect(()=>{
    const form=document.getElementById('analisis') as HTMLFormElement|null
    if(!form)return
    const handler=async(e:SubmitEvent)=>{
      if(accepted||submitting.current)return
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()
      if(!checked){setMessage('Para analizar el CV primero tenés que aceptar los términos y el tratamiento de la información.');return}
      const token=localStorage.getItem(SESSION_KEY)||''
      if(!token){setMessage('Todavía estamos preparando tu sesión. Probá nuevamente en unos segundos.');return}
      submitting.current=true;setMessage('Registrando tu consentimiento…')
      try{
        await postCv(CV_CONSENT_API,{action:'accept',token,accepted:true})
        setAccepted(true);setMessage('Consentimiento registrado. Iniciando análisis…')
        window.setTimeout(()=>form.requestSubmit(),80)
      }catch(err){setMessage(err instanceof Error?err.message:'No pudimos registrar el consentimiento.');submitting.current=false}
    }
    form.addEventListener('submit',handler,true)
    return()=>form.removeEventListener('submit',handler,true)
  },[accepted,checked,mount])

  if(!mount)return null
  return createPortal(<div style={{margin:'10px 2px 4px',padding:'12px 13px',border:'1px solid rgba(255,255,255,.14)',borderRadius:13,background:'rgba(255,255,255,.035)',fontSize:11,lineHeight:1.45,color:'#c9ced6'}}>
    <label style={{display:'flex',gap:9,alignItems:'flex-start',cursor:accepted?'default':'pointer'}}>
      <input type="checkbox" checked={checked} disabled={accepted} onChange={e=>{setChecked(e.target.checked);setMessage('')}} style={{marginTop:2,width:16,height:16,accentColor:'#d9ff61'}}/>
      <span>Acepto los <a href="/terminos" target="_blank" rel="noreferrer" style={{color:'#d9ff61'}}>Términos</a> y la <a href="/privacidad" target="_blank" rel="noreferrer" style={{color:'#d9ff61'}}>Política de Privacidad</a>, y autorizo el procesamiento de mi CV para generar el análisis solicitado. {accepted&&<b style={{color:'#d9ff61'}}> ✓ Registrado</b>}</span>
    </label>
    {message&&<div style={{marginTop:7,color:message.includes('registrado')||message.includes('Iniciando')?'#d9ff61':'#ffd4d7'}}>{message}</div>}
  </div>,mount)
}
