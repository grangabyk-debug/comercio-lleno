'use client'

import {useEffect} from 'react'

const css=`
.pm42-flex-guide>article:first-child{background:linear-gradient(145deg,#f1edff 0%,#dfd7ff 100%)!important;border-color:#cfc4ff!important;box-shadow:0 16px 34px rgba(102,84,237,.10)!important}
.pm42-flex-guide>article:nth-child(2){background:linear-gradient(145deg,#f4ffd6 0%,#ddff72 100%)!important;border-color:#cce95b!important;box-shadow:0 16px 34px rgba(164,196,42,.12)!important}
.pm42-flex-guide>article:first-child h3,.pm42-flex-guide>article:first-child p,.pm42-flex-guide>article:nth-child(2) h3,.pm42-flex-guide>article:nth-child(2) p{color:#17202a!important}
`
export default function CandidateUxCleanup(){
 useEffect(()=>{
  const patch=()=>{
   const root=document.querySelector('.pm42-reputation-explainer');if(root){const p=root.querySelector('div>p');if(p)p.textContent='Una empresa primero tiene que marcarte como contratado/a. 30 días después se habilita una evaluación de 5 preguntas para ambas partes. El promedio de esas respuestas forma la calificación y, si recibís una, tenés 30 días para dejar una observación o réplica.';const steps=root.querySelectorAll('.pm42-reputation-steps span');if(steps[0])steps[0].innerHTML='<b>1</b> Contratación confirmada';if(steps[1])steps[1].innerHTML='<b>2</b> Espera de 30 días';if(steps[2])steps[2].innerHTML='<b>3</b> 5 preguntas + 30 días para responder'}
   document.querySelectorAll<HTMLElement>('.pm8-native-head p').forEach(p=>{if(p.textContent?.includes('evaluación laboral'))p.textContent='Si una empresa confirma una contratación, la evaluación se habilita 30 días después. Son 5 preguntas del 1 al 5 y el promedio forma la calificación.'})
  }
  patch();const observer=new MutationObserver(patch);observer.observe(document.body,{childList:true,subtree:true});return()=>observer.disconnect()
 },[])
 return <style>{css}</style>
}
