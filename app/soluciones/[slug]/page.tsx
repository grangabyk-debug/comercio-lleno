import type { CSSProperties, Metadata } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BrandLogo from '../../BrandLogo'
import styles from '../solution.module.css'
import { solutions, solutionsBySlug } from '../solutions'

const normalizeTrial=(text:string)=>text
  .replace(/14\s+días/gi,'30 días')
  .replace(/90\s+días/gi,'30 días')
  .replace(/3\s+meses/gi,'30 días')

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
    description: `${normalizeTrial(solution.description)} Probalo 30 días gratis, sin tarjeta.`,
    keywords: solution.searchTerms,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${solution.eyebrow} | Comercio Lleno`,
      description: `${normalizeTrial(solution.description)} 30 días gratis, sin tarjeta.`,
      url,
      siteName: 'Comercio Lleno',
      locale: 'es_AR',
      type: 'website',
      images: [{ url: solution.heroImage, alt: solution.heroAlt }],
    },
  }
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const solution = solutionsBySlug[slug]
  if (!solution) notFound()

  const url = `https://comerciolleno.com/soluciones/${solution.slug}`
  const related = solutions.filter((item) => item.slug !== solution.slug).slice(0, 3)
  const faq = solution.faq.map(item=>({...item,answer:normalizeTrial(item.answer)}))
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: solution.eyebrow,
    description: `${normalizeTrial(solution.description)} Probalo 30 días gratis, sin tarjeta.`,
    url,
    primaryImageOfPage: { '@type': 'ImageObject', contentUrl: solution.heroImage },
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
  const pageStyle = {'--hero-photo': `url("${solution.heroImage}")`} as CSSProperties

  return <main className={styles.page} data-theme={solution.theme} data-layout={solution.layout} style={pageStyle}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    <div className={styles.topLine} />

    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="Comercio Lleno"><BrandLogo size={40} /></Link>
      <nav className={styles.nav} aria-label="Navegación de soluciones">
        <Link href="/funcionalidades">Funcionalidades</Link>
        <Link href="/soluciones">Soluciones</Link>
        <Link href="/prueba-gratis">Prueba gratis</Link>
      </nav>
      <div className={styles.actions}>
        <Link href="/redesign/access" className={styles.login}>Ingresar</Link>
        <Link href="/prueba-gratis" className={styles.try}>30 días gratis</Link>
      </div>
    </header>

    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>{solution.eyebrow}</p>
        <h1>{solution.title}<br/><span>{solution.accent}</span></h1>
        <p className={styles.lead}>{solution.intro}</p>
        <div className={styles.ctaRow}>
          <Link href="/prueba-gratis" className={styles.primary}>Empezar 30 días gratis</Link>
          <Link href="#como-funciona" className={styles.secondary}>Ver cómo funciona</Link>
        </div>
        <div className={styles.facts}><span>Sin tarjeta</span><span>Después $14.900/mes</span><span>Web + celular</span></div>
      </div>

      <div className={styles.heroMedia}>
        <div className={styles.photoFrame}>
          <img src={solution.heroImage} alt={solution.heroAlt} fetchPriority="high" />
          <div className={styles.photoShade}/>
          <div className={styles.photoCaption}><span>COMERCIO REAL</span><b>{solution.stat.value}</b><small>{solution.stat.label}</small></div>
        </div>
        <div className={styles.floatSystem}>
          <div className={styles.floatSystemTop}><b>Comercio Lleno</b><span>Ahora</span></div>
          <div><span>Ventas</span><strong>ACTIVO</strong></div>
          <div><span>Stock</span><strong>CONTROLADO</strong></div>
          <div><span>Caja</span><strong>AL DÍA</strong></div>
        </div>
      </div>
    </section>

    <section className={styles.story} id="como-funciona">
      <div className={styles.storyPhoto}><img src={solution.secondaryImage} alt={solution.secondaryAlt} loading="lazy" /></div>
      <div className={styles.storyCopy}>
        <p className={styles.eyebrow}>EN EL NEGOCIO REAL</p>
        <h2>{solution.sceneTitle}</h2>
        <p>{solution.sceneText}</p>
        <div className={styles.storyPoints}>{solution.scenePoints.map((point,index)=><div key={point}><b>0{index+1}</b><span>{point}</span></div>)}</div>
        <small className={styles.credit}>{solution.photoCredit}</small>
      </div>
    </section>

    <section className={styles.systemSection} aria-label="Vista del sistema Comercio Lleno">
      <div className={styles.systemCopy}>
        <p className={styles.eyebrow}>EL SISTEMA</p>
        <h2>{solution.systemTitle}</h2>
        <p>{solution.systemText}</p>
        <div className={styles.systemFacts}><span>Venta rápida</span><span>Stock visible</span><span>Caja integrada</span><span>ARCA</span></div>
      </div>
      <div className={styles.browserShot}>
        <div className={styles.browserBar}><i/><i/><i/><span>comerciolleno.com · Nueva venta</span></div>
        <div className={styles.appShot}>
          <div className={styles.appShotTop}><BrandLogo size={27}/><div><span>SUCURSAL</span><b>Principal</b></div></div>
          <div className={styles.appShotBody}>
            <aside><span>Inicio</span><b>Nueva venta</b><span>Productos</span><span>Caja diaria</span><span>Configuración</span></aside>
            <div className={styles.appWork}>
              <div className={styles.searchBox}>Buscar producto o escanear código de barras…</div>
              <div className={styles.productTable}>
                {solution.productExamples.map((product,index)=><div key={product.name}><span className={styles.productIndex}>0{index+1}</span><p><b>{product.name}</b><small>{product.detail}</small></p><strong>{product.stock}</strong></div>)}
              </div>
              <div className={styles.checkout}><div><span>MEDIO DE PAGO</span><b>Efectivo</b></div><div><span>TOTAL</span><strong>$ 65.850</strong></div><button type="button" tabIndex={-1}>Cobrar</button></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <div><p>EL PROBLEMA NO ES VENDER</p><h2>{solution.painTitle}</h2></div>
        <span>La herramienta tiene que acompañar lo que pasa en el mostrador y, al mismo tiempo, dejar información útil para decidir después.</span>
      </div>
      <div className={styles.grid}>{solution.pains.map((pain,index)=><div className={styles.card} key={pain}><small>0{index+1}</small><strong>{pain}</strong></div>)}</div>
    </section>

    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <div><p>UNA SOLA HERRAMIENTA</p><h2>Lo que necesitás para operar todos los días.</h2></div>
        <span>Arrancás por lo básico y completás ARCA, empleados, sucursales y el resto de la configuración cuando lo necesitás.</span>
      </div>
      <div className={styles.uses}>{solution.uses.map((use)=><div className={styles.use} key={use}>{use}</div>)}</div>
    </section>

    <section className={styles.band}>
      <div className={styles.bandInner}>
        <div><h2>Probalo con tu comercio real.</h2><p>Cargá productos, hacé ventas y recorré el flujo completo durante 30 días. No necesitás tarjeta para empezar. Después, $14.900 por mes.</p></div>
        <Link href="/prueba-gratis">Crear mi comercio</Link>
      </div>
    </section>

    <section className={`${styles.section} ${styles.faq}`}>
      <div><p className={styles.eyebrow}>PREGUNTAS FRECUENTES</p><h2>Antes de empezar.</h2></div>
      <div className={styles.faqList}>{faq.map((item)=><details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
    </section>

    <section className={styles.section}>
      <div className={styles.sectionHead}><div><p>MÁS SOLUCIONES</p><h2>Distintas necesidades. El mismo sistema.</h2></div><span>Explorá otras páginas si tu negocio se parece más a otro rubro o si estás buscando resolver un problema puntual.</span></div>
      <div className={styles.related}>{related.map((item)=><Link href={`/soluciones/${item.slug}`} key={item.slug}><img src={item.heroImage} alt="" loading="lazy"/><small>COMERCIO LLENO</small><strong>{item.eyebrow}</strong></Link>)}</div>
    </section>

    <footer className={styles.footer}>
      <span>Comercio Lleno · Software de gestión comercial de Llena Group</span>
      <div className={styles.footerLinks}><Link href="/funcionalidades">Funcionalidades</Link><Link href="/soluciones">Todas las soluciones</Link><Link href="/terminos">Términos</Link><Link href="/politica-de-privacidad">Privacidad</Link><Link href="/prueba-gratis">Probar 30 días gratis</Link></div>
    </footer>
  </main>
}