import type { Metadata } from 'next'
import MobileSimpleApp from './MobileSimpleAppV2'
import MobileScanner from './MobileScanner'
import MobileAiAssistant from './MobileAiAssistant'
import MobileSupportChat from './MobileSupportChat'
import MobileCashModeController from './MobileCashModeControllerV3'
import MobileCashDailyAccess from './MobileCashDailyAccess'
import MobileSaleUiFix from './MobileSaleUiFix'
import MobileSettingsOverlay from './MobileSettingsOverlay'
import MobileLegalLinks from './MobileLegalLinks'
import MobileRevolutionTheme from './MobileRevolutionTheme'
import MobileDarkTheme from './MobileDarkTheme'
import MobileBrandHeaderOverride from './MobileBrandHeaderOverride'
import MobileGoogleAccess from './MobileGoogleAccess'
import MobileArcaStatus from './MobileArcaStatus'
import MobilePermissionsGate from './MobilePermissionsGate'
import MobileProductionSalesBridge from './MobileProductionSalesBridgeV2'
import MobileProductionUxFixes from './MobileProductionUxFixes'
import MobilePwaInstallBridge from './MobilePwaInstallBridge'
import SaleSearchGuard from './SaleSearchGuard'
import SessionFetchGuard from '../redesign/SessionFetchGuard'
import SubscriptionGate from '../redesign/SubscriptionGate'
import './mobile-modern-v4.css'

export const metadata: Metadata={
  title:'Comercio Lleno · Móvil',
  description:'Experiencia simple de Comercio Lleno para vender y consultar productos desde el celular',
  manifest:'/manifest-v2.webmanifest',
  robots:{index:false,follow:false},
}
export const dynamic='force-dynamic'

const pwaInstallCapture=`
(function(){
  if(window.__clPwaCaptureReady)return;
  window.__clPwaCaptureReady=true;
  window.addEventListener('beforeinstallprompt',function(event){
    event.preventDefault();
    window.__clInstallPrompt=event;
    window.dispatchEvent(new Event('comercio:pwa-install-ready'));
  });
  window.addEventListener('appinstalled',function(){
    window.__clInstallPrompt=null;
    window.__clInstallInstalled=true;
    window.dispatchEvent(new Event('comercio:pwa-installed'));
  });
})();`

export default function MobilePage(){
  return <>
    <script id="cl-pwa-install-capture" dangerouslySetInnerHTML={{__html:pwaInstallCapture}}/>
    <MobileRevolutionTheme/>
    <MobileDarkTheme/>
    <SessionFetchGuard/>
    <SaleSearchGuard/>
    <SubscriptionGate/>
    <MobileSimpleApp/>
    <MobileProductionSalesBridge/>
    <MobileProductionUxFixes/>
    <MobilePwaInstallBridge/>
    <MobileArcaStatus/>
    <MobileGoogleAccess/>
    <MobileBrandHeaderOverride/>
    <MobileCashModeController/>
    <MobileCashDailyAccess/>
    <MobileScanner/>
    <MobileAiAssistant/>
    <MobileSaleUiFix/>
    <MobileSupportChat/>
    <MobileSettingsOverlay/>
    <MobileLegalLinks/>
    <MobilePermissionsGate/>
  </>
}
