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

/*
 * Última capa responsiva del POS para notebooks y PCs con poca altura útil.
 * Va después de las capas de marca/legibilidad para que ningún tamaño global vuelva
 * a agrandar los controles y termine superponiendo medios de pago, efectivo y totales.
 */
const notebookWorkspaceHeadGuard = `
@media (min-width: 1051px) and (max-height: 840px) {
  main[class*="shell"] section[class*="workspace"] {
    height: calc(100dvh - 190px) !important;
    min-height: 460px !important;
    max-height: 610px !important;
    overflow: hidden !important;
  }

  main[class*="shell"] section[class*="workspace"] > [class*="workspaceHead"] {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
    padding-top: 9px !important;
    padding-bottom: 9px !important;
  }
  main[class*="shell"] section[class*="workspace"] > [class*="workspaceHead"] h2 {
    font-size: 17px !important;
    line-height: 1.1 !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="headTotal"] strong {
    font-size: 24px !important;
    line-height: 1 !important;
  }

  main[class*="shell"] section[class*="workspace"] > [class*="body"] {
    min-height: 0 !important;
    overflow: hidden !important;
    grid-template-columns: minmax(0, 1fr) minmax(360px, 420px) !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="cartPanel"] {
    min-height: 0 !important;
    overflow: hidden !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="cart"] {
    min-height: 0 !important;
    max-height: none !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }

  /* El panel de cobro mantiene flujo normal. Si la PC tiene aún menos alto, scrollea
     dentro del panel en vez de dibujar cajas una arriba de otra. */
  main[class*="shell"] section[class*="workspace"] [class*="controls"] {
    min-height: 0 !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    grid-auto-rows: max-content !important;
    align-content: start !important;
    padding: 8px 10px 10px !important;
    gap: 6px !important;
    scrollbar-gutter: stable !important;
    overscroll-behavior: contain !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="statusBanner"] {
    padding: 6px 8px !important;
    border-radius: 9px !important;
    font-size: 10.5px !important;
    line-height: 1.2 !important;
  }

  main[class*="shell"] section[class*="workspace"] [class*="tools"] {
    gap: 6px !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="tool"] {
    min-width: 0 !important;
    min-height: 40px !important;
    height: auto !important;
    padding: 8px 8px !important;
    border-radius: 10px !important;
    font-size: 11.5px !important;
    line-height: 1.1 !important;
  }

  main[class*="shell"] section[class*="workspace"] [class*="paymentLabel"] {
    margin: 0 !important;
    font-size: 10px !important;
    line-height: 1.1 !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="payments"] {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    grid-auto-rows: minmax(36px, auto) !important;
    gap: 5px !important;
    min-height: 0 !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="payments"] > [class*="payment"] {
    box-sizing: border-box !important;
    min-width: 0 !important;
    width: 100% !important;
    min-height: 36px !important;
    height: auto !important;
    padding: 7px 3px !important;
    border-radius: 9px !important;
    font-size: 11px !important;
    line-height: 1.1 !important;
    white-space: normal !important;
    overflow-wrap: anywhere !important;
  }

  main[class*="shell"] section[class*="workspace"] [class*="cashRow"] {
    position: relative !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 7px !important;
    align-items: end !important;
    min-height: 0 !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="cashRow"] label {
    min-width: 0 !important;
    gap: 3px !important;
    font-size: 10.5px !important;
    line-height: 1.15 !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="cashRow"] input {
    box-sizing: border-box !important;
    width: 100% !important;
    min-width: 0 !important;
    min-height: 37px !important;
    height: 37px !important;
    padding: 7px 9px !important;
    border-radius: 9px !important;
    font-size: 12px !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="change"] {
    box-sizing: border-box !important;
    min-width: 72px !important;
    min-height: 37px !important;
    padding: 5px 8px !important;
    border-radius: 9px !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="change"] span {
    font-size: 9px !important;
    line-height: 1 !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="change"] strong {
    font-size: 14px !important;
    line-height: 1.1 !important;
  }

  main[class*="shell"] section[class*="workspace"] [class*="checkoutBox"] {
    margin-top: 0 !important;
    padding: 8px 9px !important;
    gap: 5px !important;
    border-radius: 12px !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="totals"] {
    gap: 2px !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="summary"] {
    font-size: 10.5px !important;
    line-height: 1.15 !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="summary"] strong {
    font-size: 11.5px !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="grand"] {
    margin-top: 0 !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="grand"] span {
    font-size: 11.5px !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="grand"] strong {
    font-size: 24px !important;
    line-height: 1 !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="checkoutActions"] {
    gap: 6px !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="checkoutActions"] button {
    min-height: 43px !important;
    height: auto !important;
    padding: 8px 6px !important;
    border-radius: 10px !important;
    font-size: 12px !important;
    line-height: 1.1 !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="hint"] {
    display: none !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="cashClosed"] {
    padding: 7px 9px !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="openCashButton"] {
    min-height: 36px !important;
  }
}

/* En alturas extremas priorizamos que no exista ninguna superposición. */
@media (min-width: 1051px) and (max-height: 700px) {
  main[class*="shell"] section[class*="workspace"] {
    height: calc(100dvh - 168px) !important;
    min-height: 420px !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="controls"] {
    padding: 6px 8px 8px !important;
    gap: 5px !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="tool"] {
    min-height: 37px !important;
    padding: 7px 6px !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="payments"] {
    grid-auto-rows: minmax(33px, auto) !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="payments"] > [class*="payment"] {
    min-height: 33px !important;
    padding: 6px 2px !important;
    font-size: 10.5px !important;
  }
  main[class*="shell"] section[class*="workspace"] [class*="checkoutActions"] button {
    min-height: 40px !important;
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
    <style id="cl-notebook-workspace-head-guard">{notebookWorkspaceHeadGuard}</style>
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
    <CommerceApp buildVersion={buildVersion}/>
  </>
}
