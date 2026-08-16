import type { Metadata } from 'next'
import Link from 'next/link'
import BrandLogo from '../BrandLogo'
import LegalServiceForm from './LegalServiceForm'
import styles from './legal.module.css'

export const metadata: Metadata = {
  title: 'Gestiones de servicio | Comercio Lleno',
  description: 'Solicitá la baja del servicio o ejercé el derecho de arrepentimiento cuando corresponda, sin iniciar sesión.',
  robots: { index: false, follow: true },
}

export default async function ManageServicePage({searchParams}:{searchParams:Promise<{tipo?:string}>}){
  const params=await searchParams
  const initialType=params.tipo==='arrepentimiento'?'withdrawal':'cancellation'
  return <main className={styles.page}>
    <div className={styles.topLine}/>
    <header className={styles.header}>
      <Link href="/" aria-label="Volver a Comercio Lleno"><BrandLogo size={40}/></Link>
      <Link href="/" className={styles.back}>Volver al inicio</Link>
    </header>

    <section className={styles.hero}>
      <div className={styles.copy}>
        <p>GESTIONES DE SERVICIO</p>
        <h1>Un trámite directo.<br/><span>Sin iniciar sesión.</span></h1>
        <p className={styles.lead}>Desde acá podés solicitar la baja de Comercio Lleno o enviar una solicitud de arrepentimiento cuando corresponda. Al finalizar te damos un código de identificación en el momento.</p>
        <div className={styles.notes}>
          <div><b>Sin registración previa</b><span>No necesitás entrar a tu cuenta para iniciar la gestión.</span></div>
          <div><b>Código inmediato</b><span>Guardalo como constancia de que recibimos tu solicitud.</span></div>
          <div><b>Datos mínimos</b><span>Pedimos sólo lo necesario para identificar la contratación.</span></div>
        </div>
      </div>
      <LegalServiceForm initialType={initialType}/>
    </section>

    <section className={styles.legalNote}>
      <b>Sobre el derecho de arrepentimiento</b>
      <p>La normativa argentina contempla supuestos y excepciones. Si la contratación fue realizada para integrarse en una actividad comercial o prestación a terceros, puede corresponder una excepción. La solicitud igualmente puede enviarse desde esta página para su revisión.</p>
    </section>

    <footer className={styles.footer}>
      <span>Comercio Lleno · Llena Group</span>
      <div><Link href="/terminos">Términos</Link><Link href="/politica-de-privacidad">Privacidad</Link><Link href="/">Inicio</Link></div>
    </footer>
  </main>
}
