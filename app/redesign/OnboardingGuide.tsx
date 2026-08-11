'use client'

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
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

type DragState = {
  pointerId: number
  startX: number
  startY: number
  left: number
  top: number
  width: number
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
  const [minimized, setMinimized] = useState(false)
  const [companyName, setCompanyName] = useState('tu comercio')
  const [companyId, setCompanyId] = useState('')
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)
  const wrapRef = useRef<HTMLElement | null>(null)
  const dragRef = useRef<DragState | null>(null)

  useEffect(() => {
    const session = readTenantSession()
    if (!session || session.role !== 'owner') return

    const hiddenKey = `cl_setup_hidden_${session.companyId}`
    if (localStorage.getItem(hiddenKey) === '1') return

    setCompanyId(session.companyId)
    setCompanyName(session.companyName || 'tu comercio')
    setMinimized(localStorage.getItem(`cl_setup_minimized_${session.companyId}`) === '1')
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
      window.setTimeout(() => clickButton(step.secondary!), 160)
    }
    // La guía queda visible para acompañar todo el proceso.
  }

  function minimize() {
    if (companyId) localStorage.setItem(`cl_setup_minimized_${companyId}`, '1')
    setMinimized(true)
    setPosition(null)
  }

  function restore() {
    if (companyId) localStorage.removeItem(`cl_setup_minimized_${companyId}`)
    setMinimized(false)
    setPosition(null)
  }

  function hideForever() {
    if (companyId) {
      localStorage.setItem(`cl_setup_hidden_${companyId}`, '1')
      localStorage.removeItem(`cl_setup_minimized_${companyId}`)
    }
    setVisible(false)
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (window.innerWidth <= 720 || minimized) return
    const target = event.target as HTMLElement
    if (target.closest('button,a')) return
    const wrap = wrapRef.current
    if (!wrap) return
    const rect = wrap.getBoundingClientRect()
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: rect.left,
      top: rect.top,
      width: rect.width,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const maxLeft = Math.max(8, window.innerWidth - drag.width - 8)
    const left = Math.min(maxLeft, Math.max(8, drag.left + event.clientX - drag.startX))
    const top = Math.min(Math.max(8, window.innerHeight - 72), Math.max(8, drag.top + event.clientY - drag.startY))
    setPosition({ left, top })
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return
    dragRef.current = null
    try { event.currentTarget.releasePointerCapture(event.pointerId) } catch {}
  }

  if (!visible) return null

  if (minimized) {
    return <aside className={`${styles.wrap} ${styles.minimized}`} aria-label="Configuración inicial de Comercio Lleno">
      <button className={styles.miniButton} onClick={restore} title="Abrir guía de configuración">
        <span>👋 Guía de inicio</span>
        <small>{completed} de {STEPS.length}</small>
        <b>Abrir ↑</b>
      </button>
    </aside>
  }

  return <aside
    ref={wrapRef}
    className={styles.wrap}
    style={position ? { left: position.left, top: position.top, right: 'auto' } : undefined}
    aria-label="Configuración inicial de Comercio Lleno"
  >
    <div className={styles.card}>
      <div
        className={styles.head}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className={styles.headRow}>
          <div className={styles.titleBlock}>
            <b>👋 Prepará {companyName}</b>
            <small>Tu puesta a punto de Comercio Lleno · podés mover esta ventana</small>
          </div>
          <div className={styles.headActions}>
            <span>{completed} de {STEPS.length}</span>
            <button type="button" onClick={minimize} title="Minimizar guía" aria-label="Minimizar guía">—</button>
          </div>
        </div>
        <div className={styles.progress}><i style={{ width: `${percent}%` }} /></div>
      </div>
      <div className={styles.body}>
        {completed === STEPS.length
          ? <div className={styles.complete}>✓ ¡Listo! Ya completaste la configuración inicial.</div>
          : <p>Te acompañamos durante toda la configuración. La guía permanece abierta aunque entres a otra sección; si te molesta, podés moverla o minimizarla.</p>}
        {STEPS.map((step, index) => {
          const done = Boolean(progress[step.id])
          return <button key={step.id} className={`${styles.step} ${done ? styles.done : ''}`} onClick={() => go(step)}>
            <i>{done ? '✓' : step.icon}</i>
            <span>{index + 1}. {step.label}</span>
            <small>{done ? 'Listo' : 'Ir →'}</small>
          </button>
        })}
        <div className={styles.actions}>
          <button onClick={minimize}>Minimizar guía</button>
          <a target="_blank" rel="noopener noreferrer" href="https://wa.me/5491159609135?text=Hola%2C%20necesito%20ayuda%20para%20configurar%20Comercio%20Lleno">Ayuda humana</a>
        </div>
        <button className={styles.hide} onClick={hideForever}>No quiero volver a ver esta guía</button>
      </div>
    </div>
  </aside>
}
