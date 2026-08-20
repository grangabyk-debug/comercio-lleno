import Link from 'next/link'
import styles from './platform.module.css'
import MobileChoicePrompt from './MobileChoicePrompt'

export function PlatformHeader({audience='candidate'}:{audience?:'candidate'|'employer'}){
  const headerClass=`${styles.header} pm-social-header ${audience==='employer'?'pm-social-header-employer':'pm-social-header-candidate'}`
  return <><header className={headerClass}>
    <Link href="/postula-preview" className={`${styles.brand} pm-social-brand`}><span className={`${styles.mark} pm-social-mark`}>PM</span><span>Postulá Mejor</span></Link>
    <nav className={`${styles.nav} pm-social-nav`} aria-label="Navegación Postulá Mejor">
      {audience==='candidate'?<>
        <Link href="/postula-preview">Inicio</Link>
        <Link href="/empleos-preview">Empleos</Link>
        <Link href="/changas-preview" className="pm-nav-new">Trabajos Flex <small>NUEVO</small></Link>
        <Link href="/cv-ia">Mejorar CV</Link>
        <Link href="/test-vocacional">Test</Link>
      </>:<>
        <Link href="/empresas-preview">Contratar</Link>
        <Link href="/empresas-preview/panel">Candidatos</Link>
        <Link href="/empresas-preview/movil" className="pm-nav-new">Nexo <small>MÓVIL</small></Link>
      </>}
      {audience==='candidate'?<Link href="/empresas-preview" className={`${styles.navPrimary} pm-role-switch`}>Soy empleador</Link>:<Link href="/postula-preview" className={`${styles.navPrimary} pm-role-switch`}>Busco trabajo</Link>}
      <Link href={audience==='candidate'?'/mi-postula-preview':'/empresas-preview/panel'} className={`${styles.navAccent} pm-social-account`}>Mi cuenta</Link>
    </nav>
  </header>{audience==='employer'?<MobileChoicePrompt/>:null}</>
}

export function MobileNav({active='inicio'}:{active?:'inicio'|'empleos'|'cuenta'|'cv'|'changas'|'mensajes'}){
  return <nav className={`${styles.mobileNav} pm-social-mobile-nav`} aria-label="Navegación móvil">
    <Link href="/postula-preview" data-active={active==='inicio'}><i className="pm-nav-i home"/>Inicio</Link>
    <Link href="/empleos-preview" data-active={active==='empleos'}><i className="pm-nav-i search"/>Empleos</Link>
    <Link href="/changas-preview" data-active={active==='changas'}><i className="pm-nav-i bolt"/>Flex</Link>
    <Link href="/mi-postula-preview/chat" data-active={active==='mensajes'}><i className="pm-nav-i chat"/>Mensajes</Link>
    <Link href="/mi-postula-preview" data-active={active==='cuenta'}><i className="pm-nav-i person"/>Perfil</Link>
  </nav>
}

export function PlatformFooter(){return <footer className={`${styles.footer} pm-postula-footer`}><div className={styles.footerInner}><div className="pm-footer-brand"><div className={styles.brand}><span className={styles.mark}>PM</span><span>Postulá Mejor</span></div><p>Trabajo, oportunidades y selección con tecnología explicable. Empleo formal, búsquedas rápidas y Trabajos Flex en una experiencia independiente.</p><div className="pm-footer-trust"><span><i/>Conexión segura HTTPS</span><span><i/>Privacidad y trazabilidad</span><span><i/>IA con decisión humana</span></div></div><div className="pm-footer-links"><Link href="/empleos-preview">Empleos</Link><Link href="/changas-preview">Trabajos Flex</Link><Link href="/empresas-preview">Empresas</Link><Link href="/plantillas-preview">Plantillas</Link><Link href="/cv-ia">Mejorar CV</Link><Link href="/test-vocacional">Test vocacional</Link><Link href="/legales">Legales</Link><Link href="/politica-de-privacidad">Privacidad</Link></div></div><div className="pm-footer-legal"><span>© 2026 Postulá Mejor. Todos los derechos reservados.</span><span>Gabriel Alejandro Granvillano · CUIT 20-38422407-6</span><span className="pm-security-seal">SEGURIDAD · DATOS PROTEGIDOS</span></div></footer>}
