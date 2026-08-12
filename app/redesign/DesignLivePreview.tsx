'use client'

import { useEffect } from 'react'
import { readCachedDesignSettings, type DesignSettings } from '@/lib/comercio/design-settings'
import { readTenantSession } from '@/lib/comercio/session'

function applyDesign(value: DesignSettings) {
  const shell = document.querySelector('main[class*="shell"]') as HTMLElement | null
  if (!shell) return
  // La identidad de Comercio Lleno siempre conserva el verde de marca.
  shell.dataset.designColor = 'emerald'
  shell.dataset.designSize = value.fontSize
  shell.dataset.designWeight = value.fontWeight
  shell.dataset.designFont = value.fontFamily
}

function patchFor(button: HTMLButtonElement): Partial<DesignSettings> | null {
  const block = button.parentElement?.parentElement
  const heading = block?.querySelector('b')?.textContent?.trim() || ''
  const text = (button.textContent || '').replace(/\s+/g, ' ').trim()

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

function hideColorOption() {
  document.querySelectorAll('b').forEach(node => {
    if (node.textContent?.trim() !== 'Colores') return
    const block = node.parentElement?.parentElement as HTMLElement | null
    if (block) block.style.display = 'none'
  })
}

export default function DesignLivePreview() {
  useEffect(() => {
    const session = readTenantSession()
    if (!session) return
    let current = readCachedDesignSettings(session.companyId)
    applyDesign(current)
    hideColorOption()

    const observer = new MutationObserver(() => hideColorOption())
    observer.observe(document.body, { childList: true, subtree: true })

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null
      const button = target?.closest('button') as HTMLButtonElement | null
      if (!button) return
      const patch = patchFor(button)
      if (!patch) return
      current = { ...current, ...patch, colorTheme: 'emerald' }
      applyDesign(current)
    }

    const onSaved = (event: Event) => {
      const next = (event as CustomEvent<DesignSettings>).detail
      if (!next) return
      current = { ...next, colorTheme: 'emerald' }
      applyDesign(current)
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener('comercio:design-settings', onSaved)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('comercio:design-settings', onSaved)
    }
  }, [])

  return <style>{`
    main[class*="shell"] [class*="saleNav"] {
      text-transform: uppercase !important;
      letter-spacing: .45px !important;
    }

    /* Moneda real dibujada como SVG: se ve igual en Windows y cualquier navegador. */
    main[class*="shell"] [class*="saleNav"] > span:first-child {
      font-size: 0 !important;
      color: transparent !important;
      background-color: transparent !important;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3CradialGradient id='g' cx='32%25' cy='25%25' r='72%25'%3E%3Cstop offset='0' stop-color='%23fff8bd'/%3E%3Cstop offset='.28' stop-color='%23ffd85c'/%3E%3Cstop offset='.62' stop-color='%23d99a18'/%3E%3Cstop offset='1' stop-color='%238b5600'/%3E%3C/radialGradient%3E%3ClinearGradient id='shine' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%23ffffff' stop-opacity='.9'/%3E%3Cstop offset='.5' stop-color='%23ffffff' stop-opacity='0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='32' cy='32' r='28' fill='url(%23g)' stroke='%23f7d86a' stroke-width='3'/%3E%3Ccircle cx='32' cy='32' r='21' fill='none' stroke='%23a86c00' stroke-opacity='.55' stroke-width='2'/%3E%3Cpath d='M16 17c9-8 21-10 31-4' fill='none' stroke='url(%23shine)' stroke-width='4' stroke-linecap='round'/%3E%3Ctext x='32' y='42' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-size='29' font-weight='900' fill='%23633b00'%3E$%3C/text%3E%3C/svg%3E") !important;
      background-repeat: no-repeat !important;
      background-position: center !important;
      background-size: 100% 100% !important;
      border: 0 !important;
      border-radius: 50% !important;
      box-shadow: 0 0 0 2px rgba(255,213,76,.20), 0 7px 16px rgba(145,91,0,.35) !important;
      transform: scale(1.12);
      filter: saturate(1.08) contrast(1.03);
    }
    main[class*="shell"] [class*="saleNav"] > span:first-child:after { display:none !important; }

    /* El modo Fuerte tiene que ser claramente perceptible. */
    main[data-design-weight="strong"] h1,
    main[data-design-weight="strong"] h2,
    main[data-design-weight="strong"] h3,
    main[data-design-weight="strong"] h4,
    main[data-design-weight="strong"] b,
    main[data-design-weight="strong"] strong,
    main[data-design-weight="strong"] button,
    main[data-design-weight="strong"] label,
    main[data-design-weight="strong"] p,
    main[data-design-weight="strong"] small,
    main[data-design-weight="strong"] section span,
    main[data-design-weight="strong"] td,
    main[data-design-weight="strong"] th,
    main[data-design-weight="strong"] input,
    main[data-design-weight="strong"] select,
    main[data-design-weight="strong"] textarea {
      font-weight: 900 !important;
    }
  `}</style>
}
