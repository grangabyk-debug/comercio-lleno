import {Suspense} from 'react'
import styles from '../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter} from '../postula-preview/PlatformChrome'
import AuthPreviewClient from './AuthPreviewClient'
import '../postula-preview/premium-v6.css'
import '../postula-preview/premium-v7.css'

export const metadata={title:{absolute:'Acceso | Postulá Mejor'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/acceso'}}
export default function AccessPreview(){return <main className={`${styles.page} pm7-page`}><PlatformHeader/><Suspense fallback={<div className={styles.empty}>Preparando acceso…</div>}><AuthPreviewClient/></Suspense><PlatformFooter/></main>}
