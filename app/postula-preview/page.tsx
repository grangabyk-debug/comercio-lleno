import Link from 'next/link'
import styles from './postula-preview.module.css'

export const metadata={
  title:'Postulá Mejor | Personas y empresas',
  description:'Una plataforma con IA para buscar trabajo y contratar mejor.',
  robots:{index:false,follow:false},
}

export default function PostulaPreview(){
  return <main className={styles.page}>
    <header className={styles.header}>
      <Link href="/postula-preview" className={styles.brand}><span className={styles.mark}>PM</span><span>Postulá Mejor</span></Link>
      <span className={styles.preview}>PREVIEW · ECOSISTEMA</span>
    </header>

    <section className={styles.hero}>
      <div className={styles.copy}>
        <span className={styles.eyebrow}>EMPLEO + INTELIGENCIA ARTIFICIAL</span>
        <h1>Contratá mejor.<br/><em>Postulá mejor.</em></h1>
        <p>Una sola plataforma para los dos lados de una búsqueda laboral. Ayudamos a las personas a presentarse mejor y a los empleadores a encontrar, ordenar y entrevistar candidatos sin perder horas leyendo CV.</p>
        <div className={styles.trust}><span>IA explicable</span><span>Decisión humana</span><span>Simple desde el celular</span></div>
      </div>
      <div className={styles.orbit} aria-hidden="true">
        <div className={styles.core}><b>POSTULÁ<br/>MEJOR</b><small>IA laboral</small></div>
        <span className={styles.nodeA}>CV</span><span className={styles.nodeB}>MATCH</span><span className={styles.nodeC}>ENTREVISTA</span><span className={styles.nodeD}>EMPLEO</span>
      </div>
    </section>

    <section className={styles.paths}>
      <article className={`${styles.path} ${styles.candidate}`}>
        <span className={styles.pathLabel}>PARA PERSONAS</span>
        <h2>Estoy buscando trabajo</h2>
        <p>Mejorá tu CV, entendé cómo te ve un selector y organizá tu búsqueda activa con herramientas de IA.</p>
        <ul><li>Diagnóstico de CV</li><li>CV Pro+</li><li>Búsqueda Activa</li><li>Preparación para entrevistas</li></ul>
        <Link href="/cv-ia" className={styles.primary}>Entrar como candidato <span>→</span></Link>
      </article>

      <article className={`${styles.path} ${styles.employer}`}>
        <span className={styles.pathLabel}>PARA EMPRESAS</span>
        <h2>Necesito contratar</h2>
        <p>Contanos a quién buscás. Nuestros agentes te ayudan a publicar, ordenar postulaciones y decidir a quién entrevistar primero.</p>
        <ul><li>Aviso generado por IA</li><li>Shortlist automático</li><li>Match explicado</li><li>Guía de entrevista por candidato</li></ul>
        <Link href="/empresas-preview" className={styles.primary}>Ver Postulá Mejor Empresas <span>→</span></Link>
      </article>
    </section>

    <section className={styles.bridge}>
      <div><span>UN ECOSISTEMA, DOS NECESIDADES</span><h2>Más contexto para el candidato.<br/>Menos caos para quien contrata.</h2></div>
      <p>La tecnología no toma la decisión final. Organiza información, explica coincidencias y reduce trabajo repetitivo para que las personas puedan decidir mejor.</p>
    </section>

    <footer className={styles.footer}><b>Postulá Mejor</b><span>Vista conceptual · no indexada · sin cambios en producción</span></footer>
  </main>
}
