import Link from 'next/link'
import styles from './LandingHeroPromo.module.css'

export default function LandingHeroPromo(){
  return <aside className={styles.card} aria-label="Promoción Comercio Lleno">
    <div className={styles.topRow}>
      <span className={styles.badge}>50% OFF · PRIMEROS 3 MESES</span>
      <span className={styles.trial}>14 días gratis</span>
    </div>
    <div className={styles.priceRow}>
      <strong>$14.900</strong>
      <span>/ mes</span>
    </div>
    <p>Después $29.800/mes. Incluye hasta 2 sucursales.</p>
    <div className={styles.bottomRow}>
      <span>Precio lanzamiento</span>
      <Link href="/prueba-gratis">Empezar ahora →</Link>
    </div>
  </aside>
}
