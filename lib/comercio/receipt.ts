import type { CompanyProfile, DeviceSettings, Sale } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

function money(value: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(Number(value) || 0)
}
function esc(value: unknown) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c] || c)) }
export function receiptNumber(sale: Sale) { return `0001-${String(sale.receiptNumber || 0).padStart(8, '0')}` }
function isFiscal(sale: Sale) { return Boolean(sale.cae && sale.receiptNumber) }
function detailText(sale: Sale, key: string) { const value=sale.details?.[key]; return typeof value==='string'&&value.trim()?value.trim():'' }
function promotionSavings(sale:Sale){return Number(sale.details?.promotion_savings||0)}
function manualSavings(sale:Sale){return Number(sale.details?.discount_amount||0)}
function totalSavings(sale:Sale){return Math.max(0,promotionSavings(sale)+manualSavings(sale))}

function itemRows(sale:Sale, showBarcode:boolean){
  const items=sale.details?.items||[]
  if(!items.length)return '<tr><td colspan="4">Sin detalle de productos</td></tr>'
  return items.map(item=>{
    const original=Number(item.original_unit_price||0)
    const paid=Number(item.unit_price||0)
    const promoted=original>paid+.001
    const pct=Number(item.promotion_discount_percent||0)
    const price=promoted?`<span class="oldPrice"><s>${money(original)}</s></span><b class="offerPrice">${money(paid)}</b>`:`${money(paid)}`
    const offer=promoted?`<small class="offerTag">OFERTA · ${pct}% DE DESCUENTO</small>`:''
    const barcode=showBarcode&&item.barcode?`<small class="barcode">${esc(item.barcode)}</small>`:''
    return `<tr><td>${esc(item.name)}${offer}${barcode}</td><td class="r">${item.qty}</td><td class="r priceCell">${price}</td><td class="r">${money(item.line_total)}</td></tr>`
  }).join('')
}

export function buildReceiptHtml(sale: Sale, company: CompanyProfile, paper: '80' | '58' | 'a4' = '80', settings?: Partial<DeviceSettings>) {
  const thermal=paper!=='a4',compact=Boolean(settings?.compactTicket),showBarcode=Boolean(settings?.showBarcode)
  const rows=itemRows(sale,showBarcode),fiscal=isFiscal(sale),savings=totalSavings(sale),manual=manualSavings(sale),promo=promotionSavings(sale)
  const fiscalEnvironment=sale.fiscalEnvironment||'homologacion'
  const homologation=fiscal&&/homo|test/i.test(fiscalEnvironment)?'<div class="hom">HOMOLOGACIÓN · SIN VALIDEZ FISCAL</div>':''
  const pending=!fiscal?'<div class="pending">COMPROBANTE INTERNO · PENDIENTE DE ARCA<br>NO ES FACTURA FISCAL · SIN CAE</div>':''
  const title=fiscal?`Factura C ${receiptNumber(sale)}`:`Ticket pendiente ${sale.id.slice(0,8)}`
  const heading=fiscal?'FACTURA C':'VENTA PENDIENTE'
  const numberBlock=fiscal?`<div><b>Comprobante:</b> ${receiptNumber(sale)}</div>`:`<div><b>Operación local:</b> ${esc(sale.id.slice(0,12))}</div>`
  const fiscalBlock=fiscal?`<div class="box"><div><b>CAE:</b> ${esc(sale.cae||'—')}</div><div><b>Vencimiento CAE:</b> ${esc(sale.caeExpiration||'—')}</div></div>`:`<div class="box"><b>Estado:</b> pendiente de sincronización y autorización fiscal.</div>`
  const customer=settings?.showCustomer!==false?detailText(sale,'customer_name'):''
  const seller=settings?.showSeller!==false?detailText(sale,'seller_name'):''
  const address=String(settings?.receiptAddress||'').trim(),phone=String(settings?.receiptPhone||'').trim(),header=String(settings?.receiptHeader||'').trim(),footer=String(settings?.receiptFooter||'').trim()
  const identity=[settings?.showBusinessName!==false?`<b class="business">${esc(company.name)}</b>`:'',settings?.showTaxId!==false&&company.tax_id?`<div>CUIT ${esc(company.tax_id)}</div>`:'',address?`<div>${esc(address)}</div>`:'',phone?`<div>${esc(phone)}</div>`:'',header?`<div class="headerText">${esc(header)}</div>`:''].filter(Boolean).join('')
  const extra=[settings?.showPaymentMethod!==false?`<div><b>Medio de pago:</b> ${esc(sale.payment)}</div>`:'',customer?`<div><b>Cliente:</b> ${esc(customer)}</div>`:'',seller?`<div><b>Vendedor:</b> ${esc(seller)}</div>`:''].filter(Boolean).join('')
  const savingBlock=savings>0?`<div class="savings"><span>AHORRASTE</span><b>${money(savings)}</b>${promo>0?`<small>Ofertas en productos: ${money(promo)}</small>`:''}${manual>0?`<small>Descuento adicional: ${money(manual)}</small>`:''}</div>`:''
  const manualBlock=manual>0?`<div class="discountSummary"><span>Descuento adicional</span><b>− ${money(manual)}</b></div>`:''

  if(!thermal){
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;width:190mm;margin:0 auto;color:#111;font-size:13px;line-height:1.35}h1{font-size:25px;margin:0 0 4px}.center{text-align:center}.r{text-align:right}.business{font-size:15px}.box{border:1px solid #222;padding:8px;margin:8px 0}.hom,.pending{font-weight:800;border:1px dashed #222;padding:8px;text-align:center;margin:8px 0}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{padding:5px 3px;border-bottom:1px solid #ddd;vertical-align:top}.barcode,.offerTag{display:block;font-size:9px}.offerTag{font-weight:900;letter-spacing:.04em}.oldPrice{display:block;font-size:10px}.offerPrice{display:block;font-size:13px}.discountSummary{display:flex;justify-content:flex-end;gap:20px;margin-top:8px}.savings{border:3px double #000;padding:8px;margin:9px 0;text-align:center}.savings span{display:block;font-size:12px;font-weight:900;letter-spacing:.15em}.savings b{display:block;font-size:22px}.savings small{display:block}.total{font-size:20px;font-weight:800;text-align:right;margin:10px 0}.foot{text-align:center;margin-top:12px}</style></head><body><div class="center"><h1>${heading}</h1>${identity}</div>${homologation}${pending}<div class="box">${numberBlock}<div><b>Fecha:</b> ${esc(new Date(sale.date).toLocaleString('es-AR'))}</div>${extra}</div><table><thead><tr><th>Producto</th><th class="r">Cant.</th><th class="r">Precio</th><th class="r">Subtotal</th></tr></thead><tbody>${rows}</tbody></table>${manualBlock}<div class="total">TOTAL ${money(sale.total)}</div>${savingBlock}${fiscalBlock}<div class="foot">${footer?`<b>${esc(footer)}</b><br>`:''}${fiscal?'Comprobante generado por Comercio Lleno':'La venta se enviará a ARCA cuando vuelva la conexión.'}</div></body></html>`
  }

  const base=compact?'11.4px':'12.4px',line=compact?'1.14':'1.20'
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>@page{size:${paper}mm auto;margin:0}html,body{width:${paper}mm!important;margin:0!important;padding:0!important;min-height:0!important;height:auto!important}*{box-sizing:border-box}html{overflow:visible}body{font-family:Arial,sans-serif;color:#111;font-size:${base};line-height:${line};padding:1.15mm 1.35mm .35mm!important;overflow:visible}h1{font-size:${compact?'17px':'19px'};margin:0 0 2px}.center{text-align:center}.r{text-align:right}.business{display:block;font-size:${compact?'13.5px':'15px'};font-weight:900}.headerText{margin-top:2px;font-weight:700}.box{border:1px solid #222;padding:${compact?'3px':'4px'};margin:${compact?'3px':'4px'} 0}.hom{font-weight:800;border:1px dashed #222;padding:4px;text-align:center;margin:4px 0}.pending{font-weight:800;border:2px solid #222;padding:4px;text-align:center;margin:4px 0}table{width:100%;border-collapse:collapse;table-layout:auto;margin-top:${compact?'2px':'3px'}}th,td{padding:${compact?'2px 1px':'2.5px 1px'};border-bottom:1px solid #ddd;vertical-align:top}th{font-size:${compact?'9.3px':'10px'};text-transform:uppercase}.barcode{display:block;font-size:8px;margin-top:1px}.offerTag{display:block;font-size:8.5px;font-weight:950;letter-spacing:.03em;margin-top:1px}.oldPrice{display:block;font-size:8.5px;line-height:1}.offerPrice{display:block;font-size:11px;font-weight:950}.discountSummary{display:flex;justify-content:space-between;border-bottom:1px dashed #000;padding:3px 1px;font-weight:800}.savings{border:3px double #000;padding:4px 3px;margin:4px 0;text-align:center}.savings span{display:block;font-size:9px;font-weight:950;letter-spacing:.13em}.savings b{display:block;font-size:${compact?'17px':'19px'};line-height:1.1}.savings small{display:block;font-size:8px}.total{font-size:${compact?'16px':'18px'};font-weight:900;text-align:right;margin:${compact?'4px':'5px'} 0}.foot{margin-top:${compact?'3px':'4px'};font-size:${compact?'9.5px':'10.5px'};text-align:center}.customFoot{font-weight:800;margin-bottom:1px}</style></head><body><div class="center"><h1>${heading}</h1>${identity}</div>${homologation}${pending}<div class="box">${numberBlock}<div><b>Fecha:</b> ${esc(new Date(sale.date).toLocaleString('es-AR'))}</div>${extra}</div><table><thead><tr><th>Producto</th><th class="r">Cant.</th><th class="r">Precio</th><th class="r">Subtotal</th></tr></thead><tbody>${rows}</tbody></table>${manualBlock}<div class="total">TOTAL ${money(sale.total)}</div>${savingBlock}${fiscalBlock}<div class="foot">${footer?`<div class="customFoot">${esc(footer)}</div>`:''}${fiscal?'Comprobante generado por Comercio Lleno':'La venta se enviará a ARCA cuando vuelva la conexión.'}</div></body></html>`
}

declare global { interface Window { ComercioLlenoPrintBridge?: { printHtml:(payload:{html:string;printerName?:string;paper:'80'|'58';copies:number})=>Promise<void>|void } } }

async function hydrateStoredSale(sale:Sale):Promise<Sale>{
  if(typeof window==='undefined')return sale
  const token=localStorage.getItem('cl_access_token')||'',companyId=localStorage.getItem('cl_company_id')||''
  if(!token||!companyId)return sale
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/sales?id=eq.${encodeURIComponent(sale.id)}&company_id=eq.${encodeURIComponent(companyId)}&select=details,cae,receipt_number,fiscal_status&limit=1`,{headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${token}`},cache:'no-store'})
    const rows=await response.json().catch(()=>[]),row=Array.isArray(rows)?rows[0]:null
    if(!response.ok||!row)return sale
    return {...sale,details:row.details||sale.details,cae:row.cae||sale.cae,receiptNumber:row.receipt_number?Number(row.receipt_number):sale.receiptNumber,fiscal_status:row.fiscal_status||sale.fiscal_status}
  }catch{return sale}
}

export async function printReceipt(sale:Sale,company:CompanyProfile,settings:DeviceSettings){
  const stored=await hydrateStoredSale(sale),html=buildReceiptHtml(stored,company,settings.paper,settings)
  if(settings.printerMode==='bridge'&&typeof window!=='undefined'&&window.ComercioLlenoPrintBridge?.printHtml){await window.ComercioLlenoPrintBridge.printHtml({html,printerName:settings.printerName,paper:settings.paper,copies:settings.receiptCopies});return}
  if(typeof document==='undefined')return
  const frame=document.createElement('iframe');frame.setAttribute('aria-hidden','true');frame.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0';document.body.appendChild(frame);const doc=frame.contentDocument;if(!doc){frame.remove();throw new Error('No se pudo preparar la impresión.')}doc.open();doc.write(html);doc.close();await new Promise(resolve=>setTimeout(resolve,160));frame.contentWindow?.focus();frame.contentWindow?.print();setTimeout(()=>frame.remove(),1100)
}

function pdfEsc(text:string){const replacements:Record<string,string>={'á':'\\341','é':'\\351','í':'\\355','ó':'\\363','ú':'\\372','Á':'\\301','É':'\\311','Í':'\\315','Ó':'\\323','Ú':'\\332','ñ':'\\361','Ñ':'\\321','ü':'\\374','Ü':'\\334','¿':'\\277','¡':'\\241','°':'\\260'};return text.replace(/[\\()áéíóúÁÉÍÓÚñÑüÜ¿¡°]/g,c=>replacements[c]||(c==='\\'?'\\\\':c==='('?'\\(':c===')'?'\\)':c)).replace(/[^\x20-\x7E\\]/g,'?')}
function buildSimplePdf(lines:Array<{text:string;size?:number;bold?:boolean}>){let y=800;const commands:string[]=['BT'];for(const line of lines){const size=line.size||11;commands.push(`/${line.bold?'F2':'F1'} ${size} Tf`);commands.push(`1 0 0 1 50 ${y} Tm`);commands.push(`(${pdfEsc(line.text)}) Tj`);y-=Math.max(15,size+5)}commands.push('ET');const stream=commands.join('\n');const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];let pdf='%PDF-1.4\n';const offsets=[0];objects.forEach((obj,index)=>{offsets.push(pdf.length);pdf+=`${index+1} 0 obj\n${obj}\nendobj\n`});const xref=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;offsets.slice(1).forEach(offset=>{pdf+=`${String(offset).padStart(10,'0')} 00000 n \n`});pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;return new TextEncoder().encode(pdf)}
function receiptPdfBytes(sale:Sale,company:CompanyProfile){const fiscal=isFiscal(sale),items=sale.details?.items||[];const lines:Array<{text:string;size?:number;bold?:boolean}>=[{text:fiscal?'FACTURA C':'COMPROBANTE INTERNO - PENDIENTE DE ARCA',size:fiscal?20:15,bold:true},{text:company.name,size:13,bold:true},{text:company.tax_id?`CUIT ${company.tax_id}`:'CUIT no informado'},{text:fiscal?`Comprobante: ${receiptNumber(sale)}`:`Operacion local: ${sale.id.slice(0,12)}`},{text:`Fecha: ${new Date(sale.date).toLocaleString('es-AR')}`},{text:`Medio de pago: ${sale.payment}`},{text:' '}];items.slice(0,28).forEach(item=>{if(item.original_unit_price&&item.original_unit_price>item.unit_price)lines.push({text:`OFERTA ${item.promotion_discount_percent||''}% - ${item.name}: antes ${money(item.original_unit_price)}, pagaste ${money(item.unit_price)}`,bold:true});else lines.push({text:`${item.qty} x ${item.name.slice(0,42)} - ${money(item.line_total)}`})});lines.push({text:' '},{text:`TOTAL ${money(sale.total)}`,size:14,bold:true});if(totalSavings(sale)>0)lines.push({text:`AHORRASTE ${money(totalSavings(sale))}`,size:13,bold:true});if(fiscal)lines.push({text:`CAE: ${sale.cae||'—'}`},{text:`Vencimiento CAE: ${sale.caeExpiration||'—'}`});return buildSimplePdf(lines)}
export function receiptPdfBlob(sale:Sale,company:CompanyProfile){return new Blob([receiptPdfBytes(sale,company)],{type:'application/pdf'})}
export function downloadReceiptPdf(sale:Sale,company:CompanyProfile){if(typeof document==='undefined')return;const blob=receiptPdfBlob(sale,company),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=isFiscal(sale)?`factura-c-${receiptNumber(sale)}.pdf`:`venta-pendiente-${sale.id.slice(0,8)}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export async function emailReceipt(sale:Sale,company:CompanyProfile,email?:string|null){if(typeof window==='undefined')return 'unsupported';const fiscal=isFiscal(sale),filename=fiscal?`factura-c-${receiptNumber(sale)}.pdf`:`venta-pendiente-${sale.id.slice(0,8)}.pdf`,blob=receiptPdfBlob(sale,company),subject=fiscal?`Factura C ${receiptNumber(sale)} · ${company.name}`:`Comprobante interno pendiente · ${company.name}`,body=`Hola, te enviamos el comprobante por ${money(sale.total)} emitido por ${company.name}.`,file=new File([blob],filename,{type:'application/pdf'});if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({title:subject,text:body,files:[file]});return 'shared'}catch(e){if(e instanceof DOMException&&e.name==='AbortError')return 'cancelled'}}downloadReceiptPdf(sale,company);location.href=`mailto:${encodeURIComponent(email||'')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${body}\n\nEl PDF quedó descargado para adjuntarlo.`)}`;return 'mailto'}
