import styles from './landingEnhancements.module.css'

const argentinaPhoto='https://images.pexels.com/photos/32864389/pexels-photo-32864389.jpeg?auto=compress&cs=tinysrgb&w=1800'
const supportPhoto='https://images.pexels.com/photos/8866777/pexels-photo-8866777.jpeg?auto=compress&cs=tinysrgb&w=1600'
const whatsappPhoto='https://images.pexels.com/photos/4132538/pexels-photo-4132538.jpeg?auto=compress&cs=tinysrgb&w=1400'

export function AiSignature({compact=false}:{compact?:boolean}){
  return <div className={`${styles.aiSignature} ${compact?styles.aiCompact:''}`} aria-label="Inteligencia artificial IA Plus">
    <div className={styles.aiOrbit}/><div className={styles.aiOrbitTwo}/><b>IA+</b><span>INTELIGENCIA<br/>APLICADA</span>
  </div>
}

export function ArgentinaPresence({mapSrc}:{mapSrc:string}){
  const dots=[['31%','25%'],['52%','29%'],['60%','36%'],['45%','43%'],['57%','49%'],['43%','57%'],['54%','64%'],['48%','72%'],['46%','82%']]
  return <div className={styles.argentinaVisual}>
    <img className={styles.argentinaPhoto} src={argentinaPhoto} alt="Bandera argentina sobre la ciudad de Buenos Aires"/>
    <div className={styles.argentinaShade}/>
    <div className={styles.flagLines}><i/><i/><i/></div>
    <div className={styles.argentinaMapWrap}><img src={mapSrc} alt="Mapa de Argentina"/>{dots.map(([left,top],i)=><i key={i} style={{left,top}}/>)}</div>
    <div className={styles.argentinaCaption}><span>ARGENTINA</span><strong>Una red de comercios que sigue creciendo.</strong><small>Más de 150 negocios usando Comercio Lleno.</small></div>
  </div>
}

export function HumanSupportVisual(){
  return <div className={styles.supportVisual}>
    <img src={supportPhoto} alt="Persona de atención al cliente con auriculares"/>
    <div className={styles.supportShade}/>
    <div className={styles.supportBadge}><span>ASISTENCIA HUMANA</span><b>Cuando necesitás una persona, te conectamos con soporte.</b><small>El canal de ayuda está disponible desde el sistema para dejar tu consulta en cualquier momento.</small></div>
  </div>
}

export function WhatsAppPhoneVisual(){
  return <div className={styles.whatsappVisual}>
    <img src={whatsappPhoto} alt="Teléfono con WhatsApp abierto"/>
    <div className={styles.whatsappShade}/>
    <div className={styles.whatsappCard}><span>WHATSAPP + IA</span><b>Consultas, pedidos y campañas desde un mismo canal.</b><small>Módulo opcional · costo adicional.</small></div>
  </div>
}

export function SecuritySeals(){
  const seals=[['HTTPS','CONEXIÓN CIFRADA'],['AISLADO','DATOS POR COMERCIO'],['OFFLINE','CONTINUIDAD'],['ROLES','PERMISOS POR USUARIO']]
  return <div className={styles.sealRow}>{seals.map(([top,bottom])=><div className={styles.goldSeal} key={top}><div><b>{top}</b><span>{bottom}</span></div></div>)}</div>
}

export function GooglePresence(){
  return <section className={styles.googlePresence}>
    <div><span>PRESENCIA ORGÁNICA</span><h2>Ya nos encontrás buscando Comercio Lleno en Google.</h2><p>La marca ya está indexada. Seguimos trabajando títulos, contenido, imágenes, favicon, datos estructurados y rendimiento para consolidar esa presencia.</p></div>
    <div className={styles.searchMock}><div className={styles.searchTop}><b>Google</b><span>comercio lleno</span></div><small>comerciolleno.com</small><strong>Comercio Lleno · Punto de venta para comercios</strong><p>Vendé, facturá con ARCA, controlá stock y caja y entendé tu negocio con inteligencia artificial.</p></div>
  </section>
}
