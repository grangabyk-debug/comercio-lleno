'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import core from './page.module.css'
import styles from './management.module.css'
import { createProduct, loadSuppliers, updateProduct, type Supplier } from '@/lib/comercio/api'
import type { CommerceSnapshot, Product, TenantSession } from '@/lib/comercio/types'

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
type SortKey = 'name' | 'cost' | 'price' | 'wholesale_price' | 'stock'
type SortDir = 'asc' | 'desc'
type NumberKey = 'cost' | 'price' | 'wholesale_price' | 'stock' | 'min_stock' | 'target_stock'

function n(v: unknown) { return Number(v || 0) }
function Head({ children }: { children?: React.ReactNode }) {
  return <div className={core.pageHead}><div><div className={core.eyebrow}>CATÁLOGO</div><h1>Productos y stock</h1><p>Alta, edición, costos, precios, stock, importación, exportación y etiquetas.</p></div>{children}</div>
}
function sortGlyph(active: boolean, dir: SortDir) { return active ? (dir === 'asc' ? ' ↑' : ' ↓') : ' ↕' }

async function fileResponse(response: Response, fallback: string) {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data?.error || `No se pudo generar ${fallback}.`)
  }
  const blob = await response.blob()
  const cd = response.headers.get('content-disposition') || ''
  const match = cd.match(/filename="?([^";]+)"?/i)
  const filename = match?.[1] || fallback
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export default function ProductsInventory({ data, session, refresh, message }: { data: CommerceSnapshot; session: TenantSession; refresh: () => Promise<void>; message: (m: string) => void }) {
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<Record<string, number>>({})
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [importOpen, setImportOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [busySheet, setBusySheet] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const rows = useMemo(() => {
    const filtered = data.products.filter(p => `${p.name} ${p.barcode || ''} ${p.category || ''}`.toLowerCase().includes(q.toLowerCase()))
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      else cmp = n(a[sortKey]) - n(b[sortKey])
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted.slice(0, 5000)
  }, [data.products, q, sortKey, sortDir])

  const selectedRows = data.products.filter(p => (selected[p.id] || 0) > 0).map(p => ({ product: p, qty: selected[p.id] }))
  const selectedIds = selectedRows.map(x => x.product.id)

  function toggle(id: string, checked: boolean) { setSelected(s => ({ ...s, [id]: checked ? (s[id] || 1) : 0 })) }
  function sortBy(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }
  function SortHeader({ field, children }: { field: SortKey; children: React.ReactNode }) {
    return <button type="button" onClick={() => sortBy(field)} style={{border:0,background:'transparent',font:'inherit',fontWeight:800,padding:0,cursor:'pointer',color:'inherit',textAlign:'left'}}>{children}{sortGlyph(sortKey === field, sortDir)}</button>
  }

  async function downloadModel() {
    setBusySheet(true)
    try {
      const response = await fetch('/api/redesign/products-sheet', { headers: { Authorization: `Bearer ${session.token}` } })
      await fileResponse(response, 'modelo-productos-comercio-lleno.xlsx')
    } catch (e) { message(e instanceof Error ? e.message : String(e)) }
    finally { setBusySheet(false) }
  }

  async function exportProducts(ids?: string[]) {
    setBusySheet(true)
    try {
      const response = await fetch('/api/redesign/products-sheet', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export', ids: ids || [] }),
      })
      await fileResponse(response, ids?.length ? 'productos-seleccionados.xlsx' : 'productos-comercio-lleno.xlsx')
      setExportOpen(false)
    } catch (e) { message(e instanceof Error ? e.message : String(e)) }
    finally { setBusySheet(false) }
  }

  async function importProducts() {
    if (!importFile) { message('Seleccioná un archivo Excel para importar.'); return }
    setBusySheet(true)
    try {
      const form = new FormData()
      form.append('action', 'import')
      form.append('file', importFile)
      const response = await fetch('/api/redesign/products-sheet', { method: 'POST', headers: { Authorization: `Bearer ${session.token}` }, body: form })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result?.ok) throw new Error(result?.error || 'No se pudo importar el archivo.')
      await refresh()
      setImportOpen(false); setImportFile(null)
      if (fileRef.current) fileRef.current.value = ''
      message(`${result.processed} producto${result.processed === 1 ? '' : 's'} procesado${result.processed === 1 ? '' : 's'} correctamente.`)
    } catch (e) { message(e instanceof Error ? e.message : String(e)) }
    finally { setBusySheet(false) }
  }

  return <>
    <Head>
      <div className={styles.actions} style={{flexWrap:'wrap'}}>
        <button className={core.secondary} onClick={() => setImportOpen(true)}>↑ Importar</button>
        <button className={core.secondary} onClick={() => setExportOpen(true)}>↓ Exportar</button>
        <button className={core.secondary} disabled={!selectedRows.length} onClick={() => printLabels(selectedRows)}>▦ Imprimir etiquetas</button>
        <button className={core.primary} onClick={() => setCreating(true)}>+ Agregar producto</button>
      </div>
    </Head>

    <div className={core.tableTools}><div className={core.searchSlim}><span>⌕</span><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar producto, código o categoría…"/></div></div>
    <div className={`${core.table} ${styles.productTable}`}>
      <div className={`${core.tableRow} ${core.tableHead} ${styles.productRow}`}>
        <span></span><span><SortHeader field="name">Producto</SortHeader></span><span>Código</span><span>Categoría</span>
        <span><SortHeader field="cost">Costo</SortHeader></span><span><SortHeader field="price">Minorista</SortHeader></span><span><SortHeader field="wholesale_price">Mayorista</SortHeader></span><span>Margen</span><span><SortHeader field="stock">Stock</SortHeader></span><span>Mín.</span><span>Objetivo</span><span></span>
      </div>
      {rows.map(p => { const margin = p.price ? ((p.price - n(p.cost)) / p.price) * 100 : 0; return <div className={`${core.tableRow} ${styles.productRow}`} key={p.id}>
        <span><input type="checkbox" checked={(selected[p.id] || 0) > 0} onChange={e => toggle(p.id, e.target.checked)}/></span>
        <span><b>{p.name}</b><small>{p.unit || 'unidad'}</small></span><span>{p.barcode || '—'}</span><span>{p.category || 'General'}</span><span>{money.format(n(p.cost))}</span><span><b>{money.format(p.price)}</b></span><span>{money.format(n(p.wholesale_price))}</span><span className={margin >= 25 ? styles.good : styles.warn}>{margin.toFixed(1)}%</span><span>{p.stock}</span><span>{n(p.min_stock)}</span><span>{n(p.target_stock)}</span><span><button className={styles.miniButton} onClick={() => setEdit(p)}>Editar</button></span>
      </div> })}
    </div>

    {selectedRows.length > 0 && <div className={styles.labelBar}><b>Etiquetas / selección</b><span>{selectedRows.length} productos seleccionados</span><div className={styles.labelQtys}>{selectedRows.map(x => <label key={x.product.id}>{x.product.name}<input type="number" min="1" max="99" value={x.qty} onChange={e => setSelected(s => ({ ...s, [x.product.id]: Math.max(1, Math.min(99, Number(e.target.value) || 1)) }))}/></label>)}</div><button onClick={() => printLabels(selectedRows)}>Imprimir seleccionadas</button></div>}

    {(edit || creating) && <ProductModal product={edit} session={session} close={() => { setEdit(null); setCreating(false) }} saved={async () => { setEdit(null); setCreating(false); await refresh(); message('Producto guardado.') }}/>} 

    {importOpen && <div className={styles.modal} onMouseDown={e => e.currentTarget === e.target && setImportOpen(false)}><div className={styles.modalCard}>
      <div className={styles.modalHead}><div><span>IMPORTACIÓN</span><h2>Importar productos y stock</h2></div><button type="button" onClick={() => setImportOpen(false)}>×</button></div>
      <p>Descargá primero el formato modelo. Incluye las columnas del sistema y listas de categorías, unidades y proveedores.</p>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',margin:'14px 0'}}><button className={core.secondary} disabled={busySheet} onClick={downloadModel}>↓ Descargar formato modelo</button></div>
      <label style={{display:'grid',gap:8,fontWeight:700}}>Archivo Excel (.xlsx)<input ref={fileRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={e => setImportFile(e.target.files?.[0] || null)} /></label>
      {importFile && <small style={{display:'block',marginTop:8}}>{importFile.name} · {(importFile.size/1024).toFixed(0)} KB</small>}
      <div className={styles.modalActions}><button type="button" onClick={() => setImportOpen(false)}>Cancelar</button><button className={styles.save} disabled={busySheet || !importFile} onClick={importProducts}>{busySheet ? 'Procesando…' : 'Importar al stock'}</button></div>
    </div></div>}

    {exportOpen && <div className={styles.modal} onMouseDown={e => e.currentTarget === e.target && setExportOpen(false)}><div className={styles.modalCard}>
      <div className={styles.modalHead}><div><span>EXPORTACIÓN</span><h2>Exportar productos</h2></div><button type="button" onClick={() => setExportOpen(false)}>×</button></div>
      <p>Podés descargar todo el catálogo o solamente los productos que marcaste en la tabla.</p>
      <div className={styles.modalActions} style={{justifyContent:'flex-end',flexWrap:'wrap'}}>
        <button type="button" disabled={busySheet} onClick={() => exportProducts()}>Exportar todos</button>
        <button className={styles.save} disabled={busySheet || !selectedIds.length} onClick={() => exportProducts(selectedIds)}>Exportar seleccionados ({selectedIds.length})</button>
      </div>
    </div></div>}
  </>
}

function ProductModal({ product, session, close, saved }: { product: Product | null; session: TenantSession; close: () => void; saved: () => Promise<void> }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [name, setName] = useState(product?.name || '')
  const [barcode, setBarcode] = useState(product?.barcode || '')
  const [category, setCategory] = useState(product?.category || 'General')
  const [unit, setUnit] = useState(product?.unit || 'unidad')
  const [supplierId, setSupplierId] = useState(product?.supplier_id || '')
  const [numbers, setNumbers] = useState<Record<NumberKey, string>>({
    cost: product?.cost == null ? '' : String(product.cost),
    price: product ? String(product.price ?? '') : '',
    wholesale_price: product?.wholesale_price == null ? '' : String(product.wholesale_price),
    stock: product ? String(product.stock ?? '') : '',
    min_stock: product?.min_stock == null ? '' : String(product.min_stock),
    target_stock: product?.target_stock == null ? '' : String(product.target_stock),
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { loadSuppliers(session).then(setSuppliers).catch(() => {}) }, [session])
  function num(key: NumberKey) { const value = Number(String(numbers[key] || '').replace(',','.')); return Number.isFinite(value) ? Math.max(0,value) : 0 }
  async function submit(e: FormEvent) {
    e.preventDefault(); if (!name.trim()) return
    setBusy(true); setError('')
    const draft: Product = { id: product?.id || '', name:name.trim(), barcode, category:category || 'General', unit, supplier_id:supplierId || null, cost:num('cost'), price:num('price'), wholesale_price:num('wholesale_price'), stock:num('stock'), min_stock:num('min_stock'), target_stock:num('target_stock'), active:true }
    try { if (product) await updateProduct(session, draft); else await createProduct(session, draft); await saved() }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); setBusy(false) }
  }
  const input = (key: NumberKey, label: string) => <label>{label}<input type="number" min="0" step="0.01" value={numbers[key]} placeholder="" onChange={e => setNumbers(v => ({...v,[key]:e.target.value}))}/></label>
  return <div className={styles.modal} onMouseDown={e => e.currentTarget === e.target && close()}><form className={styles.modalCard} onSubmit={submit}><div className={styles.modalHead}><div><span>PRODUCTO</span><h2>{product ? 'Editar producto' : 'Agregar producto'}</h2></div><button type="button" onClick={close}>×</button></div><div className={styles.formGrid}>
    <label>Producto<input value={name} onChange={e => setName(e.target.value)}/></label><label>Código de barras<input value={barcode} onChange={e => setBarcode(e.target.value)}/></label>
    <label>Categoría<input value={category} onChange={e => setCategory(e.target.value)}/></label><label>Unidad<select value={unit} onChange={e => setUnit(e.target.value)}><option>unidad</option><option>kg</option><option>litro</option><option>pack</option><option>caja</option></select></label>
    {input('cost','Costo')}{input('price','Precio minorista')}{input('wholesale_price','Precio mayorista')}{input('stock','Stock')}{input('min_stock','Stock mínimo')}{input('target_stock','Stock objetivo')}
    <label className={styles.wide}>Proveedor<select value={supplierId} onChange={e => setSupplierId(e.target.value)}><option value="">Sin proveedor</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
  </div>{error && <div className={styles.formError}>{error}</div>}<div className={styles.modalActions}><button type="button" onClick={close}>Cancelar</button><button className={styles.save} disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}</button></div></form></div>
}

function checksumEAN13(value: string) { const d = value.slice(0,12).split('').map(Number); let sum=0; for(let i=0;i<12;i++) sum += d[i]*(i%2?3:1); return String((10-sum%10)%10) }
function eanBits(value: string) { let s=value.replace(/\D/g,''); if(s.length===12)s+=checksumEAN13(s); if(s.length!==13)return null; const L=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'],G=['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'],R=['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'],P=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL']; let bits='101',parity=P[Number(s[0])]; for(let i=1;i<=6;i++)bits+=parity[i-1]==='L'?L[Number(s[i])]:G[Number(s[i])]; bits+='01010'; for(let i=7;i<=12;i++)bits+=R[Number(s[i])]; bits+='101'; return { s,bits } }
function esc(s: string) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c)) }
function printLabels(items: Array<{ product: Product; qty: number }>) { const labels:string[]=[]; const date=new Date().toLocaleDateString('es-AR'); items.forEach(({product:p,qty})=>{ for(let q=0;q<Math.max(1,Math.min(99,qty));q++){ const code=eanBits(String(p.barcode||'')); const svg=code?`<svg viewBox="0 0 ${code.bits.length} 52" preserveAspectRatio="none"><g>${code.bits.split('').map((b,i)=>b==='1'?`<rect x="${i}" y="0" width="1" height="42"/>`:'').join('')}</g><text x="0" y="51" font-size="7">${code.s}</text></svg>`:''; labels.push(`<article class="label"><div class="name">${esc(p.name)}</div><div class="price">${money.format(p.price)}</div>${svg?`<div class="barcode">${svg}</div>`:'<div class="nocode">SIN CÓDIGO</div>'}<div class="date">${date}</div></article>`) } }); const sheets:string[]=[]; for(let i=0;i<labels.length;i+=21)sheets.push(`<main class="sheet">${labels.slice(i,i+21).join('')}</main>`); const w=window.open('','_blank','width=1000,height=800'); if(!w){alert('Permití ventanas emergentes para imprimir etiquetas.');return} w.document.write(`<!doctype html><html><head><title>Etiquetas</title><style>@page{size:A4 portrait;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Arial}.sheet{width:210mm;height:297mm;display:grid;grid-template-columns:repeat(3,70mm);grid-template-rows:repeat(7,42.42mm);break-after:page}.label{width:70mm;height:42.42mm;border:1px dashed #aaa;padding:3mm 4mm;display:flex;flex-direction:column;align-items:center;overflow:hidden}.name{font-size:10px;font-weight:700;text-transform:uppercase;text-align:center;height:9mm}.price{font-size:22px;font-weight:800}.barcode{width:50mm;height:14mm}.barcode svg{width:50mm;height:14mm}.nocode{height:14mm;display:grid;place-items:center;font-size:10px}.date{font-size:7px;align-self:flex-start}</style></head><body>${sheets.join('')}<script>onload=()=>setTimeout(()=>print(),250)<\/script></body></html>`); w.document.close() }
