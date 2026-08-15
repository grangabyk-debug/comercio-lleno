import styles from './LandingSecurityShowcase.module.css'

type SecurityIcon='access'|'isolated'|'https'|'offline'|'roles'

function Icon({name}:{name:SecurityIcon}){
  const common={width:26,height:26,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true}
  if(name==='access')return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2"/></svg>
  if(name==='isolated')return <svg {...common}><ellipse cx="12" cy="5.5" rx="6.5" ry="2.5"/><path d="M5.5 5.5v6c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-6M5.5 11.5v6c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-6"/></svg>
  if(name==='https')return <svg {...common}><path d="M12 3 5 6v5c0 4.4 2.9 8 7 10 4.1-2 7-5.6 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>
  if(name==='offline')return <svg {...common}><path d="M4 12a8 8 0 0 1 13.5-5.8M20 12a8 8 0 0 1-13.5 5.8M4 7v5h5M20 17v-5h-5"/></svg>
  return <svg {...common}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.2"/><path d="M3.5 19c.7-3.4 2.7-5.2 5.5-5.2s4.8 1.8 5.5 5.2M14.5 15c.8-.9 1.8-1.4 3.1-1.4 2 0 3.3 1.4 3.9 4"/></svg>
}

const items:Array<{icon:SecurityIcon;eyebrow:string;title:string;body:string;meta:string}>=[
  {icon:'access',eyebrow:'IDENTIDAD',title:'Acceso autenticado',body:'Cada usuario entra con sus propias credenciales y permisos dentro del comercio.',meta:'ACCESO CONTROLADO'},
  {icon:'isolated',eyebrow:'AISLAMIENTO',title:'Datos por comercio',body:'La información de cada cuenta permanece organizada dentro de su propio espacio operativo.',meta:'DATOS SEPARADOS'},
  {icon:'https',eyebrow:'CONEXIÓN',title:'HTTPS cifrado',body:'La conexión pública del sistema se sirve de forma cifrada para proteger el intercambio de información.',meta:'CONEXIÓN SEGURA'},
  {icon:'offline',eyebrow:'CONTINUIDAD',title:'Modo offline',body:'La operación prevista puede continuar aun cuando la conexión a Internet se interrumpe momentáneamente.',meta:'OPERACIÓN CONTINUA'},
  {icon:'roles',eyebrow:'EQUIPO',title:'Roles y permisos',body:'Propietarios, supervisores y empleados acceden solamente a las funciones que les corresponden.',meta:'PERMISOS POR USUARIO'},
]

export default function LandingSecurityShowcase(){
  return <section className={styles.section} aria-labelledby="security-showcase-title">
    <div className={styles.texture}/>
    <div className={styles.glowOne}/><div className={styles.glowTwo}/>
    <div className={styles.shell}>
      <div className={styles.heading}>
        <div><p>SEGURIDAD Y CONTINUIDAD</p><h2 id="security-showcase-title">Tu operación sigue.<br/><span>Tus datos permanecen separados.</span></h2></div>
        <p className={styles.intro}>Comercio Lleno combina acceso por usuario, separación de datos, conexión cifrada y continuidad operativa para que cada comercio trabaje dentro de su propio entorno.</p>
      </div>

      <div className={styles.stage}>
        <div className={styles.stageShine}/>
        <div className={styles.core}>
          <span className={styles.coreRing}/><span className={styles.coreRingTwo}/>
          <div className={styles.coreIcon}><Icon name="https"/></div>
          <small>PROTECCIÓN ACTIVA</small>
          <strong>5 capas</strong>
          <p>pensadas para acompañar la operación diaria</p>
        </div>
        <div className={styles.cards}>
          {items.map(item=><article className={styles.card} key={item.title}>
            <div className={styles.cardTop}><span className={styles.icon}><Icon name={item.icon}/></span><small>{item.eyebrow}</small></div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <div className={styles.meta}><i/><span>{item.meta}</span></div>
          </article>)}
        </div>
      </div>

      <div className={styles.footerRail}>
        <span><i/>Sesiones autenticadas</span>
        <span><i/>Datos organizados por comercio</span>
        <span><i/>Continuidad ante cortes</span>
        <span><i/>Permisos por rol</span>
      </div>
    </div>
  </section>
}
