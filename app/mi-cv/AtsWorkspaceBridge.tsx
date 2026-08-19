'use client'

import { useEffect } from 'react'
import { trackCvEvent } from '../cv-ia/cvAuth'

function findVisualPdfButton(){
  const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
  return buttons.find(button=>button.textContent?.trim()==='Guardar como PDF')||null
}

export default function AtsWorkspaceBridge(){
 useEffect(()=>{
  const apply=()=>{
   const tabs=document.querySelector('[data-workspace-tabs]') as HTMLElement|null
   if(!tabs||document.querySelector('[data-ats-workspace-download]'))return

   const wrap=document.createElement('div')
   wrap.className='atsWorkspaceDownload'
   wrap.setAttribute('data-ats-workspace-download','1')
   wrap.innerHTML='<div><b>Versión ATS Pro+ incluida</b><span>El contenido está optimizado para ATS y el PDF conserva exactamente el diseño, foto, colores y estructura del CV Pro+ que estás viendo.</span></div><button type="button">Descargar este CV en PDF ATS</button>'

   const button=wrap.querySelector('button') as HTMLButtonElement|null
   button?.addEventListener('click',()=>{
    if(!button)return
    const visualPdfButton=findVisualPdfButton()
    if(!visualPdfButton){
      button.textContent='No pudimos abrir el PDF · Reintentar'
      window.setTimeout(()=>{button.textContent='Descargar este CV en PDF ATS'},1800)
      return
    }

    const previousTitle=document.title
    const candidate=document.querySelector('[class*="name"]')?.textContent?.trim()||'Postula-Mejor'
    document.title=`CV-ATS-Pro-${candidate.replace(/[^a-z0-9áéíóúñü]+/gi,'-')}`
    void trackCvEvent('ats_cv_downloaded',{format:'pdf',style:'same_as_visual_cv'},'/mi-cv')

    // Reutilizamos el mismo exportador del CV visual. De esta forma el PDF ATS
    // nunca puede tener un diseño distinto al documento que el usuario está viendo.
    visualPdfButton.click()

    window.setTimeout(()=>{document.title=previousTitle},2500)
   })

   tabs.insertAdjacentElement('afterend',wrap)
  }

  apply()
  const obs=new MutationObserver(apply)
  obs.observe(document.body,{subtree:true,childList:true})
  return()=>obs.disconnect()
 },[])
 return null
}
