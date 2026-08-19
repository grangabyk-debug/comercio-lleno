import Link from 'next/link'
import EmployerDemo from './EmployerDemo'
import styles from './empresas-preview.module.css'

export const metadata={title:'Postulá Mejor Empresas | Preview',description:'Publicación y selección asistida por agentes de IA para PyMEs y comercios.',robots:{index:false,follow:false}}

const agents=[
 ['01','Publicador','Le contás a quién necesitás. Convierte eso en un aviso claro, requisitos y preguntas filtro.'],
 ['02','Selector','Ordena postulaciones por ajuste al puesto y explica por qué cada perfil puede encajar.'],
 ['03','Entrevistador','Prepara preguntas distintas para cada finalista según lo que falta confirmar.'],
 ['04','Seguimiento','Te deja listos mensajes para avanzar, coordinar, pedir datos o cerrar el proceso con respeto.'],
]

export default function EmpresasPreview(){
 return <main className={styles.page}>
  <header className={styles.header}>
    <Link href="/postula-preview" className={styles.brand}><span className={styles.brandMark}>PM</span><span><b>Postulá Mejor</b><small>EMPRESAS</small></span></Link>
    <nav><a href="#como">Cómo funciona</a><a href="#agentes">Agentes IA</a><a href="#planes">Planes</a></nav>
    <div className={styles.headerActions}><Link href="/postula-preview">Volver</Link><a href="#demo" className={styles.darkBtn}>Probar demo</a></div>
  </header>

  <section className={styles.hero}>
    <div className={styles.heroCopy}>
      <span className={styles.eyebrow}>SELECCIÓN PARA EQUIPOS CHICOS · SIN ATS COMPLICADO</span>
      <h1>Publicá fácil.<br/><em>La IA te muestra a quién entrevistar primero.</em></h1>
      <p>Para comercios, PyMEs, hoteles, gastronomía y equipos que necesitan contratar bien sin sumar una plataforma de Recursos Humanos imposible de aprender.</p>
      <div className={styles.heroActions}><a className={styles.primary} href="#demo">Crear una búsqueda de prueba</a><a className={styles.secondary} href="#como">Ver cómo funciona</a></div>
      <div className={styles.microTrust}><span>Sin tarjeta para empezar</span><span>Recomendaciones explicadas</span><span>La decisión siempre es humana</span></div>
    </div>
    <div className={styles.heroPanel}>
      <div className={styles.panelHeader}><span>BÚSQUEDA ACTIVA</span><b>Vendedor/a · Belgrano</b><small>36 postulaciones</small></div>
      <div className={styles.pipeline}><span>RECIBIDOS <b>36</b></span><span>IA REVISÓ <b>36</b></span><span>SHORTLIST <b>5</b></span><span>ENTREVISTA <b>3</b></span></div>
      <div className={styles.heroCandidate}><strong>94</strong><div><b>Martina R.<small>RECOMENDADA</small></b><p>Caja + venta presencial + disponibilidad compatible.</p></div></div>
      <div className={styles.heroCandidate}><strong>87</strong><div><b>Nicolás G.<small>MUY BUEN MATCH</small></b><p>Atención al cliente + objetivos + experiencia POS.</p></div></div>
      <div className={styles.agentPulse}><i/><span><b>4 agentes terminaron el análisis</b><small>Todo lo recomendado incluye una explicación.</small></span></div>
    </div>
  </section>

  <section className={styles.problem}>
    <div><span>EL PROBLEMA NO ES PUBLICAR</span><h2>Es qué hacer cuando llegan 40 CV y vos además tenés un negocio que atender.</h2></div>
    <div className={styles.problemStats}><article><strong>1</strong><p>pedido simple para crear el aviso</p></article><article><strong>100%</strong><p>de los candidatos comparados con los mismos requisitos</p></article><article><strong>5</strong><p>finalistas claros en vez de una bandeja infinita</p></article></div>
  </section>

  <section className={styles.how} id="como">
    <div className={styles.sectionTitle}><span>DE LA NECESIDAD A LA ENTREVISTA</span><h2>Contratar sin convertirse en recruiter.</h2><p>Diseñado para una persona que sabe a quién necesita, pero no quiere aprender un ATS entero para cubrir un puesto.</p></div>
    <div className={styles.steps}><article><i>01</i><h3>Contanos qué necesitás</h3><p>Escribí como hablás: puesto, zona, horarios y lo indispensable.</p></article><article><i>02</i><h3>Publicá en minutos</h3><p>La IA ordena el pedido, arma el aviso y propone preguntas filtro.</p></article><article><i>03</i><h3>Recibí y ordená</h3><p>Los CV quedan deduplicados, resumidos y comparados con criterios consistentes.</p></article><article><i>04</i><h3>Entrevistá mejor</h3><p>Recibís shortlist, razones y preguntas específicas para validar lo importante.</p></article></div>
  </section>

  <section className={styles.agentsSection} id="agentes">
    <div className={styles.sectionTitleLight}><span>NO ES UN CHAT SUELTO</span><h2>Un pequeño equipo de agentes trabajando por tu búsqueda.</h2><p>Cada agente tiene una tarea concreta. Se pasan contexto entre sí y dejan una salida que una persona puede revisar.</p></div>
    <div className={styles.agentGrid}>{agents.map(([n,title,copy])=><article key={n}><i>{n}</i><div><h3>Agente {title}</h3><p>{copy}</p></div><span>IA ASISTIDA</span></article>)}</div>
    <div className={styles.guardrail}><b>Lo importante</b><p>El score ayuda a ordenar; no contrata ni descarta por sí solo. La recomendación muestra sus motivos y evita usar características protegidas como criterio de selección.</p></div>
  </section>

  <section className={styles.demoSection} id="demo">
    <div className={styles.sectionTitle}><span>PROBALO SIN PUBLICAR NADA</span><h2>Así se siente del lado del empleador.</h2><p>Esta demo es interactiva, pero trabaja sólo con datos de ejemplo: no crea avisos públicos ni contacta candidatos.</p></div>
    <EmployerDemo/>
  </section>

  <section className={styles.plans} id="planes">
   <div className={styles.sectionTitle}><span>ENTRADA BAJA, VALOR CLARO</span><h2>Pagá según cuánto contratás.</h2><p>La propuesta evita obligar a un comercio que contrata dos veces al año a pagar un software corporativo todos los meses.</p></div>
   <div className={styles.planGrid}>
    <article><span>GRATIS</span><h3>$0</h3><p>Para publicar la primera necesidad.</p><ul><li>1 búsqueda activa</li><li>Hasta 20 postulaciones</li><li>Filtros básicos</li><li>1 análisis IA de muestra</li></ul><button>Empezar gratis</button></article>
    <article className={styles.featured}><span>SELECCIÓN EXPRESS</span><h3>$12.900 <small>/ búsqueda</small></h3><p>Para resolver una contratación sin suscripción.</p><ul><li>Hasta 50 CV</li><li>Ranking + explicación</li><li>Shortlist automático</li><li>Preguntas para entrevista</li></ul><button>Analizar una búsqueda</button></article>
    <article><span>PRO</span><h3>$24.900 <small>/ mes</small></h3><p>Para equipos que contratan seguido.</p><ul><li>3 búsquedas activas</li><li>Hasta 150 CV/mes</li><li>4 agentes IA</li><li>Pipeline + plantillas</li></ul><button>Elegir Pro</button></article>
   </div>
   <small className={styles.priceNote}>Precios conceptuales para validar la propuesta comercial antes de publicar.</small>
  </section>

  <section className={styles.finalCta}><span>POSTULÁ MEJOR EMPRESAS</span><h2>Menos tiempo leyendo CV.<br/>Más claridad para decidir.</h2><a href="#demo">Probar el flujo de empleador</a></section>
  <footer className={styles.footer}><Link href="/postula-preview">Postulá Mejor</Link><span>Preview de producto · no indexado · no publicado como oferta comercial todavía</span></footer>
 </main>
}
