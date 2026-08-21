import {postulaProductMetadata} from '../postulaProductMetadata'
import EmployerPlansUpgrade from './EmployerPlansUpgrade'
import './employer-v18.css'
import './employer-plans-v19.css'
export const metadata=postulaProductMetadata
export default function Layout({children}:{children:React.ReactNode}){return <>{children}<EmployerPlansUpgrade/></>}
