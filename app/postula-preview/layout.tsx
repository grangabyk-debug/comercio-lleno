import {postulaProductMetadata} from '../postulaProductMetadata'
import HomeJobVisualSync from './HomeJobVisualSync'
import './premium-v8.css'
import './home-job-readability-v38.css'

export const metadata=postulaProductMetadata
export default function Layout({children}:{children:React.ReactNode}){return <>{children}<HomeJobVisualSync/></>}
