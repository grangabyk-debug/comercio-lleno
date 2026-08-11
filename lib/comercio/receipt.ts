import type { CompanyProfile, DeviceSettings, Sale } from './types'

function money(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(Number(value) || 0)
}

function esc(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[c] || c))
}

export function receiptNumber(sale: Sale) {
  return `0001-${String(sale.receiptNumber || 0).padStart(8, '0')}`
}

export function buildReceiptHtml(sale: Sale, company: CompanyProfile, paper: '80' | '58' | 'a4' = '80') {
  const thermal = paper !== 'a4'
  const width = paper === '58' ? '58mm' : paper === '80' ? '80mm' : '190mm'
  const items = sale.details?.items || []
  const rows = items.length
    ? items.map((item) => `<tr><td>${esc(item.name)}</td><td class="r">${item.qty}</td><td class="r">${money(item.unit_price)}</td><td class="r">${money(item.line_total)}</td></tr>`).join('')
    : '<tr><td colspan="4">Sin detalle de productos</td></tr>'
  const tax = company.tax_id ? `<div>CUIT ${esc(company.tax_id)}</div>` : ''
  const fiscalEnvironment = sale.fiscalEnvironment || 'homologacion'
  const homologation = /homo|test/i.test(fiscalEnvironment) ? '<div class="hom">HOMOLOGACIÓN · SIN VALIDEZ FISCAL</div>' : ''

  return `<!doctype html><html><head><meta charset="utf-8"><title>Factura C ${receiptNumber(sale)}</title><style>
  @page{margin:${thermal ? '3mm' : '12mm'};size:${thermal ? `${paper}mm auto` : 'A4'}}
  *{box-sizing:border-box}body{font-family:Arial,sans-serif;width:${width};margin:0 auto;color:#111;font-size:${thermal ? '10.5px' : '13px'};line-height:1.35}
  h1{font-size:${thermal ? '18px' : '25px'};margin:0 0 4px}.center{text-align:center}.r{text-align:right}.muted{color:#555}
  .box{border:1px solid #222;padding:8px;margin:8px 0}.hom{font-weight:700;border:1px dashed #b42318;padding:7px;text-align:center;margin:8px 0}
  table{width:100%;border-collapse:collapse;margin-top:8px}th,td{padding:5px 3px;border-bottom:1px solid #ddd;vertical-align:top}th{font-size:9px;text-transform:uppercase}
  .total{font-size:${thermal ? '16px' : '20px'};font-weight:800;text-align:right;margin:10px 0}.foot{margin-top:12px;font-size:9px}
  </style></head><body>
  <div class="center"><h1>FACTURA C</h1><b>${esc(company.name)}</b>${tax}</div>${homologation}
  <div class="box"><div><b>Comprobante:</b> ${receiptNumber(sale)}</div><div><b>Fecha:</b> ${esc(new Date(sale.date).toLocaleString('es-AR'))}</div><div><b>Medio de pago:</b> ${esc(sale.payment)}</div></div>
  <table><thead><tr><th>Producto</th><th class="r">Cant.</th><th class="r">Precio</th><th class="r">Subtotal</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="total">TOTAL ${money(sale.total)}</div>
  <div class="box"><div><b>CAE:</b> ${esc(sale.cae || '—')}</div><div><b>Vencimiento CAE:</b> ${esc(sale.caeExpiration || '—')}</div></div>
  <div class="foot center">Comprobante generado por Comercio Lleno</div></body></html>`
}

declare global {
  interface Window {
    ComercioLlenoPrintBridge?: {
      printHtml: (payload: { html: string; printerName?: string; paper: '80' | '58'; copies: number }) => Promise<void> | void
    }
  }
}

export async function printReceipt(sale: Sale, company: CompanyProfile, settings: DeviceSettings) {
  const html = buildReceiptHtml(sale, company, settings.paper)
  if (settings.printerMode === 'bridge' && typeof window !== 'undefined' && window.ComercioLlenoPrintBridge?.printHtml) {
    await window.ComercioLlenoPrintBridge.printHtml({ html, printerName: settings.printerName, paper: settings.paper, copies: settings.receiptCopies })
    return
  }
  if (typeof document === 'undefined') return
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0'
  document.body.appendChild(frame)
  const doc = frame.contentDocument
  if (!doc) { frame.remove(); throw new Error('No se pudo preparar la impresión.') }
  doc.open(); doc.write(html); doc.close()
  await new Promise((resolve) => setTimeout(resolve, 180))
  frame.contentWindow?.focus()
  frame.contentWindow?.print()
  setTimeout(() => frame.remove(), 1500)
}

function pdfEsc(text: string) {
  const replacements: Record<string, string> = {
    'á': '\\341','é': '\\351','í': '\\355','ó': '\\363','ú': '\\372','Á': '\\301','É': '\\311','Í': '\\315','Ó': '\\323','Ú': '\\332','ñ': '\\361','Ñ': '\\321','ü': '\\374','Ü': '\\334','¿': '\\277','¡': '\\241','°': '\\260',
  }
  return text.replace(/[\\()áéíóúÁÉÍÓÚñÑüÜ¿¡°]/g, (c) => {
    if (replacements[c]) return replacements[c]
    if (c === '\\') return '\\\\'
    if (c === '(') return '\\('
    if (c === ')') return '\\)'
    return c
  }).replace(/[^\x20-\x7E\\]/g, '?')
}

function buildSimplePdf(lines: Array<{ text: string; size?: number; bold?: boolean }>) {
  let y = 800
  const commands: string[] = ['BT']
  for (const line of lines) {
    const size = line.size || 11
    commands.push(`/${line.bold ? 'F2' : 'F1'} ${size} Tf`)
    commands.push(`1 0 0 1 50 ${y} Tm`)
    commands.push(`(${pdfEsc(line.text)}) Tj`)
    y -= Math.max(15, size + 5)
  }
  commands.push('ET')
  const stream = commands.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((obj, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n` })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new TextEncoder().encode(pdf)
}

function receiptPdfBytes(sale: Sale, company: CompanyProfile) {
  const items = sale.details?.items || []
  const lines: Array<{ text: string; size?: number; bold?: boolean }> = [
    { text: 'FACTURA C', size: 20, bold: true },
    { text: company.name, size: 13, bold: true },
    { text: company.tax_id ? `CUIT ${company.tax_id}` : 'CUIT no informado' },
    { text: `Comprobante: ${receiptNumber(sale)}` },
    { text: `Fecha: ${new Date(sale.date).toLocaleString('es-AR')}` },
    { text: `Medio de pago: ${sale.payment}` },
    { text: ' ' },
  ]
  items.slice(0, 28).forEach((item) => lines.push({ text: `${item.qty} x ${item.name.slice(0, 42)} - ${money(item.line_total)}` }))
  lines.push(
    { text: ' ' },
    { text: `TOTAL ${money(sale.total)}`, size: 14, bold: true },
    { text: `CAE: ${sale.cae || '—'}` },
    { text: `Vencimiento CAE: ${sale.caeExpiration || '—'}` },
  )
  return buildSimplePdf(lines)
}

export function receiptPdfBlob(sale: Sale, company: CompanyProfile) {
  return new Blob([receiptPdfBytes(sale, company)], { type: 'application/pdf' })
}

export function downloadReceiptPdf(sale: Sale, company: CompanyProfile) {
  if (typeof document === 'undefined') return
  const blob = receiptPdfBlob(sale, company)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `factura-c-${receiptNumber(sale)}.pdf`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function emailReceipt(sale: Sale, company: CompanyProfile, email?: string | null) {
  if (typeof window === 'undefined') return 'unsupported'
  const filename = `factura-c-${receiptNumber(sale)}.pdf`
  const blob = receiptPdfBlob(sale, company)
  const subject = `Factura C ${receiptNumber(sale)} · ${company.name}`
  const body = `Hola, te enviamos la Factura C ${receiptNumber(sale)} por ${money(sale.total)} emitida por ${company.name}.`

  try {
    if (typeof File !== 'undefined' && navigator.share) {
      const file = new File([blob], filename, { type: 'application/pdf' })
      const canShare = !navigator.canShare || navigator.canShare({ files: [file] })
      if (canShare) {
        await navigator.share({ title: subject, text: body, files: [file] })
        return 'shared'
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return 'cancelled'
  }

  downloadReceiptPdf(sale, company)
  const href = `mailto:${encodeURIComponent(email || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${body}\n\nEl PDF fue descargado en este dispositivo para que lo adjuntes al correo.`)}`
  window.location.href = href
  return 'mailto'
}
