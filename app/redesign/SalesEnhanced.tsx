'use client'

import { useState } from 'react'
import core from './page.module.css'
import enh from './enhancements.module.css'
import { deleteSaleAndRestoreStock, updateSaleNote } from '@/lib/comercio/operations'
import { downloadReceiptPdf, emailReceipt, printReceipt, receiptNumber } from '@/lib/comercio/receipt'
import type { CommerceSnapshot, DeviceSettings, Sale, TenantSession } from '@/lib/comercio/types'
import { Head, money } from './operationalShared'

export default function SalesEnhanced({ data, session, search, setSearch, page, setPage, device, onMessage, refresh }: {
  data: CommerceSnapshot
  session: TenantSession
  search: string
  setSearch: (v: string) => void
  page: number
  setPage: (v: number) => void
  device: DeviceSettings
  onMessage: (m: string) => void
  refresh: () => Promise<void>
}) {
  const [selected, setSelected] = useState<Sale | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const q = search.trim().toLowerCase()
  const filtered = data.sales.filter(s => `${s.id} ${s.receiptNumber || ''} ${s.payment} ${s.cae || ''} ${s.fiscal_status || ''} ${s.details?.note || ''}`.toLowerCase().includes(q))
  const size = 20
  const pages = Math.max(1, Math.ceil(filtered.length / size))
  const current = Math.min(page, pages - 1)
  const rows = filtered.slice(current * size, current * size + size)
  const canDeleteSales = session.role === 'owner' || session.permissions?.can_delete_sales === true

  function open(sale: Sale) {
    setSelected(sale)
    setNote(sale.details?.note || '')
  }

  async function doPrint(sale: Sale) {
    try { await printReceipt(sale, data.company, device) }
    catch (e) { onMessage(e instanceof Error ? e.message : String(e)) }
  }

  async function sendMail(sale: Sale) {
    const customer = data.customers.find(c => c.id === sale.customer_id)
    let email = customer?.email || ''
    if (!email) email = window.prompt('Email del cliente', '') || ''
    const result = await emailReceipt(sale, data.company, email)
    if (result === 'mailto') onMessage('Abrimos tu correo y descargamos el PDF para adjuntar.')
  }

  async function saveNote() {
    if (!selected) return
    setSaving(true)
    try {
      await updateSaleNote(session, selected, note)
      await refresh()
      setSelected({ ...selected, details: { ...(selected.details || {}), note } })
      onMessage('Nota guardada en la venta.')
    } catch (e) {
      onMessage(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  async function removeSale(sale: Sale) {
    if (!canDeleteSales || deletingId) return
    const ok = window.confirm('¿Desea eliminar esta venta?\n\nEl stock vendido será devuelto y la venta dejará de afectar reportes. Si existe una factura emitida en ARCA, esa factura seguirá existiendo fiscalmente y su CAE quedará archivado.')
    if (!ok) return
    setDeletingId(sale.id)
    try {
      await deleteSaleAndRestoreStock(session, sale.id)
      if (selected?.id === sale.id) setSelected(null)
      await refresh()
      onMessage('Venta eliminada. El stock fue devuelto y ya no se contabiliza en reportes.')
    } catch (e) {
      onMessage(e instanceof Error ? e.message : String(e))
    } finally {
      setDeletingId('')
    }
  }

  return <>
    <Head eyebrow="GESTIÓN" title="Ventas" subtitle="Tocá cualquier venta para abrir su detalle, notas y reimpresión." />

    <div className={core.tableTools}>
      <div className={core.searchSlim}><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar factura, operación, CAE, nota o medio de pago…" /></div>
    </div>

    <div className={core.table}>
      <div className={`${core.tableRow} ${core.tableHead}`}><span>Fecha</span><span>Comprobante</span><span>Pago</span><span>Total</span><span>Estado</span><span>Detalle</span></div>
      {rows.map(s => <div className={`${core.tableRow} ${enh.clickRow}`} key={s.id} onClick={() => open(s)}>
        <span><b>{new Date(s.date).toLocaleDateString('es-AR')}</b><small>{new Date(s.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</small></span>
        <span>{s.receiptNumber ? <><b>Factura C</b><small>{receiptNumber(s)}</small></> : <><b>Venta #{s.id.slice(0, 8)}</b><small>Sin comprobante fiscal</small></>}</span>
        <span>{s.payment}</span>
        <span><b>{money.format(s.total)}</b></span>
        <span>{s.cae ? <span className={`${core.badge} ${core.badgeGreen}`}>Autorizada</span> : <span className={`${core.badge} ${core.badgeAmber}`}>Pendiente ARCA</span>}</span>
        <span style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button className={core.secondary} onClick={e => { e.stopPropagation(); open(s) }}>Ver venta</button>
          {canDeleteSales && <button className={core.ghostDanger} disabled={deletingId === s.id} onClick={e => { e.stopPropagation(); void removeSale(s) }}>{deletingId === s.id ? 'Eliminando…' : 'Eliminar'}</button>}
        </span>
      </div>)}
    </div>

    <div className={core.pager}>
      <button disabled={current === 0} onClick={() => setPage(current - 1)}>← Anterior</button>
      <span>Página {current + 1} de {pages} · {filtered.length} ventas</span>
      <button disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>Siguiente →</button>
    </div>

    {selected && <div className={core.modal} onMouseDown={e => e.target === e.currentTarget && setSelected(null)}>
      <div className={`${core.modalCard} ${enh.saleModal}`}>
        <div className={core.modalHead}>
          <div>
            <span>DETALLE DE VENTA</span>
            <h3>{selected.receiptNumber ? `Factura C ${receiptNumber(selected)}` : `Venta #${selected.id.slice(0, 8)}`}</h3>
            <p>{new Date(selected.date).toLocaleString('es-AR')}</p>
          </div>
          <button onClick={() => setSelected(null)}>×</button>
        </div>

        <div className={enh.saleInfoGrid}>
          <div><span>Total</span><b>{money.format(selected.total)}</b></div>
          <div><span>Pago</span><b>{selected.payment}</b></div>
          <div><span>Cliente</span><b>{data.customers.find(c => c.id === selected.customer_id)?.name || 'Consumidor final'}</b></div>
          <div><span>Estado fiscal</span><b>{selected.cae ? 'Autorizada' : 'Pendiente ARCA'}</b></div>
          <div><span>CAE</span><b>{selected.cae || '—'}</b></div>
          <div><span>Nº comprobante</span><b>{selected.receiptNumber ? receiptNumber(selected) : '—'}</b></div>
          <div><span>Subtotal</span><b>{money.format(Number(selected.details?.subtotal_before_discount ?? selected.total))}</b></div>
          <div><span>Ahorro / descuentos</span><b>{money.format(Number(selected.details?.discount_amount || 0) + Number(selected.details?.promotion_savings || 0))}</b></div>
        </div>

        <div className={enh.itemList}>
          {(selected.details?.items || []).length ? (selected.details?.items || []).map((i, idx) => <div className={enh.itemRow} key={`${i.product_id}-${idx}`}>
            <span><b>{i.name}</b><small>{i.qty} × {money.format(i.unit_price)}{i.promotion_discount_percent ? ` · OFERTA ${i.promotion_discount_percent}%` : ''}</small></span>
            <span>{i.qty} u.</span>
            <b>{money.format(i.line_total)}</b>
          </div>) : <div className={enh.itemRow}><span>Sin detalle de productos guardado.</span></div>}
        </div>

        <div className={enh.noteBox}>
          <label>Nota interna de la venta</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Ej: cliente retira mercadería mañana…" />
        </div>

        <div className={enh.modalButtons}>
          <button onClick={() => doPrint(selected)}>▣ Reimprimir ticket</button>
          {selected.cae && <button onClick={() => downloadReceiptPdf(selected, data.company)}>↓ PDF</button>}
          {selected.cae && <button onClick={() => sendMail(selected)}>✉ Email</button>}
          <button className={enh.saveNote} disabled={saving} onClick={saveNote}>{saving ? 'Guardando…' : 'Guardar nota'}</button>
          {canDeleteSales && <button className={core.ghostDanger} disabled={Boolean(deletingId)} onClick={() => void removeSale(selected)}>{deletingId === selected.id ? 'Eliminando…' : 'Eliminar venta'}</button>}
        </div>
      </div>
    </div>}
  </>
}
