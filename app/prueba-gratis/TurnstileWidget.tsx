'use client'

import Script from 'next/script'
import { useCallback, useEffect, useRef } from 'react'
import styles from './turnstile.module.css'

const TURNSTILE_SITE_KEY = '0x4AAAAAAER59hccA-oG9-Fr'

type Props = {
  onToken: (token: string) => void
  resetSignal: number
}

export default function TurnstileWidget({ onToken, resetSignal }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  const renderWidget = useCallback(() => {
    const api = (window as any).turnstile
    if (!api || !containerRef.current || widgetIdRef.current) return

    widgetIdRef.current = api.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: 'light',
      language: 'es',
      size: 'normal',
      retry: 'auto',
      'refresh-expired': 'auto',
      callback: (token: string) => onToken(token),
      'expired-callback': () => onToken(''),
      'timeout-callback': () => onToken(''),
      'error-callback': () => onToken(''),
    })
  }, [onToken])

  useEffect(() => {
    if (!resetSignal || !widgetIdRef.current) return
    const api = (window as any).turnstile
    if (!api) return
    onToken('')
    api.reset(widgetIdRef.current)
  }, [resetSignal, onToken])

  useEffect(() => () => {
    const api = (window as any).turnstile
    if (api && widgetIdRef.current) {
      try { api.remove(widgetIdRef.current) } catch {}
      widgetIdRef.current = null
    }
  }, [])

  return <div className={styles.box}>
    <Script
      src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      strategy="afterInteractive"
      onReady={renderWidget}
      onLoad={renderWidget}
    />
    <div className={styles.inner} ref={containerRef} aria-label="Verificación de seguridad" />
  </div>
}
