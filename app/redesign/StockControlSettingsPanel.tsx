'use client'

import { useEffect, useState } from 'react'
import {
  loadSalesSettings,
  readCachedSalesSettings,
  saveStockControlSetting,
  type SalesSettings,
} from '@/lib/comercio/sales-settings'
import type { TenantSession } from '@/lib/comercio/types'
import styles from './settings-next.module.css'

export default function StockControlSettingsPanel({
  session,
  message,
}: {
  session: TenantSession
  message: (text: string) => void
}) {
  const [value, setValue] = useState<SalesSettings>(() => readCachedSalesSettings(session.companyId))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    void loadSalesSettings(session).then(next => { if (alive) setValue(next) }).catch(() => {})
    const sync = (event: Event) => {
      const next = (event as CustomEvent<SalesSettings>).detail
      if (next) setValue(next)
    }
    window.addEventListener('comercio:sales-settings', sync)
    return () => {
      alive = false
      window.removeEventListener('comercio:sales-settings', sync)
    }
  }, [session.companyId, session.token])

  const controlStock = !value.allowNegativeStock

  async function changeControl(nextControlStock: boolean) {
    if (busy) return
    const previous = value
    const optimistic = { ...value, allowNegativeStock: !nextControlStock }
    setValue(optimistic)
    setBusy(true)
    try {
      const saved = await saveStockControlSetting(session, nextControlStock)
      setValue(saved)
      message(nextControlStock
        ? 'Control de stock activado. El POS bloqueará productos sin existencias.'
        : 'Control de stock desactivado. Podés vender aunque el producto figure en 0.')
    } catch (error) {
      setValue(previous)
      message(error instanceof Error ? error.message : String(error))
    } finally {
      setBusy(false)
    }
  }

  return <section className={styles.panel} style={{ marginTop: 12 }}>
    <h3>Control de stock al vender</h3>
    <p>Por defecto Comercio Lleno prioriza la venta y no bloquea productos por falta de stock. Activá esta opción únicamente si querés que el POS controle existencias antes de vender.</p>
    <label className={styles.switch}>
      <span>
        <b>Controlar stock antes de vender</b>
        <small>{controlStock ? 'Activado: un producto en 0 no se puede agregar a la venta.' : 'Desactivado: podés vender productos aunque figuren en 0.'}</small>
      </span>
      <input
        type="checkbox"
        checked={controlStock}
        disabled={busy}
        onChange={event => void changeControl(event.target.checked)}
      />
    </label>
    <div className={styles.saveRow}>
      <small>{busy ? 'Guardando el cambio…' : 'El cambio se guarda automáticamente por comercio.'}</small>
      <span />
    </div>
  </section>
}
