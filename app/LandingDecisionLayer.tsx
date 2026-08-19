import Link from 'next/link'
import styles from './LandingDecisionLayer.module.css'

const flows=[
 {n:'01',title:'Vendé sin fricción',text:'Abrí caja, buscá o escaneá el producto, cobrá y seguí. El flujo está pensado para el mostrador y también para el celular.'},
 {n:'02',title:'Facturá con ARCA',text:'Cuando tu comercio ya está configurado, la factura electrónica forma parte de la misma operación. Sin volver a cargar la venta.'},
 {n:'03',title:'Controlá lo que pasa',text:'Caja, stock, ventas y reportes quedan conectados para que el dueño pueda mirar el negocio incluso cuando no está en el local.'},
]
const start=[
 ['1','Creá tu comercio','Datos básicos y sucursal.'],['2','Cargá tus productos','Uno a uno o mediante importación cuando corresponda.'],['3','Configurá tu operación','Caja, medios de pago, impresora y facturación.'],['4','Hacé una venta de prueba','Recorré el mismo flujo que va a usar tu equipo.'],['5','Empezá a operar','Usalo 90 días y medí si realmente te simplifica el trabajo.'],
]
export default function LandingDecisionLayer(){return <>
 <section className={styles.decision} id="como-funciona">
  <div className={styles.heading}><span>ANTES DE REGISTRARTE</span><h2>Entendé el sistema en tres movimientos.</h2><p>No necesitás imaginar qué hace cada módulo. Mirá cómo se conecta con una jornada real de comercio.</p></div>
  <div className={styles.flows}>{flows.map(x=><article key={x.n}><b>{x.n}</b><h3>{x.title}</h3><p>{x.text}</p></article>)}</div>
  <div className={styles.actions}><Link href="/registro">Probar 90 días gratis</Link><a href="#primeros-pasos">Ver cómo empiezo</a></div>
 </section>
 <section className={styles.onboarding} id="primeros-pasos">
  <div className={styles.heading}><span>PUESTA EN MARCHA</span><h2>De cuenta nueva a primera venta.</h2><p>El objetivo del período gratis no es que mires pantallas: es que llegues a operar el comercio y puedas decidir con uso real.</p></div>
  <div className={styles.steps}>{start.map(([n,t,d])=><article key={n}><i>{n}</i><div><h3>{t}</h3><p>{d}</p></div></article>)}</div>
  <div className={styles.trust}><div><b>¿Ya usás otro sistema?</b><span>La migración y la importación de datos son parte de las mejoras que estamos priorizando para reducir el costo de cambiar.</span></div><div><b>¿Tenés dudas antes de empezar?</b><span>La nueva experiencia suma explicaciones por tarea y ayuda contextual para que no tengas que aprender nombres técnicos.</span></div></div>
 </section>
 </>}
