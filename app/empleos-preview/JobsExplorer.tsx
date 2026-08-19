'use client'

import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import type {PreviewJob} from '../postula-preview/jobs'
import styles from '../postula-preview/platform.module.css'

const motivators=[
  'No necesitás encajar en todo para que una oportunidad valga la pena.',
  'Buscar trabajo también es trabajo. Acá intentamos hacerte esa parte más liviana.',
  'Una postulación bien elegida vale más que veinte enviadas sin mirar.',
  'Tu experiencia no es una lista de palabras: es contexto. Mostrala con claridad.',
]

function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()}

export default function JobsExplorer({jobs}:{jobs:PreviewJob[]}){
  const [query,setQuery]=useState('')
  const [location,setLocation]=useState('')
  const [mode,setMode]=useState('Todos')
  const [area,setArea]=useState('Todas')
  const [schedule,setSchedule]=useState('Todos')
  const [selectedSlug,setSelectedSlug]=useState(jobs[0]?.slug||'')
  const [saved,setSaved]=useState<string[]>([])

  useEffect(()=>{try{setSaved(JSON.parse(localStorage.getItem('pm_saved_jobs')||'[]'))}catch{}},[])

  const areas=useMemo(()=>Array.from(new Set(jobs.map(j=>j.area))).sort((a,b)=>a.localeCompare(b)),[jobs])
  const locations=useMemo(()=>['Buenos Aires','CABA','Argentina','Remoto'],[])
  const filtered=useMemo(()=>jobs.filter(j=>{
    const q=query.trim().toLowerCase()
    const loc=location.trim().toLowerCase()
    const haystack=`${j.title} ${j.company} ${j.location} ${j.area} ${j.tags.join(' ')}`.toLowerCase()
    const hit=!q||haystack.includes(q)
    const hitLoc=!loc||j.location.toLowerCase().includes(loc)||(loc==='remoto'&&j.mode==='Remoto')
    const hitMode=mode==='Todos'||j.mode===mode
    const hitArea=area==='Todas'||j.area===area
    const hitSchedule=schedule==='Todos'||j.schedule.toLowerCase().includes(schedule.toLowerCase())
    return hit&&hitLoc&&hitMode&&hitArea&&hitSchedule
  }),[jobs,query,location,mode,area,schedule])

  useEffect(()=>{if(filtered.length&&!filtered.some(j=>j.slug===selectedSlug))setSelectedSlug(filtered[0].slug)},[filtered,selectedSlug])
  const selected=filtered.find(j=>j.slug===selectedSlug)||filtered[0]

  function toggleSaved(slug:string){const next=saved.includes(slug)?saved.filter(x=>x!==slug):[...saved,slug];setSaved(next);try{localStorage.setItem('pm_saved_jobs',JSON.stringify(next))}catch{}}

  return <div className={styles.jobExperience}>
    <div className={styles.jobsToolbarV2}>
      <label className={styles.searchField}><span>Puesto o palabra clave</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ej. ventas, administración, soporte"/></label>
      <label className={styles.searchField}><span>Ubicación</span><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Ej. CABA, Rosario, remoto" list="pm-locations"/><datalist id="pm-locations">{locations.map(x=><option key={x}>{x}</option>)}</datalist></label>
      <button className={styles.searchButton} type="button">Buscar <small>{filtered.length}</small></button>
    </div>

    <div className={styles.areaRail} aria-label="Áreas de empleo">
      <button data-active={area==='Todas'} onClick={()=>setArea('Todas')}>Todas las áreas</button>
      {areas.slice(0,10).map(a=><button key={a} data-active={area===a} onClick={()=>setArea(a)}>{a}</button>)}
    </div>

    <div className={styles.motivationStrip}><span>PARA VOS</span><p>{motivators[(query.length+area.length)%motivators.length]}</p><Link href="/mi-postula-preview">Ordenar mi búsqueda</Link></div>

    <div className={styles.jobsWorkspace}>
      <aside className={styles.jobsFiltersV2}>
        <div className={styles.filterHeading}><span>Filtros</span><button onClick={()=>{setMode('Todos');setArea('Todas');setSchedule('Todos');setLocation('');setQuery('')}}>Limpiar</button></div>
        <div className={styles.filterBlock}><strong>Modalidad</strong>{['Todos','Presencial','Híbrido','Remoto'].map(x=><label key={x}><input type="radio" name="mode" checked={mode===x} onChange={()=>setMode(x)}/><span>{x}</span></label>)}</div>
        <div className={styles.filterBlock}><strong>Jornada</strong>{['Todos','Full time','Part time','Pasantía','Contrato'].map(x=><label key={x}><input type="radio" name="schedule" checked={schedule===x} onChange={()=>setSchedule(x)}/><span>{x}</span></label>)}</div>
        <div className={styles.filterBlock}><strong>Área</strong><select value={area} onChange={e=>setArea(e.target.value)}><option>Todas</option>{areas.map(x=><option key={x}>{x}</option>)}</select></div>
        <div className={styles.discoveryNote}><i/><div><b>Catálogo vivo</b><p>Postulá Mejor consulta fuentes públicas oficiales y renueva el catálogo cada seis horas. Si una oferta se cierra en origen, deja de ser prioritaria en la siguiente revisión.</p></div></div>
      </aside>

      <section className={styles.jobsResults} aria-live="polite">
        <div className={styles.resultsHead}><div><span>OPORTUNIDADES</span><strong>{filtered.length} resultados</strong></div><small>Buenos Aires primero · luego Argentina</small></div>
        <div className={styles.jobListV2}>{filtered.length?filtered.map(job=><article key={job.slug} className={styles.jobCardV2} data-selected={selected?.slug===job.slug} onClick={()=>setSelectedSlug(job.slug)}>
          <button className={styles.saveJob} onClick={e=>{e.stopPropagation();toggleSaved(job.slug)}} aria-label={saved.includes(job.slug)?'Quitar de guardados':'Guardar oferta'} data-saved={saved.includes(job.slug)}>{saved.includes(job.slug)?'Guardado':'Guardar'}</button>
          <div className={styles.companyRow}><span className={styles.companyAvatar}>{initials(job.company)}</span><div><b>{job.company}</b><small>{job.area}</small></div></div>
          <h3>{job.title}</h3>
          <div className={styles.jobTagsV2}><span>{job.location}</span><span>{job.mode}</span><span>{job.schedule}</span></div>
          <p>{job.summary}</p>
          <div className={styles.jobFootV2}><span><i/>Fuente oficial revisada</span><Link href={`/empleos-preview/${job.slug}`} onClick={e=>e.stopPropagation()}>Abrir detalle</Link></div>
        </article>):<div className={styles.empty}>No encontramos ofertas con estos filtros. Probá otra área, una zona más amplia o modalidad remota.</div>}</div>
      </section>

      <aside className={styles.jobPreviewPane}>
        {selected?<div className={styles.jobPreviewInner}>
          <div className={styles.previewCompany}><span className={styles.companyAvatarLarge}>{initials(selected.company)}</span><div><span>{selected.company}</span><small>{selected.source}</small></div></div>
          <h2>{selected.title}</h2>
          <div className={styles.previewMeta}><span>{selected.location}</span><span>{selected.mode}</span><span>{selected.schedule}</span><span>{selected.area}</span></div>
          <div className={styles.matchTeaser}><div><span>MATCH EXPLICABLE</span><b>Disponible con tu perfil</b></div><p>Cuando iniciás sesión, comparamos requisitos explícitos con la información que vos autorizaste. Sin cajas negras ni descarte automático.</p></div>
          <div className={styles.previewSection}><strong>Resumen</strong><p>{selected.summary}</p></div>
          <div className={styles.previewSection}><strong>Antes de postularte</strong><ul>{selected.requirements.map(r=><li key={r}>{r}</li>)}</ul></div>
          <div className={styles.previewActions}><Link href={`/postulacion-preview/${selected.slug}`} className={styles.button}>Preparar postulación</Link><a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.buttonDark}>Ver fuente oficial</a></div>
          <div className={styles.previewSafety}>Postularse es gratis. CV Pro+ y Búsqueda Activa son herramientas opcionales para mejorar presentación, seguimiento y postulaciones inteligentes.</div>
        </div>:<div className={styles.empty}>Elegí una oportunidad para ver el detalle.</div>}
      </aside>
    </div>
  </div>
}
