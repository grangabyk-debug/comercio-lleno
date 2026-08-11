import type { CompanyProfile, DeviceSettings, Sale } from './types'

function money(value: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(Number(value) || 0)
}

function esc(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[c] || c))
}

export function buildOfflineTicketHtml(sale: Sale, company: CompanyProfile, paper: '80' | '58' = '80') {
  const width = paper === '58' ? '58mm' : '80mm'
  const items = sale.details?.items || []
  const rows = items.length
    ? items.map(item => `<tr><td>${esc(item.name)}</td><td class="r">${item.qty}</td><td class="r">${money(item.line_total)}</td></tr>`).join('')
    : '<tr><td colspan="3">Sin detalle de productos</td></tr>'
  return `<!doctype html><html><head><meta charset="utf-8"><title>Ticket pendiente ${esc(sale.id.slice(0,8))}</title><style>
  @page{margin:3mm;size:${paper}mm auto}*{box-sizing:border-box}body{font-family:Arial,sans-serif;width:${width};margin:0 auto;color:#111;font-size:10.5px;line-height:1.35}.center{text-align:center}.r{text-align:right}.warn{border:2px solid #111;padding:8px;margin:8px 0;text-align:center;font-weight:800}.box{border:1px solid #222;padding:7px;margin:8px 0}table{width:100%;border-collapse:collapse}td,th{padding:5px 2px;border-bottom:1px solid #ddd}.total{font-size:16px;font-weight:800;text-align:right;margin-top:10px}.foot{font-size:9px;margin-top:12px;text-align:center}</style></head><body>
  <div class="center"><b>${esc(company.name)}</b><div>COMPROBANTE INTERNO</div></div>
  <div class="warn">PENDIENTE DE ARCA<br>NO ES FACTURA FISCAL · SIN CAE</div>
  <div class="box"><div><b>Operación:</b> ${esc(sale.id.slice(0,12))}</div><div><b>Fecha:</b> ${esc(new Date(sale.date).toLocaleString('es-AR'))}</div><div><b>Pago:</b> ${esc(sale.payment)}</div></div>
  <table><thead><tr><th>Producto</th><th class="r">Cant.</th><th class="r">Subtotal</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="total">TOTAL ${money(sale.total)}</div>
  <div class="foot">Comercio Lleno guardó esta venta offline. Se intentará facturar cuando vuelva Internet.</div></body></html>`
}

export async function printOfflineTicket(sale: Sale, company: CompanyProfile, settings: DeviceSettings) {
  const html = buildOfflineTicketHtml(sale, company, settings.paper)
  if (settings.printerMode === 'bridge' && typeof window !== 'undefined' && window.ComercioLlenoPrintBridge?.printHtml) {
    await window.ComercioLlenoPrintBridge.printHtml({ html, printerName: settings.printerName, paper: settings.paper, copies: settings.receiptCopies })
    return
  }
  if (typeof document === 'undefined') return
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden','true')
  frame.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0'
  document.body.appendChild(frame)
  const doc = frame.contentDocument
  if (!doc) { frame.remove(); throw new Error('No se pudo preparar la impresión offline.') }
  doc.open(); doc.write(html); doc.close()
  await new Promise(resolve => setTimeout(resolve, 180))
  frame.contentWindow?.focus(); frame.contentWindow?.print()
  setTimeout(() => frame.remove(), 1500)
}
