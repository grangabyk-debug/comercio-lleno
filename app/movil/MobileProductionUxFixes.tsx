'use client'

import { useEffect, useRef } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type InstallWindow = Window & {
  __clInstallPrompt?: InstallPromptEvent | null
  __clInstallInstalled?: boolean
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
    let syncFrame = 0
    const timers = new Set<number>()
    const installWindow = window as InstallWindow

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id)
        if (!disposed) fn()
      }, ms)
      timers.add(id)
    }

    function capturedPrompt() {
      const prompt = installWindow.__clInstallPrompt || null
      if (prompt) installPromptRef.current = prompt
      return installPromptRef.current
    }

    if (installWindow.__clInstallPrompt) installPromptRef.current = installWindow.__clInstallPrompt

    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(() => navigator.serviceWorker.ready).then(() => scheduleSync()).catch(() => {})
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

    function installLabel() {
      if (standaloneMode()) return 'Comercio Lleno instalado'
      return 'Instalar Comercio Lleno'
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
      const label = installLabel()
      const title = installed ? 'Comercio Lleno ya está instalado en este teléfono.' : 'Instalar Comercio Lleno como aplicación en este teléfono.'
      if (button.disabled !== installed) button.disabled = installed
      if (button.textContent !== label) button.textContent = label
      if (button.title !== title) button.title = title
      if (button.style.fontWeight !== '900') button.style.fontWeight = '900'
    }

    function removeReadyInstallButton() {
      document.querySelector('[data-pwa-ready-install="1"]')?.remove()
    }

    function injectReadyInstallButton() {
      if (standaloneMode()) {
        removeReadyInstallButton()
        return
      }
      if (sessionStorage.getItem('cl_pwa_install_pending') !== '1' || !capturedPrompt()) return
      if (document.querySelector('[data-pwa-ready-install="1"]')) return
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.pwaReadyInstall = '1'
      button.dataset.pwaInstall = '1'
      button.textContent = '↓ Instalar Comercio Lleno'
      button.setAttribute('aria-label', 'Instalar Comercio Lleno')
      button.style.cssText = 'position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:10050;width:min(calc(100% - 28px),470px);min-height:54px;padding:12px 18px;border:0;border-radius:16px;background:linear-gradient(100deg,#6d36d8,#ff641d);color:white;font:900 15px/1.1 Inter,system-ui,sans-serif;box-shadow:0 16px 36px rgba(50,28,62,.28);cursor:pointer;'
      document.body.appendChild(button)
    }

    function sync() {
      fixBottomDock()
      injectSaleScannerButton()
      consumeScannerResult()
      injectInstallButton()
      injectReadyInstallButton()
    }

    function scheduleSync() {
      if (disposed || syncFrame) return
      syncFrame = window.requestAnimationFrame(() => {
        syncFrame = 0
        if (!disposed) sync()
      })
    }

    function rememberPrompt(event: Event) {
      event.preventDefault()
      const prompt = event as InstallPromptEvent
      installPromptRef.current = prompt
      installWindow.__clInstallPrompt = prompt
      scheduleSync()
    }

    const beforeInstall = (event: Event) => rememberPrompt(event)
    const earlyInstallReady = () => {
      capturedPrompt()
      scheduleSync()
    }
    const appInstalled = () => {
      installPromptRef.current = null
      installWindow.__clInstallPrompt = null
      sessionStorage.removeItem('cl_pwa_install_pending')
      sessionStorage.removeItem('cl_pwa_install_refreshed')
      removeReadyInstallButton()
      scheduleSync()
    }

    async function runNativeInstall(prompt: InstallPromptEvent) {
      installPromptRef.current = null
      installWindow.__clInstallPrompt = null
      sessionStorage.removeItem('cl_pwa_install_pending')
      removeReadyInstallButton()
      try {
        await prompt.prompt()
        await prompt.userChoice.catch(() => null)
      } catch {}
      scheduleSync()
    }

    async function waitForPrompt(ms: number) {
      const existing = capturedPrompt()
      if (existing) return existing
      return await new Promise<InstallPromptEvent | null>(resolve => {
        let done = false
        const finish = (value: InstallPromptEvent | null) => {
          if (done) return
          done = true
          window.removeEventListener('comercio:pwa-install-ready', onReady)
          window.clearTimeout(timeout)
          resolve(value)
        }
        const onReady = () => finish(capturedPrompt())
        const timeout = window.setTimeout(() => finish(capturedPrompt()), ms)
        window.addEventListener('comercio:pwa-install-ready', onReady, { once: true })
      })
    }

    async function prepareInstallation() {
      let prompt = capturedPrompt()
      if (prompt) {
        await runNativeInstall(prompt)
        return
      }

      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js', { scope: '/' })
          await Promise.race([
            navigator.serviceWorker.ready,
            new Promise(resolve => window.setTimeout(resolve, 900)),
          ])
        } catch {}
      }

      prompt = await waitForPrompt(900)
      if (prompt) {
        await runNativeInstall(prompt)
        return
      }

      if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
        window.alert('En iPhone/iPad, Apple no permite abrir el instalador desde un botón web. Tocá Compartir y luego “Agregar a pantalla de inicio”.')
        return
      }

      if (sessionStorage.getItem('cl_pwa_install_refreshed') !== '1') {
        sessionStorage.setItem('cl_pwa_install_pending', '1')
        sessionStorage.setItem('cl_pwa_install_refreshed', '1')
        window.location.reload()
        return
      }

      sessionStorage.setItem('cl_pwa_install_pending', '1')
      window.alert('Chrome todavía no habilitó el instalador automático. Cerrá esta pestaña, volvé a entrar a Comercio Lleno y vas a ver un botón “Instalar Comercio Lleno” listo para tocar. No hace falta buscar nada en el menú de Chrome.')
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
      await prepareInstallation()
    }

    window.addEventListener('beforeinstallprompt', beforeInstall)
    window.addEventListener('appinstalled', appInstalled)
    window.addEventListener('comercio:pwa-install-ready', earlyInstallReady)
    window.addEventListener('comercio:pwa-installed', appInstalled)
    document.addEventListener('click', click, true)

    const observer = new MutationObserver(scheduleSync)
    observer.observe(document.body, { childList: true, subtree: true })

    const viewport = window.visualViewport
    viewport?.addEventListener('resize', scheduleSync)
    viewport?.addEventListener('scroll', scheduleSync)
    window.addEventListener('resize', scheduleSync)
    window.addEventListener('scroll', scheduleSync, { passive: true })

    sync()

    return () => {
      disposed = true
      if (syncFrame) window.cancelAnimationFrame(syncFrame)
      timers.forEach(id => window.clearTimeout(id))
      timers.clear()
      observer.disconnect()
      window.removeEventListener('beforeinstallprompt', beforeInstall)
      window.removeEventListener('appinstalled', appInstalled)
      window.removeEventListener('comercio:pwa-install-ready', earlyInstallReady)
      window.removeEventListener('comercio:pwa-installed', appInstalled)
      document.removeEventListener('click', click, true)
      viewport?.removeEventListener('resize', scheduleSync)
      viewport?.removeEventListener('scroll', scheduleSync)
      window.removeEventListener('resize', scheduleSync)
      window.removeEventListener('scroll', scheduleSync)
    }
  }, [])

  return null
}
