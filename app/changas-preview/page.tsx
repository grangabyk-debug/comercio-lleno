import Link from 'next/link'
import styles from '../postula-preview/platform.module.css'
import {PlatformFooter,PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import {gigCategories,previewGigs} from '../postula-preview/gigs'
import ChangasExplorer from './ChangasExplorer'
import '../postula-preview/premium-v6.css'
import '../postula-preview/premium-v7.css'

export const metadata={title:{absolute:'Trabajos Flex | Postulá Mejor'},description:'Tareas puntuales, trabajos por hora y servicios concretos cerca tuyo, con contexto y chat antes de acordar.',robots:{index:true,follow:true},alternates:{canonical:'https://postulamejor.com/trabajos-flex'}}

const workerProfiles=[
 {name:'Mica S.',role:'Foto · redes · eventos',signal:'98% volvería a trabajar',jobs:'14 tareas verificadas',image:'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=500'},
 {name:'Facu R.',role:'Mudanzas · armado · logística',signal:'96% volvería a trabajar',jobs:'21 tareas verificadas',image:'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=500'},
 {name:'Cami P.',role:'Mascotas · paseos · cuidado',signal:'99% volvería a trabajar',jobs:'37 tareas verificadas',image:'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=500'},
 {name:'Nico G.',role:'Excel · soporte · tecnología',signal:'95% volvería a trabajar',jobs:'11 tareas verificadas',image:'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=500'},
]

export default function TrabajosFlexPage(){return <main className={`${styles.page} pm7-page pm7-candidate`}>
 <PlatformHeader/>
 <section className="pm7-gigs-hero"><div className="pm7-gigs-hero-inner"><div><span className="pm7-eyebrow lime">NUEVO · TRABAJOS FLEX</span><h1>¿Tenés unas horas?<br/><em>Hacé algo. Ganá algo.</em></h1><p>Una sección para tareas puntuales, trabajos por hora y necesidades concretas cerca tuyo. Más simple que una búsqueda formal, pero con contexto, identidad y reglas claras.</p><div className="pm7-hero-actions"><a href="#explorar" className="pm7-btn-black">Ver Trabajos Flex</a><a href="#explorar" className="pm7-btn-white">Publicar una tarea</a></div></div><div className="pm7-gigs-stack"><article className="one"><span>HOY · PALERMO</span><h3>Armar dos muebles</h3><b>$38.000</b><small>3–4 horas</small></article><article className="two"><span>SÁBADO · CABALLITO</span><h3>Fotos + 4 reels</h3><b>$52.000</b><small>2 horas</small></article><article className="three"><span>FLEXIBLE · REMOTO</span><h3>Ordenar un Excel</h3><b>$44.000</b><small>2–3 horas</small></article><div className="pm7-gig-orbit"><i/><i/><i/></div></div></div></section>

 <section className="pm7-trust-strip"><div><b>Identidades verificables</b><span>sabés con quién hablás</span></div><div><b>Chat antes de aceptar</b><span>acordá tarea, horario y pago</span></div><div><b>Señales generales</b><span>sin listas negras ni puntajes secretos</span></div><div><b>Vos decidís</b><span>la plataforma no fuerza acuerdos</span></div></section>

 <section className="pm7-gig-explorer" id="explorar"><div className="pm7-section-head"><div><span className="pm7-eyebrow coral">CERCA TUYO</span><h2>Trabajos Flex con contexto, no avisos crípticos.</h2></div><p>Antes de hablar ya sabés qué hay que hacer, cuánto tiempo lleva, cuánto pagan y quién publicó. También podés publicar tu propia tarea desde esta misma sección.</p></div><ChangasExplorer gigs={previewGigs} categories={gigCategories}/></section>

 <section className="pm7-people"><div className="pm7-section-head"><div><span className="pm7-eyebrow blue">COMUNIDAD</span><h2>Gente que ya resolvió tareas.</h2></div><p>La recomendación general muestra relaciones verificadas y cantidad de trabajos. No decide quién aparece o desaparece de una búsqueda.</p></div><div className="pm7-worker-row">{workerProfiles.map(p=><article key={p.name}><div className="pm7-worker-photo" style={{backgroundImage:`url(${p.image})`}}/><span className="pm7-online-dot"/><h3>{p.name}</h3><p>{p.role}</p><b>{p.signal}</b><small>{p.jobs}</small><button>Ver perfil</button></article>)}</div></section>

 <section className="pm7-gig-safety"><div className="pm7-gig-safety-inner"><div><span className="pm7-eyebrow lime">FLEX ≠ CUALQUIER COSA</span><h2>Rápido puede ser simple. Nunca inseguro.</h2></div><div className="pm7-safety-grid"><article><span>01</span><b>Pago claro</b><p>El importe y la unidad —por hora, tarea o jornada— quedan visibles antes de contactar.</p></article><article><span>02</span><b>Identidad y contexto</b><p>Perfiles con señales verificables, historial de tareas y posibilidad de reportar abuso.</p></article><article><span>03</span><b>Sin reputación oscura</b><p>Una recomendación general no puede convertirse en descarte automático ni en lista negra.</p></article><article><span>04</span><b>Chat primero</b><p>Podés preguntar, confirmar detalles y retirarte antes de aceptar una tarea.</p></article></div><p style={{marginTop:20,fontSize:12,lineHeight:1.6,color:'#91a1ad'}}>Trabajos Flex está pensado para tareas realmente puntuales. Si la modalidad, dependencia y continuidad corresponden a una relación laboral, debe publicarse y gestionarse como empleo.</p></div></section>
 <PlatformFooter/><MobileNav active="changas"/>
 </main>}
