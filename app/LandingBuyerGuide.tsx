import Link from 'next/link'
import styles from './LandingBuyerGuide.module.css'

const steps=[
 ['1','Configurás lo básico','Creás el comercio, cargás o importás productos y definís cómo vas a cobrar.'],
 ['2','Abrís caja y vendés','Buscás por nombre, código o scanner; cobrás y, si corresponde, facturás en el mismo flujo.'],
 ['3','El stock se mueve solo','Cada venta descuenta existencias y te deja el historial para detectar faltantes y productos fuertes.'],
 ['4','Mirás el negocio','Caja, ventas, stock, clientes y reportes quedan disponibles también desde el celular.'],
]
const jobs=[
 ['Vender rápido','POS, scanner, medios de pago, ticket e impresión térmica.'],
 ['Facturar','Comprobantes electrónicos integrados con ARCA una vez hecha la configuración fiscal.'],
 ['Controlar stock','Productos, movimientos, alertas y lectura del inventario desde una misma operación.'],
 ['Cerrar caja','Apertura, cobros, movimientos y cierre para saber qué pasó en cada jornada.'],
 ['Trabajar con equipo','Usuarios y permisos para separar tareas sin compartir una única cuenta.'],
 ['Administrar desde el celular','La operación y los indicadores principales viajan con vos, no quedan atados al mostrador.'],
]
export default function LandingBuyerGuide(){return <>
 <section className={styles.guide} id="como-funciona">
  <div className={styles.head}><div><span>CÓMO FUNCIONA</span><h2>Antes de registrarte,<br/>entendé el sistema.</h2></div><p>No hace falta imaginar qué vas a recibir. Este es el recorrido normal de un comercio que empieza a usar Comercio Lleno.</p></div>
  <div className={styles.steps}>{steps.map(([n,t,d])=><article key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></article>)}</div>
  <div className={styles.cta}><div><strong>Podés probar este flujo durante 90 días.</strong><span>Sin tarjeta al registrarte. Si no te sirve, no seguís.</span></div><Link href="/redesign/register">Empezar prueba gratis</Link></div>
 </section>
 <section className={styles.jobs} aria-label="Qué resuelve Comercio Lleno">
  <div className={styles.head}><div><span>QUÉ RESUELVE</span><h2>Elegí por necesidad,<br/>no por nombre de módulo.</h2></div><p>La pregunta no es cuántas funciones tiene un POS. Es si te ayuda a vender, facturar y controlar sin sumar trabajo administrativo.</p></div>
  <div className={styles.jobGrid}>{jobs.map(([t,d])=><article key={t}><h3>{t}</h3><p>{d}</p></article>)}</div>
 </section>
 <section className={styles.trial} aria-label="Plan de activación de 90 días">
  <div><span>PLAN IMPULSO · 90 DÍAS</span><h2>La prueba larga tiene sentido si llegás a usarla de verdad.</h2><p>Por eso la propuesta no es “mirá el sistema tres meses”. Es llegar rápido a cuatro hitos: primera venta, primera caja cerrada, stock bajo control y primera lectura de reportes. Después decidís con datos si te sirve.</p></div>
  <ol><li><b>Primer día</b><span>Cuenta, comercio, productos y primera venta.</span></li><li><b>Primera semana</b><span>Caja, facturación y operación diaria funcionando.</span></li><li><b>Primer mes</b><span>Stock, clientes y reportes con datos reales.</span></li><li><b>Antes de vencer</b><span>Resumen de uso y decisión clara sobre continuar.</span></li></ol>
 </section>
 </>}
