'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CV_CONSENT_API, SESSION_KEY, postCv } from './cvAuth'

async function waitForSessionToken(timeoutMs=6000){
  const started=Date.now()
  while(Date.now()-started<timeoutMs){
    const token=localStorage.getItem(SESSION_KEY)||''
    if(token)return token
    await new Promise(resolve=>window.setTimeout(resolve,120))
  }
  return ''
}

export default function ConsentBridge(){
  const [mount,setMount]=useState<HTMLElement|null>(null)
  const [checked,setChecked]=useState(false)
  const [accepted,setAccepted]=useState(false)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')

  useEffect(()=>{
    let alive=true
    const find=()=>{
      const form=document.getElementById('analisis') as HTMLFormElement|null
      if(!form)return false
      let host=form.querySelector<HTMLElement>('[data-cv-consent-host]')
      if(!host){
        host=document.createElement('div')
        host.dataset.cvConsentHost='1'
        const submit=form.querySelector<HTMLButtonElement>('button[type="submit"]')
        if(submit)submit.insertAdjacentElement('afterend',host)
        else form.appendChild(host)
      }
      if(alive)setMount(host)
      return true
    }
    if(!find()){
      const timer=window.setInterval(()=>{if(find())window.clearInterval(timer)},250)
      return()=>{alive=false;window.clearInterval(timer)}
    }
    return()=>{alive=false}
  },[])

  useEffect(()=>{
    if(!mount)return
    let cancelled=false
    ;(async()=>{
      const token=await waitForSessionToken()
      if(!token||cancelled)return
      try{
        const result=await postCv(CV_CONSENT_API,{action:'status',token})
        if(result.accepted&&!cancelled){
          setAccepted(true)
          setChecked(true)
          setMessage('Consentimiento registrado.')
        }
      }catch{}
    })()
    return()=>{cancelled=true}
  },[mount])

  useEffect(()=>{
    const form=document.getElementById('analisis') as HTMLFormElement|null
    if(!form)return
    const handler=(e:SubmitEvent)=>{
      if(accepted)return
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      setMessage(saving?'Estamos terminando de registrar tu consentimiento…':'Primero aceptá los términos y la política de privacidad. La tilde queda activa cuando el registro se guarda correctamente.')
    }
    form.addEventListener('submit',handler,true)
    return()=>form.removeEventListener('submit',handler,true)
  },[accepted,saving,mount])

  async function acceptConsent(){
    if(accepted||saving)return
    setSaving(true)
    setMessage('Registrando tu consentimiento…')
    try{
      const token=await waitForSessionToken()
      if(!token)throw new Error('Todavía estamos preparando tu sesión. Esperá un momento y volvé a intentarlo.')
      await postCv(CV_CONSENT_API,{action:'accept',token,accepted:true})
      setAccepted(true)
      setChecked(true)
      setMessage('Consentimiento registrado. Ya podés analizar tu CV.')
    }catch(err){
      setAccepted(false)
      setChecked(false)
      setMessage(err instanceof Error?err.message:'No pudimos registrar el consentimiento. Probá nuevamente.')
    }finally{
      setSaving(false)
    }
  }

  if(!mount)return null
  const success=accepted
  return createPortal(
    <div style={{margin:'10px 2px 4px',padding:'12px 13px',border:'1px solid rgba(255,255,255,.14)',borderRadius:13,background:'rgba(255,255,255,.035)',fontSize:11,lineHeight:1.45,color:'#c9ced6'}}>
      <label style={{display:'flex',gap:9,alignItems:'flex-start',cursor:accepted||saving?'default':'pointer'}}>
        <input
          type="checkbox"
          checked={checked}
          disabled={accepted||saving}
          onChange={e=>{
            if(e.target.checked)void acceptConsent()
            else setChecked(false)
          }}
          style={{marginTop:2,width:16,height:16,accentColor:'#d9ff61'}}
        />
        <span>
          Acepto los <a href="/terminos" target="_blank" rel="noreferrer" style={{color:'#d9ff61'}}>Términos</a> y la <a href="/privacidad" target="_blank" rel="noreferrer" style={{color:'#d9ff61'}}>Política de Privacidad</a>, y autorizo el procesamiento de mi CV para generar el análisis solicitado.
          {accepted&&<b style={{color:'#d9ff61'}}> ✓ Registrado</b>}
        </span>
      </label>
      {message&&<div style={{marginTop:7,color:success?'#d9ff61':'#ffd4d7'}}>{message}</div>}
    </div>,
    mount,
  )
}
