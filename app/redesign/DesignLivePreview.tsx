'use client'

import { useEffect } from 'react'
import { readCachedDesignSettings, type DesignSettings } from '@/lib/comercio/design-settings'
import { readTenantSession } from '@/lib/comercio/session'

function normalized(value: DesignSettings): DesignSettings {
  return { ...value, colorTheme: 'emerald', fontFamily: value.fontFamily === 'rounded' ? 'modern' : value.fontFamily }
}

function applyDesign(value: DesignSettings) {
  const shell = document.querySelector('main[class*="shell"]') as HTMLElement | null
  if (!shell) return
  const next = normalized(value)
  shell.dataset.designColor = 'emerald'
  shell.dataset.designSize = next.fontSize
  shell.dataset.designWeight = next.fontWeight
  shell.dataset.designFont = next.fontFamily
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
  }
  return null
}

function cleanDesignPanel() {
  document.querySelectorAll('b').forEach(node => {
    if (node.textContent?.trim() !== 'Colores') return
    const block = node.parentElement?.parentElement as HTMLElement | null
    if (block) block.style.display = 'none'
  })

  document.querySelectorAll('button').forEach(button => {
    const text = button.textContent?.replace(/\s+/g, ' ').trim() || ''
    if (text.includes('Redondeada')) button.style.display = 'none'
  })

  document.querySelectorAll('span').forEach(node => {
    if (node.textContent?.trim() !== 'Vista previa') return
    const preview = node.parentElement as HTMLElement | null
    if (preview) preview.style.display = 'none'
  })
}

function savedBadge(show: boolean) {
  const saveButton = Array.from(document.querySelectorAll('button')).find(btn => (btn.textContent || '').includes('Guardar diseño'))
  const row = saveButton?.parentElement
  if (!row) return
  let badge = row.querySelector('[data-design-saved-badge]') as HTMLElement | null
  if (!show) { badge?.remove(); return }
  if (!badge) {
    badge = document.createElement('span')
    badge.setAttribute('data-design-saved-badge', '1')
    badge.style.display = 'inline-flex'
    badge.style.alignItems = 'center'
    badge.style.gap = '6px'
    badge.style.fontWeight = '800'
    badge.style.color = '#168a52'
    badge.style.marginLeft = '10px'
    row.appendChild(badge)
  }
  badge.textContent = '✓ Diseño guardado'
}

export default function DesignLivePreview() {
  useEffect(() => {
    const session = readTenantSession()
    if (!session) return
    let current = normalized(readCachedDesignSettings(session.companyId))
    applyDesign(current)
    cleanDesignPanel()

    const observer = new MutationObserver(() => cleanDesignPanel())
    observer.observe(document.body, { childList: true, subtree: true })

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null
      const button = target?.closest('button') as HTMLButtonElement | null
      if (!button) return
      const patch = patchFor(button)
      if (!patch) return
      current = normalized({ ...current, ...patch })
      savedBadge(false)
      applyDesign(current)
    }

    const onSaved = (event: Event) => {
      const next = (event as CustomEvent<DesignSettings>).detail
      if (!next) return
      current = normalized(next)
      applyDesign(current)
      cleanDesignPanel()
      savedBadge(true)
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

    main[class*="shell"] [class*="saleNav"] > span:first-child {
      position: relative !important;
      display: inline-grid !important;
      place-items: center !important;
      width: 34px !important;
      height: 34px !important;
      min-width: 34px !important;
      flex: 0 0 34px !important;
      border-radius: 999px !important;
      background: radial-gradient(circle at 31% 27%, #fff9cf 0 10%, #ffe77d 24%, #f1c23f 46%, #d99a18 68%, #9a6200 100%) !important;
      border: 2px solid #f5d66c !important;
      box-shadow: 0 0 0 2px rgba(255,215,82,.16), 0 7px 15px rgba(132,82,0,.32), inset 0 2px 2px rgba(255,255,255,.92), inset 0 -3px 4px rgba(112,67,0,.30) !important;
      color: transparent !important;
      font-size: 0 !important;
      overflow: hidden !important;
      transform: none !important;
      filter: saturate(1.12) contrast(1.04) !important;
      text-shadow: none !important;
    }
    main[class*="shell"] [class*="saleNav"] > span:first-child::before {
      content: "$" !important;
      position: relative !important;
      z-index: 2 !important;
      display: block !important;
      font-family: Arial, Helvetica, sans-serif !important;
      font-size: 20px !important;
      line-height: 1 !important;
      font-weight: 900 !important;
      color: #684000 !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.55) !important;
    }
    main[class*="shell"] [class*="saleNav"] > span:first-child::after {
      content: "" !important;
      display: block !important;
      position: absolute !important;
      z-index: 1 !important;
      top: 3px !important;
      left: 5px !important;
      width: 19px !important;
      height: 9px !important;
      border-radius: 999px !important;
      background: linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.08)) !important;
      pointer-events: none !important;
    }

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
    main[data-design-weight="strong"] textarea { font-weight: 900 !important; }
  `}</style>
}
