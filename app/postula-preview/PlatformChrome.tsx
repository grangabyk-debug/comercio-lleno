import Link from 'next/link'
import styles from './platform.module.css'

export function PlatformHeader({audience='candidate'}:{audience?:'candidate'|'employer'}){
  return <header className={styles.header}>
    <Link href="/postula-preview" className={styles.brand}><span className={styles.mark}>PM</span><span>Postulá Mejor</span></Link>
    <nav className={styles.nav} aria-label="Navegación Postulá Mejor">
      <Link href="/empleos-preview">Ofertas de empleo</Link>
      <Link href="/cv-ia">Mejorar mi CV</Link>
      {audience==='candidate'?<Link href="/empresas-preview" className={styles.navPrimary}>Soy empleador</Link>:<Link href="/postula-preview" className={styles.navPrimary}>Soy candidato</Link>}
      <Link href={audience==='candidate'?'/mi-postula-preview':'/empresas-preview/panel'} className={styles.navAccent}>Mi cuenta</Link>
    </nav>
  </header>
}

export function MobileNav({active='inicio'}:{active?:'inicio'|'empleos'|'cuenta'|'cv'}){
  return <nav className={styles.mobileNav} aria-label="Navegación móvil">
    <Link href="/postula-preview" data-active={active==='inicio'}>Inicio</Link>
    <Link href="/empleos-preview" data-active={active==='empleos'}>Empleos</Link>
    <Link href="/cv-ia" data-active={active==='cv'}>Mi CV</Link>
    <Link href="/mi-postula-preview" data-active={active==='cuenta'}>Cuenta</Link>
  </nav>
}

export function PlatformFooter(){return <footer className={styles.footer}><div className={styles.footerInner}><div><div className={styles.brand}><span className={styles.mark}>PM</span><span>Postulá Mejor</span></div><p>Una plataforma de Llena Group. Preview de producto, no publicado en producción.</p></div><div><Link href="/empleos-preview">Empleos</Link><Link href="/empresas-preview">Empresas</Link><Link href="/cv-ia">CV Pro+</Link><Link href="/politica-de-privacidad">Privacidad</Link></div></div></footer>}
