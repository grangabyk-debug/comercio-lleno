'use client'

import { useEffect, useMemo, useState } from 'react'
import { readTenantSession } from '@/lib/comercio/session'
import styles from './onboardingGuide.module.css'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

type Step = {
  id: string
  label: string
  icon: string
  primary: string
  secondary?: string
}

const STEPS: Step[] = [
  { id: 'datos', label: 'Completá los datos del comercio', icon: '⚙', primary: 'Configuración', secondary: 'Comercio' },
  { id: 'arca', label: 'Configurá ARCA', icon: '✓', primary: 'Configuración', secondary: 'ARCA' },
  { id: 'impresora', label: 'Prepará la impresora y tickets', icon: '▤', primary: 'Configuración', secondary: 'Impresora y tickets' },
  { id: 'producto', label: 'Cargá tu primer producto', icon: '▦', primary: 'Productos' },
  { id: 'venta', label: 'Abrí la caja y hacé tu primera venta', icon: '$', primary: 'Nueva venta' },
]

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim()
}

function clickButton(label: string) {
  const wanted = normalize(label)
  const buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[]
  const exact = buttons.find(button => normalize(button.textContent || '') === wanted)
  const partial = buttons.find(button => normalize(button.textContent || '').includes(wanted))
  const target = exact || partial
  if (!target) return false
  target.click()
  return true
}

export default function OnboardingGuide() {
  const [visible, setVisible] = useState(false)
  const [companyName, setCompanyName] = useState('tu comercio')
  const [companyId, setCompanyId] = useState('')
  const [progress, setProgress] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const session = readTenantSession()
    if (!session || session.role !== 'owner') return

    const hiddenKey = `cl_setup_hidden_${session.companyId}`
    if (localStorage.getItem(hiddenKey) === '1') return

    setCompanyId(session.companyId)
    setCompanyName(session.companyName || 'tu comercio')
    try {
      setProgress(JSON.parse(localStorage.getItem(`cl_setup_steps_${session.companyId}`) || '{}'))
    } catch {
      setProgress({})
    }

    let cancelled = false
    fetch(`${SUPABASE_URL}/rest/v1/company_subscriptions?company_id=eq.${encodeURIComponent(session.companyId)}&select=status,trial_ends_at&limit=1`, {
      headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${session.token}` },
      cache: 'no-store',
    })
      .then(response => response.ok ? response.json() : [])
      .then(rows => {
        if (cancelled) return
        const subscription = Array.isArray(rows) ? rows[0] : null
        const trialActive = subscription?.status === 'trialing' && (!subscription.trial_ends_at || new Date(subscription.trial_ends_at).getTime() > Date.now())
        if (trialActive) window.setTimeout(() => { if (!cancelled) setVisible(true) }, 850)
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [])

  const completed = useMemo(() => STEPS.filter(step => progress[step.id]).length, [progress])
  const percent = Math.round((completed / STEPS.length) * 100)

  function saveProgress(next: Record<string, boolean>) {
    setProgress(next)
    if (companyId) localStorage.setItem(`cl_setup_steps_${companyId}`, JSON.stringify(next))
  }

  function go(step: Step) {
    saveProgress({ ...progress, [step.id]: true })
    const opened = clickButton(step.primary)
    if (opened && step.secondary) {
      window.setTimeout(() => clickButton(step.secondary!), 120)
    }
    setVisible(false)
  }

  function hideForever() {
    if (companyId) localStorage.setItem(`cl_setup_hidden_${companyId}`, '1')
    setVisible(false)
  }

  if (!visible) return null

  return <aside className={styles.wrap} aria-label="Configuración inicial de Comercio Lleno">
    <div className={styles.card}>
      <div className={styles.head}>
        <div className={styles.headRow}>
          <div>
            <b>👋 Prepará {companyName}</b>
            <small>Tu puesta a punto de Comercio Lleno</small>
          </div>
          <span>{completed} de {STEPS.length}</span>
        </div>
        <div className={styles.progress}><i style={{ width: `${percent}%` }} /></div>
      </div>
      <div className={styles.body}>
        {completed === STEPS.length
          ? <div className={styles.complete}>✓ ¡Listo! Ya completaste la configuración inicial.</div>
          : <p>Te acompañamos con los primeros pasos para dejar el sistema listo para vender. Tu progreso queda guardado para este comercio.</p>}
        {STEPS.map((step, index) => {
          const done = Boolean(progress[step.id])
          return <button key={step.id} className={`${styles.step} ${done ? styles.done : ''}`} onClick={() => go(step)}>
            <i>{done ? '✓' : step.icon}</i>
            <span>{index + 1}. {step.label}</span>
            <small>{done ? 'Listo' : 'Ir →'}</small>
          </button>
        })}
        <div className={styles.actions}>
          <button onClick={() => setVisible(false)}>Seguir después</button>
          <a target="_blank" rel="noopener noreferrer" href="https://wa.me/5491159609135?text=Hola%2C%20necesito%20ayuda%20para%20configurar%20Comercio%20Lleno">Ayuda humana</a>
        </div>
        <button className={styles.hide} onClick={hideForever}>Ocultar esta guía para siempre</button>
      </div>
    </div>
  </aside>
}
