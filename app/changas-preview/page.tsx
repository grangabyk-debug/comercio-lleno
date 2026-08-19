import Link from 'next/link'
import styles from '../postula-preview/platform.module.css'
import {PlatformFooter,PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import {gigCategories,previewGigs} from '../postula-preview/gigs'
import ChangasExplorer from './ChangasExplorer'
import '../postula-preview/premium-v6.css'
import '../postula-preview/premium-v7.css'

export const metadata={title:'Changas | Postulá Mejor Preview',description:'Tareas cortas, trabajos por hora y ayuda puntual cerca tuyo.',robots:{index:false,follow:false}}

const workerProfiles=[
 {name:'Mica S.',role:'Foto · redes · eventos',signal:'98% volvería a trabajar',jobs:'14 tareas verificadas',image:'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=500'},
 {name:'Facu R.',role:'Mudanzas · armado · logística',signal:'96% volvería a trabajar',jobs:'21 tareas verificadas',image:'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=500'},
 {name:'Cami P.',role:'Mascotas · paseos · cuidado',signal:'99% volvería a trabajar',jobs:'37 tareas verificadas',image:'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=500'},
 {name:'Nico G.',role:'Excel · soporte · tecnología',signal:'95% volvería a trabajar',jobs:'11 tareas verificadas',image:'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=500'},
]

export default function ChangasPage(){return <main className={`${styles.page} pm7-page pm7-candidate`}>
 <PlatformHeader/>
 <section className="pm7-gigs-hero"><div className="pm7-gigs-hero-inner"><div><span className="pm7-eyebrow lime">NUEVO · CHANGAS Y TAREAS</span><h1>¿Tenés unas horas?<br/><em>Hacé algo. Ganá algo.</em></h1><p>Una sección para trabajos puntuales, tareas por hora y necesidades concretas cerca tuyo. Sin convertir una changa en un proceso de selección de tres semanas.</p><div className="pm7-hero-actions"><a href="#explorar" className="pm7-btn-black">Ver tareas cerca</a><Link href="/empresas-preview" className="pm7-btn-white">Necesito publicar una tarea</Link></div></div><div className="pm7-gigs-stack"><article className="one"><span>HOY · PALERMO</span><h3>Armar dos muebles</h3><b>$38.000</b><small>3–4 horas</small></article><article className="two"><span>SÁBADO · CABALLITO</span><h3>Fotos + 4 reels</h3><b>$52.000</b><small>2 horas</small></article><article className="three"><span>FLEXIBLE · REMOTO</span><h3>Ordenar un Excel</h3><b>$44.000</b><small>2–3 horas</small></article><div className="pm7-gig-orbit"><i/><i/><i/></div></div></div></section>

 <section className="pm7-trust-strip"><div><b>Identidades verificables</b><span>sabés con quién hablás</span></div><div><b>Chat antes de aceptar</b><span>acordá tarea, horario y pago</span></div><div><b>Señales generales</b><span>sin listas negras ni puntajes secretos</span></div><div><b>Vos decidís</b><span>la plataforma no fuerza acuerdos</span></div></section>

 <section className="pm7-gig-explorer" id="explorar"><div className="pm7-section-head"><div><span className="pm7-eyebrow coral">CERCA TUYO</span><h2>Changas con contexto, no avisos crípticos.</h2></div><p>La idea es que antes de hablar ya sepas qué hay que hacer, cuánto tiempo lleva, cuánto pagan y quién publicó.</p></div><ChangasExplorer gigs={previewGigs} categories={gigCategories}/></section>

 <section className="pm7-people"><div className="pm7-section-head"><div><span className="pm7-eyebrow blue">COMUNIDAD</span><h2>Gente que ya resolvió tareas.</h2></div><p>La recomendación general muestra relaciones verificadas y cantidad de trabajos. No decide quién aparece o desaparece de una búsqueda.</p></div><div className="pm7-worker-row">{workerProfiles.map(p=><article key={p.name}><div className="pm7-worker-photo" style={{backgroundImage:`url(${p.image})`}}/><span className="pm7-online-dot"/><h3>{p.name}</h3><p>{p.role}</p><b>{p.signal}</b><small>{p.jobs}</small><button>Ver perfil</button></article>)}</div></section>

 <section className="pm7-gig-safety"><div className="pm7-gig-safety-inner"><div><span className="pm7-eyebrow lime">CHANGA ≠ CUALQUIER COSA</span><h2>Rápido puede ser simple. Nunca inseguro.</h2></div><div className="pm7-safety-grid"><article><span>01</span><b>Pago claro</b><p>El importe y la unidad —por hora, tarea o jornada— quedan visibles antes de contactar.</p></article><article><span>02</span><b>Identidad y contexto</b><p>Perfiles con señales verificables, historial de tareas y posibilidad de reportar abuso.</p></article><article><span>03</span><b>Sin reputación oscura</b><p>Una recomendación general no puede convertirse en descarte automático ni en lista negra.</p></article><article><span>04</span><b>Chat primero</b><p>Podés preguntar, confirmar detalles y retirarte antes de aceptar una tarea.</p></article></div></div></section>
 <PlatformFooter/><MobileNav active="changas"/>
 </main>}
