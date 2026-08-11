'use client'

import { useEffect } from 'react'

export default function SaleSearchGuard() {
  useEffect(() => {
    let frame = 0

    const sync = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const saleHeading = Array.from(document.querySelectorAll('h2')).find(
          (node) => node.textContent?.trim() === 'Nueva venta',
        )
        if (!saleHeading) return

        const input = document.querySelector<HTMLInputElement>('input[placeholder="Buscar producto…"]')
        if (!input) return

        const searchBox = input.parentElement
        const extraButton = searchBox?.nextElementSibling
        const productList = extraButton?.nextElementSibling as HTMLElement | null
        if (!productList) return

        const shouldShow = input.value.trim().length > 0
        const nextDisplay = shouldShow ? '' : 'none'
        if (productList.style.display !== nextDisplay) productList.style.display = nextDisplay
      })
    }

    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement | null
      if (target?.matches('input[placeholder="Buscar producto…"]')) sync()
    }

    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('input', onInput, true)
    sync()

    return () => {
      observer.disconnect()
      document.removeEventListener('input', onInput, true)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return null
}
