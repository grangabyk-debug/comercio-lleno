'use client'

import { useEffect } from 'react'

export default function SaleSearchGuard() {
  useEffect(() => {
    let frame = 0

    const getSaleElements = () => {
      const saleHeading = Array.from(document.querySelectorAll('h2')).find(
        (node) => node.textContent?.trim() === 'Nueva venta',
      )
      if (!saleHeading) return null

      const input = document.querySelector<HTMLInputElement>('input[placeholder="Buscar producto…"]')
      if (!input) return null

      const searchBox = input.parentElement
      const extraButton = searchBox?.nextElementSibling
      const productList = extraButton?.nextElementSibling as HTMLElement | null
      if (!productList) return null

      return { input, productList }
    }

    const sync = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const elements = getSaleElements()
        if (!elements) return

        const shouldShow = elements.input.value.trim().length > 0
        const nextDisplay = shouldShow ? '' : 'none'
        if (elements.productList.style.display !== nextDisplay) {
          elements.productList.style.display = nextDisplay
        }
      })
    }

    const clearSearch = (input: HTMLInputElement) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      if (setter) setter.call(input, '')
      else input.value = ''
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.blur()
    }

    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement | null
      if (target?.matches('input[placeholder="Buscar producto…"]')) sync()
    }

    const onClick = (event: MouseEvent) => {
      const elements = getSaleElements()
      if (!elements) return

      const target = event.target as Element | null
      const productButton = target?.closest('button')
      if (!productButton || !elements.productList.contains(productButton)) return

      window.setTimeout(() => {
        clearSearch(elements.input)
        elements.productList.style.display = 'none'
        const cart = elements.productList.nextElementSibling as HTMLElement | null
        cart?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    }

    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('input', onInput, true)
    document.addEventListener('click', onClick)
    sync()

    return () => {
      observer.disconnect()
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('click', onClick)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return null
}
