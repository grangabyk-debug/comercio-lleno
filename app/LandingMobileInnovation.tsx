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
      <div className={styles.posterCopy}>
        <span>VERSIÓN MÓVIL</span>
        <strong>Punto de venta<br/>en tu bolsillo.</strong>
        <small>La misma operación del comercio, pensada para usarla con una mano.</small>
      </div>
      <PhonePreview/>
      <span className={styles.posterTag}>ANDROID · ESCÁNER · VENTAS · STOCK · ARCA</span>
    </div>
    <div className={styles.copy}>
      <p>PUNTO DE VENTA MÓVIL</p>
      <h2 id="mobile-title">Todo tu negocio<br/><em>en el celu.</em></h2>
      <p className={styles.lead}>Vendé, facturá, mirá el stock y seguí cómo viene el día desde el teléfono. No es una captura decorativa: es una experiencia pensada para operar Comercio Lleno desde el celular.</p>
      <div className={styles.lines}>
        <div><span>01</span><b>Vendé desde el mostrador</b><small>Armá una venta, elegí el medio de pago y facturá sin depender de una computadora.</small></div>
        <div><span>02</span><b>Usá la cámara como escáner</b><small>Buscá productos y leé códigos de barras directamente desde el celular.</small></div>
        <div><span>03</span><b>Todo queda sincronizado</b><small>Ventas, productos, caja, movimientos y stock actualizados en el mismo sistema.</small></div>
      </div>
      <div className={styles.mobileCta}>
        <Link href="/prueba-gratis">Probar 3 meses gratis <span>→</span></Link>
        <small>90 días · $0 · sin tarjeta</small>
      </div>
    </div>
  </section>
}
