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
      const threshold = Math.max(2, Math.trunc(Number(value.wholesaleMinQuantity || 3)))
      const next = await saveSalesSettings(session, {
        ...current,
        wholesalePricingEnabled: value.wholesalePricingEnabled,
        wholesaleMinQuantity: threshold,
      })
      setValue(next)
      message(next.wholesalePricingEnabled
        ? `Precio mayorista automático activado desde ${next.wholesaleMinQuantity} unidades del mismo producto.`
        : 'Precio mayorista automático desactivado. El POS usará siempre el precio minorista.')
    } catch (error) {
      message(error instanceof Error ? error.message : String(error))
    } finally {
      setBusy(false)
    }
  }

  return <section className={styles.panel} style={{ marginTop: 12 }}>
    <h3>Precio mayorista automático</h3>
    <p>Activá el precio mayorista y elegí desde cuántas unidades del mismo producto querés que se aplique automáticamente.</p>
    <label className={styles.switch}>
      <span>
        <b>Activar precio mayorista</b>
        <small>Si se desactiva, todas las ventas usan el precio minorista aunque el producto tenga precio mayorista cargado.</small>
      </span>
      <input
        type="checkbox"
        checked={value.wholesalePricingEnabled}
        onChange={event => setValue({ ...value, wholesalePricingEnabled: event.target.checked })}
      />
    </label>
    <label style={{display:'grid',gap:7,maxWidth:340,marginTop:14,fontWeight:800}}>
      Aplicar desde
      <span style={{display:'flex',gap:8,alignItems:'center'}}>
        <input
          type="number"
          min="2"
          step="1"
          inputMode="numeric"
          disabled={!value.wholesalePricingEnabled}
          value={value.wholesaleMinQuantity}
          onChange={event => setValue({ ...value, wholesaleMinQuantity: Math.max(2, Number(event.target.value || 2)) })}
          style={{width:110,height:42,borderRadius:10,border:'1px solid #cfd8d3',padding:'0 12px',fontWeight:900}}
        />
        <span style={{fontSize:13,fontWeight:700}}>unidades del mismo producto</span>
      </span>
      <small style={{fontWeight:500,opacity:.72}}>Ejemplo: si elegís 5, el quinto artículo y los siguientes usan el precio mayorista cargado para ese producto.</small>
    </label>
    <div className={styles.saveRow}>
      <span />
      <button className={styles.primary} disabled={busy} onClick={() => void save()}>
        {busy ? 'Guardando…' : 'Guardar precio mayorista'}
      </button>
    </div>
  </section>
}
