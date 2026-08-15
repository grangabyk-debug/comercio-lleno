import styles from './ArgentinaPride.module.css'

export default function ArgentinaPride(){
  return <section className={styles.band} aria-label="Comercio Lleno, startup argentina">
    <div className={styles.signal} aria-hidden="true"><i/><i/><i/></div>
    <div className={styles.copy}>
      <p>HECHO EN ARGENTINA</p>
      <h2>Orgullosos de ser una <em>startup argentina.</em></h2>
      <span>Tecnología pensada acá, para acompañar comercios reales de todo el país.</span>
    </div>
    <div className={styles.signature}>
      <strong>Llena Group</strong>
      <span>Buenos Aires · Argentina</span>
    </div>
  </section>
}
