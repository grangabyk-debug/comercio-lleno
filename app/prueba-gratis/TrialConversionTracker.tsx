'use client'

import { useEffect } from 'react'

const GOOGLE_ADS_SEND_TO = 'AW-18388928228/75vtCNf_9OIcEOSNw8BE'
const TRIAL_ENDPOINT_MARKERS = [
  '/functions/v1/start-trial-turnstile',
  '/functions/v1/start-trial-google',
  '/functions/v1/start-trial-simple',
  '/functions/v1/start-trial',
]
const CONSENT_STORAGE_KEY = 'cl_cookie_consent_v1'

type GoogleAdsWindow = Window & {
  gtag?: (...args: unknown[]) => void
}

function hasMarketingConsent() {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!stored) return false
    const parsed = JSON.parse(stored) as { marketing?: boolean }
    return parsed.marketing === true
  } catch {
    return false
  }
}

function fireRegistrationConversion(companyId: string) {
  if (!companyId || !hasMarketingConsent()) return

  const dedupeKey = `cl_google_ads_trial_registration_${companyId}`
  if (localStorage.getItem(dedupeKey) === '1') return

  const gtag = (window as GoogleAdsWindow).gtag
  if (typeof gtag !== 'function') return

  gtag('event', 'conversion', {
    send_to: GOOGLE_ADS_SEND_TO,
  })
  localStorage.setItem(dedupeKey, '1')
}

function requestUrl(input: RequestInfo | URL) {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.toString()
  return input.url
}

function isTrialCreationRequest(url: string) {
  return TRIAL_ENDPOINT_MARKERS.some((marker) => url.includes(marker))
}

export default function TrialConversionTracker() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window)

    window.fetch = async (...args) => {
      const response = await originalFetch(...args)

      try {
        const url = requestUrl(args[0])
        if (response.ok && isTrialCreationRequest(url)) {
          const data = await response.clone().json().catch(() => null)
          if (data?.ok === true && data?.company_id && data?.existing !== true) {
            fireRegistrationConversion(String(data.company_id))
          }
        }
      } catch {
        // La medición nunca debe interferir con el alta del comercio.
      }

      return response
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return null
}
