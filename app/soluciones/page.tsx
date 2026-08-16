import type { Metadata } from 'next'
import Link from 'next/link'
import BrandLogo from '../BrandLogo'
import styles from './solution.module.css'
import { solutions } from './solutions'

export const metadata: Metadata = {
  title: 'Soluciones para comercios | Comercio Lleno',
  description: 'Sistemas de ventas, stock, caja y facturación para kioscos, almacenes, ferreterías, locales de ropa, dietéticas, pet shops y otros comercios.',
  alternates: { canonical: 'https://comerciolleno.com/soluciones' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Soluciones para comercios | Comercio Lleno',
    description: 'Encontrá la solución de Comercio Lleno que mejor coincide con tu tipo de negocio.',
    url: 'https://comerciolleno.com/soluciones',
    siteName: 'Comercio Lleno',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function SolutionsPage() {
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Soluciones para comercios | Comercio Lleno',
    url: 'https://comerciolleno.com/soluciones',
    hasPart: solutions.map((solution) => ({
      '@type': 'WebPage',
      name: solution.eyebrow,
      url: `https://comerciolleno.com/soluciones/${solution.slug}`,
    })),
  }

  return <main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
    <div className={styles.topLine} />
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="Comercio Lleno"><BrandLogo size={40} /></Link>
      <nav className={styles.nav} aria-label="Navegación de soluciones"><Link href="/">Producto</Link><Link href="/soluciones">Soluciones</Link><Link href="/prueba-gratis">Prueba gratis</Link></nav>
      <div className={styles.actions}><Link href="/redesign/access" className={styles.login}>Ingresar</Link><Link href="/prueba-gratis" className={styles.try}>Probar 14 días</Link></div>
    </header>

    <section className={styles.hubHero}>
      <p className={styles.eyebrow}>COMERCIO LLENO · SOLUCIONES</p>
      <h1>Un sistema comercial.<br/>Distintas formas de encontrarlo.</h1>
      <p>Ventas, stock, caja, facturación ARCA y acceso móvil adaptados al lenguaje y las necesidades de distintos tipos de comercio.</p>
    </section>

    <section className={styles.hubGrid} aria-label="Soluciones disponibles">
      {solutions.map((solution) => <Link href={`/soluciones/${solution.slug}`} className={styles.hubCard} key={solution.slug}>
        <small>{solution.eyebrow}</small>
        <h2>{solution.accent.replace(/\.$/, '')}</h2>
        <p>{solution.description}</p>
        <span>Ver solución</span>
      </Link>)}
    </section>

    <section className={styles.band}>
      <div className={styles.bandInner}>
        <div><h2>¿Tu rubro no aparece?</h2><p>Comercio Lleno no está limitado a estas categorías. Son páginas específicas para que cada comercio encuentre más rápido la propuesta que necesita.</p></div>
        <Link href="/prueba-gratis">Probar Comercio Lleno</Link>
      </div>
    </section>

    <footer className={styles.footer}><span>Comercio Lleno · Software de gestión comercial de Llena Group</span><div className={styles.footerLinks}><Link href="/">Inicio</Link><Link href="/politica-de-privacidad">Privacidad</Link><Link href="/prueba-gratis">Probar gratis</Link></div></footer>
  </main>
}
