'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import core from './page.module.css'
import styles from './management.module.css'
import type { CommerceSnapshot, TenantSession } from '@/lib/comercio/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const BUCKET = 'purchase-documents'
const MAX_STORED_FILE = 15 * 1024 * 1024
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

 type Supplier = { id: string; name: string }
 type PurchaseDocument = { id: string; purchase_id: string; file_name: string; mime_type?: string | null; size_bytes: number; storage_path: string; created_at: string }
 type Purchase = { id: string; purchased_at: string; total: number; invoice_number?: string | null; supplier_id?: string | null; notes?: string | null; suppliers?: { name?: string | null } | null; documents: PurchaseDocument[] }

function encodePath(path: string) { return path.split('/').map(encodeURIComponent).join('/') }
function safeName(name: string) { return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'archivo' }
function fileSize(bytes: number) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`; return `${(bytes / 1024 / 1024).toFixed(1)} MB` }

async function rest<T>(session: TenantSession, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    cache: 'no-store',
  })
  const text = await response.text()
  let data: any = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!response.ok) throw new Error(data?.message || text || `HTTP ${response.status}`)
  return data as T
}

async function loadImage(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; cleanup: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
      return { source: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close() }
    } catch {}
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ source: img, width: img.naturalWidth, height: img.naturalHeight, cleanup: () => URL.revokeObjectURL(url) })
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('El navegador no pudo abrir esta imagen.')) }
    img.src = url
  })
}

async function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen.')), 'image/jpeg', quality))
}

async function optimizeFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    if (file.size > MAX_STORED_FILE) throw new Error(`${file.name}: el PDF supera 15 MB.`)
    return file
  }
  try {
    const image = await loadImage(file)
    try {
      let maxEdge = 1800
      let quality = 0.78
      let result: Blob | null = null
      for (let attempt = 0; attempt < 3; attempt++) {
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height))
        const width = Math.max(1, Math.round(image.width * scale))
        const height = Math.max(1, Math.round(image.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('No se pudo preparar la imagen.')
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(image.source, 0, 0, width, height)
        result = await canvasBlob(canvas, quality)
        if (result.size <= 900 * 1024) break
        maxEdge = Math.round(maxEdge * 0.84)
        quality = Math.max(0.62, quality - 0.08)
      }
      if (!result) return file
      if (result.size >= file.size && file.size <= 1200 * 1024) return file
      const base = safeName(file.name.replace(/\.[^.]+$/, ''))
      const optimized = new File([result], `${base}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
      if (optimized.size > MAX_STORED_FILE) throw new Error(`${file.name}: no se pudo reducir por debajo de 15 MB.`)
      return optimized
    } finally { image.cleanup() }
  } catch {
    if (file.size > MAX_STORED_FILE) throw new Error(`${file.name}: este formato no pudo comprimirse y supera 15 MB.`)
    return file
  }
}

async function uploadObject(session: TenantSession, path: string, file: File) {
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodePath(path)}`, {
    method: 'POST',
    headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${session.token}`, 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'false' },
    body: file,
  })
  if (!response.ok) throw new Error((await response.text()) || `No se pudo subir ${file.name}.`)
}

async function deleteObject(session: TenantSession, path: string) {
  try { await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodePath(path)}`, { method: 'DELETE', headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${session.token}` } }) } catch {}
}

async function fetchPrivateFile(session: TenantSession, doc: PurchaseDocument) {
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/${BUCKET}/${encodePath(doc.storage_path)}`, {
    headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${session.token}` },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`No se pudo abrir ${doc.file_name}.`)
  return response.blob()
}

export default function PurchasesDocuments({ data: _data, session, refresh }: { data: CommerceSnapshot; session: TenantSession; refresh: () => Promise<void> }) {
  const [rows, setRows] = useState<Purchase[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<Purchase | null>(null)
  const [supplier, setSupplier] = useState('')
  const [invoice, setInvoice] = useState('')
  const [total, setTotal] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fileBusy, setFileBusy] = useState('')

  async function load() {
    try {
      const company = encodeURIComponent(session.companyId)
      const [purchases, supplierRows, docs] = await Promise.all([
        rest<any[]>(session, `purchases?select=id,purchased_at,total,invoice_number,supplier_id,notes,suppliers(name)&company_id=eq.${company}&order=purchased_at.desc&limit=500`),
        rest<Supplier[]>(session, `suppliers?select=id,name&company_id=eq.${company}&active=eq.true&order=name.asc`),
        rest<PurchaseDocument[]>(session, `purchase_documents?select=id,purchase_id,file_name,mime_type,size_bytes,storage_path,created_at&company_id=eq.${company}&order=created_at.asc&limit=3000`),
      ])
      const byPurchase = new Map<string, PurchaseDocument[]>()
      for (const doc of docs || []) byPurchase.set(doc.purchase_id, [...(byPurchase.get(doc.purchase_id) || []), { ...doc, size_bytes: Number(doc.size_bytes || 0) }])
      setRows((purchases || []).map(x => ({ ...x, total: Number(x.total || 0), documents: byPurchase.get(x.id) || [] })))
      setSuppliers(supplierRows || [])
      setError('')
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }

  useEffect(() => { void load() }, [session.companyId])
  const selectedTotal = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files])

  function resetForm() { setSupplier(''); setInvoice(''); setTotal(0); setFiles([]); setError('') }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!supplier) { setError('Seleccioná un proveedor.'); return }
    if (total <= 0) { setError('Ingresá el valor total de la factura.'); return }
    setBusy(true); setError(''); setSuccess('')
    let purchaseId = ''
    const uploaded: string[] = []
    try {
      const created = await rest<Array<{ id: string }>>(session, 'purchases', {
        method: 'POST', headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ company_id: session.companyId, supplier_id: supplier, invoice_number: invoice.trim() || null, total: Number(total), status: 'received', purchased_at: new Date().toISOString() }),
      })
      purchaseId = created[0]?.id || ''
      if (!purchaseId) throw new Error('No se pudo guardar la compra.')

      for (const original of files) {
        setFileBusy(`Optimizando ${original.name}…`)
        const file = await optimizeFile(original)
        const unique = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
        const path = `${session.companyId}/${purchaseId}/${unique}-${safeName(file.name)}`
        setFileBusy(`Subiendo ${original.name}…`)
        await uploadObject(session, path, file)
        uploaded.push(path)
        await rest(session, 'purchase_documents', {
          method: 'POST', headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ company_id: session.companyId, purchase_id: purchaseId, storage_path: path, file_name: file.name, mime_type: file.type || null, size_bytes: file.size }),
        })
      }

      setOpen(false)
      resetForm()
      setSuccess('Compra guardada correctamente.')
      await Promise.all([load(), refresh()])
    } catch (e) {
      for (const path of uploaded) await deleteObject(session, path)
      if (purchaseId) {
        try { await rest(session, `purchases?id=eq.${encodeURIComponent(purchaseId)}&company_id=eq.${encodeURIComponent(session.companyId)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }) } catch {}
      }
      setError(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false); setFileBusy('') }
  }

  async function openDocument(doc: PurchaseDocument, download: boolean) {
    setFileBusy(`${download ? 'Descargando' : 'Abriendo'} ${doc.file_name}…`)
    try {
      const blob = await fetchPrivateFile(session, doc)
      const url = URL.createObjectURL(blob)
      if (download) {
        const a = document.createElement('a'); a.href = url; a.download = doc.file_name; document.body.appendChild(a); a.click(); a.remove()
      } else {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
    finally { setFileBusy('') }
  }

  return <>
    <div className={core.pageHead}><div><div className={core.eyebrow}>ABASTECIMIENTO</div><h1>Compras</h1><p>Guardá proveedor, comprobante, total y las fotos o PDF de cada factura y remito.</p></div><button className={core.primary} onClick={() => { resetForm(); setOpen(true) }}>+ Registrar compra</button></div>
    {error && <div className={core.error}>{error}</div>}
    {success && <div className={core.notice}>{success}</div>}
    <div className={core.table}>
      <div className={`${core.tableRow} ${core.tableHead}`} style={{gridTemplateColumns:'1fr 1.4fr 1fr .8fr .6fr'}}><span>Fecha y hora</span><span>Proveedor</span><span>Comprobante</span><span>Total</span><span>Archivos</span></div>
      {rows.map(x => <div className={core.tableRow} style={{gridTemplateColumns:'1fr 1.4fr 1fr .8fr .6fr',cursor:'pointer'}} key={x.id} role="button" tabIndex={0} onClick={() => setDetail(x)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setDetail(x) }}>
        <span>{new Date(x.purchased_at).toLocaleString('es-AR')}</span><span><b>{x.suppliers?.name || '—'}</b></span><span>{x.invoice_number || '—'}</span><span><b>{money.format(x.total)}</b></span><span>{x.documents.length ? `${x.documents.length} archivo${x.documents.length === 1 ? '' : 's'}` : 'Sin archivo'}</span>
      </div>)}
      {!rows.length && <div style={{padding:20,color:'#74817b',fontSize:11}}>Todavía no hay compras registradas.</div>}
    </div>

    {open && <div className={styles.modal} onMouseDown={e => e.currentTarget === e.target && !busy && setOpen(false)}><form className={styles.modalCard} onSubmit={submit}>
      <div className={styles.modalHead}><div><span>COMPRA</span><h2>Registrar compra</h2></div><button type="button" disabled={busy} onClick={() => setOpen(false)}>×</button></div>
      <div className={styles.formGrid}>
        <label>Proveedor<select required value={supplier} onChange={e => setSupplier(e.target.value)}><option value="">Seleccionar…</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label>Comprobante<input value={invoice} onChange={e => setInvoice(e.target.value)} placeholder="Ej. Factura A 0001-00001234"/></label>
        <label className={styles.wide}>Valor factura<input type="number" min="0.01" step="0.01" inputMode="decimal" value={total || ''} onChange={e => setTotal(Number(e.target.value) || 0)} placeholder="$ 0"/></label>
        <label className={styles.wide}>Adjuntar factura / remito<input type="file" multiple accept="image/*,application/pdf" onChange={e => setFiles(Array.from(e.target.files || []))}/></label>
      </div>
      <div style={{marginTop:10,padding:'10px 12px',border:'1px solid #dfe7e3',borderRadius:11,background:'#f7faf8',fontSize:10,lineHeight:1.5,color:'#65756d'}}>
        <b style={{color:'#168a55'}}>Optimización automática.</b> Las fotos del celular se reducen antes de subir para ahorrar almacenamiento manteniendo legibles los números y textos. PDF se conserva como PDF. Máximo guardado: 15 MB por archivo.
        {files.length > 0 && <div style={{marginTop:7}}>{files.length} archivo{files.length === 1 ? '' : 's'} seleccionado{files.length === 1 ? '' : 's'} · originales {fileSize(selectedTotal)}</div>}
      </div>
      {files.length > 0 && <div style={{display:'grid',gap:6,marginTop:10}}>{files.map((f,i)=><div key={`${f.name}-${i}`} style={{display:'flex',justifyContent:'space-between',gap:10,fontSize:10,borderBottom:'1px solid #edf1ef',padding:'6px 2px'}}><span>{f.name}</span><span style={{color:'#7a8881'}}>{fileSize(f.size)}</span></div>)}</div>}
      {fileBusy && <div style={{marginTop:10,fontSize:10,color:'#168a55',fontWeight:800}}>{fileBusy}</div>}
      {error && <div className={styles.formError}>{error}</div>}
      <div className={styles.modalActions}><button type="button" disabled={busy} onClick={() => setOpen(false)}>Cancelar</button><button className={styles.save} disabled={busy}>{busy ? 'Guardando…' : 'Confirmar ingreso'}</button></div>
    </form></div>}

    {detail && <div className={styles.modal} onMouseDown={e => e.currentTarget === e.target && setDetail(null)}><div className={styles.modalCard}>
      <div className={styles.modalHead}><div><span>DETALLE DE COMPRA</span><h2>{detail.suppliers?.name || 'Compra'}</h2></div><button type="button" onClick={() => setDetail(null)}>×</button></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,marginBottom:16}}>
        <div style={{border:'1px solid #e1e8e4',borderRadius:11,padding:11}}><small style={{color:'#7a8881'}}>FECHA Y HORA</small><b style={{display:'block',marginTop:4,fontSize:12}}>{new Date(detail.purchased_at).toLocaleString('es-AR')}</b></div>
        <div style={{border:'1px solid #e1e8e4',borderRadius:11,padding:11}}><small style={{color:'#7a8881'}}>VALOR FACTURA</small><b style={{display:'block',marginTop:4,fontSize:15,color:'#168a55'}}>{money.format(detail.total)}</b></div>
        <div style={{border:'1px solid #e1e8e4',borderRadius:11,padding:11}}><small style={{color:'#7a8881'}}>PROVEEDOR</small><b style={{display:'block',marginTop:4,fontSize:12}}>{detail.suppliers?.name || '—'}</b></div>
        <div style={{border:'1px solid #e1e8e4',borderRadius:11,padding:11}}><small style={{color:'#7a8881'}}>COMPROBANTE</small><b style={{display:'block',marginTop:4,fontSize:12}}>{detail.invoice_number || '—'}</b></div>
      </div>
      <div style={{fontSize:10,fontWeight:900,letterSpacing:'.05em',color:'#68776f',marginBottom:8}}>ARCHIVOS GUARDADOS</div>
      <div style={{display:'grid',gap:8}}>{detail.documents.map(doc => <div key={doc.id} style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto auto',alignItems:'center',gap:8,border:'1px solid #e1e8e4',borderRadius:11,padding:10}}><div><b style={{fontSize:10}}>{doc.file_name}</b><small style={{display:'block',color:'#7a8881',marginTop:2}}>{fileSize(doc.size_bytes)}</small></div><button className={styles.miniButton} disabled={!!fileBusy} onClick={() => openDocument(doc,false)}>Ver</button><button className={styles.miniButton} disabled={!!fileBusy} onClick={() => openDocument(doc,true)}>Descargar</button></div>)}</div>
      {!detail.documents.length && <div style={{padding:14,border:'1px dashed #d5dfda',borderRadius:11,color:'#7a8881',fontSize:10}}>Esta compra anterior no tiene archivos adjuntos.</div>}
      {fileBusy && <div style={{marginTop:10,fontSize:10,color:'#168a55',fontWeight:800}}>{fileBusy}</div>}
      <div className={styles.modalActions}><button onClick={() => setDetail(null)}>Cerrar</button></div>
    </div></div>}
  </>
}
