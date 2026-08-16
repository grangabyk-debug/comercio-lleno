import GoogleExistingAccountGate from './GoogleExistingAccountGate'
import TrialConversionTracker from './TrialConversionTracker'

export const metadata = {
  title: 'Probá Comercio Lleno gratis por 14 días',
  description: 'Creá tu comercio en un solo paso y empezá una prueba gratuita de 14 días de Comercio Lleno.',
}

export default function FreeTrialPage() {
  return <>
    <TrialConversionTracker />
    <GoogleExistingAccountGate />
  </>
}
