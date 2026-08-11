import Link from 'next/link'
import styles from './landing.module.css'
import UiIcon from './redesign/UiIcon'
import BrandLogo from './BrandLogo'

const features = [
  ['sale','Facturación ARCA integrada','Vendé y emití el comprobante desde el mismo flujo. La activación fiscal requiere la configuración del CUIT y certificados del comercio.'],
  ['cash','Modo offline','Si se cae Internet, el POS sigue cobrando con la copia local y sincroniza las ventas cuando vuelve la conexión.'],
  ['printer','Ticket térmico','Preparado para impresoras térmicas de 58/80 mm y para automatizar la impresión desde la caja.'],
  ['products','Lector de códigos','Usá un scanner USB como en un sistema de escritorio: escaneás, agregás y cobrás.'],
  ['sparkles','Asistente con IA','Preguntale qué vendiste, qué producto salió más o cómo realizar una tarea dentro del sistema.'],
  ['reports','Reportes claros','Ventas, ticket promedio, comparativas, rentabilidad, medios de pago y productos más vendidos.'],
] as const

export const metadata = {
  title: 'Comercio Lleno · Punto de venta para comercios',
  description: 'Vendé, facturá con ARCA, controlá stock y caja, imprimí tickets y entendé tu negocio con inteligencia artificial.',
}

export default function LandingPage() {
  return <main className={styles.page}>
    <nav className={styles.nav}>
      <Link className={styles.brand} href="/" aria-label="Comercio Lleno"><BrandLogo size={48}/></Link>
      <div className={styles.navActions}>
        <Link className={styles.login} href="/redesign/access">Ingresar</Link>
        <Link className={styles.trial} href="/prueba-gratis">Probar gratis 14 días</Link>
      </div>
    </nav>

    <section className={styles.hero}>
      <div>
        <div className={styles.eyebrow}><i/> POS + gestión + IA para comercios</div>
        <h1>Tu comercio, <span>todo en un solo lugar.</span></h1>
        <p className={styles.lead}>Vendé, controlá caja y stock, trabajá con lector de códigos, imprimí tickets y gestioná la facturación electrónica sin saltar entre cinco sistemas distintos.</p>
        <div className={styles.heroCtas}>
          <Link className={styles.primaryCta} href="/prueba-gratis">Empezar prueba gratis <span>→</span></Link>
          <Link className={styles.secondaryCta} href="/redesign/access">Ya tengo una cuenta</Link>
        </div>
        <div className={styles.micro}><span>14 días gratis</span><span>Sin costo de instalación</span><span>Luego $14.900/mes</span></div>
      </div>

      <div className={styles.visual} aria-label="Vista del sistema Comercio Lleno">
        <div className={styles.glow}/>
        <div className={styles.browser}>
          <div className={styles.browserTop}><span className={styles.dot}/><span className={styles.dot}/><span className={styles.dot}/></div>
          <div className={styles.screen}>
            <div className={styles.mockSide}>
              <div className={styles.mockLogo}><BrandLogo size={30} markOnly/></div>
              <div className={styles.mockNav}/><div className={styles.mockNavGreen}/><div className={styles.mockNav}/><div className={styles.mockNav}/><div className={styles.mockNav}/><div className={styles.mockNav}/>
            </div>
            <div className={styles.mockMain}>
              <div className={styles.mockHead}/><div className={styles.mockSub}/>
              <div className={styles.mockCards}><div className={styles.mockCard}/><div className={styles.mockCard}/><div className={styles.mockCard}/></div>
              <div className={styles.mockPanel}><div className={styles.mockBar}/><div className={styles.mockRows}><div className={styles.mockRow}/><div className={styles.mockRow}/><div className={styles.mockRow}/><div className={styles.mockRow}/></div></div>
            </div>
          </div>
        </div>
        <div className={styles.floating}>ARCA conectado<b>✓ Listo para vender</b></div>
      </div>
    </section>

    <section className={styles.trust}>
      <div className={styles.trustInner}>
        <div className={styles.trustItem}><b>ARCA</b>facturación integrada</div>
        <div className={styles.trustItem}><b>Offline</b>seguí vendiendo</div>
        <div className={styles.trustItem}><b>58 / 80 mm</b>impresora térmica</div>
        <div className={styles.trustItem}><b>USB</b>lector de códigos</div>
        <div className={styles.trustItem}><b>IA</b>asistente del negocio</div>
      </div>
    </section>

    <section className={styles.section}>
      <div className={styles.sectionHead}><span>HECHO PARA EL MOSTRADOR</span><h2>Menos vueltas. Más control.</h2><p>Comercio Lleno combina las herramientas que realmente usa un comercio todos los días y las ordena en una interfaz simple.</p></div>
      <div className={styles.features}>
        {features.map(([icon,title,text])=><article className={styles.feature} key={title}><div className={styles.featureIcon}><UiIcon name={icon} size={22}/></div><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </section>

    <section className={styles.section}>
      <div className={styles.showcase}>
        <div className={styles.showcaseVisual}>
          <div className={styles.showcaseWindow}>
            <div className={styles.showcaseTop}><i/><i/><i/></div>
            <div className={styles.showcaseGrid}><div className={styles.productPane}><div className={styles.searchMock}/>{[1,2,3,4,5].map(n=><div className={styles.productLine} key={n}/>)}</div><div className={styles.cartPane}><div className={styles.cartTitle}/>{[1,2,3].map(n=><div className={styles.cartLine} key={n}/>)}<div className={styles.chargeMock}/></div></div>
          </div>
        </div>
        <div className={styles.showcaseCopy}><div className={styles.eyebrow}><i/> PUNTO DE VENTA</div><h2>Cobrar tiene que ser rápido.</h2><p>Buscá o escaneá el producto, asociá un cliente, aplicá un descuento, elegí el medio de pago y terminá la venta. Si te pagan en efectivo, el sistema calcula el vuelto.</p><div className={styles.checkList}><div className={styles.check}><i>✓</i><span>Estado de caja y ARCA visible antes de cobrar.</span></div><div className={styles.check}><i>✓</i><span>Ventas pendientes si ARCA o Internet no responden.</span></div><div className={styles.check}><i>✓</i><span>Historial, reimpresión y detalle de cada operación.</span></div></div></div>
      </div>
    </section>

    <section className={styles.ai}>
      <div className={styles.aiInner}>
        <div><div className={styles.eyebrow}><i/> INTELIGENCIA ARTIFICIAL</div><h2>Un asistente que conoce tu comercio.</h2><p>No es solamente ayuda técnica. Puede responder preguntas sobre las ventas y también explicarte cómo usar el sistema, respetando siempre los datos y permisos de tu comercio.</p></div>
        <div className={styles.chat}><div className={`${styles.chatMsg} ${styles.chatUser}`}>¿Cuál fue el producto más vendido esta semana?</div><div className={`${styles.chatMsg} ${styles.chatAi}`}><b>Detergente 750 ml</b> fue el producto con más unidades vendidas. También tenés 4 productos cerca del stock mínimo.</div><div className={`${styles.chatMsg} ${styles.chatUser}`}>¿Cómo modifico el precio de un producto?</div><div className={`${styles.chatMsg} ${styles.chatAi}`}>Entrá en <b>Productos</b>, buscá el artículo y tocá <b>Editar</b>. Desde ahí podés cambiar precio, costo, stock mínimo y proveedor.</div></div>
      </div>
    </section>

    <section className={styles.section}>
      <div className={styles.priceWrap}>
        <div className={styles.priceCopy}><div className={styles.eyebrow}><i/> PRECIO SIMPLE</div><h2>Probalo antes de decidir.</h2><p>La prueba arranca cuando creás tu comercio. Durante 14 días podés conocer el sistema y cargar tus productos. Después, el plan cuesta $14.900 por mes.</p><p className={styles.fineprint}>El cobro recurrente requiere asociar un medio de pago. La integración de suscripción se habilita en el alta de pago antes de finalizar el período de prueba.</p></div>
        <div className={styles.priceCard}><span className={styles.tag}>14 DÍAS GRATIS</span><div className={styles.price}>$14.900 <small>/ mes</small></div><ul><li>Punto de venta</li><li>Productos, stock y caja diaria</li><li>Reportes y rentabilidad</li><li>Asistente IA</li><li>Modo offline</li><li>ARCA e impresión térmica configurables</li></ul><Link className={styles.priceButton} href="/prueba-gratis">Iniciar prueba gratis</Link><div className={styles.priceNote}>No se cobra durante los primeros 14 días.</div></div>
      </div>
    </section>

    <section className={styles.finalCta}><div className={styles.finalBox}><div><h2>¿Querés verlo funcionando en tu comercio?</h2><p>Creá tu cuenta y empezá hoy mismo con 14 días de prueba.</p></div><Link className={styles.primaryCta} href="/prueba-gratis">Probar Comercio Lleno →</Link></div></section>

    <footer className={styles.footer}><BrandLogo size={32}/><div>POS · Gestión · ARCA · IA · Offline</div></footer>
  </main>
}
