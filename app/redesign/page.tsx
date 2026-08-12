import CommerceApp from './CommerceApp'
import TrialStatus from './TrialStatus'
import OnboardingGuide from './OnboardingGuide'
import RedesignBrandOverlay from './RedesignBrandOverlay'
import HeaderRefreshBehavior from './HeaderRefreshBehavior'
import MobileResponsiveFix from './MobileResponsiveFix'
import ViewScrollReset from './ViewScrollReset'
import DesignRuntime from './DesignRuntime'
import DesignLivePreview from './DesignLivePreview'

export const metadata = {
  title: 'Comercio Lleno · Rediseño POS',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default function RedesignPage() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || 'local'
  const buildVersion = sha === 'local' ? 'local' : sha.slice(0, 8)
  return <><HeaderRefreshBehavior/><MobileResponsiveFix/><ViewScrollReset/><DesignRuntime/><DesignLivePreview/><RedesignBrandOverlay/><TrialStatus/><OnboardingGuide/><CommerceApp buildVersion={buildVersion}/></>
}
