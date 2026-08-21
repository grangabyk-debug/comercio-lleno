'use client'
import {useEffect,useState} from 'react'

const steps=[
 {kicker:'BIENVENIDO',title:'Tu espacio de contratación, explicado en dos minutos.',text:'Primero configurás los datos básicos de la empresa. Después el panel te acompaña para publicar, revisar candidatos, conversar y decidir sin perderte entre pantallas.',points:['La guía no bloquea ninguna función','Podés saltarla cuando quieras','Siempre podés volver desde Configuración']},
 {kicker:'CONFIGURÁ',title:'Creá la empresa y dejá lista tu identidad.',text:'Cargá nombre, rubro y datos básicos. Esto identifica quién publica las búsquedas y ayuda a que los candidatos sepan con quién están hablando.',points:['Datos de la empresa','Rol del responsable','Preferencias iniciales']},
 {kicker:'PUBLICÁ',title:'Tu primera búsqueda sale desde “Nueva búsqueda”.',text:'Contás qué puesto necesitás, tareas, requisitos, ubicación y horario. Antes de publicar podés revisar todo y aceptar las reglas de publicación.',points:['Aviso editable antes de publicar','Preguntas filtro opcionales','Responsabilidad de la cuenta visible']},
 {kicker:'REVISÁ',title:'El dashboard ordena el proceso por vos.',text:'Vas a ver recibidos, shortlist, entrevistas y contratados. Abrís cada perfil, revisás el CV, dejás notas internas y cambiás la etapa con un toque.',points:['Embudo de candidatos','Notas internas para el equipo','Shortlist y entrevistas']},
 {kicker:'CONVERSÁ',title:'Nexo y el modo móvil te acompañan cuando estás trabajando.',text:'Desde el teléfono podés consultar candidatos, comparar perfiles, coordinar entrevistas y recibir avisos. Las decisiones sensibles siguen siendo humanas.',points:['Nexo móvil','Mensajes y entrevistas','Notificaciones configurables']},
]

export default function EmployerSetupOnboarding(){
 const [open,setOpen]=useState(false)
 const [step,setStep]=useState(0)
 useEffect(()=>{
  const handler=(event:MouseEvent)=>{
   const target=event.target as HTMLElement|null
   const link=target?.closest?.('.pmed-empty a[href="/empresas/registro"]') as HTMLAnchorElement|null
   if(!link)return
   event.preventDefault()
   setStep(0)
   setOpen(true)
  }
  document.addEventListener('click',handler)
  return()=>document.removeEventListener('click',handler)
 },[])
 useEffect(()=>{
  if(!open)return
  const old=document.body.style.overflow
  document.body.style.overflow='hidden'
  return()=>{document.body.style.overflow=old}
 },[open])
 if(!open)return null
 const current=steps[step]
 const goSetup=()=>window.location.assign('/empresas/registro')
 return <div className="pmed-ob-backdrop" role="dialog" aria-modal="true" aria-label="Guía para configurar tu empresa">
  <section className="pmed-ob-card">
   <header className="pmed-ob-top"><div><span>POSTULÁ MEJOR · EMPRESAS</span><b>Guía rápida</b></div><div className="pmed-ob-top-actions"><button type="button" onClick={goSetup}>Saltar guía</button><button type="button" className="close" onClick={()=>setOpen(false)} aria-label="Cerrar">×</button></div></header>
   <div className="pmed-ob-progress" aria-label={`Paso ${step+1} de ${steps.length}`}>{steps.map((_,i)=><i key={i} data-on={i<=step}/>)}</div>
   <div className="pmed-ob-body">
    <div className="pmed-ob-number">{String(step+1).padStart(2,'0')}</div>
    <div className="pmed-ob-copy"><span>{current.kicker}</span><h2>{current.title}</h2><p>{current.text}</p><div className="pmed-ob-points">{current.points.map(point=><div key={point}><i>✓</i><b>{point}</b></div>)}</div></div>
   </div>
   <footer className="pmed-ob-footer"><button type="button" className="quiet" onClick={()=>step===0?setOpen(false):setStep(v=>v-1)}>{step===0?'Ahora no':'Atrás'}</button><small>{step+1} de {steps.length}</small>{step<steps.length-1?<button type="button" className="next" onClick={()=>setStep(v=>v+1)}>Siguiente <span>→</span></button>:<button type="button" className="next" onClick={goSetup}>Configurar empresa <span>+</span></button>}</footer>
  </section>
 </div>
}
