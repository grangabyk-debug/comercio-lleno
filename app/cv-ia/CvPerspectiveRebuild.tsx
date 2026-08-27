'use client'

import {useLayoutEffect,useState} from 'react'
import {createPortal} from 'react-dom'

export default function CvPerspectiveRebuild(){
 const [host,setHost]=useState<HTMLElement|null>(null)
 useLayoutEffect(()=>{
  const grid=document.querySelector('.pmcv-shell [class*="filterGrid"]') as HTMLElement|null
  const section=grid?.closest('section') as HTMLElement|null
  if(!section)return
  section.classList.add('pmcv-perspective-host')
  setHost(section)
  return()=>section.classList.remove('pmcv-perspective-host')
 },[])
 if(!host)return null
 return createPortal(
  <div className="pmcv-perspective-rebuild" aria-label="Cómo analizamos tu CV desde tres perspectivas">
   <div className="pmcv-perspective-copy">
    <span className="pmcv-perspective-kicker"><i/>TRIPLE REVISIÓN</span>
    <h2>Un CV. <em>Tres filtros</em> antes de avanzar.</h2>
    <p>La misma candidatura cambia según quién la mira. Por eso no usamos una sola opinión automática.</p>
    <div className="pmcv-perspective-route" aria-hidden="true"><span>CV</span><b>→</b><span>ATS</span><b>→</b><span>Selección</span><b>→</b><span>Área</span></div>
   </div>

   <div className="pmcv-perspective-console">
    <div className="pmcv-perspective-console-top"><div><i/><i/><i/></div><span>ANÁLISIS DE CANDIDATURA</span><small>3/3</small></div>
    <div className="pmcv-perspective-core">
     <div className="pmcv-perspective-file"><span>CV</span><div><b>Tu candidatura</b><small>Una sola fuente. Tres lecturas.</small></div></div>
     <div className="pmcv-perspective-scanline" aria-hidden="true"/>
    </div>
    <div className="pmcv-perspective-list">
     <article data-tone="orange"><span className="pmcv-perspective-index">01</span><div><b>Filtro ATS</b><p>Orden, lectura automática, palabras relevantes y compatibilidad con el aviso.</p></div><em>ESTRUCTURA</em></article>
     <article data-tone="violet"><span className="pmcv-perspective-index">02</span><div><b>Selección</b><p>Si el perfil se entiende rápido y da motivos concretos para llamarte.</p></div><em>INTERÉS</em></article>
     <article data-tone="green"><span className="pmcv-perspective-index">03</span><div><b>Responsable del área</b><p>Si tu experiencia realmente demuestra que podés resolver ese trabajo.</p></div><em>ENCAJE</em></article>
    </div>
    <div className="pmcv-perspective-foot"><span><i/> Sin inventar experiencia</span><span>Diagnóstico explicado, no una caja negra</span></div>
   </div>
  </div>,host
 )
}
