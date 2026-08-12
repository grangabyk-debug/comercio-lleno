'use client'

import { useEffect } from 'react'

export default function ViewScrollReset() {
  useEffect(() => {
    const reset = () => {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      })
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null
      const button = target?.closest('aside button')
      if (!button) return
      window.setTimeout(reset, 0)
      window.setTimeout(reset, 80)
    }

    const onPopState = () => reset()
    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', onPopState)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  return <style>{`
    @media (max-width: 1366px) and (min-width: 761px) {
      body { scroll-padding-top: 68px; }
      main { min-width: 0; }
    }
    @media (max-height: 820px) and (min-width: 761px) {
      body { scroll-padding-top: 64px; }
    }
  `}</style>
}
