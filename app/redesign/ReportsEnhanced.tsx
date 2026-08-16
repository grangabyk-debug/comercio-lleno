'use client'

import { useMemo } from 'react'
import core from './page.module.css'
import enh from './enhancements.module.css'
import type { CommerceSnapshot, Sale } from '@/lib/comercio/types'
import { PAYMENT_METHODS, paymentTotalsByMethod } from '@/lib/comercio/payments'
import { dayKey, Head, money, startOfDay, Trend } from './operationalShared'

const payments = [...PAYMENT_METHODS]

export default function ReportsEnhanced({ data }: { data: CommerceSnapshot }) {
  const now = new Date()
  const todayStart = startOfDay(now)
  const sevenStart = todayStart - 6 * 86400000
  const prevSevenStart = todayStart - 13 * 86400000
  const thirtyStart = todayStart - 29 * 86400000

  const sum = (rows: Sale[]) => rows.reduce((a, s) => a + s.total, 0)
  const current7 = data.sales.filter(s => new Date(s.date).getTime() >= sevenStart)
  const prev7 = data.sales.filter(s => {
    const t = new Date(s.date).getTime()
    return t >= prevSevenStart && t < sevenStart
  })
  const last30 = data.sales.filter(s => new Date(s.date).getTime() >= thirtyStart)
  const paymentTotals = useMemo(() => paymentTotalsByMethod(last30), [last30])
  const current7Total = sum(current7)
  const prev7Total = sum(prev7)
  const currentAvg = current7.length ? current7Total / current7.length : 0
  const prevAvg = prev7.length ? prev7Total / prev7.length : 0

  const top = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>()
    last30.forEach(s => (s.details?.items || []).forEach(item => {
      const key = item.product_id || item.name
      const value = map.get(key) || { name: item.name, qty: 0, revenue: 0 }
      value.qty += Number(item.qty || 0)
      value.revenue += Number(item.line_total || 0)
      map.set(key, value)
    }))
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5)
  }, [last30])

  const days = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(todayStart - (6 - idx) * 86400000)
    const key = dayKey(d)
    const rows = data.sales.filter(s => dayKey(s.date) === key)
    return {
      label: d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit' }),
      total: sum(rows),
    }
  })
  const maxDay = Math.max(1, ...days.map(d => d.total))

  const bestDay = Array.from(new Set(last30.map(s => dayKey(s.date))))
    .map(key => ({ key, total: sum(last30.filter(s => dayKey(s.date) === key)) }))
    .sort((a, b) => b.total - a.total)[0]

  return <>
    <Head eyebrow="GESTIÓN" title="Reportes" subtitle="Comparativas, productos líderes y evolución de ventas." />

    <div className={enh.reportCompare}>
      <div className={enh.compareCard}>
        <span>Ventas · últimos 7 días</span>
        <strong>{money.format(current7Total)}</strong>
        <Trend current={current7Total} previous={prev7Total} label="los 7 días anteriores" />
      </div>
      <div className={enh.compareCard}>
        <span>Ticket promedio · 7 días</span>
        <strong>{money.format(currentAvg)}</strong>
        <Trend current={currentAvg} previous={prevAvg} label="los 7 días anteriores" />
      </div>
      <div className={enh.compareCard}>
        <span>Mejor día · 30 días</span>
        <strong>{bestDay ? money.format(bestDay.total) : money.format(0)}</strong>
        <small>{bestDay
          ? new Date(`${bestDay.key}T12:00:00`).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: '2-digit' })
          : 'Sin ventas'}</small>
      </div>
    </div>

    <div className={core.gridTwo}>
      <div className={core.panel}>
        <div className={core.panelTitle}><div><b>Top 5 productos · últimos 30 días</b><small>Ordenado por unidades vendidas</small></div></div>
        <div className={enh.topList}>
          {top.length ? top.map((p, i) => <div className={enh.topRow} key={`${p.name}-${i}`}>
            <span className={enh.rank}>{i + 1}</span>
            <div><b>{p.name}</b><small>{p.qty} unidades · {money.format(p.revenue)} vendidos</small></div>
            <strong>{p.qty}</strong>
          </div>) : <div className={core.empty}>Todavía no hay detalle suficiente para calcular el ranking.</div>}
        </div>
      </div>

      <div className={core.panel}>
        <div className={core.panelTitle}><div><b>Evolución · últimos 7 días</b><small>Total vendido por día</small></div></div>
        <div className={enh.dailyBars}>
          {days.map(d => <div className={enh.barRow} key={d.label}>
            <span>{d.label}</span>
            <div className={enh.barTrack}><div className={enh.barFill} style={{ width: `${Math.max(2, d.total / maxDay * 100)}%` }} /></div>
            <b>{money.format(d.total)}</b>
          </div>)}
        </div>
      </div>
    </div>

    <div className={core.panel} style={{ marginTop: 14 }}>
      <div className={core.panelTitle}><div><b>Medios de pago · últimos 30 días</b><small>Las ventas divididas se reparten entre cada medio por su importe real.</small></div></div>
      {payments.map(payment => {
        const totals = paymentTotals.get(payment) || { amount: 0, operations: 0 }
        return <div className={core.recentRow} key={payment}>
          <span className={core.roundIcon}>%</span>
          <div><b>{payment}</b><small>{totals.operations} operaciones</small></div>
          <strong>{money.format(totals.amount)}</strong>
        </div>
      })}
    </div>
  </>
}
