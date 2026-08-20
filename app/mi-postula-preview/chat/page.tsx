import CandidateChat from './CandidateChat'
import '../../postula-preview/premium-v7.css'
import './chat.css'

export const metadata={title:{absolute:'Mensajes | Postulá Mejor'},description:'Conversaciones privadas asociadas a tus postulaciones en Postulá Mejor.',robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/mensajes'}}
export default function CandidateChatPage(){return <CandidateChat/>}
