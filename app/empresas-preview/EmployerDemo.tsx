'use client'

import {useMemo,useState} from 'react'
import styles from './empresas-preview.module.css'

const sampleCandidates=[
 {name:'Martina R.',score:94,tag:'RECOMENDADA',why:'Experiencia en venta presencial, manejo de caja y disponibilidad completa.',alert:'Validar expectativa salarial.'},
 {name:'Nicolás G.',score:87,tag:'MUY BUEN MATCH',why:'Atención al cliente, objetivos comerciales y experiencia con POS.',alert:'Experiencia en indumentaria no informada.'},
 {name:'Camila S.',score:81,tag:'BUEN MATCH',why:'Perfil comercial sólido y disponibilidad compatible.',alert:'Confirmar manejo de caja.'},
]

export default function EmployerDemo(){
 const [role,setRole]=useState('Vendedor/a para local de indumentaria')
 const [location,setLocation]=useState('Belgrano, CABA')
 const [must,setMust]=useState('1 año de experiencia, manejo de caja, disponibilidad sábados')
 const [stage,setStage]=useState(0)
 const title=useMemo(()=>role.trim()||'Nueva búsqueda', [role])
 const run=()=>{setStage(1);window.setTimeout(()=>setStage(2),650);window.setTimeout(()=>setStage(3),1350)}
 return <div className={styles.demoShell}>
   <div className={styles.demoTop}><div><span>DEMO INTERACTIVA</span><b>Armá una búsqueda como lo haría un comercio</b></div><div className={styles.live}><i/> AGENTES EN ESPERA</div></div>
   <div className={styles.demoGrid}>
    <div className={styles.formCard}>
      <label>Puesto<input value={role} onChange={e=>{setRole(e.target.value);setStage(0)}}/></label>
      <label>Ubicación<input value={location} onChange={e=>{setLocation(e.target.value);setStage(0)}}/></label>
      <label>Lo indispensable<textarea value={must} onChange={e=>{setMust(e.target.value);setStage(0)}}/></label>
      <button type="button" onClick={run}>Pedirle a los agentes que preparen la búsqueda</button>
      <small>Esta previa no publica avisos ni contacta personas reales.</small>
    </div>
    <div className={styles.agentCard}>
      <div className={styles.agentFlow}>
       <div data-on={stage>=1}><i>01</i><span><b>Agente Publicador</b><small>{stage>=1?'Aviso y preguntas filtro preparados':'Convierte tu pedido en una búsqueda clara'}</small></span></div>
       <div data-on={stage>=2}><i>02</i><span><b>Agente Selector</b><small>{stage>=2?'CV ordenados por ajuste real':'Lee postulaciones y explica coincidencias'}</small></span></div>
       <div data-on={stage>=3}><i>03</i><span><b>Agente Entrevistador</b><small>{stage>=3?'Guía personalizada preparada':'Prepara qué preguntar a cada persona'}</small></span></div>
      </div>
      {stage<3?<div className={styles.waiting}><span>{stage===0?'LISTO PARA EMPEZAR':stage===1?'REDACCIÓN EN CURSO':'ANALIZANDO CANDIDATOS'}</span><p>{stage===0?'Completá lo mínimo. La idea es que publicar no parezca llenar un formulario de recursos humanos.':'Los agentes trabajan por etapas y dejan cada decisión explicada.'}</p></div>:<div className={styles.result}>
        <div className={styles.resultHead}><span>SHORTLIST PARA</span><h3>{title}</h3><p>{location} · {must}</p></div>
        {sampleCandidates.map(c=><div className={styles.candidateRow} key={c.name}><strong>{c.score}</strong><div><b>{c.name}<small>{c.tag}</small></b><p>{c.why}</p><span>{c.alert}</span></div></div>)}
        <button type="button" className={styles.outline}>Ver preguntas de entrevista</button>
      </div>}
    </div>
   </div>
 </div>
}
