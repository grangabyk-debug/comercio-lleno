'use client'

import { useEffect, useState } from 'react'
import {
  loadSalesSettings,
  readCachedSalesSettings,
  saveSalesSettings,
  type SalesSettings,
} from '@/lib/comercio/sales-settings'
import type { TenantSession } from '@/lib/comercio/types'

export default function WhatsAppAutoTicketSetting({ session, message }: { session: TenantSession; message: (m: string) => void }) {
  const [value, setValue] = useState<SalesSettings>(() => readCachedSalesSettings(session.companyId))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void loadSalesSettings(session).then(setValue).catch(() => {})
  }, [session.companyId])

  async function toggle(enabled: boolean) {
    if (busy) return
    const previous = value
    const next = { ...value, whatsappAutoTicket: enabled }
    setValue(next)
    setBusy(true)
    try {
      const saved = await saveSalesSettings(session, next)
      setValue(saved)
      message(saved.whatsappAutoTicket ? 'Envío automático de tickets por WhatsApp activado.' : 'Envío automático de tickets por WhatsApp desactivado.')
    } catch (error) {
      setValue(previous)
      message(error instanceof Error ? error.message : String(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section style={{ border: '1px solid #dfe7e3', borderRadius: 14, padding: 16, display: 'grid', gap: 12 }}>
      <div>
        <h4 style={{ margin: '0 0 5px' }}>Automatización de tickets</h4>
        <p style={{ margin: 0, opacity: .72, lineHeight: 1.5 }}>
          Si está activada, al finalizar una venta se envía el comprobante únicamente cuando cargás un número de WhatsApp para esa venta.
        </p>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, cursor: busy ? 'wait' : 'pointer' }}>
        <span>
          <b>Enviar ticket al terminar la venta</b><br />
          <small style={{ opacity: .65 }}>Apagado por defecto. Un fallo de WhatsApp nunca cancela la venta.</small>
        </span>
        <input
          type="checkbox"
          checked={value.whatsappAutoTicket}
          disabled={busy}
          onChange={e => void toggle(e.target.checked)}
          style={{ width: 20, height: 20 }}
        />
      </label>
    </section>
  )
}
