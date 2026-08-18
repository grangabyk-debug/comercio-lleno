import type { Metadata } from 'next'
import MobileSimpleApp from './MobileSimpleAppV2'
import MobileScanner from './MobileScanner'
import MobileAiAssistant from './MobileAiAssistant'
import MobileSupportChat from './MobileSupportChat'
import MobilePcNotice from './MobilePcNotice'
import MobileCashModeController from './MobileCashModeController'
import MobileCashDailyAccess from './MobileCashDailyAccess'
import MobileSettingsOverlay from './MobileSettingsOverlay'
import MobileLegalLinks from './MobileLegalLinks'
import MobileRevolutionTheme from './MobileRevolutionTheme'
import MobileDarkTheme from './MobileDarkTheme'
import MobileBrandHeaderOverride from './MobileBrandHeaderOverride'
import MobileGoogleAccess from './MobileGoogleAccess'
import MobileArcaStatus from './MobileArcaStatus'
import MobilePermissionsGate from './MobilePermissionsGate'
import MobileProductionSalesBridge from './MobileProductionSalesBridgeV2'
import SaleSearchGuard from './SaleSearchGuard'
import SessionFetchGuard from '../redesign/SessionFetchGuard'
import SubscriptionGate from '../redesign/SubscriptionGate'
import './mobile-modern-v4.css'

export const metadata: Metadata={
  title:'Comercio Lleno · Móvil',
  description:'Experiencia simple de Comercio Lleno para vender y consultar productos desde el celular',
  robots:{index:false,follow:false},
}
export const dynamic='force-dynamic'

export default function MobilePage(){
  return <>
    <MobileRevolutionTheme/>
    <MobileDarkTheme/>
    <SessionFetchGuard/>
    <SaleSearchGuard/>
    <SubscriptionGate/>
    <MobileSimpleApp/>
    <MobileProductionSalesBridge/>
    <MobileArcaStatus/>
    <MobileGoogleAccess/>
    <MobileBrandHeaderOverride/>
    <MobileCashModeController/>
    <MobileCashDailyAccess/>
    <MobileScanner/>
    <MobileAiAssistant/>
    <MobileSupportChat/>
    <MobilePcNotice/>
    <MobileSettingsOverlay/>
    <MobileLegalLinks/>
    <MobilePermissionsGate/>
  </>
}
