'use client'

import Link from 'next/link'
import {useMemo,useState} from 'react'
import type {PreviewJob} from '../postula-preview/jobs'
import styles from '../postula-preview/platform.module.css'

export default function JobsExplorer({jobs}:{jobs:PreviewJob[]}){
  const [query,setQuery]=useState('');const [mode,setMode]=useState('Todos');const [area,setArea]=useState('Todas')
  const areas=useMemo(()=>Array.from(new Set(jobs.map(j=>j.area))),[jobs])
  const filtered=useMemo(()=>jobs.filter(j=>{const q=query.trim().toLowerCase();const hit=!q||`${j.title} ${j.company} ${j.location} ${j.tags.join(' ')}`.toLowerCase().includes(q);return hit&&(mode==='Todos'||j.mode===mode)&&(area==='Todas'||j.area===area)}),[jobs,query,mode,area])
  return <>
    <div className={styles.jobsToolbar}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Puesto, empresa, habilidad o zona" aria-label="Buscar empleo"/><select value={mode} onChange={e=>setMode(e.target.value)}><option>Todos</option><option>Presencial</option><option>Híbrido</option><option>Remoto</option></select><button className={styles.buttonDark}>Buscar {filtered.length?`· ${filtered.length}`:''}</button></div>
    <div className={styles.jobsGrid}>
      <aside className={styles.filterPanel}><h3>Refinar búsqueda</h3><div className={styles.filterGroup}><strong>Área</strong><label><input type="radio" checked={area==='Todas'} onChange={()=>setArea('Todas')}/> Todas</label>{areas.map(a=><label key={a}><input type="radio" checked={area===a} onChange={()=>setArea(a)}/>{a}</label>)}</div><div className={styles.filterGroup}><strong>Cómo mostramos ofertas externas</strong><p style={{fontSize:12,lineHeight:1.55,color:'#6a7c8b'}}>Indicamos la fuente, fecha de revisión y destino real. Hasta que una empresa publique con nosotros, la postulación final sucede en el canal oficial.</p></div></aside>
      <div className={styles.jobList}>{filtered.length?filtered.map((job,i)=><Link href={`/empleos-preview/${job.slug}`} className={styles.jobCard} key={job.slug}><div><div className={styles.jobCompany}><span className={styles.companyLogo}>{job.company.slice(0,2).toUpperCase()}</span><span>{job.company} · {job.area}</span></div><h3>{job.title}</h3><p style={{fontSize:13,lineHeight:1.55,color:'#657788',margin:'0 0 12px'}}>{job.summary}</p><div className={styles.jobMeta}><span>{job.location}</span><span>{job.mode}</span><span>{job.schedule}</span></div></div><div className={styles.jobScore}><span className={styles.external}>Externa verificada</span><div className={styles.scoreRing}><span>{Math.max(72,88-i*3)}%</span></div></div></Link>):<div className={styles.empty}>No encontramos ofertas con esos filtros. Probá ampliando la búsqueda.</div>}</div>
    </div>
  </>
}
