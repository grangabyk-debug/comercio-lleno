import Link from 'next/link'
import styles from './platform.module.css'
import MobileChoicePrompt from './MobileChoicePrompt'
import LandingConversationV12 from './LandingConversationV12'
import NexoLauncher from './NexoLauncher'
import MessageLauncher from './MessageLauncher'
import PushDevicePrompt from './PushDevicePrompt'
import AccountNavLink from './AccountNavLink'
import FlexNamingBridge from './FlexNamingBridge'
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
import './push-device-v38.css'
import './security-ux-v41.css'

function MobileNavIcon({kind}:{kind:'home'|'search'|'bolt'|'person'}){
  return <span className="pm-mobile-nav-icon"><i className={`pm-nav-i ${kind}`}/></span>
}

function EmployerHeader(){
  return <header className="pm-employer-topbar">
    <div className="pm-employer-topbar-inner">
      <Link href="/empresas" className="pm-employer-wordmark" aria-label="PostulaMejor.com Empresas">
        <span className="pm-employer-brand-copy"><strong>PostulaMejor.com</strong><small>EMPRESAS</small></span>
      </Link>
      <nav className="pm-employer-topbar-nav" aria-label="Navegación de empresas">
        <Link href="/servicios-flex" className="pm-employer-flex-link">Servicios Flex</Link>
        <NexoLauncher/>
        <Link href="/" className="pm-employer-switch">Busco trabajo</Link>
        <AccountNavLink audience="employer" className="pm-employer-account"/>
      </nav>
    </div>
  </header>
}

export function PlatformHeader({audience='candidate'}:{audience?:'candidate'|'employer'}){
  if(audience==='employer')return <><FlexNamingBridge/><EmployerHeader/><LandingConversationV12/><MobileChoicePrompt/></>

  const headerClass=`${styles.header} pm-social-header pm-social-header-candidate`
  return <><FlexNamingBridge/><header className={headerClass}>
    <Link href="/" className={`${styles.brand} pm-social-brand`}><span className={`${styles.mark} pm-social-mark`}>PM</span><span>Postulá Mejor</span></Link>
    <nav className={`${styles.nav} pm-social-nav`} aria-label="Navegación Postulá Mejor">
      <Link href="/">Inicio</Link>
      <Link href="/empleos">Empleos</Link>
      <Link href="/servicios-flex" className="pm-nav-new">Servicios Flex <small>NUEVO</small></Link>
      <Link href="/mejorar-cv">Mejorar CV</Link>
      <Link href="/test-vocacional">Test</Link>
      <MessageLauncher/>
      <Link href="/empresas" className={`${styles.navPrimary} pm-role-switch`}>Soy empleador</Link>
      <AccountNavLink audience="candidate" className={`${styles.navAccent} pm-social-account`}/>
    </nav>
  </header><PushDevicePrompt/><LandingConversationV12/></>
}

export function MobileNav({active='inicio'}:{active?:'inicio'|'empleos'|'cuenta'|'cv'|'changas'|'mensajes'}){
  return <nav className={`${styles.mobileNav} pm-social-mobile-nav`} aria-label="Navegación móvil">
    <Link href="/" data-active={active==='inicio'}><MobileNavIcon kind="home"/><span>Inicio</span></Link>
    <Link href="/empleos" data-active={active==='empleos'}><MobileNavIcon kind="search"/><span>Empleos</span></Link>
    <Link href="/servicios-flex" className="pm-mobile-nav-flex" data-active={active==='changas'}><MobileNavIcon kind="bolt"/><span>Servicios</span></Link>
    <MessageLauncher variant="mobile-nav" active={active==='mensajes'}/>
    <Link href="/mi-cuenta" data-active={active==='cuenta'}><MobileNavIcon kind="person"/><span>Perfil</span></Link>
  </nav>
}

export function PlatformFooter(){return <footer className={`${styles.footer} pm-postula-footer`}><div className={styles.footerInner}><div className="pm-footer-brand"><Link href="/" className="pm-footer-wordmark">PostulaMejor.com</Link><p>Trabajo, oportunidades y selección con tecnología explicable. Empleo formal y servicios puntuales en una experiencia independiente.</p></div><div className="pm-footer-links"><Link href="/empleos">Empleos</Link><Link href="/servicios-flex">Servicios Flex</Link><Link href="/empresas">Empresas</Link><Link href="/mejorar-cv">Mejorar CV</Link><Link href="/test-vocacional">Test vocacional</Link><Link href="/legales">Legales</Link><Link href="/privacidad">Privacidad</Link><Link href="/politica-evaluaciones">Política de evaluaciones</Link><Link href="/mi-cuenta?tab=configuracion">Mis datos / eliminar cuenta</Link><Link href="/terminos">Términos</Link><Link href="/terminos/servicios-flex">Términos Servicios Flex</Link></div><a className="pm-f960" href="https://qr.afip.gob.ar/?qr=S3SQrnp0FwViu6N3OWk80g" target="_F960AFIPInfo" rel="noopener noreferrer" aria-label="Data Fiscal F.960"><img src="https://www.afip.gob.ar/images/f960/DATAWEB.jpg" alt="Data Fiscal F.960"/><span>Data Fiscal · F.960</span></a></div><div className="pm-footer-legal"><span>© 2026 Postulá Mejor. Todos los derechos reservados.</span><span>Gabriel Alejandro Granvillano · CUIT 20-38422407-6</span><span className="pm-security-seal">SEGURIDAD · DATOS PROTEGIDOS</span></div></footer>}
