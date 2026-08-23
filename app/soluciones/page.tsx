import type { Metadata } from 'next'
import Link from 'next/link'
import BrandLogo from '../BrandLogo'
import styles from './solution.module.css'
import { solutions } from './solutions'

export const metadata: Metadata = {
  title: 'Soluciones para comercios | Comercio Lleno',
  description: 'Sistemas de ventas, stock, caja y facturación para kioscos, almacenes, ferreterías, locales de ropa, dietéticas, pet shops y otros comercios. 30 días gratis, sin tarjeta.',
  alternates: { canonical: 'https://comerciolleno.com/soluciones' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Soluciones para comercios | Comercio Lleno',
    description: 'Encontrá la solución de Comercio Lleno que mejor coincide con tu tipo de negocio. Probalo 30 días gratis, sin tarjeta.',
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
      <nav className={styles.nav} aria-label="Navegación de soluciones"><Link href="/funcionalidades">Funcionalidades</Link><Link href="/soluciones">Soluciones</Link><Link href="/prueba-gratis">Prueba gratis</Link></nav>
      <div className={styles.actions}><Link href="/redesign/access" className={styles.login}>Ingresar</Link><Link href="/prueba-gratis" className={styles.try}>30 días gratis</Link></div>
    </header>

    <section className={styles.hubHero}>
      <p className={styles.eyebrow}>COMERCIO LLENO · SOLUCIONES</p>
      <h1>Tu comercio no es genérico.<br/>La página tampoco debería serlo.</h1>
      <p>Explorá Comercio Lleno desde el contexto de tu negocio o desde el problema que querés resolver: vender, controlar stock, ordenar caja y seguir todo desde el celular.</p>
    </section>

    <section className={styles.hubIntroBand} aria-label="Qué vas a encontrar">
      <div><b>Por rubro</b><span>Kioscos, almacenes, ferreterías, ropa, dietéticas, pet shops y perfumerías.</span></div>
      <div><b>Por necesidad</b><span>Punto de venta, stock y caja para quien busca resolver un problema puntual.</span></div>
      <div><b>30 días gratis</b><span>Probalo sin tarjeta. Después cuesta $14.900 por mes.</span></div>
    </section>

    <section className={styles.hubGrid} aria-label="Soluciones disponibles">
      {solutions.map((solution) => <Link href={`/soluciones/${solution.slug}`} className={styles.hubCard} key={solution.slug}>
        <div className={styles.hubCardImage}><img src={solution.heroImage} alt={solution.heroAlt} loading="lazy" /></div>
        <div className={styles.hubCardBody}>
          <small>{solution.eyebrow}</small>
          <h2>{solution.accent.replace(/\.$/, '')}</h2>
          <p>{solution.description}</p>
          <span>Ver solución</span>
        </div>
      </Link>)}
    </section>

    <section className={styles.band}>
      <div className={styles.bandInner}>
        <div><h2>¿Tu rubro no aparece?</h2><p>Comercio Lleno no está limitado a estas categorías. Probalo 30 días gratis con tu operación real, sin tarjeta; después $14.900 por mes.</p></div>
        <Link href="/prueba-gratis">Empezar 30 días gratis</Link>
      </div>
    </section>

    <footer className={styles.footer}><span>Comercio Lleno · Software de gestión comercial de Llena Group</span><div className={styles.footerLinks}><Link href="/funcionalidades">Funcionalidades</Link><Link href="/">Inicio</Link><Link href="/terminos">Términos</Link><Link href="/politica-de-privacidad">Privacidad</Link><Link href="/prueba-gratis">Probar 30 días gratis</Link></div></footer>
  </main>
}
