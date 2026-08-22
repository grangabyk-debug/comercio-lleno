import Link from 'next/link'
import BrandLogo from './BrandLogo'
import LandingFeatureTabs from './LandingFeatureTabs'
import LandingHero2026 from './LandingHero2026'
import LandingSystemShowcase from './LandingSystemShowcase'
import LandingSolutionsTeaser from './LandingSolutionsTeaser'
import ArgentinaPride from './ArgentinaPride'
import styles from './LandingPremium.module.css'
import mobileFix from './LandingMobileHeaderFooterFix.module.css'

const arcaLogo='https://arca.gob.ar/frameworkAFIP/img/logo_arca_blanco.svg'
const mercadoPagoIcon='https://cdn.simpleicons.org/mercadopago/009EE3'
const dataFiscalHref='http://qr.afip.gob.ar/?qr=ruCuZIwbDAsxcH_2p0YsXg,,'
const dataFiscalImage='https://www.afip.gob.ar/images/f960/DATAWEB.jpg'

const productFeatures=[
  'Ventas y caja',
  'Stock, productos y categorías',
  'Facturación electrónica ARCA',
  'Presupuestos no fiscales',
  'Modo offline',
  'Scanner móvil',
  'Inteligencia artificial',
  'Lectores USB e impresoras térmicas',
  'Mercado Pago Point y QR físico',
  'Módulos para venta fraccionada, balanza e indumentaria',
]

export const metadata={
  title:'Comercio Lleno | Sistema POS online para comercios en Argentina',
  description:'Vendé, controlá stock y caja, facturá con ARCA y gestioná tu comercio desde celular o PC. Probá Comercio Lleno 30 días gratis, sin tarjeta.',
  keywords:['sistema pos argentina','punto de venta','software para comercios','facturación ARCA','control de stock','caja diaria','POS online'],
  alternates:{canonical:'https://comerciolleno.com'},
  openGraph:{title:'Comercio Lleno | Todo tu comercio, en un solo lugar',description:'Ventas, stock, caja, ARCA, Mercado Pago e IA. Probalo 30 días gratis, sin tarjeta; después $14.900 por mes.',url:'https://comerciolleno.com',siteName:'Comercio Lleno',locale:'es_AR',type:'website'},
  robots:{index:true,follow:true},
}

export default function LandingPage(){
  const softwareLd={'@context':'https://schema.org','@type':'SoftwareApplication',name:'Comercio Lleno',applicationCategory:'BusinessApplication',operatingSystem:'Web, Android',url:'https://comerciolleno.com',description:'Sistema POS 100% online para comercios con ventas, stock, caja, facturación ARCA, Mercado Pago y versión móvil.',offers:{'@type':'Offer',price:'0',priceCurrency:'ARS',description:'30 días gratis, sin tarjeta. Después $14.900 por mes.'},featureList:productFeatures}
  const organizationLd={'@context':'https://schema.org','@type':'Organization',name:'Llena Group',brand:{'@type':'Brand',name:'Comercio Lleno'},url:'https://comerciolleno.com'}

  return <main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(softwareLd)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationLd)}}/>

    <div className={styles.topLine}/>
    <header className={`${styles.header} ${mobileFix.header}`}>
      <Link href="/" className={`${styles.brand} ${mobileFix.brand}`} aria-label="Comercio Lleno"><BrandLogo size={42}/></Link>
      <nav className={styles.nav} aria-label="Navegación principal">
        <Link href="/funcionalidades">Funcionalidades</Link>
        <Link href="/soluciones">Soluciones</Link>
        <a href="#pc">Cómo se ve</a>
        <a href="#precio">Precio</a>
        <a href="#preguntas">Preguntas</a>
      </nav>
      <div className={`${styles.headerActions} ${mobileFix.headerActions}`}>
        <Link href="/redesign/access" className={`${styles.login} ${mobileFix.login}`}>Ingresar</Link>
        <Link href="/prueba-gratis" className={`${styles.tryButton} ${mobileFix.tryButton}`}>30 DÍAS GRATIS</Link>
      </div>
    </header>

    <LandingHero2026/>

    <section className={styles.integrationBand} aria-label="Integraciones y compatibilidades">
      <div className={styles.integrationIntro}><b>Tu operación, conectada.</b><span>Todo lo importante, dentro del mismo flujo.</span></div>
      <div className={styles.integrationRail}>
        <span className={styles.arca}><img src={arcaLogo} alt="ARCA"/></span>
        <span><img src={mercadoPagoIcon} alt="Mercado Pago" style={{width:28,height:28,marginBottom:7}}/><b>Mercado Pago</b><small>Point + QR físico</small></span>
        <span><b>OpenAI</b><small>modelos usados por el asistente</small></span>
        <span><b>Scanner USB</b><small>códigos de barra</small></span>
        <span><b>58 / 80 mm</b><small>impresora térmica</small></span>
      </div>
    </section>

    <div id="pc" style={{scrollMarginTop:96}}>
      <LandingSystemShowcase/>
    </div>

    <LandingSolutionsTeaser/>

    <section className={styles.productSection} id="producto">
      <div className={styles.sectionHeading}>
        <div><p>HECHO PARA TRABAJAR, NO PARA COMPLICARTE</p><h2>Una herramienta para<br/><em>mover el negocio.</em></h2></div>
        <p className={styles.sectionLead}>La interfaz se organiza alrededor de lo que pasa de verdad: cobrar, buscar un producto, controlar stock, facturar y seguir. Y si tu negocio necesita algo extra, activás el módulo correspondiente.</p>
      </div>
      <LandingFeatureTabs/>
      <div style={{display:'flex',justifyContent:'center',marginTop:26}}><Link href="/funcionalidades" style={{display:'inline-flex',alignItems:'center',height:48,padding:'0 18px',borderRadius:12,border:'1px solid #cbd8d1',textDecoration:'none',fontSize:12,fontWeight:900,color:'inherit'}}>VER TODAS LAS FUNCIONALIDADES →</Link></div>
    </section>

    <ArgentinaPride/>

    <section className={styles.priceSection} id="precio">
      <div className={styles.priceMain}>
        <p>PROBALO EN TU NEGOCIO</p>
        <h2>30 días gratis.<br/><span>Después, $14.900 por mes.</span></h2>
        <p>Usá Comercio Lleno durante un mes completo con tu operación real: cargá productos, vendé, controlá caja y stock, probá la facturación y recorré el sistema. No te pedimos tarjeta para empezar.</p>
      </div>
      <div className={styles.priceOffer}>
        <div className="landingTrialSpotlight"><strong>30 DÍAS · $0</strong><span>SIN TARJETA</span></div>
        <span className={styles.offerBadge}>PRUEBA GRATIS · POR TIEMPO LIMITADO</span>
        <div className={styles.priceLine}><strong>$0</strong><small>/ primeros 30 días</small></div>
        <p>Después, $14.900/mes. Cancelás cuando quieras.</p>
        <Link href="/prueba-gratis" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',height:48,borderRadius:12,background:'#16271f',color:'#fff',fontWeight:900,fontSize:12,textDecoration:'none',margin:'10px 0 2px'}}>EMPEZAR GRATIS →</Link>
        <small className={styles.supportNote}>Incluye 1 sucursal, hasta 1.000 productos y 500 comprobantes ARCA. Ampliaciones opcionales desde $4.900. <Link href="/terminos">Ver condiciones.</Link></small>
      </div>
    </section>

    <section className={styles.moreInfo} id="preguntas" aria-label="Más información">
      <div><p>LO QUE SUELE IMPORTAR</p><h2>Respuestas cortas.<br/>Como debe ser.</h2></div>
      <div className={styles.detailsList}>
        <details><summary>¿Cuánto cuesta Comercio Lleno?<span>+</span></summary><p>Los primeros 30 días son gratis y no necesitás tarjeta. Después, el precio es $14.900 por mes. Podés cancelar cuando quieras.</p></details>
        <details><summary>¿Qué incluye la prueba gratis y cuáles son sus límites?<span>+</span></summary><p>Incluye 1 sucursal, hasta 1.000 productos activos y hasta 500 comprobantes fiscales autorizados por ARCA. Si necesitás más, podés agregar sucursales, desbloquear productos ilimitados o ampliar la facturación hasta 2.500 comprobantes mediante ampliaciones opcionales de $4.900 cada una. Máximo 5 sucursales por comercio.</p></details>
        <details><summary>¿Puedo facturar con ARCA?<span>+</span></summary><p>Sí. Una vez configurado el certificado y el punto de venta, la facturación queda integrada al flujo de venta.</p></details>
        <details><summary>¿Funciona con Mercado Pago, scanner e impresora?<span>+</span></summary><p>El sistema contempla Mercado Pago Point y QR físico, lectores de códigos USB e impresoras térmicas de 58 y 80 mm.</p></details>
        <details><summary>¿Qué hace la inteligencia artificial?<span>+</span></summary><p>El asistente puede consultar ventas, stock y tendencias del comercio. Utiliza modelos de IA —incluidos modelos de OpenAI— a través de nuestra infraestructura.</p></details>
        <details><summary>¿Funciona desde el celular?<span>+</span></summary><p>Sí. Comercio Lleno es 100% online y la experiencia móvil está pensada como herramienta principal. También podés usarlo desde PC con los mismos datos sincronizados.</p></details>
      </div>
    </section>

    <footer className={`${styles.footer} ${mobileFix.footer}`}>
      <div className={`${styles.footerBrand} ${mobileFix.footerBrand}`}>
        <BrandLogo size={38}/>
        <p>Software de gestión comercial de Llena Group.</p>
        <p style={{marginTop:8,fontSize:12,lineHeight:1.5,opacity:.78}}>Titular: Gabriel Alejandro Granvillano · CUIT: 20-38422407-6</p>
        <a href={dataFiscalHref} target="_F960AFIPInfo" rel="noopener noreferrer" aria-label="Ver Data Fiscal de ARCA" style={{display:'inline-flex',marginTop:14,padding:7,borderRadius:10,background:'#fff',border:'1px solid rgba(0,0,0,.12)',overflow:'visible'}}>
          <img src={dataFiscalImage} alt="Formulario 960/D - Data Fiscal" width="94" height="130" style={{display:'block',width:94,height:130,objectFit:'contain',maxWidth:'100%'}}/>
        </a>
      </div>
      <div className={styles.footerLinks}><Link href="/funcionalidades">Funcionalidades</Link><Link href="/soluciones">Soluciones</Link><Link href="/terminos">Términos</Link><Link href="/politica-de-privacidad">Privacidad</Link><Link href="/politica-de-cookies">Cookies</Link><button type="button" data-cookie-settings>Configurar cookies</button><Link href="/eliminar-cuenta">Eliminar cuenta</Link></div>
    </footer>
  </main>
}