'use client'

import { useEffect, useState } from 'react'
import { CV_API, SESSION_KEY, postCv } from './cvAuth'

const PAY_API='https://wtcntclzcubkbtcsqkzc.supabase.co/functions/v1/cv-ai-purchase'

export default function CheckoutBridge(){
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')

  useEffect(()=>{
    const handler=async(event:MouseEvent)=>{
      const button=event.target instanceof Element?event.target.closest('button'):null
      if(!(button instanceof HTMLButtonElement))return
      if((button.textContent||'').trim()!=='Continuar con Mercado Pago')return
      const modal=button.closest('form')
      if(!(modal instanceof HTMLFormElement))return
      const title=(modal.querySelector('h3')?.textContent||'').trim()
      const plan=title.includes('Búsqueda Activa')?'active':title.includes('CV Pro')?'pro':null
      if(!plan)return
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()
      const email=(modal.querySelector<HTMLInputElement>('input[type="email"]')?.value||'').trim().toLowerCase()
      if(!/^\S+@\S+\.\S+$/.test(email)){setError('Ingresá un email válido para asociar tu compra.');return}
      const popup=window.open('about:blank','_blank')
      const original=button.textContent
      button.disabled=true;button.textContent='Abriendo Mercado Pago…';setError('');setMessage('Preparando el pago en una pestaña nueva…')
      try{
        const token=localStorage.getItem(SESSION_KEY)||''
        if(!token)throw new Error('No encontramos tu sesión. Recargá la página y probá de nuevo.')
        const status=await postCv(CV_API,{action:'status',token})
        const data=await postCv(`${PAY_API}?action=checkout`,{plan,email,session_id:status.session.id,return_url:plan==='active'?'https://postulamejor.com/busqueda-activa':'https://postulamejor.com/mi-cv'})
        localStorage.setItem(`cv_ai_order_${data.order_id}`,data.order_token)
        if(popup){popup.opener=null;popup.location.href=data.init_point;popup.focus();setMessage('Mercado Pago se abrió en otra pestaña. Esta página queda abierta.')}
        else{location.href=data.init_point}
      }catch(err){if(popup)popup.close();setError(err instanceof Error?err.message:'No pudimos abrir Mercado Pago.');setMessage('');button.disabled=false;button.textContent=original}
    }
    document.addEventListener('click',handler,true)
    return()=>document.removeEventListener('click',handler,true)
  },[])

  if(!message&&!error)return null
  return <div style={{position:'fixed',zIndex:150,right:16,bottom:16,maxWidth:390,borderRadius:15,padding:'12px 14px',background:error?'#442429':'#17191d',color:'#fff',boxShadow:'0 18px 50px rgba(0,0,0,.24)',fontFamily:'Inter,system-ui,sans-serif',fontSize:11.5,lineHeight:1.45}}>{error||message}</div>
}
