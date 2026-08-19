'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './free-career-tools.module.css'
import { trackCvEvent } from './cvAuth'

export default function FreeCareerTools(){
  const [host,setHost]=useState<HTMLElement|null>(null)
  useEffect(()=>{
    let alive=true
    const mount=()=>{
      const form=document.getElementById('analisis')
      const hero=form?.closest('section')
      if(!hero)return false
      let node=document.querySelector<HTMLElement>('[data-free-career-tools]')
      if(!node){node=document.createElement('div');node.dataset.freeCareerTools='1';hero.insertAdjacentElement('afterend',node)}
      if(alive)setHost(node)
      return true
    }
    if(!mount()){const timer=window.setInterval(()=>{if(mount())window.clearInterval(timer)},180);return()=>{alive=false;window.clearInterval(timer)}}
    return()=>{alive=false}
  },[])
  if(!host)return null
  return createPortal(<section className={styles.section} aria-label="Herramientas gratuitas para empezar">
    <div className={styles.inner}>
      <div className={styles.intro}><span>SI TODAVÍA ESTÁS EMPEZANDO</span><h2>No hace falta que ya tengas un CV ni que sepas exactamente qué buscar.</h2><p>Elegí el punto en el que estás hoy. Las dos herramientas son gratuitas y después podés pasar tu resultado por el análisis principal.</p></div>
      <div className={styles.grid}>
        <article className={`${styles.card} ${styles.vocational}`}>
          <div className={styles.number}>01</div><div className={styles.badge}>GRATIS · 7–10 MIN</div>
          <h3>Test de intereses vocacionales y laborales</h3>
          <p>Descubrí qué tipos de actividades y entornos de trabajo encajan mejor con tus intereses. Al final te proponemos áreas para explorar y podés usar el resultado para empezar tu CV.</p>
          <div className={styles.meta}><span>30 situaciones</span><span>Modelo RIASEC</span><span>Resultado inmediato</span></div>
          <a href="/test-vocacional" onClick={()=>void trackCvEvent('vocational_test_started',{source:'landing'},'/')}>Hacer el test gratis <b>→</b></a>
        </article>
        <article className={`${styles.card} ${styles.firstCv}`}>
          <div className={styles.number}>02</div><div className={styles.badge}>GRATIS · PASO A PASO</div>
          <h3>Armá tu primer CV</h3>
          <p>Aunque nunca hayas trabajado formalmente. Te guiamos para transformar estudios, trabajos informales, proyectos, cursos y habilidades reales en un CV claro, sin inventar experiencia.</p>
          <div className={styles.meta}><span>Sin experiencia también</span><span>Vista previa</span><span>Listo para analizar</span></div>
          <a href="/primer-cv" onClick={()=>void trackCvEvent('first_cv_started',{source:'landing'},'/')}>Empezar mi CV <b>→</b></a>
        </article>
      </div>
      <p className={styles.method}>El test es una orientación de intereses basada en el marco RIASEC de Holland, utilizado por O*NET Interest Profiler. No reemplaza una evaluación profesional ni determina qué carrera “tenés que” elegir.</p>
    </div>
  </section>,host)
}
