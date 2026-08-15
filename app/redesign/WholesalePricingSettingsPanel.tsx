'use client'

import { useEffect, useState } from 'react'
import {
  loadSalesSettings,
  readCachedSalesSettings,
  saveSalesSettings,
  type SalesSettings,
} from '@/lib/comercio/sales-settings'
import type { TenantSession } from '@/lib/comercio/types'
import styles from './settings-next.module.css'

export default function WholesalePricingSettingsPanel({
  session,
  message,
}: {
  session: TenantSession
  message: (text: string) => void
}) {
  const [value, setValue] = useState<SalesSettings>(() => readCachedSalesSettings(session.companyId))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void loadSalesSettings(session).then(setValue).catch(() => {})
    const sync = (event: Event) => {
      const next = (event as CustomEvent<SalesSettings>).detail
      if (next) setValue(next)
    }
    window.addEventListener('comercio:sales-settings', sync)
    return () => window.removeEventListener('comercio:sales-settings', sync)
  }, [session.companyId, session.token])

  async function save() {
    setBusy(true)
    try {
      const current = readCachedSalesSettings(session.companyId)
      const next = await saveSalesSettings(session, {
        ...current,
        wholesalePricingEnabled: value.wholesalePricingEnabled,
      })
      setValue(next)
      message(next.wholesalePricingEnabled
        ? 'Precio mayorista automático activado desde 3 unidades del mismo producto.'
        : 'Precio mayorista automático desactivado. El POS usará siempre el precio minorista.')
    } catch (error) {
      message(error instanceof Error ? error.message : String(error))
    } finally {
      setBusy(false)
    }
  }

  return <section className={styles.panel} style={{ marginTop: 12 }}>
    <h3>Precio mayorista automático</h3>
    <p>Cuando está activo, al cargar 3 o más unidades del mismo producto el precio unitario cambia al valor mayorista configurado para ese producto.</p>
    <label className={styles.switch}>
      <span>
        <b>Activar precio mayorista desde 3 unidades</b>
        <small>Si se desactiva, todas las ventas usan el precio minorista aunque el producto tenga precio mayorista cargado.</small>
      </span>
      <input
        type="checkbox"
        checked={value.wholesalePricingEnabled}
        onChange={event => setValue({ ...value, wholesalePricingEnabled: event.target.checked })}
      />
    </label>
    <div className={styles.saveRow}>
      <span />
      <button className={styles.primary} disabled={busy} onClick={() => void save()}>
        {busy ? 'Guardando…' : 'Guardar precio mayorista'}
      </button>
    </div>
  </section>
}
