import Link from 'next/link'
import BrandLogo from './BrandLogo'
import LandingFeatureTabs from './LandingFeatureTabs'
import LandingMobileInnovation from './LandingMobileInnovation'
import LandingQuickDemo from './LandingQuickDemo'
import LandingSystemShowcase from './LandingSystemShowcase'
import ArgentinaPride from './ArgentinaPride'
import styles from './LandingPremium.module.css'

const heroPhoto='https://images.pexels.com/photos/12935045/pexels-photo-12935045.jpeg?auto=compress&cs=tinysrgb&w=2200'
const arcaLogo='https://arca.gob.ar/frameworkAFIP/img/logo_arca_blanco.svg'
const mercadoPagoIcon='https://cdn.simpleicons.org/mercadopago/009EE3'
const whatsappIcon='https://cdn.simpleicons.org/whatsapp/25D366'

const productFeatures=[
  'Ventas y caja',
  'Stock y productos',
  'Facturación electrónica ARCA',
  'Modo offline',
  'Scanner móvil',
  'Inteligencia artificial',
  'Lectores USB e impresoras térmicas',
  'Integración con Mercado Pago',
  'WhatsApp + IA',
]

export const metadata={
  title:'Comercio Lleno | Sistema POS online para comercios en Argentina',
  description:'Sistema POS online para vender, controlar stock y caja, facturar con ARCA y gestionar el comercio desde computadora o celular.',
  keywords:['sistema pos argentina','punto de venta','software para comercios','facturación ARCA','control de stock','caja diaria','POS online'],
  alternates:{canonical:'https://comerciolleno.com'},
  openGraph:{title:'Comercio Lleno | Un sistema para todo tu comercio',description:'Ventas, stock, caja y facturación ARCA en una experiencia simple y moderna.',url:'https://comerciolleno.com',siteName:'Comercio Lleno',locale:'es_AR',type:'website'},
  robots:{index:true,follow:true},
}

export default function LandingPage(){
  const softwareLd={'@context':'https://schema.org','@type':'SoftwareApplication',name:'Comercio Lleno',applicationCategory:'BusinessApplication',operatingSystem:'Web, Android',url:'https://comerciolleno.com',description:'Sistema POS online para comercios con ventas, stock, caja, facturación ARCA y versión móvil.',offers:{'@type':'Offer',price:'14900',priceCurrency:'ARS',description:'14 días gratis; luego $14.900 por mes durante los primeros 3 meses. Desde el cuarto mes, $29.800 por mes.'},featureList:productFeatures}
  const organizationLd={'@context':'https://schema.org','@type':'Organization',name:'Llena Group',brand:{'@type':'Brand',name:'Comercio Lleno'},url:'https://comerciolleno.com'}

  return <main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(softwareLd)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationLd)}}/>

    <div className={styles.topLine}/>
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="Comercio Lleno"><BrandLogo size={42}/></Link>
      <nav className={styles.nav} aria-label="Navegación principal">
        <a href="#producto">Producto</a>
        <a href="#movil">Móvil</a>
        <a href="#precio">Precio</a>
        <a href="#preguntas">Preguntas</a>
      </nav>
      <div className={styles.headerActions}>
        <Link href="/redesign/access" className={styles.login}>Ingresar</Link>
        <Link href="/prueba-gratis" className={styles.tryButton}>Probar gratis</Link>
      </div>
    </header>

    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.kicker}><span>●</span> POS ONLINE PARA COMERCIOS ARGENTINOS</p>
        <h1>El sistema que<br/><span className={styles.violet}>trabaja con vos.</span></h1>
        <p className={styles.heroLead}>Vendé, facturá con ARCA, controlá stock y caja, y seguí el negocio desde el celular. Potente por dentro. Simple en el mostrador.</p>
        <div className={styles.heroActions}>
          <Link href="/prueba-gratis" className={styles.primary}>Empezar 14 días gratis <span>→</span></Link>
          <LandingQuickDemo/>
        </div>
        <div className={styles.heroFacts}>
          <span>Sin tarjeta</span><span>Configuración guiada</span><span>Web + Android</span>
        </div>
      </div>

      <div className={styles.heroVisual}>
        <div className={styles.photoFrame}>
          <img src={heroPhoto} alt="Cajera operando un sistema POS moderno en un comercio" fetchPriority="high"/>
        </div>
        <div className={styles.heroStamp}><b>HECHO PARA EL<br/>COMERCIO REAL</b><span>Argentina · 2026</span></div>
        <div className={`${styles.floatCard} ${styles.floatSale}`}><span>VENTAS HOY</span><strong>$428.650</strong><small>36 operaciones</small></div>
        <div className={`${styles.floatCard} ${styles.floatArca}`}><i>✓</i><div><b>ARCA conectado</b><small>Facturación lista</small></div></div>
      </div>
    </section>

    <section className={styles.integrationBand} aria-label="Integraciones y compatibilidades">
      <div className={styles.integrationIntro}><b>Tu operación, conectada.</b><span>Marcas conocidas. Un solo flujo de trabajo.</span></div>
      <div className={styles.integrationRail}>
        <span className={styles.arca}><img src={arcaLogo} alt="ARCA"/></span>
        <span><img src={mercadoPagoIcon} alt="Mercado Pago" style={{width:28,height:28,marginBottom:7}}/><b>Mercado Pago</b><small>integración de cobro</small></span>
        <span><img src={whatsappIcon} alt="WhatsApp" style={{width:27,height:27,marginBottom:7}}/><b>WhatsApp + IA</b><small>mensajes y automatización</small></span>
        <span><b>OpenAI</b><small>modelos usados por el asistente</small></span>
        <span><b>Scanner USB</b><small>códigos de barra</small></span>
        <span><b>58 / 80 mm</b><small>impresora térmica</small></span>
      </div>
    </section>

    <LandingSystemShowcase/>

    <section className={styles.productSection} id="producto">
      <div className={styles.sectionHeading}>
        <div><p>NO ES UNA PLANILLA CON BOTONES</p><h2>Una herramienta para<br/><em>mover el negocio.</em></h2></div>
        <p className={styles.sectionLead}>La interfaz se organiza alrededor de lo que pasa de verdad: cobrar, buscar un producto, mirar stock, facturar y seguir.</p>
      </div>
      <LandingFeatureTabs/>
    </section>

    <LandingMobileInnovation/>

    <ArgentinaPride/>

    <section className={styles.priceSection} id="precio">
      <div className={styles.priceMain}>
        <p>PROBALO CON TU NEGOCIO</p>
        <h2>14 días.<br/><span>Sin compromiso.</span></h2>
        <p>Cargá productos, vendé y recorré el flujo completo. La mejor demo es usarlo en el mostrador.</p>
      </div>
      <div className={styles.priceOffer}>
        <span className={styles.offerBadge}>50% OFF · PRIMEROS 3 MESES</span>
        <div className={styles.priceLine}><strong>$14.900</strong><small>/ mes</small></div>
        <p>Luego $29.800/mes. Incluye hasta 2 sucursales.</p>
        <Link href="/prueba-gratis">Crear mi cuenta <span>→</span></Link>
        <small className={styles.supportNote}>Soporte humano para configuración y puesta en marcha.</small>
      </div>
    </section>

    <section className={styles.moreInfo} id="preguntas" aria-label="Más información">
      <div><p>LO QUE SUELE IMPORTAR</p><h2>Respuestas cortas.<br/>Como debe ser.</h2></div>
      <div className={styles.detailsList}>
        <details><summary>¿Puedo facturar con ARCA?<span>+</span></summary><p>Sí. Una vez configurado el certificado y el punto de venta, la facturación queda integrada al flujo de venta.</p></details>
        <details><summary>¿Funciona con Mercado Pago, scanner e impresora?<span>+</span></summary><p>El sistema contempla integración con Mercado Pago y compatibilidad con lectores de códigos USB e impresoras térmicas de 58 y 80 mm.</p></details>
        <details><summary>¿Qué hace la inteligencia artificial?<span>+</span></summary><p>El asistente puede consultar ventas, stock y tendencias del comercio. Utiliza modelos de IA —incluidos modelos de OpenAI— a través de nuestra infraestructura.</p></details>
        <details><summary>¿Funciona desde el celular?<span>+</span></summary><p>Sí. La experiencia móvil está diseñada como herramienta principal: vender, consultar productos, escanear códigos y trabajar con caja y facturación.</p></details>
      </div>
    </section>

    <footer className={styles.footer}>
      <div className={styles.footerBrand}><BrandLogo size={38}/><p>Software de gestión comercial de Llena Group.</p></div>
      <div className={styles.footerLinks}><Link href="/politica-de-privacidad">Privacidad</Link><Link href="/politica-de-cookies">Cookies</Link><button type="button" data-cookie-settings>Configurar cookies</button><Link href="/eliminar-cuenta">Eliminar cuenta</Link></div>
      <div className={styles.footerCta}><span>¿Querés verlo con tus datos?</span><Link href="/prueba-gratis">Empezar gratis →</Link></div>
    </footer>

    <div className={styles.mobileSticky}><div><b>14 días gratis</b><span>Sin tarjeta</span></div><Link href="/prueba-gratis">Probar ahora</Link></div>
  </main>
}
