import Link from 'next/link'
import styles from './LandingMobileInnovation.module.css'

function PhonePreview(){
  return <div className={styles.phone} aria-label="Vista de la versión móvil de Comercio Lleno">
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
  return <section className={styles.section} id="movil" aria-labelledby="mobile-title">
    <div className={styles.poster}>
      <div className={styles.posterGlow}/>
      <div className={styles.platformBadge}>VERSIÓN MÓVIL · TAMBIÉN EN PC</div>
      <div className={styles.freeBadge}><b>GRATIS</b><span>3 MESES</span></div>
      <div className={styles.featureChips} aria-label="Funciones destacadas">
        <span>Facturador ARCA</span>
        <span>Ventas</span>
        <span>Stock</span>
        <span>Lector código de barras</span>
        <span>Caja automática</span>
        <span>Soporte humano</span>
      </div>
      <PhonePreview/>
    </div>
    <div className={styles.copy}>
      <p>PUNTO DE VENTA MÓVIL</p>
      <h1 id="mobile-title">Todo tu negocio<br/><em>en el celu.</em></h1>
      <p className={styles.lead}>Vendé, facturá, controlá stock y seguí tu comercio desde el celular. También tenés versión PC con los mismos datos sincronizados.</p>
      <div className={styles.mobileCta}>
        <Link href="/prueba-gratis">INICIAR PRUEBA GRATIS <span>→</span></Link>
      </div>
      <a className={styles.pcJump} href="#pc">VER VERSIÓN PC <span>↓</span></a>
      <div className={styles.touchCue}>
        <span className={styles.touchPhone}><i/></span>
        <div><b>Tu comercio, siempre a mano.</b><small>Vendé y controlá todo desde el celular.</small></div>
      </div>
    </div>
  </section>
}
