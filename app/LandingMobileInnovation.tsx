import Link from 'next/link'
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
      <p>COMERCIO LLENO EN EL CELULAR</p>
      <h2 id="mobile-title">La caja se mueve<br/><em>con vos.</em></h2>
      <p className={styles.lead}>No achicamos la versión de PC. Pensamos un recorrido distinto para una mano, un mostrador y un negocio en movimiento.</p>
      <div className={styles.lines}>
        <div><span>01</span><b>Escaneá con la cámara</b><small>Leé códigos sin hardware extra.</small></div>
        <div><span>02</span><b>Stock mientras caminás</b><small>Consultá y corregí donde está la mercadería.</small></div>
        <div><span>03</span><b>Vendé y facturá</b><small>La operación sigue conectada con ARCA.</small></div>
      </div>
      <Link href="/movil" className={styles.link}>Ver la experiencia móvil <span>→</span></Link>
    </div>
  </section>
}
