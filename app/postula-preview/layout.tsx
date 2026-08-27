import {postulaProductMetadata} from '../postulaProductMetadata'
import HomeJobVisualSync from './HomeJobVisualSync'
import './premium-v8.css'
import './home-job-readability-v38.css'
import './home-job-search-v47.css'

export const metadata=postulaProductMetadata
export const revalidate=60
export default function Layout({children}:{children:React.ReactNode}){return <>{children}<HomeJobVisualSync/></>}
