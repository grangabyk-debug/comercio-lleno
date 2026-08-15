'use client'

import { useMemo } from 'react'
import BrandLogo from '../BrandLogo'
import type { CommerceSnapshot, ViewKey } from '@/lib/comercio/types'
import { receiptNumber } from '@/lib/comercio/receipt'
import { dayKey, money, Trend } from './operationalShared'
import UiIcon from './UiIcon'
import styles from './DashboardRevolution.module.css'

const merchantPhoto='https://images.pexels.com/photos/33752265/pexels-photo-33752265.jpeg?auto=compress&cs=tinysrgb&w=1500'

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
  const today = dayKey(new Date())
  const previousKey = useMemo(() => {
    const days = Array.from(new Set(data.sales.map(s => dayKey(s.date)).filter(k => k && k < today)))
    return days.sort().reverse()[0] || ''
  }, [data.sales, today])
  const previousSales = data.sales.filter(s => dayKey(s.date) === previousKey)
  const previousTotal = previousSales.reduce((a, s) => a + s.total, 0)
  const previousAvg = previousSales.length ? previousTotal / previousSales.length : 0
  const todayAvg = todayCount ? todayTotal / todayCount : 0
  const previousLabel = previousKey ? new Date(`${previousKey}T12:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) : 'el último día'
  const cashOpen = data.cashRegister?.status === 'open'

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
        <div className={styles.trendWrap}><Trend current={todayTotal} previous={previousTotal} label={previousLabel}/></div>
        <div className={styles.heroActions}>
          {canSell&&<button className={styles.sell} onClick={()=>go('pos')}><span>+</span>Nueva venta</button>}
          <button className={styles.simple} onClick={()=>window.dispatchEvent(new Event('comercio:enter-simple'))}>Modo Simple <span>→</span></button>
        </div>
      </div>

      <div className={styles.heroPhoto}>
        <img src={merchantPhoto} alt="Comercio de cercanía en Buenos Aires"/>
        <div aria-hidden="true" style={{position:'absolute',inset:0,zIndex:2,pointerEvents:'none',background:'linear-gradient(180deg,rgba(255,255,255,.58) 0%,rgba(255,255,255,.50) 58%,rgba(255,255,255,.28) 100%)'}}/>
        <div className={styles.photoBrand}><BrandLogo size={29}/></div>
        <div className={`${styles.cashBadge} ${cashOpen?styles.cashOpen:styles.cashClosed}`}>
          <i>{cashOpen?'●':'○'}</i><div><span>CAJA</span><b>{cashOpen?'Abierta':'Cerrada'}</b></div>
        </div>
        <div className={styles.photoCaption}><b>El comercio, adelante.</b><span>El sistema acompaña sin ocupar el centro.</span></div>
      </div>
    </section>

    <section className={styles.metrics} aria-label="Indicadores del día">
      <button onClick={()=>go('sales')}><span>01 · TICKET PROMEDIO</span><strong>{money.format(todayAvg)}</strong><small>{previousAvg>0?'Compará con el último día':'Se calcula con tus ventas'}</small></button>
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
