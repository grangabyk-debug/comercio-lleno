import {Suspense} from 'react'
import styles from '../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter} from '../postula-preview/PlatformChrome'
import AuthPreviewClient from './AuthPreviewClient'
import '../postula-preview/premium-v6.css'

export const metadata={title:'Acceso | Postulá Mejor Preview',robots:{index:false,follow:false}}
export default function AccessPreview(){return <main className={styles.page}><PlatformHeader/><Suspense fallback={<div className={styles.empty}>Preparando acceso…</div>}><AuthPreviewClient/></Suspense><PlatformFooter/></main>}
