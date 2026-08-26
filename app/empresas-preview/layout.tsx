import {postulaProductMetadata} from '../postulaProductMetadata'
import FlexPlanBenefitsBridge from '../postula-preview/FlexPlanBenefitsBridge'
import EmployerPlansUpgrade from './EmployerPlansUpgrade'
import './employer-v18.css'
import './employer-plans-v19.css'
import './employer-access-v20.css'
import './employer-stability-v21.css'
import './employer-header.css'
import './employer-minimal-v46.css'
import './employer-trim-v47.css'
export const metadata=postulaProductMetadata
export default function Layout({children}:{children:React.ReactNode}){return <>{children}<EmployerPlansUpgrade/><FlexPlanBenefitsBridge/></>}
