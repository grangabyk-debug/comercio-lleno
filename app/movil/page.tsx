import type { Metadata } from 'next'
import MobileSimpleApp from './MobileSimpleAppV2'
import MobileScanner from './MobileScanner'
import MobileAiAssistant from './MobileAiAssistant'
import MobilePcNotice from './MobilePcNotice'
import SaleSearchGuard from './SaleSearchGuard'
import SessionFetchGuard from '../redesign/SessionFetchGuard'
import SubscriptionGate from '../redesign/SubscriptionGate'

export const metadata: Metadata={title:'Comercio Lleno · Móvil',description:'Experiencia simple de Comercio Lleno para vender y consultar productos desde el celular',robots:{index:false,follow:false}}
export const dynamic='force-dynamic'
export default function MobilePage(){return <><SessionFetchGuard/><SaleSearchGuard/><SubscriptionGate/><MobileSimpleApp/><MobileScanner/><MobileAiAssistant/><MobilePcNotice/></>}
