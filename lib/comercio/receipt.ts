import type { CompanyProfile, DeviceSettings, Sale } from './types'

function money(value: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(Number(value) || 0)
}

function esc(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c] || c))
}

export function receiptNumber(sale: Sale) {
  return `0001-${String(sale.receiptNumber || 0).padStart(8, '0')}`
}

function isFiscal(sale: Sale) { return Boolean(sale.cae && sale.receiptNumber) }
function detailText(sale: Sale, key: string) {
  const value = sale.details?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

export function buildReceiptHtml(sale: Sale, company: CompanyProfile, paper: '80' | '58' | 'a4' = '80', settings?: Partial<DeviceSettings>) {
  const thermal = paper !== 'a4'
  const compact = Boolean(settings?.compactTicket)
  const items = sale.details?.items || []
  const showBarcode = Boolean(settings?.showBarcode)
  const rows = items.length
    ? items.map(item => `<tr><td>${esc(item.name)}${showBarcode && item.barcode ? `<small class="barcode">${esc(item.barcode)}</small>` : ''}</td><td class="r">${item.qty}</td><td class="r">${money(item.unit_price)}</td><td class="r">${money(item.line_total)}</td></tr>`).join('')
    : '<tr><td colspan="4">Sin detalle de productos</td></tr>'
  const fiscal = isFiscal(sale)
  const fiscalEnvironment = sale.fiscalEnvironment || 'homologacion'
  const homologation = fiscal && /homo|test/i.test(fiscalEnvironment) ? '<div class="hom">HOMOLOGACIÓN · SIN VALIDEZ FISCAL</div>' : ''
  const pending = !fiscal ? '<div class="pending">COMPROBANTE INTERNO · PENDIENTE DE ARCA<br>NO ES FACTURA FISCAL · SIN CAE</div>' : ''
  const title = fiscal ? `Factura C ${receiptNumber(sale)}` : `Ticket pendiente ${sale.id.slice(0, 8)}`
  const heading = fiscal ? 'FACTURA C' : 'VENTA PENDIENTE'
  const numberBlock = fiscal ? `<div><b>Comprobante:</b> ${receiptNumber(sale)}</div>` : `<div><b>Operación local:</b> ${esc(sale.id.slice(0, 12))}</div>`
  const fiscalBlock = fiscal
    ? `<div class="box"><div><b>CAE:</b> ${esc(sale.cae || '—')}</div><div><b>Vencimiento CAE:</b> ${esc(sale.caeExpiration || '—')}</div></div>`
    : `<div class="box"><b>Estado:</b> pendiente de sincronización y autorización fiscal.</div>`

  const showBusinessName = settings?.showBusinessName !== false
  const showTaxId = settings?.showTaxId !== false
  const showPayment = settings?.showPaymentMethod !== false
  const customer = settings?.showCustomer !== false ? detailText(sale, 'customer_name') : ''
  const seller = settings?.showSeller !== false ? detailText(sale, 'seller_name') : ''
  const address = String(settings?.receiptAddress || '').trim()
  const phone = String(settings?.receiptPhone || '').trim()
  const header = String(settings?.receiptHeader || '').trim()
  const footer = String(settings?.receiptFooter || '').trim()
  const identity = [
    showBusinessName ? `<b class="business">${esc(company.name)}</b>` : '',
    showTaxId && company.tax_id ? `<div>CUIT ${esc(company.tax_id)}</div>` : '',
    address ? `<div>${esc(address)}</div>` : '',
    phone ? `<div>${esc(phone)}</div>` : '',
    header ? `<div class="headerText">${esc(header)}</div>` : '',
  ].filter(Boolean).join('')
  const extra = [
    showPayment ? `<div><b>Medio de pago:</b> ${esc(sale.payment)}</div>` : '',
    customer ? `<div><b>Cliente:</b> ${esc(customer)}</div>` : '',
    seller ? `<div><b>Vendedor:</b> ${esc(seller)}</div>` : '',
  ].filter(Boolean).join('')

  if (!thermal) {
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;width:190mm;margin:0 auto;color:#111;font-size:13px;line-height:1.35}h1{font-size:25px;margin:0 0 4px}.center{text-align:center}.r{text-align:right}.business{font-size:15px}.box{border:1px solid #222;padding:8px;margin:8px 0}.hom,.pending{font-weight:800;border:1px dashed #222;padding:8px;text-align:center;margin:8px 0}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{padding:5px 3px;border-bottom:1px solid #ddd;vertical-align:top}.barcode{display:block;font-size:9px;color:#555}.total{font-size:20px;font-weight:800;text-align:right;margin:10px 0}.foot{text-align:center;margin-top:12px}</style></head><body><div class="center"><h1>${heading}</h1>${identity}</div>${homologation}${pending}<div class="box">${numberBlock}<div><b>Fecha:</b> ${esc(new Date(sale.date).toLocaleString('es-AR'))}</div>${extra}</div><table><thead><tr><th>Producto</th><th class="r">Cant.</th><th class="r">Precio</th><th class="r">Subtotal</th></tr></thead><tbody>${rows}</tbody></table><div class="total">TOTAL ${money(sale.total)}</div>${fiscalBlock}<div class="foot">${footer ? `<b>${esc(footer)}</b><br>` : ''}${fiscal ? 'Comprobante generado por Comercio Lleno' : 'La venta se enviará a ARCA cuando vuelva la conexión.'}</div></body></html>`
  }

  const base = compact ? '11.4px' : '12.4px'
  const line = compact ? '1.14' : '1.20'
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
  @page{size:${paper}mm auto;margin:0}html,body{width:${paper}mm!important;margin:0!important;padding:0!important;min-height:0!important;height:auto!important}*{box-sizing:border-box}html{overflow:visible}body{font-family:Arial,sans-serif;color:#111;font-size:${base};line-height:${line};padding:1.15mm 1.35mm .35mm!important;overflow:visible}
  h1{font-size:${compact ? '17px' : '19px'};margin:0 0 2px}.center{text-align:center}.r{text-align:right}.business{display:block;font-size:${compact ? '13.5px' : '15px'};font-weight:900}.headerText{margin-top:2px;font-weight:700}.box{border:1px solid #222;padding:${compact ? '3px' : '4px'};margin:${compact ? '3px' : '4px'} 0}.hom{font-weight:800;border:1px dashed #b42318;padding:4px;text-align:center;margin:4px 0}.pending{font-weight:800;border:2px solid #222;padding:4px;text-align:center;margin:4px 0}
  table{width:100%;border-collapse:collapse;table-layout:auto;margin-top:${compact ? '2px' : '3px'}}th,td{padding:${compact ? '2px 1px' : '2.5px 1px'};border-bottom:1px solid #ddd;vertical-align:top}th{font-size:${compact ? '9.3px' : '10px'};text-transform:uppercase}.barcode{display:block;font-size:8.5px;color:#555;margin-top:1px;letter-spacing:.02em}.total{font-size:${compact ? '16px' : '18px'};font-weight:900;text-align:right;margin:${compact ? '4px' : '5px'} 0}.foot{margin-top:${compact ? '3px' : '4px'};font-size:${compact ? '9.5px' : '10.5px'};text-align:center}.customFoot{font-weight:800;margin-bottom:1px}
  </style></head><body><div class="center"><h1>${heading}</h1>${identity}</div>${homologation}${pending}<div class="box">${numberBlock}<div><b>Fecha:</b> ${esc(new Date(sale.date).toLocaleString('es-AR'))}</div>${extra}</div><table><thead><tr><th>Producto</th><th class="r">Cant.</th><th class="r">Precio</th><th class="r">Subtotal</th></tr></thead><tbody>${rows}</tbody></table><div class="total">TOTAL ${money(sale.total)}</div>${fiscalBlock}<div class="foot">${footer ? `<div class="customFoot">${esc(footer)}</div>` : ''}${fiscal ? 'Comprobante generado por Comercio Lleno' : 'La venta se enviará a ARCA cuando vuelva la conexión.'}</div></body></html>`
}

declare global {
  interface Window {
    ComercioLlenoPrintBridge?: { printHtml: (payload: { html: string; printerName?: string; paper: '80' | '58'; copies: number }) => Promise<void> | void }
  }
}

export async function printReceipt(sale: Sale, company: CompanyProfile, settings: DeviceSettings) {
  const html = buildReceiptHtml(sale, company, settings.paper, settings)
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
  await new Promise(resolve => setTimeout(resolve, 160))
  frame.contentWindow?.focus()
  frame.contentWindow?.print()
  setTimeout(() => frame.remove(), 1100)
}

function pdfEsc(text: string) {
  const replacements: Record<string, string> = { 'á':'\\341','é':'\\351','í':'\\355','ó':'\\363','ú':'\\372','Á':'\\301','É':'\\311','Í':'\\315','Ó':'\\323','Ú':'\\332','ñ':'\\361','Ñ':'\\321','ü':'\\374','Ü':'\\334','¿':'\\277','¡':'\\241','°':'\\260' }
  return text.replace(/[\\()áéíóúÁÉÍÓÚñÑüÜ¿¡°]/g, c => replacements[c] || (c === '\\' ? '\\\\' : c === '(' ? '\\(' : c === ')' ? '\\)' : c)).replace(/[^\x20-\x7E\\]/g, '?')
}

function buildSimplePdf(lines: Array<{ text: string; size?: number; bold?: boolean }>) {
  let y=800; const commands:string[]=['BT']
  for(const line of lines){const size=line.size||11;commands.push(`/${line.bold?'F2':'F1'} ${size} Tf`);commands.push(`1 0 0 1 50 ${y} Tm`);commands.push(`(${pdfEsc(line.text)}) Tj`);y-=Math.max(15,size+5)}
  commands.push('ET'); const stream=commands.join('\n')
  const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`]
  let pdf='%PDF-1.4\n'; const offsets=[0]; objects.forEach((obj,index)=>{offsets.push(pdf.length);pdf+=`${index+1} 0 obj\n${obj}\nendobj\n`}); const xref=pdf.length; pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`; offsets.slice(1).forEach(offset=>{pdf+=`${String(offset).padStart(10,'0')} 00000 n \n`}); pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`; return new TextEncoder().encode(pdf)
}

function receiptPdfBytes(sale: Sale, company: CompanyProfile) {
  const fiscal=isFiscal(sale), items=sale.details?.items||[]
  const lines:Array<{text:string;size?:number;bold?:boolean}>=[{text:fiscal?'FACTURA C':'COMPROBANTE INTERNO - PENDIENTE DE ARCA',size:fiscal?20:15,bold:true},{text:company.name,size:13,bold:true},{text:company.tax_id?`CUIT ${company.tax_id}`:'CUIT no informado'},{text:fiscal?`Comprobante: ${receiptNumber(sale)}`:`Operacion local: ${sale.id.slice(0,12)}`},{text:`Fecha: ${new Date(sale.date).toLocaleString('es-AR')}`},{text:`Medio de pago: ${sale.payment}`},...(!fiscal?[{text:'NO ES FACTURA FISCAL - SIN CAE',bold:true}]:[]),{text:' '}]
  items.slice(0,28).forEach(item=>lines.push({text:`${item.qty} x ${item.name.slice(0,42)} - ${money(item.line_total)}`})); lines.push({text:' '},{text:`TOTAL ${money(sale.total)}`,size:14,bold:true}); if(fiscal)lines.push({text:`CAE: ${sale.cae||'—'}`},{text:`Vencimiento CAE: ${sale.caeExpiration||'—'}`}); else lines.push({text:'Se intentara facturar automaticamente cuando vuelva Internet.'}); return buildSimplePdf(lines)
}

export function receiptPdfBlob(sale: Sale, company: CompanyProfile) { return new Blob([receiptPdfBytes(sale, company)], { type: 'application/pdf' }) }
export function downloadReceiptPdf(sale: Sale, company: CompanyProfile) { if(typeof document==='undefined')return; const blob=receiptPdfBlob(sale,company),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=isFiscal(sale)?`factura-c-${receiptNumber(sale)}.pdf`:`venta-pendiente-${sale.id.slice(0,8)}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000) }

export async function emailReceipt(sale: Sale, company: CompanyProfile, email?: string | null) {
  if(typeof window==='undefined')return 'unsupported'
  const fiscal=isFiscal(sale),filename=fiscal?`factura-c-${receiptNumber(sale)}.pdf`:`venta-pendiente-${sale.id.slice(0,8)}.pdf`,blob=receiptPdfBlob(sale,company),subject=fiscal?`Factura C ${receiptNumber(sale)} · ${company.name}`:`Comprobante interno pendiente · ${company.name}`,body=fiscal?`Hola, te enviamos la Factura C ${receiptNumber(sale)} por ${money(sale.total)} emitida por ${company.name}.`:`Hola, te enviamos el comprobante interno de la operación por ${money(sale.total)}. Esta venta está pendiente de autorización fiscal de ARCA y todavía no posee CAE.`
  try{if(typeof File!=='undefined'&&navigator.share){const file=new File([blob],filename,{type:'application/pdf'}),canShare=!navigator.canShare||navigator.canShare({files:[file]});if(canShare){await navigator.share({title:subject,text:body,files:[file]});return 'shared'}}}catch(error){if(error instanceof Error&&error.name==='AbortError')return 'cancelled'}
  downloadReceiptPdf(sale,company); window.location.href=`mailto:${encodeURIComponent(email||'')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${body}\n\nEl PDF fue descargado en este dispositivo para que lo adjuntes al correo.`)}`; return 'mailto'
}
