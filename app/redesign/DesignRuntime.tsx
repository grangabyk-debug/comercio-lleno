'use client'

import { useEffect } from 'react'
import { loadDesignSettings, readCachedDesignSettings, type DesignSettings } from '@/lib/comercio/design-settings'
import { readTenantSession } from '@/lib/comercio/session'

function applyDesign(value: DesignSettings) {
  const shell = document.querySelector('main[class*="shell"]') as HTMLElement | null
  if (!shell) return false
  shell.dataset.designColor = value.colorTheme
  shell.dataset.designSize = value.fontSize
  shell.dataset.designWeight = value.fontWeight
  shell.dataset.designFont = value.fontFamily
  return true
}

export default function DesignRuntime() {
  useEffect(() => {
    const session = readTenantSession()
    if (!session) return

    let stopped = false
    let frame = 0
    const cached = readCachedDesignSettings(session.companyId)

    const applyWhenReady = (value: DesignSettings) => {
      const run = () => {
        if (stopped) return
        if (!applyDesign(value)) frame = window.requestAnimationFrame(run)
      }
      run()
    }

    applyWhenReady(cached)
    void loadDesignSettings(session).then(value => {
      if (!stopped) applyWhenReady(value)
    }).catch(() => {})

    const onDesign = (event: Event) => {
      const next = (event as CustomEvent<DesignSettings>).detail
      if (next) applyWhenReady(next)
    }
    window.addEventListener('comercio:design-settings', onDesign)

    return () => {
      stopped = true
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('comercio:design-settings', onDesign)
    }
  }, [])

  return null
}
