import Link from 'next/link'
import styles from './platform.module.css'
import MobileChoicePrompt from './MobileChoicePrompt'
import LandingConversationV12 from './LandingConversationV12'
import NexoLauncher from './NexoLauncher'
import MessageLauncher from './MessageLauncher'
import AccountNavLink from './AccountNavLink'
import HomeCompanyStrip from './HomeCompanyStrip'
import './integration-v8.css'
import './premium-v9.css'
import './premium-v10.css'
import './premium-v11.css'
import './premium-v12.css'
import './footer-v13.css'
import './readability-v14.css'
import './trust-publish-v15.css'
import './trust-strip-v16.css'
import './header-account-v24.css'
import './nexo-desktop-v25.css'
import './messages-desktop-v32.css'
import './home-hero-diversity-v36.css'

function MobileNavIcon({kind}:{kind:'home'|'search'|'bolt'|'person'}){
  return <span className="pm-mobile-nav-icon"><i className={`pm-nav-i ${kind}`}/></span>
}

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
        <MessageLauncher/>
      </>:<>
        <Link href="/trabajos-flex" className="pm-nav-new">Trabajos Flex <small>NUEVO</small></Link>
        <NexoLauncher/>
      </>}
      {audience==='candidate'?<Link href="/empresas" className={`${styles.navPrimary} pm-role-switch`}>Soy empleador</Link>:<Link href="/" className={`${styles.navPrimary} pm-role-switch`}>Busco trabajo</Link>}
      <AccountNavLink audience={audience} className={`${styles.navAccent} pm-social-account`}/>
    </nav>
  </header>{audience==='candidate'?<HomeCompanyStrip/>:null}<LandingConversationV12/>{audience==='employer'?<MobileChoicePrompt/>:null}</>
}

export function MobileNav({active='inicio'}:{active?:'inicio'|'empleos'|'cuenta'|'cv'|'changas'|'mensajes'}){
  return <nav className={`${styles.mobileNav} pm-social-mobile-nav`} aria-label="Navegación móvil">
    <Link href="/" data-active={active==='inicio'}><MobileNavIcon kind="home"/><span>Inicio</span></Link>
    <Link href="/empleos" data-active={active==='empleos'}><MobileNavIcon kind="search"/><span>Empleos</span></Link>
    <Link href="/trabajos-flex" className="pm-mobile-nav-flex" data-active={active==='changas'}><MobileNavIcon kind="bolt"/><span>Flex</span></Link>
    <MessageLauncher variant="mobile-nav" active={active==='mensajes'}/>
    <Link href="/mi-cuenta" data-active={active==='cuenta'}><MobileNavIcon kind="person"/><span>Perfil</span></Link>
  </nav>
}

export function PlatformFooter(){return <footer className={`${styles.footer} pm-postula-footer`}><div className={styles.footerInner}><div className="pm-footer-brand"><Link href="/" className="pm-footer-wordmark">PostulaMejor.com</Link><p>Trabajo, oportunidades y selección con tecnología explicable. Empleo formal, búsquedas rápidas y Trabajos Flex en una experiencia independiente.</p></div><div className="pm-footer-links"><Link href="/empleos">Empleos</Link><Link href="/trabajos-flex">Trabajos Flex</Link><Link href="/empresas">Empresas</Link><Link href="/plantillas">Plantillas</Link><Link href="/mejorar-cv">Mejorar CV</Link><Link href="/test-vocacional">Test vocacional</Link><Link href="/legales">Legales</Link><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link></div><a className="pm-f960" href="https://qr.afip.gob.ar/?qr=S3SQrnp0FwViu6N3OWk80g" target="_F960AFIPInfo" rel="noopener noreferrer" aria-label="Data Fiscal F.960"><img src="https://www.afip.gob.ar/images/f960/DATAWEB.jpg" alt="Data Fiscal F.960"/><span>Data Fiscal · F.960</span></a></div><div className="pm-footer-legal"><span>© 2026 Postulá Mejor. Todos los derechos reservados.</span><span>Gabriel Alejandro Granvillano · CUIT 20-38422407-6</span><span className="pm-security-seal">SEGURIDAD · DATOS PROTEGIDOS</span></div></footer>}
