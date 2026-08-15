'use client'

import { useEffect } from 'react'
import { cacheSalesSettings, readCachedSalesSettings, saveSalesSettings } from '@/lib/comercio/sales-settings'
import { readTenantSession } from '@/lib/comercio/session'

function isAllowWithoutStockToggle(target: EventTarget | null) {
  if (!(target instanceof HTMLInputElement) || target.type !== 'checkbox') return false
  const label = target.closest('label')
  return Boolean(label?.textContent?.toLowerCase().includes('permitir vender sin stock'))
}

export default function SalesSettingsLiveRuntime() {
  useEffect(() => {
    let saveSequence = 0
    const handleChange = (event: Event) => {
      if (!isAllowWithoutStockToggle(event.target)) return
      const input = event.target as HTMLInputElement
      const session = readTenantSession()
      if (!session) return

      const previous = readCachedSalesSettings(session.companyId)
      const next = { ...previous, allowNegativeStock: input.checked }
      cacheSalesSettings(session.companyId, next)
      window.dispatchEvent(new CustomEvent('comercio:sales-settings', { detail: next }))

      const currentSequence = ++saveSequence
      void saveSalesSettings(session, next).catch(error => {
        if (currentSequence !== saveSequence) return
        cacheSalesSettings(session.companyId, previous)
        window.dispatchEvent(new CustomEvent('comercio:sales-settings', { detail: previous }))
        console.error('No se pudo guardar Permitir vender sin stock', error)
      })
    }

    document.addEventListener('change', handleChange, true)
    return () => document.removeEventListener('change', handleChange, true)
  }, [])

  return null
}
