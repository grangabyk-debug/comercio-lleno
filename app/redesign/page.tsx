import CommerceApp from './CommerceApp'
import TrialStatus from './TrialStatus'
import SubscriptionGate from './SubscriptionGate'
import AdminPauseGate from './AdminPauseGate'
import FirstStepsExperience from './FirstStepsExperience'
import HeaderRefreshBehavior from './HeaderRefreshBehavior'
import MobileResponsiveFix from './MobileResponsiveFix'
import AdaptiveViewportFix from './AdaptiveViewportFix'
import ViewScrollReset from './ViewScrollReset'
import DesignRuntime from './DesignRuntime'
import DesignLivePreview from './DesignLivePreview'
import ProductPermissionGuard from './ProductPermissionGuard'
import MobileVersionPrompt from './MobileVersionPrompt'
import SessionFetchGuard from './SessionFetchGuard'
import SimpleModeRuntime from './SimpleModeRuntime'
import SimpleModeDarkStyles from './SimpleModeDarkStyles'
import FinanceRuntime from './FinanceRuntime'
import BranchDataScopeRuntime from './BranchDataScopeRuntime'
import BranchTopbarRuntime from './BranchTopbarRuntime'
import BranchSettingsRuntime from './BranchSettingsRuntime'
import DashboardRevolutionTheme from './DashboardRevolutionTheme'
import TransientFiscalNoticeRuntime from './TransientFiscalNoticeRuntime'
import ReadabilityBoost from './ReadabilityBoost'
import PosBrandExperience from './PosBrandExperience'
import DarkExperiencePolish from './DarkExperiencePolish'
import AccessibilityScale from './AccessibilityScale'

const posLayoutGuard = `
/*
 * Guard estructural del POS.
 * Algunos estilos visuales usan selectores por substring (por ejemplo [class*="payment"]
 * y [class*="tool"]). Como los nombres CSS Modules de los contenedores también contienen
 * esas palabras (payments, paymentLabel, tools), podían heredar aspecto/tamaño de botón y
 * terminar desplazando o superponiendo el bloque de cobro. Estos resets sólo afectan la
 * estructura; no cambian lógica, datos ni acciones de venta.
 */
main[class*="shell"] [class*="tools"] {
  min-width: 0 !important;
  min-height: 0 !important;
  height: auto !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  transform: none !important;
  overflow: visible !important;
}
main[class*="shell"] [class*="paymentLabel"] {
  display: block !important;
  min-width: 0 !important;
  min-height: 0 !important;
  height: auto !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  transform: none !important;
}
main[class*="shell"] [class*="payments"] {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  grid-auto-rows: minmax(42px, auto) !important;
  align-items: stretch !important;
  min-width: 0 !important;
  min-height: 0 !important;
  width: 100% !important;
  height: auto !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  transform: none !important;
  overflow: visible !important;
}
main[class*="shell"] [class*="payments"] > button {
  position: static !important;
  width: 100% !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  transform: none;
}
main[class*="shell"] [class*="cashRow"],
main[class*="shell"] [class*="checkoutBox"] {
  position: static !important;
  min-width: 0 !important;
  height: auto !important;
  transform: none !important;
}
main[class*="shell"] [class*="cashRow"] label { min-width: 0 !important; }
main[class*="shell"] [class*="cashRow"] input { width: 100% !important; box-sizing: border-box !important; }

@media (min-width: 1051px) and (max-height: 840px) {
  main[class*="shell"] section[class*="workspace"] > [class*="workspaceHead"] {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
  }
  main[class*="shell"] [class*="controls"] {
    overflow-x: hidden !important;
    overflow-y: auto !important;
    grid-auto-rows: max-content !important;
    align-content: start !important;
    scrollbar-gutter: stable !important;
  }
}

@media (max-width: 760px) {
  main[class*="shell"] [class*="payments"] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
`

export const metadata={title:'Comercio Lleno · Rediseño POS',robots:{index:false,follow:false}}
export const dynamic='force-dynamic'

export default function RedesignPage(){
  const sha=process.env.VERCEL_GIT_COMMIT_SHA||process.env.GIT_COMMIT_SHA||'local'
  const buildVersion=sha==='local'?'local':sha.slice(0,8)
  return <>
    <DashboardRevolutionTheme/>
    <ReadabilityBoost/>
    <PosBrandExperience/>
    <DarkExperiencePolish/>
    <AccessibilityScale/>
    <TransientFiscalNoticeRuntime/>
    <BranchDataScopeRuntime/>
    <SessionFetchGuard/>
    <HeaderRefreshBehavior/>
    <MobileResponsiveFix/>
    <AdaptiveViewportFix/>
    <ViewScrollReset/>
    <DesignRuntime/>
    <DesignLivePreview/>
    <ProductPermissionGuard/>
    <MobileVersionPrompt/>
    <AdminPauseGate/>
    <SubscriptionGate/>
    <TrialStatus/>
    <FirstStepsExperience/>
    <SimpleModeDarkStyles/>
    <SimpleModeRuntime/>
    <FinanceRuntime/>
    <BranchTopbarRuntime/>
    <BranchSettingsRuntime/>
    <style id="cl-pos-layout-guard">{posLayoutGuard}</style>
    <CommerceApp buildVersion={buildVersion}/>
  </>
}
