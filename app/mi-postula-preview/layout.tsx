import {postulaProductMetadata} from '../postulaProductMetadata'
import SupportHelp from '../postula-preview/SupportHelp'
import '../postula-preview/support-help-v21.css'
import './account-readable-v35.css'

export const metadata=postulaProductMetadata

export default function Layout({children}:{children:React.ReactNode}){
 return <>{children}<SupportHelp audience="candidate"/></>
}
