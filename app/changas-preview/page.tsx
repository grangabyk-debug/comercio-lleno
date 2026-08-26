import styles from '../postula-preview/platform.module.css'
import {PlatformFooter,PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import {gigCategories} from '../postula-preview/gigs'
import FlexMarketplaceExplorer from './FlexMarketplaceExplorer'
import FlexManager from './FlexManager'
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

export const metadata={title:{absolute:'Servicios Flex | Postulá Mejor'},description:'Buscá profesionales o publicá el servicio que ofrecés. Servicios independientes, solicitudes puntuales, chat y reglas claras antes de acordar.',robots:{index:true,follow:true},alternates:{canonical:'https://postulamejor.com/servicios-flex'}}

export default function ServiciosFlexPage(){return <main className={`${styles.page} pm7-page pm7-candidate`}>
 <PlatformHeader/><ServicesFlexLegalGuard/>
 <section className="pm7-gigs-hero"><div className="pm7-gigs-hero-inner"><div><span className="pm7-eyebrow lime">NUEVO · SERVICIOS FLEX</span><h1>Buscá un servicio.<br/><em>O publicá el tuyo.</em></h1><p>Servicios Flex funciona en las dos direcciones: podés encontrar a alguien que resuelva lo que necesitás o mostrar lo que sabés hacer para que te encuentren. Siempre como prestación independiente, no como empleo encubierto.</p><div className="pm7-hero-actions"><a href="/servicios-flex?clasificar=1&tipo=request" data-services-flex-publish="1" data-flex-type="request" className="pm7-btn-black">Necesito un servicio</a><a href="/servicios-flex?clasificar=1&tipo=offer" data-services-flex-publish="1" data-flex-type="offer" className="pm7-btn-white">Ofrezco un servicio</a></div><span className="pm-flex-device-note">Mensajes disponibles en PC y móvil</span></div><div style={{minHeight:360,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:'min(420px,100%)',padding:'28px',borderRadius:28,background:'rgba(255,255,255,.82)',border:'1px solid rgba(17,18,24,.1)',boxShadow:'0 28px 70px rgba(86,67,0,.12)'}}><span style={{display:'block',fontSize:10,fontWeight:950,letterSpacing:'.12em',color:'#6554df'}}>SOLO PUBLICACIONES REALES</span><h2 style={{margin:'10px 0 12px',fontSize:'clamp(30px,3vw,44px)',lineHeight:.96,letterSpacing:'-.05em'}}>Lo que ves en el marketplace lo publicó una cuenta.</h2><p style={{margin:0,fontSize:13,lineHeight:1.55,color:'#626874'}}>Sin perfiles inventados, sin servicios de muestra y sin reputaciones ficticias. Si todavía hay pocas publicaciones, mostramos pocas.</p><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:18}}><span style={{padding:'10px 12px',borderRadius:12,background:'#111218',color:'#fff',fontSize:10,fontWeight:900}}>Cuenta registrada</span><span style={{padding:'10px 12px',borderRadius:12,background:'#d9ff59',color:'#162006',fontSize:10,fontWeight:900}}>Publicación real</span></div></div></div></div></section>
 <section className="pm7-trust-strip"><div><b>Dos formas de participar</b><span>buscar o ofrecer un servicio</span></div><div><b>Chat en PC y móvil</b><span>acordá alcance, fecha e importe</span></div><div><b>Pago entre las partes</b><span>Postulá Mejor no custodia el dinero del servicio</span></div><div><b>Vos decidís</b><span>la plataforma no fuerza acuerdos</span></div></section>
 <section className="pm7-gig-explorer" id="explorar"><div className="pm7-section-head"><div><span className="pm7-eyebrow coral">MARKETPLACE DE SERVICIOS FLEX</span><h2>Encontrá quien lo hace o mostrá lo que hacés.</h2></div><p>Acá se muestran únicamente publicaciones activas creadas por cuentas reales. Si una publicación se elimina o se desactiva, deja de aparecer en el marketplace.</p></div><FlexManager/><FlexMarketplaceExplorer gigs={[]} categories={gigCategories}/></section>
 <ServicesFlexCompactSafety/>
 <PlatformFooter/><MobileNav active="changas"/>
 </main>}
