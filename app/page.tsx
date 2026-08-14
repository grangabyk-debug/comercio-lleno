import Link from 'next/link'
import styles from './landing.module.css'
import BrandLogo from './BrandLogo'
import UiIcon from './redesign/UiIcon'

const heroPhoto='https://images.unsplash.com/photo-1742836531271-98fd8151d257?auto=format&fit=crop&fm=jpg&q=82&w=1800'
const inventoryPhoto='https://images.unsplash.com/photo-1753161029353-f6bb0ff2ad3c?auto=format&fit=crop&fm=jpg&q=82&w=1800'
const arcaLogo='https://arca.gob.ar/frameworkAFIP/img/logo_arca_blanco.svg'

const differentiators=[
  ['sparkles','IA que entiende tu negocio','Consultá ventas, tendencias, stock y métricas. También te ayuda a usar el sistema y a detectar oportunidades.'],
  ['products','Pedido IA+','Sugiere reposición usando demanda reciente, stock actual y señales del movimiento real de tu comercio.'],
  ['mobile','Scanner móvil','Usá la cámara del celular para leer códigos, buscar productos, cargar stock y actualizar datos desde el salón.'],
  ['sale','Modo Simple','Una interfaz de operación rápida para cobrar, consultar productos, revisar caja y ver ventas sin distracciones.'],
  ['cash','Caja manual o automática','Elegí control diario con apertura y cierre, o una operación automática para equipos que necesitan velocidad.'],
  ['cloud','Online y offline','El sistema vive en la nube, pero puede seguir operando cuando la conexión se corta y sincronizar después.'],
] as const

const operations=[
  ['Facturación electrónica ARCA','Emití comprobantes desde el flujo de venta con la configuración fiscal de cada comercio.'],
  ['Lector USB de códigos','Conectá un scanner de códigos de barras y trabajá con la velocidad de un POS de escritorio.'],
  ['Tickets térmicos 58 / 80 mm','Preparado para impresoras térmicas y formatos habituales de mostrador.'],
  ['Stock y precios en tiempo real','Controlá existencias, costos, precios, mínimos, proveedores y movimientos.'],
  ['Promociones y campañas','Creá descuentos y acciones comerciales sobre productos o grupos de productos.'],
  ['Asistencia humana','Si una configuración se complica, pedí ayuda desde el mismo sistema y hablá con soporte.'],
] as const

const security=[
  ['Conexión protegida','El acceso público funciona sobre HTTPS y el sistema utiliza autenticación por usuario.'],
  ['Datos separados por comercio','Cada cuenta trabaja dentro de su propio espacio y permisos asociados.'],
  ['Permisos por usuario','Propietarios y operadores pueden tener accesos distintos según su función.'],
] as const

export const metadata={
  title:'Comercio Lleno | Sistema POS online con ARCA, stock e IA',
  description:'Sistema POS para comercios con ventas, stock, caja, facturación electrónica ARCA, modo offline, lector de códigos, impresora térmica, versión móvil e inteligencia artificial.',
  keywords:['sistema pos','punto de venta','software para comercios','facturación ARCA','control de stock','caja diaria','lector código de barras','impresora térmica','POS Argentina','software de gestión comercial'],
  alternates:{canonical:'https://comerciolleno.com'},
  openGraph:{title:'Comercio Lleno | Tu comercio, más simple y bajo control',description:'POS online con ARCA, stock, caja, modo offline, scanner móvil e inteligencia artificial.',url:'https://comerciolleno.com',siteName:'Comercio Lleno',locale:'es_AR',type:'website'},
  robots:{index:true,follow:true},
}

function Arrow(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 7l5 5-5 5"/></svg>}
function Check(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>}
function Shield(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5.2-3.2 8.4-8 10-4.8-1.6-8-4.8-8-10V6l8-3Z"/><path d="m8.5 12 2.1 2.1 4.9-5"/></svg>}
function WhatsAppMark(){return <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.1 4.2A11.4 11.4 0 0 0 6.3 21.4L4.8 27l5.7-1.5a11.5 11.5 0 1 0 5.6-21.3Zm0 20.6c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3.4.9.9-3.3-.2-.4a9.2 9.2 0 1 1 8.2 4.4Zm5-6.9c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.6l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.9 5.2 2.2.9 3.1 1 4.2.8.7-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.1-1.3-.1-.2-.3-.3-.6-.4Z"/></svg>}

function AppMock(){return <div className={styles.appMock}>
  <div className={styles.browserBar}><i/><i/><i/><span>comerciolleno.com</span></div>
  <div className={styles.mockBody}>
    <aside><BrandLogo size={34} markOnly/>{['Inicio','Nueva venta','Productos','Caja diaria','Configuración'].map((x,i)=><div className={i===1?styles.mockNavActive:styles.mockNav} key={x}><b>{x.slice(0,1)}</b><span>{x}</span></div>)}</aside>
    <section>
      <div className={styles.mockTop}><span>ARCA conectado</span><span>Offline listo</span></div>
      <small>OPERACIÓN</small><h3>Nueva venta</h3>
      <div className={styles.mockSearch}>Escaneá o buscá un producto <span>Buscar</span></div>
      <div className={styles.mockGrid}><article><b>Venta rápida</b><strong>$ 28.450</strong><p>6 productos</p></article><article><b>Stock</b><strong>1.248</strong><p>actualizado</p></article><article><b>IA</b><strong>Pedido listo</strong><p>reposición sugerida</p></article></div>
      <div className={styles.mockTable}>{[1,2,3,4].map(n=><div key={n}><span/><span/><span/></div>)}</div>
    </section>
  </div>
</div>}

function SimpleMock(){return <div className={styles.simpleMock}>
  <div className={styles.simpleHead}><span>MODO SIMPLE</span><b>¿Qué querés hacer?</b></div>
  <div className={styles.simpleTiles}><div className={styles.greenTile}><strong>Cobrar</strong><span>Escanear y cobrar</span></div><div className={styles.blueTile}><strong>Productos</strong><span>Precios y stock</span></div><div className={styles.yellowTile}><strong>Caja diaria</strong><span>Apertura y cierre</span></div><div className={styles.purpleTile}><strong>Ventas</strong><span>Últimas operaciones</span></div></div>
</div>}

function MobileMock(){return <div className={styles.phone}><div className={styles.phoneTop}/><div className={styles.phoneContent}><span>CONTROL MÓVIL</span><h4>Escáner de productos</h4><div className={styles.scannerBox}><i/><p>Código leído</p></div><div className={styles.codeRow}><b>7790070933652</b><button>Buscar</button></div><div className={styles.productFound}><small>PRODUCTO ENCONTRADO</small><strong>Detergente concentrado</strong><span>Stock 18 · $4.290</span><div><button>+ Stock</button><button>Editar</button></div></div></div></div>}

export default function LandingPage(){
  const softwareLd={
    '@context':'https://schema.org','@type':'SoftwareApplication',name:'Comercio Lleno',applicationCategory:'BusinessApplication',operatingSystem:'Web',url:'https://comerciolleno.com',description:'Sistema POS online para comercios con ventas, stock, caja, facturación ARCA, modo offline, versión móvil e inteligencia artificial.',offers:{'@type':'Offer',price:'14900',priceCurrency:'ARS',description:'14 días de prueba gratis y luego abono mensual.'},featureList:differentiators.map(x=>x[1]).concat(operations.map(x=>x[0]))
  }
  return <main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(softwareLd)}}/>

    <header className={styles.header}>
      <Link href="/" className={styles.brand}><BrandLogo size={40} inverse/></Link>
      <nav className={styles.navLinks}><a href="#producto">Producto</a><a href="#ia">IA</a><a href="#seguridad">Seguridad</a><a href="#whatsapp">WhatsApp</a></nav>
      <div className={styles.navCtas}><Link href="/redesign/access" className={styles.login}>Ingresar</Link><Link href="/prueba-gratis" className={styles.navTrial}>Probar 14 días</Link></div>
    </header>

    <section className={styles.hero}>
      <div className={styles.heroGlowA}/><div className={styles.heroGlowB}/><div className={styles.texture}/>
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <div className={styles.heroBadge}><i/> SISTEMA POS PARA COMERCIOS QUE QUIEREN CRECER</div>
          <h1>Ordená tu negocio.<br/><span>Vendé más simple.</span></h1>
          <p>Un punto de venta moderno para cobrar, facturar, controlar stock, entender tus números y operar desde cualquier dispositivo. Con ARCA, modo offline e inteligencia artificial integrados.</p>
          <div className={styles.heroActions}><Link href="/prueba-gratis" className={styles.primary}>Empezar gratis hoy <Arrow/></Link><a href="#producto" className={styles.secondary}>Ver cómo funciona</a></div>
          <div className={styles.heroNotes}><span><Check/>14 días sin cargo</span><span><Check/>Sin instalación</span><span><Check/>Asistencia humana</span></div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.visualHalo}/><AppMock/>
          <div className={styles.floatCardA}><span>VENTAS HOY</span><strong>$ 486.230</strong><small>+18,4% vs. período anterior</small></div>
          <div className={styles.floatCardB}><span>PEDIDO IA+</span><strong>12 prioridades detectadas</strong><small>Demanda + stock + movimiento</small></div>
        </div>
      </div>
      <div className={styles.trustBar}><div><strong>150+</strong><span>comercios trabajando con la plataforma</span></div><div><strong>14 días</strong><span>para probar antes de pagar</span></div><div><strong>58 / 80 mm</strong><span>tickets térmicos preparados</span></div><div><strong>USB + móvil</strong><span>lectura de códigos en mostrador y salón</span></div></div>
    </section>

    <section className={styles.logoStrip} aria-label="Integraciones y capacidades"><div className={styles.arcaBadge}><img src={arcaLogo} alt="ARCA"/><span>Facturación electrónica integrada</span></div><div><b>OFFLINE</b><span>seguí operando sin conexión</span></div><div><b>IA</b><span>asistente y reposición inteligente</span></div><div><b>POS</b><span>web, escritorio y móvil</span></div></section>

    <section className={styles.section} id="producto">
      <div className={styles.sectionHeading}><span>UNA EXPERIENCIA MÁS RÁPIDA</span><h2>Hecho para el ritmo real de un comercio.</h2><p>No es sólo una caja para cobrar. Comercio Lleno reúne operación, control y análisis en una misma interfaz, sin obligarte a instalar un programa pesado en cada computadora.</p></div>
      <div className={styles.diffGrid}>{differentiators.map(([icon,title,text],i)=><article className={i<2?styles.diffFeatured:styles.diffCard} key={title}><div className={styles.iconWrap}><UiIcon name={icon} size={22}/></div><h3>{title}</h3><p>{text}</p>{i===0&&<div className={styles.miniChat}><span>¿Qué producto debería promocionar esta semana?</span><b>Te conviene revisar los artículos con buena rotación y margen alto. Encontré 4 candidatos.</b></div>}</article>)}</div>
    </section>

    <section className={styles.simpleSection}>
      <div className={styles.splitCopy}><span>VELOCIDAD DE MOSTRADOR</span><h2>Modo Simple para cuando sólo necesitás operar.</h2><p>Reducí la interfaz a cuatro acciones claras. Ideal para cajeros, equipos nuevos o momentos de alto movimiento.</p><ul><li><Check/>Cobrar con lector de códigos</li><li><Check/>Consultar precios y stock</li><li><Check/>Abrir, revisar y cerrar caja</li><li><Check/>Volver al panel completo cuando lo necesites</li></ul></div>
      <SimpleMock/>
    </section>

    <section className={styles.mobileSection}>
      <div className={styles.mobilePhoto}><img src={inventoryPhoto} alt="Persona controlando inventario desde una tablet en un comercio"/><div className={styles.photoTag}><b>Control desde el salón</b><span>Stock, precios y productos sin volver a la caja.</span></div></div>
      <div className={styles.mobileCopy}><span>VERSIÓN MÓVIL</span><h2>Tu stock también se controla con el celular.</h2><p>El scanner móvil permite leer códigos con la cámara para identificar productos y actuar en el momento.</p><div className={styles.mobileBullets}><div><b>Cargar stock</b><span>Sumá unidades mientras recibís mercadería.</span></div><div><b>Editar productos</b><span>Actualizá nombre, precio y datos desde el teléfono.</span></div><div><b>Consultar en segundos</b><span>Escaneá un artículo y encontrá su ficha inmediatamente.</span></div></div></div>
      <MobileMock/>
    </section>

    <section className={styles.aiSection} id="ia">
      <div className={styles.aiOrb}/><div className={styles.aiGrid}><div><span>INTELIGENCIA ARTIFICIAL INCLUIDA</span><h2>Preguntale a tu negocio y obtené una respuesta útil.</h2><p>El asistente puede interpretar información del comercio para ayudarte a entender ventas, productos, stock y tendencias. También funciona como guía para aprender a usar Comercio Lleno.</p><div className={styles.promptGrid}><div>“¿Qué días vendo más?”</div><div>“¿Qué producto tiene buen margen?”</div><div>“¿Qué stock debería reponer?”</div><div>“¿Conviene hacer una promoción?”</div></div></div><div className={styles.aiPanel}><div className={styles.aiPanelTop}><BrandLogo size={30} markOnly/><div><b>Asistente IA</b><span>Información de tu comercio</span></div></div><div className={styles.userBubble}>¿Qué debería reponer primero?</div><div className={styles.aiBubble}><b>Detecté 12 prioridades.</b><p>Las ordené combinando ventas recientes, stock actual y productos que están cerca del mínimo.</p><div className={styles.orderRows}>{['Detergente 750 ml','Alcohol 500 ml','Limpiador 5 L','Shampoo 400 ml'].map((x,i)=><span key={x}><i>{i+1}</i>{x}</span>)}</div></div></div></div>
    </section>

    <section className={styles.opsSection}>
      <div className={styles.opsPhoto}><img src={heroPhoto} alt="Persona utilizando un sistema de punto de venta moderno en un comercio"/><div className={styles.glassNote}><strong>Un POS moderno no debería frenarte.</strong><span>Trabajá desde la caja, una notebook o el celular.</span></div></div>
      <div><div className={styles.sectionHeadingLeft}><span>TODO EN EL MISMO FLUJO</span><h2>Hardware conocido. Software mucho más flexible.</h2></div><div className={styles.opsList}>{operations.map(([title,text])=><article key={title}><div><Check/></div><span><b>{title}</b><small>{text}</small></span></article>)}</div></div>
    </section>

    <section className={styles.whatsappSection} id="whatsapp">
      <div className={styles.whatsappGlow}/><div className={styles.whatsappCopy}><div className={styles.waTitle}><div className={styles.waLogo}><WhatsAppMark/></div><span>MÓDULO ADICIONAL</span></div><h2>WhatsApp + IA para convertir conversaciones en ventas.</h2><p>Sumá un módulo opcional para conectar el WhatsApp del comercio y automatizar parte de la atención comercial. Se contrata por separado del plan base.</p><div className={styles.waFeatures}><span><Check/>Responder consultas frecuentes</span><span><Check/>Tomar pedidos y guiar compras</span><span><Check/>Recuperar clientes con campañas</span><span><Check/>Derivar a una persona cuando haga falta</span></div><div className={styles.extraPill}>Costo adicional · configuración según uso y volumen</div></div><div className={styles.waChat}><div className={styles.waChatHead}><WhatsAppMark/><div><b>Comercio Lleno + WhatsApp</b><span>Atención asistida por IA</span></div></div><div className={styles.waCustomer}>Hola, ¿tenés detergente de 750 ml?</div><div className={styles.waAi}>Sí. Hay stock disponible. También puedo prepararte el pedido y dejarlo listo para retirar.</div><div className={styles.waCustomer}>Dale, quiero 3.</div><div className={styles.waAi}>Perfecto. Armé el pedido por 3 unidades y lo dejé pendiente de confirmación en Comercio Lleno.</div><div className={styles.waCampaign}>CAMPAÑAS <b>Clientes sin comprar hace 30 días</b><span>Segmento listo para una acción de recuperación.</span></div></div>
    </section>

    <section className={styles.securitySection} id="seguridad"><div className={styles.securityIntro}><span>CONFIANZA DESDE EL PRIMER ACCESO</span><h2>La información de tu negocio merece una plataforma seria.</h2><p>Seguridad, permisos y aislamiento de datos están integrados al funcionamiento del sistema, no agregados como una pantalla decorativa.</p></div><div className={styles.securityCards}>{security.map(([title,text])=><article key={title}><div><Shield/></div><h3>{title}</h3><p>{text}</p></article>)}</div><div className={styles.supportBanner}><div><b>Asistencia humana disponible</b><span>Si ARCA, impresoras o una configuración técnica se complican, podés pedir ayuda desde el sistema.</span></div><Link href="/prueba-gratis">Empezar con asistencia <Arrow/></Link></div></section>

    <section className={styles.priceSection}><div className={styles.priceCopy}><span>EMPEZÁ HOY</span><h2>Probalo con tu negocio real antes de decidir.</h2><p>Cargá productos, hacé ventas, conocé los reportes y probá el flujo completo. No necesitás comprar hardware nuevo para empezar.</p><div className={styles.priceTrust}><span><Check/>14 días sin cargo</span><span><Check/>Después $14.900 por mes</span><span><Check/>Podés asociar la tarjeta durante la prueba</span></div></div><div className={styles.priceCard}><small>COMERCIO LLENO</small><div className={styles.priceBig}>$14.900 <span>/ mes</span></div><p>después de los primeros 14 días gratis</p><ul><li>POS y caja diaria</li><li>Productos, stock y clientes</li><li>ARCA y tickets térmicos</li><li>Modo offline y versión móvil</li><li>Asistente IA y Pedido IA+</li><li>Soporte humano</li></ul><Link href="/prueba-gratis" className={styles.priceButton}>Crear mi comercio <Arrow/></Link><em>El módulo WhatsApp + IA se contrata aparte.</em></div></section>

    <section className={styles.finalCta}><div><span>NO LO MIRES DESDE AFUERA</span><h2>Registrate y usá Comercio Lleno hoy mismo.</h2><p>La mejor forma de saber si encaja en tu comercio es probarlo con tus propios productos y tu propia operación.</p></div><Link href="/prueba-gratis">Empezar mis 14 días gratis <Arrow/></Link></section>

    <footer className={styles.footer}><BrandLogo size={34}/><div><a href="#producto">Producto</a><a href="#seguridad">Seguridad</a><Link href="/terminos">Términos</Link><Link href="/privacidad">Privacidad</Link></div><small>Comercio Lleno · Sistema POS online para comercios</small></footer>
  </main>
}
