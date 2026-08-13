'use client'

import { useEffect } from 'react'
import polish from './design-polish.module.css'
import { loadDesignSettings, readCachedDesignSettings, type DesignSettings } from '@/lib/comercio/design-settings'
import { readTenantSession } from '@/lib/comercio/session'

function applyDesign(value: DesignSettings) {
  const shell = document.querySelector('main[class*="shell"]') as HTMLElement | null
  if (!shell) return false
  shell.dataset.designColor = value.colorTheme
  shell.dataset.designSize = value.fontSize
  shell.dataset.designWeight = value.fontWeight
  shell.dataset.designFont = value.fontFamily
  return true
}

const runtimeCss=`
main[data-design-font="modern"]{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
main[data-design-font="classic"]{font-family:Arial,Helvetica,"Helvetica Neue",sans-serif!important}
main[data-design-font] :is(button,input,select,textarea,label,table,td,th,a,p,small){font-family:inherit!important}
main[data-design-size="compact"]{--cl-text-scale:.90}
main[data-design-size="standard"]{--cl-text-scale:1}
main[data-design-size="large"]{--cl-text-scale:1.16}
main[data-design-size] :is([class*="navButton"],[class*="managementButton"],[class*="managementItem"]){font-size:calc(12.5px * var(--cl-text-scale))!important}
main[data-design-size] :is([class*="pageHead"] p,[class*="panel"] p,[class*="panel"] label,[class*="panel"] button,[class*="panel"] input,[class*="panel"] select,[class*="panel"] textarea,td,th){font-size:calc(11px * var(--cl-text-scale))!important}
main[data-design-size] :is([class*="panel"] small,[class*="recentRow"] small,[class*="productInfo"] small){font-size:calc(9.5px * var(--cl-text-scale))!important}
main[data-design-size] :is([class*="panel"] h3,[class*="panelTitle"] b){font-size:calc(16px * var(--cl-text-scale))!important}
main[data-design-size] [class*="pageHead"] h1{font-size:calc(31px * var(--cl-text-scale))!important}
main[data-design-size] :is([class*="recentRow"] b,[class*="productInfo"] b,[class*="cartName"] b){font-size:calc(11.5px * var(--cl-text-scale))!important}
main[data-design-weight="soft"] :is(h1,h2,h3,h4,b,strong,button,label,th){font-weight:600!important}
main[data-design-weight="balanced"] :is(h1,h2,h3,h4,b,strong,button,label,th){font-weight:800!important}
main[data-design-weight="strong"] :is(h1,h2,h3,h4,b,strong,button,label,th){font-weight:950!important}
`

export default function DesignRuntime() {
  useEffect(() => {
    const session = readTenantSession()
    if (!session) return
    let stopped = false
    let frame = 0
    const cached = readCachedDesignSettings(session.companyId)
    const applyWhenReady = (value: DesignSettings) => {
      const run = () => {
        if (stopped) return
        if (!applyDesign(value)) frame = window.requestAnimationFrame(run)
      }
      run()
    }
    applyWhenReady(cached)
    void loadDesignSettings(session).then(value => { if (!stopped) applyWhenReady(value) }).catch(() => {})
    const onDesign = (event: Event) => {
      const next = (event as CustomEvent<DesignSettings>).detail
      if (next) applyWhenReady(next)
    }
    window.addEventListener('comercio:design-settings', onDesign)
    return () => {
      stopped = true
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('comercio:design-settings', onDesign)
    }
  }, [])
  return <><span className={polish.runtime} aria-hidden="true"/><style>{runtimeCss}</style></>
}
