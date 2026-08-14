import styles from './arcaDashboardVisual.module.css'

export default function ArcaDashboardVisual(){
  return <div className={styles.wrap} aria-label="Vista ilustrativa de métricas y facturación ARCA">
    <div className={styles.top}><span>COMERCIO LLENO</span><b>ARCA CONECTADO</b></div>
    <div className={styles.metrics}>
      <div><small>VENTAS HOY</small><strong>$1.284.500</strong><span>+18,4% vs. ayer</span></div>
      <div><small>TICKET PROMEDIO</small><strong>$18.350</strong><span>70 operaciones</span></div>
    </div>
    <div className={styles.chart}>
      <i/><i/><i/><i/><i/><i/><i/><i/>
      <div className={styles.cashFlow}><span>$12.450</span><span>$28.900</span><span>$9.800</span></div>
    </div>
    <div className={styles.bottom}><span>Comprobantes emitidos</span><b>68</b><span>Stock bajo</span><b>6</b></div>
  </div>
}
