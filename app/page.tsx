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

const security = [
  ['HTTPS activo','Conexión cifrada y dominio protegido con certificado SSL/TLS.'],
  ['Datos aislados','Cada comercio trabaja con su propio espacio y company_id.'],
  ['Acceso autenticado','Usuarios y permisos controlan quién puede entrar y qué puede ver.'],
] as const

export const metadata = {
  title: 'Comercio Lleno · Punto de venta para comercios',
  description: 'Vendé, facturá con ARCA, controlá stock y caja, imprimí tickets y entendé tu negocio con inteligencia artificial.',
}

function Shield() {
  return <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 20 6v5c0 5.2-3.2 8.4-8 10-4.8-1.6-8-4.8-8-10V6l8-3Z"/><path d="m8.5 12 2.1 2.1 4.9-5"/></svg>
}

export default function LandingPage() {
  return <main className={styles.page}>
    <div className={styles.topShell}>
      <nav className={styles.nav}>
        <Link className={styles.brand} href="/" aria-label="Comercio Lleno"><BrandLogo size={38} inverse/></Link>
        <div className={styles.navActions}>
          <Link className={styles.login} href="/redesign/access">Ingresar</Link>
          <Link className={styles.trial} href="/prueba-gratis">Probar gratis</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><i/> 14 DÍAS GRATIS · SIN INSTALACIÓN</div>
          <h1>Tu comercio, <span>más simple y bajo control.</span></h1>
          <p className={styles.lead}>Ventas, stock, caja, clientes y reportes en un solo lugar. Sumale facturación ARCA, lector de códigos, impresora térmica, modo offline e inteligencia artificial.</p>
          <div className={styles.heroCtas}>
            <Link className={styles.primaryCta} href="/prueba-gratis">Empezar prueba gratis</Link>
            <Link className={styles.secondaryCta} href="/redesign/access">Ya tengo una cuenta</Link>
          </div>
          <div className={styles.micro}><span>Punto de venta</span><span>Control de stock</span><span>Caja diaria</span><span>Reportes</span><span>IA</span></div>
        </div>

        <aside className={styles.heroPriceCard}>
          <span className={styles.cardTop}>TODO LO QUE NECESITÁS</span>
          <div className={styles.heroPrice}>$14.900 <small>/ mes</small></div>
          <p>Probalo gratis durante 14 días. Después continuás con un precio simple y previsible.</p>
          <ul>
            <li>Ventas y medios de pago</li>
            <li>Productos, stock y clientes</li>
            <li>Cierres y reportes</li>
            <li>Facturación ARCA integrada</li>
            <li>Modo offline y asistente IA</li>
          </ul>
          <Link className={styles.cardButton} href="/prueba-gratis">Crear mi cuenta gratis</Link>
          <small className={styles.cardNote}>Primeros 14 días sin cargo.</small>
        </aside>
      </section>

      <div className={styles.securityStrip}>
        <div className={styles.securityTitle}><Shield/><div><b>Sistema protegido</b><span>Seguridad visible desde el primer acceso</span></div></div>
        {security.map(([title,text])=><div className={styles.securitySeal} key={title}><div className={styles.sealIcon}><Shield/></div><div><b>{title}</b><span>{text}</span></div></div>)}
      </div>
    </div>

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

    <section className={`${styles.section} ${styles.systemSection}`}>
      <div className={styles.showcase}>
        <div className={styles.showcaseCopy}><div className={styles.darkEyebrow}><i/> PUNTO DE VENTA</div><h2>Cobrar tiene que ser rápido.</h2><p>Buscá o escaneá el producto, asociá un cliente, aplicá un descuento, elegí el medio de pago y terminá la venta. Si te pagan en efectivo, el sistema calcula el vuelto.</p><div className={styles.checkList}><div className={styles.check}><i>✓</i><span>Estado de caja y ARCA visible antes de cobrar.</span></div><div className={styles.check}><i>✓</i><span>Ventas pendientes si ARCA o Internet no responden.</span></div><div className={styles.check}><i>✓</i><span>Historial, reimpresión y detalle de cada operación.</span></div></div></div>
        <div className={styles.showcaseVisual}>
          <div className={styles.browserTop}><span/><span/><span/></div>
          <div className={styles.screen}>
            <div className={styles.mockSide}><BrandLogo size={29} markOnly/><div className={styles.mockNavGreen}/>{[1,2,3,4,5].map(n=><div className={styles.mockNav} key={n}/>)}</div>
            <div className={styles.mockMain}><div className={styles.mockHead}/><div className={styles.mockSub}/><div className={styles.mockCards}><div/><div/><div/></div><div className={styles.mockPanel}>{[1,2,3,4].map(n=><div key={n}/>)}</div></div>
          </div>
          <div className={styles.floating}>ARCA conectado<b>✓ Listo para vender</b></div>
        </div>
      </div>
    </section>

    <section className={styles.ai}>
      <div className={styles.aiInner}>
        <div><div className={styles.darkEyebrow}><i/> INTELIGENCIA ARTIFICIAL</div><h2>Un asistente que conoce tu comercio.</h2><p>No es solamente ayuda técnica. Puede responder preguntas sobre las ventas y también explicarte cómo usar el sistema, respetando siempre los datos y permisos de tu comercio.</p></div>
        <div className={styles.chat}><div className={`${styles.chatMsg} ${styles.chatUser}`}>¿Cuál fue el producto más vendido esta semana?</div><div className={`${styles.chatMsg} ${styles.chatAi}`}><b>Detergente 750 ml</b> fue el producto con más unidades vendidas. También tenés 4 productos cerca del stock mínimo.</div><div className={`${styles.chatMsg} ${styles.chatUser}`}>¿Cómo modifico el precio de un producto?</div><div className={`${styles.chatMsg} ${styles.chatAi}`}>Entrá en <b>Productos</b>, buscá el artículo y tocá <b>Editar</b>. Desde ahí podés cambiar precio, costo, stock mínimo y proveedor.</div></div>
      </div>
    </section>

    <section className={styles.securitySection}>
      <div className={styles.securitySectionInner}>
        <div className={styles.securityCopy}><span>SEGURIDAD</span><h2>Tu negocio no debería depender de una contraseña compartida.</h2><p>El acceso se autentica por usuario y los datos se separan por comercio. La conexión pública funciona sobre HTTPS y el sistema aplica controles para reducir accesos, embebidos y permisos del navegador innecesarios.</p></div>
        <div className={styles.securityGrid}>{security.map(([title,text])=><article key={title}><div><Shield/></div><h3>{title}</h3><p>{text}</p></article>)}</div>
      </div>
    </section>

    <section className={styles.priceSection}>
      <div className={styles.priceWrap}>
        <div className={styles.priceCopy}><div className={styles.darkEyebrow}><i/> PRECIO SIMPLE</div><h2>Probalo antes de decidir.</h2><p>La prueba arranca cuando creás tu comercio. Durante 14 días podés conocer el sistema y cargar tus productos. Después, el plan cuesta $14.900 por mes.</p><p className={styles.fineprint}>El cobro recurrente requiere asociar un medio de pago. Antes del primer cobro se solicitará la autorización correspondiente.</p></div>
        <div className={styles.priceCard}><span className={styles.tag}>14 DÍAS GRATIS</span><div className={styles.price}>$14.900 <small>/ mes</small></div><ul><li>Punto de venta</li><li>Productos, stock y caja diaria</li><li>Reportes y rentabilidad</li><li>Asistente IA</li><li>Modo offline</li><li>ARCA e impresión térmica configurables</li></ul><Link className={styles.priceButton} href="/prueba-gratis">Iniciar prueba gratis</Link><div className={styles.priceNote}>No se cobra durante los primeros 14 días.</div></div>
      </div>
    </section>

    <section className={styles.finalCta}><div className={styles.finalBox}><div><h2>¿Querés verlo funcionando en tu comercio?</h2><p>Creá tu cuenta y empezá hoy mismo con 14 días de prueba.</p></div><Link className={styles.primaryCta} href="/prueba-gratis">Probar Comercio Lleno →</Link></div></section>

    <footer className={styles.footer}><BrandLogo size={32}/><div>POS · Gestión · ARCA · IA · Offline · HTTPS</div></footer>
  </main>
}
