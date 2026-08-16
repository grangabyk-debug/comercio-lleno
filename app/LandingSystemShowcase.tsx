import BrandLogo from './BrandLogo'
import styles from './LandingSystemShowcase.module.css'
import boost from './LandingSystemShowcaseBoost.module.css'

const counterPhoto='https://images.pexels.com/photos/12935045/pexels-photo-12935045.jpeg?auto=compress&cs=tinysrgb&w=900'
const supportPhoto='https://images.pexels.com/photos/16837409/pexels-photo-16837409.jpeg?auto=compress&cs=tinysrgb&w=900'
const arcaLogo='https://arca.gob.ar/frameworkAFIP/img/logo_arca_blanco.svg'
const mercadoPagoIcon='https://cdn.simpleicons.org/mercadopago/009EE3'

const products=[
  ['Coca-Cola 500 ml','3','$ 13.500'],
  ['Alfajor triple chocolate','4','$ 9.600'],
  ['Papas clásicas 90 g','2','$ 7.800'],
  ['Agua mineral 500 ml','3','$ 6.600'],
  ['Galletitas rellenas','2','$ 6.800'],
  ['Chocolate con maní','2','$ 7.400'],
  ['Caramelos surtidos','5','$ 3.750'],
  ['Energizante 473 ml','2','$ 10.400'],
]

const payments=['Efectivo','Débito','Crédito','Transferencia','Mercado Pago','Billetera virtual']

const bubbles=[
  {kind:'violet',eyebrow:'FACTURACIÓN',title:'ARCA conectado',text:'Factura electrónica integrada al cobro.',logo:'arca'},
  {kind:'green',eyebrow:'CONTINUIDAD',title:'Funciona offline',text:'Seguí vendiendo aunque se corte Internet.'},
  {kind:'orange',eyebrow:'INVENTARIO',title:'Stock en tiempo real',text:'Cada venta actualiza existencias al instante.'},
  {kind:'dark',eyebrow:'CONTROL',title:'Caja y cierres',text:'Apertura, arqueo y movimientos en un solo lugar.'},
  {kind:'violet',eyebrow:'INTELIGENCIA',title:'Asistente con IA',text:'Consultas, reposición y ayuda durante la operación.'},
  {kind:'orange',eyebrow:'COBROS',title:'Mercado Pago y más',text:'Efectivo, tarjetas, transferencias y billeteras.',logo:'mp'},
]

export default function LandingSystemShowcase(){
  return <section className={styles.section} id="sistema" aria-label="Vista del sistema Comercio Lleno">
    <div className={styles.heading}>
      <div>
        <p>EL SISTEMA, EN EL MOSTRADOR</p>
        <h2>Una venta completa.<br/><span>Todo a la vista.</span></h2>
      </div>
      <div className={styles.intro}>
        <b>Diseñado para trabajar rápido.</b>
        <span>La interfaz prioriza producto, cantidad, medio de pago y cobro. El resto acompaña sin interrumpir la operación.</span>
      </div>
    </div>

    <div className={`${styles.showcase} ${boost.showcase}`}>
      <div className={styles.glowOne}/><div className={styles.glowTwo}/>
      <div className={`${styles.frame} ${boost.frame}`}>
        <div className={styles.browserBar}><i/><i/><i/><span>comerciolleno.com · Nueva venta</span></div>
        <div className={`${styles.app} ${boost.app}`}>
          <div className={`${styles.fakeTopbar} ${boost.fakeTopbar}`}>
            <div className={styles.mockBrand}><BrandLogo size={31}/></div>
            <div className={styles.mockStatuses}>
              <div className={styles.statusPill}>SUCURSAL <b>La Económica</b></div>
              <div className={styles.statusOk}>Offline listo</div>
              <div className={styles.statusOk}>ARCA conectado</div>
            </div>
          </div>
          <div className={`${styles.appBody} ${boost.appBody}`}>
            <aside className={styles.side}>
              <div className={styles.sideLabel}>OPERACIÓN</div>
              <span>Inicio</span>
              <span className={styles.active}><b>$</b><strong>Nueva venta</strong></span>
              <span>Productos</span>
              <span>Caja diaria</span>
              <span>Configuración</span>
              <span>Asistente IA</span>
              <span className={styles.management}>Gestión</span>
            </aside>

            <div className={`${styles.work} ${boost.work}`}>
              <div className={styles.top}><div className={styles.search}>Buscar producto o escanear código de barras...</div><button>Agregar</button></div>
              <div className={`${styles.saleHead} ${boost.saleHead}`}><div><small>VENTA ACTUAL</small><b>23 artículos</b></div><div><small>TOTAL</small><strong>$ 65.850</strong></div></div>
              <div className={styles.saleBody}>
                <div className={styles.list}>
                  <div className={styles.listTitle}>PRODUCTOS CARGADOS</div>
                  {products.map(([name,qty,total])=><div className={`${styles.row} ${boost.row}`} key={name}><div><b>{name}</b><small>Producto de kiosco</small></div><span><i>−</i><b>{qty}</b><i>+</i></span><strong>{total}</strong></div>)}
                </div>
                <aside className={`${styles.payPanel} ${boost.payPanel}`}>
                  <div className={styles.tools}><button>Agregar cliente</button><button>Agregar descuento</button></div>
                  <label>MEDIO DE PAGO</label>
                  <div className={styles.payments}>{payments.map((p,i)=><button className={i===0?styles.selected:''} key={p}>{p}</button>)}</div>
                  <div className={styles.received}><span>Efectivo recibido</span><div>$ 70.000</div></div>
                  <div className={styles.change}><span>Vuelto</span><strong>$ 4.150</strong></div>
                  <div className={styles.totalLine}><span>TOTAL</span><strong>$ 65.850</strong></div>
                  <div className={styles.actions}><button>Cobrar y facturar</button><button>Cobrar</button></div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.humanCard} ${boost.humanCard}`}>
        <div className={`${styles.humanPhoto} ${boost.humanPhoto}`}><img src={counterPhoto} alt="Persona usando un punto de venta en un comercio"/></div>
        <div className={styles.humanCopy}><span>EN EL MOSTRADOR</span><b>Hecho para vender con gente esperando.</b><small>Botones grandes, flujo directo y la información importante siempre visible.</small></div>
        <div className={styles.humanMetric}><strong>Ágil</strong><span>flujo de venta</span></div>
      </div>

      <div className={boost.supportCard}>
        <div className={boost.supportAvatar}><img src={supportPhoto} alt="Atención humana para el comercio"/></div>
        <div className={boost.supportCopy}><span>ACOMPAÑAMIENTO</span><b>Soporte humano cuando lo necesitás.</b><small>Una plataforma simple, con ayuda real detrás.</small></div>
      </div>

      <div className={`${styles.bubbles} ${boost.bubbles}`} aria-hidden="true">
        {bubbles.map((bubble,index)=><div key={bubble.title} className={`${styles.bubble} ${styles[`bubble${index+1}`]} ${styles[bubble.kind]} ${boost.bubble} ${boost[`bubble${index+1}`]}`}>
          <div className={boost.bubbleTop}>
            <span>{bubble.eyebrow}</span>
            {bubble.logo==='arca'&&<div className={boost.arcaBadge}><img className={boost.providerLogo} src={arcaLogo} alt=""/></div>}
            {bubble.logo==='mp'&&<div className={boost.mpBadge}><img src={mercadoPagoIcon} alt=""/><strong>Mercado Pago</strong></div>}
          </div>
          <b>{bubble.title}</b><small>{bubble.text}</small>
        </div>)}
      </div>
    </div>
  </section>
}
