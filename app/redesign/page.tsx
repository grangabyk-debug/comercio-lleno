import CommerceApp from './CommerceApp'
import TrialStatus from './TrialStatus'
import OnboardingGuide from './OnboardingGuide'
import RedesignBrandOverlay from './RedesignBrandOverlay'
import HeaderRefreshBehavior from './HeaderRefreshBehavior'
import MobileResponsiveFix from './MobileResponsiveFix'
import ViewScrollReset from './ViewScrollReset'
import DesignRuntime from './DesignRuntime'
import DesignLivePreview from './DesignLivePreview'
import ProductPermissionGuard from './ProductPermissionGuard'
import MobileVersionPrompt from './MobileVersionPrompt'
import SessionFetchGuard from './SessionFetchGuard'
import SimpleModeRuntime from './SimpleModeRuntime'
import FinanceRuntime from './FinanceRuntime'

export const metadata={title:'Comercio Lleno · Rediseño POS',robots:{index:false,follow:false}}
export const dynamic='force-dynamic'
export default function RedesignPage(){const sha=process.env.VERCEL_GIT_COMMIT_SHA||process.env.GIT_COMMIT_SHA||'local',buildVersion=sha==='local'?'local':sha.slice(0,8);return <><SessionFetchGuard/><HeaderRefreshBehavior/><MobileResponsiveFix/><ViewScrollReset/><DesignRuntime/><DesignLivePreview/><ProductPermissionGuard/><MobileVersionPrompt/><RedesignBrandOverlay/><TrialStatus/><OnboardingGuide/><SimpleModeRuntime/><FinanceRuntime/><CommerceApp buildVersion={buildVersion}/></>}
