import Link from 'next/link'
import styles from './LandingHeroPromo.module.css'

export default function LandingHeroPromo(){
  return <aside className={styles.card} aria-label="Plan Impulso Comercio Lleno">
    <div className={styles.trialBanner}>
      <strong>3 MESES GRATIS</strong>
      <span>Acceso completo · sin tarjeta</span>
    </div>
    <div className={styles.topRow}>
      <span className={styles.badge}>PLAN IMPULSO · TIEMPO LIMITADO</span>
    </div>
    <div className={styles.priceRow}>
      <strong>$0</strong>
      <span>/ 90 días</span>
    </div>
    <p>Después, 3 meses a $14.900/mes. Luego $29.800/mes.</p>
    <div className={styles.limits}>Incluye 1 sucursal · hasta 1.000 productos · 500 comprobantes ARCA. <Link href="/terminos">Ver condiciones</Link></div>
    <div className={styles.bottomRow} style={{justifyContent:'flex-end'}}>
      <Link href="/prueba-gratis">Activar 3 meses gratis →</Link>
    </div>
  </aside>
}
