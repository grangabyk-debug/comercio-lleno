import Link from 'next/link'
import styles from './platform.module.css'
import {PlatformFooter,PlatformHeader,MobileNav} from './PlatformChrome'
import {getJobCatalog,type PreviewJob} from './jobs'
import {previewGigs} from './gigs'
import HomeCompanyRail from './HomeCompanyRail'
import './premium-v4.css'
import './premium-v5.css'
import './premium-v6.css'
import './premium-v7.css'

export const metadata={
 title:{absolute:'Postulá Mejor | Trabajo, CV y oportunidades'},
 description:'Empleos, Servicios Flex, CV, orientación y conversaciones en una experiencia laboral más humana.',
 robots:{index:true,follow:true},
 alternates:{canonical:'https://postulamejor.com/'},
 openGraph:{title:'Postulá Mejor | Trabajo, CV y oportunidades',description:'Empleos, Servicios Flex, CV, orientación y conversaciones en una experiencia laboral más humana.',url:'https://postulamejor.com/'},
 twitter:{card:'summary',title:'Postulá Mejor | Trabajo, CV y oportunidades',description:'Empleos, Servicios Flex, CV, orientación y conversaciones en una experiencia laboral más humana.'},
}
export const revalidate=21600

const categoryCards=[
 {title:'Gastronomía',copy:'Bar, cocina, salón, café',image:'https://images.pexels.com/photos/3771118/pexels-photo-3771118.jpeg?auto=compress&cs=tinysrgb&w=900'},
 {title:'Ventas',copy:'Retail, comercial, atención',image:'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=900'},
 {title:'Logística',copy:'Depósito, reparto, operaciones',image:'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg?auto=compress&cs=tinysrgb&w=900'},
 {title:'Administración',copy:'Oficina, soporte, finanzas',image:'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=900'},
]
const companyPriority=['Coca-Cola FEMSA','Despegar','PedidosYa','EY','Emi Labs','Cencosud']
function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
function jobVisual(area:string,index:number){const a=area.toLowerCase();if(/venta|comercial|atenci/.test(a))return 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200';if(/tecn|producto|dise/.test(a))return 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200';if(/admin|finan|audit/.test(a))return 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1200';return ['https://images.pexels.com/photos/3768126/pexels-photo-3768126.jpeg?auto=compress&cs=tinysrgb&w=1200','https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200'][index%2]}
function extraTag(job:PreviewJob){return job.tags.find(x=>x!==job.area&&x!==job.schedule)}
function buildHomeCompanies(jobs:PreviewJob[]){
 const map=new Map<string,{name:string;logo:string;count:number}>()
 for(const job of jobs){
  const name=String(job.company||'').trim();if(!name||job.confidential||!job.logoUrl)continue
  const key=name.toLocaleLowerCase('es-AR');const current=map.get(key)
  if(current){current.count+=1;if(!current.logo&&job.logoUrl)current.logo=job.logoUrl}else map.set(key,{name,logo:job.logoUrl,count:1})
 }
 const priority=new Map(companyPriority.map((name,index)=>[name.toLocaleLowerCase('es-AR'),index]))
 return [...map.values()].sort((a,b)=>{
  const ai=priority.get(a.name.toLocaleLowerCase('es-AR'));const bi=priority.get(b.name.toLocaleLowerCase('es-AR'))
  if(ai!==undefined||bi!==undefined){if(ai===undefined)return 1;if(bi===undefined)return-1;return ai-bi}
  return b.count-a.count||a.name.localeCompare(b.name,'es')
 }).slice(0,20)
}

const homePolishCss=`
.pm8-tool-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}
.pm7-social-job.pm7-home-job-link{display:block;color:inherit;text-decoration:none;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
.pm7-social-job.pm7-home-job-link:hover{transform:translateY(-4px);box-shadow:0 22px 48px rgba(31,38,55,.11);border-color:#d7dbe4}
.pm7-home-save{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.92);color:#20232a;font-size:20px;box-shadow:0 7px 18px rgba(17,24,39,.12)}
.pm7-home-open{font-weight:900;color:#17191f;white-space:nowrap}.pm7-home-job-link:hover .pm7-home-open{color:#6657ff}
@media(max-width:880px){.pm8-tool-grid{grid-template-columns:1fr!important}}
`

export default async function PostulaPreview(){
 const jobs=await getJobCatalog();const featured=jobs.slice(0,5);const homeCompanies=buildHomeCompanies(jobs)
 return <main className={`${styles.page} pm7-page pm7-candidate`}>
  <PlatformHeader/>
  <section className="pm7-hero"><div className="pm7-hero-bg one"/><div className="pm7-hero-bg two"/><div className="pm7-hero-inner">
   <div className="pm7-hero-copy"><span className="pm7-eyebrow coral">TRABAJO SIN CARA DE TRÁMITE</span><h1>Encontrá algo<br/>que te dé <em>ganas.</em></h1><p>Empleos, servicios flexibles, gente, empresas y herramientas para moverte. Más conversación, menos formulario eterno.</p><div className="pm7-search"><div><small>¿Qué querés hacer?</small><b>ventas, café, diseño, logística…</b></div><div><small>¿Dónde?</small><b>CABA y Buenos Aires</b></div><Link href="/empleos">Buscar</Link></div><div className="pm7-hero-actions"><Link href="/empleos" className="pm7-btn-black">Explorar empleos</Link><Link href="/mejorar-cv" className="pm7-btn-glass">Mejorar mi CV</Link><Link href="/servicios-flex" className="pm7-btn-glass">Ver Servicios Flex</Link></div><div className="pm7-hero-proof"><span><i/>Postularte es gratis</span><span><i/>Tu perfil es tuyo</span><span><i/>La IA explica, no decide</span></div></div>
   <div className="pm7-hero-visual"><div className="pm7-main-photo"><div className="pm7-main-photo-image"/><div className="pm7-photo-caption"><span>EJEMPLO DE INTERFAZ</span><b>Barista · Café de especialidad</b><small>Presencial · Turno mañana</small></div></div><div className="pm7-float-job"><span className="pm7-float-logo">PM</span><div><small>EJEMPLO DE OPORTUNIDAD</small><b>Vendedor/a · Shopping</b><span>Ubicación y distancia al abrir el aviso</span></div><strong>→</strong></div><div className="pm7-float-msg"><div className="pm7-chat-avatar">PM</div><p><b>Ejemplo de mensaje</b><span>Una empresa puede escribirte desde una postulación real.</span></p><small>vista demo</small></div><div className="pm7-float-match"><b>IA</b><span>Match explicable</span><small>te mostramos por qué</small></div></div>
  </div></section>

  <HomeCompanyRail companies={homeCompanies}/>
  <style dangerouslySetInnerHTML={{__html:homePolishCss}}/>

  <section className="pm8-tools"><div className="pm8-tools-head"><div><span className="pm7-eyebrow coral">HERRAMIENTAS GRATIS</span><h2>Tu perfil también se puede entrenar.</h2></div><p>No tenés que comprar nada para empezar. Creá una cuenta simple y usá el diagnóstico ATS, el test vocacional y el creador de primer CV.</p></div><div className="pm8-tool-grid">
   <Link href="/mejorar-cv" className="pm8-tool"><i/><span>ATS + diagnóstico</span><h3>Mejorá el CV que ya tenés.</h3><p>Subilo, elegí un puesto y entendé qué ve un sistema ATS, un recruiter y quien contrata.</p><b>Analizar gratis →</b></Link>
   <Link href="/primer-cv" className="pm8-tool"><i/><span>Primer CV</span><h3>Empezá aunque todavía no tengas experiencia.</h3><p>Estudios, proyectos, habilidades y trabajos informales convertidos en un CV claro sin inventar nada.</p><b>Crear mi CV →</b></Link>
   <Link href="/test-vocacional" className="pm8-tool"><i/><span>Orientación</span><h3>Descubrí áreas que pueden ir con vos.</h3><p>Un test breve de intereses para abrir opciones y conectarlas con búsquedas reales de la plataforma.</p><b>Hacer el test →</b></Link>
  </div></section>

  <section className="pm7-discover"><div className="pm7-section-head"><div><span className="pm7-eyebrow blue">DESCUBRÍ TU LUGAR</span><h2>No todos buscan lo mismo.<br/>Por suerte.</h2></div><p>Entrá por rubro, por cercanía o por lo que te gustaría probar. La experiencia se parece más a descubrir contenido que a navegar una planilla.</p></div><div className="pm7-category-grid">{categoryCards.map((c,i)=><Link href="/empleos" key={c.title} className={`pm7-category-card c${i}`} style={{backgroundImage:`url(${c.image})`}}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{c.title}</h3><p>{c.copy}</p></div><b>→</b></Link>)}</div></section>

  <section className="pm7-feed"><div className="pm7-feed-layout"><div className="pm7-feed-main"><div className="pm7-feed-title"><div><span className="pm7-eyebrow coral">OPORTUNIDADES</span><h2>Un catálogo que se renueva.</h2></div><Link href="/empleos">Ver todas</Link></div><div className="pm7-social-job-list">{featured.map((job,i)=>{const tag=extraTag(job);return <Link className="pm7-social-job pm7-home-job-link" href={`/empleos/${job.slug}`} key={job.slug} aria-label={`Ver ${job.title} en ${job.company}`}><div className="pm7-social-job-cover" style={{backgroundImage:`url(${jobVisual(job.area,i)})`}}><span>{job.mode}</span><span className="pm7-home-save" aria-hidden="true">♡</span></div><div className="pm7-social-job-body"><div className="pm7-social-company"><span>{initials(job.company)}</span><div><b>{job.company}</b><small>{job.location}</small></div><em>catálogo actualizado</em></div><h3>{job.title}</h3><p>{job.summary}</p><div className="pm7-social-tags"><span>{job.area}</span><span>{job.schedule}</span>{tag&&<span>{tag}</span>}</div><div className="pm7-social-job-foot"><span><i/>{job.external?'Fuente oficial revisada':'Publicada en Postulá Mejor'}</span><span className="pm7-home-open">Ver trabajo →</span></div></div></Link>})}</div></div>
   <aside className="pm7-feed-side"><div className="pm7-profile-card"><div className="pm7-profile-top"><span className="pm7-profile-avatar">PM</span><div><small>TU PERFIL</small><b>Completalo a tu ritmo</b></div></div><div className="pm7-profile-progress"><i/><span>Tu cuenta</span></div><p>Sumá zona, habilidades, disponibilidad y tu CV para recibir mejores oportunidades.</p><Link href="/mi-cuenta">Completar mi perfil</Link></div><div className="pm7-side-card"><span>MENSAJES</span><h3>Si una empresa te escribe, el chat se abre completo en el celular.</h3><p>Vos respondés por texto. Si el empleador dicta un audio, recibís su transcripción, no el archivo de voz.</p><Link href="/mensajes">Abrir mensajes →</Link></div><div className="pm7-side-card dark"><span>CATÁLOGO ACTUAL</span><h3>{jobs.length} oportunidades visibles.</h3><p>Fuentes trazables, Buenos Aires primero y renovación periódica.</p><Link href="/empleos">Abrir explorador →</Link></div></aside></div></section>

  <section className="pm7-changas-band"><div className="pm7-changas-head"><div><span className="pm7-eyebrow black">SERVICIOS FLEX · VISTA ILUSTRATIVA</span><h2>Una tarde libre también puede ser una oportunidad.</h2></div><p>Estas tarjetas son ejemplos del formato. Los servicios reales, cuando existan, se identifican dentro de Servicios Flex.</p></div><div className="pm7-changa-row">{previewGigs.slice(0,4).map((g,i)=><Link href="/servicios-flex" key={g.id} className={`pm7-changa-mini g${i}`}><div className="pm7-changa-mini-img" style={{backgroundImage:`url(${g.image})`}}><span>EJEMPLO</span></div><div><small>{g.category}</small><h3>{g.title}</h3><div><b>{g.pay}</b><span>{g.duration}</span></div><p>{g.location}</p></div></Link>)}</div><div className="pm7-changas-cta"><Link href="/servicios-flex" className="pm7-btn-black">Explorar Servicios Flex</Link><span>Para servicios puntuales. No reemplaza relaciones laborales cuando corresponden.</span></div></section>

  <section className="pm7-motion"><div className="pm7-motion-media"><video autoPlay muted loop playsInline preload="metadata" poster="https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=1400"><source src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Buenos_Aires_-_Argentina.webm" type="video/webm"/></video><div className="pm7-motion-badge"><i/>BUENOS AIRES EN MOVIMIENTO</div></div><div className="pm7-motion-copy"><span className="pm7-eyebrow lime">NO TODO EMPIEZA IGUAL</span><h2>Primer trabajo.<br/>Cambio de rubro.<br/>Un Servicio Flex.<br/><em>Todo suma.</em></h2><p>La marca no debería hablarle sólo a gente con un CV perfecto. Queremos acompañar a quien necesita empezar, volver, probar algo nuevo o simplemente generar un ingreso esta semana.</p><div className="pm7-motion-quotes"><blockquote>Ejemplo de objetivo: “Busco algo cerca para poder estudiar y trabajar.”<span>— necesidad frecuente</span></blockquote><blockquote>Ejemplo de objetivo: “Quiero cambiar de rubro sin sentir que arranco de cero.”<span>— necesidad frecuente</span></blockquote></div></div></section>

  <section className="pm7-social-proof"><div className="pm7-social-proof-head"><span className="pm7-eyebrow blue">EJEMPLO DE EXPERIENCIA</span><h2>La conversación es parte del trabajo.</h2><p>La escena de abajo es ilustrativa: muestra cómo pueden convivir recomendaciones, mensajes y actividad sin simular usuarios o resultados reales.</p></div><div className="pm7-conversation-stage"><div className="pm7-phone-chat"><header><span>←</span><div className="pm7-chat-face">PM</div><p><b>Postulá Mejor</b><small>ejemplo de búsqueda</small></p><i/></header><div className="pm7-bubble incoming">Ejemplo: encontré trabajos nuevos que coinciden con la zona y preferencias elegidas.</div><div className="pm7-bubble outgoing">Mostrame los de ventas y atención.</div><div className="pm7-bubble incoming">Ejemplo: los ordené por requisitos explícitos y te muestro la fuente de cada aviso.</div><div className="pm7-chat-compose"><span>＋</span><div>Vista ilustrativa…</div><b>↑</b></div></div><div className="pm7-floating-community"><article><span className="pm7-community-face a"/><div><b>Ejemplo · entrevista confirmada</b><small>Así puede verse una actualización de estado</small></div></article><article><span className="pm7-community-face b"/><div><b>Ejemplo · Servicio Flex completado</b><small>La actividad real sólo aparece con datos reales</small></div></article><article><span className="pm7-community-face c"/><div><b>Ejemplo · nueva oportunidad</b><small>Zona y distancia se muestran cuando correspondan</small></div></article></div></div></section>

  <section className="pmv6-faq pm7-faq"><div className="pmv6-faq-inner"><div className="pmv6-faq-head"><div><span className="pm7-eyebrow lime">PREGUNTAS FRECUENTES</span><h2>Simple también significa claro.</h2></div><p>Qué es gratis, qué hace la IA, cómo funcionan los Servicios Flex y qué pasa con tus datos.</p></div><div className="pmv6-faq-list"><details><summary>¿Postularme sigue siendo gratis?</summary><p>Sí. Buscar, guardar, crear tu perfil, hacer el test y postularte con las funciones básicas no requiere un plan pago. CV Pro+ y Búsqueda Activa agregan herramientas opcionales por 30 días.</p></details><details><summary>¿Qué diferencia hay entre un empleo y un Servicio Flex?</summary><p>Servicios Flex está pensado para servicios puntuales o tareas breves. Cuando una relación por su realidad corresponde a empleo formal, la plataforma no debería disfrazarla como tarea independiente.</p></details><details><summary>¿La IA decide por mí?</summary><p>No. Puede ordenar, resumir, explicar coincidencias y ayudarte a preparar una postulación. No toma la decisión final de contratar o aceptar un trabajo.</p></details><details><summary>¿Qué pasa con una recomendación laboral?</summary><p>Se trata como una señal general y verificable. No funciona como lista negra ni como descarte automático, y la persona debe poder verla y pedir revisión.</p></details></div></div></section>
  <section className="pm7-final"><div><span>POSTULÁ MEJOR</span><h2>Encontrar trabajo puede sentirse un poco más humano.</h2></div><div><Link href="/acceso?modo=crear" className="pm7-btn-black">Crear mi cuenta gratis</Link><Link href="/empresas" className="pm7-btn-white">Soy empleador</Link></div></section>
  <PlatformFooter/><MobileNav active="inicio"/>
 </main>
}
