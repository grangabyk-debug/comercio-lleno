'use client'

import { useEffect } from 'react'
import { readTenantSession } from '@/lib/comercio/session'

export default function ProductPermissionGuard(){
  useEffect(()=>{
    const session=readTenantSession();if(!session||session.role==='owner')return
    const canEdit=session.permissions?.can_edit_products ?? (session.permissions?.can_manage_stock!==false)
    const canSheet=session.permissions?.can_import_export_products ?? (session.permissions?.can_manage_stock!==false)
    const apply=()=>{
      const title=Array.from(document.querySelectorAll('h1')).find(node=>node.textContent?.trim()==='Productos y stock')
      if(!title)return
      document.querySelectorAll<HTMLButtonElement>('button').forEach(button=>{
        const text=(button.textContent||'').replace(/\s+/g,' ').trim()
        if(!canEdit&&(text.includes('Agregar producto')||text==='Editar'))button.style.display='none'
        if(!canSheet&&(text.includes('Importar')||text.includes('Exportar')))button.style.display='none'
      })
    }
    apply();const observer=new MutationObserver(apply);observer.observe(document.body,{subtree:true,childList:true});return()=>observer.disconnect()
  },[])
  return null
}
