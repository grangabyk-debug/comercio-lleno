import styles from './argentinaStory.module.css'

const argentinaPhoto='https://images.pexels.com/photos/32864389/pexels-photo-32864389.jpeg?auto=compress&cs=tinysrgb&w=1800'

export default function ArgentinaStory(){
  return <div className={styles.story}>
    <img src={argentinaPhoto} alt="Bandera argentina en un paisaje urbano"/>
    <div className={styles.shade}/>
    <div className={styles.lines} aria-hidden="true"><i/><i/><i/></div>
    <div className={styles.copy}>
      <span>HECHO EN ARGENTINA</span>
      <strong>Orgullosos de ser una startup argentina.</strong>
      <small>Tecnología pensada acá, para acompañar comercios reales de todo el país.</small>
    </div>
  </div>
}
