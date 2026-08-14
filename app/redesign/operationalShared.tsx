import type { ReactNode } from 'react'
import core from './page.module.css'
import polish from './design-polish.module.css'

export const money = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export function dayKey(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

export function Head({ eyebrow, title, subtitle, children }: {
  eyebrow: string
  title: string
  subtitle: string
  children?: ReactNode
}) {
  return <div className={core.pageHead}>
    <div>
      <div className={core.eyebrow}>{eyebrow}</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
    {children}
  </div>
}

function percent(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function TrendArrow({ direction }: { direction: 'up' | 'down' | 'flat' }) {
  const path = direction === 'up'
    ? 'M6 16.5 16.5 6M9.5 6h7v7'
    : direction === 'down'
      ? 'M6 7.5 16.5 18M9.5 18h7v-7'
      : 'M5 12h14M15 8l4 4-4 4'
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={path} stroke="currentColor" strokeWidth="2.35" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

export function Trend({ current, previous, label }: {
  current: number
  previous: number
  label: string
}) {
  const change = percent(current, previous)
  const up = change > 0.01
  const down = change < -0.01
  const direction: 'up' | 'down' | 'flat' = up ? 'up' : down ? 'down' : 'flat'
  return <div className={`${polish.trend} ${up ? polish.trendUp : down ? polish.trendDown : polish.trendFlat}`}>
    <span className={polish.trendArrow}><TrendArrow direction={direction}/></span>
    <span className={polish.trendCopy}>
      {previous > 0
        ? <><b>{Math.abs(change).toFixed(0)}% {up ? 'más' : down ? 'menos' : 'igual'}</b><small>que el {label}</small></>
        : <><b>Sin referencia</b><small>Sin datos previos</small></>}
    </span>
  </div>
}
