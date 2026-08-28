import {postulaProductMetadata} from '../postulaProductMetadata'
import ServicesFlexConsentPolish from './ServicesFlexConsentPolish'
export const metadata=postulaProductMetadata
export default function Layout({children}:{children:React.ReactNode}){return <>{children}<ServicesFlexConsentPolish/></>}
