'use client'

import { useMemo } from 'react'
import type { CommerceSnapshot, ViewKey } from '@/lib/comercio/types'
import { receiptNumber } from '@/lib/comercio/receipt'
import { money } from './operationalShared'
import UiIcon, { type UiIconName } from './UiIcon'
import styles from './DashboardRevolution.module.css'

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
  if (previous <= 0) return current > 0 ? { direction: 'up' as const, text: 'Sin base anterior' } : { direction: 'flat' as const, text: 'Sin movimientos' }
  const raw = ((current - previous) / previous) * 100
  const rounded = Math.round(Math.abs(raw))
  if (raw > .01) return { direction: 'up' as const, text: `${rounded}% arriba` }
  if (raw < -.01) return { direction: 'down' as const, text: `${rounded}% abajo` }
  return { direction: 'flat' as const, text: 'Sin cambios' }
}

type QuickAction = { key: ViewKey; icon: UiIconName; title: string; text: string; tone?: 'orange'|'violet' }

export default function DashboardEnhanced({ data, todayTotal, todayCount, lowStock, go, canSell, role }: {
  data: CommerceSnapshot
  todayTotal: number
  todayCount: number
  lowStock: number
  go: (v: ViewKey) => void
  canSell: boolean
  role: string
}) {
  const recent = data.sales.slice(0, 7)
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
      { title: 'Hoy vs. ayer', current: todayTotal, previous: yesterday, detail: `Ayer a esta hora ${money.format(yesterday)}` },
      { title: 'Esta semana', current: thisWeek, previous: previousWeek, detail: `Semana anterior ${money.format(previousWeek)}` },
      { title: 'Este mes', current: thisMonth, previous: previousMonth, detail: `Mes anterior ${money.format(previousMonth)}` },
      { title: 'Últimos 7 días', current: last7, previous: previous7, detail: `7 días anteriores ${money.format(previous7)}` },
    ].map(item => ({ ...item, meta: comparisonMeta(item.current, item.previous) }))
  }, [data.sales, todayTotal])

  const setupSteps = [
    { done: data.products.length > 0, title: 'Productos cargados', text: data.products.length ? `${data.products.length} disponibles` : 'Cargá tu catálogo para empezar', action: 'products' as ViewKey },
    { done: cashOpen, title: 'Caja preparada', text: cashOpen ? 'Lista para operar' : 'Abrí la caja antes de vender', action: 'cash' as ViewKey },
    { done: data.sales.length > 0, title: 'Primera venta', text: data.sales.length ? 'Flujo probado correctamente' : 'Hacé una venta de prueba o real', action: 'pos' as ViewKey },
  ]
  const setupComplete = setupSteps.filter(step => step.done).length

  const quickActions: QuickAction[] = [
    ...(canSell ? [{ key:'pos' as ViewKey, icon:'sale' as UiIconName, title:'Nueva venta', text:'Cobrar y facturar', tone:'orange' as const }] : []),
    { key:'products', icon:'products', title:'Productos', text:'Precios, stock y costos' },
    { key:'cash', icon:'cash', title:'Caja diaria', text:'Apertura, movimientos y cierre' },
    { key:'assistant', icon:'sparkles', title:'Asistente IA', text:'Consultá tu operación', tone:'violet' },
  ]

  return <div className={styles.dashboard}>
    {role === 'supervisor' && <div className={styles.supervisor}>Panel de supervisión · los indicadores se muestran según tus permisos.</div>}

    <section className={styles.welcome}>
      <div>
        <span className={styles.kicker}>PANEL PRINCIPAL</span>
        <h1>{data.company.name}</h1>
        <p>Lo importante del comercio, ordenado para que puedas actuar sin buscar dónde está cada cosa.</p>
      </div>
      <div className={styles.welcomeStatus}>
        <span className={cashOpen ? styles.live : styles.paused}>{cashOpen ? 'Caja abierta' : 'Caja cerrada'}</span>
        <small>{new Date().toLocaleDateString('es-AR',{weekday:'long',day:'2-digit',month:'long'})}</small>
      </div>
    </section>

    <section className={styles.controlGrid}>
      {canSell ? <button className={styles.saleLaunch} onClick={()=>go('pos')}>
        <span className={styles.launchTexture}/>
        <span className={styles.launchIcon}><UiIcon name="sale" size={30}/></span>
        <span className={styles.launchCopy}>
          <small>ACCIÓN PRINCIPAL</small>
          <strong>Nueva venta</strong>
          <em>Buscá un producto, cobrá y seguí.</em>
        </span>
        <span className={styles.launchButton}>Empezar venta</span>
      </button> : <div className={styles.saleLaunchDisabled}>
        <span className={styles.launchIcon}><UiIcon name="reports" size={30}/></span>
        <span className={styles.launchCopy}><small>TU PANEL</small><strong>Seguimiento operativo</strong><em>Tu rol tiene acceso de consulta.</em></span>
      </div>}

      <div className={styles.firstRun}>
        <div className={styles.firstRunHead}>
          <div><span>PRIMEROS PASOS</span><h2>Listo para trabajar</h2></div>
          <strong>{setupComplete}/3</strong>
        </div>
        <div className={styles.progress}><i style={{width:`${setupComplete/3*100}%`}}/></div>
        <div className={styles.stepList}>
          {setupSteps.map((step,index)=><button key={step.title} className={step.done?styles.stepDone:''} onClick={()=>!step.done&&go(step.action)} disabled={step.done}>
            <span>{step.done?<UiIcon name="check" size={15}/>:String(index+1).padStart(2,'0')}</span>
            <div><b>{step.title}</b><small>{step.text}</small></div>
            {!step.done&&<strong>Ir</strong>}
          </button>)}
        </div>
      </div>
    </section>

    <section className={styles.metrics} aria-label="Indicadores del día">
      <button onClick={()=>go('sales')}><span>VENTAS HOY</span><strong>{money.format(todayTotal)}</strong><small>{todayCount} operación{todayCount===1?'':'es'}</small></button>
      <button onClick={()=>go('sales')}><span>TICKET PROMEDIO</span><strong>{money.format(todayAvg)}</strong><small>Promedio por operación</small></button>
      <button onClick={()=>go('products')} className={lowStock>0?styles.metricAlert:''}><span>STOCK PARA MIRAR</span><strong>{lowStock}</strong><small>{lowStock===1?'producto requiere atención':'productos requieren atención'}</small></button>
      <button onClick={()=>go('cash')}><span>ESTADO DE CAJA</span><strong>{cashOpen?'ABIERTA':'CERRADA'}</strong><small>{data.cashRegister?.opened_at?`Desde ${new Date(data.cashRegister.opened_at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}`:'Sin apertura activa'}</small></button>
    </section>

    <section className={styles.quickSection}>
      <div className={styles.sectionHead}><div><span>ACCESOS DIRECTOS</span><h2>Entrá a lo que necesitás.</h2></div><p>Las tareas más usadas quedan siempre a mano.</p></div>
      <div className={styles.quickGrid}>
        {quickActions.map(action=><button key={action.key} className={`${styles.quickCard} ${action.tone==='orange'?styles.quickOrange:action.tone==='violet'?styles.quickViolet:''}`} onClick={()=>go(action.key)}>
          <span className={styles.quickIcon}><UiIcon name={action.icon} size={21}/></span>
          <span><b>{action.title}</b><small>{action.text}</small></span>
          <i>ABRIR</i>
        </button>)}
      </div>
    </section>

    <section className={styles.lowerGrid}>
      <div className={styles.activity}>
        <div className={styles.sectionTitle}><div><span>ACTIVIDAD RECIENTE</span><h2>Últimas ventas</h2></div><button onClick={()=>go('sales')}>Ver ventas</button></div>
        <div className={styles.saleList}>
          {recent.length?recent.map(s=><button className={styles.saleRow} key={s.id} onClick={()=>go('sales')}>
            <span className={styles.saleIcon}>{s.cae?<UiIcon name="check" size={17}/>:<UiIcon name="receipt" size={17}/>}</span>
            <span className={styles.saleInfo}><b>{s.receiptNumber?`Factura C ${receiptNumber(s)}`:`Venta #${s.id.slice(0,8)}`}</b><small>{new Date(s.date).toLocaleString('es-AR')} · {s.payment}</small></span>
            <strong>{money.format(s.total)}</strong>
          </button>):<div className={styles.empty}>Todavía no hay ventas. Cuando registres la primera, va a aparecer acá.</div>}
        </div>
      </div>

      <div className={styles.comparisonPanel}>
        <div className={styles.sectionTitle}><div><span>CONTEXTO</span><h2>Cómo viene el negocio</h2></div></div>
        <div className={styles.comparisonList}>
          {comparisons.map(item=><div key={item.title} className={`${styles.comparisonCard} ${item.meta.direction==='up'?styles.comparisonUp:item.meta.direction==='down'?styles.comparisonDown:styles.comparisonFlat}`}>
            <div><span>{item.title}</span><b>{item.meta.text}</b></div>
            <small>{item.detail}</small>
          </div>)}
        </div>
      </div>
    </section>

    <section className={styles.simpleStrip}>
      <div><span>MODO SIMPLE</span><b>Una pantalla reducida para vender sin distracciones.</b></div>
      <button onClick={()=>window.dispatchEvent(new Event('comercio:enter-simple'))}>Abrir Modo Simple</button>
    </section>
  </div>
}
