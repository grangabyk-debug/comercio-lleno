'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'

export default function MobileChoicePrompt(){
 const [open,setOpen]=useState(false)
 useEffect(()=>{try{const mobile=window.matchMedia('(max-width: 760px)').matches;const seen=sessionStorage.getItem('pm_employer_mobile_choice');if(mobile&&!seen)setOpen(true)}catch{}},[])
 function stay(){try{sessionStorage.setItem('pm_employer_mobile_choice','web')}catch{}setOpen(false)}
 function mobile(){try{sessionStorage.setItem('pm_employer_mobile_choice','mobile')}catch{}}
 if(!open)return null
 return <div className="pm-mobile-choice" role="dialog" aria-modal="true" aria-label="Elegir versión de Postulá Mejor Empresas"><div className="pm-mobile-choice-card"><span className="pm-mobile-choice-mark">PM</span><small>ESTÁS DESDE EL TELÉFONO</small><h2>¿Cómo querés trabajar?</h2><p>Podés seguir con el panel web completo o abrir Nexo, la versión móvil resumida para preguntar, escuchar respuestas y dar órdenes rápidas sobre candidatos.</p><div className="pm-mobile-choice-actions"><Link href="/empresas-preview/movil" onClick={mobile}>Abrir versión móvil</Link><button type="button" onClick={stay}>Seguir en versión web</button></div><em>Esta elección dura sólo durante esta sesión.</em></div></div>
}
