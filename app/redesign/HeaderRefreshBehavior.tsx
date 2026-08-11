'use client'

import { useEffect } from 'react'

export default function HeaderRefreshBehavior() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const button = target.closest('button')
      if (!button || !button.closest('header')) return
      if (button.textContent?.replace(/\s+/g, ' ').trim() !== '↻ Actualizar') return

      event.preventDefault()
      event.stopPropagation()
      window.location.reload()
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  return null
}
