import BrandLogo from './BrandLogo'
import styles from './LandingSystemShowcase.module.css'

const products=[
  ['Coca-Cola 500 ml','2','$ 6.400'],
  ['Alfajor triple chocolate','2','$ 3.600'],
  ['Papas clásicas 90 g','1','$ 2.700'],
  ['Agua mineral 500 ml','1','$ 1.500'],
  ['Galletitas rellenas','1','$ 2.200'],
  ['Chocolate con maní','1','$ 2.600'],
  ['Caramelos surtidos','3','$ 1.350'],
  ['Energizante 473 ml','1','$ 3.900'],
]

const payments=['Efectivo','Débito','Crédito','Transferencia','Mercado Pago','Billetera virtual']

const bubbles=[
  {kind:'violet',eyebrow:'FACTURACIÓN',title:'ARCA conectado',text:'Factura electrónica dentro de la venta.'},
  {kind:'green',eyebrow:'CONTINUIDAD',title:'Modo offline listo',text:'El mostrador sigue operativo si la conexión falla.'},
  {kind:'orange',eyebrow:'INVENTARIO',title:'Stock en tiempo real',text:'Cada venta actualiza existencias automáticamente.'},
  {kind:'dark',eyebrow:'OPERACIÓN',title:'Caja y cierres',text:'Apertura, movimientos y arqueo en un mismo lugar.'},
  {kind:'violet',eyebrow:'INTELIGENCIA',title:'IA para reponer',text:'Detecta productos para revisar y ayuda con pedidos.'},
  {kind:'orange',eyebrow:'COBROS',title:'Todos los medios',text:'Efectivo, tarjetas, transferencia y billeteras.'},
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

    <div className={styles.showcase}>
      <div className={styles.glowOne}/><div className={styles.glowTwo}/>
      <div className={styles.frame}>
        <div className={styles.browserBar}><i/><i/><i/><span>comerciolleno.com · Nueva venta</span></div>
        <div className={styles.app}>
          <aside className={styles.side}>
            <div className={styles.logo}><BrandLogo size={26}/></div>
            <div className={styles.sideLabel}>OPERACIÓN</div>
            <span>Inicio</span>
            <span className={styles.active}><b>$</b><strong>Nueva venta</strong></span>
            <span>Productos</span>
            <span>Caja diaria</span>
            <span>Configuración</span>
            <span>Asistente IA</span>
            <span className={styles.management}>Gestión</span>
          </aside>

          <div className={styles.work}>
            <div className={styles.fakeTopbar}>
              <div className={styles.statusPill}>SUCURSAL <b>La Económica</b></div>
              <div className={styles.statusOk}>Offline listo</div>
              <div className={styles.statusOk}>ARCA conectado</div>
            </div>
            <div className={styles.top}><div className={styles.search}>Buscar producto o escanear código de barras...</div><button>Agregar</button></div>
            <div className={styles.saleHead}><div><small>VENTA ACTUAL</small><b>12 artículos</b></div><div><small>TOTAL</small><strong>$ 24.250</strong></div></div>
            <div className={styles.saleBody}>
              <div className={styles.list}>
                <div className={styles.listTitle}>PRODUCTOS CARGADOS</div>
                {products.map(([name,qty,total])=><div className={styles.row} key={name}><div><b>{name}</b><small>Producto de kiosco</small></div><span><i>−</i><b>{qty}</b><i>+</i></span><strong>{total}</strong></div>)}
              </div>
              <aside className={styles.payPanel}>
                <div className={styles.tools}><button>Agregar cliente</button><button>Agregar descuento</button></div>
                <label>MEDIO DE PAGO</label>
                <div className={styles.payments}>{payments.map((p,i)=><button className={i===0?styles.selected:''} key={p}>{p}</button>)}</div>
                <div className={styles.received}><span>Efectivo recibido</span><div>$ 25.000</div></div>
                <div className={styles.change}><span>Vuelto</span><strong>$ 750</strong></div>
                <div className={styles.totalLine}><span>TOTAL</span><strong>$ 24.250</strong></div>
                <div className={styles.actions}><button>Cobrar y facturar</button><button>Cobrar</button></div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bubbles} aria-hidden="true">
        {bubbles.map((bubble,index)=><div key={bubble.title} className={`${styles.bubble} ${styles[`bubble${index+1}`]} ${styles[bubble.kind]}`}>
          <span>{bubble.eyebrow}</span><b>{bubble.title}</b><small>{bubble.text}</small>
        </div>)}
      </div>
    </div>
  </section>
}
