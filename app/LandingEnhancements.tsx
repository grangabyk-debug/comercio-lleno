import styles from './landingEnhancements.module.css'

const supportPhoto='https://images.pexels.com/photos/7709235/pexels-photo-7709235.jpeg?auto=compress&cs=tinysrgb&w=1600'
const whatsappPhoto='https://images.pexels.com/photos/4132538/pexels-photo-4132538.jpeg?auto=compress&cs=tinysrgb&w=1400'

export function AiSignature({compact=false}:{compact?:boolean}){
  return <div className={`${styles.aiSignature} ${compact?styles.aiCompact:''}`} aria-label="Inteligencia artificial IA Plus">
    <div className={styles.aiOrbit}/><div className={styles.aiOrbitTwo}/><b>IA+</b><span>INTELIGENCIA<br/>APLICADA</span>
  </div>
}

export function ArgentinaPresence({mapSrc}:{mapSrc:string}){
  const dots=[['51%','17%'],['47%','25%'],['56%','31%'],['44%','38%'],['52%','45%'],['45%','52%'],['53%','59%'],['47%','67%'],['49%','76%'],['46%','86%']]
  return <div className={styles.argentinaVisual}>
    <div className={styles.nationalBackdrop}><i/><i/><i/></div>
    <div className={styles.argentinaMapWrap}><img src={mapSrc} alt="Mapa de Argentina"/>{dots.map(([left,top],i)=><i key={i} style={{left,top}} aria-hidden="true"/>)}</div>
    <div className={styles.argentinaGlow}/>
    <div className={styles.argentinaCaption}><span>ARGENTINA</span><strong>Una red de comercios que sigue creciendo.</strong><small>Más de 150 negocios usando Comercio Lleno.</small></div>
  </div>
}

export function HumanSupportVisual(){
  return <div className={styles.supportVisual}>
    <img src={supportPhoto} alt="Persona de soporte atendiendo con auriculares"/>
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
