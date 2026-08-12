'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CompanyProfile, DeviceSettings } from '@/lib/comercio/types'
import { readTenantSession } from '@/lib/comercio/session'
import styles from './printer-settings.module.css'

type Props = {
  company: CompanyProfile
  device: DeviceSettings
  onSave: (next: DeviceSettings) => void
  message: (text: string) => void
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

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

const sharedKeys: Array<keyof DeviceSettings> = [
  'receiptAddress','receiptPhone','receiptHeader','receiptFooter',
  'showBusinessName','showTaxId','showPaymentMethod','showCustomer','showSeller','showBarcode','showFiscalData',
]

function sharedReceiptSettings(settings: DeviceSettings) {
  const result: Record<string, unknown> = {}
  for (const key of sharedKeys) result[key] = settings[key]
  return result
}

function Toggle({ checked, onChange, title, detail, disabled = false }: { checked: boolean; onChange: (value: boolean) => void; title: string; detail?: string; disabled?: boolean }) {
  return <label className={`${styles.toggleRow} ${disabled ? styles.disabled : ''}`}>
    <span><b>{title}</b>{detail && <small>{detail}</small>}</span>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)} />
  </label>
}

function testHtml(company: CompanyProfile, device: DeviceSettings) {
  const paper = device.paper
  const address = device.receiptAddress?.trim() || ''
  const phone = device.receiptPhone?.trim() || ''
  const footer = device.receiptFooter?.trim() || 'Gracias por su compra'
  const compact = Boolean(device.compactTicket)
  return `<!doctype html><html><head><meta charset="utf-8"><title>Prueba de impresión</title><style>
    @page{margin:0;size:${paper}mm auto}html,body{width:${paper}mm!important;margin:0!important;padding:0!important;min-height:0!important;height:auto!important}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111;font-size:${compact ? '11.5px' : '12.5px'};line-height:${compact ? '1.17' : '1.23'};padding:1.2mm 1.4mm .4mm!important}.c{text-align:center}.r{text-align:right}.line{border-top:1px dashed #222;margin:4px 0}.test{font-size:16px;font-weight:900;border:2px solid #111;padding:4px;text-align:center;margin-bottom:4px}.business{font-size:15px;font-weight:900}.meta{margin:3px 0}.row{display:grid;grid-template-columns:1fr auto;gap:5px;padding:2px 0;border-bottom:1px solid #ddd}.total{font-size:18px;font-weight:900;text-align:right;margin:5px 0}.foot{margin-top:4px;text-align:center;font-weight:700}.hint{font-size:9px;text-align:center;margin-top:3px}
  </style></head><body><div class="test">PRUEBA DE IMPRESIÓN</div><div class="c"><div class="business">${company.name}</div>${company.tax_id ? `<div>CUIT ${company.tax_id}</div>` : ''}${address ? `<div>${address}</div>` : ''}${phone ? `<div>${phone}</div>` : ''}<div>${device.receiptHeader || ''}</div></div><div class="line"></div><div class="meta"><b>Papel:</b> ${paper} mm<br><b>Modo:</b> ${device.printerMode === 'browser' ? 'Navegador' : 'Bridge local'}<br><b>Copias:</b> ${device.receiptCopies}</div><div class="row"><span>Producto de prueba</span><b>$ 1.000</b></div><div class="row"><span>Segundo producto</span><b>$ 500</b></div><div class="total">TOTAL $ 1.500</div><div class="line"></div><div class="foot">${footer}</div><div class="hint">Comercio Lleno · Ticket de prueba · Sin validez fiscal</div></body></html>`
}

export default function PrinterSettingsPanel({ company, device, onSave, message }: Props) {
  const [draft, setDraft] = useState<DeviceSettings>({ ...RECOMMENDED, ...device })
  const [bridgeReady, setBridgeReady] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => setDraft(current => ({ ...current, ...device })), [device])
  useEffect(() => {
    const detect = () => setBridgeReady(Boolean(window.ComercioLlenoPrintBridge?.printHtml))
    detect()
    const timer = window.setInterval(detect, 1500)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const session = readTenantSession()
    if (!session) return
    let cancelled = false
    fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(session.companyId)}&select=receipt_settings&limit=1`, {
      headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${session.token}` },
      cache: 'no-store',
    }).then(async response => {
      if (!response.ok) return
      const rows = await response.json().catch(() => [])
      const shared = Array.isArray(rows) ? rows[0]?.receipt_settings : null
      if (!cancelled && shared && typeof shared === 'object') setDraft(current => ({ ...current, ...shared }))
    }).catch(() => {})
    return () => { cancelled = true }
  }, [company.id])

  const readySummary = useMemo(() => {
    if (draft.printerMode === 'bridge' && !bridgeReady) return 'Bridge seleccionado. Todavía no se detecta el conector local; mientras tanto la impresión usa el navegador como respaldo.'
    if (draft.printerMode === 'bridge') return 'Bridge local detectado: impresión directa disponible en esta PC.'
    return `Lista para probar en ${draft.paper} mm · ${draft.receiptCopies} copia${draft.receiptCopies === 1 ? '' : 's'} · ${draft.autoPrint ? 'autoimpresión activa' : 'impresión manual'}.`
  }, [draft, bridgeReady])

  function update<K extends keyof DeviceSettings>(key: K, value: DeviceSettings[K]) {
    setDraft(current => ({ ...current, [key]: value }))
  }

  async function saveCloud(next: DeviceSettings) {
    const session = readTenantSession()
    if (!session) return false
    const response = await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(session.companyId)}`, {
      method: 'PATCH',
      headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ receipt_settings: sharedReceiptSettings(next) }),
      cache: 'no-store',
    })
    if (!response.ok) throw new Error((await response.text()) || 'No se pudieron guardar los datos del ticket en la nube.')
    return true
  }

  async function save(label = 'Impresora y formato del ticket guardados.') {
    const next = { ...draft }
    setSaving(true)
    try {
      onSave(next)
      await saveCloud(next)
      setDraft(next)
      message(`${label} Los datos del encabezado quedan guardados para el comercio; la impresora queda guardada en esta PC.`)
    } catch (e) {
      message(e instanceof Error ? e.message : String(e))
    } finally { setSaving(false) }
  }

  async function recommended() {
    const next = { ...RECOMMENDED, receiptAddress: draft.receiptAddress || '', receiptPhone: draft.receiptPhone || '', receiptHeader: draft.receiptHeader || '', receiptFooter: draft.receiptFooter || 'Gracias por su compra' }
    setDraft(next)
    onSave(next)
    try { await saveCloud(next); message('Configuración recomendada aplicada y guardada.') }
    catch { message('Configuración recomendada aplicada en esta PC. No se pudo sincronizar el encabezado en la nube.') }
  }

  async function printTest() {
    const html = testHtml(company, draft)
    if (draft.printerMode === 'bridge' && window.ComercioLlenoPrintBridge?.printHtml) {
      try { await window.ComercioLlenoPrintBridge.printHtml({ html, printerName: draft.printerName, paper: draft.paper, copies: draft.receiptCopies }); return }
      catch (e) { message(`El Bridge respondió con error. Abro el navegador como respaldo. ${e instanceof Error ? e.message : ''}`) }
    } else if (draft.printerMode === 'bridge') {
      message('Bridge seleccionado, pero todavía no está conectado en esta PC. Abro el diálogo del navegador como respaldo.')
    }
    const frame = document.createElement('iframe')
    frame.setAttribute('aria-hidden', 'true')
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0'
    document.body.appendChild(frame)
    const doc = frame.contentDocument
    if (!doc) { frame.remove(); message('No se pudo preparar la impresión de prueba.'); return }
    doc.open(); doc.write(html); doc.close()
    setTimeout(() => { frame.contentWindow?.focus(); frame.contentWindow?.print(); setTimeout(() => frame.remove(), 1200) }, 160)
  }

  return <div className={styles.wrap}>
    <div className={styles.hero}><div><span className={styles.eyebrow}>IMPRESORA TÉRMICA</span><h3>Configuración simple, pensada para el mostrador.</h3><p>Elegí 58 u 80 mm. Navegador funciona sin instalación; Bridge queda disponible para impresión directa cuando el conector local esté instalado.</p></div><div className={styles.heroActions}><button type="button" className={styles.recommended} onClick={recommended}>Usar configuración recomendada</button><button type="button" className={styles.testButton} onClick={printTest}>Imprimir prueba</button></div></div>

    <div className={styles.statusCard}><span className={styles.statusDot}></span><div><b>{draft.printerMode === 'bridge' ? (bridgeReady ? 'Bridge conectado' : 'Bridge seleccionado') : 'Preparada para prueba'}</b><small>{readySummary}</small></div><span className={styles.pcBadge}>Esta PC</span></div>

    <div className={styles.twoCols}>
      <section className={styles.card}><div className={styles.cardHead}><div><span>PASO 1</span><h4>Tamaño del rollo</h4></div><b className={styles.recommendedBadge}>Recomendado: 58 mm</b></div><div className={styles.paperGrid}><button type="button" className={draft.paper === '80' ? styles.paperActive : ''} onClick={() => update('paper', '80')}><strong>80 mm</strong><span>Ticket más ancho</span><i className={styles.paper80}></i></button><button type="button" className={draft.paper === '58' ? styles.paperActive : ''} onClick={() => update('paper', '58')}><strong>58 mm</strong><span>Para impresoras compactas</span><i className={styles.paper58}></i></button></div></section>
      <section className={styles.card}><div className={styles.cardHead}><div><span>PASO 2</span><h4>Cómo imprimir</h4></div></div><div className={styles.modeGrid}><button type="button" className={draft.printerMode === 'browser' ? styles.modeActive : ''} onClick={() => update('printerMode', 'browser')}><b>Navegador</b><span>Usa la impresora instalada en Windows.</span></button><button type="button" className={draft.printerMode === 'bridge' ? styles.modeActive : ''} onClick={() => update('printerMode', 'bridge')}><b>Automático / Bridge</b><span>{bridgeReady ? 'Conector detectado. Impresión directa.' : 'Podés seleccionarlo ahora; quedará listo para cuando conectemos/instalemos el Bridge.'}</span></button></div></section>
    </div>

    <div className={styles.layout}><div className={styles.controls}>
      <section className={styles.card}><div className={styles.cardHead}><div><span>PASO 3</span><h4>Comportamiento</h4></div></div><div className={styles.behaviourGrid}><label><span>Copias por venta</span><input type="number" min="1" max="3" value={draft.receiptCopies} onChange={e => update('receiptCopies', Math.max(1, Math.min(3, Number(e.target.value) || 1)))} /></label><label><span>Nombre de impresora <small>solo Bridge</small></span><input value={draft.printerName} disabled={draft.printerMode !== 'bridge'} onChange={e => update('printerName', e.target.value)} placeholder="Ej. EPSON TM-T20" /></label></div><Toggle checked={draft.autoPrint} onChange={v => update('autoPrint', v)} title="Imprimir automáticamente al finalizar la venta" detail="Con navegador puede aparecer el diálogo de impresión." /><Toggle checked={Boolean(draft.compactTicket)} onChange={v => update('compactTicket', v)} title="Ticket compacto" detail="Reduce espacios verticales sin achicar demasiado la letra." /></section>

      <section className={styles.card}><div className={styles.cardHead}><div><span>PASO 4</span><h4>Datos del encabezado</h4></div></div><div className={styles.fields}><label>Dirección del comercio<input value={draft.receiptAddress || ''} onChange={e => update('receiptAddress', e.target.value)} placeholder="Ej. Av. Mitre 1234, Berazategui" /></label><label>Teléfono / WhatsApp<input value={draft.receiptPhone || ''} onChange={e => update('receiptPhone', e.target.value)} placeholder="Ej. 11 5555-5555" /></label><label>Texto debajo del encabezado<input value={draft.receiptHeader || ''} onChange={e => update('receiptHeader', e.target.value)} placeholder="Ej. Venta minorista y mayorista" /></label><label>Mensaje al pie<input value={draft.receiptFooter || ''} onChange={e => update('receiptFooter', e.target.value)} placeholder="Gracias por su compra" /></label></div><div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}><button type="button" className={styles.testButton} disabled={saving} onClick={() => save('Datos del ticket guardados.')}>{saving ? 'Guardando…' : 'Guardar datos del ticket'}</button></div></section>

      <section className={styles.card}><div className={styles.cardHead}><div><span>PASO 5</span><h4>Qué mostrar en el ticket</h4></div></div><div className={styles.toggles}><Toggle checked={draft.showBusinessName !== false} onChange={v => update('showBusinessName', v)} title="Nombre del comercio" /><Toggle checked={draft.showTaxId !== false} onChange={v => update('showTaxId', v)} title="CUIT" /><Toggle checked={draft.showPaymentMethod !== false} onChange={v => update('showPaymentMethod', v)} title="Medio de pago" /><Toggle checked={draft.showCustomer !== false} onChange={v => update('showCustomer', v)} title="Cliente" detail="Cuando la venta tiene cliente." /><Toggle checked={draft.showSeller !== false} onChange={v => update('showSeller', v)} title="Vendedor / cajero" /><Toggle checked={Boolean(draft.showBarcode)} onChange={v => update('showBarcode', v)} title="Código de barras" /><Toggle checked={true} onChange={() => {}} disabled title="CAE y datos fiscales" detail="Siempre se mantienen en comprobantes fiscales." /></div></section>

      <div className={styles.saveBar}><div><b>Encabezado guardado en el comercio; impresora guardada en esta PC.</b><span>Podés volver a modificarlo cuando quieras.</span></div><button type="button" disabled={saving} onClick={() => save()}>{saving ? 'Guardando…' : 'Guardar configuración'}</button></div>
    </div>

    <aside className={styles.previewCard}><div className={styles.previewHead}><div><span>VISTA PREVIA</span><b>{draft.paper} mm</b></div><small>Vista aproximada</small></div><div className={`${styles.ticket} ${draft.paper === '58' ? styles.ticket58 : ''} ${draft.compactTicket ? styles.compact : ''}`}><div className={styles.ticketCenter}><strong>FACTURA C</strong>{draft.showBusinessName !== false && <b>{company.name}</b>}{draft.showTaxId !== false && company.tax_id && <span>CUIT {company.tax_id}</span>}{draft.receiptAddress && <span>{draft.receiptAddress}</span>}{draft.receiptPhone && <span>{draft.receiptPhone}</span>}{draft.receiptHeader && <em>{draft.receiptHeader}</em>}</div><div className={styles.ticketBox}><b>Comprobante:</b> 0001-00000123<br/><b>Fecha:</b> 12/08/2026 19:00{draft.showPaymentMethod !== false && <><br/><b>Medio de pago:</b> Efectivo</>}</div><div className={styles.ticketTable}><div><b>Producto</b><b>Cant.</b><b>Subtotal</b></div><div><span>Detergente 750 ml</span><span>2</span><span>$ 4.000</span></div><div><span>Suavizante 900 ml</span><span>1</span><span>$ 2.100</span></div></div><div className={styles.ticketTotal}>TOTAL $ 6.100</div><div className={styles.ticketBox}><b>CAE:</b> 00000000000000<br/><b>Vencimiento CAE:</b> 21/08/2026</div><div className={styles.ticketCenter}><b>{draft.receiptFooter || 'Gracias por su compra'}</b><span>Comprobante generado por Comercio Lleno</span></div></div><button type="button" className={styles.previewPrint} onClick={printTest}>Imprimir ticket de prueba</button><p>El ticket real ahora usa mejor el ancho del rollo y menos espacio vertical. Si el driver de Windows agrega margen extra, el modo Bridge permitirá evitar el diálogo y controlar mejor el corte.</p></aside>
    </div>
  </div>
}
