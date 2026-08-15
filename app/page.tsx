import Link from 'next/link'
import Script from 'next/script'
import styles from './landing.module.css'
import BrandLogo from './BrandLogo'
import HeroMerchantRotator from './HeroMerchantRotator'
import ArgentinaStory from './ArgentinaStory'
import ArcaDashboardVisual from './ArcaDashboardVisual'
import {AiSignature,HumanSupportVisual,WhatsAppPhoneVisual,SecuritySeals,GooglePresence} from './LandingEnhancements'

const arcaLogo='https://arca.gob.ar/frameworkAFIP/img/logo_arca_blanco.svg'
const bakeryPhoto='https://images.pexels.com/videos/13061609/buying-cashier-check-out-chocolate-store-13061609.jpeg?auto=compress&fit=crop&w=1600'
const villageShopPhoto='https://images.pexels.com/photos/12326636/pexels-photo-12326636.jpeg?auto=compress&cs=tinysrgb&w=1600'
const furniturePhoto='https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600'
const inventoryPhoto='https://images.pexels.com/videos/5103992/pexels-photo-5103992.jpeg?auto=compress&fit=crop&w=1600'
const candyShopPhoto='https://images.pexels.com/photos/33752264/pexels-photo-33752264.jpeg?auto=compress&cs=tinysrgb&w=1600'

const productFeatures:Array<[string,string]>=[
  ['Facturación electrónica ARCA','Cobrá y emití comprobantes desde el mismo flujo de venta, con la configuración fiscal de cada comercio.'],
  ['Modo offline','Si Internet se corta, el sistema puede seguir operando y sincronizar cuando vuelve la conexión.'],
  ['Modo Simple','Una interfaz reducida para cobrar, consultar productos, caja y ventas sin distracciones.'],
  ['Scanner móvil','Leé códigos con la cámara del celular para consultar, cargar stock o editar productos desde el salón.'],
  ['Pedido IA+','La reposición sugerida combina demanda reciente, stock actual y señales del movimiento real del negocio.'],
  ['Asistente de inteligencia artificial','Preguntá por ventas, tendencias, stock, métricas y oportunidades en lenguaje natural.'],
  ['Lectores USB','Conectá un lector de códigos de barras y trabajá con la velocidad de un POS de escritorio.'],
  ['Tickets térmicos 58 / 80 mm','Preparado para formatos habituales de impresoras térmicas de mostrador.'],
  ['Caja manual o automática','Elegí apertura y cierre diario o una operación automática para equipos que necesitan más velocidad.'],
  ['Promociones y campañas','Creá descuentos y acciones comerciales sobre productos o grupos de productos.'],
]

const faq=[
  ['¿Qué necesito para usar Comercio Lleno?','No necesitás una computadora especial ni instalar un programa. Funciona desde un navegador moderno en computadora, notebook, celular o tablet. Para una operación fluida recomendamos una conexión a Internet de 50 Mbps o más.'],
  ['¿Tengo que instalar un programa?','No. Comercio Lleno funciona desde el navegador y está pensado para operar en computadora, notebook, celular y tablet.'],
  ['¿Puedo usar lector de códigos e impresora térmica?','Sí. El sistema contempla lectores USB y tickets térmicos de 58 y 80 milímetros.'],
  ['¿Qué pasa si se corta Internet?','El modo offline permite continuar con la operación prevista y sincronizar cuando vuelve la conexión.'],
  ['¿Incluye facturación electrónica?','Sí. Comercio Lleno integra el flujo de facturación electrónica con ARCA una vez configurado el certificado y el punto de venta del comercio.'],
  ['¿La inteligencia artificial reemplaza el soporte?','No. La IA ayuda a entender el negocio y usar el sistema, pero también hay asistencia humana para configuraciones o problemas que necesiten una persona.'],
  ['¿Puedo probarlo antes de pagar?','Sí. Empezás con 14 días gratis. Después pagás $14.900 por mes durante los primeros 3 meses con un 50% de descuento. Desde el cuarto mes, el valor sin descuento es $29.800 por mes. El plan incluye 2 sucursales; desde la 3.ª, cada sucursal adicional cuesta $9.900 por mes.'],
]

export const metadata={
  title:'Comercio Lleno | Sistema POS online para comercios en Argentina',
  description:'Sistema POS online con ventas, stock, caja, facturación electrónica ARCA, modo offline, lector de códigos, impresora térmica, scanner móvil e inteligencia artificial.',
  keywords:['sistema pos argentina','punto de venta','software para comercios','sistema de ventas','facturación ARCA','control de stock','caja diaria','lector código de barras','impresora térmica','POS online','software de gestión comercial'],
  alternates:{canonical:'https://comerciolleno.com'},
  openGraph:{title:'Comercio Lleno | Tu negocio bajo control desde hoy',description:'POS online para vender, facturar, controlar stock y entender el negocio con inteligencia artificial.',url:'https://comerciolleno.com',siteName:'Comercio Lleno',locale:'es_AR',type:'website'},
  robots:{index:true,follow:true},
}

function ProductWindow(){return <div className={styles.productWindow}><div className={styles.productWindowTop}><span>Comercio Lleno</span><b>ARCA conectado</b><b>Offline listo</b></div><div className={styles.productWindowBody}><aside><strong>Inicio</strong><strong>Nueva venta</strong><span>Productos</span><span>Caja diaria</span><span>Configuración</span></aside><section><small>OPERACIÓN</small><h3>Nueva venta</h3><div className={styles.productSearch}>Escaneá o buscá un producto <b>Buscar</b></div><div className={styles.productStats}><div><span>Venta actual</span><strong>$ 28.450</strong></div><div><span>Productos</span><strong>6</strong></div><div><span>Stock</span><strong>Actualizado</strong></div></div><div className={styles.productRows}>{[1,2,3,4].map(n=><div key={n}><span/><span/><span/></div>)}</div></section></div></div>}

function SimpleMode(){return <div className={styles.simpleMode}><span>MODO SIMPLE</span><h3>¿Qué querés hacer?</h3><div className={styles.simpleModeGrid}><div><b>Cobrar</b><small>Escanear y cobrar</small></div><div><b>Productos</b><small>Precios y stock</small></div><div><b>Caja diaria</b><small>Apertura y cierre</small></div><div><b>Ventas</b><small>Últimas operaciones</small></div></div></div>}

function MobileScanner(){return <div className={styles.phoneMock}><div className={styles.phoneBar}/><span>CONTROL MÓVIL</span><h4>Escáner de productos</h4><div className={styles.scannerScreen}><i/><small>Código leído</small></div><div className={styles.scannerSearch}><span>7790070933652</span><b>Buscar</b></div><div className={styles.scannerResult}><small>PRODUCTO ENCONTRADO</small><strong>Detergente concentrado</strong><span>Stock 18 · $4.290</span><div><b>Cargar stock</b><b>Editar</b></div></div></div>}

export default function LandingPage(){
  const featureList:string[]=productFeatures.map(([title])=>title)
  const softwareLd={'@context':'https://schema.org','@type':'SoftwareApplication',name:'Comercio Lleno',applicationCategory:'BusinessApplication',operatingSystem:'Web',url:'https://comerciolleno.com',description:'Sistema POS online para comercios con ventas, stock, caja, facturación ARCA, modo offline, versión móvil e inteligencia artificial.',offers:{'@type':'Offer',price:'14900',priceCurrency:'ARS',description:'14 días gratis; luego $14.900 por mes durante los primeros 3 meses con 50% de descuento y $29.800 por mes desde el cuarto mes, sin descuento. Incluye 2 sucursales; desde la 3.ª, cada sucursal adicional cuesta $9.900 por mes.'},featureList}
  const organizationLd={'@context':'https://schema.org','@type':'Organization',name:'Llena Group',brand:{'@type':'Brand',name:'Comercio Lleno'},url:'https://comerciolleno.com'}
  const websiteLd={'@context':'https://schema.org','@type':'WebSite',name:'Comercio Lleno',alternateName:['ComercioLleno','comerciolleno.com'],url:'https://comerciolleno.com/'}

  return <main className={styles.page}>
    <Script id="microsoft-clarity" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","y23ygnz380");`}</Script>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(softwareLd)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationLd)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(websiteLd)}}/>

    <header className={styles.header}><Link href="/" className={styles.brand}><BrandLogo size={40}/></Link><nav className={styles.navLinks}><a href="#producto">Producto</a><a href="#comercios">Comercios</a><a href="#ia">Inteligencia artificial</a><a href="#soporte">Soporte</a><a href="#precio">Precio</a></nav><div className={styles.navCtas}><Link href="/redesign/access" className={styles.login}>Ingresar</Link><Link href="/prueba-gratis" className={styles.navTrial}>Probar gratis</Link></div></header>

    <section className={styles.hero}><HeroMerchantRotator/><div className={styles.heroOverlay}/><div className={styles.heroCopy}><p className={styles.heroKicker}>SISTEMA POS PARA COMERCIOS EN ARGENTINA</p><h1>Vendé más simple.<br/>Ordená todo desde <span>un solo lugar.</span></h1><p className={styles.heroLead}>Cobrá, facturá, controlá stock, seguí tu caja y entendé tus números con un sistema pensado para el ritmo real del comercio.</p><div className={styles.heroActions}><Link href="/prueba-gratis" className={styles.primary}>Empezar 14 días gratis</Link><a href="#producto" className={styles.secondary}>Conocer el sistema</a></div><p className={styles.humanLine}>Soporte humano disponible cuando una configuración necesita una persona de verdad.</p></div><div className={styles.heroProof}><div><strong>150+</strong><span>comercios en Argentina</span></div><div><strong>Sin límites</strong><span>productos y carga de stock ilimitados</span></div><div><strong>2 sucursales</strong><span>incluidas · desde la 3.ª, $9.900/mes por sucursal</span></div></div></section>

    <section className={styles.integrationStrip} aria-label="Integraciones y compatibilidades"><span>INTEGRACIONES Y COMPATIBILIDADES</span><div className={styles.integrationBrands}><div className={styles.arcaBrand}><img src={arcaLogo} alt="ARCA"/><small>Facturación electrónica</small></div><div><b>Mercado Pago</b><small>Suscripciones y cobros</small></div><div><b>WhatsApp</b><small>Módulo opcional</small></div><div><b>58 / 80 mm</b><small>Impresoras térmicas</small></div><div><b>USB</b><small>Lectores de códigos</small></div></div></section>

    <section className={styles.securitySection} id="requisitos"><div><p>REQUISITOS PARA EMPEZAR</p><h2>No necesitás una computadora especial.</h2></div><div className={styles.securityGrid}><article><b>Internet recomendado</b><p>Para trabajar con fluidez recomendamos una conexión de 50 Mbps o más.</p></article><article><b>Multidispositivo</b><p>Usalo desde computadora, notebook, celular o tablet con la misma cuenta.</p></article><article><b>Sin instalación especial</b><p>Funciona desde un navegador moderno. No necesitás comprar una PC específica ni instalar un programa pesado.</p></article><article><b>Hardware opcional</b><p>Podés sumar lector USB e impresora térmica si tu operación los necesita, pero no son requisito para empezar.</p></article></div></section>

    <section className={styles.editorialSection} id="producto"><div className={styles.editorialHeading}><p>TODO LO QUE PASA EN EL MOSTRADOR</p><h2>Un sistema que se siente rápido porque está diseñado alrededor de la operación.</h2></div><div className={styles.editorialGrid}><article className={`${styles.mediaCard} ${styles.mediaCardLarge}`}><img src={bakeryPhoto} alt="Comerciante atendiendo a un cliente en un local"/><div><span>VENTAS Y CAJA</span><h3>Cobrá sin frenar la fila.</h3><p>Buscá o escaneá productos, elegí el medio de pago, calculá vuelto y dejá cada operación registrada.</p></div></article><article className={styles.lightCard}><span>FACTURACIÓN ELECTRÓNICA</span><h3>ARCA integrado al flujo de venta.</h3><p>Una vez configurado el comercio, facturación y venta dejan de ser dos procesos separados.</p><ArcaDashboardVisual/></article><article className={styles.darkFeature}><span>PEDIDO IA+</span><h3>Reposición basada en lo que realmente se mueve.</h3><p>Demanda reciente, stock actual y señales del movimiento real del negocio ayudan a priorizar qué comprar primero.</p><div style={{margin:'18px 0 28px'}}><AiSignature compact/></div><div className={styles.orderList}>{['Detergente concentrado','Alcohol etílico','Desengrasante','Jabón líquido'].map((x,i)=><div key={x}><b>{String(i+1).padStart(2,'0')}</b><span>{x}</span></div>)}</div></article><article className={styles.mediaCard}><img src={inventoryPhoto} alt="Persona revisando inventario en un comercio"/><div><span>INVENTARIO</span><h3>Controlá stock donde está el producto.</h3><p>La versión móvil permite consultar y actualizar sin volver a la computadora.</p></div></article><article className={styles.simpleFeature}><SimpleMode/></article></div></section>

    <section className={styles.argentinaSection} id="comercios"><div className={styles.argentinaCopy}><p>UNA RED QUE SIGUE CRECIENDO</p><h2>Más de 150 comercios ya trabajan con Comercio Lleno en Argentina.</h2><p>Almacenes, locales de cercanía, perfumerías, bazares, servicios y otros negocios usan la plataforma para ordenar ventas, stock y caja desde una misma cuenta.</p><div className={styles.metricRow}><div><strong>150+</strong><span>comercios</span></div><div><strong>24/7</strong><span>acceso web</span></div><div><strong>1 sistema</strong><span>para toda la operación</span></div></div></div><ArgentinaStory/></section>

    <section className={styles.humanMosaic}><div className={styles.humanIntro}><p>HECHO PARA NEGOCIOS REALES</p><h2>El mismo sistema puede acompañar formas muy distintas de trabajar.</h2></div><div className={styles.mosaicGrid}><figure><img src={villageShopPhoto} alt="Dueño trabajando en un almacén de cercanía"/><figcaption><b>Almacenes y comercios de cercanía</b><span>Mostrador, productos, ventas, stock y caja.</span></figcaption></figure><figure><img src={furniturePhoto} alt="Personas trabajando en un showroom"/><figcaption><b>Showrooms y locales</b><span>Catálogo, stock, precios y seguimiento.</span></figcaption></figure><figure><img src={candyShopPhoto} alt="Tienda de golosinas en Buenos Aires"/><figcaption><b>Kioscos y tiendas de alto movimiento</b><span>Velocidad de mostrador, promociones y facturación.</span></figcaption></figure></div></section>

    <section className={styles.aiSection} id="ia"><div className={styles.aiCopy}><p>INTELIGENCIA ARTIFICIAL INCLUIDA</p><h2>No sólo te muestra datos. Te ayuda a entender qué hacer con ellos.</h2><p>Preguntale cuánto vendiste, qué día funciona mejor, qué producto rota más, qué stock está bajo o qué conviene promocionar. También puede guiarte dentro del sistema.</p><div style={{margin:'28px 0 44px'}}><AiSignature/></div><div className={styles.aiQuestions}><span>“¿Qué producto bajó sus ventas esta semana?”</span><span>“¿Qué debería reponer primero?”</span><span>“¿Qué día tengo el ticket promedio más alto?”</span><span>“¿Qué producto tiene margen para una promoción?”</span></div></div><div className={styles.aiPanel}><span>COMERCIO LLENO IA</span><div><small>PREGUNTA</small><p>¿Qué producto me conviene promocionar esta semana?</p></div><div className={styles.aiAnswer}><small>ANÁLISIS</small><p>Encontré cuatro productos con buena rotación y margen suficiente. El mejor candidato combina ventas estables con stock alto.</p></div><div className={styles.aiBars}><i/><i/><i/><i/></div></div></section>

    <section className={styles.mobileStory}><div className={styles.mobileVisual}><MobileScanner/></div><div className={styles.mobileStoryCopy}><p>VERSIÓN MÓVIL</p><h2>Escaneá, consultá y corregí stock desde el celular.</h2><p>Ideal para recibir mercadería, recorrer góndolas o revisar productos sin depender de la caja principal.</p><div className={styles.textList}><span>Cargar unidades recibidas</span><span>Modificar nombre y precio</span><span>Consultar stock en segundos</span><span>Buscar por código con la cámara</span></div></div></section>

    <section className={styles.supportSection} id="soporte"><div><p>SOPORTE HUMANO</p><h2>Cuando necesitás una persona, hablás con una persona.</h2><p>La inteligencia artificial resuelve consultas rápidas, pero configuraciones como ARCA, certificados, hardware o situaciones particulares pueden necesitar asistencia. Desde Comercio Lleno podés abrir el chat de ayuda y dejar tu consulta en cualquier momento.</p></div><HumanSupportVisual/></section>

    <section className={styles.whatsappSection} id="whatsapp"><div className={styles.whatsappCopy}><span>MÓDULO ADICIONAL</span><h2>WhatsApp + inteligencia artificial para atender y vender mientras tu equipo trabaja.</h2><p>El módulo opcional puede responder consultas, tomar pedidos, acompañar ventas y ayudar a crear campañas para recuperar clientes. Se contrata por separado del plan base.</p><div className={styles.whatsappItems}><span>Respuestas automáticas con contexto del negocio</span><span>Pedidos y consultas por WhatsApp</span><span>Campañas y recuperación de clientes</span><span>Derivación a atención humana cuando haga falta</span></div></div><WhatsAppPhoneVisual/></section>

    <section className={styles.securitySection}><div><p>SEGURIDAD Y CONTINUIDAD</p><h2>Tu operación tiene que seguir funcionando y tus datos tienen que estar separados.</h2></div><div className={styles.securityGrid}><article><b>Acceso autenticado</b><p>Cada usuario entra con sus propias credenciales y permisos.</p></article><article><b>Datos por comercio</b><p>La información se organiza dentro del espacio correspondiente a cada cuenta.</p></article><article><b>HTTPS</b><p>La conexión pública del sistema se sirve de forma cifrada.</p></article><article><b>Modo offline</b><p>La continuidad de venta no depende de que cada segundo haya Internet.</p></article></div><SecuritySeals/></section>

    <GooglePresence/>

    <section className={styles.priceSection} id="precio"><div className={styles.priceCopy}><p>OPORTUNIDAD ESPECIAL</p><h2>Probalo con tu negocio funcionando.</h2><p>Cargá productos, hacé ventas y decidí después de usarlo de verdad. Empezás con 14 días gratis antes del primer cobro.</p></div><div className={styles.priceCard}><span>50% DE DESCUENTO · PRIMEROS 3 MESES</span><del style={{display:'block',fontSize:20,color:'#9aa39f',marginTop:8}}>$29.800 / mes</del><strong>$14.900 <small>/ mes x 3 meses</small></strong><p>Ahorrás $14.900 por mes durante tus primeros 3 meses. Desde el cuarto mes, el valor sin descuento es $29.800/mes.</p><p><b>Incluye hasta 2 sucursales.</b> Desde la 3.ª, cada sucursal adicional cuesta <b>$9.900 por mes</b>, hasta un máximo de 5 sucursales.</p><Link href="/prueba-gratis">Crear mi cuenta</Link><small>El módulo WhatsApp + IA se contrata por separado.</small></div></section>

    <section className={styles.faqSection}><div className={styles.faqHeading}><p>PREGUNTAS FRECUENTES</p><h2>Antes de empezar.</h2></div><div className={styles.faqGrid}>{faq.map(([q,a])=><article key={q}><h3>{q}</h3><p>{a}</p></article>)}</div></section>

    <section className={styles.finalCta}><div><p>ORDENÁ TU NEGOCIO DESDE HOY</p><h2>Tu primera venta puede estar cargada en minutos.</h2></div><Link href="/prueba-gratis">Empezar 14 días gratis</Link></section>

    <footer className={styles.footer}><BrandLogo size={34}/><div><a href="#producto">Producto</a><a href="#soporte">Soporte</a><Link href="/terminos">Términos</Link><Link href="/privacidad">Privacidad</Link></div><small>Comercio Lleno · Sistema POS online para comercios</small></footer>
  </main>
}