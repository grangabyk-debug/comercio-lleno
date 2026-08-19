import Link from 'next/link'
import styles from './platform.module.css'
import {PlatformFooter,PlatformHeader,MobileNav} from './PlatformChrome'
import {previewJobs} from './jobs'

export const metadata={title:'Postulá Mejor | Empleo y selección con tecnología',description:'Buscá trabajo, mejorá tu perfil o contratá con una plataforma simple y asistida por IA.',robots:{index:false,follow:false}}

export default function PostulaPreview(){
  return <main className={styles.page}>
    <PlatformHeader/>
    <section className={styles.hero}>
      <div className={styles.heroGrid}>
        <div>
          <span className={styles.eyebrow}>Una nueva capa para el mercado laboral</span>
          <h1>Menos ruido.<br/><em>Mejores encuentros.</em></h1>
          <p className={styles.heroLead}>Postulá Mejor conecta dos experiencias distintas: una persona que quiere conseguir trabajo sin perderse entre formularios, y una empresa que necesita encontrar talento sin leer cientos de CV a ciegas.</p>
          <div className={styles.heroActions}><Link href="/empleos-preview" className={styles.button}>Buscar empleo</Link><Link href="/empresas-preview" className={styles.buttonGhost}>Necesito contratar</Link></div>
          <div className={styles.heroMicro}><span><i/>Postularse es gratis</span><span><i/>IA que explica, no decide</span><span><i/>Experiencia pensada para celular</span></div>
        </div>
        <div className={styles.signal} aria-label="Vista conceptual de coincidencias entre personas y búsquedas">
          <div className={styles.signalTop}><span>Motor de coincidencia</span><span className={styles.pulse}><i/>señal activa</span></div>
          <article className={styles.candidateCard}><div className={styles.candidateHead}><div className={styles.avatar}>LM</div><div><strong>Lucía · Atención al cliente</strong><span>Experiencia + disponibilidad</span></div><div className={styles.match}>86%</div></div><div className={styles.meter}><i/></div><div className={styles.reasons}><span>3 requisitos fuertes</span><span>Zona compatible</span><span>Turno compatible</span></div></article>
          <article className={styles.candidateCard}><div className={styles.candidateHead}><div className={styles.avatar}>FR</div><div><strong>Franco · Comercial</strong><span>Ventas + turismo</span></div><div className={styles.match}>91%</div></div><div className={styles.meter}><i style={{width:'91%'}}/></div><div className={styles.reasons}><span>Experiencia relevante</span><span>Disponibilidad completa</span></div></article>
        </div>
      </div>
    </section>

    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionHead}><div><p>Dos puertas, una identidad</p><h2>Entrá por lo que necesitás hoy.</h2></div><p>La cuenta, el tablero y las herramientas cambian según tu rol. Un candidato no ve un ATS disfrazado; un empleador no ve una web de currículums reciclada.</p></div>
        <div className={styles.pathGrid}>
          <Link href="/empleos-preview" className={styles.pathCard}><span className={styles.miniLabel}>Candidatos</span><h3>Quiero trabajar.</h3><p>Explorá ofertas reales, guardá oportunidades, reutilizá tu CV, seguí tus postulaciones y elegí cuánto querés automatizar.</p><div className={styles.pathFoot}><span>Empezar gratis</span><span className={styles.pathArrow}>→</span></div></Link>
          <Link href="/empresas-preview" className={`${styles.pathCard} ${styles.pathCardDark}`}><span className={styles.miniLabel}>Empleadores</span><h3>Quiero contratar.</h3><p>Publicá en minutos, definí filtros relevantes y dejá que agentes especializados ordenen el trabajo pesado sin reemplazar tu decisión.</p><div className={styles.pathFoot}><span>Conocer la plataforma</span><span className={styles.pathArrow}>→</span></div></Link>
        </div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.jobsBand}`}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionHead}><div><p>Ofertas verificadas al 19/08/2026</p><h2>Empleos para explorar ahora.</h2></div><p>Durante esta etapa mostramos también búsquedas externas con fuente y enlace originales. Nunca simulamos representar a una empresa que todavía no trabaja con Postulá Mejor.</p></div>
        <div className={styles.jobList}>{previewJobs.slice(0,3).map((job,i)=><Link href={`/empleos-preview/${job.slug}`} className={styles.jobCard} key={job.slug}><div><div className={styles.jobCompany}><span className={styles.companyLogo}>{job.company.slice(0,2).toUpperCase()}</span><span>{job.company} · {job.area}</span></div><h3>{job.title}</h3><div className={styles.jobMeta}><span>{job.location}</span><span>{job.mode}</span><span>{job.schedule}</span></div></div><div className={styles.jobScore}><span className={styles.external}>Fuente externa</span><div className={styles.scoreRing}><span>{84-i*4}%</span></div></div></Link>)}</div>
        <div className={styles.heroActions}><Link href="/empleos-preview" className={styles.buttonDark}>Ver todas las ofertas</Link><Link href="/mi-postula-preview" className={styles.buttonLight}>Abrir mi tablero</Link></div>
      </div>
    </section>

    <section className={styles.section}><div className={styles.sectionInner}><div className={styles.sectionHead}><div><p>Escalera de valor</p><h2>Gratis para entrar. Más tecnología cuando la necesitás.</h2></div><p>La postulación a empleos permanece gratuita. Los planes del candidato agregan herramientas: CV Pro+, plantillas avanzadas, análisis de coincidencia y Búsqueda Activa.</p></div><div className={styles.flow}><div className={styles.flowCard}><span className={styles.flowNo}>01</span><h3>Cuenta gratis</h3><p>Buscar, guardar, cargar CV propio, postularse a búsquedas nativas y seguir estados.</p></div><div className={styles.flowCard}><span className={styles.flowNo}>02</span><h3>CV Pro+</h3><p>Mejora de contenido, versiones del CV y plantillas profesionales propias.</p></div><div className={styles.flowCard}><span className={styles.flowNo}>03</span><h3>Match explicado</h3><p>Entender por qué una oferta encaja, qué falta y qué conviene destacar.</p></div><div className={styles.flowCard}><span className={styles.flowNo}>04</span><h3>Búsqueda Activa</h3><p>Radar, preparación y postulaciones asistidas con límites de calidad y confirmación humana.</p></div></div></div></section>
    <PlatformFooter/><MobileNav active="inicio"/>
  </main>
}
