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
function logoStyle(job:PreviewJob){return job.logoUrl?{backgroundImage:`url(${job.logoUrl})`,backgroundSize:'contain',backgroundRepeat:'no-repeat',backgroundPosition:'center',backgroundColor:'#fff'}:undefined}
function compactLocation(value:string){
  const parts=value.split(' · ').map(x=>x.trim()).filter(Boolean)
  if(parts.length<=2)return value
  const local=parts.filter(x=>/argentina|buenos aires|caba|capital federal/i.test(x))
  const chosen=(local.length?local:parts).slice(0,2)
  const hidden=Math.max(0,parts.length-chosen.length)
  return hidden?`${chosen.join(' · ')} · +${hidden} ubic.`:chosen.join(' · ')
}

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
  const filtered=useMemo(()=>jobs.filter(j=>{
    const q=query.trim().toLowerCase()
    const loc=location.trim().toLowerCase()
    const haystack=`${j.title} ${j.company} ${j.location} ${j.area} ${j.tags.join(' ')}`.toLowerCase()
    return (!q||haystack.includes(q))&&(!loc||j.location.toLowerCase().includes(loc)||(loc==='remoto'&&j.mode==='Remoto'))&&(mode==='Todos'||j.mode===mode)&&(area==='Todas'||j.area===area)&&(schedule==='Todos'||j.schedule.toLowerCase().includes(schedule.toLowerCase()))
  }),[jobs,query,location,mode,area,schedule])

  useEffect(()=>{if(filtered.length&&!filtered.some(j=>j.slug===selectedSlug))setSelectedSlug(filtered[0].slug)},[filtered,selectedSlug])
  const selected=filtered.find(j=>j.slug===selectedSlug)||filtered[0]

  function toggleSaved(slug:string){const next=saved.includes(slug)?saved.filter(x=>x!==slug):[...saved,slug];setSaved(next);try{localStorage.setItem('pm_saved_jobs',JSON.stringify(next))}catch{}}
  function clear(){setMode('Todos');setArea('Todas');setSchedule('Todos');setLocation('');setQuery('')}

  return <div className="pm-jobs">
    <div className="pm-searchbar">
      <label className="pm-search-field"><span>Puesto o palabra clave</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ej. ventas, administración, soporte"/></label>
      <label className="pm-search-field"><span>Ubicación</span><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Ej. CABA, Rosario, remoto"/></label>
      <button className="pm-search-button" type="button">Buscar <small>{filtered.length}</small></button>
    </div>

    <div className="pm-area-rail" aria-label="Áreas de empleo">
      <button data-active={area==='Todas'} onClick={()=>setArea('Todas')}>Todas las áreas</button>
      {areas.slice(0,10).map(a=><button key={a} data-active={area===a} onClick={()=>setArea(a)}>{a}</button>)}
    </div>

    <div className="pm-motivation"><span>PARA VOS</span><p>{motivators[(query.length+area.length)%motivators.length]}</p><Link href="/mi-cuenta">Ordenar mi búsqueda</Link></div>

    <div className="pm-workspace">
      <aside className="pm-filters">
        <div className="pm-filter-heading"><span>Filtros</span><button onClick={clear}>Limpiar</button></div>
        <div className="pm-filter-block"><strong>Modalidad</strong>{['Todos','Presencial','Híbrido','Remoto'].map(x=><label key={x}><input type="radio" name="mode" checked={mode===x} onChange={()=>setMode(x)}/><span>{x}</span></label>)}</div>
        <div className="pm-filter-block"><strong>Jornada</strong>{['Todos','Full time','Part time','Pasantía','Contrato'].map(x=><label key={x}><input type="radio" name="schedule" checked={schedule===x} onChange={()=>setSchedule(x)}/><span>{x}</span></label>)}</div>
        <div className="pm-filter-block"><strong>Área</strong><select value={area} onChange={e=>setArea(e.target.value)}><option>Todas</option>{areas.map(x=><option key={x}>{x}</option>)}</select></div>
        <div className="pm-discovery"><i/><div><b>Catálogo vivo</b><p>Consultamos fuentes públicas oficiales y renovamos oportunidades cada seis horas. La publicación original siempre tiene prioridad.</p></div></div>
      </aside>

      <section className="pm-results" aria-live="polite">
        <div className="pm-results-head"><div><span>OPORTUNIDADES</span><strong>{filtered.length} resultados</strong></div><small>Buenos Aires primero · luego Argentina</small></div>
        <div className="pm-job-list">{filtered.length?filtered.map(job=><article key={job.slug} className="pm-job-card" data-selected={selected?.slug===job.slug} onClick={()=>setSelectedSlug(job.slug)}>
          <button className="pm-save" onClick={e=>{e.stopPropagation();toggleSaved(job.slug)}} aria-label={saved.includes(job.slug)?'Quitar de guardados':'Guardar oferta'} data-saved={saved.includes(job.slug)}>{saved.includes(job.slug)?'Guardado':'Guardar'}</button>
          <div className="pm-company-row"><span className="pm-company-avatar" style={logoStyle(job)}>{job.logoUrl?'':initials(job.company)}</span><div><b>{job.company}</b><small>{job.area}</small></div></div>
          <h3>{job.title}</h3>
          <div className="pm-job-tags"><span title={job.location}>{compactLocation(job.location)}</span><span>{job.mode}</span><span>{job.schedule}</span></div>
          <p>{job.summary}</p>
          <div className="pm-job-foot"><span><i/>{job.external?'Fuente oficial':'Publicada en Postulá Mejor'}</span><Link href={`/empleos/${job.slug}`} onClick={e=>e.stopPropagation()}>Abrir detalle</Link></div>
        </article>):<div className="pm-empty">No encontramos ofertas con estos filtros. Probá otra área, una zona más amplia o modalidad remota.</div>}</div>
      </section>

      <aside className="pm-preview">
        {selected?<div className="pm-preview-inner">
          <div className="pm-preview-company"><span className="pm-company-avatar-lg" style={logoStyle(selected)}>{selected.logoUrl?'':initials(selected.company)}</span><div><span>{selected.company}</span><small>{selected.source}</small></div></div>
          <h2>{selected.title}</h2>
          <div className="pm-preview-meta"><span title={selected.location}>{compactLocation(selected.location)}</span><span>{selected.mode}</span><span>{selected.schedule}</span><span>{selected.area}</span></div>
          <div className="pm-match"><div><span>MATCH EXPLICABLE</span><b>Disponible con tu perfil</b></div><p>Al iniciar sesión comparamos requisitos explícitos con los datos que vos autorizaste. Sin descarte automático por características sensibles.</p></div>
          <div className="pm-preview-section"><strong>Resumen</strong><p>{selected.summary}</p></div>
          <div className="pm-preview-section"><strong>Antes de postularte</strong><ul>{selected.requirements.map(r=><li key={r}>{r}</li>)}</ul></div>
          <div className="pm-preview-actions"><Link href={`/postular/${selected.slug}`} className={styles.button}>{selected.external?'Preparar postulación':'Postularme ahora'}</Link>{selected.external&&<a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.buttonDark}>Ver fuente oficial</a>}</div>
          <div className="pm-safety">Postularse es gratis. CV Pro+ y Búsqueda Activa son opcionales: mejoran presentación, seguimiento y automatizaciones con confirmación del usuario.</div>
        </div>:<div className="pm-empty">Elegí una oportunidad para ver el detalle.</div>}
      </aside>
    </div>
  </div>
}
