import type { ReactNode } from 'react'
import core from './page.module.css'
import enh from './enhancements.module.css'

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

export function Trend({ current, previous, label }: {
  current: number
  previous: number
  label: string
}) {
  const change = percent(current, previous)
  const up = change > 0.01
  const down = change < -0.01
  return <div className={`${enh.trend} ${up ? enh.trendUp : down ? enh.trendDown : enh.trendFlat}`}>
    <span className={enh.trendArrow}>{up ? '↑' : down ? '↓' : '→'}</span>
    <span className={enh.trendNote}>
      {previous > 0
        ? `${Math.abs(change).toFixed(0)}% ${up ? 'más' : down ? 'menos' : 'igual'} que ${label}`
        : 'Sin referencia anterior'}
    </span>
  </div>
}
