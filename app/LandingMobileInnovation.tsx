import Link from 'next/link'
import styles from './LandingMobileInnovation.module.css'

const mobilePhoto='https://images.pexels.com/photos/4921262/pexels-photo-4921262.jpeg?auto=compress&cs=tinysrgb&w=1800'

function PhonePreview(){
  return <div className={styles.phone} aria-label="Vista previa de Comercio Lleno móvil">
    <div className={styles.phoneHeader}><span className={styles.logo}>CL</span><div><b>Comercio Lleno</b><small>Tu comercio</small></div><i/></div>
    <div className={styles.phoneBody}>
      <span className={styles.phoneLabel}>HOY</span>
      <strong className={styles.total}>$ 428.650</strong>
      <small className={styles.sales}>36 ventas registradas</small>
      <div className={styles.newSale}><b>Nueva venta</b><span>+</span></div>
      <div className={styles.phoneRows}><div><span>Productos</span><b>811</b></div><div><span>Caja</span><b>Abierta</b></div><div><span>Facturación</span><b>ARCA</b></div></div>
    </div>
    <div className={styles.phoneNav}><b>Inicio</b><span>Venta</span><span>Productos</span><span>Movimientos</span></div>
  </div>
}

export default function LandingMobileInnovation(){
  return <section className={styles.section} id="movil" aria-labelledby="mobile-title">
    <div className={styles.visual}>
      <img src={mobilePhoto} alt="Comerciante realizando un cobro con un dispositivo móvil"/>
      <PhonePreview/>
    </div>
    <div className={styles.copy}>
      <p>COMERCIO LLENO MÓVIL</p>
      <h2 id="mobile-title">La caja también<br/>cabe en tu bolsillo.</h2>
      <p className={styles.lead}>No hicimos una versión “chiquita” de la web. La experiencia móvil se concentra en lo que tiene sentido hacer caminando el local.</p>
      <div className={styles.lines}>
        <div><span>01</span><b>Escaneá códigos con la cámara</b></div>
        <div><span>02</span><b>Consultá y corregí stock</b></div>
        <div><span>03</span><b>Vendé y facturá con ARCA</b></div>
      </div>
      <Link href="/movil" className={styles.link}>Conocer la experiencia móvil <span>→</span></Link>
    </div>
  </section>
}
