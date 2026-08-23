'use client'

import { useEffect, useRef } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function cleanText(node: Element | null) {
  return (node?.textContent || '').replace(/\s+/g, ' ').trim()
}

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

function standaloneMode() {
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia?.('(display-mode: standalone)').matches || nav.standalone === true
}

export default function MobileProductionUxFixes() {
  const installPromptRef = useRef<InstallPromptEvent | null>(null)
  const saleScanPendingRef = useRef(false)

  useEffect(() => {
    let disposed = false
    const timers = new Set<number>()

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id)
        if (!disposed) fn()
      }, ms)
      timers.add(id)
    }

    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
    }

    function saleSection() {
      const heading = Array.from(document.querySelectorAll('h2')).find(node => cleanText(node) === 'Nueva venta')
      return heading?.closest('section') as HTMLElement | null
    }

    function fixBottomDock() {
      const nav = document.querySelector('nav[class*="bottomNav"]') as HTMLElement | null
      if (!nav) return
      const viewport = window.visualViewport
      const obscuredBottom = viewport ? Math.max(0, window.innerHeight - (viewport.height + viewport.offsetTop)) : 0
      const bottom = Math.max(10, Math.round(obscuredBottom + 8))
      nav.style.setProperty('position', 'fixed', 'important')
      nav.style.setProperty('left', '50%', 'important')
      nav.style.setProperty('right', 'auto', 'important')
      nav.style.setProperty('bottom', `${bottom}px`, 'important')
      nav.style.setProperty('transform', 'translate3d(-50%,0,0)', 'important')
      nav.style.setProperty('z-index', '9000', 'important')
      nav.style.setProperty('visibility', 'visible', 'important')
      nav.style.setProperty('opacity', '1', 'important')
      nav.style.setProperty('pointer-events', 'auto', 'important')
      nav.style.setProperty('will-change', 'transform,bottom', 'important')
      const shell = nav.closest('[class*="phoneShell"]') as HTMLElement | null
      shell?.style.setProperty('overflow', 'visible', 'important')
    }

    function injectSaleScannerButton() {
      const section = saleSection()
      if (!section) return
      const search = section.querySelector('[class*="searchBox"]') as HTMLElement | null
      if (!search || search.querySelector('[data-mobile-sale-scanner="1"]')) return
      const input = search.querySelector('input') as HTMLInputElement | null
      if (!input) return
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.mobileSaleScanner = '1'
      button.setAttribute('aria-label', 'Escanear código de barras para agregar a la venta')
      button.title = 'Escanear código de barras'
      button.innerHTML = '<span aria-hidden="true">▣</span>'
      button.style.cssText = 'flex:0 0 44px;width:44px;height:44px;border:1px solid rgba(109,54,216,.18);border-radius:13px;background:linear-gradient(145deg,#f2ebff,#fff);color:#6d36d8;display:grid;place-items:center;font-size:21px;font-weight:900;box-shadow:0 7px 18px rgba(73,43,93,.08);cursor:pointer;padding:0;'
      search.appendChild(button)
    }

    function addScannedProduct(name: string) {
      const section = saleSection()
      if (!section || !name) return
      const input = section.querySelector('[class*="searchBox"] input') as HTMLInputElement | null
      if (!input) return
      setInputValue(input, name)
      let attempts = 0
      const tryAdd = () => {
        const current = saleSection()
        if (!current) return
        const buttons = Array.from(current.querySelectorAll('button[class*="productItem"]')) as HTMLButtonElement[]
        const match = buttons.find(button => cleanText(button.querySelector('b')).toLowerCase() === name.trim().toLowerCase())
        if (match) {
          match.click()
          later(() => {
            const liveInput = saleSection()?.querySelector('[class*="searchBox"] input') as HTMLInputElement | null
            if (liveInput) setInputValue(liveInput, '')
          }, 90)
          return
        }
        attempts += 1
        if (attempts < 12) later(tryAdd, 70)
      }
      later(tryAdd, 60)
    }

    function consumeScannerResult() {
      if (!saleScanPendingRef.current) return
      const found = Array.from(document.querySelectorAll('span')).find(node => cleanText(node) === 'PRODUCTO ENCONTRADO')
      if (!found) return
      const result = found.parentElement
      const name = cleanText(result?.querySelector('h3') || null)
      if (!name) return
      saleScanPendingRef.current = false
      const sheet = found.closest('[class*="sheet"]')
      const close = sheet?.querySelector('[class*="head"] button') as HTMLButtonElement | null
      close?.click()
      later(() => addScannedProduct(name), 100)
    }

    function injectInstallButton() {
      const heading = Array.from(document.querySelectorAll('h2')).find(node => cleanText(node) === 'Aplicación')
      const card = heading?.closest('section') as HTMLElement | null
      if (!card) return
      const grid = card.querySelector('[class*="actionGrid"]') as HTMLElement | null
      if (!grid) return
      let button = grid.querySelector('[data-pwa-install="1"]') as HTMLButtonElement | null
      if (!button) {
        button = document.createElement('button')
        button.type = 'button'
        button.dataset.pwaInstall = '1'
        grid.appendChild(button)
      }
      const installed = standaloneMode()
      button.disabled = installed
      button.textContent = installed ? 'Aplicación instalada' : installPromptRef.current ? 'Instalar Comercio Lleno' : 'Agregar a pantalla principal'
      button.title = installed ? 'Comercio Lleno ya está instalado en este teléfono.' : 'Instalar la aplicación web de Comercio Lleno en el teléfono.'
      button.style.fontWeight = '900'
    }

    function sync() {
      fixBottomDock()
      injectSaleScannerButton()
      consumeScannerResult()
      injectInstallButton()
    }

    const beforeInstall = (event: Event) => {
      event.preventDefault()
      installPromptRef.current = event as InstallPromptEvent
      sync()
    }

    const appInstalled = () => {
      installPromptRef.current = null
      sync()
    }

    const click = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      const scan = target.closest('button[data-mobile-sale-scanner="1"]') as HTMLButtonElement | null
      if (scan) {
        event.preventDefault()
        event.stopPropagation()
        saleScanPendingRef.current = true
        const fab = document.querySelector('button[aria-label="Escanear producto"]') as HTMLButtonElement | null
        if (!fab) {
          saleScanPendingRef.current = false
          window.alert('El escáner está desactivado. Activá “Escáner con cámara” desde Configuración → Funciones móviles.')
          return
        }
        fab.click()
        return
      }

      if (saleScanPendingRef.current) {
        const sheet = target.closest('[class*="sheet"]')
        const headClose = target.closest('[class*="head"] button')
        if (sheet && headClose && cleanText(sheet).includes('Escáner de productos')) saleScanPendingRef.current = false
      }

      const install = target.closest('button[data-pwa-install="1"]') as HTMLButtonElement | null
      if (!install || install.disabled) return
      event.preventDefault()
      event.stopPropagation()
      const prompt = installPromptRef.current
      if (prompt) {
        installPromptRef.current = null
        try {
          await prompt.prompt()
          await prompt.userChoice.catch(() => null)
        } catch {}
        sync()
        return
      }

      const ua = navigator.userAgent
      if (/iphone|ipad|ipod/i.test(ua)) {
        window.alert('En iPhone/iPad: tocá Compartir y elegí “Agregar a pantalla de inicio”.')
      } else {
        window.alert('En Chrome: tocá el menú ⋮ y elegí “Instalar aplicación” o “Agregar a pantalla principal”. Si acabás de habilitar la app, cerrá y volvé a abrir esta pantalla y probá de nuevo.')
      }
    }

    window.addEventListener('beforeinstallprompt', beforeInstall)
    window.addEventListener('appinstalled', appInstalled)
    document.addEventListener('click', click, true)

    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })

    const viewport = window.visualViewport
    viewport?.addEventListener('resize', sync)
    viewport?.addEventListener('scroll', sync)
    window.addEventListener('resize', sync)
    window.addEventListener('scroll', sync, { passive: true })

    sync()

    return () => {
      disposed = true
      timers.forEach(id => window.clearTimeout(id))
      timers.clear()
      observer.disconnect()
      window.removeEventListener('beforeinstallprompt', beforeInstall)
      window.removeEventListener('appinstalled', appInstalled)
      document.removeEventListener('click', click, true)
      viewport?.removeEventListener('resize', sync)
      viewport?.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      window.removeEventListener('scroll', sync)
    }
  }, [])

  return null
}
