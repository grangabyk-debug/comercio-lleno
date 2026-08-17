import styles from './ArgentinaPride.module.css'

export default function ArgentinaPride(){
  return <section className={styles.band} id="argentina" aria-label="Comercio Lleno, tecnología argentina">
    <div className={styles.signal} aria-hidden="true"><i/><i/><i/></div>
    <div className={styles.copy}>
      <p>HECHO EN ARGENTINA</p>
      <h2>Tecnología pensada para <em>comercios reales.</em></h2>
      <span>Desarrollamos Comercio Lleno en Argentina para simplificar ventas, stock, caja y gestión diaria en negocios de todo el país.</span>
    </div>
    <div className={styles.signature}>
      <div className={styles.proof}><strong>Simple</strong><span>para empezar y usar todos los días</span></div>
      <div className={styles.origin}><strong>Llena Group</strong><span>Buenos Aires · Argentina</span></div>
    </div>
  </section>
}
