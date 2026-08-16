'use client'

import {useEffect} from 'react'

type ClarityFn=(...args:unknown[])=>unknown

function clarity(){
  return (window as typeof window & {clarity?:ClarityFn}).clarity
}

export default function TrialClarityTracker(){
  useEffect(()=>{
    let formStarted=false
    let successSent=false

    const fire=(name:string)=>{
      try{clarity()?.('event',name)}catch{}
    }

    const prepare=()=>{
      const client=clarity()
      if(!client)return
      try{
        client('set','funnel_stage','trial')
        client('set','trial_path','/prueba-gratis')
        client('upgrade','trial_registration')
        client('event','trial_view')
        if(new URLSearchParams(window.location.search).get('google')==='1')client('event','trial_google_return')
      }catch{}
    }

    let attempts=0
    const timer=setInterval(()=>{
      prepare()
      attempts++
      if(clarity()||attempts>=20)clearInterval(timer)
    },250)
    prepare()

    const onInput=(event:Event)=>{
      if(formStarted)return
      const target=event.target
      if(!(target instanceof HTMLInputElement))return
      formStarted=true
      fire('trial_form_started')
    }

    const onClick=(event:MouseEvent)=>{
      const target=event.target
      if(!(target instanceof Element))return
      const button=target.closest('button,a')
      const text=(button?.textContent||'').trim().toLowerCase()
      if(text.includes('continuar con google'))fire('trial_google_start')
      else if(text.includes('crear mi comercio'))fire('trial_create_click')
      else if(text.includes('términos y condiciones'))fire('trial_terms_open')
      else if(text.includes('política de privacidad'))fire('trial_privacy_open')
    }

    const onSubmit=()=>fire('trial_submit')

    const observer=new MutationObserver(()=>{
      if(successSent)return
      const success=document.querySelector('form [class*="success"]')
      const text=(success?.textContent||'').toLowerCase()
      if(text.includes('listo')||text.includes('entrando')){
        successSent=true
        fire('trial_signup_success')
        try{clarity()?.('set','trial_result','success')}catch{}
      }
    })

    document.addEventListener('input',onInput,true)
    document.addEventListener('click',onClick,true)
    document.addEventListener('submit',onSubmit,true)
    observer.observe(document.body,{childList:true,subtree:true,characterData:true})

    return()=>{
      clearInterval(timer)
      document.removeEventListener('input',onInput,true)
      document.removeEventListener('click',onClick,true)
      document.removeEventListener('submit',onSubmit,true)
      observer.disconnect()
    }
  },[])

  return null
}
