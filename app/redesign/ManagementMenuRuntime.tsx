'use client'

import { useEffect } from 'react'

function cleanLabel(value: string) {
  return value.replace(/[▦♜⌃⌄]/g, '').replace(/\s+/g, ' ').trim()
}

function buttonByLabel(root: ParentNode, label: string) {
  return Array.from(root.querySelectorAll('button')).find(button => cleanLabel(button.textContent || '') === label) as HTMLButtonElement | undefined
}

export default function ManagementMenuRuntime() {
  useEffect(() => {
    let initialHandled = false
    let raf = 0
    let activeGroup: HTMLButtonElement | null = null
    let activeContainer: HTMLElement | null = null
    let activeSidebar: HTMLElement | null = null

    const clearSidebarLayer = () => {
      if (!activeSidebar) return
      activeSidebar.style.removeProperty('z-index')
      activeSidebar.style.removeProperty('position')
      activeSidebar.style.removeProperty('overflow')
      activeSidebar.style.removeProperty('isolation')
      delete activeSidebar.dataset.managementLayer
      activeSidebar = null
    }

    const elevateSidebar = (sidebar: HTMLElement) => {
      if (activeSidebar && activeSidebar !== sidebar) clearSidebarLayer()
      activeSidebar = sidebar
      sidebar.dataset.managementLayer = 'open'
      sidebar.style.setProperty('position', 'relative', 'important')
      sidebar.style.setProperty('z-index', '2147482000', 'important')
      sidebar.style.setProperty('overflow', 'visible', 'important')
      sidebar.style.setProperty('isolation', 'isolate', 'important')
    }

    const closeFlyout = () => {
      if (activeGroup && activeContainer && activeGroup.nextElementSibling === activeContainer) activeGroup.click()
    }

    const positionFlyout = (group: HTMLButtonElement, container: HTMLElement, sidebar: HTMLElement) => {
      if (!document.body.contains(container)) return
      elevateSidebar(sidebar)
      const rect = group.getBoundingClientRect()
      const gap = 12
      const preferredWidth = 336
      const viewportPadding = 12
      const availableRight = window.innerWidth - rect.right - gap - viewportPadding
      const availableLeft = rect.left - gap - viewportPadding
      const width = Math.min(preferredWidth, Math.max(280, window.innerWidth - viewportPadding * 2))

      container.dataset.managementFlyout = 'ready'
      container.style.setProperty('position', 'fixed', 'important')
      container.style.setProperty('z-index', '2147483000', 'important')
      container.style.setProperty('width', `${width}px`, 'important')
      container.style.setProperty('max-height', 'min(520px, calc(100vh - 24px))', 'important')
      container.style.setProperty('overflow-y', 'auto', 'important')
      container.style.setProperty('overscroll-behavior', 'contain', 'important')
      container.style.setProperty('background', 'rgba(255,255,255,.995)', 'important')
      container.style.setProperty('box-shadow', '0 24px 70px rgba(19,45,35,.34)', 'important')
      container.style.setProperty('border', '1px solid rgba(194,214,205,.96)', 'important')
      container.style.setProperty('border-radius', '16px', 'important')
      container.style.setProperty('isolation', 'isolate', 'important')
      container.style.setProperty('transform', 'translateZ(0)', 'important')
      container.style.setProperty('right', 'auto', 'important')
      container.style.setProperty('bottom', 'auto', 'important')

      Array.from(container.children).forEach(child => {
        const element = child as HTMLElement
        element.style.setProperty('position', 'relative', 'important')
        element.style.setProperty('z-index', '1', 'important')
      })

      let left: number
      if (availableRight >= width) left = rect.right + gap
      else if (availableLeft >= width) left = rect.left - width - gap
      else left = Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - width - viewportPadding))

      const height = Math.min(container.scrollHeight || container.offsetHeight || 1, Math.max(1, window.innerHeight - viewportPadding * 2))
      let top = rect.top
      if (top + height > window.innerHeight - viewportPadding) top = window.innerHeight - height - viewportPadding
      top = Math.max(viewportPadding, top)

      container.style.setProperty('left', `${Math.round(left)}px`, 'important')
      container.style.setProperty('top', `${Math.round(top)}px`, 'important')
    }

    const sync = () => {
      const group = Array.from(document.querySelectorAll('button')).find(button => cleanLabel(button.textContent || '').startsWith('Gestión')) as HTMLButtonElement | undefined
      if (!group) {
        clearSidebarLayer()
        return
      }

      const sidebarNode = group.closest('aside')
      if (!sidebarNode) return
      const sidebar = sidebarNode as HTMLElement
      const purchaseOriginal = buttonByLabel(sidebar, 'Compras')
      const supplierOriginal = buttonByLabel(sidebar, 'Proveedores')

      for (const original of [purchaseOriginal, supplierOriginal]) {
        if (!original || original.dataset.managementProxy === '1') continue
        original.dataset.managementOriginal = '1'
        original.style.setProperty('display', 'none', 'important')
      }

      const firstContainer = group.nextElementSibling as HTMLElement | null
      if (!initialHandled) {
        initialHandled = true
        if (firstContainer) {
          group.click()
          return
        }
      }

      const container = group.nextElementSibling as HTMLElement | null
      activeGroup = group
      activeContainer = container
      if (!container) {
        clearSidebarLayer()
        return
      }

      const addProxy = (label: string, icon: string, original?: HTMLButtonElement) => {
        if (!original || container.querySelector(`[data-management-proxy="${label}"]`)) return
        const proxy = document.createElement('button')
        proxy.type = 'button'
        proxy.dataset.managementProxy = label
        proxy.className = container.querySelector('button')?.className || original.className
        const iconNode = document.createElement('span')
        iconNode.textContent = icon
        proxy.append(iconNode, document.createTextNode(label))
        proxy.addEventListener('click', () => original.click())
        container.appendChild(proxy)
      }

      addProxy('Compras', '▦', purchaseOriginal)
      addProxy('Proveedores', '♜', supplierOriginal)

      if (container.dataset.managementCloseBound !== '1') {
        container.dataset.managementCloseBound = '1'
        container.addEventListener('click', event => {
          if (!(event.target as HTMLElement).closest('button')) return
          window.setTimeout(closeFlyout, 0)
        })
      }

      window.cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(() => positionFlyout(group, container, sidebar))
    }

    const outsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (!activeGroup || !activeContainer || !document.body.contains(activeContainer)) return
      if (activeGroup.contains(target) || activeContainer.contains(target)) return
      closeFlyout()
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('resize', sync)
    window.addEventListener('scroll', sync, true)
    document.addEventListener('mousedown', outsideClick)

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', sync)
      window.removeEventListener('scroll', sync, true)
      document.removeEventListener('mousedown', outsideClick)
      clearSidebarLayer()
      document.querySelectorAll<HTMLElement>('[data-management-original="1"]').forEach(element => {
        element.style.removeProperty('display')
        delete element.dataset.managementOriginal
      })
    }
  }, [])

  return null
}
