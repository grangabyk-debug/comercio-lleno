'use client'

import { useMemo } from 'react'
import core from './page.module.css'
import polish from './design-polish.module.css'
import type { CommerceSnapshot, ViewKey } from '@/lib/comercio/types'
import { receiptNumber } from '@/lib/comercio/receipt'
import { dayKey, Head, money, Trend } from './operationalShared'
import UiIcon from './UiIcon'

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

  return <>
    <Head eyebrow={data.company.name} title="Inicio" subtitle="Resumen del comercio y accesos de operación.">
      <button style={{border:'1px solid #8ed0e5',background:'#e9f8ff',color:'#19718d',borderRadius:11,padding:'10px 15px',fontWeight:950,cursor:'pointer'}} onClick={()=>window.dispatchEvent(new Event('comercio:enter-simple'))}>◫ Modo Simple</button>
    </Head>
    {role === 'supervisor' && <div className={core.notice}><span>Panel de supervisión · indicadores visibles según tus permisos.</span></div>}
    <div className={core.kpis}>
      <div className={`${core.kpi} ${core.kpiAccent} ${polish.kpiFeatured}`}><span>Ventas de hoy</span><strong>{money.format(todayTotal)}</strong><small>{todayCount} operaciones</small><Trend current={todayTotal} previous={previousTotal} label={previousLabel} /></div>
      <div className={`${core.kpi} ${polish.kpiFeatured}`}><span>Ticket promedio</span><strong>{money.format(todayAvg)}</strong><small>Promedio del día</small><Trend current={todayAvg} previous={previousAvg} label={previousLabel} /></div>
      <div className={core.kpi}><span>Stock bajo</span><strong>{lowStock}</strong><small>Productos para revisar</small></div>
      <div className={core.kpi}><span>Caja</span><strong>{data.cashRegister?.status === 'open' ? 'Abierta' : 'Cerrada'}</strong><small>{data.cashRegister?.opened_at ? `Desde ${new Date(data.cashRegister.opened_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : 'Sin apertura activa'}</small></div>
    </div>
    <div className={core.gridTwo}>
      <div className={core.panel}><div className={core.panelTitle}><div><b>Últimas ventas</b><small>Actividad más reciente</small></div><button className={core.linkButton} onClick={() => go('sales')}>Ver todas →</button></div>{recent.length ? recent.map(s => <div className={core.recentRow} key={s.id}><span className={`${core.roundIcon} ${polish.metalIcon}`}>{s.cae ? <UiIcon name="check" size={17}/> : <UiIcon name="alert" size={17}/>}</span><div><b>{s.receiptNumber ? `Factura C ${receiptNumber(s)}` : `Venta #${s.id.slice(0, 8)}`}</b><small>{new Date(s.date).toLocaleString('es-AR')} · {s.payment}</small></div><strong>{money.format(s.total)}</strong></div>) : <div className={core.empty}>Todavía no hay ventas.</div>}</div>
      <div className={core.panel}><div className={core.panelTitle}><div><b>Accesos rápidos</b><small>Funciones frecuentes</small></div></div><div className={core.shortcutGrid}>{canSell && <button className={core.shortcut} onClick={() => go('pos')}><span className={polish.metalIcon}><UiIcon name="sale" size={19}/></span><div><b>Nueva venta</b><small>Scanner, carrito y cobro</small></div></button>}<button className={core.shortcut} onClick={() => go('products')}><span className={polish.metalIcon}><UiIcon name="products" size={19}/></span><div><b>Productos</b><small>Editar precios, stock y costos</small></div></button><button className={core.shortcut} onClick={() => go('cash')}><span className={polish.metalIcon}><UiIcon name="cash" size={19}/></span><div><b>Caja diaria</b><small>Cierre y contador de billetes</small></div></button></div></div>
    </div>
  </>
}
