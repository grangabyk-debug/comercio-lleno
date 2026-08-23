import Link from 'next/link'
import BrandLogo from './BrandLogo'
import styles from './LandingExperience2026.module.css'
import upgrade from './LandingExperienceDeviceUpgrade.module.css'

const cashierPhoto='https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg?auto=compress&cs=tinysrgb&w=1400'
const stockPhoto='https://images.pexels.com/photos/4483608/pexels-photo-4483608.jpeg?auto=compress&cs=tinysrgb&w=1400'
const fashionPhoto='https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=1400'
const storePhoto='https://images.pexels.com/photos/12935045/pexels-photo-12935045.jpeg?auto=compress&cs=tinysrgb&w=1600'
const arcaLogo='https://arca.gob.ar/frameworkAFIP/img/logo_arca_blanco.svg'
const mpLogo='https://cdn.simpleicons.org/mercadopago/009EE3'

function PhoneMock(){return <div className={`${styles.phone} ${upgrade.phone}`} aria-label="Comercio Lleno en celular"><div className={styles.phoneIsland}/><div className={styles.phoneHead}><b>Comercio<span>Lleno</span></b><i>IA</i></div><div className={styles.phoneGreeting}><small>HOY EN TU COMERCIO</small><strong>$ 428.650</strong><span>36 ventas · ARCA conectado</span></div><button className={styles.phoneSale}><b>+</b><span>Nueva venta<small>Vendé y facturá</small></span></button><div className={styles.phoneCards}><div><small>STOCK BAJO</small><b>4</b><span>revisar ahora</span></div><div><small>PRODUCTOS</small><b>813</b><span>sincronizados</span></div></div><div className={styles.phoneRows}><span><i>⌁</i><b>Productos</b><small>Stock y precios</small></span><span><i>◉</i><b>Mercado Pago</b><small>Point + QR</small></span><span><i>✦</i><b>Asistente IA</b><small>Preguntale al negocio</small></span></div></div>}

function LaptopMock(){return <div className={`${styles.laptop} ${upgrade.laptop}`}><div className={styles.screen}><div className={styles.browser}><i/><i/><i/><span>comerciolleno.com · Panel principal</span></div><div className={upgrade.dashboard}>
  <aside className={upgrade.dashboardSide}><div className={upgrade.dashboardBrand}><BrandLogo size={23}/></div><span>Inicio</span><b>Nueva venta</b><span>Productos</span><span>Ventas</span><span>Caja</span><span>Clientes</span><span>Reportes</span><span>Asistente IA</span><small>Configuración</small></aside>
  <main className={upgrade.dashboardMain}>
    <div className={upgrade.dashboardTop}><div><small>PANEL DEL COMERCIO</small><h3>Resumen de hoy</h3></div><button>+ Nueva venta</button></div>
    <div className={upgrade.kpis}><article><small>VENTAS HOY</small><strong>$ 428.650</strong><span>36 operaciones</span></article><article><small>CAJA ACTUAL</small><strong>$ 312.480</strong><span>Abierta · en vivo</span></article><article><small>PRODUCTOS</small><strong>813</strong><span>4 con stock bajo</span></article><article><small>ARCA</small><strong>Conectado</strong><span>Facturación activa</span></article></div>
    <div className={upgrade.dashboardGrid}><section className={upgrade.chartCard}><div><span>VENTAS DE LA SEMANA</span><b>$ 1.864.300</b></div><div className={upgrade.bars}><i style={{height:'38%'}}/><i style={{height:'56%'}}/><i style={{height:'47%'}}/><i style={{height:'74%'}}/><i style={{height:'62%'}}/><i style={{height:'92%'}}/><i style={{height:'71%'}}/></div><div className={upgrade.days}><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div></section>
      <section className={upgrade.activityCard}><div><span>ÚLTIMAS VENTAS</span><b>Ver todas</b></div><ul><li><span>21:08</span><b>$ 145.300</b><em>Mercado Pago</em></li><li><span>20:54</span><b>$ 82.450</b><em>Débito</em></li><li><span>20:41</span><b>$ 64.900</b><em>Efectivo</em></li><li><span>20:29</span><b>$ 38.600</b><em>ARCA</em></li></ul></section>
    </div>
    <div className={upgrade.quickRow}><span><b>Stock bajo</b><small>4 productos para reponer</small></span><span><b>Mercado Pago</b><small>Point + QR vinculados</small></span><span><b>Asistente IA</b><small>Consultá tu negocio</small></span><span><b>Presupuestos</b><small>Sin afectar caja ni stock</small></span></div>
  </main>
</div></div><div className={styles.base}/></div>}

function HumanPosScreen(){return <div className={upgrade.humanPosScreen} aria-hidden="true">
  <div className={upgrade.humanPosTop}><BrandLogo size={17}/><span>Nueva venta</span><b>$145.300</b></div>
  <div className={upgrade.humanPosBody}>
    <aside><strong>+</strong><i>Inicio</i><b>Venta</b><i>Productos</i><i>Caja</i></aside>
    <main>
      <div className={upgrade.humanPosSearch}>Buscar producto o escanear código…</div>
      <div className={upgrade.humanPosGrid}>
        <section><span><b>Yerba mate 1 kg</b><em>2 × $8.900</em><strong>$17.800</strong></span><span><b>Detergente 750 ml</b><em>3 × $4.500</em><strong>$13.500</strong></span><span><b>Perfumería</b><em>4 artículos</em><strong>$62.000</strong></span><span><b>Limpieza</b><em>5 artículos</em><strong>$52.000</strong></span></section>
        <div><small>MEDIO DE PAGO</small><p><b>Efectivo</b><b>Débito</b><b>Mercado Pago</b><b>Presupuesto</b></p><button>Cobrar y facturar</button></div>
      </div>
    </main>
  </div>
</div>}

export default function LandingExperience2026(){return <>
  <section className={`${styles.devices} ${upgrade.devices}`}>
    <div className={styles.deviceHeading}><p>EL MISMO NEGOCIO · EN TODOS TUS DISPOSITIVOS</p><h2>De la caja al bolsillo.<br/><em>Sin perder el hilo.</em></h2><span>Entrá desde una notebook en el mostrador o desde el celular caminando por el local. Los datos siguen siendo los mismos, en tiempo real.</span></div>
    <div className={`${styles.deviceStage} ${upgrade.deviceStage}`}>
      <div className={styles.deviceOrbOne}/><div className={styles.deviceOrbTwo}/>
      <div className={upgrade.storeBackdrop}><img src={storePhoto} alt="Cajero trabajando en un comercio"/><div/></div>
      <div className={upgrade.humanBadge}><img src={cashierPhoto} alt="Persona atendiendo en un comercio"/><span><small>EN EL MOSTRADOR</small><b>Vendé con gente esperando.</b><em>El sistema acompaña el ritmo real del negocio.</em></span></div>
      <LaptopMock/><PhoneMock/>
      <div className={`${styles.deviceChip} ${styles.chipOne} ${upgrade.chipOne}`}><span>ARCA</span><b>Factura integrada</b></div>
      <div className={`${styles.deviceChip} ${styles.chipTwo} ${upgrade.chipTwo}`}><span>STOCK</span><b>Actualización en vivo</b></div>
      <div className={`${styles.deviceChip} ${styles.chipThree} ${upgrade.chipThree}`}><span>IA</span><b>Consultas instantáneas</b></div>
      <div className={upgrade.liveSale}><span>VENTA EN CURSO</span><strong>$ 145.300</strong><small>Mercado Pago · 8 artículos</small></div>
      <div className={upgrade.syncRibbon}><b>● Todo sincronizado</b><span>Celular · PC · stock · caja · ARCA</span></div>
    </div>
  </section>

  <section className={styles.human}>
    <article className={`${styles.humanMain} ${upgrade.humanMain}`}><img src={cashierPhoto} alt="Persona atendiendo un comercio con Comercio Lleno"/><HumanPosScreen/><div className={styles.humanShade}/><div><p>HECHO PARA EL MOMENTO REAL</p><h2>Cuando hay gente esperando, el sistema tiene que acompañar.</h2><span>Botones grandes, información clara y un flujo pensado para vender sin fricción.</span></div></article>
    <div className={styles.humanSide}><article><img src={stockPhoto} alt="Persona controlando mercadería"/><div><small>INVENTARIO</small><b>Controlá productos desde donde están.</b></div></article><article><img src={fashionPhoto} alt="Local de indumentaria moderno"/><div><small>MÓDULOS</small><b>Adaptalo a tu tipo de comercio.</b></div></article></div>
  </section>

  <section className={styles.intelligence}>
    <div className={styles.aiHalo}/><div className={styles.aiCopy}><p>COMERCIO LLENO + IA</p><h2>Tu negocio también<br/><em>te puede responder.</em></h2><span>Preguntá cuánto vendiste, qué productos se están quedando sin stock o qué pasó durante el día. La IA trabaja sobre la información de tu comercio para darte una lectura más simple.</span><div className={styles.aiPrompts}><i>“¿Qué vendí más hoy?”</i><i>“¿Qué tengo que reponer?”</i><i>“¿Cómo viene la caja?”</i></div></div><div className={styles.aiWindow}><div className={styles.aiTop}><span>✦ ASISTENTE IA</span><i>ONLINE</i></div><div className={styles.userBubble}>¿Qué debería reponer mañana?</div><div className={styles.aiBubble}><b>Detecté 4 productos con stock crítico.</b><span>El más urgente es Café molido 500 g: quedan 3 unidades y hoy se vendieron 11.</span><div><strong>Ver productos</strong><strong>Armar lista</strong></div></div><div className={styles.typing}><i/><i/><i/></div></div>
  </section>

  <section className={styles.integrations}>
    <div><p>INTEGRACIONES QUE IMPORTAN</p><h2>No vive aislado.<br/><em>Se conecta con tu operación.</em></h2></div><div className={styles.integrationCards}><article className={styles.arcaCard}><img src={arcaLogo} alt="ARCA"/><span>Facturación electrónica integrada</span></article><article><img src={mpLogo} alt="Mercado Pago"/><b>Mercado Pago</b><span>Point + QR físico</span></article><article><b>58 / 80 mm</b><span>Impresoras térmicas</span></article><article><b>USB + cámara</b><span>Lectores de códigos</span></article></div>
  </section>

  <section className={styles.price} id="precio"><div className={styles.priceNoise}/><div className={styles.priceCopy}><p>PROBALO EN TU NEGOCIO</p><h2>30 días.<br/><em>Sin pagar nada.</em></h2><span>Probalo con tus productos, tus ventas y tu operación real. No necesitás tarjeta para empezar.</span><div className={styles.priceProof}><b>✓ Sin tarjeta</b><b>✓ Cancelás cuando quieras</b><b>✓ Configuración guiada</b></div></div><div className={styles.priceCard}><span className={styles.priceBadge}>POR TIEMPO LIMITADO</span><small>PRIMEROS 30 DÍAS</small><strong>$0</strong><p>Después <b>$14.900/mes</b></p><Link href="/prueba-gratis">EMPEZAR GRATIS <span>→</span></Link><small>1 sucursal · hasta 1.000 productos · hasta 500 comprobantes ARCA</small></div></section>

  <section className={styles.finalCta}><div className={styles.finalOrb}/><p>¿LISTO PARA VERLO EN TU NEGOCIO?</p><h2>Probalo. Cargá un producto.<br/><em>Hacé tu primera venta.</em></h2><span>En pocos minutos vas a entender por qué Comercio Lleno se siente distinto.</span><Link href="/prueba-gratis">PROBAR 30 DÍAS GRATIS →</Link></section>
</>}
