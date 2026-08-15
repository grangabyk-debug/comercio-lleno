import Link from 'next/link'
import Script from 'next/script'
import BrandLogo from './BrandLogo'
import LandingFeatureTabs from './LandingFeatureTabs'
import LandingMobileInnovation from './LandingMobileInnovation'
import styles from './LandingPremium.module.css'

const heroPhoto='https://images.pexels.com/photos/6545444/pexels-photo-6545444.jpeg?auto=compress&cs=tinysrgb&w=2000'
const arcaLogo='https://arca.gob.ar/frameworkAFIP/img/logo_arca_blanco.svg'

const productFeatures=[
  'Ventas y caja',
  'Stock y productos',
  'Facturación electrónica ARCA',
  'Modo offline',
  'Scanner móvil',
  'Inteligencia artificial',
  'Lectores USB e impresoras térmicas',
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
    <Script id="microsoft-clarity" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","y23ygnz380");`}</Script>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(softwareLd)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationLd)}}/>

    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="Comercio Lleno"><BrandLogo size={42}/></Link>
      <nav className={styles.nav} aria-label="Navegación principal">
        <a href="#producto">Producto</a>
        <a href="#movil">Móvil</a>
        <a href="#precio">Precio</a>
      </nav>
      <div className={styles.headerActions}>
        <Link href="/redesign/access" className={styles.login}>Ingresar</Link>
        <Link href="/prueba-gratis" className={styles.tryButton}>Probar gratis</Link>
      </div>
    </header>

    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.kicker}>POS ONLINE · HECHO PARA EL COMERCIO REAL</p>
        <h1>Tu negocio,<br/><span>mucho más simple.</span></h1>
        <p className={styles.heroLead}>Vendé, facturá, controlá stock y seguí la caja desde un solo lugar. Sin convertir tu comercio en una empresa de sistemas.</p>
        <div className={styles.heroActions}>
          <Link href="/prueba-gratis" className={styles.primary}>Empezar 14 días gratis</Link>
          <a href="#producto" className={styles.textLink}>Ver cómo funciona <span>→</span></a>
        </div>
        <div className={styles.heroFacts}>
          <span>Sin instalación pesada</span>
          <span>ARCA integrado</span>
          <span>Web + móvil</span>
        </div>
      </div>
      <div className={styles.heroVisual}>
        <img src={heroPhoto} alt="Comerciante atendiendo a una clienta en su local" fetchPriority="high"/>
        <div className={styles.heroCaption}><b>Hecho para trabajar</b><span>no para aprender un sistema</span></div>
      </div>
    </section>

    <section className={styles.integrations} aria-label="Integraciones y compatibilidades">
      <div className={styles.integrationLead}>Funciona con lo que ya usás</div>
      <div className={styles.integrationItems}>
        <span className={styles.arca}><img src={arcaLogo} alt="ARCA"/></span>
        <span><b>Mercado Pago</b><small>suscripciones</small></span>
        <span><b>58 / 80 mm</b><small>tickets térmicos</small></span>
        <span><b>USB</b><small>lector de códigos</small></span>
        <span><b>WhatsApp + IA</b><small>módulo opcional</small></span>
      </div>
    </section>

    <section className={styles.productSection} id="producto">
      <div className={styles.sectionHeading}>
        <p>UN SISTEMA. MENOS VUELTAS.</p>
        <h2>Todo lo importante está cerca.<br/>Lo demás, no molesta.</h2>
        <p className={styles.sectionLead}>Tomamos una idea simple: la pantalla tiene que acompañar lo que pasa en el mostrador. Elegí una función para verla.</p>
      </div>
      <LandingFeatureTabs/>
    </section>

    <LandingMobileInnovation/>

    <section className={styles.priceSection} id="precio">
      <div className={styles.priceMain}>
        <p>EMPEZÁ CON TU NEGOCIO REAL</p>
        <h2>14 días para usarlo.<br/>Después decidís.</h2>
        <p>Cargá tus productos, hacé ventas y probá el flujo completo antes del primer cobro.</p>
      </div>
      <div className={styles.priceOffer}>
        <span>50% OFF · PRIMEROS 3 MESES</span>
        <div className={styles.priceLine}><strong>$14.900</strong><small>/ mes</small></div>
        <p>Luego $29.800/mes. Incluye hasta 2 sucursales.</p>
        <Link href="/prueba-gratis">Crear mi cuenta</Link>
        <small className={styles.supportNote}>Soporte humano disponible para configuración y puesta en marcha.</small>
      </div>
    </section>

    <section className={styles.moreInfo} aria-label="Más información">
      <div><p>MÁS INFORMACIÓN</p><h2>Lo esencial arriba.<br/>El detalle, cuando lo necesitás.</h2></div>
      <div className={styles.detailsList}>
        <details><summary>¿Qué necesito para empezar?<span>+</span></summary><p>Un navegador moderno y conexión a Internet. Podés sumar lector de códigos e impresora térmica si tu operación los necesita.</p></details>
        <details><summary>¿Puedo facturar con ARCA?<span>+</span></summary><p>Sí. Una vez configurado el certificado y el punto de venta, la facturación queda integrada al flujo de venta.</p></details>
        <details><summary>¿Funciona desde el celular?<span>+</span></summary><p>Sí. La experiencia móvil permite vender, consultar productos, escanear códigos y trabajar con caja y facturación.</p></details>
      </div>
    </section>

    <footer className={styles.footer}>
      <div className={styles.footerBrand}><BrandLogo size={38}/><p>Software de gestión comercial de Llena Group.</p></div>
      <div className={styles.footerLinks}><Link href="/politica-de-privacidad">Privacidad</Link><Link href="/eliminar-cuenta">Eliminar cuenta</Link><Link href="/redesign/access">Ingresar</Link></div>
      <div className={styles.footerCta}><span>¿Querés probarlo?</span><Link href="/prueba-gratis">14 días gratis →</Link></div>
    </footer>
  </main>
}
