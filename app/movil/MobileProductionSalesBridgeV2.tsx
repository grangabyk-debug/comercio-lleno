'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { authorizeFiscalInvoice, loadCommerceSnapshot, openCashRegister, persistAuthorizedSale, persistUninvoicedSale } from '@/lib/comercio/api'
import { loadSalesSettings, readCachedSalesSettings, type CashMode } from '@/lib/comercio/sales-settings'
import { readTenantSession } from '@/lib/comercio/session'
import type { Sale, SaleItem } from '@/lib/comercio/types'

function text(node: Element | null) { return (node?.textContent || '').replace(/\s+/g, ' ').trim() }
function numberFrom(value: string) {
  const cleaned = value.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.')
  return Number(cleaned) || 0
}
function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-4${Math.random().toString(16).slice(2, 5)}-8${Math.random().toString(16).slice(2, 5)}-${Math.random().toString(16).slice(2, 14)}`
}
function effectiveCashMode(mode: CashMode): 'manual' | 'automatic' { return mode === 'manual' ? 'manual' : 'automatic' }

export default function MobileProductionSalesBridgeV2() {
  const [cashOpen, setCashOpen] = useState<boolean | null>(null)
  const [cashMode, setCashMode] = useState<'manual' | 'automatic'>('automatic')
  const [saleVisible, setSaleVisible] = useState(false)
  const [opening, setOpening] = useState(false)
  const [openingAmount, setOpeningAmount] = useState('0')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const cashRef = useRef<Awaited<ReturnType<typeof loadCommerceSnapshot>>['cashRegister']>(null)
  const snapshotRef = useRef<Awaited<ReturnType<typeof loadCommerceSnapshot>> | null>(null)

  async function refresh() {
    const session = readTenantSession()
    if (!session) return
    try {
      const [snapshot, settings] = await Promise.all([
        loadCommerceSnapshot(session),
        loadSalesSettings(session).catch(() => readCachedSalesSettings(session.companyId)),
      ])
      snapshotRef.current = snapshot
      cashRef.current = snapshot.cashRegister
      setCashOpen(snapshot.cashRegister?.status === 'open')
      setCashMode(effectiveCashMode(settings.cashMode))
      window.dispatchEvent(new CustomEvent('comercio:mobile-cash-status', { detail: { open: snapshot.cashRegister?.status === 'open' } }))
    } catch {}
  }

  useEffect(() => {
    void refresh()
    const onSettings = (event: Event) => {
      const mode = (event as CustomEvent<{ cashMode?: CashMode }>).detail?.cashMode
      if (mode) setCashMode(effectiveCashMode(mode))
    }
    const onOpen = () => setOpening(true)
    const onRefresh = () => void refresh()
    window.addEventListener('comercio:sales-settings', onSettings)
    window.addEventListener('comercio:mobile-open-cash', onOpen)
    window.addEventListener('comercio:mobile-cash-refresh', onRefresh)
    return () => {
      window.removeEventListener('comercio:sales-settings', onSettings)
      window.removeEventListener('comercio:mobile-open-cash', onOpen)
      window.removeEventListener('comercio:mobile-cash-refresh', onRefresh)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const sync = () => {
      if (cancelled) return
      const invoice = (document.querySelector('button[data-mobile-checkout-kind="invoice"]') || document.querySelector('button[class*="invoiceButton"]')) as HTMLButtonElement | null
      setSaleVisible(Boolean(invoice))

      document.querySelectorAll('[class*="previewTag"]').forEach(node => { (node as HTMLElement).style.display = 'none' })
      document.querySelectorAll('[class*="planStrip"] span').forEach(node => {
        if (/preview/i.test(text(node))) node.textContent = 'Plan Simple'
      })
      document.querySelectorAll('[class*="demoNote"]').forEach(node => {
        const current = text(node)
        if (/venta se simula/i.test(current) || /pdf si se genera/i.test(current)) node.textContent = 'Cobrar registra la venta sin emitir factura en ese momento.'
        if (/preview/i.test(current) && /cambios/i.test(current)) node.textContent = 'Los cambios de productos deben quedar guardados en el comercio.'
      })

      if (!invoice) return
      invoice.dataset.mobileCheckoutKind = 'invoice'
      if (invoice.textContent !== 'Cobrar y facturar') invoice.textContent = 'Cobrar y facturar'
      invoice.style.setProperty('display', 'inline-flex', 'important')
      invoice.style.setProperty('align-items', 'center', 'important')
      invoice.style.setProperty('justify-content', 'center', 'important')
      invoice.style.setProperty('width', 'calc(50% - 5px)', 'important')
      invoice.style.setProperty('min-height', '54px', 'important')
      invoice.style.setProperty('border-radius', '15px', 'important')
      invoice.style.setProperty('background', 'linear-gradient(135deg,#b594ef,#9e80d9)', 'important')
      invoice.style.setProperty('color', '#fff', 'important')
      invoice.style.setProperty('font-weight', '900', 'important')
      invoice.style.setProperty('vertical-align', 'top', 'important')

      let saleOnly = document.querySelector('button[data-mobile-checkout-kind="sale"]') as HTMLButtonElement | null
      if (!saleOnly) {
        saleOnly = document.createElement('button')
        saleOnly.type = 'button'
        saleOnly.dataset.mobileCheckoutKind = 'sale'
        saleOnly.textContent = 'Cobrar'
        invoice.insertAdjacentElement('afterend', saleOnly)
      }
      saleOnly.style.setProperty('display', 'inline-flex', 'important')
      saleOnly.style.setProperty('align-items', 'center', 'important')
      saleOnly.style.setProperty('justify-content', 'center', 'important')
      saleOnly.style.setProperty('width', 'calc(50% - 5px)', 'important')
      saleOnly.style.setProperty('min-height', '54px', 'important')
      saleOnly.style.setProperty('margin-left', '10px', 'important')
      saleOnly.style.setProperty('border', '0', 'important')
      saleOnly.style.setProperty('border-radius', '15px', 'important')
      saleOnly.style.setProperty('background', 'linear-gradient(135deg,#ffb19b,#f39b83)', 'important')
      saleOnly.style.setProperty('color', '#fff', 'important')
      saleOnly.style.setProperty('font', 'inherit', 'important')
      saleOnly.style.setProperty('font-weight', '900', 'important')
      saleOnly.style.setProperty('cursor', 'pointer', 'important')
      saleOnly.style.setProperty('vertical-align', 'top', 'important')

      const cartLines = document.querySelector('[class*="cartLines"]') as HTMLElement | null
      const totalNode = document.querySelector('[class*="totalRow"] b')
      const cartTitle = document.querySelector('[class*="cartTitle"]')
      const hasItems = Boolean(cartLines?.children.length) || numberFrom(text(totalNode)) > 0 || /\b\d+\s+ítem/i.test(text(cartTitle))
      const blocked = cashMode === 'manual' && cashOpen === false
      const disabled = busy || !hasItems || blocked
      invoice.disabled = disabled
      saleOnly.disabled = disabled
      invoice.style.opacity = disabled ? '.55' : '1'
      saleOnly.style.opacity = disabled ? '.55' : '1'
      const title = blocked ? 'Abrí la caja diaria antes de cobrar o facturar.' : ''
      invoice.title = title
      saleOnly.title = title
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => { cancelled = true; observer.disconnect() }
  }, [cashOpen, cashMode, busy])

  useEffect(() => {
    const handler = async (event: Event) => {
      const target = event.target as Element | null
      const button = target?.closest?.('button[data-mobile-checkout-kind]') as HTMLButtonElement | null
      if (!button) return
      event.preventDefault()
      event.stopPropagation()
      ;(event as Event & { stopImmediatePropagation?: () => void }).stopImmediatePropagation?.()
      if (busy) return

      const kind = button.dataset.mobileCheckoutKind === 'sale' ? 'internal' : 'fiscal'
      const session = readTenantSession()
      if (!session) { setMessage('Volvé a iniciar sesión para registrar la venta.'); return }

      setBusy(true)
      setMessage(kind === 'fiscal' ? 'Registrando y facturando…' : 'Registrando venta…')
      try {
        const [settings, initialSnapshot] = await Promise.all([
          loadSalesSettings(session).catch(() => readCachedSalesSettings(session.companyId)),
          loadCommerceSnapshot(session),
        ])
        const mode = effectiveCashMode(settings.cashMode)
        setCashMode(mode)
        let snapshot = initialSnapshot
        snapshotRef.current = snapshot
        cashRef.current = snapshot.cashRegister
        let isOpen = snapshot.cashRegister?.status === 'open'

        if (!isOpen && mode === 'manual') {
          setCashOpen(false)
          setOpening(true)
          setMessage('La caja diaria está cerrada. Abrila antes de continuar.')
          return
        }
        if (!isOpen && mode === 'automatic') {
          const opened = await openCashRegister(session, snapshot.cashRegister || null, 0)
          cashRef.current = opened
          setCashOpen(true)
          isOpen = true
          snapshot = { ...snapshot, cashRegister: opened }
          snapshotRef.current = snapshot
          window.dispatchEvent(new CustomEvent('comercio:mobile-cash-status', { detail: { open: true } }))
        }

        const rows = Array.from(document.querySelectorAll('[class*="cartLines"] > [class*="cartLine"]'))
        const items: SaleItem[] = rows.map((row, index) => {
          const name = text(row.querySelector('[class*="cartName"] b'))
          const qty = Math.max(1, Number(text(row.querySelector('[class*="qty"] b'))) || 1)
          const unitText = text(row.querySelector('[class*="cartName"] small'))
          const unitPrice = numberFrom(unitText)
          const candidates = snapshot.products.filter(p => p.name.trim().toLowerCase() === name.trim().toLowerCase())
          const matched = candidates.find(p => Math.abs(Number(p.price) - unitPrice) < 0.01) || candidates[0]
          return {
            product_id: matched?.id || `mobile-extra-${index}`,
            name: name || 'Producto',
            barcode: matched?.barcode || null,
            qty,
            unit_price: unitPrice,
            line_total: unitPrice * qty,
          }
        }).filter(item => item.name && item.qty > 0 && item.unit_price >= 0)

        if (!items.length) throw new Error('No encontramos los productos de la venta. Volvé a cargarlos e intentá otra vez.')
        const total = items.reduce((sum, item) => sum + item.line_total, 0)
        if (total <= 0) throw new Error('El total de la venta debe ser mayor a cero.')

        const selected = document.querySelector('button[class*="paymentActive"]')
        const payment = text(selected) || 'Efectivo'
        const now = new Date().toISOString()
        const sale: Sale = {
          id: uuid(),
          date: now,
          total,
          payment,
          items: items.reduce((sum, item) => sum + item.qty, 0),
          receipt_type: kind === 'fiscal' ? 'factura_c' : 'ticket',
          fiscal_status: 'pending',
          details: {
            items,
            subtotal_before_discount: total,
            discount_amount: 0,
            captured_at: now,
            source: 'mobile',
            fiscal_intent: kind === 'fiscal' ? 'invoice_now' : 'manual_pending',
          },
        }

        if (kind === 'internal') {
          await persistUninvoicedSale(session, sale, [], 'Cobro registrado sin emisión fiscal inmediata')
          setMessage(`Venta cobrada por $${Math.round(total).toLocaleString('es-AR')} · quedó pendiente de facturación.`)
          const clear = Array.from(document.querySelectorAll('button')).find(node => text(node) === 'Vaciar' && node.closest('[class*="cartCard"]')) as HTMLButtonElement | undefined
          clear?.click()
          window.setTimeout(() => window.location.reload(), 900)
        } else {
          try {
            const invoice = await authorizeFiscalInvoice(session, total, sale.id)
            sale.cae = invoice.cae
            sale.receiptNumber = invoice.receipt_number
            sale.caeExpiration = invoice.cae_expiration || null
            sale.fiscalEnvironment = 'produccion'
            sale.fiscal_status = 'authorized'
            await persistAuthorizedSale(session, sale, [])
            setMessage('')
          } catch (fiscalError) {
            const unavailable = Boolean((fiscalError as { arcaUnavailable?: boolean })?.arcaUnavailable)
            if (!unavailable) throw fiscalError
            const reason = fiscalError instanceof Error ? fiscalError.message : 'ARCA no disponible'
            sale.receipt_type = 'ticket'
            sale.fiscal_status = 'pending'
            sale.details = { ...(sale.details || {}), fiscal_pending_reason: reason, fiscal_pending_since: new Date().toISOString() }
            await persistUninvoicedSale(session, sale, [], reason)
            setMessage('')
          }

          const clear = Array.from(document.querySelectorAll('button')).find(node => text(node) === 'Vaciar' && node.closest('[class*="cartCard"]')) as HTMLButtonElement | undefined
          clear?.click()
          window.dispatchEvent(new CustomEvent('comercio:mobile-sale-completed', { detail: { sale, company: snapshot.company } }))
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'No se pudo registrar la venta.')
      } finally {
        setBusy(false)
      }
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [busy])

  async function doOpenCash() {
    const session = readTenantSession()
    if (!session) return
    setBusy(true)
    setMessage('Abriendo caja…')
    try {
      const amount = Math.max(0, Number(openingAmount.replace(',', '.')) || 0)
      const current = cashRef.current || snapshotRef.current?.cashRegister || null
      const opened = await openCashRegister(session, current, amount)
      cashRef.current = opened
      setCashOpen(true)
      setOpening(false)
      setMessage('Caja abierta. Ya podés cobrar y facturar.')
      window.dispatchEvent(new CustomEvent('comercio:mobile-cash-status', { detail: { open: true } }))
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo abrir la caja.')
    } finally { setBusy(false) }
  }

  const visibleMessage = useMemo(() => Boolean(message), [message])

  return <>
    {saleVisible && cashMode === 'manual' && cashOpen === false && <div style={{position:'fixed',zIndex:11990,left:14,right:14,bottom:86,padding:14,borderRadius:18,background:'#211925',color:'#fff',boxShadow:'0 16px 42px rgba(0,0,0,.28)',border:'1px solid rgba(255,255,255,.12)'}}>
      <b style={{display:'block',fontSize:14}}>Caja diaria cerrada</b>
      <span style={{display:'block',fontSize:11,opacity:.8,marginTop:4}}>No se puede cobrar ni facturar hasta abrirla.</span>
      <button type="button" onClick={()=>setOpening(true)} style={{marginTop:10,width:'100%',minHeight:44,border:0,borderRadius:12,background:'#ff641d',color:'#fff',fontWeight:900}}>Abrir nueva caja</button>
    </div>}

    {opening && <div style={{position:'fixed',inset:0,zIndex:12020,background:'rgba(8,6,10,.72)',display:'grid',placeItems:'center',padding:18}}>
      <div style={{width:'min(430px,96vw)',background:'#fff',color:'#211925',borderRadius:22,padding:20,boxShadow:'0 28px 90px rgba(0,0,0,.35)'}}>
        <span style={{fontSize:10,fontWeight:900,color:'#6d36d8',letterSpacing:'.12em'}}>CAJA DIARIA</span>
        <h2 style={{margin:'6px 0 5px',fontSize:25}}>Abrir nueva caja</h2>
        <p style={{margin:'0 0 14px',fontSize:12,color:'#746b79'}}>Ingresá el efectivo inicial. Si arrancás sin cambio, podés dejar $0.</p>
        <input autoFocus inputMode="decimal" value={openingAmount} onChange={e=>setOpeningAmount(e.target.value)} placeholder="$ 0" style={{width:'100%',boxSizing:'border-box',minHeight:48,border:'1px solid #ded6e3',borderRadius:12,padding:'10px 12px',fontSize:16}}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:12}}>
          <button type="button" onClick={()=>setOpening(false)} disabled={busy} style={{minHeight:44,border:'1px solid #ddd5e2',borderRadius:12,background:'#fff',fontWeight:850}}>Cancelar</button>
          <button type="button" onClick={()=>void doOpenCash()} disabled={busy} style={{minHeight:44,border:0,borderRadius:12,background:'#ff641d',color:'#fff',fontWeight:900}}>{busy?'Abriendo…':'Abrir caja'}</button>
        </div>
      </div>
    </div>}

    {visibleMessage && <div style={{position:'fixed',zIndex:12050,left:'50%',top:18,transform:'translateX(-50%)',maxWidth:'calc(100vw - 28px)',padding:'11px 15px',borderRadius:14,background:'#171218',color:'#fff',fontSize:12,fontWeight:850,boxShadow:'0 12px 34px rgba(0,0,0,.25)',textAlign:'center'}}>{message}</div>}
  </>
}
