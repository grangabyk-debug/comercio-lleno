import TrialSignup from './TrialSignup'
import './trial-mobile-polish.css'

export const metadata = {
  title: 'Probá Comercio Lleno gratis por 14 días',
  description: 'Creá tu comercio y empezá una prueba gratuita de 14 días de Comercio Lleno.',
}

export default function FreeTrialPage() {
  return <div className="cl-trial-v2"><TrialSignup /></div>
}
