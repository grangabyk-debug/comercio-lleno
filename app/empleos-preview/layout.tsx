import {postulaProductMetadata} from '../postulaProductMetadata'
import JobCardLinkBehavior from './JobCardLinkBehavior'
import './job-card-link.css'

export const metadata=postulaProductMetadata
export default function Layout({children}:{children:React.ReactNode}){return <><JobCardLinkBehavior/>{children}</>}
