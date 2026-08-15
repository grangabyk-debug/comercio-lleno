import BrandLogo from './BrandLogo'
import styles from './LandingSystemShowcase.module.css'

const products=[
  ['Coca-Cola 500 ml','2','$ 6.400'],
  ['Alfajor triple chocolate','2','$ 3.600'],
  ['Papas fritas 90 g','1','$ 2.700'],
  ['Agua mineral 500 ml','1','$ 1.500'],
  ['Galletitas rellenas','1','$ 2.200'],
  ['Chocolate con maní','1','$ 2.600'],
]

const payments=['Efectivo','Débito','Crédito','Transferencia','Mercado Pago','Billetera Virtual']

export default function LandingSystemShowcase(){
  return <section className={styles.section} id="sistema" aria-label="Vista del sistema Comercio Lleno">
    <div className={styles.heading}>
      <div>
        <p>EL SISTEMA, SIN VUELTAS</p>
        <h2>Así se ve cuando<br/><span>hay gente esperando.</span></h2>
      </div>
      <div className={styles.intro}>
        <b>Una pantalla pensada para vender.</b>
        <span>Buscás el producto, elegís cómo te pagan y seguís. Sin menús escondidos ni pasos innecesarios.</span>
      </div>
    </div>

    <div className={styles.frame}>
      <div className={styles.browserBar}><i/><i/><i/><span>comerciolleno.com · Nueva venta</span></div>
      <div className={styles.app}>
        <aside className={styles.side}>
          <div className={styles.logo}><BrandLogo size={27}/></div>
          <div className={styles.sideLabel}>OPERACIÓN</div>
          <span>Inicio</span>
          <span className={styles.active}>$ <b>Nueva venta</b></span>
          <span>Productos</span>
          <span>Caja diaria</span>
          <span>Configuración</span>
          <span>Asistente IA</span>
        </aside>

        <div className={styles.work}>
          <div className={styles.top}><div className={styles.search}>Buscar producto o escanear código de barras...</div><button>Agregar</button></div>
          <div className={styles.saleHead}><div><small>VENTA ACTUAL</small><b>8 artículos</b></div><div><small>TOTAL</small><strong>$ 19.000</strong></div></div>
          <div className={styles.saleBody}>
            <div className={styles.list}>
              <div className={styles.listTitle}>PRODUCTOS CARGADOS</div>
              {products.map(([name,qty,total])=><div className={styles.row} key={name}><div><b>{name}</b><small>Producto de kiosco</small></div><span>{qty}</span><strong>{total}</strong></div>)}
            </div>
            <aside className={styles.payPanel}>
              <div className={styles.tools}><button>Agregar cliente</button><button>Agregar descuento</button></div>
              <label>MEDIO DE PAGO</label>
              <div className={styles.payments}>{payments.map((p,i)=><button className={i===0?styles.selected:''} key={p}>{p}</button>)}</div>
              <div className={styles.received}><span>Efectivo recibido</span><div>$ 20.000</div></div>
              <div className={styles.totalLine}><span>TOTAL</span><strong>$ 19.000</strong></div>
              <div className={styles.actions}><button>Cobrar y facturar</button><button>Cobrar</button></div>
            </aside>
          </div>
        </div>
      </div>

      <div className={styles.badge}><small>VENTA REAL · KIOSCO</small><b>Buscar. Cobrar. Seguir.</b><span>La operación importante siempre queda a mano.</span></div>
      <div className={styles.stat}><strong>8</strong><span>artículos en una sola venta</span></div>
    </div>
  </section>
}
