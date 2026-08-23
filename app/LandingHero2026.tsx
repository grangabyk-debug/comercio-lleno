import Link from 'next/link'
import styles from './LandingHero2026.module.css'

const retailPhoto='https://images.pexels.com/photos/12935050/pexels-photo-12935050.jpeg?auto=compress&cs=tinysrgb&w=1400'

function SaleScreen({compact=false}:{compact?:boolean}){
  return <div className={`${styles.saleScreen} ${compact?styles.compact:''}`}>
    <div className={styles.saleTop}><span><i/> CAJA ABIERTA</span><b>ARCA conectado</b></div>
    <div className={styles.saleSearch}>⌕ Buscar producto o escanear código</div>
    <div className={styles.saleLine}><span><b>Café molido 500 g</b><small>2 × $8.450</small></span><strong>$16.900</strong></div>
    <div className={styles.saleLine}><span><b>Leche entera 1 L</b><small>1 × $1.890</small></span><strong>$1.890</strong></div>
    {!compact&&<div className={styles.saleLine}><span><b>Pan lactal</b><small>1 × $3.200</small></span><strong>$3.200</strong></div>}
    <div className={styles.saleTotal}><span>Total</span><strong>{compact?'$18.790':'$21.990'}</strong></div>
    <div className={styles.salePayments}><span>Efectivo</span><span>Mercado Pago</span><span>Presupuesto</span></div>
    <button>Cobrar y facturar</button>
  </div>
}

function Phone(){return <div className={styles.phone} aria-label="Comercio Lleno funcionando en celular">
  <div className={styles.phoneNotch}/>
  <div className={styles.phoneStatus}><span>9:41</span><span>● ● ●</span></div>
  <div className={styles.phoneBrand}><b>Comercio<span>Lleno</span></b><i>IA</i></div>
  <div className={styles.phoneHello}><small>HOY EN TU COMERCIO</small><strong>$428.650</strong><span>36 ventas · caja activa</span></div>
  <div className={styles.phoneActions}><button><b>＋</b><span>Nueva venta<small>Vendé y facturá</small></span></button><button><b>▦</b><span>Productos<small>Stock y precios</small></span></button></div>
  <div className={styles.phoneCard}><span><b>ARCA</b><small>Conectado</small></span><i>✓</i></div>
  <div className={styles.phoneCard}><span><b>Mercado Pago</b><small>Point + QR físico</small></span><i>→</i></div>
  <div className={styles.phoneNav}><b>Inicio</b><span>Venta</span><span>Stock</span><span>Más</span></div>
</div>}

export default function LandingHero2026(){return <section className={styles.hero} id="inicio">
  <div className={styles.mesh}/><div className={styles.grain}/>
  <div className={styles.copy}>
    <div className={styles.eyebrow}><span>NUEVO</span><b>El sistema de gestión que llevás en el bolsillo.</b></div>
    <h1>Tu comercio.<br/><em>Más rápido.</em><br/><span>Más simple.</span></h1>
    <p className={styles.lead}>Vendé, controlá stock y caja, cobrá con Mercado Pago y <strong>facturá con ARCA</strong> desde el celular o la compu. Sin instalaciones raras. Sin aprender un sistema eterno.</p>
    <div className={styles.actions}><Link href="/prueba-gratis" className={styles.primary}>PROBAR 30 DÍAS GRATIS <span>↗</span></Link><Link href="#pc" className={styles.secondary}>Ver cómo funciona</Link></div>
    <div className={styles.micro}><span>Sin tarjeta</span><i/> <span>100% online</span><i/> <span>Después $14.900/mes</span></div>
    <div className={styles.trust}><div><small>FACTURACIÓN</small><b>ARCA integrada</b></div><div><small>COBROS</small><b>Mercado Pago</b></div><div><small>DISPOSITIVOS</small><b>Celular + PC</b></div><div><small>AYUDA</small><b>Asistente IA</b></div></div>
  </div>

  <div className={styles.visual}>
    <div className={styles.photo}><img src={retailPhoto} alt="Cajero usando tecnología en un comercio"/><div className={styles.photoFade}/><span className={styles.photoTag}>HECHO PARA EL MOSTRADOR</span></div>
    <div className={styles.laptop}>
      <div className={styles.laptopLid}><div className={styles.browser}><span>● ● ●</span><b>comerciolleno.com</b></div><div className={styles.desktopApp}><aside><b>CL</b><span>Inicio</span><strong>Nueva venta</strong><span>Productos</span><span>Ventas</span><span>Reportes</span><span>IA</span></aside><main><div className={styles.desktopTitle}><span><small>NUEVA VENTA</small><b>Vendé sin perder tiempo.</b></span><i>ARCA ●</i></div><SaleScreen/></main></div></div>
      <div className={styles.laptopBase}/>
    </div>
    <Phone/>
    <div className={`${styles.floatCard} ${styles.floatArca}`}><span>✓</span><div><small>FACTURACIÓN</small><b>ARCA listo</b></div></div>
    <div className={`${styles.floatCard} ${styles.floatStock}`}><small>STOCK EN VIVO</small><b>811 productos</b><span>4 por reponer</span></div>
    <div className={styles.trial}><small>PROBALO</small><strong>30</strong><b>DÍAS GRATIS</b><span>sin tarjeta</span></div>
  </div>

  <div className={styles.mobileProof}><span>ARCA</span><span>Mercado Pago</span><span>Stock</span><span>IA</span></div>
</section>}
