'use client'

import {useEffect} from 'react'

const order=['resumen','perfil','cv','postulaciones','mensajes','publicaciones','flex','favoritos','planes','configuracion'] as const

export default function CandidateMobileTabBridge(){
 useEffect(()=>{
  let last=''
  const sync=()=>{
   const tab=new URLSearchParams(window.location.search).get('tab')||'resumen'
   if(tab===last)return
   last=tab
   const index=order.indexOf(tab as (typeof order)[number])
   const target=index>=0?index:0
   const buttons=document.querySelectorAll<HTMLButtonElement>('.pm42-mobile-nav button')
   const button=buttons[target]
   if(!button)return
   const workspace=document.querySelector<HTMLElement>('.pm42-workspace')
   if(workspace?.dataset.view!==order[target])button.click()
  }
  sync()
  const timer=window.setInterval(sync,120)
  window.addEventListener('popstate',sync)
  return()=>{window.clearInterval(timer);window.removeEventListener('popstate',sync)}
 },[])
 return null
}
