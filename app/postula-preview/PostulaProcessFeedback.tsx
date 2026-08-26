import styles from './PostulaProcessFeedback.module.css'

type Props={
 title?:string
 detail?:string
 eyebrow?:string
 compact?:boolean
}

export default function PostulaProcessFeedback({
 title='Preparando lo que necesitás',
 detail='Estamos cargando la información. En unos segundos vas a poder continuar.',
 eyebrow='POSTULÁ MEJOR',
 compact=false,
}:Props){
 return <section className={compact?styles.compact:styles.screen} role="status" aria-live="polite" aria-busy="true">
  <div className={styles.card}>
   <div className={styles.spinner} aria-hidden="true"/>
   <div className={styles.copy}>
    <span>{eyebrow}</span>
    <h2>{title}</h2>
    <p>{detail}</p>
   </div>
   <div className={styles.progress} aria-hidden="true"><i/></div>
  </div>
 </section>
}
