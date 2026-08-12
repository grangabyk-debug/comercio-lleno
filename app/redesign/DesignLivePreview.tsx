'use client'

import { useEffect } from 'react'
import { readCachedDesignSettings, type DesignSettings } from '@/lib/comercio/design-settings'
import { readTenantSession } from '@/lib/comercio/session'

function applyDesign(value: DesignSettings) {
  const shell = document.querySelector('main[class*="shell"]') as HTMLElement | null
  if (!shell) return
  shell.dataset.designColor = value.colorTheme
  shell.dataset.designSize = value.fontSize
  shell.dataset.designWeight = value.fontWeight
  shell.dataset.designFont = value.fontFamily
}

function patchFor(button: HTMLButtonElement): Partial<DesignSettings> | null {
  const block = button.parentElement?.parentElement
  const heading = block?.querySelector('b')?.textContent?.trim() || ''
  const text = (button.textContent || '').replace(/\s+/g, ' ').trim()

  if (heading === 'Colores') {
    if (text.includes('Esmeralda')) return { colorTheme: 'emerald' }
    if (text.includes('Azul petróleo')) return { colorTheme: 'ocean' }
    if (text.includes('Grafito')) return { colorTheme: 'graphite' }
  }
  if (heading === 'Tamaño de texto') {
    if (text.includes('Compacto')) return { fontSize: 'compact' }
    if (text.includes('Equilibrado')) return { fontSize: 'standard' }
    if (text.includes('Grande')) return { fontSize: 'large' }
  }
  if (heading === 'Grosor de letras') {
    if (text.includes('Suave')) return { fontWeight: 'soft' }
    if (text.includes('Equilibrado')) return { fontWeight: 'balanced' }
    if (text.includes('Fuerte')) return { fontWeight: 'strong' }
  }
  if (heading === 'Tipografía') {
    if (text.includes('Moderna')) return { fontFamily: 'modern' }
    if (text.includes('Clásica')) return { fontFamily: 'classic' }
    if (text.includes('Redondeada')) return { fontFamily: 'rounded' }
  }
  return null
}

export default function DesignLivePreview() {
  useEffect(() => {
    const session = readTenantSession()
    if (!session) return
    let current = readCachedDesignSettings(session.companyId)

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null
      const button = target?.closest('button') as HTMLButtonElement | null
      if (!button) return
      const patch = patchFor(button)
      if (!patch) return
      current = { ...current, ...patch }
      applyDesign(current)
    }

    const onSaved = (event: Event) => {
      const next = (event as CustomEvent<DesignSettings>).detail
      if (!next) return
      current = next
      applyDesign(next)
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener('comercio:design-settings', onSaved)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('comercio:design-settings', onSaved)
    }
  }, [])

  return <style>{`
    main[class*="shell"] [class*="saleNav"] {
      text-transform: uppercase !important;
      letter-spacing: .45px !important;
    }
    main[class*="shell"] [class*="saleNav"] > span:first-child {
      background: radial-gradient(circle at 32% 25%, #fffbd8 0 13%, #ffe676 26%, #efbd35 55%, #bb7b08 82%, #8a5600 100%) !important;
      border: 1px solid #f6d76a !important;
      color: #6d4300 !important;
      box-shadow: 0 0 0 2px rgba(255,213,76,.18), 0 7px 15px rgba(145,91,0,.32), inset 0 2px 2px rgba(255,255,255,.9), inset 0 -2px 3px rgba(120,69,0,.28) !important;
      transform: scale(1.08);
      filter: saturate(1.18) contrast(1.04);
    }
    main[class*="shell"] [class*="saleNav"] > span:first-child:after {
      background: linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,0)) !important;
    }
  `}</style>
}
