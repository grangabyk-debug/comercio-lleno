import { redirect } from 'next/navigation'
import GoogleExistingAccountGate from './GoogleExistingAccountGate'
import TrialConversionTracker from './TrialConversionTracker'
import TrialClarityTracker from './TrialClarityTracker'

export const metadata = {
  title: 'Probá Comercio Lleno gratis por 14 días',
  description: 'Creá tu comercio en un solo paso y empezá una prueba gratuita de 14 días de Comercio Lleno.',
}

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function isGoogleAdsTraffic(params: SearchParams) {
  if (first(params.gclid) || first(params.gbraid) || first(params.wbraid)) return true

  const source = (first(params.utm_source) || '').toLowerCase()
  const medium = (first(params.utm_medium) || '').toLowerCase()
  return source === 'google' && ['cpc', 'ppc', 'paid', 'paid_search', 'search'].includes(medium)
}

function landingUrl(params: SearchParams) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach(item => query.append(key, item))
    else if (value) query.set(key, value)
  })
  query.set('utm_landing', 'main')
  const serialized = query.toString()
  return serialized ? `/?${serialized}` : '/'
}

export default async function FreeTrialPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams

  // Tráfico frío de Google Ads primero conoce el producto en la landing.
  // Los CTA internos de la landing siguen entrando directo al alta del trial.
  if (isGoogleAdsTraffic(params)) redirect(landingUrl(params))

  return <>
    <TrialConversionTracker />
    <TrialClarityTracker />
    <GoogleExistingAccountGate />
  </>
}
