'use client'

import {useEffect,useState} from 'react'
import {CV_API,SESSION_KEY,postCv,cvAuthClient} from './cvAuth'

const PAY_API='https://wtcntclzcubkbtcsqkzc.supabase.co/functions/v1/cv-ai-purchase'

export default function CheckoutBridge(){
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')

  useEffect(()=>{
    let alive=true,accountEmail=''
    const decorate=()=>{
      if(!accountEmail)return
      document.querySelectorAll('form').forEach(form=>{
        const button=Array.from(form.querySelectorAll('button')).find(b=>(b.textContent||'').trim()==='Continuar con Mercado Pago')
        if(!button)return
        const input=form.querySelector<HTMLInputElement>('input[type="email"]')
        if(!input)return
        input.value=accountEmail
        input.required=false
        input.dispatchEvent(new Event('input',{bubbles:true}))
        const label=input.closest('label') as HTMLElement|null
        if(label)label.style.display='none'
        if(!form.querySelector('[data-pm-account-checkout]')){
          const note=document.createElement('div');note.dataset.pmAccountCheckout='1';note.setAttribute('data-pm-account-checkout','1');note.style.cssText='margin:12px 0;padding:11px 12px;border-radius:12px;background:#eef7f3;border:1px solid #d2e9df;color:#30584a;font:700 11px/1.4 Inter,system-ui,sans-serif';note.textContent=`La compra se va a asociar automáticamente a tu cuenta · ${accountEmail}`
          button.parentElement?.insertBefore(note,button)
        }
      })
    }
    cvAuthClient().auth.getSession().then(({data})=>{if(!alive)return;accountEmail=(data.session?.user.email||'').trim().toLowerCase();decorate()}).catch(()=>{})
    const observer=new MutationObserver(decorate);observer.observe(document.body,{childList:true,subtree:true})
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
      const {data:auth}=await cvAuthClient().auth.getSession().catch(()=>({data:{session:null}} as any))
      const signedEmail=(auth.session?.user.email||'').trim().toLowerCase()
      const manualEmail=(modal.querySelector<HTMLInputElement>('input[type="email"]')?.value||'').trim().toLowerCase()
      const email=signedEmail||manualEmail
      if(!/^\S+@\S+\.\S+$/.test(email)){setError('No pudimos identificar el email de tu cuenta. Recargá la página e intentá nuevamente.');return}
      const popup=window.open('about:blank','_blank')
      const original=button.textContent
      button.disabled=true;button.textContent='Abriendo Mercado Pago…';setError('');setMessage('Preparando el pago y asociándolo a tu cuenta…')
      try{
        const token=localStorage.getItem(SESSION_KEY)||''
        if(!token)throw new Error('No encontramos tu sesión. Recargá la página y probá de nuevo.')
        const status=await postCv(CV_API,{action:'status',token})
        const data=await postCv(`${PAY_API}?action=checkout`,{plan,email,session_id:status.session.id,return_url:plan==='active'?'https://postulamejor.com/busqueda-activa':'https://postulamejor.com/mi-cv'})
        localStorage.setItem(`cv_ai_order_${data.order_id}`,data.order_token)
        if(popup){popup.opener=null;popup.location.href=data.init_point;popup.focus();setMessage('Mercado Pago se abrió en otra pestaña. La compra queda vinculada a tu cuenta.')}
        else{location.href=data.init_point}
      }catch(err){if(popup)popup.close();setError(err instanceof Error?err.message:'No pudimos abrir Mercado Pago.');setMessage('');button.disabled=false;button.textContent=original}
    }
    document.addEventListener('click',handler,true)
    return()=>{alive=false;observer.disconnect();document.removeEventListener('click',handler,true)}
  },[])

  if(!message&&!error)return null
  return <div style={{position:'fixed',zIndex:150,right:16,bottom:16,maxWidth:390,borderRadius:15,padding:'12px 14px',background:error?'#442429':'#17191d',color:'#fff',boxShadow:'0 18px 50px rgba(0,0,0,.24)',fontFamily:'Inter,system-ui,sans-serif',fontSize:11.5,lineHeight:1.45}}>{error||message}</div>
}
