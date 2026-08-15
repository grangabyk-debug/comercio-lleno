'use client'

import { MouseEvent, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CommerceSnapshot, TenantSession } from '@/lib/comercio/types'
import PurchasesDocuments from './PurchasesDocuments'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const BUCKET = 'purchase-documents'
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

type PurchaseRow = {
  id: string
  purchased_at: string
  total: number
  invoice_number?: string | null
  suppliers?: { name?: string | null } | null
}

type PurchaseDocumentRow = { storage_path: string }

function normalize(value: string | null | undefined) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function encodePath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/')
}

async function rest<T>(session: TenantSession, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  })
  const text = await response.text()
  let data: any = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!response.ok) throw new Error(data?.message || text || `HTTP ${response.status}`)
  return data as T
}

async function deleteObject(session: TenantSession, path: string) {
  try {
    await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodePath(path)}`, {
      method: 'DELETE',
      headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${session.token}` },
    })
  } catch {}
}

export default function PurchasesOwnerDelete({ data, session, refresh }: {
  data: CommerceSnapshot
  session: TenantSession
  refresh: () => Promise<void>
}) {
  const owner = session.role === 'owner'
  const [version, setVersion] = useState(0)
  const [purchaseId, setPurchaseId] = useState('')
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const rowFormatter = useMemo(() => ({
    signature(row: PurchaseRow) {
      return [
        normalize(new Date(row.purchased_at).toLocaleString('es-AR')),
        normalize(row.suppliers?.name || '—'),
        normalize(row.invoice_number || '—'),
        normalize(money.format(Number(row.total || 0))),
      ].join('|')
    }
  }), [])

  useEffect(() => {
    if (!owner) return
    const findDetailFooter = () => {
      let target: HTMLElement | null = null
      document.querySelectorAll('span').forEach(span => {
        if (target || normalize(span.textContent) !== 'DETALLE DE COMPRA') return
        const card = span.closest('div[class*="modalCard"]') as HTMLElement | null
        const footer = card?.querySelector('div[class*="modalActions"]') as HTMLElement | null
        if (footer) target = footer
      })
      setPortalTarget(target)
      if (!target) {
        setConfirming(false)
        setDeleteError('')
      }
    }
    findDetailFooter()
    const observer = new MutationObserver(findDetailFooter)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [owner, version])

  async function capturePurchaseFromRow(event: MouseEvent<HTMLDivElement>) {
    if (!owner) return
    const target = event.target as HTMLElement
    const row = target.closest('[role="button"]') as HTMLElement | null
    if (!row || !row.parentElement || row.children.length < 4) return

    const siblingRows = Array.from(row.parentElement.children).filter(el => el.getAttribute('role') === 'button')
    const index = siblingRows.indexOf(row)
    if (index < 0) return

    const cells = Array.from(row.children) as HTMLElement[]
    const clickedSignature = [
      normalize(cells[0]?.textContent),
      normalize(cells[1]?.textContent),
      normalize(cells[2]?.textContent),
      normalize(cells[3]?.textContent),
    ].join('|')

    try {
      const company = encodeURIComponent(session.companyId)
      const purchases = await rest<PurchaseRow[]>(session, `purchases?select=id,purchased_at,total,invoice_number,suppliers(name)&company_id=eq.${company}&order=purchased_at.desc&limit=500`)
      const indexed = purchases[index]
      const matched = indexed && rowFormatter.signature(indexed) === clickedSignature
        ? indexed
        : purchases.find(item => rowFormatter.signature(item) === clickedSignature)
      setPurchaseId(matched?.id || '')
      setConfirming(false)
      setDeleteError(matched ? '' : 'No se pudo identificar esta compra para eliminarla.')
    } catch (error) {
      setPurchaseId('')
      setDeleteError(error instanceof Error ? error.message : String(error))
    }
  }

  async function deletePurchase() {
    if (!owner || !purchaseId || deleting) return
    setDeleting(true)
    setDeleteError('')
    setMessage('')
    try {
      const company = encodeURIComponent(session.companyId)
      const id = encodeURIComponent(purchaseId)
      const docs = await rest<PurchaseDocumentRow[]>(session, `purchase_documents?select=storage_path&purchase_id=eq.${id}&company_id=eq.${company}`)

      await rest(session, `purchases?id=eq.${id}&company_id=eq.${company}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' },
      })

      await Promise.all((docs || []).map(doc => deleteObject(session, doc.storage_path)))

      setPurchaseId('')
      setConfirming(false)
      setPortalTarget(null)
      setVersion(value => value + 1)
      setMessage('Compra eliminada correctamente.')
      await refresh()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : String(error))
    } finally {
      setDeleting(false)
    }
  }

  return <div onClickCapture={capturePurchaseFromRow}>
    <style>{css}</style>
    {message && <div className="cl-purchase-delete-success">{message}</div>}
    <PurchasesDocuments key={version} data={data} session={session} refresh={refresh}/>
    {owner && portalTarget && createPortal(
      <div className="cl-owner-purchase-delete">
        {!confirming ? <button
          type="button"
          className="cl-owner-purchase-delete-button"
          disabled={!purchaseId || deleting}
          onClick={() => setConfirming(true)}
        >Eliminar compra</button> : <div className="cl-owner-purchase-confirm">
          <span>¿Desea eliminar la compra?</span>
          <button type="button" disabled={deleting} onClick={() => setConfirming(false)}>No</button>
          <button type="button" className="yes" disabled={deleting} onClick={() => void deletePurchase()}>{deleting ? 'Eliminando…' : 'Sí'}</button>
        </div>}
        {deleteError && <small>{deleteError}</small>}
      </div>,
      portalTarget,
    )}
  </div>
}

const css = `
.cl-owner-purchase-delete{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-right:auto}.cl-owner-purchase-delete-button{min-height:38px;border:1px solid #e2a49b;background:#fff4f2;color:#b7372b;border-radius:10px;padding:0 13px;font-size:10px;font-weight:900;cursor:pointer}.cl-owner-purchase-delete-button:hover{background:#ffe9e5;border-color:#d77d70}.cl-owner-purchase-delete-button:disabled{opacity:.45;cursor:not-allowed}.cl-owner-purchase-confirm{display:flex;align-items:center;gap:7px;flex-wrap:wrap;border:1px solid #e8b0a8;background:#fff7f5;border-radius:11px;padding:7px 9px}.cl-owner-purchase-confirm span{font-size:10px;font-weight:900;color:#66312b;margin-right:3px}.cl-owner-purchase-confirm button{min-height:30px;border:1px solid #ddd3d1;background:#fff;color:#433a3d;border-radius:8px;padding:0 10px;font-size:10px;font-weight:850;cursor:pointer}.cl-owner-purchase-confirm button.yes{background:#c93e31;border-color:#c93e31;color:#fff}.cl-owner-purchase-delete small{width:100%;font-size:9px;color:#c13e31;font-weight:800}.cl-purchase-delete-success{margin:0 0 10px;padding:10px 12px;border:1px solid #b9dfca;background:#f1faf5;color:#216a48;border-radius:11px;font-size:10px;font-weight:850}
body.comercio-dark .cl-owner-purchase-delete-button{background:#321d1b;color:#ffb3a8;border-color:#76443d}body.comercio-dark .cl-owner-purchase-confirm{background:#2b1d1b;border-color:#68423d}body.comercio-dark .cl-owner-purchase-confirm span{color:#ffd5cf}body.comercio-dark .cl-owner-purchase-confirm button{background:#211a25;color:#f4edf6;border-color:#4b3f50}body.comercio-dark .cl-owner-purchase-confirm button.yes{background:#c94b3d;border-color:#d85a4c;color:#fff}body.comercio-dark .cl-purchase-delete-success{background:#17271f;border-color:#315f47;color:#b9e8ce}
@media(max-width:700px){.cl-owner-purchase-delete{width:100%;order:2}.cl-owner-purchase-delete-button{width:100%}.cl-owner-purchase-confirm{width:100%}.cl-owner-purchase-confirm span{width:100%}}
`
