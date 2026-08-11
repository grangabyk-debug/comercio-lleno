'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CompanyProfile, DeviceSettings } from '@/lib/comercio/types'
import styles from './printer-settings.module.css'

type Props = {
  company: CompanyProfile
  device: DeviceSettings
  onSave: (next: DeviceSettings) => void
  message: (text: string) => void
}

const RECOMMENDED: DeviceSettings = {
  paper: '58',
  autoPrint: true,
  printerMode: 'browser',
  printerName: '',
  receiptCopies: 1,
  receiptAddress: '',
  receiptPhone: '',
  receiptHeader: '',
  receiptFooter: 'Gracias por su compra',
  showBusinessName: true,
  showTaxId: true,
  showPaymentMethod: true,
  showCustomer: true,
  showSeller: true,
  showBarcode: false,
  showFiscalData: true,
  compactTicket: false,
}

function Toggle({ checked, onChange, title, detail, disabled = false }: { checked: boolean; onChange: (value: boolean) => void; title: string; detail?: string; disabled?: boolean }) {
  return <label className={`${styles.toggleRow} ${disabled ? styles.disabled : ''}`}>
    <span><b>{title}</b>{detail && <small>{detail}</small>}</span>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)} />
  </label>
}

function testHtml(company: CompanyProfile, device: DeviceSettings) {
  const width = device.paper === '58' ? '58mm' : '80mm'
  const address = device.receiptAddress?.trim() || ''
  const phone = device.receiptPhone?.trim() || ''
  const footer = device.receiptFooter?.trim() || 'Gracias por su compra'
  const compact = Boolean(device.compactTicket)
  return `<!doctype html><html><head><meta charset="utf-8"><title>Prueba de impresión</title><style>
    @page{margin:2.5mm;size:${device.paper}mm auto}*{box-sizing:border-box}body{width:${width};margin:0 auto;font-family:Arial,sans-serif;color:#111;font-size:${compact ? '9px' : '10.5px'};line-height:1.3}.c{text-align:center}.r{text-align:right}.line{border-top:1px dashed #222;margin:7px 0}.test{font-size:15px;font-weight:900;border:2px solid #111;padding:6px;text-align:center;margin-bottom:7px}.business{font-size:13px;font-weight:900}.meta{margin:5px 0}.row{display:grid;grid-template-columns:1fr auto;gap:6px;padding:4px 0;border-bottom:1px solid #ddd}.total{font-size:16px;font-weight:900;text-align:right;margin:8px 0}.foot{margin-top:8px;text-align:center;font-weight:700}.hint{font-size:8px;text-align:center;margin-top:7px}
  </style></head><body><div class="test">PRUEBA DE IMPRESIÓN</div><div class="c"><div class="business">${company.name}</div>${company.tax_id ? `<div>CUIT ${company.tax_id}</div>` : ''}${address ? `<div>${address}</div>` : ''}${phone ? `<div>${phone}</div>` : ''}<div>${device.receiptHeader || ''}</div></div><div class="line"></div><div class="meta"><b>Papel:</b> ${device.paper} mm<br><b>Modo:</b> ${device.printerMode === 'browser' ? 'Navegador' : 'Bridge local'}<br><b>Copias:</b> ${device.receiptCopies}</div><div class="row"><span>Producto de prueba</span><b>$ 1.000</b></div><div class="row"><span>Segundo producto</span><b>$ 500</b></div><div class="total">TOTAL $ 1.500</div><div class="line"></div><div class="foot">${footer}</div><div class="hint">Comercio Lleno · Ticket de prueba · Sin validez fiscal</div></body></html>`
}

export default function PrinterSettingsPanel({ company, device, onSave, message }: Props) {
  const [draft, setDraft] = useState<DeviceSettings>({ ...RECOMMENDED, ...device })
  const [bridgeReady, setBridgeReady] = useState(false)

  useEffect(() => setDraft({ ...RECOMMENDED, ...device }), [device])
  useEffect(() => {
    setBridgeReady(Boolean(window.ComercioLlenoPrintBridge?.printHtml))
  }, [])

  const readySummary = useMemo(() => {
    if (draft.printerMode === 'bridge' && !bridgeReady) return 'El bridge local no está detectado en esta PC.'
    return `Lista para probar en ${draft.paper} mm · ${draft.receiptCopies} copia${draft.receiptCopies === 1 ? '' : 's'} · ${draft.autoPrint ? 'autoimpresión activa' : 'impresión manual'}.`
  }, [draft, bridgeReady])

  function update<K extends keyof DeviceSettings>(key: K, value: DeviceSettings[K]) {
    setDraft(current => ({ ...current, [key]: value }))
  }

  function save() {
    const next = { ...draft }
    onSave(next)
    setDraft(next)
    message('Impresora y formato del ticket guardados en esta PC.')
  }

  function recommended() {
    const next = { ...RECOMMENDED, receiptAddress: draft.receiptAddress || '', receiptPhone: draft.receiptPhone || '' }
    setDraft(next)
    onSave(next)
    message('Configuración recomendada aplicada. Ya podés hacer una impresión de prueba.')
  }

  function printTest() {
    const frame = document.createElement('iframe')
    frame.setAttribute('aria-hidden', 'true')
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0'
    document.body.appendChild(frame)
    const doc = frame.contentDocument
    if (!doc) { frame.remove(); message('No se pudo preparar la impresión de prueba.'); return }
    doc.open(); doc.write(testHtml(company, draft)); doc.close()
    setTimeout(() => {
      frame.contentWindow?.focus()
      frame.contentWindow?.print()
      setTimeout(() => frame.remove(), 1800)
    }, 180)
  }

  return <div className={styles.wrap}>
    <div className={styles.hero}>
      <div>
        <span className={styles.eyebrow}>IMPRESORA TÉRMICA</span>
        <h3>Configuración simple, pensada para el mostrador.</h3>
        <p>Si la impresora ya funciona en Windows con tu sistema anterior, empezá con <b>Navegador</b>. Comercio Lleno abrirá el diálogo de impresión usando la impresora instalada en esa PC.</p>
      </div>
      <div className={styles.heroActions}>
        <button type="button" className={styles.recommended} onClick={recommended}>Usar configuración recomendada</button>
        <button type="button" className={styles.testButton} onClick={printTest}>Imprimir prueba</button>
      </div>
    </div>

    <div className={styles.statusCard}>
      <span className={styles.statusDot}></span>
      <div><b>Preparada para prueba</b><small>{readySummary}</small></div>
      <span className={styles.pcBadge}>Esta PC</span>
    </div>

    <div className={styles.twoCols}>
      <section className={styles.card}>
        <div className={styles.cardHead}><div><span>PASO 1</span><h4>Tamaño del rollo</h4></div><b className={styles.recommendedBadge}>Recomendado: 58 mm</b></div>
        <div className={styles.paperGrid}>
          <button type="button" className={draft.paper === '80' ? styles.paperActive : ''} onClick={() => update('paper', '80')}><strong>80 mm</strong><span>Ticket más cómodo y legible</span><i className={styles.paper80}></i></button>
          <button type="button" className={draft.paper === '58' ? styles.paperActive : ''} onClick={() => update('paper', '58')}><strong>58 mm</strong><span>Para impresoras compactas</span><i className={styles.paper58}></i></button>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHead}><div><span>PASO 2</span><h4>Cómo imprimir</h4></div></div>
        <div className={styles.modeGrid}>
          <button type="button" className={draft.printerMode === 'browser' ? styles.modeActive : ''} onClick={() => update('printerMode', 'browser')}><b>Navegador</b><span>Recomendado para empezar hoy. Usa la impresora instalada en Windows.</span></button>
          <button type="button" className={draft.printerMode === 'bridge' ? styles.modeActive : ''} disabled={!bridgeReady} onClick={() => update('printerMode', 'bridge')}><b>Automático / Bridge</b><span>{bridgeReady ? 'Conector local detectado. Permite impresión directa.' : 'Requiere el conector local. No detectado en esta PC.'}</span></button>
        </div>
      </section>
    </div>

    <div className={styles.layout}>
      <div className={styles.controls}>
        <section className={styles.card}>
          <div className={styles.cardHead}><div><span>PASO 3</span><h4>Comportamiento</h4></div></div>
          <div className={styles.behaviourGrid}>
            <label><span>Copias por venta</span><input type="number" min="1" max="3" value={draft.receiptCopies} onChange={e => update('receiptCopies', Math.max(1, Math.min(3, Number(e.target.value) || 1)))} /></label>
            <label><span>Nombre de impresora <small>solo Bridge</small></span><input value={draft.printerName} disabled={draft.printerMode !== 'bridge'} onChange={e => update('printerName', e.target.value)} placeholder="Ej. EPSON TM-T20" /></label>
          </div>
          <Toggle checked={draft.autoPrint} onChange={v => update('autoPrint', v)} title="Imprimir automáticamente al finalizar la venta" detail="En modo Navegador puede aparecer el cuadro de impresión del navegador." />
          <Toggle checked={Boolean(draft.compactTicket)} onChange={v => update('compactTicket', v)} title="Ticket compacto" detail="Reduce espacios para ahorrar papel." />
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}><div><span>PASO 4</span><h4>Datos del encabezado</h4></div></div>
          <div className={styles.fields}>
            <label>Dirección del comercio<input value={draft.receiptAddress || ''} onChange={e => update('receiptAddress', e.target.value)} placeholder="Ej. Av. Mitre 1234, Berazategui" /></label>
            <label>Teléfono / WhatsApp<input value={draft.receiptPhone || ''} onChange={e => update('receiptPhone', e.target.value)} placeholder="Ej. 11 5555-5555" /></label>
            <label>Texto debajo del encabezado<input value={draft.receiptHeader || ''} onChange={e => update('receiptHeader', e.target.value)} placeholder="Ej. Venta minorista y mayorista" /></label>
            <label>Mensaje al pie<input value={draft.receiptFooter || ''} onChange={e => update('receiptFooter', e.target.value)} placeholder="Gracias por su compra" /></label>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}><div><span>PASO 5</span><h4>Qué mostrar en el ticket</h4></div></div>
          <div className={styles.toggles}>
            <Toggle checked={draft.showBusinessName !== false} onChange={v => update('showBusinessName', v)} title="Nombre del comercio" />
            <Toggle checked={draft.showTaxId !== false} onChange={v => update('showTaxId', v)} title="CUIT" />
            <Toggle checked={draft.showPaymentMethod !== false} onChange={v => update('showPaymentMethod', v)} title="Medio de pago" />
            <Toggle checked={draft.showCustomer !== false} onChange={v => update('showCustomer', v)} title="Cliente" detail="Se muestra cuando la venta tiene un cliente asociado." />
            <Toggle checked={draft.showSeller !== false} onChange={v => update('showSeller', v)} title="Vendedor / cajero" detail="Se muestra cuando la operación registra el usuario." />
            <Toggle checked={Boolean(draft.showBarcode)} onChange={v => update('showBarcode', v)} title="Código de barras debajo del producto" />
            <Toggle checked={true} onChange={() => {}} disabled title="CAE y datos fiscales" detail="Se mantienen siempre en comprobantes fiscales autorizados por ARCA." />
          </div>
        </section>

        <div className={styles.saveBar}>
          <div><b>La configuración queda guardada por comercio y por PC.</b><span>No modifica la impresora de Windows ni el sistema anterior.</span></div>
          <button type="button" onClick={save}>Guardar configuración</button>
        </div>
      </div>

      <aside className={styles.previewCard}>
        <div className={styles.previewHead}><div><span>VISTA PREVIA</span><b>{draft.paper} mm</b></div><small>Así se va a ver aproximadamente</small></div>
        <div className={`${styles.ticket} ${draft.paper === '58' ? styles.ticket58 : ''} ${draft.compactTicket ? styles.compact : ''}`}>
          <div className={styles.ticketCenter}>
            <strong>FACTURA C</strong>
            {draft.showBusinessName !== false && <b>{company.name}</b>}
            {draft.showTaxId !== false && company.tax_id && <span>CUIT {company.tax_id}</span>}
            {draft.receiptAddress && <span>{draft.receiptAddress}</span>}
            {draft.receiptPhone && <span>{draft.receiptPhone}</span>}
            {draft.receiptHeader && <em>{draft.receiptHeader}</em>}
          </div>
          <div className={styles.ticketBox}><b>Comprobante:</b> 0001-00000123<br/><b>Fecha:</b> 11/08/2026 08:45{draft.showPaymentMethod !== false && <><br/><b>Medio de pago:</b> Efectivo</>}</div>
          <div className={styles.ticketTable}>
            <div><b>Producto</b><b>Cant.</b><b>Subtotal</b></div>
            <div><span>Detergente 750 ml{draft.showBarcode && <small>7790001234567</small>}</span><span>2</span><span>$ 4.000</span></div>
            <div><span>Suavizante 900 ml{draft.showBarcode && <small>7790007654321</small>}</span><span>1</span><span>$ 2.100</span></div>
          </div>
          <div className={styles.ticketTotal}>TOTAL $ 6.100</div>
          <div className={styles.ticketBox}><b>CAE:</b> 00000000000000<br/><b>Vencimiento CAE:</b> 21/08/2026</div>
          <div className={styles.ticketCenter}><b>{draft.receiptFooter || 'Gracias por su compra'}</b><span>Comprobante generado por Comercio Lleno</span></div>
        </div>
        <button type="button" className={styles.previewPrint} onClick={printTest}>Imprimir ticket de prueba</button>
        <p>Cuando aparezca el diálogo de Windows/Chrome, elegí la térmica que ya usás en el local. Si imprime bien, dejala como impresora predeterminada para agilizar las próximas ventas.</p>
      </aside>
    </div>
  </div>
}