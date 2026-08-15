import styles from './ArgentinaPride.module.css'

export default function ArgentinaPride(){
  return <section className={styles.band} aria-label="Comercio Lleno, startup argentina">
    <div className={styles.signal} aria-hidden="true"><i/><i/><i/></div>
    <div className={styles.copy}>
      <p>HECHO EN ARGENTINA</p>
      <h2>Orgullosos de ser una <em>startup argentina.</em></h2>
      <span>Tecnología pensada acá, para acompañar comercios reales de todo el país. Más de 150 clientes ya eligieron Comercio Lleno para vender, controlar stock y ordenar su operación.</span>
    </div>
    <div className={styles.signature}>
      <div className={styles.proof}><strong>150+</strong><span>clientes ya confían en Comercio Lleno</span></div>
      <div className={styles.origin}><strong>Llena Group</strong><span>Buenos Aires · Argentina</span></div>
    </div>
  </section>
}
