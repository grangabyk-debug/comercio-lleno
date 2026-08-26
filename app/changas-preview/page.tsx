import styles from '../postula-preview/platform.module.css'
import {PlatformFooter,PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import {gigCategories,previewGigs} from '../postula-preview/gigs'
import ChangasExplorer from './ChangasExplorer'
import ServicesFlexLegalGuard from './ServicesFlexLegalGuard'
import ServicesFlexCompactSafety from './ServicesFlexCompactSafety'
import '../postula-preview/premium-v6.css'
import '../postula-preview/premium-v7.css'
import './flex-credits-v21.css'
import './flex-polish-v27.css'
import './flex-media-v33.css'
import './flex-publish-v34.css'
import './flex-compact-safety-v35.css'
import './flex-neon-rules-v36.css'

export const metadata={title:{absolute:'Servicios Flex | Postulá Mejor'},description:'Tareas puntuales y servicios independientes concretos cerca tuyo, con contexto, chat y reglas claras antes de acordar.',robots:{index:true,follow:true},alternates:{canonical:'https://postulamejor.com/servicios-flex'}}

const workerProfiles=[
 {name:'Perfil creativo',role:'Foto · redes · eventos',signal:'Señales de confianza visibles',jobs:'Vista ilustrativa',image:'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=500'},
 {name:'Perfil operativo',role:'Mudanzas · armado · tareas puntuales',signal:'Historial cuando exista',jobs:'Vista ilustrativa',image:'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=500'},
 {name:'Perfil de cuidado animal',role:'Mascotas · paseos puntuales',signal:'Identidad y contexto',jobs:'Vista ilustrativa',image:'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=500'},
 {name:'Perfil digital',role:'Excel · soporte · tecnología',signal:'Experiencia explicable',jobs:'Vista ilustrativa',image:'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=500'},
]

export default function ServiciosFlexPage(){return <main className={`${styles.page} pm7-page pm7-candidate`}>
 <PlatformHeader/><ServicesFlexLegalGuard/>
 <section className="pm7-gigs-hero"><div className="pm7-gigs-hero-inner"><div><span className="pm7-eyebrow lime">NUEVO · SERVICIOS FLEX</span><h1>¿Necesitás resolver algo?<br/><em>Publicá una tarea puntual.</em></h1><p>Una sección para tareas concretas y servicios independientes con principio y fin definidos. No reemplaza una búsqueda laboral ni los regímenes especiales que puedan corresponder.</p><div className="pm7-hero-actions"><a href="#explorar" className="pm7-btn-black">Ver Servicios Flex</a><a href="/servicios-flex?clasificar=1" data-services-flex-publish="1" className="pm7-btn-white">Publicar un servicio</a></div><span className="pm-flex-device-note">Mensajes disponibles en PC y móvil</span></div><div className="pm7-gigs-stack"><article className="one"><span>HOY · PALERMO</span><h3>Armar dos muebles</h3><b>$38.000</b><small>3–4 horas</small></article><article className="two"><span>SÁBADO · CABALLITO</span><h3>Fotos + 4 reels</h3><b>$52.000</b><small>2 horas</small></article><article className="three"><span>FLEXIBLE · REMOTO</span><h3>Ordenar un Excel</h3><b>$44.000</b><small>2–3 horas</small></article><div className="pm7-gig-orbit"><i/><i/><i/></div></div></div></section>
 <section className="pm7-trust-strip"><div><b>Identidades verificables</b><span>sabés con quién hablás</span></div><div><b>Chat en PC y móvil</b><span>acordá alcance, fecha e importe</span></div><div><b>Pago entre las partes</b><span>Postulá Mejor no custodia el dinero del servicio</span></div><div><b>Vos decidís</b><span>la plataforma no fuerza acuerdos</span></div></section>
 <section className="pm7-gig-explorer" id="explorar"><div className="pm7-section-head"><div><span className="pm7-eyebrow coral">TAREAS PUNTUALES</span><h2>Servicios Flex con contexto, no avisos crípticos.</h2></div><p>Las publicaciones reales aparecen primero. Si todavía no hay servicios activos, mostramos ejemplos claramente identificados para explicar la experiencia.</p></div><ChangasExplorer gigs={previewGigs} categories={gigCategories}/></section>
 <section className="pm7-people"><div className="pm7-section-head"><div><h2>Qué señales vas a poder mirar antes de acordar.</h2></div><p>Estos perfiles son ejemplos de interfaz, no personas ni reputaciones reales. Cuando exista historial verificable, se mostrará con contexto y sin puntajes secretos.</p></div><div className="pm7-worker-row">{workerProfiles.map(p=><article key={p.name}><div className="pm7-worker-photo" style={{backgroundImage:`url(${p.image})`}}/><h3>{p.name}</h3><p>{p.role}</p><b>{p.signal}</b><small>{p.jobs}</small></article>)}</div></section>
 <ServicesFlexCompactSafety/>
 <PlatformFooter/><MobileNav active="changas"/>
 </main>}
