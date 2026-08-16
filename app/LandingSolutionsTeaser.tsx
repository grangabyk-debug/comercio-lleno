import Link from 'next/link'
import styles from './LandingSolutionsTeaser.module.css'
import { solutions } from './soluciones/solutions'

const featuredSlugs = [
  'sistema-para-kioscos',
  'sistema-para-almacenes',
  'sistema-para-ferreterias',
  'sistema-para-locales-de-ropa',
  'sistema-para-dieteticas',
  'sistema-para-pet-shops',
]

export default function LandingSolutionsTeaser(){
  const featured = featuredSlugs.map(slug=>solutions.find(item=>item.slug===slug)).filter(Boolean)
  return <section className={styles.section} aria-labelledby="solutions-title">
    <div className={styles.heading}>
      <div><p>UN SISTEMA · DISTINTOS COMERCIOS</p><h2 id="solutions-title">Encontrá Comercio Lleno<br/><span>desde tu rubro.</span></h2></div>
      <div className={styles.intro}><span>No cambia el producto. Cambia el contexto: ejemplos, problemas y formas de usarlo según el tipo de negocio.</span><Link href="/soluciones">Ver todas las soluciones</Link></div>
    </div>
    <div className={styles.grid}>
      {featured.map(solution=><Link href={`/soluciones/${solution!.slug}`} key={solution!.slug} className={styles.card}>
        <div className={styles.thumb}><img src={solution!.heroImage} alt="" loading="lazy"/></div>
        <div><small>{solution!.eyebrow.replace('SISTEMA PARA ','')}</small><strong>{solution!.accent.replace(/\.$/,'')}</strong></div>
      </Link>)}
    </div>
  </section>
}
