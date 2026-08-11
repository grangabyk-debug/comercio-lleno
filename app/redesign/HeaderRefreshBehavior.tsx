'use client'

import { useEffect } from 'react'

export default function HeaderRefreshBehavior() {
  useEffect(() => {
    const cleanExperimentalUi = () => {
      document.querySelectorAll('button').forEach((button) => {
        const label = button.textContent?.replace(/\s+/g, ' ').trim() || ''
        if (label.includes('Asistente IA')) button.remove()
      })
    }

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

    cleanExperimentalUi()
    const observer = new MutationObserver(cleanExperimentalUi)
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('click', handleClick, true)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', handleClick, true)
    }
  }, [])

  return null
}
