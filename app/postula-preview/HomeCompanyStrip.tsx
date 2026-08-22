'use client'

import {usePathname} from 'next/navigation'
import styles from './home-companies.module.css'

const companies=[
 {name:'Cencosud',logo:'https://www.cencosud.com/favicon.ico'},
 {name:'PedidosYa',logo:'https://www.pedidosya.com/favicon.ico'},
 {name:'Despegar',logo:'https://www.despegar.com/favicon.ico'},
 {name:'Coca-Cola FEMSA',logo:'https://coca-colafemsa.com/favicon.ico'},
 {name:'Marriott',logo:'https://www.marriott.com/favicon.ico'},
 {name:'Minor Hotels',logo:'https://www.minorhotels.com/favicon.ico'},
 {name:'Wyndham',logo:'https://www.wyndhamhotels.com/favicon.ico'},
 {name:'Givaudan',logo:'https://www.givaudan.com/favicon.ico'},
 {name:'dLocal',logo:'https://www.dlocal.com/favicon.ico'},
 {name:'EY',logo:'https://www.ey.com/favicon.ico'},
]

export default function HomeCompanyStrip(){const pathname=usePathname();if(pathname!=='/')return null;return <section className={styles.wrap} aria-label="Empresas con oportunidades públicas"><div className={styles.inner}><div className={styles.copy}><span>OPORTUNIDADES PÚBLICAS</span><b>Encontrá búsquedas de empresas que ya están contratando.</b><small>Las marcas aparecen porque tienen avisos públicos visibles en nuestro catálogo. No implica patrocinio ni relación comercial.</small></div><div className={styles.logos}>{companies.map(c=><div className={styles.logo} key={c.name} title={c.name}><span><img src={c.logo} alt=""/></span><b>{c.name}</b></div>)}</div></div></section>}
