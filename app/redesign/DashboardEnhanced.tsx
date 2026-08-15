'use client'

import { useMemo } from 'react'
import BrandLogo from '../BrandLogo'
import type { CommerceSnapshot, ViewKey } from '@/lib/comercio/types'
import { receiptNumber } from '@/lib/comercio/receipt'
import { money } from './operationalShared'
import UiIcon from './UiIcon'
import styles from './DashboardRevolution.module.css'
import compare from './DashboardComparisons.module.css'
import display from './DashboardDisplayFix.module.css'

const merchantPhoto='https://images.pexels.com/photos/33752265/pexels-photo-33752265.jpeg?auto=compress&cs=tinysrgb&w=1500'

function startOfLocalDay(value: Date) {
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfWeek(value: Date) {
  const d = startOfLocalDay(value)
  const mondayOffset = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - mondayOffset)
  return d
}

function addDays(value: Date, days: number) {
  const d = new Date(value)
  d.setDate(d.getDate() + days)
  return d
}

function sumRange(sales: CommerceSnapshot['sales'], from: Date, to: Date) {
  const start = from.getTime()
  const end = to.getTime()
  return sales.reduce((total, sale) => {
    const time = new Date(sale.date).getTime()
    return Number.isFinite(time) && time >= start && time < end ? total + sale.total : total
  }, 0)
}

function comparisonMeta(current: number, previous: number) {
  if (previous <= 0) {
    return current > 0
      ? { direction: 'up' as const, text: '100% más' }
      : { direction: 'flat' as const, text: 'Sin referencia' }
  }
  const raw = ((current - previous) / previous) * 100
  const rounded = Math.round(Math.abs(raw))
  if (raw > .01) return { direction: 'up' as const, text: `${rounded}% más` }
  if (raw < -.01) return { direction: 'down' as const, text: `${rounded}% menos` }
  return { direction: 'flat' as const, text: 'Sin cambio' }
}

export default function DashboardEnhanced({ data, todayTotal, todayCount, lowStock, go, canSell, role }: {
  data: CommerceSnapshot
  todayTotal: number
  todayCount: number
  lowStock: number
  go: (v: ViewKey) => void
  canSell: boolean
  role: string
}) {
  const recent = data.sales.slice(0, 6)
  const cashOpen = data.cashRegister?.status === 'open'
  const todayAvg = todayCount ? todayTotal / todayCount : 0

  const comparisons = useMemo(() => {
    const now = new Date()
    const todayStart = startOfLocalDay(now)
    const elapsedToday = now.getTime() - todayStart.getTime()
    const yesterdayStart = addDays(todayStart, -1)
    const yesterdaySameTime = new Date(yesterdayStart.getTime() + elapsedToday)

    const weekStart = startOfWeek(now)
    const elapsedWeek = now.getTime() - weekStart.getTime()
    const previousWeekStart = addDays(weekStart, -7)
    const previousWeekSameTime = new Date(previousWeekStart.getTime() + elapsedWeek)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonthSameTime = new Date(Math.min(previousMonthStart.getTime() + (now.getTime() - monthStart.getTime()), previousMonthEnd.getTime()))

    const last7Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const previous7Start = new Date(last7Start.getTime() - 7 * 24 * 60 * 60 * 1000)

    const yesterday = sumRange(data.sales, yesterdayStart, yesterdaySameTime)
    const thisWeek = sumRange(data.sales, weekStart, now)
    const previousWeek = sumRange(data.sales, previousWeekStart, previousWeekSameTime)
    const thisMonth = sumRange(data.sales, monthStart, now)
    const previousMonth = sumRange(data.sales, previousMonthStart, previousMonthSameTime)
    const last7 = sumRange(data.sales, last7Start, now)
    const previous7 = sumRange(data.sales, previous7Start, last7Start)

    return [
      { title: 'Hoy vs ayer', current: todayTotal, previous: yesterday, detail: `Ayer a esta hora ${money.format(yesterday)}` },
      { title: 'Semana vs anterior', current: thisWeek, previous: previousWeek, detail: `Mismo tramo ${money.format(previousWeek)}` },
      { title: 'Mes vs anterior', current: thisMonth, previous: previousMonth, detail: `Mismo tramo ${money.format(previousMonth)}` },
      { title: 'Últimos 7 días', current: last7, previous: previous7, detail: `7 anteriores ${money.format(previous7)}` },
    ].map(item => ({ ...item, meta: comparisonMeta(item.current, item.previous) }))
  }, [data.sales, todayTotal])

  return <div className={styles.dashboard}>
    {role === 'supervisor' && <div className={styles.supervisor}>Panel de supervisión · indicadores visibles según tus permisos.</div>}

    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <div className={styles.eyebrow}><span>HOY</span>{data.company.name}</div>
        <h1>El pulso del negocio,<br/><em>de un vistazo.</em></h1>
        <div className={styles.totalBlock}>
          <span>VENTAS DEL DÍA</span>
          <strong>{money.format(todayTotal)}</strong>
          <small>{todayCount} operación{todayCount===1?'':'es'} registrada{todayCount===1?'':'s'}</small>
        </div>

        <div className={compare.panel} aria-label="Comparaciones de ventas">
          {comparisons.map(item => <div key={item.title} className={`${compare.card} ${item.meta.direction==='up'?compare.up:item.meta.direction==='down'?compare.down:compare.flat}`}>
            <div className={compare.top}><span>{item.title}</span><i>{item.meta.direction==='up'?'↗':item.meta.direction==='down'?'↘':'→'}</i></div>
            <strong>{item.meta.text}</strong>
            <small>{item.detail}</small>
          </div>)}
        </div>

        <div className={styles.heroActions}>
          {canSell&&<button className={styles.sell} onClick={()=>go('pos')}><span>+</span>Nueva venta</button>}
          <button className={`${styles.simple} ${display.simpleAttention}`} onClick={()=>window.dispatchEvent(new Event('comercio:enter-simple'))}>Modo Simple <span>→</span></button>
        </div>
      </div>

      <div className={styles.heroPhoto}>
        <img src={merchantPhoto} alt="Comercio de cercanía en Buenos Aires"/>
        <div aria-hidden="true" className={display.imageVeil}/>
        <div className={styles.photoBrand}><BrandLogo size={29}/></div>
        <div className={`${styles.cashBadge} ${cashOpen?styles.cashOpen:styles.cashClosed}`}>
          <i>{cashOpen?'●':'○'}</i><div><span>CAJA</span><b>{cashOpen?'Abierta':'Cerrada'}</b></div>
        </div>
        <div className={styles.photoCaption}><b>El comercio, adelante.</b><span>El sistema acompaña sin ocupar el centro.</span></div>
      </div>
    </section>

    <section className={styles.metrics} aria-label="Indicadores del día">
      <button onClick={()=>go('sales')}><span>01 · TICKET PROMEDIO</span><strong>{money.format(todayAvg)}</strong><small>Promedio de las ventas de hoy</small></button>
      <button onClick={()=>go('products')} className={lowStock>0?styles.metricAlert:''}><span>02 · STOCK PARA MIRAR</span><strong>{lowStock}</strong><small>{lowStock===1?'producto bajo':'productos bajos'}</small></button>
      <button onClick={()=>go('cash')}><span>03 · CAJA</span><strong>{cashOpen?'ABIERTA':'CERRADA'}</strong><small>{data.cashRegister?.opened_at?`Desde ${new Date(data.cashRegister.opened_at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}`:'Sin apertura activa'}</small></button>
      <button onClick={()=>go('assistant')} className={styles.metricAi}><span>04 · ASISTENTE IA</span><strong>Preguntale</strong><small>ventas, stock y tendencias →</small></button>
    </section>

    <section className={styles.lowerGrid}>
      <div className={styles.activity}>
        <div className={styles.sectionTitle}><div><span>ACTIVIDAD</span><h2>Últimas ventas</h2></div><button onClick={()=>go('sales')}>Ver todas →</button></div>
        <div className={styles.saleList}>
          {recent.length?recent.map(s=><button className={styles.saleRow} key={s.id} onClick={()=>go('sales')}>
            <span className={styles.saleIcon}>{s.cae?<UiIcon name="check" size={17}/>:<UiIcon name="alert" size={17}/>}</span>
            <span className={styles.saleInfo}><b>{s.receiptNumber?`Factura C ${receiptNumber(s)}`:`Venta #${s.id.slice(0,8)}`}</b><small>{new Date(s.date).toLocaleString('es-AR')} · {s.payment}</small></span>
            <strong>{money.format(s.total)}</strong>
          </button>):<div className={styles.empty}>Todavía no hay ventas. La primera puede empezar acá.</div>}
        </div>
      </div>

      <div className={styles.actionsPanel}>
        <div className={styles.sectionTitle}><div><span>ATAJOS</span><h2>Hacé, no busques.</h2></div></div>
        <div className={styles.actionList}>
          {canSell&&<button onClick={()=>go('pos')}><i>01</i><span><b>Vender</b><small>Abrir caja de venta</small></span><strong>↗</strong></button>}
          <button onClick={()=>go('products')}><i>02</i><span><b>Productos</b><small>Precio, stock y costos</small></span><strong>↗</strong></button>
          <button onClick={()=>go('cash')}><i>03</i><span><b>Caja diaria</b><small>Movimientos y cierre</small></span><strong>↗</strong></button>
          <button onClick={()=>go('assistant')} className={styles.aiAction}><i>✦</i><span><b>Asistente IA</b><small>Preguntale al negocio</small></span><strong>↗</strong></button>
        </div>
      </div>
    </section>
  </div>
}
