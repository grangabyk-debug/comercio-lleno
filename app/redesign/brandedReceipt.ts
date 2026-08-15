import { buildReceiptHtml } from '@/lib/comercio/receipt'
import type { CompanyProfile, DeviceSettings, Sale } from '@/lib/comercio/types'

function addDeveloperBrand(html: string) {
  const brand = `<style>
.cl-developed-by{margin-top:5px;padding-top:5px;border-top:1px dashed #777;text-align:center;color:#000;page-break-inside:avoid}
.cl-developed-by span{display:block;font:400 8px/1.15 Arial,sans-serif;letter-spacing:.02em}
.cl-developed-by b{display:block;margin-top:1px;font:900 11px/.95 "Arial Black",Arial,sans-serif;letter-spacing:-.055em;color:#000;white-space:nowrap}
</style><div class="cl-developed-by"><span>Sistema desarrollado por</span><b>ComercioLleno.com</b></div>`
  return html.includes('</body></html>') ? html.replace('</body></html>', `${brand}</body></html>`) : `${html}${brand}`
}

export async function printBrandedReceipt(sale: Sale, company: CompanyProfile, settings: DeviceSettings) {
  const html = addDeveloperBrand(buildReceiptHtml(sale, company, settings.paper, settings))

  if (settings.printerMode === 'bridge' && typeof window !== 'undefined' && window.ComercioLlenoPrintBridge?.printHtml) {
    await window.ComercioLlenoPrintBridge.printHtml({
      html,
      printerName: settings.printerName,
      paper: settings.paper,
      copies: settings.receiptCopies,
    })
    return
  }

  if (typeof document === 'undefined') return
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0'
  document.body.appendChild(frame)
  const doc = frame.contentDocument
  if (!doc) {
    frame.remove()
    throw new Error('No se pudo preparar la impresión.')
  }
  doc.open()
  doc.write(html)
  doc.close()
  await new Promise(resolve => setTimeout(resolve, 160))
  frame.contentWindow?.focus()
  frame.contentWindow?.print()
  setTimeout(() => frame.remove(), 1100)
}
