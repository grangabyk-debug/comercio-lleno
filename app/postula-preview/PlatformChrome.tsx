import Link from 'next/link'
import styles from './platform.module.css'
import LandingConversationV12 from './LandingConversationV12'
import NexoLauncher from './NexoLauncher'
import PushDevicePrompt from './PushDevicePrompt'
import AccountNavLink from './AccountNavLink'
import FlexNamingBridge from './FlexNamingBridge'
import MobileNavigation from './MobileNavigation'
import AuthenticatedNavItems from './AuthenticatedNavItems'
import LandingCalendarPromo from './LandingCalendarPromo'
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
import './mobile-navigation-v46.css'
import './support-help-mobile-v46.css'
import './landing-calendar-v55.css'
import './calendar-polish-v55.css'
import './calendar-reminders-v56.css'

function EmployerHeader(){
  return <header className="pm-employer-topbar">
    <div className="pm-employer-topbar-inner">
      <Link href="/empresas" className="pm-employer-wordmark" aria-label="PostulaMejor.com Empresas">
        <span className="pm-employer-brand-copy"><strong>PostulaMejor.com</strong><small>EMPRESAS</small></span>
      </Link>
      <nav className="pm-employer-topbar-nav" aria-label="Navegación de empresas">
        <Link href="/servicios-flex" prefetch={false} className="pm-employer-flex-link">Servicios Flex</Link>
        <AuthenticatedNavItems audience="employer" calendarClassName="pm-employer-flex-link"/>
        <NexoLauncher/>
        <Link href="/" className="pm-employer-switch">Busco trabajo</Link>
        <AccountNavLink audience="employer" className="pm-employer-account"/>
      </nav>
    </div>
  </header>
}

export function PlatformHeader({audience='candidate'}:{audience?:'candidate'|'employer'}){
  if(audience==='employer')return <><FlexNamingBridge/><EmployerHeader/><LandingConversationV12/></>

  const headerClass=`${styles.header} pm-social-header pm-social-header-candidate`
  return <><FlexNamingBridge/><header className={headerClass}>
    <Link href="/" className={`${styles.brand} pm-social-brand`}><span className={`${styles.mark} pm-social-mark`}>PM</span><span>Postulá Mejor</span></Link>
    <nav className={`${styles.nav} pm-social-nav`} aria-label="Navegación Postulá Mejor">
      <Link href="/">Inicio</Link>
      <Link href="/empleos" prefetch={false}>Empleos</Link>
      <Link href="/servicios-flex" prefetch={false} className="pm-nav-new">Servicios Flex <small>NUEVO</small></Link>
      <Link href="/mejorar-cv" prefetch={false}>Mejorar CV</Link>
      <Link href="/test-vocacional" prefetch={false}>Test</Link>
      <AuthenticatedNavItems audience="candidate"/>
      <Link href="/empresas" prefetch={false} className={`${styles.navPrimary} pm-role-switch`}>Soy empleador</Link>
      <AccountNavLink audience="candidate" className={`${styles.navAccent} pm-social-account`}/>
    </nav>
  </header><PushDevicePrompt/><LandingConversationV12/></>
}

export function MobileNav({active='inicio'}:{active?:'inicio'|'empleos'|'cuenta'|'cv'|'changas'|'mensajes'}){
  return <MobileNavigation active={active}/>
}

export function PlatformFooter(){return <><LandingCalendarPromo/><footer className={`${styles.footer} pm-postula-footer`}><div className={styles.footerInner}><div className="pm-footer-brand"><Link href="/" className="pm-footer-wordmark">PostulaMejor.com</Link><p>Trabajo, oportunidades y selección con tecnología explicable. Empleo formal y servicios puntuales en una experiencia independiente.</p></div><div className="pm-footer-links"><Link href="/empleos" prefetch={false}>Empleos</Link><Link href="/servicios-flex" prefetch={false}>Servicios Flex</Link><Link href="/empresas" prefetch={false}>Empresas</Link><Link href="/mejorar-cv" prefetch={false}>Mejorar CV</Link><Link href="/test-vocacional" prefetch={false}>Test vocacional</Link><Link href="/legales">Legales</Link><Link href="/privacidad">Privacidad</Link><Link href="/politica-evaluaciones">Política de evaluaciones</Link><Link href="/mi-cuenta?tab=configuracion">Mis datos / eliminar cuenta</Link><Link href="/terminos">Términos</Link><Link href="/terminos/servicios-flex">Términos Servicios Flex</Link></div><a className="pm-f960" href="https://qr.afip.gob.ar/?qr=S3SQrnp0FwViu6N3OWk80g" target="_F960AFIPInfo" rel="noopener noreferrer" aria-label="Data Fiscal F.960"><img src="https://www.afip.gob.ar/images/f960/DATAWEB.jpg" alt="Data Fiscal · F.960"/><span>Data Fiscal · F.960</span></a></div><div className="pm-footer-legal"><span>© 2026 Postulá Mejor. Todos los derechos reservados.</span><span>Gabriel Alejandro Granvillano · CUIT 20-38422407-6</span><span className="pm-security-seal">SEGURIDAD · DATOS PROTEGIDOS</span></div></footer></>}
