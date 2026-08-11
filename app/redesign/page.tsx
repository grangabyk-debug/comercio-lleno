import CommerceApp from './CommerceApp'
import TrialStatus from './TrialStatus'
import OnboardingGuide from './OnboardingGuide'
import RedesignBrandOverlay from './RedesignBrandOverlay'
import HeaderRefreshBehavior from './HeaderRefreshBehavior'
import MobileResponsiveFix from './MobileResponsiveFix'

export const metadata = {
  title: 'Comercio Lleno · Rediseño POS',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default function RedesignPage() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || 'local'
  const buildVersion = sha === 'local' ? 'local' : sha.slice(0, 8)
  return <><HeaderRefreshBehavior/><MobileResponsiveFix/><RedesignBrandOverlay/><TrialStatus/><OnboardingGuide/><CommerceApp buildVersion={buildVersion}/></>
}
