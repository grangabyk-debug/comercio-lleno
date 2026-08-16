import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BrandLogo from '../../BrandLogo'
import styles from '../solution.module.css'
import { solutions, solutionsBySlug } from '../solutions'

export function generateStaticParams() {
  return solutions.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const solution = solutionsBySlug[slug]
  if (!solution) return {}
  const url = `https://comerciolleno.com/soluciones/${solution.slug}`
  return {
    title: `${solution.eyebrow.replace('SISTEMA PARA ', 'Sistema para ').replace('CONTROL DE ', 'Control de ').replace('PUNTO DE ', 'Punto de ')} | Comercio Lleno`,
    description: solution.description,
    keywords: solution.searchTerms,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${solution.eyebrow} | Comercio Lleno`,
      description: solution.description,
      url,
      siteName: 'Comercio Lleno',
      locale: 'es_AR',
      type: 'website',
    },
  }
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const solution = solutionsBySlug[slug]
  if (!solution) notFound()

  const url = `https://comerciolleno.com/soluciones/${solution.slug}`
  const related = solutions.filter((item) => item.slug !== solution.slug).slice(0, 3)
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: solution.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: solution.eyebrow,
    description: solution.description,
    url,
    isPartOf: { '@type': 'WebSite', name: 'Comercio Lleno', url: 'https://comerciolleno.com' },
    about: { '@type': 'SoftwareApplication', name: 'Comercio Lleno', applicationCategory: 'BusinessApplication' },
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Comercio Lleno', item: 'https://comerciolleno.com' },
      { '@type': 'ListItem', position: 2, name: 'Soluciones', item: 'https://comerciolleno.com/soluciones' },
      { '@type': 'ListItem', position: 3, name: solution.eyebrow, item: url },
    ],
  }

  return <main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    <div className={styles.topLine} />

    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="Comercio Lleno"><BrandLogo size={40} /></Link>
      <nav className={styles.nav} aria-label="Navegación de soluciones">
        <Link href="/">Producto</Link>
        <Link href="/soluciones">Soluciones</Link>
        <Link href="/prueba-gratis">Prueba gratis</Link>
      </nav>
      <div className={styles.actions}>
        <Link href="/redesign/access" className={styles.login}>Ingresar</Link>
        <Link href="/prueba-gratis" className={styles.try}>Probar 14 días</Link>
      </div>
    </header>

    <section className={styles.hero}>
      <div>
        <p className={styles.eyebrow}>{solution.eyebrow}</p>
        <h1>{solution.title}<br/><span>{solution.accent}</span></h1>
        <p className={styles.lead}>{solution.intro}</p>
        <div className={styles.ctaRow}>
          <Link href="/prueba-gratis" className={styles.primary}>Empezar 14 días gratis</Link>
          <Link href="/" className={styles.secondary}>Ver Comercio Lleno</Link>
        </div>
        <div className={styles.facts}><span>Sin tarjeta</span><span>Ventas + stock + caja</span><span>Web + celular</span></div>
      </div>

      <div className={styles.visual} aria-label="Vista conceptual de Comercio Lleno">
        <span className={styles.visualLabel}>OPERACIÓN COMERCIAL · EN TIEMPO REAL</span>
        <div className={styles.mock}>
          <div className={styles.mockTop}><b>Comercio Lleno</b><span>Panel del negocio</span></div>
          <div className={styles.mockRows}>
            <div><span>Ventas y caja</span><b className={styles.mockAccent}>ACTIVO</b></div>
            <div><span>Productos y stock</span><b>CONTROLADO</b></div>
            <div><span>Facturación ARCA</span><b>INTEGRADA</b></div>
            <div><span>Acceso móvil</span><b>DISPONIBLE</b></div>
          </div>
        </div>
      </div>
    </section>

    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <div><p>EL PROBLEMA NO ES VENDER</p><h2>{solution.painTitle}</h2></div>
        <span>Comercio Lleno está pensado para unir el mostrador con la información que necesitás para decidir, reponer, controlar y seguir trabajando.</span>
      </div>
      <div className={styles.grid}>
        {solution.pains.map((pain, index) => <div className={styles.card} key={pain}><small>0{index + 1}</small><strong>{pain}</strong></div>)}
      </div>
    </section>

    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <div><p>UNA SOLA HERRAMIENTA</p><h2>Lo que necesitás para operar todos los días.</h2></div>
        <span>Arrancás por lo básico y después completás ARCA, empleados, sucursales y el resto de la configuración cuando lo necesites.</span>
      </div>
      <div className={styles.uses}>{solution.uses.map((use) => <div className={styles.use} key={use}>{use}</div>)}</div>
    </section>

    <section className={styles.band}>
      <div className={styles.bandInner}>
        <div><h2>Probalo con tu comercio real.</h2><p>Cargá productos, hacé ventas y recorré el flujo completo durante 14 días. No necesitás tarjeta para empezar.</p></div>
        <Link href="/prueba-gratis">Crear mi comercio</Link>
      </div>
    </section>

    <section className={`${styles.section} ${styles.faq}`}>
      <div><p className={styles.eyebrow}>PREGUNTAS FRECUENTES</p><h2>Antes de empezar.</h2></div>
      <div className={styles.faqList}>{solution.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
    </section>

    <section className={styles.section}>
      <div className={styles.sectionHead}><div><p>MÁS SOLUCIONES</p><h2>El mismo sistema, adaptado a distintas búsquedas.</h2></div><span>Si tu comercio entra en otra categoría, Comercio Lleno mantiene la misma base de ventas, stock, caja y facturación.</span></div>
      <div className={styles.related}>{related.map((item) => <Link href={`/soluciones/${item.slug}`} key={item.slug}><small>COMERCIO LLENO</small><strong>{item.eyebrow}</strong></Link>)}</div>
    </section>

    <footer className={styles.footer}>
      <span>Comercio Lleno · Software de gestión comercial de Llena Group</span>
      <div className={styles.footerLinks}><Link href="/soluciones">Todas las soluciones</Link><Link href="/politica-de-privacidad">Privacidad</Link><Link href="/prueba-gratis">Probar gratis</Link></div>
    </footer>
  </main>
}
