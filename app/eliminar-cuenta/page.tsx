import Link from 'next/link'
import BrandLogo from '../BrandLogo'
import styles from '../legal.module.css'

export const metadata={title:'Eliminar cuenta | Comercio Lleno',description:'Solicitud de eliminación de cuenta y datos de Comercio Lleno.'}

const requestUrl='https://wa.me/5491140540970?text=Hola%2C%20quiero%20solicitar%20la%20eliminaci%C3%B3n%20de%20mi%20cuenta%20de%20Comercio%20Lleno.%20Mi%20comercio%20es%3A%20'

export default function DeleteAccountPage(){return <main className={styles.page}><div className={styles.shell}><div className={styles.top}><Link href="/" aria-label="Comercio Lleno"><BrandLogo size={46}/></Link><Link className={styles.back} href="/">← Volver a Comercio Lleno</Link></div><article className={styles.card}><span className={styles.eyebrow}>LLENA GROUP · COMERCIO LLENO</span><h1>Eliminar cuenta y datos</h1><div className={styles.updated}>Solicitud disponible para titulares de cuentas de Comercio Lleno.</div><p className={styles.notice}>Podés iniciar desde esta página la eliminación de tu cuenta de Comercio Lleno y de los datos asociados que no deban conservarse por una obligación legal.</p>
<h2>Cómo solicitar la eliminación</h2><ol><li>Ingresá al enlace de solicitud que figura abajo.</li><li>Indicá el nombre de tu comercio y el usuario o email asociado a la cuenta.</li><li>Por seguridad, podremos pedirte que confirmes la solicitud desde un canal ya vinculado a la cuenta.</li><li>Una vez validada la titularidad, procesaremos la eliminación de la cuenta y los datos alcanzados por la solicitud.</li></ol>
<p><a href={requestUrl} target="_blank" rel="noreferrer" style={{display:'inline-block',padding:'12px 16px',borderRadius:12,background:'#158a54',color:'#fff',fontWeight:900,textDecoration:'none'}}>Iniciar solicitud de eliminación</a></p>
<h2>Qué se elimina</h2><p>Cuando corresponde, se eliminan o desvinculan los datos de acceso del usuario y la información del comercio asociada a la cuenta, incluyendo configuraciones y datos operativos que no deban conservarse.</p>
<h2>Qué información puede conservarse</h2><p>Determinados comprobantes, registros fiscales, contables, antifraude, de seguridad o de auditoría pueden conservarse durante el plazo exigido por una obligación legal o por un interés legítimo de seguridad. Cuando sea posible, esos datos se limitarán o desvincularán de la cuenta eliminada.</p>
<h2>Usuarios empleados o secundarios</h2><p>Si sos un usuario creado por el propietario de un comercio, también podés pedir la eliminación de tu acceso. El propietario o el soporte de Comercio Lleno podrán desactivar y eliminar ese usuario según corresponda.</p>
<h2>Alternativa desde la aplicación</h2><p>Si todavía podés ingresar a Comercio Lleno, también podés iniciar la solicitud mediante <b>Ayuda humana</b> indicando que querés eliminar tu cuenta y datos.</p>
<div className={styles.footer}>Más información en nuestra <Link href="/privacidad">Política de Privacidad</Link>.</div></article></div></main>}
