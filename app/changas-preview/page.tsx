import styles from '../postula-preview/platform.module.css'
import {PlatformFooter,PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import {gigCategories} from '../postula-preview/gigs'
import FlexMarketplaceExplorer from './FlexMarketplaceExplorer'
import FlexUxCleanup from './FlexUxCleanup'
import FlexUnifiedFilters from './FlexUnifiedFilters'
import ServicesFlexLegalGuard from './ServicesFlexLegalGuard'
import ServicesFlexCompactSafety from './ServicesFlexCompactSafety'
import '../postula-preview/premium-v6.css'
import '../postula-preview/premium-v7.css'
import './flex-credits-v21.css'
import './flex-polish-v27.css'
import './flex-media-v33.css'
import './flex-publish-v34.css'
import './flex-compact-safety-v35.css'
import './flex-neon-rules-v36.css'
import './flex-manage-v37.css'
import './flex-organize-v38.css'
import './flex-market-v39.css'
import './flex-market-v40.css'
import './flex-market-v41.css'
import './flex-ux-v42.css'
import './flex-hero-motion-v43.css'
import './flex-mobile-minimal-v44.css'
import './flex-detail-v45.css'
import './flex-desktop-clean-v46.css'
import './flex-unified-search-v47.css'

export const metadata={title:{absolute:'Servicios Flex | Postulá Mejor'},description:'Buscá profesionales o publicá el servicio que ofrecés. Servicios independientes, solicitudes puntuales, chat y reglas claras antes de acordar.',robots:{index:true,follow:true},alternates:{canonical:'https://postulamejor.com/servicios-flex'}}

export default function ServiciosFlexPage(){return <main className={`${styles.page} pm7-page pm7-candidate`}>
 <PlatformHeader/><ServicesFlexLegalGuard/><FlexUxCleanup/><FlexUnifiedFilters/>
 <section className="pm7-gigs-hero"><div className="pm7-gigs-hero-inner"><div><span className="pm7-eyebrow lime">NUEVO · SERVICIOS FLEX</span><h1>Buscá un servicio.<br/><em>O publicá el tuyo.</em></h1><div className="pm7-hero-actions"><a href="/servicios-flex?clasificar=1&tipo=request" data-services-flex-publish="1" data-flex-type="request" className="pm7-btn-black">Necesito un servicio</a><a href="/servicios-flex?clasificar=1&tipo=offer" data-services-flex-publish="1" data-flex-type="offer" className="pm7-btn-white">Ofrezco un servicio</a></div><span className="pm-flex-device-note">Mensajes disponibles en PC y móvil</span></div><div className="pm7-gigs-stack" aria-label="Ejemplo visual de publicaciones de Servicios Flex"><article className="one"><span>OFRECE · CABA Y GBA</span><h3>Técnico de aire acondicionado</h3><b>Desde $35.000</b><small>Turnos a coordinar</small></article><article className="two"><span>BUSCA · PALERMO</span><h3>Armar dos muebles</h3><b>$38.000</b><small>3–4 horas</small></article><article className="three"><span>OFRECE · CABA</span><h3>Fotos + reels</h3><b>Desde $45.000</b><small>Por proyecto</small></article><div className="pm7-gig-orbit" aria-hidden="true"><i/><i/><i/></div></div></div></section>
 <section className="pm7-trust-strip"><div><b>Dos formas de participar</b><span>buscar o ofrecer un servicio</span></div><div><b>Chat en PC y móvil</b><span>acordá alcance, fecha e importe</span></div><div><b>Pago entre las partes</b><span>Postulá Mejor no custodia el dinero del servicio</span></div><div><b>Vos decidís</b><span>la plataforma no fuerza acuerdos</span></div></section>
 <section className="pm7-gig-explorer" id="explorar"><div className="pm7-section-head"><div><span className="pm7-eyebrow coral">MARKETPLACE DE SERVICIOS FLEX</span><h2>Encontrá quien lo hace o mostrá lo que hacés.</h2></div><p>Acá se muestran únicamente publicaciones activas creadas por cuentas reales. Si una publicación se elimina o se desactiva, deja de aparecer en el marketplace.</p></div><FlexMarketplaceExplorer gigs={[]} categories={gigCategories}/></section>
 <ServicesFlexCompactSafety/>
 <PlatformFooter/><MobileNav active="changas"/>
 </main>}
