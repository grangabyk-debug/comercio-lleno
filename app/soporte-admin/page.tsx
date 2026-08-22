import type {Metadata} from 'next'
import SupportAdminClient from './SupportAdminClient'
import './support-admin.css'

export const metadata:Metadata={title:{absolute:'Soporte | Postulá Mejor'},robots:{index:false,follow:false}}
export default function SupportAdminPage(){return <SupportAdminClient/>}
