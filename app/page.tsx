import Link from 'next/link'
import BrandLogo from './BrandLogo'
import LandingFeatureTabs from './LandingFeatureTabs'
import LandingMobileInnovation from './LandingMobileInnovation'
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
  'Stock y productos',
  'Facturación electrónica ARCA',
  'Modo offline',
  'Scanner móvil',
  'Inteligencia artificial',
  'Lectores USB e impresoras térmicas',
  'Integración con Mercado Pago',
]

export const metadata={
  title:'Comercio Lleno | Sistema POS online para comercios en Argentina',
  description:'Sistema POS online para vender, controlar stock y caja, facturar con ARCA y gestionar el comercio desde computadora o celular. Probalo gratis durante 3 meses.',
  keywords:['sistema pos argentina','punto de venta','software para comercios','facturación ARCA','control de stock','caja diaria','POS online'],
  alternates:{canonical:'https://comerciolleno.com'},
  openGraph:{title:'Comercio Lleno | Un sistema para todo tu comercio',description:'Ventas, stock, caja y facturación ARCA. Plan Impulso: 3 meses gratis; luego 3 meses a $14.900 por mes.',url:'https://comerciolleno.com',siteName:'Comercio Lleno',locale:'es_AR',type:'website'},
  robots:{index:true,follow:true},
}

export default function LandingPage(){
  const softwareLd={'@context':'https://schema.org','@type':'SoftwareApplication',name:'Comercio Lleno',applicationCategory:'BusinessApplication',operatingSystem:'Web, Android',url:'https://comerciolleno.com',description:'Sistema POS online para comercios con ventas, stock, caja, facturación ARCA y versión móvil.',offers:{'@type':'Offer',price:'0',priceCurrency:'ARS',description:'Plan Impulso: 90 días gratis. Luego, 3 meses a $14.900 por mes y después $29.800 por mes.'},featureList:productFeatures}
  const organizationLd={'@context':'https://schema.org','@type':'Organization',name:'Llena Group',brand:{'@type':'Brand',name:'Comercio Lleno'},url:'https://comerciolleno.com'}

  return <main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(softwareLd)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationLd)}}/>

    <div className={styles.topLine}/>
    <header className={`${styles.header} ${mobileFix.header}`}>
      <Link href="/" className={`${styles.brand} ${mobileFix.brand}`} aria-label="Comercio Lleno"><BrandLogo size={42}/></Link>
      <nav className={styles.nav} aria-label="Navegación principal">
        <a href="#producto">Producto</a>
        <Link href="/soluciones">Soluciones</Link>
        <a href="#movil">Móvil</a>
        <a href="#precio">Precio</a>
        <a href="#preguntas">Preguntas</a>
      </nav>
      <div className={`${styles.headerActions} ${mobileFix.headerActions}`}>
        <Link href="/redesign/access" className={`${styles.login} ${mobileFix.login}`}>Ingresar</Link>
      </div>
    </header>

    <LandingMobileInnovation/>

    <section className={styles.integrationBand} aria-label="Integraciones y compatibilidades">
      <div className={styles.integrationIntro}><b>Tu operación, conectada.</b><span>Marcas conocidas. Un solo flujo de trabajo.</span></div>
      <div className={styles.integrationRail}>
        <span className={styles.arca}><img src={arcaLogo} alt="ARCA"/></span>
        <span><img src={mercadoPagoIcon} alt="Mercado Pago" style={{width:28,height:28,marginBottom:7}}/><b>Mercado Pago</b><small>integración de cobro</small></span>
        <span><b>OpenAI</b><small>modelos usados por el asistente</small></span>
        <span><b>Scanner USB</b><small>códigos de barra</small></span>
        <span><b>58 / 80 mm</b><small>impresora térmica</small></span>
      </div>
    </section>

    <LandingSolutionsTeaser/>

    <section className={styles.productSection} id="producto">
      <div className={styles.sectionHeading}>
        <div><p>NO ES UNA PLANILLA CON BOTONES</p><h2>Una herramienta para<br/><em>mover el negocio.</em></h2></div>
        <p className={styles.sectionLead}>La interfaz se organiza alrededor de lo que pasa de verdad: cobrar, buscar un producto, mirar stock, facturar y seguir.</p>
      </div>
      <LandingFeatureTabs/>
    </section>

    <ArgentinaPride/>

    <section className={styles.priceSection} id="precio">
      <div className={styles.priceMain}>
        <p>PLAN IMPULSO</p>
        <h2>3 meses gratis.<br/><span>Después, 3 meses a $14.900 por mes.</span></h2>
        <p>Usá Comercio Lleno de verdad durante 90 días: cargá productos, vendé, controlá caja, stock y recorré todo el sistema sin pagar. Luego de los tres meses promocionales pagos, el precio regular es $29.800 por mes.</p>
      </div>
      <div className={styles.priceOffer}>
        <div className="landingTrialSpotlight"><strong>90 DÍAS · $0</strong><span>SIN TARJETA</span></div>
        <span className={styles.offerBadge}>PLAN IMPULSO · TIEMPO LIMITADO</span>
        <div className={styles.priceLine}><strong>$0</strong><small>/ primeros 3 meses</small></div>
        <p>Después, 3 meses a $14.900/mes. Luego $29.800/mes. Cancelás cuando quieras.</p>
        <small className={styles.supportNote}>Incluye 1 sucursal, hasta 1.000 productos y 500 comprobantes ARCA. Ampliaciones opcionales desde $4.900. <Link href="/terminos">Ver condiciones.</Link></small>
      </div>
    </section>

    <section className={styles.moreInfo} id="preguntas" aria-label="Más información">
      <div><p>LO QUE SUELE IMPORTAR</p><h2>Respuestas cortas.<br/>Como debe ser.</h2></div>
      <div className={styles.detailsList}>
        <details><summary>¿Cuánto cuesta el Plan Impulso?<span>+</span></summary><p>Los primeros 90 días son gratis. Después tenés 3 meses a $14.900 por mes; terminado ese período, el precio regular es $29.800 por mes. Podés cancelar cuando quieras.</p></details>
        <details><summary>¿Qué incluye la prueba gratis y cuáles son sus límites?<span>+</span></summary><p>Incluye 1 sucursal, hasta 1.000 productos activos y hasta 500 comprobantes fiscales autorizados por ARCA. Si necesitás más, podés agregar sucursales, desbloquear productos ilimitados o ampliar la facturación hasta 2.500 comprobantes mediante ampliaciones opcionales de $4.900 cada una. Máximo 5 sucursales por comercio.</p></details>
        <details><summary>¿Puedo facturar con ARCA?<span>+</span></summary><p>Sí. Una vez configurado el certificado y el punto de venta, la facturación queda integrada al flujo de venta.</p></details>
        <details><summary>¿Funciona con Mercado Pago, scanner e impresora?<span>+</span></summary><p>El sistema contempla integración con Mercado Pago y compatibilidad con lectores de códigos USB e impresoras térmicas de 58 y 80 mm.</p></details>
        <details><summary>¿Qué hace la inteligencia artificial?<span>+</span></summary><p>El asistente puede consultar ventas, stock y tendencias del comercio. Utiliza modelos de IA —incluidos modelos de OpenAI— a través de nuestra infraestructura.</p></details>
        <details><summary>¿Funciona desde el celular?<span>+</span></summary><p>Sí. La experiencia móvil está diseñada como herramienta principal y también podés usar Comercio Lleno desde PC con los mismos datos sincronizados.</p></details>
      </div>
    </section>

    <footer className={`${styles.footer} ${mobileFix.footer}`}>
      <div className={`${styles.footerBrand} ${mobileFix.footerBrand}`}>
        <BrandLogo size={38}/>
        <p>Software de gestión comercial de Llena Group.</p>
        <a href={dataFiscalHref} target="_F960AFIPInfo" rel="noopener noreferrer" aria-label="Ver Data Fiscal de ARCA" style={{display:'inline-flex',marginTop:12,borderRadius:8,overflow:'hidden'}}>
          <img src={dataFiscalImage} alt="Formulario 960/D - Data Fiscal" width="76" height="105" style={{display:'block',width:76,height:'auto'}}/>
        </a>
      </div>
      <div className={styles.footerLinks}><Link href="/soluciones">Soluciones</Link><Link href="/terminos">Términos</Link><Link href="/politica-de-privacidad">Privacidad</Link><Link href="/politica-de-cookies">Cookies</Link><button type="button" data-cookie-settings>Configurar cookies</button><Link href="/eliminar-cuenta">Eliminar cuenta</Link></div>
    </footer>
  </main>
}
