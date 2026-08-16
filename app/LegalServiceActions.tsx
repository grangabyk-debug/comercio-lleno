import Link from 'next/link'
import styles from './LegalServiceActions.module.css'

export default function LegalServiceActions(){
  return <aside className={styles.wrap} aria-label="Gestiones de servicio">
    <Link href="/gestionar-servicio?tipo=arrepentimiento">BOTÓN DE ARREPENTIMIENTO</Link>
    <Link href="/gestionar-servicio?tipo=baja">BOTÓN DE BAJA DE SERVICIO</Link>
  </aside>
}
