import Link from 'next/link'
import styles from './platform.module.css'
import MobileChoicePrompt from './MobileChoicePrompt'
import LandingConversationV12 from './LandingConversationV12'
import './integration-v8.css'
import './premium-v9.css'
import './premium-v10.css'
import './premium-v11.css'
import './premium-v12.css'
import './footer-v13.css'

export function PlatformHeader({audience='candidate'}:{audience?:'candidate'|'employer'}){
  const headerClass=`${styles.header} pm-social-header ${audience==='employer'?'pm-social-header-employer':'pm-social-header-candidate'}`
  return <><header className={headerClass}>
    <Link href="/" className={`${styles.brand} pm-social-brand`}><span className={`${styles.mark} pm-social-mark`}>PM</span><span>Postulá Mejor</span></Link>
    <nav className={`${styles.nav} pm-social-nav`} aria-label="Navegación Postulá Mejor">
      {audience==='candidate'?<>
        <Link href="/">Inicio</Link>
        <Link href="/empleos">Empleos</Link>
        <Link href="/trabajos-flex" className="pm-nav-new">Trabajos Flex <small>NUEVO</small></Link>
        <Link href="/mejorar-cv">Mejorar CV</Link>
        <Link href="/test-vocacional">Test</Link>
      </>:<>
        <Link href="/empresas">Contratar</Link>
        <Link href="/empresas/panel">Candidatos</Link>
        <Link href="/empresas/movil" className="pm-nav-new">Nexo <small>MÓVIL</small></Link>
      </>}
      {audience==='candidate'?<Link href="/empresas" className={`${styles.navPrimary} pm-role-switch`}>Soy empleador</Link>:<Link href="/" className={`${styles.navPrimary} pm-role-switch`}>Busco trabajo</Link>}
      <Link href={audience==='candidate'?'/mi-cuenta':'/empresas/panel'} className={`${styles.navAccent} pm-social-account`}>Mi cuenta</Link>
    </nav>
  </header><LandingConversationV12/>{audience==='employer'?<MobileChoicePrompt/>:null}</>
}

export function MobileNav({active='inicio'}:{active?:'inicio'|'empleos'|'cuenta'|'cv'|'changas'|'mensajes'}){
  return <nav className={`${styles.mobileNav} pm-social-mobile-nav`} aria-label="Navegación móvil">
    <Link href="/" data-active={active==='inicio'}><i className="pm-nav-i home"/>Inicio</Link>
    <Link href="/empleos" data-active={active==='empleos'}><i className="pm-nav-i search"/>Empleos</Link>
    <Link href="/trabajos-flex" data-active={active==='changas'}><i className="pm-nav-i bolt"/>Flex</Link>
    <Link href="/mensajes" data-active={active==='mensajes'}><i className="pm-nav-i chat"/>Mensajes</Link>
    <Link href="/mi-cuenta" data-active={active==='cuenta'}><i className="pm-nav-i person"/>Perfil</Link>
  </nav>
}

export function PlatformFooter(){return <footer className={`${styles.footer} pm-postula-footer`}><div className={styles.footerInner}><div className="pm-footer-brand"><Link href="/" className="pm-footer-wordmark">PostulaMejor.com</Link><p>Trabajo, oportunidades y selección con tecnología explicable. Empleo formal, búsquedas rápidas y Trabajos Flex en una experiencia independiente.</p></div><div className="pm-footer-links"><Link href="/empleos">Empleos</Link><Link href="/trabajos-flex">Trabajos Flex</Link><Link href="/empresas">Empresas</Link><Link href="/plantillas">Plantillas</Link><Link href="/mejorar-cv">Mejorar CV</Link><Link href="/test-vocacional">Test vocacional</Link><Link href="/legales">Legales</Link><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link></div></div><div className="pm-footer-legal"><span>© 2026 Postulá Mejor. Todos los derechos reservados.</span><span>Gabriel Alejandro Granvillano · CUIT 20-38422407-6</span><span className="pm-security-seal">SEGURIDAD · DATOS PROTEGIDOS</span></div></footer>}
