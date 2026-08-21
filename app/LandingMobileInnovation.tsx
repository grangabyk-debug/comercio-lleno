import Link from 'next/link'
import styles from './LandingMobileInnovation.module.css'
import fresh from './LandingMobileConversion.module.css'

function PhonePreview(){
  return <div className={`${styles.phone} ${fresh.phone}`} aria-label="Vista de la versión móvil de Comercio Lleno">
    <div className={styles.browserBar}><span>comerciolleno.com/movil</span><i>•••</i></div>
    <div className={styles.phoneTop}>
      <b>Comercio<span>Lleno.com</span></b>
      <small>AYUDA</small>
    </div>
    <div className={styles.statusRow}><span><i/>ARCA CONECTADO</span><b>CLARO</b></div>
    <div className={styles.phoneBody}>
      <div className={styles.todayRow}>
        <div><small>HOY</small><strong>$ 428.650</strong><em>36 ventas registradas</em></div>
        <span>CAJA<br/><b>ACTIVA</b></span>
      </div>
      <button type="button" className={styles.newSale}><b>+</b><span><strong>Nueva venta</strong><small>Elegí productos y facturá</small></span><i>›</i></button>
      <div className={styles.quickCards}>
        <div><span>PRODUCTOS</span><b>811</b><small>Ver, crear y editar</small></div>
        <div><span>MOVIMIENTOS</span><b>$ 428.650</b><small>Resumen de hoy</small></div>
      </div>
      <div className={styles.summaryCard}>
        <div><span>RESUMEN DE HOY</span><b>Cómo viene el día</b></div>
        <p><span>Ventas</span><strong>36</strong></p>
        <p><span>Total vendido</span><strong>$ 428.650</strong></p>
        <p><span>Productos</span><strong>811</strong></p>
      </div>
    </div>
    <div className={styles.phoneNav}><b>Inicio</b><span>Venta</span><span>Productos</span><span>Movimientos</span></div>
  </div>
}

export default function LandingMobileInnovation(){
  return <section className={`${styles.section} ${fresh.section}`} id="movil" aria-labelledby="mobile-title">
    <div className={`${styles.poster} ${fresh.poster}`}>
      <div className={styles.posterGlow}/>
      <div className={fresh.auroraOne}/>
      <div className={fresh.auroraTwo}/>
      <div className={`${styles.platformBadge} ${fresh.platformBadge}`}>COMERCIO LLENO · EN TU CELU Y PC</div>
      <div className={`${styles.freeBadge} ${fresh.freeBadge}`}><b>GRATIS</b><span>3 MESES</span></div>
      <div className={`${styles.featureChips} ${fresh.featureChips}`} aria-label="Funciones destacadas">
        <span>Facturación ARCA</span>
        <span>Ventas + caja</span>
        <span>Stock en vivo</span>
        <span>Escáner de códigos</span>
        <span>Mercado Pago</span>
        <span>Asistente IA</span>
      </div>
      <PhonePreview/>
    </div>

    <div className={`${styles.copy} ${fresh.copy}`}>
      <div className={fresh.offerEyebrow}><i/> PLAN IMPULSO · 90 DÍAS $0</div>
      <p className={fresh.desktopKicker}>PUNTO DE VENTA MÓVIL</p>
      <h1 id="mobile-title">Vendé. Facturá.<br/><em>Controlá todo.</em></h1>
      <p className={`${styles.lead} ${fresh.lead}`}>Tu comercio en una sola pantalla. Vendé desde el celular o la compu, controlá stock y caja, y facturá con ARCA sin cambiar de sistema.</p>

      <div className={fresh.proofRow}>
        <span><b>+150</b> usuarios registrados</span>
        <span><b>ARCA</b> integrado</span>
      </div>

      <div className={`${styles.mobileCta} ${fresh.mobileCta}`}>
        <Link href="/prueba-gratis">EMPEZAR 3 MESES GRATIS <span>→</span></Link>
      </div>
      <div className={fresh.noCard}><span>✓</span> Sin tarjeta <i/> <span>✓</span> Todas las funciones incluidas</div>

      <a className={styles.pcJump} href="#pc">VER VERSIÓN PC <span>↓</span></a>
      <div className={`${styles.touchCue} ${fresh.touchCue}`}>
        <span className={styles.touchPhone}><i/></span>
        <div><b>Tu comercio, siempre a mano.</b><small>Vendé y controlá todo desde el celular.</small></div>
      </div>
    </div>
  </section>
}
