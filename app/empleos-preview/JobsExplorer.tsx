'use client'

import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {useSearchParams} from 'next/navigation'
import {cvAuthClient} from '../cv-ia/cvAuth'
import type {PreviewJob} from '../postula-preview/jobs'
import styles from '../postula-preview/platform.module.css'
import {jobVisual} from './jobVisualCatalog'

const motivators=[
  'No necesitás encajar en todo para que una oportunidad valga la pena.',
  'Buscar trabajo también es trabajo. Acá intentamos hacerte esa parte más liviana.',
  'Una postulación bien elegida vale más que veinte enviadas sin mirar.',
  'Tu experiencia no es una lista de palabras: es contexto. Mostrala con claridad.',
]
const provinces=['CABA','Buenos Aires','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán']
const JOB_TIMEZONE='America/Argentina/Buenos_Aires'
const PAGE_SIZE=24
type ProfileMatch={city?:string;province?:string;skills?:string[];preferred_areas?:string[];work_modes?:string[];availability?:string;headline?:string}
type DateOrder='newest'|'oldest'|'default'

function norm(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
const cabaPlaces=['agronomia','almagro','balvanera','barracas','belgrano','boedo','caballito','chacarita','coghlan','colegiales','constitucion','flores','floresta','la boca','liniers','mataderos','monserrat','nueva pompeya','nunez','palermo','parque avellaneda','parque chacabuco','parque chas','parque patricios','paternal','puerto madero','recoleta','retiro','saavedra','san cristobal','san nicolas','san telmo','villa crespo','villa del parque','villa devoto','villa lugano','villa luro','villa ortuzar','villa pueyrredon','villa soldati','villa urquiza']
const gbaNorth=['vicente lopez','olivos','florida','munro','martinez','acassuso','beccar','san isidro','boulogne','tigre','general pacheco','pacheco','san fernando','pilar','tortuguitas','escobar','garin','benavidez']
const gbaWest=['castelar','moron','haedo','ituzaingo','ramos mejia','ciudadela','caseros','san justo','la matanza','merlo','hurlingham','moreno','liniers','tres de febrero']
const gbaSouth=['avellaneda','lanus','lomas de zamora','banfield','temperley','adrogue','burzaco','quilmes','bernal','berazategui','florencio varela','ezeiza','canning','monte grande','glew','longchamps','gerli','wilde']
const buenosAiresInterior=['la plata','mar del plata','bahia blanca','tandil','campana','zarate','lujan','san nicolas de los arroyos','pergamino','junin','necochea','olavarria']
const nonCity=new Set(['argentina','buenos aires','provincia de buenos aires','gba','gran buenos aires','zona norte','zona sur','zona oeste','zona norte gba','zona sur gba','zona oeste gba','remoto','hibrido','presencial','otras ubicaciones'])
function containsPlace(hay:string,places:string[]){return places.some(place=>hay.includes(place))}
function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
function logoStyle(job:PreviewJob){return job.logoUrl?{backgroundImage:`url(${job.logoUrl})`,backgroundSize:'contain',backgroundRepeat:'no-repeat',backgroundPosition:'center',backgroundColor:'#fff'}:undefined}
function compactLocation(value:string){const parts=value.split(' · ').map(x=>x.trim()).filter(Boolean);if(parts.length<=2)return value;const local=parts.filter(x=>/argentina|buenos aires|caba|capital federal/i.test(x));const chosen=(local.length?local:parts).slice(0,2);const hidden=Math.max(0,parts.length-chosen.length);return hidden?`${chosen.join(' · ')} · +${hidden} ubic.`:chosen.join(' · ')}
function inferProvince(location:string){
 const n=norm(location)
 if(/\bcaba\b|capital federal/.test(n)||containsPlace(n,cabaPlaces))return'CABA'
 if(/provincia de buenos aires|\bbuenos aires\b|\bgba\b/.test(n)||containsPlace(n,[...gbaNorth,...gbaWest,...gbaSouth,...buenosAiresInterior]))return'Buenos Aires'
 if(/\brosario\b|\bsanta fe\b/.test(n))return'Santa Fe'
 if(/\bcordoba\b/.test(n))return'Córdoba'
 if(/\bmendoza\b/.test(n))return'Mendoza'
 const found=provinces.filter(p=>p!=='CABA'&&p!=='Buenos Aires'&&p!=='Santa Fe'&&p!=='Córdoba'&&p!=='Mendoza').sort((a,b)=>b.length-a.length).find(p=>n.includes(norm(p)))
 return found||''
}
function inferCity(location:string,province:string){
 const whole=norm(location)
 const known=[...cabaPlaces,...gbaNorth,...gbaWest,...gbaSouth,...buenosAiresInterior,'rosario','cordoba','mendoza'].find(place=>whole.includes(place))
 if(known){const original=location.split(/[·|,]/).map(x=>x.trim()).find(x=>norm(x).includes(known));return original||known.replace(/\b\w/g,x=>x.toUpperCase())}
 const parts=location.split(/[·|,]/).map(x=>x.trim()).filter(Boolean)
 return parts.find(x=>{const n=norm(x);return n&&!nonCity.has(n)&&n!==norm(province)&&!/^provincia de /.test(n)&&!/otras ubicaciones/.test(n)&&!/^zona (norte|sur|oeste)/.test(n)})||''
}
function matchesLocation(job:PreviewJob,value:string){
 const requested=norm(value);if(!requested)return true;if(requested==='remoto')return job.mode==='Remoto'
 const where=norm(job.location);if(where.includes(requested))return true
 if(requested==='caba')return inferProvince(job.location)==='CABA'
 if(requested==='zona norte gba')return containsPlace(where,gbaNorth)
 if(requested==='zona oeste gba')return containsPlace(where,gbaWest)
 if(requested==='zona sur gba')return containsPlace(where,gbaSouth)
 return false
}
function words(value:string){return norm(value).split(/[^a-z0-9]+/).filter(x=>x.length>2)}
function matchScore(job:PreviewJob,profile:ProfileMatch){let score=0;const hay=norm(`${job.title} ${job.area} ${job.tags.join(' ')} ${job.summary}`);for(const area of profile.preferred_areas||[]){const a=norm(area);if(a&&hay.includes(a))score+=8;else if(words(a).some(w=>hay.includes(w)))score+=4}for(const skill of profile.skills||[]){const s=norm(skill);if(s&&hay.includes(s))score+=3;else if(words(s).some(w=>hay.includes(w)))score+=1}if(profile.headline){for(const w of words(profile.headline)){if(hay.includes(w))score+=1}}if(profile.province&&norm(job.location).includes(norm(profile.province)))score+=4;if(profile.city&&norm(job.location).includes(norm(profile.city)))score+=5;if((profile.work_modes||[]).some(m=>norm(m)===norm(job.mode)))score+=3;if(profile.availability&&words(profile.availability).some(w=>norm(job.schedule).includes(w)))score+=2;return score}
function argentinaDateKey(value:string|Date){if(typeof value==='string'){const raw=value.trim();if(!raw)return'';if(/^\d{4}-\d{2}-\d{2}$/.test(raw))return raw;value=raw}const date=value instanceof Date?value:new Date(value);if(Number.isNaN(date.getTime()))return'';const parts=new Intl.DateTimeFormat('en-CA',{timeZone:JOB_TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const year=parts.find(p=>p.type==='year')?.value||'',month=parts.find(p=>p.type==='month')?.value||'',day=parts.find(p=>p.type==='day')?.value||'';return year&&month&&day?`${year}-${month}-${day}`:''}
function dateKeyValue(key:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(key))return 0;const [year,month,day]=key.split('-').map(Number);return Date.UTC(year,month-1,day)}
function jobDateKey(job:PreviewJob){const key=argentinaDateKey(String(job.checkedAt||''));const today=argentinaDateKey(new Date());return key&&today&&dateKeyValue(key)>dateKeyValue(today)?today:key}
function jobDateValue(job:PreviewJob){return dateKeyValue(jobDateKey(job))}
function jobRecencyValue(job:PreviewJob){const parsed=Date.parse(String(job.checkedAt||''));return Number.isFinite(parsed)?Math.min(parsed,Date.now()):jobDateValue(job)}
function jobDateLabel(job:PreviewJob){const key=jobDateKey(job);if(!key)return'';const today=argentinaDateKey(new Date());const diff=Math.round((dateKeyValue(today)-dateKeyValue(key))/86400000);if(diff===0)return'Hoy';if(diff===1)return'Ayer';const [year,month,day]=key.split('-');return`${day}/${month}/${year.slice(-2)}`}
function jobDateTitle(job:PreviewJob){const key=jobDateKey(job);if(!key)return'';const [year,month,day]=key.split('-');return`Fecha de publicación o última actualización: ${day}/${month}/${year}`}

export default function JobsExplorer({jobs}:{jobs:PreviewJob[]}){
  const searchParams=useSearchParams(),initialQuery=searchParams.get('q')?.trim()||'',initialLocation=searchParams.get('location')?.trim()||''
  const [query,setQuery]=useState(initialQuery),[location,setLocation]=useState(initialLocation),[mode,setMode]=useState('Todos'),[area,setArea]=useState('Todas'),[schedule,setSchedule]=useState('Todos'),[province,setProvince]=useState('Todas'),[city,setCity]=useState('Todas'),[dateOrder,setDateOrder]=useState<DateOrder>('newest')
  const [selectedSlug,setSelectedSlug]=useState(jobs[0]?.slug||''),[saved,setSaved]=useState<string[]>([]),[profile,setProfile]=useState<ProfileMatch|null>(null),[profileOrder,setProfileOrder]=useState(searchParams.get('orden')==='perfil'),[profileNotice,setProfileNotice]=useState('')
  const [visibleCount,setVisibleCount]=useState(PAGE_SIZE)
  useEffect(()=>{const loadSaved=()=>{try{const parsed=JSON.parse(localStorage.getItem('pm_saved_jobs')||'[]');setSaved(Array.isArray(parsed)?parsed.filter(x=>typeof x==='string'):[])}catch{setSaved([])}};loadSaved();window.addEventListener('storage',loadSaved);(async()=>{const {data}=await cvAuthClient().auth.getSession();if(!data.session)return;const r=await fetch('/api/postula/profile',{headers:{Authorization:`Bearer ${data.session.access_token}`},cache:'no-store'});const d=await r.json().catch(()=>({}));if(r.ok&&d?.candidate)setProfile(d.candidate)})().catch(()=>{});return()=>window.removeEventListener('storage',loadSaved)},[])

  const areas=useMemo(()=>Array.from(new Set(jobs.map(j=>j.area))).sort((a,b)=>a.localeCompare(b)),[jobs])
  const jobPlaces=useMemo(()=>jobs.map(j=>{const p=inferProvince(j.location);return{job:j,province:p,city:inferCity(j.location,p)}}),[jobs])
  const provinceOptions=useMemo(()=>Array.from(new Set(jobPlaces.map(x=>x.province).filter(Boolean))).sort((a,b)=>provinces.indexOf(a)-provinces.indexOf(b)),[jobPlaces])
  const cityOptions=useMemo(()=>Array.from(new Set(jobPlaces.filter(x=>(province==='Todas'||x.province===province)&&x.city).map(x=>x.city))).sort((a,b)=>a.localeCompare(b,'es')),[jobPlaces,province])
  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase()
    const list=jobPlaces.filter(({job:j,province:p,city:c})=>{const haystack=`${j.title} ${j.company} ${j.location} ${j.area} ${j.tags.join(' ')}`.toLowerCase();return(!q||haystack.includes(q))&&matchesLocation(j,location)&&(mode==='Todos'||j.mode===mode)&&(area==='Todas'||j.area===area)&&(schedule==='Todos'||j.schedule.toLowerCase().includes(schedule.toLowerCase()))&&(province==='Todas'||p===province)&&(city==='Todas'||c===city)}).map(x=>x.job)
    if(profileOrder&&profile)return [...list].sort((a,b)=>matchScore(b,profile)-matchScore(a,profile)||jobRecencyValue(b)-jobRecencyValue(a)||a.title.localeCompare(b.title,'es'))
    if(dateOrder==='newest')return [...list].sort((a,b)=>jobRecencyValue(b)-jobRecencyValue(a)||a.title.localeCompare(b.title,'es'))
    if(dateOrder==='oldest')return [...list].sort((a,b)=>jobRecencyValue(a)-jobRecencyValue(b)||a.title.localeCompare(b.title,'es'))
    return list
  },[jobPlaces,query,location,mode,area,schedule,province,city,profileOrder,profile,dateOrder])
  const visibleJobs=useMemo(()=>filtered.slice(0,visibleCount),[filtered,visibleCount])
  useEffect(()=>{setVisibleCount(PAGE_SIZE)},[query,location,mode,area,schedule,province,city,dateOrder,profileOrder])
  useEffect(()=>{if(filtered.length&&!filtered.some(j=>j.slug===selectedSlug))setSelectedSlug(filtered[0].slug)},[filtered,selectedSlug])
  const selected=filtered.find(j=>j.slug===selectedSlug)||filtered[0]
  function toggleSaved(slug:string){const next=saved.includes(slug)?saved.filter(x=>x!==slug):[...saved,slug];setSaved(next);try{localStorage.setItem('pm_saved_jobs',JSON.stringify(next))}catch{}}
  function clear(){setMode('Todos');setArea('Todas');setSchedule('Todos');setLocation('');setQuery('');setProvince('Todas');setCity('Todas');setDateOrder('newest');setProfileOrder(false);setProfileNotice('')}
  async function orderByProfile(){if(profile){setProfileOrder(v=>!v);setProfileNotice(profileOrder?'Orden personalizado desactivado.':'Listo: priorizamos las oportunidades más parecidas a tu perfil.');return}const {data}=await cvAuthClient().auth.getSession();if(!data.session){window.location.assign('/login?next=/empleos?orden=perfil');return}setProfileNotice('Completá al menos área, zona o habilidades en tu perfil para poder ordenar mejor.');setTimeout(()=>window.location.assign('/mi-cuenta'),900)}

  return <div className="pm-jobs">
    <div className="pm-searchbar"><label className="pm-search-field"><span>Puesto o palabra clave</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ej. ventas, cocina, depósito"/></label><label className="pm-search-field"><span>Ubicación</span><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Ej. CABA, Rosario, remoto"/></label><button className="pm-search-button" type="button" onClick={()=>document.querySelector('.pm-results')?.scrollIntoView({behavior:'smooth',block:'start'})}>Buscar <small>{filtered.length}</small></button></div>
    <div className="pm-area-rail" aria-label="Áreas de empleo"><button data-active={area==='Todas'} onClick={()=>setArea('Todas')}>Todas las áreas</button>{areas.slice(0,10).map(a=><button key={a} data-active={area===a} onClick={()=>setArea(a)}>{a}</button>)}</div>
    <div className="pm-motivation"><span>PARA VOS</span><p>{profileOrder&&profile?'Tus resultados ahora están ordenados según lo que cargaste en tu perfil.':motivators[(query.length+area.length)%motivators.length]}</p><button type="button" data-on={profileOrder} onClick={()=>void orderByProfile()}>{profileOrder?'✓ Ordenado por mi perfil':'Ordenar con mi perfil'}</button></div>{profileNotice&&<div className="pm-profile-order-notice">{profileNotice}</div>}

    <div className="pm-workspace">
      <aside className="pm-filters"><div className="pm-filter-heading"><span>Filtros</span><button onClick={clear}>Limpiar</button></div>
        <div className="pm-filter-block"><strong>Ordenar</strong><label><span>Fecha</span><select value={profileOrder?'profile':dateOrder} onChange={e=>{const value=e.target.value;if(value==='profile'){void orderByProfile();return}setProfileOrder(false);setDateOrder(value as DateOrder);setProfileNotice('')}}><option value="newest">Más recientes primero</option><option value="oldest">Más antiguos primero</option><option value="default">Orden general</option>{profile&&<option value="profile">Afinidad con mi perfil</option>}</select></label></div>
        <div className="pm-filter-block pm-zone-filter"><strong>Zona</strong><label><span>Provincia</span><select value={province} onChange={e=>{setProvince(e.target.value);setCity('Todas')}}><option>Todas</option>{provinceOptions.map(x=><option key={x}>{x}</option>)}</select></label><label><span>Ciudad / localidad</span><select value={city} onChange={e=>setCity(e.target.value)}><option>Todas</option>{cityOptions.map(x=><option key={x}>{x}</option>)}</select></label></div>
        <div className="pm-filter-block"><strong>Modalidad</strong>{['Todos','Presencial','Híbrido','Remoto'].map(x=><label key={x}><input type="radio" name="mode" checked={mode===x} onChange={()=>setMode(x)}/><span>{x}</span></label>)}</div>
        <div className="pm-filter-block"><strong>Jornada</strong>{['Todos','Full time','Part time','Pasantía','Contrato'].map(x=><label key={x}><input type="radio" name="schedule" checked={schedule===x} onChange={()=>setSchedule(x)}/><span>{x}</span></label>)}</div>
        <div className="pm-filter-block"><strong>Área</strong><select value={area} onChange={e=>setArea(e.target.value)}><option>Todas</option>{areas.map(x=><option key={x}>{x}</option>)}</select></div>
        <div className="pm-discovery"><i/><div><b>Catálogo vivo</b><p>Consultamos fuentes públicas trazables y renovamos oportunidades cada seis horas. La publicación original siempre tiene prioridad.</p></div></div>
      </aside>

      <section className="pm-results" aria-live="polite"><div className="pm-results-head"><div><span>OPORTUNIDADES</span><strong>{filtered.length} resultados</strong></div><small>{profileOrder&&profile?'Ordenados por afinidad con tu perfil':dateOrder==='newest'?'Más recientes primero':dateOrder==='oldest'?'Más antiguos primero':'Catálogo general de Argentina'}</small></div><div className="pm-job-list">{filtered.length?visibleJobs.map(job=>{const visual=jobVisual(job),score=profile?matchScore(job,profile):0,dateLabel=jobDateLabel(job),isSaved=saved.includes(job.slug);return <article key={`${job.slug}-${job.company}`} className="pm-job-card" data-selected={selected?.slug===job.slug} onClick={()=>setSelectedSlug(job.slug)}>
          <div className="pm-job-visual" style={{backgroundImage:`url(${visual})`}}><span>{job.area}</span>{profileOrder&&profile&&score>0&&<b>{score>=12?'Muy afín':score>=6?'Buen match':'Relacionado'}</b>}</div>
          <button className="pm-save" onClick={e=>{e.stopPropagation();toggleSaved(job.slug)}} aria-label={isSaved?'Quitar de guardados':'Guardar oferta'} aria-pressed={isSaved} data-saved={isSaved}>{isSaved?'Guardado':'Guardar'}</button>
          <div className="pm-company-row"><span className="pm-company-avatar" style={logoStyle(job)}>{job.logoUrl?'':initials(job.company)}</span><div><b>{job.company}</b><small>{job.area}</small></div>{dateLabel&&<time dateTime={job.checkedAt} title={jobDateTitle(job)} style={{marginLeft:'auto',alignSelf:'start',padding:'5px 8px',borderRadius:'999px',background:dateLabel==='Hoy'?'#edffd9':'#f2f4f6',color:dateLabel==='Hoy'?'#497600':'#65717b',fontSize:'9px',fontWeight:900,whiteSpace:'nowrap'}}>{dateLabel}</time>}</div><h3>{job.title}</h3><div className="pm-job-tags"><span title={job.location}>{compactLocation(job.location)}</span><span>{job.mode}</span><span>{job.schedule}</span></div><p>{job.summary}</p><div className="pm-job-foot"><span><i/>{job.external?'Fuente pública':'Publicada en Postulá Mejor'}</span><Link href={`/empleos/${job.slug}`} onClick={e=>e.stopPropagation()}>Abrir detalle</Link></div></article>}):<div className="pm-empty">No encontramos ofertas con esos filtros. Probá otra zona, un área más amplia o modalidad remota.</div>}</div>{visibleJobs.length<filtered.length&&<div style={{display:'flex',justifyContent:'center',padding:'22px 0 6px'}}><button type="button" className={styles.buttonDark} onClick={()=>setVisibleCount(v=>Math.min(v+PAGE_SIZE,filtered.length))}>Ver más empleos · {filtered.length-visibleJobs.length} restantes</button></div>}</section>

      <aside className="pm-preview">{selected?<div className="pm-preview-inner"><div className="pm-preview-company"><span className="pm-company-avatar-lg" style={logoStyle(selected)}>{selected.logoUrl?'':initials(selected.company)}</span><div><span>{selected.company}</span><small>{selected.source}</small></div></div><h2>{selected.title}</h2><div className="pm-preview-meta"><span title={selected.location}>{compactLocation(selected.location)}</span><span>{selected.mode}</span><span>{selected.schedule}</span><span>{selected.area}</span>{jobDateLabel(selected)&&<span title={jobDateTitle(selected)}>{jobDateLabel(selected)}</span>}</div>{profile&&<div className="pm-match"><div><span>COINCIDENCIA EXPLICABLE</span><b>{matchScore(selected,profile)>7?'Se parece bastante a tu perfil':matchScore(selected,profile)>0?'Tiene algunos puntos en común':'Revisala por tus propios criterios'}</b></div><p>Comparamos únicamente datos laborales que vos cargaste —área, habilidades, zona, modalidad y disponibilidad— para ordenar resultados. No decide si una empresa debe contratarte.</p></div>}<div className="pm-preview-section"><strong>Resumen</strong><p>{selected.summary}</p></div><div className="pm-preview-section"><strong>Antes de postularte</strong><ul>{selected.requirements.map(r=><li key={r}>{r}</li>)}</ul></div><div className="pm-preview-actions"><Link href={`/postular/${selected.slug}`} className={styles.button}>{selected.external?'Preparar postulación':'Postularme ahora'}</Link>{selected.external&&<a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.buttonDark}>Ver fuente original</a>}</div><div className="pm-safety">Postularse es gratis. La fuente original tiene prioridad sobre cualquier resumen mostrado acá.</div></div>:<div className="pm-empty">Elegí una oportunidad para ver el detalle.</div>}</aside>
    </div>
  </div>
}
