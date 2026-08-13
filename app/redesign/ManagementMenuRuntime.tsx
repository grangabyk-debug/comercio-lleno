'use client'

import { useEffect } from 'react'

function buttonByLabel(root: ParentNode, label: string) {
  return Array.from(root.querySelectorAll('button')).find(button => (button.textContent || '').trim() === label) as HTMLButtonElement | undefined
}

export default function ManagementMenuRuntime() {
  useEffect(() => {
    let initialHandled = false
    let raf = 0

    const sync = () => {
      const group = Array.from(document.querySelectorAll('button')).find(button => (button.textContent || '').trim().startsWith('Gestión')) as HTMLButtonElement | undefined
      if (!group) return

      const sidebar = group.closest('aside') || document
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
      if (!container) return

      const place = () => {
        if (!document.body.contains(container)) return
        container.dataset.managementFlyout = 'ready'
        container.style.setProperty('position', 'fixed', 'important')
        container.style.setProperty('z-index', '85', 'important')
        container.style.setProperty('max-height', 'calc(100vh - 96px)', 'important')
        container.style.setProperty('overflow-y', 'auto', 'important')

        if (window.innerWidth <= 950) {
          container.style.setProperty('left', '12px', 'important')
          container.style.setProperty('right', '12px', 'important')
          container.style.setProperty('top', '82px', 'important')
          container.style.setProperty('width', 'auto', 'important')
          return
        }

        const rect = group.getBoundingClientRect()
        container.style.setProperty('width', '318px', 'important')
        container.style.setProperty('right', 'auto', 'important')
        container.style.setProperty('left', `${Math.round(rect.right + 10)}px`, 'important')

        const height = Math.max(1, container.offsetHeight)
        const maxTop = Math.max(76, window.innerHeight - height - 12)
        const top = Math.max(76, Math.min(rect.top - 2, maxTop))
        container.style.setProperty('top', `${Math.round(top)}px`, 'important')
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
          window.setTimeout(() => {
            if (group.nextElementSibling === container) group.click()
          }, 0)
        })
      }

      window.cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(place)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('resize', sync)
    window.addEventListener('scroll', sync, true)

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', sync)
      window.removeEventListener('scroll', sync, true)
      document.querySelectorAll<HTMLElement>('[data-management-original="1"]').forEach(element => {
        element.style.removeProperty('display')
        delete element.dataset.managementOriginal
      })
    }
  }, [])

  return null
}
