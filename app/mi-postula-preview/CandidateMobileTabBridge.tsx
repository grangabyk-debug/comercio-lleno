'use client'

import {useEffect} from 'react'
import {useSearchParams} from 'next/navigation'

const order=['resumen','perfil','cv','postulaciones','mensajes','publicaciones','flex','favoritos','planes','configuracion'] as const

export default function CandidateMobileTabBridge(){
 const params=useSearchParams()
 const tab=params.get('tab')||'resumen'
 useEffect(()=>{
  const index=order.indexOf(tab as (typeof order)[number])
  const target=index>=0?index:0
  const buttons=document.querySelectorAll<HTMLButtonElement>('.pm42-mobile-nav button')
  const button=buttons[target]
  if(!button)return
  const workspace=document.querySelector<HTMLElement>('.pm42-workspace')
  if(workspace?.dataset.view===order[target])return
  button.click()
 },[tab])
 return null
}
