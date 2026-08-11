'use client'

import { useState, type FormEvent } from 'react'
import core from './page.module.css'
import enh from './enhancements.module.css'
import { createCashMovement } from '@/lib/comercio/operations'
import type { CommerceSnapshot, Sale, TenantSession } from '@/lib/comercio/types'
import { receiptNumber } from '@/lib/comercio/receipt'
import { Head, money } from './operationalShared'

const denoms = [100, 200, 500, 1000, 2000, 5000, 10000, 20000]

export default function CashEnhanced({
  data, session, sessionSales, movements, cashEstimated,
  openCash, closeCash, refresh, message,
}: {
  data: CommerceSnapshot
  session: TenantSession
  sessionSales: Sale[]
  movements: CommerceSnapshot['cashMovements']
  cashEstimated: number
  openCash: () => void
  closeCash: () => void
  refresh: () => Promise<void>
  message: (m: string) => void
}) {
  const [counts, setCounts] = useState<Record<number, number>>({})
  const [movement, setMovement] = useState<'expense' | 'income' | 'egress' | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const counted = denoms.reduce((sum, d) => sum + d * (counts[d] || 0), 0)
  const salesTotal = sessionSales.reduce((a, s) => a + s.total, 0)
  const expenses = movements.filter(m => m.kind === 'expense' || m.kind === 'egress').reduce((a, m) => a + m.amount, 0)
  const diff = counted - cashEstimated

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!movement) return
    setBusy(true)
    try {
      await createCashMovement(session, movement, Number(String(amount).replace(',', '.')), note)
      setAmount('')
      setNote('')
      setMovement(null)
      await refresh()
      message('Movimiento de caja registrado.')
    } catch (e) {
      message(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return <>
    <Head eyebrow="CONTROL DE CAJA" title="Caja diaria" subtitle="Apertura, movimientos, cierre y arqueo de efectivo.">
      <div className={enh.cashActions}>
        <button className={enh.openButton} disabled={data.cashRegister?.status === 'open'} onClick={openCash}>＋ Abrir caja</button>
        <button className={enh.closeButton} disabled={data.cashRegister?.status !== 'open'} onClick={closeCash}>Cerrar caja</button>
      </div>
    </Head>

    <div className={core.cashHero}>
      <div className={core.cashStat}><span>Estado</span><strong>{data.cashRegister?.status === 'open' ? 'Abierta' : 'Cerrada'}</strong></div>
      <div className={core.cashStat}><span>Apertura</span><strong>{money.format(Number(data.cashRegister?.opening_amount || 0))}</strong></div>
      <div className={core.cashStat}><span>Ventas sesión</span><strong>{money.format(salesTotal)}</strong></div>
      <div className={core.cashStat}><span>Efectivo estimado</span><strong>{money.format(cashEstimated)}</strong></div>
    </div>

    <div className={enh.movementBar}>
      <button className={`${enh.movementButton} ${enh.movementButtonExpense}`} disabled={data.cashRegister?.status !== 'open'} onClick={() => setMovement('expense')}>− Cargar gasto</button>
      <button className={`${enh.movementButton} ${enh.movementButtonIncome}`} disabled={data.cashRegister?.status !== 'open'} onClick={() => setMovement('income')}>＋ Cargar ingreso</button>
      <button className={enh.movementButton} disabled={data.cashRegister?.status !== 'open'} onClick={() => setMovement('egress')}>↗ Retiro de efectivo</button>
    </div>

    {movement && <form className={enh.movementForm} onSubmit={submit}>
      <label>Importe<input autoFocus value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" placeholder="$ 0" /></label>
      <label>Concepto<input value={note} onChange={e => setNote(e.target.value)} placeholder={movement === 'expense' ? 'Ej: compra de bolsas' : movement === 'income' ? 'Ej: cambio agregado' : 'Ej: retiro a tesorería'} /></label>
      <button className={core.primary} disabled={busy}>{busy ? 'Guardando…' : 'Registrar'}</button>
    </form>}

    <div className={core.cashLayout}>
      <div className={core.panel}>
        <div className={core.panelTitle}><div><b>Actividad desde la apertura</b><small>{sessionSales.length} ventas · gastos/retiros {money.format(expenses)}</small></div></div>
        {sessionSales.slice(0, 14).map(s => <div className={core.recentRow} key={s.id}>
          <span className={core.roundIcon}>{s.cae ? '✓' : '!'}</span>
          <div><b>{s.receiptNumber ? `Factura ${receiptNumber(s)}` : `Venta #${s.id.slice(0, 8)}`}</b><small>{new Date(s.date).toLocaleString('es-AR')} · {s.payment}</small></div>
          <strong>{money.format(s.total)}</strong>
        </div>)}
        {movements.slice(0, 8).map(m => <div className={core.recentRow} key={m.id}>
          <span className={core.roundIcon}>{m.kind === 'income' ? '+' : '−'}</span>
          <div><b>{m.kind === 'income' ? 'Ingreso' : m.kind === 'egress' ? 'Retiro' : 'Gasto'}</b><small>{new Date(m.occurred_at).toLocaleString('es-AR')} · {m.note || 'Sin nota'}</small></div>
          <strong>{m.kind === 'income' ? '+ ' : '− '}{money.format(m.amount)}</strong>
        </div>)}
      </div>

      <div className={core.counterCard}>
        <div className={core.counterHead}>
          <div><span>CONTADOR DE BILLETES</span><h3>Arqueo rápido</h3></div>
          <div className={core.counterTotal}><small>Total contado</small><strong>{money.format(counted)}</strong></div>
        </div>
        <div className={core.denomList}>
          {denoms.map(d => <div className={core.denomRow} key={d}>
            <label className={enh.banknote}><span className={enh.billIcon}>$</span>{money.format(d)}</label>
            <span>×</span>
            <input type="number" min="0" inputMode="numeric" value={counts[d] || ''} onChange={e => setCounts({ ...counts, [d]: Math.max(0, Number(e.target.value) || 0) })} />
            <b>{money.format(d * (counts[d] || 0))}</b>
          </div>)}
        </div>
        <div className={core.counterSummary}>
          <div><span>Sistema</span><b>{money.format(cashEstimated)}</b></div>
          <div><span>Contado</span><b>{money.format(counted)}</b></div>
          <div className={Math.abs(diff) < 1 ? core.diffOk : core.diffBad}><span>Diferencia</span><b>{money.format(diff)}</b></div>
        </div>
        <button className={core.counterReset} onClick={() => setCounts({})}>Limpiar conteo</button>
      </div>
    </div>
  </>
}
