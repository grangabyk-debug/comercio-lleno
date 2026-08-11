import Link from 'next/link'
import styles from './landing.module.css'
import UiIcon from './redesign/UiIcon'
import BrandLogo from './BrandLogo'

const features = [
  ['sale','Facturación ARCA integrada','Vendé y emití el comprobante desde el mismo flujo. La activación fiscal requiere la configuración del CUIT y certificados del comercio.'],
  ['cash','Modo offline','Si se cae Internet, el POS sigue cobrando con la copia local y sincroniza las ventas cuando vuelve la conexión.'],
  ['printer','Ticket térmico','Preparado para impresoras térmicas de 58/80 mm y para automatizar la impresión desde la caja.'],
  ['products','Lector de códigos','Usá un scanner USB como en un sistema de escritorio: escaneás, agregás y cobrás.'],
  ['sparkles','Asistente con IA','Preguntale en lenguaje natural qué pasó en tu negocio, qué se vendió más, cómo está el stock o cómo usar una función del sistema.'],
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

const goldSealStyle = {
  border: '1px solid rgba(220,181,73,.62)',
  background: 'linear-gradient(145deg,rgba(91,68,18,.58),rgba(33,30,21,.78))',
  boxShadow: 'inset 0 1px 0 rgba(255,239,184,.18),0 12px 26px rgba(0,0,0,.16)',
} as const

const goldIconStyle = {
  background: 'radial-gradient(circle at 34% 28%,#fff0ad 0%,#d7ad42 46%,#8a6419 100%)',
  color: '#382608',
  border: '1px solid rgba(255,232,150,.65)',
  boxShadow: 'inset 0 1px 2px rgba(255,255,255,.55),0 3px 10px rgba(0,0,0,.22)',
} as const

export default function LandingPage() {
  return <main className={styles.page}>
    <div className={styles.topShell}>
      <nav className={styles.nav}>
        <Link className={styles.brand} href="/" aria-label="Comercio Lleno"><BrandLogo size={38} inverse/></Link>
        <div className={styles.navActions}>
          <Link className={styles.login} href="/redesign/access">Ingresar</Link>
          <Link className={styles.trial} href="/prueba-gratis">Probar gratis 14 días</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow} style={{padding:'10px 15px',background:'linear-gradient(135deg,rgba(31,181,97,.24),rgba(31,181,97,.09))',border:'1px solid rgba(95,230,151,.48)',boxShadow:'0 0 28px rgba(35,190,104,.12)'}}>
            <span style={{fontSize:18,fontWeight:950,letterSpacing:'-.02em',color:'#fff'}}>14 DÍAS GRATIS</span>
            <span style={{fontSize:10,fontWeight:900,color:'#80e8ae'}}>· SIN INSTALACIÓN</span>
          </div>
          <h1>Tu comercio, <span>más simple y bajo control.</span></h1>
          <p className={styles.lead}>Ventas, stock, caja, clientes y reportes en un solo lugar. Sumale facturación ARCA, lector de códigos, impresora térmica, modo offline y un asistente de inteligencia artificial que entiende tu negocio.</p>
          <div className={styles.heroCtas}>
            <Link className={styles.primaryCta} href="/prueba-gratis">Empezar mis 14 días gratis</Link>
            <Link className={styles.secondaryCta} href="/redesign/access">Ya tengo una cuenta</Link>
          </div>
          <div className={styles.micro}><span>Punto de venta</span><span>Control de stock</span><span>Caja diaria</span><span>Reportes</span><span style={{color:'#cfc8ff',fontWeight:900}}>✦ Asistente IA incluido</span></div>
        </div>

        <aside className={styles.heroPriceCard}>
          <span className={styles.cardTop} style={{color:'#159b58',fontSize:12}}>EMPEZÁ SIN PAGAR</span>
          <div style={{fontSize:23,fontWeight:950,color:'#159b58',letterSpacing:'-.7px',margin:'3px 0 2px'}}>14 DÍAS GRATIS</div>
          <div className={styles.heroPrice}>$14.900 <small>/ mes después</small></div>
          <p>Probalo completo durante 14 días. Conocé el sistema, cargá tus productos y decidí con el comercio ya funcionando.</p>
          <ul>
            <li>Ventas y medios de pago</li>
            <li>Productos, stock y clientes</li>
            <li>Cierres y reportes</li>
            <li>Facturación ARCA integrada</li>
            <li><b style={{color:'#5a4de0'}}>Asistente de inteligencia artificial</b></li>
            <li>Modo offline</li>
          </ul>
          <Link className={styles.cardButton} href="/prueba-gratis">Crear mi cuenta y probar gratis</Link>
          <small className={styles.cardNote}>Primeros 14 días sin cargo.</small>
        </aside>
      </section>

      <div className={styles.securityStrip}>
        <div className={styles.securityTitle} style={{borderColor:'rgba(220,181,73,.28)'}}><Shield/><div><b style={{color:'#f0ce72'}}>Sistema protegido</b><span>Seguridad visible desde el primer acceso</span></div></div>
        {security.map(([title,text])=><div className={styles.securitySeal} style={goldSealStyle} key={title}><div className={styles.sealIcon} style={goldIconStyle}><Shield/></div><div><b style={{color:'#f4d77f',letterSpacing:'.02em'}}>{title}</b><span style={{color:'#cbbd92'}}>{text}</span></div></div>)}
      </div>
    </div>

    <section className={styles.trust}>
      <div className={styles.trustInner}>
        <div className={styles.trustItem}><b>ARCA</b>facturación integrada</div>
        <div className={styles.trustItem}><b>Offline</b>seguí vendiendo</div>
        <div className={styles.trustItem}><b>58 / 80 mm</b>impresora térmica</div>
        <div className={styles.trustItem}><b>USB</b>lector de códigos</div>
        <div className={styles.trustItem} style={{background:'linear-gradient(135deg,#f2f0ff,#faf9ff)',border:'1px solid #dad5ff',borderRadius:10,padding:'7px'}}><b style={{color:'#5a4de0'}}>✦ IA incluida</b>asistente del negocio</div>
      </div>
    </section>

    <section className={styles.section}>
      <div className={styles.sectionHead}><span>HECHO PARA EL MOSTRADOR</span><h2>Menos vueltas. Más control.</h2><p>Comercio Lleno combina las herramientas que realmente usa un comercio todos los días y las ordena en una interfaz simple.</p></div>
      <div className={styles.features}>
        {features.map(([icon,title,text])=><article className={styles.feature} key={title} style={title==='Asistente con IA'?{border:'1px solid #b8afff',background:'linear-gradient(145deg,#fff,#f5f3ff)',boxShadow:'0 16px 36px rgba(91,77,224,.12)'}:undefined}><div className={styles.featureIcon} style={title==='Asistente con IA'?{background:'#ebe8ff',color:'#5a4de0'}:undefined}><UiIcon name={icon} size={22}/></div><h3 style={title==='Asistente con IA'?{color:'#493dc2'}:undefined}>{title}</h3><p>{text}</p></article>)}
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

    <section className={styles.ai} style={{background:'radial-gradient(circle at 78% 35%,rgba(100,82,255,.22),transparent 30%),linear-gradient(135deg,#0b2232 0%,#111d39 55%,#17183a 100%)',borderTop:'1px solid rgba(149,136,255,.2)',borderBottom:'1px solid rgba(149,136,255,.16)'}}>
      <div className={styles.aiInner}>
        <div>
          <div className={styles.darkEyebrow} style={{color:'#d7d1ff',borderColor:'rgba(168,156,255,.38)',background:'rgba(105,88,255,.13)',fontSize:11}}><UiIcon name="sparkles" size={17}/> ASISTENTE IA INCLUIDO</div>
          <h2 style={{fontSize:46,maxWidth:520}}>Preguntale a tu negocio.</h2>
          <p style={{fontSize:15,maxWidth:560}}>Comercio Lleno incorpora un asistente de inteligencia artificial que puede analizar la información de tu comercio y también enseñarte a usar el sistema. Preguntale cuánto vendiste, qué producto salió más, qué stock está bajo o cómo realizar una tarea.</p>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:20}}>
            {['Ventas y tendencias','Stock y productos','Ayuda para usar el sistema'].map(x=><span key={x} style={{border:'1px solid rgba(185,176,255,.26)',background:'rgba(126,109,255,.09)',color:'#d8d3ff',padding:'7px 10px',borderRadius:999,fontSize:10,fontWeight:800}}>{x}</span>)}
          </div>
        </div>
        <div className={styles.chat} style={{border:'1px solid rgba(158,145,255,.45)',boxShadow:'0 24px 60px rgba(5,8,35,.34)'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'3px 5px 10px',color:'#5a4de0',fontSize:10,fontWeight:950,letterSpacing:'.08em'}}><UiIcon name="sparkles" size={15}/> COMERCIO LLENO IA</div>
          <div className={`${styles.chatMsg} ${styles.chatUser}`}>¿Cuál fue el producto más vendido esta semana?</div><div className={`${styles.chatMsg} ${styles.chatAi}`}><b>Detergente 750 ml</b> fue el producto con más unidades vendidas. También tenés 4 productos cerca del stock mínimo.</div><div className={`${styles.chatMsg} ${styles.chatUser}`}>¿Cómo modifico el precio de un producto?</div><div className={`${styles.chatMsg} ${styles.chatAi}`}>Entrá en <b>Productos</b>, buscá el artículo y tocá <b>Editar</b>. Desde ahí podés cambiar precio, costo, stock mínimo y proveedor.</div>
        </div>
      </div>
    </section>

    <section className={styles.securitySection} style={{background:'linear-gradient(180deg,#fffdf7,#fff)'}}>
      <div className={styles.securitySectionInner}>
        <div className={styles.securityCopy}><span style={{color:'#a47b18'}}>SEGURIDAD</span><h2>Tu negocio no debería depender de una contraseña compartida.</h2><p>El acceso se autentica por usuario y los datos se separan por comercio. La conexión pública funciona sobre HTTPS y el sistema aplica controles para reducir accesos, embebidos y permisos del navegador innecesarios.</p></div>
        <div className={styles.securityGrid}>{security.map(([title,text])=><article key={title} style={{borderColor:'#dfc36e',background:'linear-gradient(145deg,#fffef9,#f9f2dc)',boxShadow:'inset 0 1px 0 #fff'}}><div style={{background:'radial-gradient(circle at 35% 25%,#fff2b8,#dab143 48%,#8e681c)',color:'#3b2908',border:'1px solid #d2ad4a'}}><Shield/></div><h3 style={{color:'#725213'}}>{title}</h3><p>{text}</p></article>)}</div>
      </div>
    </section>

    <section className={styles.priceSection}>
      <div className={styles.priceWrap}>
        <div className={styles.priceCopy}><div className={styles.darkEyebrow}><i/> PRECIO SIMPLE</div><h2>Probalo antes de decidir.</h2><p>La prueba arranca cuando creás tu comercio. Durante 14 días podés conocer el sistema y cargar tus productos. Después, el plan cuesta $14.900 por mes.</p><p className={styles.fineprint}>El cobro recurrente requiere asociar un medio de pago. Antes del primer cobro se solicitará la autorización correspondiente.</p></div>
        <div className={styles.priceCard}><span className={styles.tag} style={{fontSize:12,padding:'8px 12px'}}>14 DÍAS GRATIS</span><div className={styles.price}>$14.900 <small>/ mes</small></div><ul><li>Punto de venta</li><li>Productos, stock y caja diaria</li><li>Reportes y rentabilidad</li><li><b style={{color:'#5a4de0'}}>Asistente IA incluido</b></li><li>Modo offline</li><li>ARCA e impresión térmica configurables</li></ul><Link className={styles.priceButton} href="/prueba-gratis">Iniciar mis 14 días gratis</Link><div className={styles.priceNote}>No se cobra durante los primeros 14 días.</div></div>
      </div>
    </section>

    <section className={styles.finalCta}><div className={styles.finalBox}><div><h2>¿Querés verlo funcionando en tu comercio?</h2><p>Creá tu cuenta y empezá hoy mismo con 14 días de prueba.</p></div><Link className={styles.primaryCta} href="/prueba-gratis">Probar Comercio Lleno gratis →</Link></div></section>

    <footer className={styles.footer}><BrandLogo size={32}/><div>POS · Gestión · ARCA · IA · Offline · HTTPS</div></footer>
  </main>
}
