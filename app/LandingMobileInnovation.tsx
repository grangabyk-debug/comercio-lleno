import styles from './LandingMobileInnovation.module.css'

const mobilePhoto='https://images.pexels.com/photos/28153646/pexels-photo-28153646.jpeg?auto=compress&cs=tinysrgb&w=1900'

function PhonePreview(){
  return <div className={styles.phone} aria-label="Vista previa de Comercio Lleno móvil">
    <div className={styles.phoneTop}><span>CL</span><div><b>Comercio Lleno</b><small>Hoy en tu negocio</small></div><i>•••</i></div>
    <div className={styles.phoneBody}>
      <small>VENTAS HOY</small><strong>$ 428.650</strong><em>36 operaciones</em>
      <button type="button">+ Nueva venta</button>
      <div className={styles.miniGrid}><span><b>811</b><small>Productos</small></span><span><b>ARCA</b><small>Conectado</small></span></div>
    </div>
    <div className={styles.phoneNav}><b>Inicio</b><span>Venta</span><span>Productos</span><span>Más</span></div>
  </div>
}

export default function LandingMobileInnovation(){
  return <section className={styles.section} id="movil" aria-labelledby="mobile-title">
    <div className={styles.poster}>
      <div className={styles.posterWord} aria-hidden="true">MÓVIL</div>
      <img src={mobilePhoto} alt="Comerciante trabajando detrás del mostrador"/>
      <PhonePreview/>
      <span className={styles.posterTag}>ANDROID · CÁMARA · ARCA</span>
    </div>
    <div className={styles.copy}>
      <p>TODO TU COMERCIO EN EL CELULAR</p>
      <h2 id="mobile-title">Manejá el negocio<br/><em>desde donde estés.</em></h2>
      <p className={styles.lead}>Comercio Lleno no es una versión de PC achicada. La experiencia móvil está pensada para que puedas vender, controlar y seguir tu comercio de manera simple desde el celular.</p>
      <div className={styles.lines}>
        <div><span>01</span><b>Vendé y cobrá</b><small>Nueva venta, medios de pago y facturación desde la pantalla del teléfono.</small></div>
        <div><span>02</span><b>Controlá productos y stock</b><small>Buscá, escaneá con la cámara y revisá existencias mientras te movés por el local.</small></div>
        <div><span>03</span><b>Seguí caja y negocio</b><small>Consultá caja, actividad e información importante sin depender de una computadora.</small></div>
      </div>
    </div>
  </section>
}
