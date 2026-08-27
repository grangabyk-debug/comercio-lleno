import {redirect} from 'next/navigation'

export const metadata={title:{absolute:'Empresa y configuración | Postulá Mejor'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/empresas/panel'}}
export default function SettingsPage(){redirect('/empresas/panel?tab=empresa')}
