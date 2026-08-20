'use client'

import { useEffect } from 'react'

const LIMIT=10_000_000

export default function ConsumerFinalLimitGuard(){
  useEffect(()=>{
    const handler=(event:Event)=>{
      const target=event.target as HTMLElement|null
      const button=target?.closest('button')
      if(!button||!/emitir factura/i.test(button.textContent||''))return
      const amountInput=Array.from(document.querySelectorAll('input')).find(input=>input.getAttribute('inputmode')==='numeric') as HTMLInputElement|undefined
      const amount=Number((amountInput?.value||'').replace(/\D/g,''))||0
      if(amount<LIMIT)return
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()
      alert('Para operaciones de $10.000.000 o más ARCA exige identificar al consumidor final. Este caso va a habilitarse con DNI/CUIT en la próxima etapa; por ahora no se emite para evitar un comprobante incompleto.')
    }
    document.addEventListener('click',handler,true)
    return()=>document.removeEventListener('click',handler,true)
  },[])
  return null
}
