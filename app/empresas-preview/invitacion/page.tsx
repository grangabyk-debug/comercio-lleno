import {Suspense} from 'react'
import InviteAccept from './InviteAccept'
import {PlatformHeader,PlatformFooter} from '../../postula-preview/PlatformChrome'
import '../../postula-preview/premium-v7.css'
export const metadata={title:'Invitación de empresa | Postulá Mejor',robots:{index:false,follow:false}}
export default function InvitePage(){return <main className="pm7-page pm7-employer"><PlatformHeader audience="employer"/><Suspense fallback={<div style={{padding:80}}>Cargando invitación…</div>}><InviteAccept/></Suspense><PlatformFooter/></main>}
