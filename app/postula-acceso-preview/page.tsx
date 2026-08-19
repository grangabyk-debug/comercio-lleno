import {Suspense} from 'react'
import styles from '../postula-preview/platform.module.css'
import {PlatformHeader} from '../postula-preview/PlatformChrome'
import AuthPreviewClient from './AuthPreviewClient'

export const metadata={title:'Acceso | Postulá Mejor Preview',robots:{index:false,follow:false}}
export default function AccessPreview(){return <main className={styles.page}><PlatformHeader/><Suspense fallback={<div className={styles.empty}>Preparando acceso…</div>}><AuthPreviewClient/></Suspense></main>}
